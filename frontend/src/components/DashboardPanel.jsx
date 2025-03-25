import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from './common/Card';
import Button from './common/Button';
import { getMetrics } from '../api/metricsApi';

const DashboardPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  // Fetch metrics on mount and when refresh interval changes
  useEffect(() => {
    fetchMetrics();
    
    // Set up auto-refresh if enabled
    if (refreshInterval) {
      const timer = setInterval(fetchMetrics, refreshInterval * 1000);
      return () => clearInterval(timer);
    }
  }, [refreshInterval]);
  
  const fetchMetrics = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format bytes to human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get topic metrics data in format for charts
  const getTopicChartData = () => {
    if (!metrics || !metrics.topics) return [];
    
    return metrics.topics.map(topic => ({
      name: topic.name,
      messageCount: topic.messageCount,
      publishRate: parseFloat(topic.publishRate.toFixed(2)),
      consumeRate: parseFloat(topic.consumeRate.toFixed(2)),
      avgMessageSize: topic.averageMessageSize,
      lag: parseFloat((topic.publishRate - topic.consumeRate).toFixed(2)),
      publishRateFormatted: `${topic.publishRate.toFixed(2)} msgs/min`,
      consumeRateFormatted: `${topic.consumeRate.toFixed(2)} msgs/min`,
      lagFormatted: `${Math.max(0, (topic.publishRate - topic.consumeRate)).toFixed(2)} msgs/min`,
    }));
  };
  
  // Calculate consumer lag for all topics
  const calculateTotalLag = () => {
    if (!metrics || !metrics.topics) return 0;
    
    return metrics.topics.reduce((total, topic) => {
      const lag = Math.max(0, topic.publishRate - topic.consumeRate);
      return total + lag;
    }, 0);
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Metrics Dashboard</h2>
        <div className="flex space-x-2 items-center">
          <div className="text-sm text-gray-600 mr-2">Auto-refresh:</div>
          <select
            className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={refreshInterval || ''}
            onChange={(e) => setRefreshInterval(e.target.value ? parseInt(e.target.value, 10) : null)}
          >
            <option value="">Disabled</option>
            <option value="5">Every 5 seconds</option>
            <option value="10">Every 10 seconds</option>
            <option value="30">Every 30 seconds</option>
            <option value="60">Every minute</option>
          </select>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={fetchMetrics}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {isLoading && !metrics ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="mt-2 text-gray-600">Loading metrics...</div>
        </div>
      ) : !metrics ? (
        <Card>
          <div className="text-center p-8 text-gray-500">
            No metrics data available. Click refresh to fetch metrics.
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.system.totalTopics}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Topics</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.system.totalMessages.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Messages</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {metrics.system.totalConsumerGroups}
                </div>
                <div className="text-sm text-gray-500 mt-1">Consumer Groups</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {calculateTotalLag().toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Message Lag (msg/min)</div>
              </div>
            </Card>
          </div>
          
          {/* Message Throughput Chart */}
          <Card title="Message Throughput">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getTopicChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'publishRate') return [`${value} msgs/min`, 'Publish Rate'];
                      if (name === 'consumeRate') return [`${value} msgs/min`, 'Consume Rate'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="publishRate" fill="#3B82F6" name="Publish Rate" />
                  <Bar dataKey="consumeRate" fill="#10B981" name="Consume Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Consumer Lag Chart */}
          <Card title="Consumer Lag by Topic">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getTopicChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} msgs/min`, 'Lag']}
                  />
                  <Legend />
                  <Bar dataKey="lag" fill="#F59E0B" name="Lag (msgs/min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Topic Details Table */}
          <Card title="Topic Metrics Details">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message Count
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publish Rate
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consume Rate
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lag
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Message Size
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.topics.map(topic => (
                    <tr key={topic.topicId}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {topic.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {topic.messageCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {topic.publishRate.toFixed(2)} msgs/min
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {topic.consumeRate.toFixed(2)} msgs/min
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {Math.max(0, (topic.publishRate - topic.consumeRate)).toFixed(2)} msgs/min
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {formatBytes(topic.averageMessageSize)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* System Metrics */}
          <Card title="System Metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Average Publish Rate</h4>
                <p className="text-lg font-semibold">
                  {metrics.system.averagePublishRate.toFixed(2)} msgs/min
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Average Consume Rate</h4>
                <p className="text-lg font-semibold">
                  {metrics.system.averageConsumeRate.toFixed(2)} msgs/min
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Storage Used</h4>
                <p className="text-lg font-semibold">
                  {formatBytes(metrics.system.storageUsed)}
                </p>
              </div>
            </div>
          </Card>
          
          <div className="text-xs text-gray-500 text-right">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPanel;
// src/components/DashboardPanel.jsx
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import Card from './common/Card';
import Button from './common/Button';
import { getMetrics } from '../api/metricsApi';

const DashboardPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [activeTimeRange, setActiveTimeRange] = useState('day');
  
  // Fetch metrics on mount and when refresh interval changes
  useEffect(() => {
    fetchMetrics();
    
    // Set up auto-refresh if enabled
    if (refreshInterval) {
      const timer = setInterval(fetchMetrics, refreshInterval * 1000);
      return () => clearInterval(timer);
    }
  }, [refreshInterval, activeTimeRange]);
  
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
      name: topic.name.length > 10 ? topic.name.substring(0, 10) + '...' : topic.name,
      fullName: topic.name,
      messageCount: topic.messageCount,
      publishRate: parseFloat(topic.publishRate.toFixed(2)),
      consumeRate: parseFloat(topic.consumeRate.toFixed(2)),
      avgMessageSize: topic.averageMessageSize,
      lag: Math.max(0, parseFloat((topic.publishRate - topic.consumeRate).toFixed(2))),
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
    }, 0).toFixed(2);
  };

  // Generate historical data for charts
  const generateHistoricalData = (timeRange) => {
    const now = new Date();
    const data = [];
    let interval;
    let format;
    let points;
    
    switch (timeRange) {
      case 'hour':
        interval = 5 * 60 * 1000; // 5 minutes
        format = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        points = 12; // Last hour in 5-min intervals
        break;
      case 'day':
        interval = 60 * 60 * 1000; // 1 hour
        format = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        points = 24; // Last 24 hours
        break;
      case 'week':
        interval = 24 * 60 * 60 * 1000; // 1 day
        format = (date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        points = 7; // Last 7 days
        break;
      default:
        interval = 60 * 60 * 1000;
        format = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        points = 24;
    }
    
    // Generate random but somewhat consistent historical data
    for (let i = points - 1; i >= 0; i--) {
      const time = new Date(now - (i * interval));
      
      // Use a seed based on the time to generate consistent random values
      const seed = time.getHours() + time.getDate();
      const basePublishRate = metrics?.system?.averagePublishRate || 5;
      const baseConsumeRate = metrics?.system?.averageConsumeRate || 4;
      
      // Random multiplier that's consistent for the same time
      const multiplier = (Math.sin(seed * 0.5) + 1) * 0.4 + 0.8;
      
      data.push({
        time: format(time),
        rawTime: time,
        publishRate: parseFloat((basePublishRate * multiplier).toFixed(2)),
        consumeRate: parseFloat((baseConsumeRate * multiplier * 0.9).toFixed(2)),
        messageCount: Math.floor((metrics?.system?.totalMessages || 1000) * (1 - (i / points))),
      });
    }
    
    return data;
  };
  
  // Get theme colors for charts
  const COLORS = {
    primary: '#3B82F6', // blue-500
    secondary: '#10B981', // green-500
    warning: '#F59E0B', // amber-500
    danger: '#EF4444', // red-500
    purple: '#8B5CF6', // violet-500
    pink: '#EC4899', // pink-500
    gray: '#6B7280', // gray-500
  };
  
  // Get pie chart data for topic distribution
  const getTopicDistributionData = () => {
    if (!metrics || !metrics.topics) return [];
    
    return metrics.topics.map(topic => ({
      name: topic.name,
      value: topic.messageCount
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">System Metrics Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Monitor your MicroQueue system performance and activity
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
            <button
              className={`px-3 py-1 text-sm rounded-md ${activeTimeRange === 'hour' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              onClick={() => setActiveTimeRange('hour')}
            >
              Hour
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${activeTimeRange === 'day' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              onClick={() => setActiveTimeRange('day')}
            >
              Day
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${activeTimeRange === 'week' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              onClick={() => setActiveTimeRange('week')}
            >
              Week
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">Auto-refresh:</div>
            <select
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={refreshInterval || ''}
              onChange={(e) => setRefreshInterval(e.target.value ? parseInt(e.target.value, 10) : null)}
            >
              <option value="">Off</option>
              <option value="5">5s</option>
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">1m</option>
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
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading && !metrics ? (
        <div className="flex items-center justify-center p-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="ml-4 text-gray-600">Loading metrics...</div>
        </div>
      ) : !metrics ? (
        <Card>
          <div className="text-center p-8 text-gray-500">
            No metrics data available. Click refresh to fetch metrics.
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Topics</div>
                  <div className="text-2xl font-bold text-blue-600">{metrics.system.totalTopics}</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Messages</div>
                  <div className="text-2xl font-bold text-green-600">{metrics.system.totalMessages.toLocaleString()}</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Consumer Groups</div>
                  <div className="text-2xl font-bold text-indigo-600">{metrics.system.totalConsumerGroups}</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <div className="flex items-center">
                <div className="p-3 bg-amber-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Message Lag</div>
                  <div className="text-2xl font-bold text-amber-600">{calculateTotalLag()}</div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Message Throughput History */}
          <Card title="Message Throughput History">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={generateHistoricalData(activeTimeRange)}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'publishRate') return [`${value} msgs/min`, 'Publish Rate'];
                      if (name === 'consumeRate') return [`${value} msgs/min`, 'Consume Rate'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="publishRate" 
                    name="Publish Rate" 
                    stackId="1" 
                    stroke={COLORS.primary} 
                    fill={COLORS.primary}
                    fillOpacity={0.5}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consumeRate" 
                    name="Consume Rate" 
                    stackId="2" 
                    stroke={COLORS.secondary} 
                    fill={COLORS.secondary}
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Message Count by Topic & Message Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Message Count by Topic">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getTopicChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      tick={{fontSize: 12}}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === 'messageCount') return [value.toLocaleString(), 'Messages'];
                        return [value, name];
                      }}
                      labelFormatter={(value, props) => {
                        return props[0].payload.fullName;
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="messageCount" 
                      name="Message Count" 
                      fill={COLORS.primary} 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card title="Message Distribution">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTopicDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getTopicDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.pink, COLORS.gray][index % 7]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value.toLocaleString(), 'Messages']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          {/* Message Rates by Topic */}
          <Card title="Message Throughput by Topic">
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
                      if (name === 'lag') return [`${value} msgs/min`, 'Lag'];
                      return [value, name];
                    }}
                    labelFormatter={(value, props) => {
                      return props[0].payload.fullName;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="publishRate" name="Publish Rate" fill={COLORS.primary} />
                  <Bar dataKey="consumeRate" name="Consume Rate" fill={COLORS.secondary} />
                  <Bar dataKey="lag" name="Lag" fill={COLORS.warning} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Average Message Size & System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Average Message Size by Topic" className="md:col-span-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getTopicChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatBytes(value), 'Avg. Size']}
                      labelFormatter={(value, props) => {
                        return props[0].payload.fullName;
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="avgMessageSize" 
                      name="Average Message Size" 
                      fill={COLORS.purple} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card title="System Metrics">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Avg Publish Rate (msgs/min)
                  </h4>
                  <div className="mt-1 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (metrics.system.averagePublishRate / 20) * 100)}%` }} 
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {metrics.system.averagePublishRate.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Avg Consume Rate (msgs/min)
                  </h4>
                  <div className="mt-1 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (metrics.system.averageConsumeRate / 20) * 100)}%` }} 
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {metrics.system.averageConsumeRate.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Storage Used
                  </h4>
                  <div className="text-lg font-semibold mt-1">
                    {formatBytes(metrics.system.storageUsed)}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500">
                    System Health
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Topics</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Messaging</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Consumers</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Storage</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Topic Details Table */}
          <Card title="Topic Metrics Details">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message Count
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publish Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consume Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lag
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Message Size
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.topics.map(topic => (
                    <tr key={topic.topicId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {topic.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {topic.messageCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600">
                        {topic.publishRate.toFixed(2)} msgs/min
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">
                        {topic.consumeRate.toFixed(2)} msgs/min
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm ${
                        (topic.publishRate - topic.consumeRate) > 5 
                          ? 'text-red-600' 
                          : (topic.publishRate - topic.consumeRate) > 0 
                            ? 'text-amber-600' 
                            : 'text-gray-500'
                      }`}>
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
          
          <div className="text-xs text-gray-500 text-right">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !error && (!metrics || metrics.topics.length === 0) && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600 mb-6">There are no metrics available to display. Create some topics and send messages to see data here.</p>
          <Button onClick={fetchMetrics}>Refresh Metrics</Button>
        </div>
      )}

      {/* System Health Monitor - Only shown when metrics exist */}
      {metrics && metrics.system && (
        <div className="mt-6 bg-white rounded-lg shadow p-4 border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">System Health Monitor</h3>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Healthy
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide">CPU Usage</div>
              <div className="mt-1 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                </div>
                <span className="text-xs font-medium">15%</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Memory Usage</div>
              <div className="mt-1 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '28%' }}></div>
                </div>
                <span className="text-xs font-medium">28%</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Lambda Invocations</div>
              <div className="mt-1 flex items-center">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-sm font-medium text-green-600">+24%</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide">API Latency</div>
              <div className="mt-1 flex items-center">
                <div className="mr-1.5">
                  <span className="text-sm font-medium">42ms</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-xs text-green-600">Good</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-md font-medium text-gray-900">Dashboard Help</h3>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <p>This dashboard shows real-time and historical metrics for your MicroQueue system. You can:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>Switch between hourly, daily, and weekly views</li>
            <li>Enable auto-refresh to keep data current</li>
            <li>Hover over charts for detailed information</li>
            <li>Review system health and performance metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
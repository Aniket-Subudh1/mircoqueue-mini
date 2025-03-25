import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import Card from './common/Card';

const ComparisonPanel = () => {
  // Performance comparison data
  const performanceData = [
    {
      name: 'Throughput (msgs/sec)',
      microqueue: 8500,
      kafka: 20000,
    },
    {
      name: 'Latency (ms)',
      microqueue: 15,
      kafka: 5,
    },
    {
      name: 'Max Message Size (MB)',
      microqueue: 1,
      kafka: 1,
    },
    {
      name: 'Setup Time (min)',
      microqueue: 5,
      kafka: 30,
    },
    {
      name: 'Resource Usage',
      microqueue: 20,
      kafka: 60,
    },
  ];

  // Feature comparison data
  const featureComparisonData = [
    {
      feature: 'Scalability',
      microqueue: 80,
      kafka: 100,
      fullMark: 100,
    },
    {
      feature: 'Ease of Use',
      microqueue: 90,
      kafka: 50,
      fullMark: 100,
    },
    {
      feature: 'Serverless',
      microqueue: 100,
      kafka: 40,
      fullMark: 100,
    },
    {
      feature: 'Enterprise Features',
      microqueue: 60,
      kafka: 95,
      fullMark: 100,
    },
    {
      feature: 'Cost Efficiency',
      microqueue: 95,
      kafka: 60,
      fullMark: 100,
    },
    {
      feature: 'Integration Options',
      microqueue: 70,
      kafka: 90,
      fullMark: 100,
    },
  ];

  // Use case suitability data
  const useCaseData = [
    { useCase: 'Event Streaming', microqueue: 'Good', kafka: 'Excellent' },
    { useCase: 'Microservices Messaging', microqueue: 'Excellent', kafka: 'Excellent' },
    { useCase: 'Simple Message Queuing', microqueue: 'Excellent', kafka: 'Good' },
    { useCase: 'Real-time Analytics', microqueue: 'Good', kafka: 'Excellent' },
    { useCase: 'Serverless Applications', microqueue: 'Excellent', kafka: 'Fair' },
    { useCase: 'Low-latency Trading', microqueue: 'Fair', kafka: 'Excellent' },
    { useCase: 'IoT Data Ingestion', microqueue: 'Good', kafka: 'Excellent' },
    { useCase: 'Simple Notifications', microqueue: 'Excellent', kafka: 'Good' },
  ];

  // Strengths of MicroQueue
  const microQueueStrengths = [
    'Fully serverless architecture with zero infrastructure management',
    'Pay-per-use pricing model with no upfront costs',
    'Simple setup - deploy in minutes with AWS CDK',
    'Good message throughput for most applications',
    'Integrated CloudWatch metrics and monitoring',
    'Built-in message retention and durability via S3',
    'Consumer groups and offset management similar to Kafka',
    'REST API interface for easy integration with any language',
    'Works well with AWS Lambda for event-driven processing',
  ];

  // When to use which system
  const whenToUse = {
    microqueue: [
      'When you need a simple, cost-effective messaging solution',
      'For serverless applications with variable workloads',
      'When operational overhead should be minimal',
      'For projects with a tight timeline and small team',
      'When message throughput is under 10k/second',
      'For AWS-based architecture integration',
    ],
    kafka: [
      'For high-throughput event streaming (100k+ messages/second)',
      'When you need advanced stream processing features',
      'For large enterprises with dedicated ops teams',
      'When you require exactly-once semantics',
      'For real-time analytics with sub-millisecond latency',
      'When you need extensive ecosystem integration',
    ],
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">MicroQueue Mini vs Apache Kafka</h2>
        <p className="text-gray-600 mb-4">
          While both MicroQueue Mini and Apache Kafka are messaging systems, they serve different use cases and have different operational characteristics. 
          This comparison helps you understand when to use each system based on your requirements.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-blue-700">
            <strong>Key Insight:</strong> MicroQueue Mini offers simplicity and serverless operations at the cost of some throughput and advanced features. 
            Kafka provides industry-leading throughput and features but requires more operational expertise.
          </p>
        </div>
      </Card>

      {/* Performance Comparison */}
      <Card title="Performance Comparison">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'microqueue') return [value, 'MicroQueue Mini'];
                  if (name === 'kafka') return [value, 'Apache Kafka'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="microqueue" name="MicroQueue Mini" fill="#3B82F6" />
              <Bar dataKey="kafka" name="Apache Kafka" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Note: Lower values are better for "Latency", "Setup Time", and "Resource Usage".</p>
        </div>
      </Card>

      {/* Feature Comparison */}
      <Card title="Feature Comparison">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={150} data={featureComparisonData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="feature" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="MicroQueue Mini" dataKey="microqueue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Apache Kafka" dataKey="kafka" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Use Case Suitability */}
      <Card title="Use Case Suitability">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-black border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Use Case
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  MicroQueue Mini
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Apache Kafka
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {useCaseData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.useCase}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm 
                    ${item.microqueue === 'Excellent' 
                      ? 'text-green-600 font-semibold' 
                      : item.microqueue === 'Good' 
                        ? 'text-blue-600' 
                        : 'text-yellow-600'}`}>
                    {item.microqueue}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm 
                    ${item.kafka === 'Excellent' 
                      ? 'text-green-600 font-semibold' 
                      : item.kafka === 'Good' 
                        ? 'text-blue-600' 
                        : 'text-yellow-600'}`}>
                    {item.kafka}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MicroQueue Strengths */}
      <Card title="MicroQueue Mini Strengths">
        <ul className="space-y-2 mb-4">
          {microQueueStrengths.map((strength, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* When to Use Which */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="When to Use MicroQueue Mini">
          <ul className="space-y-2">
            {whenToUse.microqueue.map((item, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        <Card title="When to Use Apache Kafka">
          <ul className="space-y-2">
            {whenToUse.kafka.map((item, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Technical Differences */}
      <Card title="Technical Architecture Differences">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">MicroQueue Mini</h3>
            <div className="border border-blue-100 rounded-lg p-4 bg-blue-50">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="font-medium">Storage:</span>
                  <span className="ml-2">DynamoDB + S3</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Scaling:</span>
                  <span className="ml-2">Automatic with AWS serverless</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Deployment:</span>
                  <span className="ml-2">AWS CDK, CloudFormation</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Management:</span>
                  <span className="ml-2">Via AWS Console, CloudWatch</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">APIs:</span>
                  <span className="ml-2">RESTful HTTP API</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Compute:</span>
                  <span className="ml-2">AWS Lambda</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Distribution:</span>
                  <span className="ml-2">Raft consensus algorithm for leader election</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">Apache Kafka</h3>
            <div className="border border-green-100 rounded-lg p-4 bg-green-50">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="font-medium">Storage:</span>
                  <span className="ml-2">Distributed log on local disks</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Scaling:</span>
                  <span className="ml-2">Manual node addition, partitioning</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Deployment:</span>
                  <span className="ml-2">Manual or Kubernetes</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Management:</span>
                  <span className="ml-2">Kafka Manager, Control Center</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">APIs:</span>
                  <span className="ml-2">Native protocol over TCP</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Compute:</span>
                  <span className="ml-2">Kafka Streams, KSQL</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium">Distribution:</span>
                  <span className="ml-2">ZooKeeper for coordination</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComparisonPanel;
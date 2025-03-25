import React, { useState, useEffect, useRef } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { publishMessage } from '../api/messageApi';
import { getTopics } from '../api/topicApi';
import { getConsumerGroups, createConsumerGroup } from '../api/consumerApi';

const EVENT_TYPES = [
  'page_view', 
  'click', 
  'form_submit', 
  'add_to_cart',
  'checkout',
  'purchase',
  'login',
  'logout',
  'search'
];

const PAGES = [
  'home',
  'product_list',
  'product_detail',
  'cart',
  'checkout',
  'account',
  'search_results',
  'blog',
  'about',
  'contact'
];

const SimulationPanel = ({ refreshData }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Simulation settings
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [eventsPerSecond, setEventsPerSecond] = useState(1);
  const [simulationDuration, setSimulationDuration] = useState(60);
  const [remainingTime, setRemainingTime] = useState(0);
  const simulationIntervalRef = useRef(null);
  const logsEndRef = useRef(null);
  
  // Fetch topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);
  
  // Fetch consumer groups when topic changes
  useEffect(() => {
    if (selectedTopic) {
      fetchConsumerGroups(selectedTopic.topicId);
    }
  }, [selectedTopic]);
  
  // Scroll to bottom of logs when they update
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulationLogs]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);
  
  // Countdown timer for simulation
  useEffect(() => {
    if (isSimulationRunning && remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (isSimulationRunning && remainingTime === 0) {
      stopSimulation();
    }
  }, [isSimulationRunning, remainingTime]);
  
  const fetchTopics = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getTopics();
      setTopics(data);
      
      // Select first topic by default if available
      if (data.length > 0) {
        setSelectedTopic(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch topics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchConsumerGroups = async (topicId) => {
    setIsLoading(true);
    
    try {
      const data = await getConsumerGroups(topicId);
      setConsumerGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createEventsTopic = async () => {
    setIsLoading(true);
    setError('');
    
    // Check if events topic already exists
    const eventsTopic = topics.find(t => t.name === 'user_events');
    
    if (eventsTopic) {
      setSelectedTopic(eventsTopic);
      setIsLoading(false);
      return;
    }
    
    try {
      // Add log
      addLog('Creating "user_events" topic...');
      
      // Would normally call API to create topic, but we'll simulate
      // for this demo since we don't have createTopic function readily available
      setTimeout(async () => {
        // Refresh topics
        await fetchTopics();
        
        // Find the events topic (assuming it was created elsewhere)
        const newEventsTopic = topics.find(t => t.name === 'user_events');
        
        if (newEventsTopic) {
          setSelectedTopic(newEventsTopic);
          addLog('Successfully created "user_events" topic');
        } else {
          setError('Could not find events topic. Please create a topic named "user_events" manually.');
        }
        
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to create events topic');
      console.error(err);
      setIsLoading(false);
    }
  };
  
  const createEventsConsumer = async () => {
    if (!selectedTopic) return;
    
    setIsLoading(true);
    setError('');
    
    // Check if analytics consumer already exists
    const analyticsConsumer = consumerGroups.find(g => g.name === 'analytics_processor');
    
    if (analyticsConsumer) {
      addLog('Analytics consumer group already exists');
      setIsLoading(false);
      return;
    }
    
    try {
      addLog('Creating "analytics_processor" consumer group...');
      
      const consumerData = {
        topicId: selectedTopic.topicId,
        name: 'analytics_processor',
        description: 'Processes user events for analytics'
      };
      
      const newConsumer = await createConsumerGroup(consumerData);
      
      // Update consumer groups list
      setConsumerGroups([...consumerGroups, newConsumer]);
      
      addLog('Successfully created "analytics_processor" consumer group');
    } catch (err) {
      setError('Failed to create consumer group');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startSimulation = () => {
    if (!selectedTopic) {
      setError('Please select a topic first');
      return;
    }
    
    if (isSimulationRunning) return;
    
    setIsSimulationRunning(true);
    setRemainingTime(simulationDuration);
    
    // Calculate interval based on events per second
    const interval = Math.floor(1000 / eventsPerSecond);
    
    addLog(`Starting simulation: ${eventsPerSecond} events/sec for ${simulationDuration} seconds`);
    
    // Start generating events
    simulationIntervalRef.current = setInterval(() => {
      generateRandomEvent();
    }, interval);
  };
  
  const stopSimulation = () => {
    if (!isSimulationRunning) return;
    
    clearInterval(simulationIntervalRef.current);
    simulationIntervalRef.current = null;
    setIsSimulationRunning(false);
    
    addLog('Simulation stopped');
    
    // Refresh data after simulation
    refreshData();
  };
  
  const generateRandomEvent = async () => {
    if (!selectedTopic) return;
    
    // Generate random event data
    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const page = PAGES[Math.floor(Math.random() * PAGES.length)];
    const userId = `user_${Math.floor(Math.random() * 1000)}`;
    const sessionId = `session_${Math.floor(Math.random() * 10000)}`;
    
    const eventData = {
      event_type: eventType,
      page,
      user_id: userId,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      properties: {}
    };
    
    // Add event-specific properties
    switch (eventType) {
      case 'click':
        eventData.properties.element_id = `btn_${Math.floor(Math.random() * 20)}`;
        eventData.properties.element_class = 'button primary';
        break;
      case 'add_to_cart':
        eventData.properties.product_id = `prod_${Math.floor(Math.random() * 100)}`;
        eventData.properties.product_name = `Product ${Math.floor(Math.random() * 100)}`;
        eventData.properties.price = (Math.random() * 100).toFixed(2);
        eventData.properties.quantity = Math.floor(Math.random() * 5) + 1;
        break;
      case 'purchase':
        eventData.properties.order_id = `order_${Math.floor(Math.random() * 10000)}`;
        eventData.properties.total = (Math.random() * 200).toFixed(2);
        eventData.properties.items = Math.floor(Math.random() * 5) + 1;
        break;
      case 'search':
        eventData.properties.query = `search term ${Math.floor(Math.random() * 50)}`;
        eventData.properties.results = Math.floor(Math.random() * 100);
        break;
      default:
        break;
    }
    
    try {
      // Publish message to topic
      await publishMessage(selectedTopic.topicId, {
        payload: eventData,
        contentType: 'application/json'
      });
      
      // Log event
      addLog(`Published ${eventType} event from ${userId} on ${page}`);
    } catch (err) {
      console.error('Failed to publish event:', err);
      addLog(`Error publishing event: ${err.message}`);
    }
  };
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setSimulationLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };
  
  const clearLogs = () => {
    setSimulationLogs([]);
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Event Simulation</h2>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Simulation Setup">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Topic
              </label>
              {topics.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No topics available. Create a topic first.
                </div>
              ) : (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedTopic?.topicId || ''}
                  onChange={(e) => {
                    const topicId = e.target.value;
                    const topic = topics.find(t => t.topicId === topicId);
                    setSelectedTopic(topic || null);
                  }}
                >
                  {topics.map(topic => (
                    <option key={topic.topicId} value={topic.topicId}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Events Per Second
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={eventsPerSecond}
                  onChange={(e) => setEventsPerSecond(parseInt(e.target.value, 10))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={simulationDuration}
                  onChange={(e) => setSimulationDuration(parseInt(e.target.value, 10))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={createEventsTopic}
                disabled={isLoading || isSimulationRunning}
                className="mr-2"
              >
                Setup Events Topic
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={createEventsConsumer}
                disabled={isLoading || isSimulationRunning || !selectedTopic}
              >
                Setup Analytics Consumer
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              {isSimulationRunning ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">
                      Simulation in progress...
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {remainingTime} seconds remaining
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(remainingTime / simulationDuration) * 100}%` }}
                    ></div>
                  </div>
                  
                  <Button
                    variant="danger"
                    onClick={stopSimulation}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Stop Simulation
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={startSimulation}
                  disabled={isLoading || !selectedTopic}
                  className="w-full"
                >
                  Start Simulation
                </Button>
              )}
            </div>
          </div>
        </Card>
        
        <Card 
          title="Simulation Logs" 
          headerAction={
            <Button
              variant="secondary"
              size="sm"
              onClick={clearLogs}
              disabled={simulationLogs.length === 0}
            >
              Clear
            </Button>
          }
        >
          <div className="h-96 overflow-y-auto font-mono text-xs bg-gray-50 p-2 rounded">
            {simulationLogs.length === 0 ? (
              <div className="text-gray-500 text-center p-4">
                No simulation logs yet. Start the simulation to see logs.
              </div>
            ) : (
              <div className="space-y-1">
                {simulationLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap break-all">
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card title="Event Samples">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The simulation will generate random user events with the following types:
            </p>
            
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map(type => (
                <div 
                  key={type}
                  className="px-3 py-2 bg-gray-50 rounded text-sm"
                >
                  {type}
                </div>
              ))}
            </div>
            
            <div className="text-sm text-gray-600 mt-4">
              Example event:
            </div>
            
            <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
{`{
  "event_type": "add_to_cart",
  "page": "product_detail",
  "user_id": "user_123",
  "session_id": "session_456",
  "timestamp": "2023-04-15T14:30:45.123Z",
  "properties": {
    "product_id": "prod_42",
    "product_name": "Product 42",
    "price": "29.99",
    "quantity": 2
  }
}`}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SimulationPanel;
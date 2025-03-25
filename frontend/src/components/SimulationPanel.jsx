import React, { useState, useEffect, useRef } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { publishMessage } from '../api/messageApi';
import { getTopics, createTopic } from '../api/topicApi';
import { getConsumerGroups, createConsumerGroup } from '../api/consumerApi';
import { useToast } from './ui/Toaster';

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

const USER_AGENTS = [
  'Chrome/Mobile',
  'Chrome/Desktop',
  'Safari/Mobile',
  'Safari/Desktop',
  'Firefox/Desktop',
  'Edge/Desktop',
  'Mobile App/iOS',
  'Mobile App/Android'
];

const SimulationPanel = ({ refreshData }) => {
  const [topics, setTopics] = useState([]);
  const [eventsTopic, setEventsTopic] = useState(null);
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [eventsPerSecond, setEventsPerSecond] = useState(2);
  const [simulationDuration, setSimulationDuration] = useState(60);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [selectedEventTypes, setSelectedEventTypes] = useState(['page_view', 'click', 'form_submit', 'purchase']);
  const simulationIntervalRef = useRef(null);
  const logsEndRef = useRef(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchTopics();
  }, []);
  
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulationLogs]);
  
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (isSimulationRunning && remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(prevTime => {
          const newTime = prevTime - 1;
          const progress = Math.floor(((simulationDuration - newTime) / simulationDuration) * 100);
          setSimulationProgress(progress);
          return newTime;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (isSimulationRunning && remainingTime === 0) {
      stopSimulation();
    }
  }, [isSimulationRunning, remainingTime, simulationDuration]);
  
  const fetchTopics = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getTopics();
      setTopics(data);
      
      const userEventsTopic = data.find(t => t.name === 'user_events');
      if (userEventsTopic) {
        setEventsTopic(userEventsTopic);
        fetchConsumerGroups(userEventsTopic.topicId);
      }
    } catch (err) {
      setError('Failed to fetch topics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchConsumerGroups = async (topicId) => {
    try {
      const data = await getConsumerGroups(topicId);
      setConsumerGroups(data);
    } catch (err) {
      console.error('Error fetching consumer groups:', err);
    }
  };
  
  const createEventsTopic = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      addLog('Creating "user_events" topic...');
      
      const newTopic = await createTopic({
        name: 'user_events',
        description: 'User interaction events for analytics',
        retentionPeriodHours: 48
      });
      
      setEventsTopic(newTopic);
      addLog('Successfully created "user_events" topic');
      
      await createConsumerGroup({
        topicId: newTopic.topicId,
        name: 'analytics_processor',
        description: 'Processes user events for analytics'
      });
      
      addLog('Created "analytics_processor" consumer group');
      
      await createConsumerGroup({
        topicId: newTopic.topicId,
        name: 'realtime_dashboard',
        description: 'Consumes events for real-time dashboard visualization'
      });
      
      addLog('Created "realtime_dashboard" consumer group');
      
      fetchConsumerGroups(newTopic.topicId);
      
      toast.success('Events topic and consumer groups created successfully');
    } catch (err) {
      setError('Failed to create events topic');
      addLog(`Error: ${err.message}`);
      console.error(err);
      toast.error('Failed to create events topic');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startSimulation = () => {
    if (!eventsTopic) {
      toast.error('Please set up the events topic first');
      return;
    }
    
    if (isSimulationRunning) return;
    
    setIsSimulationRunning(true);
    setRemainingTime(simulationDuration);
    setTotalEvents(0);
    setSimulationProgress(0);
    
    setSimulationLogs([]);
    
    const eventsRate = Math.min(Math.max(1, eventsPerSecond), 10);
    
    addLog(`Starting simulation: ${eventsRate} events/sec for ${simulationDuration} seconds`);
    
    const interval = Math.floor(1000 / eventsRate);
    
    simulationIntervalRef.current = setInterval(() => {
      generateRandomEvent();
    }, interval);
    
    toast.success('Simulation started');
  };
  
  const stopSimulation = () => {
    if (!isSimulationRunning) return;
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    setIsSimulationRunning(false);
    setSimulationProgress(100);
    
    addLog('Simulation stopped');
    addLog(`Total events generated: ${totalEvents}`);
    
    toast.info(`Simulation completed with ${totalEvents} events`);
    
    refreshData();
  };
  
  const generateRandomEvent = async () => {
    if (!eventsTopic || !isSimulationRunning) return;
    
    const availableEventTypes = EVENT_TYPES.filter(type => 
      selectedEventTypes.includes(type)
    );
    
    if (availableEventTypes.length === 0) {
      addLog('No event types selected. Stopping simulation.');
      stopSimulation();
      return;
    }
    
    try {
      const eventType = availableEventTypes[Math.floor(Math.random() * availableEventTypes.length)];
      const page = PAGES[Math.floor(Math.random() * PAGES.length)];
      const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const userId = `user_${Math.floor(Math.random() * 1000)}`;
      const sessionId = `session_${Math.floor(Math.random() * 10000)}`;
      const timestamp = new Date().toISOString();
      
      const eventData = {
        event_type: eventType,
        page,
        user_id: userId,
        session_id: sessionId,
        timestamp,
        user_agent: userAgent,
        properties: {}
      };
      
      switch (eventType) {
        case 'click':
          eventData.properties.element_id = `btn_${Math.floor(Math.random() * 20)}`;
          eventData.properties.element_class = 'button primary';
          eventData.properties.position_x = Math.floor(Math.random() * 1000);
          eventData.properties.position_y = Math.floor(Math.random() * 800);
          break;
        case 'add_to_cart':
          eventData.properties.product_id = `prod_${Math.floor(Math.random() * 100)}`;
          eventData.properties.product_name = `Product ${Math.floor(Math.random() * 100)}`;
          eventData.properties.price = parseFloat((Math.random() * 100).toFixed(2));
          eventData.properties.quantity = Math.floor(Math.random() * 5) + 1;
          eventData.properties.category = ['Electronics', 'Clothing', 'Home', 'Books'][Math.floor(Math.random() * 4)];
          break;
        case 'purchase':
          eventData.properties.order_id = `order_${Math.floor(Math.random() * 10000)}`;
          eventData.properties.total = parseFloat((Math.random() * 200).toFixed(2));
          eventData.properties.items = Math.floor(Math.random() * 5) + 1;
          eventData.properties.payment_method = ['credit_card', 'paypal', 'apple_pay'][Math.floor(Math.random() * 3)];
          break;
        case 'search':
          eventData.properties.query = `search term ${Math.floor(Math.random() * 50)}`;
          eventData.properties.results = Math.floor(Math.random() * 100);
          eventData.properties.filters_applied = Math.random() > 0.5;
          break;
        case 'page_view':
          eventData.properties.referrer = Math.random() > 0.7 ? 'https://google.com' : '';
          eventData.properties.page_title = `${page.charAt(0).toUpperCase() + page.slice(1).replace('_', ' ')} Page`;
          eventData.properties.viewport_width = [375, 414, 768, 1024, 1440][Math.floor(Math.random() * 5)];
          break;
        default:
          break;
      }
      
      await publishMessage(eventsTopic.topicId, {
        payload: eventData,
        contentType: 'application/json',
        metadata: {
          eventType,
          userId,
          sessionId,
          simulation: true
        }
      });
      
      setTotalEvents(prev => prev + 1);
      
      if (totalEvents % 5 === 0 || ['purchase', 'checkout'].includes(eventType)) {
        addLog(`Generated ${eventType} event on ${page} from ${userId} (${userAgent})`);
      }
    } catch (err) {
      addLog(`Error generating event: ${err.message}`);
      console.error('Failed to generate event:', err);
    }
  };
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setSimulationLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };
  
  const clearLogs = () => {
    setSimulationLogs([]);
  };
  
  const toggleEventType = (eventType) => {
    setSelectedEventTypes(prev => {
      if (prev.includes(eventType)) {
        return prev.filter(type => type !== eventType);
      } else {
        return [...prev, eventType];
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Event Simulation Workbench</h2>
          <p className="text-gray-600 mt-1">Generate user interaction events to test your message processing system</p>
        </div>
        <Button 
          onClick={createEventsTopic} 
          disabled={isLoading || eventsTopic || isSimulationRunning}
          variant={eventsTopic ? "secondary" : "primary"}
        >
          {isLoading ? 'Setting up...' : eventsTopic ? 'Topic Ready' : 'Setup Events Topic'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Simulation Setup">
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Events Per Second
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                value={eventsPerSecond}
                onChange={(e) => setEventsPerSecond(parseInt(e.target.value, 10))}
                disabled={isSimulationRunning || !eventsTopic}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1/sec</span>
                <span>{eventsPerSecond}/sec</span>
                <span>10/sec</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Simulation Duration (seconds)
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                value={simulationDuration}
                onChange={(e) => setSimulationDuration(parseInt(e.target.value, 10))}
                disabled={isSimulationRunning || !eventsTopic}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>10s</span>
                <span>{simulationDuration}s</span>
                <span>300s</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Types to Generate
              </label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {EVENT_TYPES.map(eventType => (
                  <div 
                    key={eventType}
                    className={`
                      flex items-center p-2 border rounded-md cursor-pointer transition
                      ${selectedEventTypes.includes(eventType) ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'}
                    `}
                    onClick={() => toggleEventType(eventType)}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedEventTypes.includes(eventType)}
                      onChange={() => {}}
                      disabled={isSimulationRunning}
                    />
                    <span className="ml-2 text-sm">{eventType.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {isSimulationRunning ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Simulation progress:</span>
                    <span>{simulationProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all" 
                      style={{ width: `${simulationProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <div className="text-xs text-gray-500">Time Remaining</div>
                    <div className="text-xl font-semibold text-gray-800">{remainingTime}s</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-xs text-gray-500">Events Generated</div>
                    <div className="text-xl font-semibold text-blue-600">{totalEvents}</div>
                  </div>
                </div>
                
                <Button
                  onClick={stopSimulation}
                  variant="danger"
                  className="w-full"
                >
                  Stop Simulation
                </Button>
              </div>
            ) : (
              <Button
                onClick={startSimulation}
                disabled={!eventsTopic || isLoading || selectedEventTypes.length === 0}
                className="w-full"
              >
                Start Simulation
              </Button>
            )}
          </div>
        </Card>

        <Card 
          title="Simulation Logs" 
          className="md:col-span-2"
          headerAction={
            <Button
              variant="secondary"
              size="sm"
              onClick={clearLogs}
              disabled={simulationLogs.length === 0 || isSimulationRunning}
            >
              Clear
            </Button>
          }
        >
          <div className="h-96 overflow-y-auto font-mono text-xs bg-gray-50 p-2 rounded">
            {simulationLogs.length === 0 ? (
              <div className="text-gray-500 text-center p-4">
                No simulation logs yet. Start the simulation to see activity logs.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Event Samples">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The simulation generates various types of user interaction events. Here's a sample event structure:
            </p>
            
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-48">
{`{
  "event_type": "add_to_cart",
  "page": "product_detail",
  "user_id": "user_123",
  "session_id": "session_456",
  "timestamp": "2023-04-15T14:30:45.123Z",
  "user_agent": "Chrome/Desktop",
  "properties": {
    "product_id": "prod_42",
    "product_name": "Product 42",
    "price": 29.99,
    "quantity": 2,
    "category": "Electronics"
  }
}`}
            </pre>
          </div>
        </Card>
        
        <Card title="System Architecture">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This simulation demonstrates a real-world event streaming architecture for analytics:
            </p>
            
            <div className="bg-gray-50 p-3 rounded">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>User interactions generate events (simulated here)</li>
                <li>Events are published to <strong>MicroQueue</strong> topic</li>
                <li>Multiple consumer groups process events in parallel:</li>
                <ul className="list-disc list-inside ml-6 space-y-1">
                  <li>Analytics processor for data warehousing</li>
                  <li>Real-time dashboard for visualization</li>
                </ul>
                <li>Data is processed and stored for business intelligence</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
              <p className="text-sm text-blue-700">
                <strong>Pro Tip:</strong> In production, you would connect the events topic to AWS Lambda functions or other compute services to process these events.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {eventsTopic && (
        <Card title="Topic Statistics">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Topic Name</h3>
              <p className="text-lg font-semibold">{eventsTopic.name}</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Message Count</h3>
              <p className="text-lg font-semibold text-blue-600">{eventsTopic.messageCount}</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Retention Period</h3>
              <p className="text-lg font-semibold">{eventsTopic.retentionPeriodHours} hours</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Consumer Groups</h3>
              <p className="text-lg font-semibold text-blue-600">{consumerGroups.length}</p>
            </div>
          </div>
          
          {consumerGroups.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Consumer Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consumerGroups.map(group => (
                  <div key={group.groupId} className="border rounded-lg p-3 flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-xs text-gray-500">
                        {group.description || 'No description'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SimulationPanel;
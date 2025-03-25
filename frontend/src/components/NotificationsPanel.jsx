import React, { useState, useEffect, useRef } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';
import { publishMessage } from '../api/messageApi';
import { getTopics, createTopic } from '../api/topicApi';
import { getConsumerGroups, createConsumerGroup } from '../api/consumerApi';
import { useToast } from './ui/Toaster';

// Sample course data
const COURSES = [
  { id: 'CS101', name: 'Introduction to Computer Science', students: 120 },
  { id: 'MATH201', name: 'Calculus II', students: 85 },
  { id: 'ENG105', name: 'Academic Writing', students: 65 },
  { id: 'PHYS102', name: 'Physics for Engineers', students: 95 },
  { id: 'BIO110', name: 'Fundamentals of Biology', students: 75 },
];

// Notification types
const NOTIFICATION_TYPES = [
  { id: 'announcement', name: 'Course Announcement', color: 'blue' },
  { id: 'assignment', name: 'New Assignment', color: 'green' },
  { id: 'deadline', name: 'Deadline Reminder', color: 'orange' },
  { id: 'grade', name: 'Grade Posted', color: 'purple' },
  { id: 'feedback', name: 'Instructor Feedback', color: 'indigo' },
];

const NotificationsPanel = ({ selectedTopic }) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [topics, setTopics] = useState([]);
  const [lmsTopic, setLmsTopic] = useState(null);
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
  const [selectedNotificationType, setSelectedNotificationType] = useState(NOTIFICATION_TYPES[0]);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationContent, setNotificationContent] = useState('');
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [studentDeliveryRate, setStudentDeliveryRate] = useState(0);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const logsEndRef = useRef(null);
  const { toast } = useToast();

  // Set up LMS topic on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  // Scroll to bottom of logs when they update
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulationLogs]);

  // Fetch all topics
  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const allTopics = await getTopics();
      setTopics(allTopics);
      
      // Check for lms_notifications topic
      const lmsNotificationsTopic = allTopics.find(t => t.name === 'lms_notifications');
      if (lmsNotificationsTopic) {
        setLmsTopic(lmsNotificationsTopic);
        fetchConsumerGroups(lmsNotificationsTopic.topicId);
      }
    } catch (err) {
      setError('Failed to fetch topics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch consumer groups for the LMS topic
  const fetchConsumerGroups = async (topicId) => {
    try {
      const groups = await getConsumerGroups(topicId);
      setConsumerGroups(groups);
    } catch (err) {
      console.error('Failed to fetch consumer groups:', err);
    }
  };

  // Set up LMS topic if it doesn't exist
  const setupLmsTopic = async () => {
    setIsLoading(true);
    addLog('Setting up LMS Notifications topic...');
    
    try {
      // Create topic if it doesn't exist
      if (!lmsTopic) {
        const newTopic = await createTopic({
          name: 'lms_notifications',
          description: 'Notifications for the Learning Management System',
          retentionPeriodHours: 72 // 3 days retention
        });
        setLmsTopic(newTopic);
        addLog('Created lms_notifications topic');
        
        // Create consumer groups
        await createConsumerGroup({
          topicId: newTopic.topicId,
          name: 'email_delivery',
          description: 'Processes notifications for email delivery'
        });
        
        await createConsumerGroup({
          topicId: newTopic.topicId,
          name: 'mobile_push',
          description: 'Processes notifications for mobile push delivery'
        });
        
        await createConsumerGroup({
          topicId: newTopic.topicId,
          name: 'analytics',
          description: 'Tracks notification metrics for analytics'
        });
        
        addLog('Created consumer groups: email_delivery, mobile_push, analytics');
        
        // Fetch the consumer groups
        await fetchConsumerGroups(newTopic.topicId);
        
        toast.success('LMS Notifications system set up successfully');
      } else {
        toast.info('LMS Notifications system is already set up');
      }
    } catch (err) {
      setError('Failed to set up LMS topic system');
      addLog(`Error: ${err.message}`);
      console.error(err);
      toast.error('Failed to set up LMS Notifications system');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a notification
  const sendNotification = async () => {
    if (!lmsTopic) {
      toast.error('Please set up the LMS Notifications topic first');
      return;
    }
    
    if (!notificationTitle.trim() || !notificationContent.trim()) {
      toast.warning('Please enter both a title and content for the notification');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {
        type: selectedNotificationType.id,
        course: {
          id: selectedCourse.id,
          name: selectedCourse.name
        },
        notification: {
          title: notificationTitle,
          content: notificationContent,
          timestamp: new Date().toISOString()
        },
        metadata: {
          sender: 'Instructor',
          priority: selectedNotificationType.id === 'deadline' ? 'high' : 'normal',
          recipientCount: selectedCourse.students
        }
      };
      
      await publishMessage(lmsTopic.topicId, {
        payload,
        contentType: 'application/json',
        metadata: {
          notificationType: selectedNotificationType.id,
          courseId: selectedCourse.id
        }
      });
      
      toast.success('Notification sent successfully');
      
      // Reset form
      setNotificationTitle('');
      setNotificationContent('');
      
    } catch (err) {
      toast.error('Failed to send notification');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run notification delivery simulation
  const runSimulation = async () => {
    if (!lmsTopic) {
      toast.error('Please set up the LMS Notifications topic first');
      return;
    }
    
    setSimulationLogs([]);
    setNotificationCount(0);
    setStudentDeliveryRate(0);
    setSimulationProgress(0);
    setIsSimulationModalOpen(true);
    setIsSimulationRunning(true);
    
    // Random delivery rate between 85% and 99%
    const deliveryRate = 85 + Math.floor(Math.random() * 15);
    setStudentDeliveryRate(deliveryRate);
    
    try {
      // Simulate sending announcements to each course
      for (let i = 0; i < COURSES.length; i++) {
        const course = COURSES[i];
        setSimulationProgress(Math.floor((i / COURSES.length) * 100));
        
        // Create announcement for the course
        const payload = {
          type: 'announcement',
          course: {
            id: course.id,
            name: course.name
          },
          notification: {
            title: `Important Update for ${course.id}`,
            content: `This is an automated announcement for ${course.name}. Please check the course materials for updates.`,
            timestamp: new Date().toISOString()
          },
          metadata: {
            sender: 'System',
            priority: 'normal',
            recipientCount: course.students
          }
        };
        
        // Publish message
        await publishMessage(lmsTopic.topicId, {
          payload,
          contentType: 'application/json',
          metadata: {
            notificationType: 'announcement',
            courseId: course.id,
            simulation: true
          }
        });
        
        addLog(`Sent announcement to ${course.id} - ${course.name} (${course.students} students)`);
        setNotificationCount(prev => prev + 1);
        
        // Simulate delivery stats
        const deliveredCount = Math.floor(course.students * (deliveryRate / 100));
        const failedCount = course.students - deliveredCount;
        
        // Wait a bit to simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addLog(`Delivered to ${deliveredCount} students (${failedCount} failed) for ${course.id}`);
        
        // Simulate different notification types for variety
        if (i % 2 === 0) {
          const assignmentPayload = {
            type: 'assignment',
            course: {
              id: course.id,
              name: course.name
            },
            notification: {
              title: `New Assignment: ${course.id} Homework`,
              content: `A new assignment has been posted for ${course.name}. Due date is in one week.`,
              timestamp: new Date().toISOString()
            },
            metadata: {
              sender: 'System',
              priority: 'high',
              recipientCount: course.students
            }
          };
          
          await publishMessage(lmsTopic.topicId, {
            payload: assignmentPayload,
            contentType: 'application/json',
            metadata: {
              notificationType: 'assignment',
              courseId: course.id,
              simulation: true
            }
          });
          
          addLog(`Sent assignment notification to ${course.id} - ${course.name}`);
          setNotificationCount(prev => prev + 1);
          
          // Wait a bit to simulate processing time
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      
      setSimulationProgress(100);
      addLog('Simulation completed successfully');
      addLog(`Total notifications sent: ${notificationCount + COURSES.length}`);
      addLog(`Average delivery rate: ${deliveryRate}%`);
      
    } catch (err) {
      addLog(`Error in simulation: ${err.message}`);
      console.error(err);
    } finally {
      setIsSimulationRunning(false);
    }
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setSimulationLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const formatTypeLabel = (type) => {
    return (
      <div className={`flex items-center px-3 py-1 rounded-full bg-${type.color}-100 text-${type.color}-800 text-sm font-medium`}>
        <span className={`w-2 h-2 rounded-full bg-${type.color}-500 mr-2`}></span>
        {type.name}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Setup Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">LMS Notifications System</h2>
          <p className="text-gray-600 mt-1">Simulate a Learning Management System notifications infrastructure</p>
        </div>
        <Button 
          onClick={setupLmsTopic} 
          disabled={isLoading || lmsTopic}
          variant={lmsTopic ? "secondary" : "primary"}
        >
          {isLoading ? 'Setting up...' : lmsTopic ? 'System Ready' : 'Setup LMS System'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* System Status */}
      <Card title="System Status">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Topic Status</h3>
            <div className="mt-2 flex items-center">
              {lmsTopic ? (
                <>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="ml-2 text-green-700 font-medium">Topic Active</span>
                </>
              ) : (
                <>
                  <span className="flex h-3 w-3 relative">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400"></span>
                  </span>
                  <span className="ml-2 text-gray-700 font-medium">Topic Not Setup</span>
                </>
              )}
            </div>
            {lmsTopic && (
              <div className="mt-2 text-sm text-gray-600">
                Topic ID: {lmsTopic.topicId}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Consumer Groups</h3>
            <div className="mt-2">
              {consumerGroups.length > 0 ? (
                <ul className="space-y-1">
                  {consumerGroups.map(group => (
                    <li key={group.groupId} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="text-sm">{group.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-gray-600">No consumer groups setup</span>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">System Health</h3>
            {lmsTopic ? (
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Retention Period:</span>
                  <span className="text-sm font-medium">{lmsTopic.retentionPeriodHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Message Count:</span>
                  <span className="text-sm font-medium">{lmsTopic.messageCount}</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-600">
                System not initialized
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content: Send Notification & Run Simulation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send Notification */}
        <Card title="Send Course Notification">
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Course
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedCourse.id}
                onChange={(e) => {
                  const course = COURSES.find(c => c.id === e.target.value);
                  setSelectedCourse(course || COURSES[0]);
                }}
                disabled={!lmsTopic || isLoading}
              >
                {COURSES.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.id} - {course.name} ({course.students} students)
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {NOTIFICATION_TYPES.map(type => (
                  <div
                    key={type.id}
                    className={`
                      cursor-pointer border rounded-md p-2 flex items-center justify-center transition
                      ${selectedNotificationType.id === type.id ? 
                        `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700` : 
                        'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setSelectedNotificationType(type)}
                  >
                    <span className={`w-2 h-2 rounded-full bg-${type.color}-500 mr-2`}></span>
                    <span className="text-sm">{type.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Input
              label="Notification Title"
              placeholder="Enter notification title"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              disabled={!lmsTopic || isLoading}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Content
              </label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter notification content"
                value={notificationContent}
                onChange={(e) => setNotificationContent(e.target.value)}
                disabled={!lmsTopic || isLoading}
              ></textarea>
            </div>

            <Button
              onClick={sendNotification}
              disabled={!lmsTopic || isLoading || !notificationTitle.trim() || !notificationContent.trim()}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </Card>

        {/* Run Simulation */}
        <Card title="Run Notification Simulation">
          <div className="space-y-4">
            <p className="text-gray-600">
              This simulation will send various types of notifications to all courses, simulating a real-world LMS notification system.
            </p>

            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
              <p className="text-indigo-700">
                <strong>What this simulates:</strong> The simulation demonstrates how MicroQueue can handle notifications for a Learning Management System with multiple courses and delivery targets.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Courses to notify:</span>
                <span className="font-medium">{COURSES.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total student recipients:</span>
                <span className="font-medium">{COURSES.reduce((sum, course) => sum + course.students, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Notification types:</span>
                <span className="font-medium">Multiple (Announcements, Assignments)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Consumer processes:</span>
                <span className="font-medium">{consumerGroups.length} (Email, Mobile, Analytics)</span>
              </div>
            </div>

            <Button
              onClick={runSimulation}
              disabled={!lmsTopic || isLoading || isSimulationRunning}
              className="w-full"
              variant="primary"
            >
              {isSimulationRunning ? 'Simulation Running...' : 'Run Simulation'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Simulation Modal */}
      <Modal
        isOpen={isSimulationModalOpen}
        onClose={() => !isSimulationRunning && setIsSimulationModalOpen(false)}
        title="LMS Notification Simulation"
        size="lg"
      >
        <div className="space-y-4">
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Simulation progress:</span>
              <span>{simulationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${simulationProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-500">Notifications Sent</h4>
              <p className="text-2xl font-bold text-blue-600">{notificationCount}</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-500">Delivery Rate</h4>
              <p className="text-2xl font-bold text-green-600">{studentDeliveryRate}%</p>
            </div>
          </div>

          {/* Logs */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Simulation Logs</h4>
            <div className="h-64 overflow-y-auto border rounded-lg p-2 bg-gray-50 font-mono text-xs">
              {simulationLogs.length === 0 ? (
                <div className="text-gray-500 p-4 text-center">
                  Waiting for simulation to start...
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
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setIsSimulationModalOpen(false)}
              disabled={isSimulationRunning}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPanel;
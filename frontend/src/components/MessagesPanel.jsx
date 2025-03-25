import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';
import { publishMessage, consumeMessages } from '../api/messageApi';
import { getConsumerGroups } from '../api/consumerApi';

const MessagesPanel = ({ selectedTopic, refreshData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [selectedConsumerGroup, setSelectedConsumerGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nextSequence, setNextSequence] = useState(0);
  
  // Modal states
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isViewMessageModalOpen, setIsViewMessageModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Form state
  const [messagePayload, setMessagePayload] = useState('');
  const [messageMetadata, setMessageMetadata] = useState('');
  const [maxMessages, setMaxMessages] = useState(10);
  
  // Fetch consumer groups when topic changes
  useEffect(() => {
    if (!selectedTopic) return;
    
    const fetchConsumerGroups = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const data = await getConsumerGroups(selectedTopic.topicId);
        setConsumerGroups(data);
        
        // Select the first consumer group if available
        if (data.length > 0) {
          setSelectedConsumerGroup(data[0]);
        } else {
          setSelectedConsumerGroup(null);
        }
      } catch (err) {
        setError('Failed to fetch consumer groups');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConsumerGroups();
    
    // Reset messages when topic changes
    setMessages([]);
    setNextSequence(0);
  }, [selectedTopic]);
  
  // Handle message publishing
  const handlePublishMessage = async (e) => {
    e.preventDefault();
    
    if (!selectedTopic) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      let payload;
      let metadata = {};
      
      // Try to parse the payload as JSON
      try {
        payload = JSON.parse(messagePayload);
      } catch (err) {
        // If not valid JSON, use as string
        payload = messagePayload;
      }
      
      // Try to parse metadata if provided
      if (messageMetadata.trim()) {
        try {
          metadata = JSON.parse(messageMetadata);
        } catch (err) {
          setError('Invalid metadata format. Must be valid JSON.');
          setIsLoading(false);
          return;
        }
      }
      
      const result = await publishMessage(selectedTopic.topicId, {
        payload,
        metadata,
        contentType: 'application/json'
      });
      
      setIsPublishModalOpen(false);
      setMessagePayload('');
      setMessageMetadata('');
      
      // Refresh messages
      await handleConsumeMessages();
      
      // Refresh topic data
      refreshData();
    } catch (err) {
      setError('Failed to publish message');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle message consumption
  const handleConsumeMessages = async () => {
    if (!selectedTopic || !selectedConsumerGroup) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await consumeMessages(
        selectedTopic.topicId, 
        selectedConsumerGroup.groupId,
        maxMessages,
        0 // No wait time
      );
      
      if (data.messages && data.messages.length > 0) {
        // Process and format messages
        const formattedMessages = data.messages.map(msg => {
          let parsedPayload;
          
          // Try to parse payload as JSON
          try {
            parsedPayload = JSON.parse(msg.payload);
          } catch (err) {
            parsedPayload = msg.payload;
          }
          
          return {
            ...msg,
            formattedPayload: parsedPayload
          };
        });
        
        setMessages(formattedMessages);
        setNextSequence(data.nextSequenceNumber);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to consume messages');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // View message details
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setIsViewMessageModalOpen(true);
  };
  
  // Format payload for display
  const formatPayload = (payload) => {
    if (typeof payload === 'object') {
      return JSON.stringify(payload, null, 2);
    }
    return payload;
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
        <div className="space-x-2">
          <Button 
            onClick={() => setIsPublishModalOpen(true)}
            disabled={!selectedTopic}
          >
            Publish Message
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleConsumeMessages}
            disabled={!selectedTopic || !selectedConsumerGroup}
          >
            Consume Messages
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {!selectedTopic ? (
        <Card>
          <div className="text-center p-8 text-gray-500">
            Select a topic first to publish or consume messages
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card title="Consumer Groups">
              {consumerGroups.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  No consumer groups available for this topic.
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Consumer Group
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedConsumerGroup?.groupId || ''}
                      onChange={(e) => {
                        const groupId = e.target.value;
                        const group = consumerGroups.find(g => g.groupId === groupId);
                        setSelectedConsumerGroup(group || null);
                      }}
                    >
                      {consumerGroups.map(group => (
                        <option key={group.groupId} value={group.groupId}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Messages
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={maxMessages}
                      onChange={(e) => setMaxMessages(parseInt(e.target.value, 10))}
                    />
                  </div>
                </>
              )}
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card title="Message List">
              {isLoading ? (
                <div className="text-center p-4">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  No messages available. Publish a message or consume from the topic.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sequence
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {messages.map(message => (
                        <tr key={message.messageId}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">
                            {message.messageId.substring(0, 8)}...
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {formatDate(message.timestamp)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {message.sequenceNumber}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <Button 
                              size="sm" 
                              onClick={() => handleViewMessage(message)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
      
      {/* Publish Message Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Message"
        size="lg"
        footer={
          <>
            <Button
              variant="primary"
              disabled={isLoading}
              onClick={handlePublishMessage}
              className="ml-2"
            >
              {isLoading ? 'Publishing...' : 'Publish Message'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsPublishModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </>
        }
      >
        <form onSubmit={handlePublishMessage}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Payload (JSON or text)
            </label>
            <textarea
              rows="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
              value={messagePayload}
              onChange={(e) => setMessagePayload(e.target.value)}
              placeholder='{"example": "value"}'
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metadata (optional, JSON format)
            </label>
            <textarea
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
              value={messageMetadata}
              onChange={(e) => setMessageMetadata(e.target.value)}
              placeholder='{"key": "value"}'
            />
          </div>
        </form>
      </Modal>
      
      {/* View Message Modal */}
      <Modal
        isOpen={isViewMessageModalOpen}
        onClose={() => {
          setIsViewMessageModalOpen(false);
          setSelectedMessage(null);
        }}
        title="Message Details"
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Message ID</h4>
              <p className="font-mono">{selectedMessage.messageId}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Timestamp</h4>
              <p>{formatDate(selectedMessage.timestamp)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Sequence Number</h4>
              <p>{selectedMessage.sequenceNumber}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Content Type</h4>
              <p>{selectedMessage.contentType}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Payload</h4>
              <pre className="bg-gray-50 p-2 rounded font-mono text-sm overflow-auto max-h-60">
                {formatPayload(selectedMessage.formattedPayload)}
              </pre>
            </div>
            
            {selectedMessage.metadata && Object.keys(selectedMessage.metadata).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Metadata</h4>
                <pre className="bg-gray-50 p-2 rounded font-mono text-sm overflow-auto max-h-40">
                  {JSON.stringify(selectedMessage.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MessagesPanel;
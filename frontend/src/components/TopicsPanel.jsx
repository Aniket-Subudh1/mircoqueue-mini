import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';
import { getTopics, createTopic, deleteTopic } from '../api/topicApi';

const TopicsPanel = ({ selectedTopic, setSelectedTopic, refreshCounter }) => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  
  // Form state
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [retentionHours, setRetentionHours] = useState(24);
  const [formErrors, setFormErrors] = useState({});

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const data = await getTopics();
        setTopics(data);
        
        // Select the first topic if none is selected
        if (data.length > 0 && !selectedTopic) {
          setSelectedTopic(data[0]);
        }
      } catch (err) {
        setError('Failed to fetch topics');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopics();
  }, [refreshCounter, selectedTopic, setSelectedTopic]);
  
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!newTopicName.trim()) {
      errors.name = 'Topic name is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setFormErrors({});
    
    try {
      const newTopic = await createTopic({
        name: newTopicName,
        description: newTopicDescription,
        retentionPeriodHours: parseInt(retentionHours, 10)
      });
      
      setTopics([...topics, newTopic]);
      setSelectedTopic(newTopic);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to create topic');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteTopic = async () => {
    if (!topicToDelete) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await deleteTopic(topicToDelete.topicId);
      
      // Update topics list
      const updatedTopics = topics.filter(t => t.topicId !== topicToDelete.topicId);
      setTopics(updatedTopics);
      
      // Update selected topic if needed
      if (selectedTopic && selectedTopic.topicId === topicToDelete.topicId) {
        setSelectedTopic(updatedTopics.length > 0 ? updatedTopics[0] : null);
      }
      
      setIsDeleteModalOpen(false);
      setTopicToDelete(null);
    } catch (err) {
      setError('Failed to delete topic');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setNewTopicName('');
    setNewTopicDescription('');
    setRetentionHours(24);
    setFormErrors({});
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Topics</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create New Topic
        </Button>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card title="Topic List">
            {isLoading && topics.length === 0 ? (
              <div className="text-center p-4">Loading...</div>
            ) : topics.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No topics available. Create one to get started.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {topics.map(topic => (
                  <li 
                    key={topic.topicId}
                    className={`
                      py-2 px-1 cursor-pointer hover:bg-gray-50
                      ${selectedTopic && selectedTopic.topicId === topic.topicId ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <div className="font-medium">{topic.name}</div>
                    <div className="text-xs text-gray-500">{topic.topicId}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedTopic ? (
            <Card 
              title="Topic Details"
              headerAction={
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => {
                    setTopicToDelete(selectedTopic);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  Delete
                </Button>
              }
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Name</h4>
                  <p>{selectedTopic.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p>{selectedTopic.description || 'No description'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Topic ID</h4>
                    <p className="text-sm font-mono">{selectedTopic.topicId}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                    <p>{formatDate(selectedTopic.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Retention Period</h4>
                    <p>{selectedTopic.retentionPeriodHours} hours</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Message Count</h4>
                    <p>{selectedTopic.messageCount}</p>
                  </div>
                </div>
                
                {selectedTopic.lastMessageTimestamp && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Message At</h4>
                    <p>{formatDate(selectedTopic.lastMessageTimestamp)}</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center p-8 text-gray-500">
                Select a topic to view details
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Create Topic Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Topic"
        footer={
          <>
            <Button
              variant="primary"
              disabled={isLoading}
              onClick={handleCreateTopic}
              className="ml-2"
            >
              {isLoading ? 'Creating...' : 'Create Topic'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTopic}>
          <Input
            label="Topic Name"
            id="topicName"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="Enter topic name"
            error={formErrors.name}
            required
          />
          
          <Input
            label="Description (optional)"
            id="topicDescription"
            value={newTopicDescription}
            onChange={(e) => setNewTopicDescription(e.target.value)}
            placeholder="Enter topic description"
          />
          
          <Input
            label="Retention Period (hours)"
            id="retentionHours"
            type="number"
            min="1"
            max="168"
            value={retentionHours}
            onChange={(e) => setRetentionHours(e.target.value)}
          />
        </form>
      </Modal>
      
      {/* Delete Topic Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTopicToDelete(null);
        }}
        title="Delete Topic"
        footer={
          <>
            <Button
              variant="danger"
              disabled={isLoading}
              onClick={handleDeleteTopic}
              className="ml-2"
            >
              {isLoading ? 'Deleting...' : 'Delete Topic'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setTopicToDelete(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div>
          <p>Are you sure you want to delete the topic "{topicToDelete?.name}"?</p>
          <p className="text-red-600 mt-2">
            This action cannot be undone. All messages in this topic will be permanently deleted.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default TopicsPanel;
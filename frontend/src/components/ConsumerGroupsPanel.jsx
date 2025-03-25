import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';
import { getConsumerGroups, createConsumerGroup } from '../api/consumerApi';

const ConsumerGroupsPanel = ({ selectedTopic, refreshData }) => {
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Form state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch consumer groups when topic changes
  useEffect(() => {
    if (!selectedTopic) {
      setConsumerGroups([]);
      setSelectedGroup(null);
      return;
    }
    
    fetchConsumerGroups();
  }, [selectedTopic]);
  
  const fetchConsumerGroups = async () => {
    if (!selectedTopic) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getConsumerGroups(selectedTopic.topicId);
      setConsumerGroups(data);
      
      // Select the first group if available
      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0]);
      } else if (data.length === 0) {
        setSelectedGroup(null);
      }
    } catch (err) {
      setError('Failed to fetch consumer groups');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!selectedTopic) return;
    
    // Validate form
    const errors = {};
    if (!newGroupName.trim()) {
      errors.name = 'Consumer group name is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setFormErrors({});
    
    try {
      const newGroup = await createConsumerGroup({
        topicId: selectedTopic.topicId,
        name: newGroupName,
        description: newGroupDescription
      });
      
      // Add to list and select
      setConsumerGroups([...consumerGroups, newGroup]);
      setSelectedGroup(newGroup);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to create consumer group');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setNewGroupName('');
    setNewGroupDescription('');
    setFormErrors({});
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Consumer Groups</h2>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedTopic}
        >
          Create Consumer Group
        </Button>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {!selectedTopic ? (
        <Card>
          <div className="text-center p-8 text-gray-500">
            Select a topic first to manage consumer groups
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card title="Consumer Group List">
              {isLoading && consumerGroups.length === 0 ? (
                <div className="text-center p-4">Loading...</div>
              ) : consumerGroups.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  No consumer groups available. Create one to get started.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {consumerGroups.map(group => (
                    <li 
                      key={group.groupId}
                      className={`
                        py-2 px-1 cursor-pointer hover:bg-gray-50
                        ${selectedGroup && selectedGroup.groupId === group.groupId ? 'bg-blue-50' : ''}
                      `}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="font-medium">{group.name}</div>
                      <div className="text-xs text-gray-500">{group.groupId}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
          
          <div className="md:col-span-2">
            {selectedGroup ? (
              <Card title="Consumer Group Details">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Name</h4>
                    <p>{selectedGroup.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p>{selectedGroup.description || 'No description'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Group ID</h4>
                      <p className="text-sm font-mono">{selectedGroup.groupId}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Topic ID</h4>
                      <p className="text-sm font-mono">{selectedGroup.topicId}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                      <p>{formatDate(selectedGroup.createdAt)}</p>
                    </div>
                    
                    {selectedGroup.lastConsumedTimestamp && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Last Consumed At</h4>
                        <p>{formatDate(selectedGroup.lastConsumedTimestamp)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center p-8 text-gray-500">
                  Select a consumer group to view details
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
      
      {/* Create Consumer Group Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create Consumer Group"
        footer={
          <>
            <Button
              variant="primary"
              disabled={isLoading}
              onClick={handleCreateGroup}
              className="ml-2"
            >
              {isLoading ? 'Creating...' : 'Create Group'}
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
        <form onSubmit={handleCreateGroup}>
          <Input
            label="Consumer Group Name"
            id="groupName"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter consumer group name"
            error={formErrors.name}
            required
          />
          
          <Input
            label="Description (optional)"
            id="groupDescription"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            placeholder="Enter group description"
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md">
              {selectedTopic.name}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConsumerGroupsPanel;
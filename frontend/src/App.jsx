import React, { useState, useEffect } from 'react';
import { Tabs, TabList, Tab, TabPanel } from './components/Tabs';
import TopicsPanel from './components/TopicsPanel';
import MessagesPanel from './components/MessagesPanel';
import ConsumerGroupsPanel from './components/ConsumerGroupsPanel';
import DashboardPanel from './components/DashboardPanel';
import SimulationPanel from './components/SimulationPanel';
import { ApiProvider } from './contexts/ApiContext';
import { Toaster } from './components/ui/Toaster';

const App = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Function to trigger data refresh across components
  const refreshData = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <ApiProvider>
      <Toaster>
        <div className="bg-gray-100 min-h-screen">
          <nav className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">MicroQueue Mini</h1>
              <div className="text-sm">Serverless Messaging System</div>
            </div>
          </nav>

        <main className="container mx-auto p-4">
          <Tabs activeIndex={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab index={0}>Topics</Tab>
              <Tab index={1}>Messages</Tab>
              <Tab index={2}>Consumer Groups</Tab>
              <Tab index={3}>Metrics Dashboard</Tab>
              <Tab index={4}>Simulation</Tab>
            </TabList>

            <div className="bg-white rounded-lg shadow-md mt-4">
              <TabPanel index={0}>
                <TopicsPanel 
                  selectedTopic={selectedTopic} 
                  setSelectedTopic={setSelectedTopic}
                  refreshData={refreshData}
                  refreshCounter={refreshCounter}
                />
              </TabPanel>
              
              <TabPanel index={1}>
                <MessagesPanel 
                  selectedTopic={selectedTopic}
                  refreshData={refreshData}
                />
              </TabPanel>
              
              <TabPanel index={2}>
                <ConsumerGroupsPanel 
                  selectedTopic={selectedTopic}
                  refreshData={refreshData}
                />
              </TabPanel>
              
              <TabPanel index={3}>
                <DashboardPanel />
              </TabPanel>
              
              <TabPanel index={4}>
                <SimulationPanel 
                  refreshData={refreshData}
                />
              </TabPanel>
            </div>
          </Tabs>
        </main>
        
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center text-sm">
            <p>MicroQueue Mini - Serverless Messaging System</p>
            <p className="mt-1 text-gray-400">
              Built with React & AWS Serverless Stack
            </p>
          </div>
        </footer>
        </div>
      </Toaster>
    </ApiProvider>
  );
};

export default App;
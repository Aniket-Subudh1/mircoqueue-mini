import React, { useState, useEffect } from 'react';
import { ApiProvider } from './contexts/ApiContext';
import { Toaster } from './components/ui/Toaster';
import Sidebar from './components/layouts/Sidebar';
import TopicsPanel from './components/TopicsPanel';
import MessagesPanel from './components/MessagesPanel';
import ConsumerGroupsPanel from './components/ConsumerGroupsPanel';
import DashboardPanel from './components/DashboardPanel';
import SimulationPanel from './components/SimulationPanel';
import ComparisonPanel from './components/ComparisonPanel';
import NotificationsPanel from './components/NotificationsPanel';

const App = () => {
  const [activePanel, setActivePanel] = useState('dashboard');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const refreshData = () => {
    setRefreshCounter(prev => prev + 1);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'topics':
        return (
          <TopicsPanel 
            selectedTopic={selectedTopic} 
            setSelectedTopic={setSelectedTopic}
            refreshData={refreshData}
            refreshCounter={refreshCounter}
          />
        );
      case 'messages':
        return (
          <MessagesPanel 
            selectedTopic={selectedTopic}
            refreshData={refreshData}
          />
        );
      case 'consumerGroups':
        return (
          <ConsumerGroupsPanel 
            selectedTopic={selectedTopic}
            refreshData={refreshData}
          />
        );
      case 'dashboard':
        return <DashboardPanel />;
      case 'simulation':
        return (
          <SimulationPanel 
            refreshData={refreshData}
          />
        );
      case 'comparison':
        return <ComparisonPanel />;
      case 'notifications':
        return <NotificationsPanel selectedTopic={selectedTopic} />;
      default:
        return <DashboardPanel />;
    }
  };

  return (
    <ApiProvider>
      <Toaster>
        <div className="flex h-screen bg-gray-50">
          <Sidebar 
            activePanel={activePanel} 
            setActivePanel={setActivePanel}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            selectedTopic={selectedTopic}
          />

          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    className="md:hidden mr-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                    onClick={toggleSidebar}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-xl font-semibold text-gray-800">
                    {activePanel === 'dashboard' && 'Analytics Dashboard'}
                    {activePanel === 'topics' && 'Topic Management'}
                    {activePanel === 'messages' && 'Message Management'}
                    {activePanel === 'consumerGroups' && 'Consumer Groups'}
                    {activePanel === 'simulation' && 'Simulation Workbench'}
                    {activePanel === 'comparison' && 'MicroQueue vs. Kafka'}
                    {activePanel === 'notifications' && 'LMS Notifications'}
                  </h1>
                </div>
                <div className="flex items-center">
                  {selectedTopic && (
                    <div className="hidden md:block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      Selected Topic: {selectedTopic.name}
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
              <div className="container mx-auto">
                {renderPanel()}
              </div>
            </main>

            <footer className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="text-center text-sm text-gray-600">
                <p>MicroQueue Mini - Serverless Messaging System</p>
                <p className="text-gray-400 text-xs mt-1">Version 1.0.0</p>
              </div>
            </footer>
          </div>
        </div>
      </Toaster>
    </ApiProvider>
  );
};

export default App;
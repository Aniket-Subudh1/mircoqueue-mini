import React, { createContext, useContext } from 'react';


const TabContext = createContext({
  activeIndex: 0,
  onChange: () => {},
});


export const Tabs = ({ children, activeIndex, onChange }) => {
  return (
    <TabContext.Provider value={{ activeIndex, onChange }}>
      {children}
    </TabContext.Provider>
  );
};


export const TabList = ({ children }) => {
  return (
    <div className="flex border-b border-gray-200">
      {children}
    </div>
  );
};


export const Tab = ({ children, index }) => {
  const { activeIndex, onChange } = useContext(TabContext);
  const isActive = index === activeIndex;
  
  return (
    <button
      className={`
        px-4 
        py-2
        focus:outline-none
        ${isActive ? 
          'text-blue-600 border-b-2 border-blue-600 font-medium' : 
          'text-gray-500 hover:text-gray-700 hover:border-gray-300'}
      `}
      onClick={() => onChange(index)}
    >
      {children}
    </button>
  );
};


export const TabPanel = ({ children, index }) => {
  const { activeIndex } = useContext(TabContext);
  
  if (index !== activeIndex) {
    return null;
  }
  
  return (
    <div>
      {children}
    </div>
  );
};
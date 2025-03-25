import React, { useState, useEffect, createContext, useContext } from 'react';

// Create context for toast notifications
const ToasterContext = createContext({
  showToast: () => {},
  hideToast: () => {},
});

// Toast types and their associated styles
const TOAST_TYPES = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    icon: 'text-green-500',
    title: 'text-green-800',
    message: 'text-green-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700',
  },
};

// Individual Toast component
const Toast = ({ id, type = 'info', title, message, onClose }) => {
  const styles = TOAST_TYPES[type] || TOAST_TYPES.info;
  
  // Auto-close toast after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [id, onClose]);
  
  // Get icon for toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  return (
    <div className={`max-w-sm w-full ${styles.bg} border-l-4 ${styles.border} shadow-md rounded-md pointer-events-auto`}>
      <div className="flex p-4">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          {title && (
            <p className={`text-sm font-medium ${styles.title}`}>
              {title}
            </p>
          )}
          <p className={`mt-1 text-sm ${styles.message}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => onClose(id)}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Toaster provider component
export const ToasterProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  // Show a new toast notification
  const showToast = (type, message, title = '') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, type, message, title }]);
    return id;
  };
  
  // Hide a toast notification
  const hideToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  return (
    <ToasterContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-end px-4 py-6 sm:p-6 space-y-4">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={hideToast}
            />
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
};

// Hook to use toast notifications
export const useToast = () => {
  const context = useContext(ToasterContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToasterProvider');
  }
  
  const { showToast, hideToast } = context;
  
  return {
    toast: {
      success: (message, title) => showToast('success', message, title),
      error: (message, title) => showToast('error', message, title),
      warning: (message, title) => showToast('warning', message, title),
      info: (message, title) => showToast('info', message, title),
    },
    hideToast,
  };
};

// Toaster component for exporting
export const Toaster = ToasterProvider;
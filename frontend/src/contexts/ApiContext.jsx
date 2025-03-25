import React, { createContext, useState, useContext } from 'react';

const ApiContext = createContext({
  isLoading: false,
  error: null,
  setLoading: () => {},
  setError: () => {},
  clearError: () => {},
});

export const ApiProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const setLoading = (loading) => setIsLoading(loading);
  const clearError = () => setError(null);
  
  return (
    <ApiContext.Provider 
      value={{
        isLoading,
        error,
        setLoading,
        setError,
        clearError,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  return useContext(ApiContext);
};

export default ApiContext;
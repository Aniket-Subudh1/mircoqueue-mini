
export const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || true,
    APP_NAME: import.meta.env.VITE_APP_NAME || 'MicroQueue Mini',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    

    IS_DEV: import.meta.env.DEV,
    
    // For toggling features
    FEATURES: {
      MOCK_DATA_TOGGLE: true, 
      DARK_MODE: true,        
      AUTO_REFRESH: true      
    }
  };
  
  export default config;
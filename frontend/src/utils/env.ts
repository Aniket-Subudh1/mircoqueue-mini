
/// <reference types="vite/client" />

export const config = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    API_STAGE: import.meta.env.VITE_API_STAGE || 'dev',
    USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
    
   
    APP_NAME: import.meta.env.VITE_APP_NAME || 'MicroQueue Mini',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    

    IS_DEV: import.meta.env.DEV,
    
 
    FEATURES: {
      MOCK_DATA_TOGGLE: true,  
      DARK_MODE: true,         
      AUTO_REFRESH: true  
    }
  };
  
  export default config;
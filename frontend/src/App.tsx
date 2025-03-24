// frontend/src/App.tsx
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, CircularProgress, Box, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { theme } from '@/theme';
import routes from './routes';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import MinimalLayout from '@/layouts/MinimalLayout';
import MockDataToggle from '@/components/development/MockDataToggle';
import { fetchTopics } from '@/store/slices/topicsSlice';
import { fetchSystemMetrics } from '@/store/slices/metricsSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import config from '@/utils/env';

function App() {
  const dispatch = useAppDispatch();
  const { refreshInterval } = useAppSelector((state) => state.ui);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize app data
    const initializeApp = async () => {
      try {
        console.log("Initializing app with API at:", config.API_BASE_URL);
        console.log("API Stage:", config.API_STAGE);
        console.log("Mock Data:", config.USE_MOCK_DATA ? "Enabled" : "Disabled");
        
        // Initial data fetching
        await Promise.all([
          dispatch(fetchTopics()),
          dispatch(fetchSystemMetrics())
        ]);
        
        console.log("Initial data loaded successfully");
      } catch (error) {
        console.error("Error loading initial data:", error);
        dispatch(setAlertMessage({
          type: 'error',
          message: 'Failed to load initial data. Please try refreshing the page.'
        }));
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();

    // Set up refresh intervals if auto-refresh is enabled
    if (config.FEATURES.AUTO_REFRESH) {
      // Refresh metrics more frequently than topics
      const metricsInterval = setInterval(() => {
        dispatch(fetchSystemMetrics());
      }, refreshInterval * 1000); 

      const topicsInterval = setInterval(() => {
        dispatch(fetchTopics());
      }, refreshInterval * 2000); 
      
      return () => {
        clearInterval(metricsInterval);
        clearInterval(topicsInterval);
      };
    }
  }, [dispatch, refreshInterval]);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading MicroQueue Mini...
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Main layout routes */}
        <Route path="/" element={<MainLayout />}>
          {routes.map((route) => {
            if (route.layout === 'main' || !route.layout) {
              return (
                <Route 
                  key={route.path}
                  path={route.path}
                  element={route.component}
                />
              );
            }
            return null;
          })}
        </Route>

        {/* Auth layout routes */}
        <Route path="/" element={<AuthLayout />}>
          {routes.map((route) => {
            if (route.layout === 'auth') {
              return (
                <Route 
                  key={route.path}
                  path={route.path}
                  element={route.component}
                />
              );
            }
            return null;
          })}
        </Route>

        {/* Minimal layout routes */}
        <Route path="/" element={<MinimalLayout />}>
          {routes.map((route) => {
            if (route.layout === 'minimal') {
              return (
                <Route 
                  key={route.path}
                  path={route.path}
                  element={route.component}
                />
              );
            }
            return null;
          })}
        </Route>
      </Routes>
      
      {/* Development Tools */}
      {config.IS_DEV && <MockDataToggle />}
    </ThemeProvider>
  );
}

export default App;
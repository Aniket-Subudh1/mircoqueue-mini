import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { theme } from '@/theme';
import routes from './routes';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import MinimalLayout from '@/layouts/MinimalLayout';
import { fetchTopics } from '@/store/slices/topicsSlice';
import { fetchSystemMetrics } from '@/store/slices/metricsSlice';

function App() {
  const dispatch = useAppDispatch();
  const { refreshInterval } = useAppSelector((state) => state.ui);

  useEffect(() => {
    // Initial data fetching
    dispatch(fetchTopics());
    dispatch(fetchSystemMetrics());

   
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
  }, [dispatch, refreshInterval]);

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
    </ThemeProvider>
  );
}

export default App;
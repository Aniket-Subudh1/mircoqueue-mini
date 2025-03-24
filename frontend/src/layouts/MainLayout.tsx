import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme, Stack, Alert, Snackbar } from '@mui/material';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { clearAlertMessage } from '@/store/slices/uiSlice';

const MainLayout = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const alertMessage = useAppSelector((state) => state.ui.alertMessage);
  
  // Get the sidebar state from Redux
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  
  // For mobile, we need a local state to handle the drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleCloseAlert = () => {
    dispatch(clearAlertMessage());
  };
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header 
        onToggleSidebar={handleDrawerToggle} 
        isMobile={isMobile}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isMobile={isMobile} 
        open={isMobile ? mobileOpen : sidebarOpen} 
        onClose={handleDrawerToggle} 
      />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? 240 : 72}px)` },
          ml: { sm: `${sidebarOpen ? 240 : 72}px` },
          mt: '64px', // Header height
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Stack sx={{ flex: 1 }}>
          <Outlet />
        </Stack>
        
        <Footer />
        
        {/* Alert Snackbar */}
        <Snackbar
          open={Boolean(alertMessage.message)}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {alertMessage.type && alertMessage.message ? (
            <Alert 
              onClose={handleCloseAlert} 
              severity={alertMessage.type} 
              sx={{ width: '100%' }}
            >
              {alertMessage.message}
            </Alert>
          ) : <div />}
        </Snackbar>
      </Box>
    </Box>
  );
};

export default MainLayout;
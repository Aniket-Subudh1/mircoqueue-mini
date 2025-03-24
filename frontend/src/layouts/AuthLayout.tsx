import { Outlet } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';


/**
 * AuthLayout provides a simplified layout for authentication pages
 * like login, register, forgot password, etc.
 */
const AuthLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Container 
        component="main" 
        maxWidth="sm" 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 4,
          }}
        >
          <img src={""} alt="MicroQueue Logo" style={{ width: 80, height: 80 }} />
          <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
            MicroQueue Mini
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lightweight Message Queue System
          </Typography>
        </Box>
        
        <Paper
          elevation={2}
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Outlet />
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} MicroQueue Mini. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default AuthLayout;
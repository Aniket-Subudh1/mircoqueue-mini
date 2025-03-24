import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const MinimalLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MinimalLayout;
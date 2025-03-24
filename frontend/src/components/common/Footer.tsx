import { Box, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        textAlign: 'center',
      }}
    >
      <Divider sx={{ mb: 2 }} />
      <Typography variant="body2" color="text.secondary">
        MicroQueue Mini v1.0.0 - A Lightweight Message Queue System
      </Typography>
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} - All rights reserved
      </Typography>
    </Box>
  );
};

export default Footer;
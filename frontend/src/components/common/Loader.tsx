import { CircularProgress, Box, Typography } from '@mui/material';

interface LoaderProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

const Loader = ({ 
  size = 40, 
  text = 'Loading...', 
  fullScreen = false 
}: LoaderProps) => {
  const loader = (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <CircularProgress size={size} />
      {text && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box 
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999,
        }}
      >
        {loader}
      </Box>
    );
  }

  return loader;
};

export default Loader;
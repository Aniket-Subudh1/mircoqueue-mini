// frontend/src/components/development/MockDataToggle.tsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Switch, 
  FormControlLabel, 
  Typography, 
  Paper, 
  Tooltip, 
  IconButton,
  Collapse
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { isMockDataEnabled, toggleMockData } from '@/services/serviceFactory';
import config from '@/utils/env';

const MockDataToggle = () => {
  const [useMockData, setUseMockData] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  // Check initial state
  useEffect(() => {
    setUseMockData(isMockDataEnabled());
  }, []);

  // Handle toggle change
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setUseMockData(newValue);
    toggleMockData(newValue);
  };

  // Only show in development mode
  if (!config.IS_DEV || !config.FEATURES.MOCK_DATA_TOGGLE) {
    return null;
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        p: 2, 
        zIndex: 1000,
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(4px)',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControlLabel
          control={
            <Switch
              checked={useMockData}
              onChange={handleToggle}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" fontWeight={500}>
              Use Mock Data
            </Typography>
          }
        />
        <Tooltip title="Toggle info">
          <IconButton size="small" onClick={() => setInfoVisible(!infoVisible)}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={infoVisible}>
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            This toggle is only visible in development mode. When enabled, the application
            will use mock data instead of making real API calls. This is useful for development
            and testing when the backend is not available.
          </Typography>
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
            Note: The page will reload when toggling this setting.
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MockDataToggle;
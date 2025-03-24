import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Button,
  Slider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Alert
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SaveIcon from '@mui/icons-material/Save';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setDarkMode, setRefreshInterval } from '@/store/slices/uiSlice';

const Settings = () => {
  const dispatch = useAppDispatch();
  const { darkMode, refreshInterval } = useAppSelector((state) => state.ui);
  
  // Local state
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  
  // Handle dark mode toggle
  const handleDarkModeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDarkMode(event.target.checked));
  };
  
  // Handle refresh interval change
  const handleRefreshIntervalChange = (_event: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      dispatch(setRefreshInterval(value));
    }
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    setSavedMessage('Settings saved successfully');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSavedMessage(null);
    }, 3000);
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure application preferences
        </Typography>
      </Box>
      
      {savedMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {savedMessage}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Appearance" />
            <Divider />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={darkMode} 
                      onChange={handleDarkModeToggle} 
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  Use dark theme for the application
                </Typography>
              </FormGroup>
              
              <Box sx={{ mt: 4 }}>
                <Typography gutterBottom>
                  Font Size
                </Typography>
                <Slider
                  defaultValue={16}
                  step={1}
                  marks
                  min={12}
                  max={20}
                  valueLabelDisplay="auto"
                  disabled
                />
                <Typography variant="caption" color="text.secondary">
                  This feature is coming soon
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Data Refresh" />
            <Divider />
            <CardContent>
              <Typography gutterBottom>
                Refresh Interval (seconds)
              </Typography>
              <Slider
                value={refreshInterval}
                onChange={handleRefreshIntervalChange}
                step={5}
                marks={[
                  { value: 5, label: '5s' },
                  { value: 30, label: '30s' },
                  { value: 60, label: '1m' },
                  { value: 300, label: '5m' },
                ]}
                min={5}
                max={300}
                valueLabelDisplay="auto"
              />
              <Typography variant="caption" color="text.secondary">
                How frequently the dashboard data should refresh
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <FormGroup>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Auto-refresh Dashboard"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Auto-refresh Topic Metrics"
                  />
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Auto-refresh Messages"
                  />
                </FormGroup>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Notifications" />
            <Divider />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Show Success Notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Show Error Notifications"
                />
                <FormControlLabel
                  control={<Switch color="primary" />}
                  label="Show Info Notifications"
                />
              </FormGroup>
              
              <Box sx={{ mt: 4 }}>
                <Typography gutterBottom>
                  Notification Duration (seconds)
                </Typography>
                <Slider
                  defaultValue={6}
                  step={1}
                  marks={[
                    { value: 3, label: '3s' },
                    { value: 6, label: '6s' },
                    { value: 9, label: '9s' },
                  ]}
                  min={3}
                  max={9}
                  valueLabelDisplay="auto"
                />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardHeader title="System Information" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Application Version
                  </Typography>
                  <Typography variant="body1">
                    1.0.0
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    API Version
                  </Typography>
                  <Typography variant="body1">
                    1.0.0
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Environment
                  </Typography>
                  <Typography variant="body1">
                    Development
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Build Date
                  </Typography>
                  <Typography variant="body1">
                    March 24, 2025
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              sx={{ mr: 2 }}
            >
              Save Settings
            </Button>
            <Button variant="outlined">
              Reset to Defaults
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;
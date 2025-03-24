import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchSystemMetrics } from '@/store/slices/metricsSlice';
import MetricsChart from './MetricsChart';
import MetricsCard from './MetricsCard';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import TopicIcon from '@mui/icons-material/AccountTree';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import StorageIcon from '@mui/icons-material/Storage';
import PublishIcon from '@mui/icons-material/Publish';
import DownloadIcon from '@mui/icons-material/Download';

interface SystemMetricsProps {
  showRefresh?: boolean;
}

const SystemMetrics = ({ showRefresh = true }: SystemMetricsProps) => {
  const dispatch = useAppDispatch();
  
  // Time range selection
  const [timeRange, setTimeRange] = useState('1h');
  
  // Get data from Redux store
  const { 
    system: systemMetrics, 
    loading: metricsLoading,
    historicalData
  } = useAppSelector((state) => state.metrics);
  
  // Fetch metrics on mount
  useEffect(() => {
    dispatch(fetchSystemMetrics());
  }, [dispatch]);
  
  // Format bytes
  const formatBytes = (bytes: number | undefined) => {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchSystemMetrics());
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };
  
  if (metricsLoading && !systemMetrics) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Loader text="Loading system metrics..." />
      </Box>
    );
  }
  
  if (!systemMetrics) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No metrics data available
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ mt: 2 }}
        >
          Refresh Metrics
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header with controls */}
      {showRefresh && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">System Metrics</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Time Range"
              >
                <MenuItem value="1h">Last hour</MenuItem>
                <MenuItem value="3h">Last 3 hours</MenuItem>
                <MenuItem value="24h">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Topics"
            value={systemMetrics.totalTopics}
            icon={<TopicIcon />}
            loading={metricsLoading}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Messages"
            value={systemMetrics.totalMessages}
            icon={<MessageIcon />}
            loading={metricsLoading}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Consumer Groups"
            value={systemMetrics.totalConsumerGroups}
            icon={<GroupIcon />}
            loading={metricsLoading}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Storage Used"
            value={formatBytes(systemMetrics.storageUsed)}
            icon={<StorageIcon />}
            loading={metricsLoading}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Publish Rate"
            value={`${systemMetrics.averagePublishRate.toFixed(2)}/min`}
            icon={<PublishIcon />}
            loading={metricsLoading}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Consume Rate"
            value={`${systemMetrics.averageConsumeRate.toFixed(2)}/min`}
            icon={<DownloadIcon />}
            loading={metricsLoading}
            color="error"
          />
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MetricsChart
            title="Message Count"
            data={historicalData.messageCount}
            color="#4caf50"
            loading={metricsLoading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MetricsChart
            title="Publish Rate (messages/min)"
            data={historicalData.publishRates}
            color="#2196f3"
            loading={metricsLoading}
            valueUnit="msg/min"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MetricsChart
            title="Consume Rate (messages/min)"
            data={historicalData.consumeRates}
            color="#ff9800"
            loading={metricsLoading}
            valueUnit="msg/min"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MetricsChart
            title="Storage Used"
            data={historicalData.storageUsed}
            color="#9c27b0"
            loading={metricsLoading}
            valueUnit="bytes"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemMetrics;
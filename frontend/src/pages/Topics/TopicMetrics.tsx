import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchTopicMetrics } from '@/store/slices/metricsSlice';
import Loader from '@/components/common/Loader';
import MetricsChart from '@/components/dashboard/MetricsChart';
import Card from '@/components/common/Card';

interface TopicMetricsProps {
  topicId: string;
}

const TopicMetrics = ({ topicId }: TopicMetricsProps) => {
  const dispatch = useAppDispatch();
  
  // Time range selection
  const [timeRange, setTimeRange] = useState('1h');

  // Get data from Redux store
  const { 
    topicMetrics,
    loading: metricsLoading,
    historicalData
  } = useAppSelector((state) => state.metrics);
  
  // Find the metrics for this topic
  const metrics = topicMetrics.find(m => m.topicId === topicId);
  
  // Create mock historical data for the topic based on global metrics
  // In a real app, you'd have topic-specific historical data
  const [topicHistoricalData, setTopicHistoricalData] = useState({
    publishRates: [] as { timestamp: number; value: number }[],
    consumeRates: [] as { timestamp: number; value: number }[],
    messageCount: [] as { timestamp: number; value: number }[],
  });
  
  // Fetch metrics
  useEffect(() => {
    if (topicId) {
      dispatch(fetchTopicMetrics(topicId));
      
      // Simulate historical data
      if (historicalData.publishRates.length > 0) {
        // Create topic-specific historical data based on global metrics
        // but with some random variation
        const getRandomFactor = () => 0.5 + Math.random();
        
        setTopicHistoricalData({
          publishRates: historicalData.publishRates.map(item => ({
            timestamp: item.timestamp,
            value: item.value * getRandomFactor() * 0.5,
          })),
          consumeRates: historicalData.consumeRates.map(item => ({
            timestamp: item.timestamp,
            value: item.value * getRandomFactor() * 0.4,
          })),
          messageCount: historicalData.messageCount.map(item => ({
            timestamp: item.timestamp,
            value: Math.round(item.value * getRandomFactor() * 0.2),
          })),
        });
      }
    }
  }, [dispatch, topicId, historicalData]);
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Format bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Handle refresh metrics
  const handleRefreshMetrics = () => {
    if (topicId) {
      dispatch(fetchTopicMetrics(topicId));
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };
  
  if (metricsLoading && !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Loader text="Loading metrics..." />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header with controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Topic Metrics</Typography>
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
            onClick={handleRefreshMetrics}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Metrics Summary */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>Summary</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Message Count</Typography>
            <Typography variant="h6">{metrics?.messageCount || 0}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Publish Rate</Typography>
            <Typography variant="h6">{metrics ? `${metrics.publishRate.toFixed(2)}/min` : '0/min'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Consume Rate</Typography>
            <Typography variant="h6">{metrics ? `${metrics.consumeRate.toFixed(2)}/min` : '0/min'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Avg Message Size</Typography>
            <Typography variant="h6">{metrics ? formatBytes(metrics.averageMessageSize) : '0 B'}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Metrics Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MetricsChart
            title="Message Publishing Rate"
            subtitle="Messages per minute"
            data={topicHistoricalData.publishRates}
            color="#2e7d32"
            loading={metricsLoading}
            valueUnit="msg/min"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MetricsChart
            title="Message Consumption Rate"
            subtitle="Messages per minute"
            data={topicHistoricalData.consumeRates}
            color="#0288d1"
            loading={metricsLoading}
            valueUnit="msg/min"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MetricsChart
            title="Message Count Over Time"
            subtitle="Total messages in topic"
            data={topicHistoricalData.messageCount}
            color="#f57c00"
            loading={metricsLoading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Card title="Time Information">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">First Message</Typography>
                <Typography variant="body1">
                  {metrics && metrics.oldestMessage ? formatDate(metrics.oldestMessage) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Latest Message</Typography>
                <Typography variant="body1">
                  {metrics && metrics.newestMessage ? formatDate(metrics.newestMessage) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Time Span</Typography>
                <Typography variant="body1">
                  {metrics && metrics.oldestMessage && metrics.newestMessage
                    ? `${Math.round((metrics.newestMessage - metrics.oldestMessage) / (60 * 60 * 1000) * 10) / 10} hours`
                    : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TopicMetrics;
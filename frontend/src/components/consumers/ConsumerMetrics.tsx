import {
    Box,
    Typography,
    Grid,
    Paper,
    Chip,
    Divider,
  } from '@mui/material';
  import { ConsumerGroup } from '@/types/consumer';
  import { TopicMetrics } from '@/types/metrics';
  import Card from '@/components/common/Card';
  import MetricsChart from '@/components/dashboard/MetricsChart';
  
  interface ConsumerMetricsProps {
    consumerGroup: ConsumerGroup;
    topicMetrics?: TopicMetrics;
  }
  
  const ConsumerMetrics = ({ consumerGroup, topicMetrics }: ConsumerMetricsProps) => {
    // Format date
    const formatDate = (timestamp: number | undefined) => {
      if (!timestamp) return 'Never';
      
      return new Date(timestamp).toLocaleString();
    };
    
    // Calculate lag (theoretical based on metrics since we don't have real lag data)
    const calculateLag = () => {
      if (!topicMetrics || !consumerGroup.lastConsumedTimestamp) {
        return 'Unknown';
      }
      
      // Simple estimation: if we have topic metrics with message count
      // and we're assuming the consumer is processing messages at consume rate
      const messageBacklog = topicMetrics.messageCount - 
        (topicMetrics.consumeRate * 5); // Assuming 5 minutes of processing at current rate
      
      return messageBacklog > 0 ? messageBacklog : 0;
    };
    
    // Create mock/sample consumer metrics data for visualization
    const createSampleMetrics = () => {
      const now = Date.now();
      const hours = 10; // Last 10 hours
      const mockData = [];
      
      // Starting values
      let consumeRate = 10; // messages per minute
      
      for (let i = 0; i < hours; i++) {
        // Add some random variation
        const variation = (Math.random() - 0.5) * 5;
        consumeRate = Math.max(1, consumeRate + variation);
        
        mockData.push({
          timestamp: now - (hours - i) * 60 * 60 * 1000,
          value: consumeRate,
        });
      }
      
      return mockData;
    };
    
    const mockConsumeRateData = createSampleMetrics();
    
    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <Typography variant="h6" gutterBottom>Consumer Group Details</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Group ID</Typography>
                  <Typography variant="body1" sx={{ mb: 2, wordBreak: 'break-all' }}>
                    {consumerGroup.groupId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Topic ID</Typography>
                  <Typography variant="body1" sx={{ mb: 2, wordBreak: 'break-all' }}>
                    {consumerGroup.topicId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(consumerGroup.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Last Activity</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(consumerGroup.lastConsumedTimestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={consumerGroup.lastConsumedTimestamp ? "Active" : "Inactive"} 
                      color={consumerGroup.lastConsumedTimestamp ? "success" : "default"} 
                    />
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <Typography variant="h6" gutterBottom>Consumption Metrics</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="secondary">
                      {topicMetrics ? topicMetrics.consumeRate.toFixed(1) : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Messages/min
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="warning.main">
                      {calculateLag()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Lag
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Processing Status
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: consumerGroup.lastConsumedTimestamp ? 'success.light' : 'warning.light',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.primary">
                      {consumerGroup.lastConsumedTimestamp
                        ? 'Consumer group is actively processing messages'
                        : 'Consumer group is inactive or has never consumed any messages'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <MetricsChart
              title="Consumption Rate Over Time"
              subtitle="Messages per minute"
              data={mockConsumeRateData}
              color="#673ab7"
              timeFormat="hour"
              valueUnit="msg/min"
            />
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  export default ConsumerMetrics;
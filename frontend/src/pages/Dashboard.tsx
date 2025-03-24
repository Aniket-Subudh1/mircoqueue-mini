import { useEffect } from 'react';
import { Box, Grid, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TopicIcon from '@mui/icons-material/AccountTree';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import PublishIcon from '@mui/icons-material/Publish';
import DownloadIcon from '@mui/icons-material/Download';
import MetricsCard from '@/components/dashboard/MetricsCard';
import MetricsChart from '@/components/dashboard/MetricsChart';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import TopicsList from '@/components/dashboard/TopicsList';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchTopics } from '@/store/slices/topicsSlice';
import { fetchSystemMetrics } from '@/store/slices/metricsSlice';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Get data from Redux store
  const { topics, loading: topicsLoading } = useAppSelector((state) => state.topics);
  const { 
    system: systemMetrics, 
    topicMetrics,
    loading: metricsLoading,
    historicalData
  } = useAppSelector((state) => state.metrics);
  
  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchTopics());
    dispatch(fetchSystemMetrics());
  }, [dispatch]);
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your MicroQueue system
        </Typography>
      </Box>
      
      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Topics"
            value={systemMetrics?.totalTopics || 0}
            icon={<TopicIcon />}
            loading={metricsLoading}
            color="primary"
            onClick={() => navigate('/topics')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Messages"
            value={systemMetrics?.totalMessages || 0}
            icon={<MessageIcon />}
            loading={metricsLoading}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Consumer Groups"
            value={systemMetrics?.totalConsumerGroups || 0}
            icon={<GroupIcon />}
            loading={metricsLoading}
            color="info"
            onClick={() => navigate('/consumer-groups')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Storage Used"
            value={systemMetrics ? formatBytes(systemMetrics.storageUsed) : '0 B'}
            icon={<StorageIcon />}
            loading={metricsLoading}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Publish Rate"
            value={`${systemMetrics?.averagePublishRate.toFixed(2) || 0}/min`}
            icon={<PublishIcon />}
            loading={metricsLoading}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Consume Rate"
            value={`${systemMetrics?.averageConsumeRate.toFixed(2) || 0}/min`}
            icon={<DownloadIcon />}
            loading={metricsLoading}
            color="error"
          />
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
      </Grid>
      
      {/* Topics List and Activity Feed */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <TopicsList 
            topics={topics} 
            topicMetrics={topicMetrics}
            loading={topicsLoading || metricsLoading}
            onViewTopic={(topicId) => navigate(`/topics/${topicId}`)}
            onPublish={(topicId) => navigate(`/publish/${topicId}`)}
            onConsume={(topicId) => navigate(`/consume/${topicId}`)}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <ActivityFeed
            topics={topics.slice(0, 5)}
            loading={topicsLoading || metricsLoading}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
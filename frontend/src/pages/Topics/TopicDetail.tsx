import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Tabs, 
  Tab, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublishIcon from '@mui/icons-material/Publish';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import MessageIcon from '@mui/icons-material/Message';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchTopic, deleteTopic } from '@/store/slices/topicsSlice';
import { fetchTopicMetrics } from '@/store/slices/metricsSlice';
import { fetchConsumerGroups } from '@/store/slices/consumersSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import MetricsCard from '@/components/dashboard/MetricsCard';
import TopicMetrics from './TopicMetrics';
import TopicMessages from '@/components/topics/TopicMessages';
import TopicConsumers from '@/components/topics/TopicConsumers';
import Loader from '@/components/common/Loader';

// Tab panel interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`topic-tabpanel-${index}`}
      aria-labelledby={`topic-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>{children}</Box>
      )}
    </div>
  );
}

// Convert tab index to ID
function a11yProps(index: number) {
  return {
    id: `topic-tab-${index}`,
    'aria-controls': `topic-tabpanel-${index}`,
  };
}

const TopicDetail = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Get data from Redux store
  const { currentTopic, loading: topicLoading } = useAppSelector((state) => state.topics);
  const { topicMetrics, loading: metricsLoading } = useAppSelector((state) => state.metrics);
  const { consumerGroups, loading: consumersLoading } = useAppSelector(
    (state) => state.consumers
  );
  
  // Find the metrics for this topic
  const metrics = topicMetrics.find((m) => m.topicId === topicId);
  
  // Fetch data when component mounts
  useEffect(() => {
    if (topicId) {
      dispatch(fetchTopic(topicId));
      dispatch(fetchTopicMetrics(topicId));
      dispatch(fetchConsumerGroups(topicId));
    }
  }, [dispatch, topicId]);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Format date
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
  
  // Handle delete dialog
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  // Handle delete topic
  const handleDeleteTopic = async () => {
    if (!currentTopic) return;
    
    try {
      await dispatch(deleteTopic(currentTopic.topicId));
      dispatch(setAlertMessage({
        type: 'success',
        message: `Topic "${currentTopic.name}" deleted successfully`,
      }));
      navigate('/topics');
    } catch (error) {
      console.error('Failed to delete topic:', error);
      dispatch(setAlertMessage({
        type: 'error',
        message: 'Failed to delete topic',
      }));
    }
  };
  
  // Loading state
  if (topicLoading && !currentTopic) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Loader text="Loading topic..." />
        </Box>
      </Container>
    );
  }
  
  // Topic not found
  if (!currentTopic && !topicLoading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            Topic not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/topics')}
            sx={{ mt: 2 }}
          >
            Back to Topics
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton onClick={() => navigate('/topics')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {currentTopic?.name}
          </Typography>
        </Box>
        
        {currentTopic?.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {currentTopic.description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={`Created: ${formatDate(currentTopic?.createdAt)}`}
            variant="outlined"
          />
          <Chip
            label={`Retention: ${currentTopic?.retentionPeriodHours} hours`}
            variant="outlined"
          />
          <Chip
            label={`Messages: ${currentTopic?.messageCount}`}
            color="primary"
            variant="outlined"
          />
          {currentTopic?.lastMessageTimestamp && (
            <Chip
              label={`Last Message: ${formatDate(currentTopic.lastMessageTimestamp)}`}
              variant="outlined"
            />
          )}
        </Box>
        
        {/* Action buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={() => navigate(`/publish/${topicId}`)}
          >
            Publish Messages
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => navigate(`/consume/${topicId}`)}
          >
            Consume Messages
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteDialog}
          >
            Delete Topic
          </Button>
        </Box>
      </Box>
      
      {/* Metrics cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Message Count"
            value={currentTopic?.messageCount || 0}
            icon={<MessageIcon />}
            loading={metricsLoading}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Publish Rate"
            value={`${metrics?.publishRate.toFixed(2) || 0}/min`}
            icon={<PublishIcon />}
            loading={metricsLoading}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Consumer Groups"
            value={consumerGroups.length}
            icon={<GroupIcon />}
            loading={consumersLoading}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Average Message Size"
            value={metrics ? formatBytes(metrics.averageMessageSize) : '0 B'}
            icon={<BarChartIcon />}
            loading={metricsLoading}
            color="success"
          />
        </Grid>
      </Grid>
      
      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="topic tabs"
          variant="fullWidth"
        >
          <Tab label="Messages" icon={<MessageIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Metrics" icon={<BarChartIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Consumer Groups" icon={<GroupIcon />} iconPosition="start" {...a11yProps(2)} />
        </Tabs>
        
        <Divider />
        
        <TabPanel value={tabValue} index={0}>
          <TopicMessages topicId={topicId || ''} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <TopicMetrics topicId={topicId || ''} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <TopicConsumers topicId={topicId || ''} />
        </TabPanel>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Topic</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the topic "{currentTopic?.name}"? This action cannot be undone.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}>
            Deleting this topic will permanently remove all of its messages.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteTopic} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TopicDetail;
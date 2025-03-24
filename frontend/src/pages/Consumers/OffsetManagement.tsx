import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchTopics } from '@/store/slices/topicsSlice';
import { 
  fetchConsumerGroups, 
  resetConsumerGroupOffset,
} from '@/store/slices/consumersSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import Loader from '@/components/common/Loader';
import Card from '@/components/common/Card';

const OffsetManagement = () => {
  const dispatch = useAppDispatch();
  
  // Local state
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [consumerToReset, setConsumerToReset] = useState<{
    groupId: string;
    topicId: string;
    name: string;
  } | null>(null);
  
  // Get data from Redux store
  const { topics, loading: topicsLoading } = useAppSelector((state) => state.topics);
  const { 
    consumerGroups, 
    loading: consumersLoading,
  } = useAppSelector((state) => state.consumers);
  
  // Fetch topics when component mounts
  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);
  
  // Fetch consumer groups when selected topic changes
  useEffect(() => {
    if (selectedTopicId) {
      dispatch(fetchConsumerGroups(selectedTopicId));
    }
  }, [dispatch, selectedTopicId]);
  
  // Set selected topic when topics are loaded
  useEffect(() => {
    if (topics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topics[0].topicId);
    }
  }, [topics, selectedTopicId]);
  
  // Format date
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never';
    
    return new Date(timestamp).toLocaleString();
  };
  
  // Calculate time since last activity
  const getTimeSince = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    // If less than a minute, show seconds
    if (diff < 60 * 1000) {
      const seconds = Math.floor(diff / 1000);
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
    
    // If less than an hour, show minutes
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // If less than a day, show hours
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise, show days
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };
  
  // Handle topic change
  const handleTopicChange = (event: any) => {
    setSelectedTopicId(event.target.value);
  };
  
  // Handle reset dialog
  const handleOpenResetDialog = (groupId: string, topicId: string, name: string) => {
    setConsumerToReset({
      groupId,
      topicId,
      name,
    });
    setOpenResetDialog(true);
  };
  
  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setConsumerToReset(null);
  };
  
  // Handle reset consumer group offset
  const handleResetOffset = async () => {
    if (!consumerToReset) return;
    
    try {
      await dispatch(resetConsumerGroupOffset({
        groupId: consumerToReset.groupId,
        topicId: consumerToReset.topicId,
      }));
      
      handleCloseResetDialog();
      dispatch(setAlertMessage({
        type: 'success',
        message: `Offset for consumer group "${consumerToReset.name}" reset successfully`,
      }));
    } catch (error) {
      console.error('Failed to reset consumer group offset:', error);
      dispatch(setAlertMessage({
        type: 'error',
        message: 'Failed to reset consumer group offset',
      }));
    }
  };
  
  // Get current topic name
  const currentTopic = topics.find(topic => topic.topicId === selectedTopicId);
  
  // Filter consumer groups for selected topic
  const filteredConsumerGroups = consumerGroups.filter(
    group => group.topicId === selectedTopicId
  );
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Offset Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage consumer group offsets for message consumption
        </Typography>
      </Box>
      
      {/* Topic selection */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Topic</InputLabel>
              <Select
                value={selectedTopicId}
                onChange={handleTopicChange}
                label="Topic"
                disabled={topicsLoading || topics.length === 0}
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.topicId} value={topic.topicId}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* Information card */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          Consumer offsets track the position of a consumer group in a topic's message stream.
          Resetting an offset will cause the consumer group to start consuming from the beginning of the topic.
        </Typography>
      </Alert>
      
      {/* Consumer groups table */}
      <Card>
        {consumersLoading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <Loader text="Loading consumer groups..." />
          </Box>
        ) : filteredConsumerGroups.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {currentTopic 
                ? `No consumer groups found for topic "${currentTopic.name}"`
                : 'No consumer groups found'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Consumer Group</TableCell>
                  <TableCell>Last Consumed</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Current Offset</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConsumerGroups.map((group) => (
                  <TableRow key={group.groupId}>
                    <TableCell>
                      <Typography variant="body1">{group.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {group.groupId}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(group.lastConsumedTimestamp)}</TableCell>
                    <TableCell>
                      {group.lastConsumedTimestamp 
                        ? getTimeSince(group.lastConsumedTimestamp)
                        : 'Never consumed'}
                    </TableCell>
                    <TableCell>
                      {/* In a real app, we would display the actual offset value here */}
                      {group.lastConsumedTimestamp 
                        ? 'Active'
                        : 'Not started'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Reset Offset">
                        <IconButton
                          color="warning"
                          onClick={() => handleOpenResetDialog(group.groupId, group.topicId, group.name)}
                        >
                          <RestartAltIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
      
      {/* Reset Offset Confirmation Dialog */}
      <Dialog
        open={openResetDialog}
        onClose={handleCloseResetDialog}
      >
        <DialogTitle>Reset Consumer Group Offset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the offset for consumer group "{consumerToReset?.name}"?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold', color: 'warning.main' }}>
            This will reset the consumer group to start consuming from the beginning of the topic.
            Any messages that were already consumed will be consumed again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>Cancel</Button>
          <Button onClick={handleResetOffset} color="warning" variant="contained">
            Reset Offset
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OffsetManagement;
import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { consumeMessages, clearMessages } from '@/store/slices/messagesSlice';
import { 
  fetchConsumerGroups,
  resetConsumerGroupOffset,
} from '@/store/slices/consumersSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import { ConsumeMessagesRequest } from '@/types/message';
import { Topic } from '@/types/topic';
import Loader from '@/components/common/Loader';

// Parse payload based on content type
const parsePayload = (payload: string, contentType: string) => {
  if (contentType.includes('json')) {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch (e) {
      return payload;
    }
  }
  return payload;
};

// Format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

interface MessageConsumerProps {
  topic: Topic;
}

const MessageConsumer = ({ topic }: MessageConsumerProps) => {
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const { messages, consumeLoading, consumeError } = useAppSelector((state) => state.messages);
  const { consumerGroups, loading: consumersLoading } = useAppSelector((state) => state.consumers);
  
  // Local state
  const [selectedConsumerGroupId, setSelectedConsumerGroupId] = useState<string>('');
  const [maxMessages, setMaxMessages] = useState<number>(10);
  const [waitTime, setWaitTime] = useState<number>(0);
  
  // Fetch consumer groups for this topic on mount
  useEffect(() => {
    dispatch(fetchConsumerGroups(topic.topicId));
  }, [dispatch, topic.topicId]);
  
  // Set selected consumer group when groups are loaded
  useEffect(() => {
    if (consumerGroups.length > 0 && !selectedConsumerGroupId) {
      // Filter consumer groups for this topic
      const topicConsumerGroups = consumerGroups.filter(
        group => group.topicId === topic.topicId
      );
      
      if (topicConsumerGroups.length > 0) {
        setSelectedConsumerGroupId(topicConsumerGroups[0].groupId);
      }
    }
  }, [consumerGroups, selectedConsumerGroupId, topic.topicId]);
  
  // Handle consumer group change
  const handleConsumerGroupChange = (event: any) => {
    setSelectedConsumerGroupId(event.target.value);
  };
  
  // Handle max messages change
  const handleMaxMessagesChange = (event: any) => {
    setMaxMessages(parseInt(event.target.value, 10));
  };
  
  // Handle wait time change
  const handleWaitTimeChange = (event: any) => {
    setWaitTime(parseInt(event.target.value, 10));
  };
  
  // Handle consume messages
  const handleConsumeMessages = () => {
    if (!selectedConsumerGroupId) return;
    
    const request: ConsumeMessagesRequest = {
      consumerGroupId: selectedConsumerGroupId,
      maxMessages,
      waitTimeSeconds: waitTime,
    };
    
    dispatch(consumeMessages({ topicId: topic.topicId, request }));
  };
  
  // Handle clear messages
  const handleClearMessages = () => {
    dispatch(clearMessages());
  };
  
  // Handle reset offset
  const handleResetOffset = async () => {
    if (!selectedConsumerGroupId) return;
    
    try {
      await dispatch(resetConsumerGroupOffset({
        groupId: selectedConsumerGroupId,
        topicId: topic.topicId,
      }));
      
      dispatch(setAlertMessage({
        type: 'success',
        message: 'Consumer group offset reset successfully',
      }));
      
      // Clear messages after reset
      dispatch(clearMessages());
    } catch (error) {
      console.error('Failed to reset consumer group offset:', error);
      dispatch(setAlertMessage({
        type: 'error',
        message: 'Failed to reset consumer group offset',
      }));
    }
  };
  
  // Get filtered consumer groups for this topic
  const topicConsumerGroups = consumerGroups.filter(
    group => group.topicId === topic.topicId
  );
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Consumer Options
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Consumer Group</InputLabel>
              <Select
                value={selectedConsumerGroupId}
                onChange={handleConsumerGroupChange}
                label="Consumer Group"
                disabled={topicConsumerGroups.length === 0 || consumersLoading}
              >
                {topicConsumerGroups.map((group) => (
                  <MenuItem key={group.groupId} value={group.groupId}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Max Messages</InputLabel>
              <Select
                value={maxMessages}
                onChange={handleMaxMessagesChange}
                label="Max Messages"
              >
                <MenuItem value={1}>1 message</MenuItem>
                <MenuItem value={5}>5 messages</MenuItem>
                <MenuItem value={10}>10 messages</MenuItem>
                <MenuItem value={25}>25 messages</MenuItem>
                <MenuItem value={50}>50 messages</MenuItem>
                <MenuItem value={100}>100 messages</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Wait Time</InputLabel>
              <Select
                value={waitTime}
                onChange={handleWaitTimeChange}
                label="Wait Time"
              >
                <MenuItem value={0}>No wait (poll)</MenuItem>
                <MenuItem value={1}>1 second</MenuItem>
                <MenuItem value={5}>5 seconds</MenuItem>
                <MenuItem value={10}>10 seconds</MenuItem>
                <MenuItem value={20}>20 seconds</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={consumeLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={handleConsumeMessages}
                disabled={!selectedConsumerGroupId || consumeLoading}
              >
                {consumeLoading ? 'Loading...' : 'Consume Messages'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleClearMessages}
                disabled={messages.length === 0}
                sx={{ mt: 1 }}
              >
                Clear Messages
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RestartAltIcon />}
                onClick={handleResetOffset}
                disabled={!selectedConsumerGroupId}
                sx={{ mt: 1 }}
              >
                Reset Offset
              </Button>
            </Box>
            
            {consumeError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {consumeError}
              </Alert>
            )}
            
            {topicConsumerGroups.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No consumer groups available for this topic. Create a consumer group first.
              </Alert>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Messages ({messages.length})
            </Typography>
            
            {consumeLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Loader text="Consuming messages..." />
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No messages consumed yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleConsumeMessages}
                  disabled={!selectedConsumerGroupId}
                  sx={{ mt: 2 }}
                >
                  Consume Messages
                </Button>
              </Box>
            ) : (
              <Box>
                {messages.map((message, index) => (
                  <Accordion key={message.messageId} defaultExpanded={index === 0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2">
                          Message ID: {message.messageId.substring(0, 8)}...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(message.timestamp)} - Sequence: {message.sequenceNumber}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Content Type:
                          </Typography>
                          <Chip label={message.contentType} size="small" />
                        </Box>
                        
                        {message.metadata && Object.keys(message.metadata).length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Metadata:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {Object.entries(message.metadata).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        <Typography variant="body2" color="text.secondary">
                          Payload:
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            mt: 1,
                            backgroundColor: 'grey.100',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            overflow: 'auto',
                            maxHeight: 300,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {parsePayload(message.payload, message.contentType)}
                        </Paper>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MessageConsumer;
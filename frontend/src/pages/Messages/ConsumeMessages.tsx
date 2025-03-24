import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  IconButton,
  Paper,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchTopic } from '@/store/slices/topicsSlice';
import { consumeMessages, clearMessages, clearMessageErrors } from '@/store/slices/messagesSlice';
import { 
  fetchConsumerGroups, 
  createConsumerGroup, 
  setCurrentConsumerGroup 
} from '@/store/slices/consumersSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import { ConsumeMessagesRequest } from '@/types/message';
import { CreateConsumerGroupRequest } from '@/types/consumer';
import Card from '@/components/common/Card';
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

const ConsumeMessages = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { currentTopic } = useAppSelector((state) => state.topics);
  const { 
    messages, 
    nextSequenceNumber,
    consumeLoading, 
    consumeError 
  } = useAppSelector((state) => state.messages);
  const { 
    consumerGroups, 
    currentConsumerGroup,
    loading: consumersLoading,
    createConsumerGroupLoading,
    createConsumerGroupError
  } = useAppSelector((state) => state.consumers);
  
  // Local state
  const [selectedConsumerGroupId, setSelectedConsumerGroupId] = useState<string>('');
  const [maxMessages, setMaxMessages] = useState<number>(10);
  const [waitTime, setWaitTime] = useState<number>(0);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newConsumerGroup, setNewConsumerGroup] = useState<CreateConsumerGroupRequest>({
    topicId: topicId || '',
    name: '',
    description: '',
  });
  
  // Form validation
  const [errors, setErrors] = useState({
    name: '',
  });
  
  // Fetch data when component mounts
  useEffect(() => {
    if (topicId) {
      dispatch(fetchTopic(topicId));
      dispatch(fetchConsumerGroups(topicId));
      
      // Clear messages from previous session
      dispatch(clearMessages());
    }
    
    // Clean up when unmounting
    return () => {
      dispatch(clearMessages());
      dispatch(clearMessageErrors());
    };
  }, [dispatch, topicId]);
  
  // Set selected consumer group when groups are loaded
  useEffect(() => {
    if (consumerGroups.length > 0 && !selectedConsumerGroupId) {
      setSelectedConsumerGroupId(consumerGroups[0].groupId);
      dispatch(setCurrentConsumerGroup(consumerGroups[0]));
    }
  }, [consumerGroups, selectedConsumerGroupId, dispatch]);
  
  // Handle consumer group change
  const handleConsumerGroupChange = (event: any) => {
    const groupId = event.target.value;
    setSelectedConsumerGroupId(groupId);
    
    // Find the selected group and set as current
    const selectedGroup = consumerGroups.find((group: { groupId: string; name: string }) => group.groupId === groupId);
    if (selectedGroup) {
      dispatch(setCurrentConsumerGroup(selectedGroup));
    }
  };
  
  // Handle max messages change
  const handleMaxMessagesChange = (event: any) => {
    setMaxMessages(parseInt(event.target.value, 10));
  };
  
  // Handle wait time change
  const handleWaitTimeChange = (event: any) => {
    setWaitTime(parseInt(event.target.value, 10));
  };
  
  // Handle input change for new consumer group
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewConsumerGroup({ ...newConsumerGroup, [name]: value });
    
    // Clear errors on input change
    if (name === 'name' && errors.name) {
      setErrors({ ...errors, name: '' });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const errors = { name: '' };
    
    if (!newConsumerGroup.name.trim()) {
      errors.name = 'Consumer group name is required';
      valid = false;
    } else if (newConsumerGroup.name.length > 100) {
      errors.name = 'Consumer group name cannot exceed 100 characters';
      valid = false;
    }
    
    setErrors(errors);
    return valid;
  };
  
  // Handle create consumer group
  const handleCreateConsumerGroup = async () => {
    if (!validateForm()) return;
    
    try {
      const resultAction = await dispatch(createConsumerGroup(newConsumerGroup));
      
      if (createConsumerGroup.fulfilled.match(resultAction)) {
        dispatch(setAlertMessage({
          type: 'success',
          message: `Consumer group "${newConsumerGroup.name}" created successfully`,
        }));
        
        // Close form and reset
        setShowCreateForm(false);
        setNewConsumerGroup({
          topicId: topicId || '',
          name: '',
          description: '',
        });
        
        // Select the newly created group
        setSelectedConsumerGroupId(resultAction.payload.groupId);
        dispatch(setCurrentConsumerGroup(resultAction.payload));
      }
    } catch (error) {
      console.error('Failed to create consumer group:', error);
    }
  };
  
  // Handle consume messages
  const handleConsumeMessages = async () => {
    if (!topicId || !selectedConsumerGroupId) return;
    
    const request: ConsumeMessagesRequest = {
      consumerGroupId: selectedConsumerGroupId,
      maxMessages,
      waitTimeSeconds: waitTime,
    };
    
    try {
      dispatch(consumeMessages({ topicId, request }));
    } catch (error) {
      console.error('Failed to consume messages:', error);
    }
  };
  
  // Handle clear messages
  const handleClearMessages = () => {
    dispatch(clearMessages());
  };
  
  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton 
            onClick={() => topicId ? navigate(`/topics/${topicId}`) : navigate('/topics')} 
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Consume Messages
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Consume messages from {currentTopic?.name || 'topic'}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card title="Consumer Options">
            {consumersLoading ? (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Loader text="Loading consumer groups..." />
              </Box>
            ) : (
              <>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Consumer Group</InputLabel>
                  <Select
                    value={selectedConsumerGroupId}
                    onChange={handleConsumerGroupChange}
                    label="Consumer Group"
                    disabled={consumerGroups.length === 0}
                  >
                    {consumerGroups.map((group: { groupId: string; name: string }) => (
                      <MenuItem key={group.groupId} value={group.groupId}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Create new consumer group button */}
                {!showCreateForm ? (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateForm(true)}
                    fullWidth
                    sx={{ mb: 3 }}
                  >
                    Create New Consumer Group
                  </Button>
                ) : (
                  <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Create New Consumer Group
                    </Typography>
                    <TextField
                      label="Group Name"
                      name="name"
                      value={newConsumerGroup.name}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      required
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                    <TextField
                      label="Description"
                      name="description"
                      value={newConsumerGroup.description}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={2}
                    />
                    
                    {createConsumerGroupError && (
                      <Alert severity="error" sx={{ my: 2 }}>
                        {createConsumerGroupError}
                      </Alert>
                    )}
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleCreateConsumerGroup}
                        disabled={createConsumerGroupLoading}
                      >
                        {createConsumerGroupLoading ? 'Creating...' : 'Create'}
                      </Button>
                    </Box>
                  </Paper>
                )}
                
                <Divider sx={{ my: 2 }} />
                
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
                
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleConsumeMessages}
                    disabled={consumeLoading || !selectedConsumerGroupId}
                    fullWidth
                  >
                    {consumeLoading ? 'Consuming...' : 'Consume Messages'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearMessages}
                    disabled={messages.length === 0}
                  >
                    Clear
                  </Button>
                </Stack>
                
                {consumeError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {consumeError}
                  </Alert>
                )}
                
                {/* Consumer group info */}
                {currentConsumerGroup && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Consumer Group Info
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Group ID" 
                          secondary={currentConsumerGroup.groupId} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Created" 
                          secondary={formatDate(currentConsumerGroup.createdAt)} 
                        />
                      </ListItem>
                      {currentConsumerGroup.lastConsumedTimestamp && (
                        <ListItem>
                          <ListItemText 
                            primary="Last Consumed" 
                            secondary={formatDate(currentConsumerGroup.lastConsumedTimestamp)}
                          />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemText 
                          primary="Next Sequence" 
                          secondary={nextSequenceNumber || 0} 
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}
              </>
            )}
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card title={`Messages (${messages.length})`}>
            {consumeLoading ? (
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <Loader text="Consuming messages..." />
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No messages consumed yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleConsumeMessages}
                  disabled={!selectedConsumerGroupId}
                  sx={{ mt: 2 }}
                >
                  Consume Messages
                </Button>
              </Box>
            ) : (
              <Box>
                {messages.map((message: { messageId: string; sequenceNumber: number; timestamp: number; contentType: string; metadata?: Record<string, string>; payload: string }, index: number) => (
                  <Accordion key={message.messageId} defaultExpanded={index === 0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="subtitle1">
                            Message ID: {message.messageId.substring(0, 8)}...
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Sequence: {message.sequenceNumber}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(message.timestamp)}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Content Type:
                          </Typography>
                          <Chip label={message.contentType} size="small" />
                        </Box>
                        
                        {message.metadata && Object.keys(message.metadata).length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Metadata:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Payload:
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            backgroundColor: 'grey.100',
                            fontFamily: 'monospace',
                            overflow: 'auto',
                            maxHeight: '400px',
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.875rem',
                          }}
                        >
                          {parsePayload(message.payload, message.contentType)}
                        </Paper>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearMessages}
                  >
                    Clear Messages
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={handleConsumeMessages}
                    disabled={consumeLoading || !selectedConsumerGroupId}
                  >
                    Consume More
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ConsumeMessages;
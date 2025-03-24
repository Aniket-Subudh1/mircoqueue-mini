import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { consumeMessages, clearMessages } from '@/store/slices/messagesSlice';
import { fetchConsumerGroups } from '@/store/slices/consumersSlice';
import { ConsumeMessagesRequest } from '@/types/message';
import Loader from '@/components/common/Loader';

interface TopicMessagesProps {
  topicId: string;
}

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

const TopicMessages = ({ topicId }: TopicMessagesProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Local state
  const [selectedConsumerGroupId, setSelectedConsumerGroupId] = useState<string>('');
  const [maxMessages, setMaxMessages] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  
  // Get data from Redux store
  const { messages, consumeLoading } = useAppSelector((state) => state.messages);
  const { consumerGroups, loading: consumersLoading } = useAppSelector((state) => state.consumers);
  
  // Fetch consumer groups on mount
  useEffect(() => {
    if (topicId) {
      dispatch(fetchConsumerGroups(topicId));
    }
  }, [dispatch, topicId]);
  
  // Set selected consumer group when groups are loaded
  useEffect(() => {
    if (consumerGroups.length > 0 && !selectedConsumerGroupId) {
      setSelectedConsumerGroupId(consumerGroups[0].groupId);
    }
  }, [consumerGroups, selectedConsumerGroupId]);
  
  // Handle consumer group change
  const handleConsumerGroupChange = (event: any) => {
    setSelectedConsumerGroupId(event.target.value);
  };
  
  // Handle max messages change
  const handleMaxMessagesChange = (event: any) => {
    setMaxMessages(event.target.value);
  };
  
  // Handle search term change
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle accordion expansion
  const handleAccordionChange = (messageId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedMessageId(isExpanded ? messageId : null);
  };
  
  // Handle consume messages
  const handleConsumeMessages = () => {
    if (!topicId || !selectedConsumerGroupId) return;
    
    const request: ConsumeMessagesRequest = {
      consumerGroupId: selectedConsumerGroupId,
      maxMessages,
      waitTimeSeconds: 0, // No wait for direct manual fetch
    };
    
    dispatch(consumeMessages({ topicId, request }));
  };
  
  // Handle clear messages
  const handleClearMessages = () => {
    dispatch(clearMessages());
  };
  
  // Filter messages based on search term
  const filteredMessages = messages.filter((message) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in payload
    if (message.payload.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in message ID
    if (message.messageId.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in metadata
    if (message.metadata) {
      for (const [key, value] of Object.entries(message.metadata)) {
        if (key.toLowerCase().includes(searchLower) || 
            value.toString().toLowerCase().includes(searchLower)) {
          return true;
        }
      }
    }
    
    return false;
  });
  
  // Check if we're in loading state
  const isLoading = consumeLoading || consumersLoading;
  
  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Consumer Group</InputLabel>
              <Select
                value={selectedConsumerGroupId}
                onChange={handleConsumerGroupChange}
                label="Consumer Group"
                disabled={consumerGroups.length === 0 || isLoading}
              >
                {consumerGroups.map((group) => (
                  <MenuItem key={group.groupId} value={group.groupId}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Max Messages</InputLabel>
              <Select
                value={maxMessages}
                onChange={handleMaxMessagesChange}
                label="Max Messages"
                disabled={isLoading}
              >
                <MenuItem value={5}>5 messages</MenuItem>
                <MenuItem value={10}>10 messages</MenuItem>
                <MenuItem value={25}>25 messages</MenuItem>
                <MenuItem value={50}>50 messages</MenuItem>
                <MenuItem value={100}>100 messages</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleConsumeMessages}
                disabled={!selectedConsumerGroupId || isLoading}
                startIcon={<RefreshIcon />}
                sx={{ flexGrow: 1 }}
              >
                {isLoading ? 'Loading...' : 'Load Messages'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearMessages}
                disabled={messages.length === 0 || isLoading}
                startIcon={<DeleteIcon />}
              >
                Clear
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/consume/${topicId}`)}
              >
                Consume UI
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <TextField
              fullWidth
              placeholder="Search messages..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Messages List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Loader text="Loading messages..." />
        </Box>
      ) : filteredMessages.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No messages available
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {messages.length > 0 && searchTerm 
              ? 'Try adjusting your search terms'
              : 'Load messages using the controls above'
            }
          </Typography>
          <Button
            variant="contained"
            onClick={handleConsumeMessages}
            disabled={!selectedConsumerGroupId}
            sx={{ mt: 2 }}
          >
            Load Messages
          </Button>
        </Paper>
      ) : (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredMessages.length} of {messages.length} messages
            {searchTerm && ` matching "${searchTerm}"`}
          </Typography>
          
          {filteredMessages.map((message) => (
            <Accordion 
              key={message.messageId}
              expanded={expandedMessageId === message.messageId}
              onChange={handleAccordionChange(message.messageId)}
              sx={{ mb: 2 }}
            >
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
        </Box>
      )}
    </Box>
  );
};

export default TopicMessages;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton,
  Paper,
  Chip,
  Divider,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchTopic } from '@/store/slices/topicsSlice';
import { publishMessage, clearMessageErrors } from '@/store/slices/messagesSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import { PublishMessageRequest } from '@/types/message';
import Card from '@/components/common/Card';

// Content type options
const contentTypes = [
  { value: 'application/json', label: 'JSON' },
  { value: 'text/plain', label: 'Plain Text' },
  { value: 'application/xml', label: 'XML' },
  { value: 'text/html', label: 'HTML' },
  { value: 'application/octet-stream', label: 'Binary' },
];

const PublishMessage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { currentTopic } = useAppSelector((state) => state.topics);
  const { publishLoading, publishError } = useAppSelector((state) => state.messages);
  
  // Form state
  const [contentType, setContentType] = useState('application/json');
  const [payload, setPayload] = useState('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState({
    payload: '',
    metadataKey: '',
    metadataValue: '',
  });
  
  // Fetch topic data
  useEffect(() => {
    if (topicId) {
      dispatch(fetchTopic(topicId));
    }
  }, [dispatch, topicId]);
  
  // Clean up errors when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearMessageErrors());
    };
  }, [dispatch]);
  
  // Handle content type change
  const handleContentTypeChange = (event: any) => {
    setContentType(event.target.value);
    validatePayload(payload, event.target.value);
  };
  
  // Handle payload change
  const handlePayloadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPayload = event.target.value;
    setPayload(newPayload);
    validatePayload(newPayload, contentType);
  };
  
  // Validate payload
  const validatePayload = (value: string, type: string) => {
    if (!value.trim()) {
      setErrors({ ...errors, payload: 'Payload is required' });
      return false;
    }
    
    if (type === 'application/json') {
      try {
        JSON.parse(value);
        setErrors({ ...errors, payload: '' });
        return true;
      } catch (error) {
        setErrors({ ...errors, payload: 'Invalid JSON format' });
        return false;
      }
    }
    
    // For other types, just check if it's not empty
    setErrors({ ...errors, payload: '' });
    return true;
  };
  
  // Add metadata key-value pair
  const handleAddMetadata = () => {
    if (!newMetadataKey.trim()) {
      setErrors({ ...errors, metadataKey: 'Key is required' });
      return;
    }
    
    if (!newMetadataValue.trim()) {
      setErrors({ ...errors, metadataValue: 'Value is required' });
      return;
    }
    
    setMetadata({
      ...metadata,
      [newMetadataKey]: newMetadataValue,
    });
    
    setNewMetadataKey('');
    setNewMetadataValue('');
    setErrors({ ...errors, metadataKey: '', metadataValue: '' });
  };
  
  // Remove metadata key-value pair
  const handleRemoveMetadata = (key: string) => {
    const newMetadata = { ...metadata };
    delete newMetadata[key];
    setMetadata(newMetadata);
  };
  
  // Clear the form
  const handleClearForm = () => {
    setPayload('');
    setMetadata({});
    setNewMetadataKey('');
    setNewMetadataValue('');
    setErrors({ payload: '', metadataKey: '', metadataValue: '' });
    dispatch(clearMessageErrors());
  };
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validatePayload(payload, contentType)) {
      return;
    }
    
    if (!topicId) return;
    
    let payloadValue: string | object = payload;
    
    // Parse JSON payload
    if (contentType === 'application/json') {
      try {
        payloadValue = JSON.parse(payload);
      } catch (error) {
        setErrors({ ...errors, payload: 'Invalid JSON format' });
        return;
      }
    }
    
    const message: PublishMessageRequest = {
      payload: payloadValue,
      contentType,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
    
    try {
      const resultAction = await dispatch(publishMessage({ topicId, message }));
      
      if (publishMessage.fulfilled.match(resultAction)) {
        dispatch(setAlertMessage({
          type: 'success',
          message: 'Message published successfully',
        }));
        
        // Optionally clear the form after success
        handleClearForm();
      }
    } catch (error) {
      console.error('Failed to publish message:', error);
    }
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
            Publish Message
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Publish a new message to {currentTopic?.name || 'topic'}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Content Type</InputLabel>
                    <Select
                      value={contentType}
                      onChange={handleContentTypeChange}
                      label="Content Type"
                    >
                      {contentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Payload"
                    multiline
                    rows={10}
                    fullWidth
                    value={payload}
                    onChange={handlePayloadChange}
                    error={!!errors.payload}
                    helperText={errors.payload}
                    placeholder={
                      contentType === 'application/json'
                        ? '{\n  "key": "value",\n  "example": true\n}'
                        : 'Enter your message payload...'
                    }
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Metadata (Optional)
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={5}>
                        <TextField
                          label="Key"
                          fullWidth
                          value={newMetadataKey}
                          onChange={(e) => setNewMetadataKey(e.target.value)}
                          error={!!errors.metadataKey}
                          helperText={errors.metadataKey}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          label="Value"
                          fullWidth
                          value={newMetadataValue}
                          onChange={(e) => setNewMetadataValue(e.target.value)}
                          error={!!errors.metadataValue}
                          helperText={errors.metadataValue}
                        />
                      </Grid>
                      <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          onClick={handleAddMetadata}
                          startIcon={<AddIcon />}
                          fullWidth
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Metadata tags */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(metadata).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        onDelete={() => handleRemoveMetadata(key)}
                        deleteIcon={<DeleteIcon />}
                      />
                    ))}
                  </Box>
                </Grid>
                
                {/* Error message */}
                {publishError && (
                  <Grid item xs={12}>
                    <Alert severity="error">{publishError}</Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={handleClearForm}
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={publishLoading ? <CircularProgress size={20} /> : <SendIcon />}
                      disabled={publishLoading || !payload.trim()}
                    >
                      {publishLoading ? 'Publishing...' : 'Publish Message'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card title="Publishing Guidelines">
            <Typography variant="body2" paragraph>
              Messages are published to topics and can be consumed by one or more consumer groups.
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Content Types
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>JSON</strong>: Use for structured data. Must be valid JSON format.<br />
              <strong>Plain Text</strong>: Simple text messages.<br />
              <strong>XML</strong>: For XML formatted data.<br />
              <strong>HTML</strong>: For HTML content.<br />
              <strong>Binary</strong>: For raw binary data (base64 encoded).
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Metadata
            </Typography>
            <Typography variant="body2" paragraph>
              Metadata provides additional context for your messages. Add key-value pairs to help classify and filter messages. Metadata is optional but recommended for complex systems.
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Size Limits
            </Typography>
            <Typography variant="body2">
              Maximum message size: 256KB<br />
              Maximum metadata keys: 10<br />
              Maximum metadata key length: 128 characters<br />
              Maximum metadata value length: 256 characters
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PublishMessage;
import { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { publishMessage } from '@/store/slices/messagesSlice';
import { PublishMessageRequest } from '@/types/message';
import { Topic } from '@/types/topic';

// Content type options
const contentTypes = [
  { value: 'application/json', label: 'JSON' },
  { value: 'text/plain', label: 'Plain Text' },
  { value: 'application/xml', label: 'XML' },
  { value: 'text/html', label: 'HTML' },
  { value: 'application/octet-stream', label: 'Binary' },
];

interface MessagePublisherProps {
  topic: Topic;
  onSuccess?: () => void;
}

const MessagePublisher = ({ topic, onSuccess }: MessagePublisherProps) => {
  const dispatch = useAppDispatch();
  
  // Get state from Redux
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
  const validatePayload = (value: string, type: string): boolean => {
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
  };
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validatePayload(payload, contentType)) {
      return;
    }
    
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
      await dispatch(publishMessage({ topicId: topic.topicId, message }));
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Clear form on success
      handleClearForm();
    } catch (error) {
      console.error('Failed to publish message:', error);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
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
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MessagePublisher;
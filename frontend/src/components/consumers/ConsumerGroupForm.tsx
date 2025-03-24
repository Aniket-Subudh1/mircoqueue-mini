import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { createConsumerGroup, clearConsumerErrors } from '@/store/slices/consumersSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import { CreateConsumerGroupRequest } from '@/types/consumer';
import { Topic } from '@/types/topic';

interface ConsumerGroupFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTopicId?: string;
}

const ConsumerGroupForm = ({ 
  open, 
  onClose, 
  onSuccess,
  initialTopicId 
}: ConsumerGroupFormProps) => {
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const { topics } = useAppSelector(state => state.topics);
  const { createConsumerGroupLoading, createConsumerGroupError } = useAppSelector(
    state => state.consumers
  );
  
  // Form state
  const [formValues, setFormValues] = useState<CreateConsumerGroupRequest>({
    topicId: initialTopicId || '',
    name: '',
    description: '',
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({
    name: '',
    topicId: '',
  });
  
  // Update form when initialTopicId changes
  useEffect(() => {
    if (initialTopicId) {
      setFormValues(prev => ({
        ...prev,
        topicId: initialTopicId,
      }));
    }
  }, [initialTopicId]);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormValues({
        topicId: initialTopicId || '',
        name: '',
        description: '',
      });
      setErrors({
        name: '',
        topicId: '',
      });
    } else {
      dispatch(clearConsumerErrors());
    }
  }, [open, initialTopicId, dispatch]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    
    // Clear errors for the field
    if (name === 'name' && errors.name) {
      setErrors({ ...errors, name: '' });
    }
  };
  
  // Handle topic change
  const handleTopicChange = (e: any) => {
    setFormValues({
      ...formValues,
      topicId: e.target.value,
    });
    
    if (errors.topicId) {
      setErrors({ ...errors, topicId: '' });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { name: '', topicId: '' };
    
    if (!formValues.name.trim()) {
      newErrors.name = 'Consumer group name is required';
      valid = false;
    } else if (formValues.name.length > 100) {
      newErrors.name = 'Consumer group name cannot exceed 100 characters';
      valid = false;
    }
    
    if (!formValues.topicId) {
      newErrors.topicId = 'Topic is required';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const resultAction = await dispatch(createConsumerGroup(formValues));
      
      if (createConsumerGroup.fulfilled.match(resultAction)) {
        dispatch(setAlertMessage({
          type: 'success',
          message: `Consumer group "${formValues.name}" created successfully`,
        }));
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Failed to create consumer group:', error);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={createConsumerGroupLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create Consumer Group</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth margin="normal" error={!!errors.topicId}>
            <InputLabel>Topic</InputLabel>
            <Select
              value={formValues.topicId}
              onChange={handleTopicChange}
              label="Topic"
              disabled={!!initialTopicId || topics.length === 0}
            >
              {topics.map((topic) => (
                <MenuItem key={topic.topicId} value={topic.topicId}>
                  {topic.name}
                </MenuItem>
              ))}
            </Select>
            {errors.topicId && (
              <Typography variant="caption" color="error">
                {errors.topicId}
              </Typography>
            )}
          </FormControl>
          
          <TextField
            label="Group Name"
            name="name"
            value={formValues.name}
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
            value={formValues.description}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          
          {createConsumerGroupError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createConsumerGroupError}
            </Alert>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Consumer groups allow multiple clients to consume messages from a topic 
              with their own individual offsets.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createConsumerGroupLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createConsumerGroupLoading || !formValues.topicId || !formValues.name.trim()}
          startIcon={createConsumerGroupLoading ? <CircularProgress size={20} /> : undefined}
        >
          {createConsumerGroupLoading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsumerGroupForm;
  
  
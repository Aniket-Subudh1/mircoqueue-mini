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
import { createTopic, clearTopicErrors } from '@/store/slices/topicsSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import { CreateTopicRequest, Topic } from '@/types/topic';

interface TopicFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (topic: Topic) => void;
  initialValues?: Partial<CreateTopicRequest>;
  mode?: 'create' | 'edit';
  title?: string;
}

const TopicForm = ({ 
  open, 
  onClose, 
  onSuccess,
  initialValues = {},
  mode = 'create',
  title = 'Create Topic',
}: TopicFormProps) => {
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const { createTopicLoading, createTopicError } = useAppSelector((state) => state.topics);
  
  // Form state
  const [formValues, setFormValues] = useState<CreateTopicRequest>({
    name: '',
    description: '',
    retentionPeriodHours: 24,
    ...initialValues,
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({
    name: '',
  });
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Initialize with initial values when dialog opens
      setFormValues({
        name: '',
        description: '',
        retentionPeriodHours: 24,
        ...initialValues,
      });
      setErrors({ name: '' });
    } else {
      // Clear errors when dialog closes
      dispatch(clearTopicErrors());
    }
  }, [open, initialValues, dispatch]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    
    // Clear errors for the field
    if (name === 'name' && errors.name) {
      setErrors({ ...errors, name: '' });
    }
  };
  
  // Handle select change for retention period
  const handleRetentionChange = (e: any) => {
    setFormValues({
      ...formValues,
      retentionPeriodHours: parseInt(e.target.value, 10),
    });
  };
  
  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { name: '' };
    
    if (!formValues.name.trim()) {
      newErrors.name = 'Topic name is required';
      valid = false;
    } else if (formValues.name.length > 100) {
      newErrors.name = 'Topic name cannot exceed 100 characters';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      if (mode === 'create') {
        const resultAction = await dispatch(createTopic(formValues));
        
        if (createTopic.fulfilled.match(resultAction)) {
          dispatch(setAlertMessage({
            type: 'success',
            message: `Topic "${formValues.name}" created successfully`,
          }));
          
          // Call success callback if provided
          if (onSuccess) {
            onSuccess(resultAction.payload);
          }
          
          onClose();
        }
      } else {
        // Edit mode - not implemented yet
        // Would dispatch an updateTopic action here
        onClose();
      }
    } catch (error) {
      console.error('Failed to save topic:', error);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={createTopicLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Topic Name"
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
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Retention Period</InputLabel>
            <Select
              value={formValues.retentionPeriodHours}
              onChange={handleRetentionChange}
              label="Retention Period"
            >
              <MenuItem value={1}>1 hour</MenuItem>
              <MenuItem value={6}>6 hours</MenuItem>
              <MenuItem value={12}>12 hours</MenuItem>
              <MenuItem value={24}>1 day</MenuItem>
              <MenuItem value={72}>3 days</MenuItem>
              <MenuItem value={168}>1 week</MenuItem>
            </Select>
          </FormControl>
          
          {createTopicError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createTopicError}
            </Alert>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Topics are used to categorize messages and allow consumers to subscribe to specific message streams.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createTopicLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createTopicLoading}
          startIcon={createTopicLoading ? <CircularProgress size={20} /> : undefined}
        >
          {createTopicLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TopicForm;
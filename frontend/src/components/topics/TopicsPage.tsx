import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { 
  fetchTopics, 
  createTopic, 
  clearTopicErrors 
} from '@/store/slices/topicsSlice';
import { fetchSystemMetrics } from '@/store/slices/metricsSlice';
import TopicsList from '@/components/dashboard/TopicsList';
import Loader from '@/components/common/Loader';
import { CreateTopicRequest } from '@/types/topic';
import { setAlertMessage } from '@/store/slices/uiSlice';

const TopicsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { 
    topics, 
    loading: topicsLoading, 
    error: topicsError,
    createTopicLoading,
    createTopicError
  } = useAppSelector((state) => state.topics);
  
  const { topicMetrics, loading: metricsLoading } = useAppSelector((state) => state.metrics);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newTopic, setNewTopic] = useState<CreateTopicRequest>({
    name: '',
    description: '',
    retentionPeriodHours: 24,
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({
    name: '',
  });
  
  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchTopics());
    dispatch(fetchSystemMetrics());
  }, [dispatch]);
  
  // Filter topics based on search term
  const filteredTopics = topics.filter(
    (topic) => topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle create dialog open/close
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };
  
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewTopic({
      name: '',
      description: '',
      retentionPeriodHours: 24,
    });
    setFormErrors({ name: '' });
    dispatch(clearTopicErrors());
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTopic({ ...newTopic, [name]: value });
    
    // Clear errors on input change
    if (name === 'name' && formErrors.name) {
      setFormErrors({ ...formErrors, name: '' });
    }
  };
  
  // Handle retention period change
  const handleRetentionChange = (e: any) => {
    setNewTopic({
      ...newTopic, 
      retentionPeriodHours: parseInt(e.target.value, 10)
    });
  };
  
  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const errors = { name: '' };
    
    if (!newTopic.name.trim()) {
      errors.name = 'Topic name is required';
      valid = false;
    } else if (newTopic.name.length > 100) {
      errors.name = 'Topic name cannot exceed 100 characters';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  // Handle create topic
  const handleCreateTopic = async () => {
    if (!validateForm()) return;
    
    try {
      const resultAction = await dispatch(createTopic(newTopic));
      if (createTopic.fulfilled.match(resultAction)) {
        handleCloseCreateDialog();
        dispatch(setAlertMessage({
          type: 'success',
          message: `Topic "${newTopic.name}" created successfully`,
        }));
      }
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Topics</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Topic
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your messaging topics
        </Typography>
      </Box>
      
      {/* Search and filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
      </Box>
      
      {/* Topics list */}
      <TopicsList
        topics={filteredTopics}
        topicMetrics={topicMetrics}
        loading={topicsLoading || metricsLoading}
        onViewTopic={(topicId) => navigate(`/topics/${topicId}`)}
        onPublish={(topicId) => navigate(`/publish/${topicId}`)}
        onConsume={(topicId) => navigate(`/consume/${topicId}`)}
        onCreateTopic={handleOpenCreateDialog}
      />
      
      {/* Create Topic Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Topic</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Topic Name"
              name="name"
              value={newTopic.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              label="Description"
              name="description"
              value={newTopic.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Retention Period</InputLabel>
              <Select
                value={newTopic.retentionPeriodHours}
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
            
            {/* Display API errors */}
            {createTopicError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {createTopicError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateTopic} 
            variant="contained" 
            disabled={createTopicLoading}
          >
            {createTopicLoading ? 'Creating...' : 'Create Topic'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TopicsPage;
import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  TablePagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchTopics } from '@/store/slices/topicsSlice';
import { 
  fetchConsumerGroups, 
  createConsumerGroup, 
  deleteConsumerGroup,
  clearConsumerErrors
} from '@/store/slices/consumersSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import { CreateConsumerGroupRequest } from '@/types/consumer';
import Loader from '@/components/common/Loader';
import Card from '@/components/common/Card';

const ConsumerGroups = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { topics, loading: topicsLoading } = useAppSelector((state: { topics: { topics: { topicId: string; name: string }[]; loading: boolean } }) => state.topics);
  const { 
    consumerGroups, 
    loading: consumersLoading,
    error: consumersError,
    createConsumerGroupLoading,
    createConsumerGroupError
  } = useAppSelector((state) => state.consumers);
  
  // Local state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [newConsumerGroup, setNewConsumerGroup] = useState<CreateConsumerGroupRequest>({
    topicId: '',
    name: '',
    description: '',
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [consumerToDelete, setConsumerToDelete] = useState<{ groupId: string; topicId: string } | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    name: '',
  });
  
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
  
  // Handle topic change
  const handleTopicChange = (event: any) => {
    setSelectedTopicId(event.target.value);
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
  
  // Handle create dialog open/close
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    setNewConsumerGroup({
      topicId: selectedTopicId,
      name: '',
      description: '',
    });
    setFormErrors({ name: '' });
  };
  
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormErrors({ name: '' });
    dispatch(clearConsumerErrors());
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewConsumerGroup({ ...newConsumerGroup, [name]: value });
    
    // Clear errors on input change
    if (name === 'name' && formErrors.name) {
      setFormErrors({ ...formErrors, name: '' });
    }
  };
  
  // Handle topic change in form
  const handleFormTopicChange = (event: any) => {
    setNewConsumerGroup({
      ...newConsumerGroup,
      topicId: event.target.value,
    });
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
    
    setFormErrors(errors);
    return valid;
  };
  
  // Handle create consumer group
  const handleCreateConsumerGroup = async () => {
    if (!validateForm()) return;
    
    try {
      const resultAction = await dispatch(createConsumerGroup(newConsumerGroup));
      
      if (createConsumerGroup.fulfilled.match(resultAction)) {
        handleCloseCreateDialog();
        dispatch(setAlertMessage({
          type: 'success',
          message: `Consumer group "${newConsumerGroup.name}" created successfully`,
        }));
        
        // Make sure we're viewing the topic for the new consumer group
        setSelectedTopicId(newConsumerGroup.topicId);
      }
    } catch (error) {
      console.error('Failed to create consumer group:', error);
    }
  };
  
  // Handle delete dialog
  const handleOpenDeleteDialog = (groupId: string, topicId: string) => {
    setConsumerToDelete({ groupId, topicId });
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setConsumerToDelete(null);
  };
  
  // Handle delete consumer group
  const handleDeleteConsumerGroup = async () => {
    if (!consumerToDelete) return;
    
    try {
      await dispatch(deleteConsumerGroup(consumerToDelete));
      handleCloseDeleteDialog();
      dispatch(setAlertMessage({
        type: 'success',
        message: 'Consumer group deleted successfully',
      }));
    } catch (error) {
      console.error('Failed to delete consumer group:', error);
      dispatch(setAlertMessage({
        type: 'error',
        message: 'Failed to delete consumer group',
      }));
    }
  };
  
  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get current topic name
const currentTopic: { topicId: string; name: string } | undefined = topics.find(
    (topic: { topicId: string; name: string }) => topic.topicId === selectedTopicId
);
  
  // Filter consumer groups for selected topic
  const filteredConsumerGroups = consumerGroups.filter(
    (group: { topicId: string }) => group.topicId === selectedTopicId
  );
  
  // Apply pagination
  const paginatedConsumerGroups = filteredConsumerGroups.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Consumer Groups
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage consumer groups for message topics
        </Typography>
      </Box>
      
      {/* Topic selection and action buttons */}
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
                {topics.map((topic: { topicId: string; name: string }) => (
                  <MenuItem key={topic.topicId} value={topic.topicId}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              disabled={!selectedTopicId}
            >
              Create Consumer Group
            </Button>
          </Grid>
        </Grid>
      </Box>
      
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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{ mt: 2 }}
              disabled={!selectedTopicId}
            >
              Create Consumer Group
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Group Name</TableCell>
                    <TableCell>Group ID</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Last Consumed</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedConsumerGroups.map((group: { groupId: string; name: string; description?: string; createdAt?: number; lastConsumedTimestamp?: number; topicId: string }) => (
                    <TableRow key={group.groupId}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {group.name}
                        </Typography>
                        {group.description && (
                          <Typography variant="caption" color="text.secondary">
                            {group.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{group.groupId}</TableCell>
                      <TableCell>{formatDate(group.createdAt)}</TableCell>
                      <TableCell>
                        {group.lastConsumedTimestamp 
                          ? formatDate(group.lastConsumedTimestamp)
                          : (
                            <Chip 
                              label="Never consumed" 
                              size="small" 
                              color="warning" 
                              variant="outlined" 
                            />
                          )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Manage Offsets">
                          <IconButton
                            size="small"
                            onClick={() => navigate('/consumer-groups/offsets')}
                          >
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(group.groupId, group.topicId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredConsumerGroups.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>
      
      {/* Create Consumer Group Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Consumer Group</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Topic</InputLabel>
              <Select
                value={newConsumerGroup.topicId}
                onChange={handleFormTopicChange}
                label="Topic"
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.topicId} value={topic.topicId}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Group Name"
              name="name"
              value={newConsumerGroup.name}
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
              value={newConsumerGroup.description}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateConsumerGroup}
            variant="contained"
            disabled={createConsumerGroupLoading}
          >
            {createConsumerGroupLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Consumer Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this consumer group? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteConsumerGroup} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConsumerGroups;
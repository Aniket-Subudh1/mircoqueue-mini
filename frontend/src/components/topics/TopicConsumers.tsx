import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Grid,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { 
  fetchConsumerGroups, 
  createConsumerGroup, 
  deleteConsumerGroup,
  resetConsumerGroupOffset,
  clearConsumerErrors
} from '@/store/slices/consumersSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import { CreateConsumerGroupRequest } from '@/types/consumer';
import Loader from '@/components/common/Loader';

interface TopicConsumersProps {
  topicId: string;
}

// Format date
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return 'Never';
  
  return new Date(timestamp).toLocaleString();
};

// Calculate the time since last activity
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

const TopicConsumers = ({ topicId }: TopicConsumersProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Local state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [selectedConsumerGroup, setSelectedConsumerGroup] = useState<{
    groupId: string;
    topicId: string;
    name: string;
  } | null>(null);
  
  const [newConsumerGroup, setNewConsumerGroup] = useState<CreateConsumerGroupRequest>({
    topicId: topicId,
    name: '',
    description: '',
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({
    name: '',
  });
  
  // Get data from Redux store
  const { 
    consumerGroups, 
    loading: consumersLoading,
    createConsumerGroupLoading,
    createConsumerGroupError
  } = useAppSelector((state) => state.consumers);
  
  // Fetch consumer groups on mount
  useEffect(() => {
    if (topicId) {
      dispatch(fetchConsumerGroups(topicId));
    }
  }, [dispatch, topicId]);
  
  // Filter consumer groups for this topic
  const topicConsumerGroups = consumerGroups.filter(
    (group) => group.topicId === topicId
  );
  
  // Handle create dialog
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    setNewConsumerGroup({
      topicId: topicId,
      name: '',
      description: '',
    });
    setFormErrors({ name: '' });
  };
  
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    dispatch(clearConsumerErrors());
  };
  
  // Handle input changes for new consumer group
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewConsumerGroup({ ...newConsumerGroup, [name]: value });
    
    // Clear errors on input change
    if (name === 'name' && formErrors.name) {
      setFormErrors({ ...formErrors, name: '' });
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
      }
    } catch (error) {
      console.error('Failed to create consumer group:', error);
    }
  };
  
  // Handle delete dialog
  const handleOpenDeleteDialog = (groupId: string, name: string) => {
    setSelectedConsumerGroup({
      groupId,
      topicId,
      name,
    });
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedConsumerGroup(null);
  };
  
  // Handle delete consumer group
  const handleDeleteConsumerGroup = async () => {
    if (!selectedConsumerGroup) return;
    
    try {
      await dispatch(deleteConsumerGroup({
        groupId: selectedConsumerGroup.groupId,
        topicId: selectedConsumerGroup.topicId,
      }));
      
      handleCloseDeleteDialog();
      dispatch(setAlertMessage({
        type: 'success',
        message: `Consumer group "${selectedConsumerGroup.name}" deleted successfully`,
      }));
    } catch (error) {
      console.error('Failed to delete consumer group:', error);
      dispatch(setAlertMessage({
        type: 'error',
        message: 'Failed to delete consumer group',
      }));
    }
  };
  
  // Handle reset dialog
  const handleOpenResetDialog = (groupId: string, name: string) => {
    setSelectedConsumerGroup({
      groupId,
      topicId,
      name,
    });
    setOpenResetDialog(true);
  };
  
  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setSelectedConsumerGroup(null);
  };
  
  // Handle reset consumer group offset
  const handleResetOffset = async () => {
    if (!selectedConsumerGroup) return;
    
    try {
      await dispatch(resetConsumerGroupOffset({
        groupId: selectedConsumerGroup.groupId,
        topicId: selectedConsumerGroup.topicId,
      }));
      
      handleCloseResetDialog();
      dispatch(setAlertMessage({
        type: 'success',
        message: `Offset for consumer group "${selectedConsumerGroup.name}" reset successfully`,
      }));
    } catch (error) {
      console.error('Failed to reset consumer group offset:', error);
      dispatch(setAlertMessage({
        type: 'error',
        message: 'Failed to reset consumer group offset',
      }));
    }
  };
  
  // Navigate to consume UI
  const handleNavigateToConsume = (groupId: string) => {
    navigate(`/consume/${topicId}?consumerGroupId=${groupId}`);
  };
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Consumer Groups</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Consumer Group
        </Button>
      </Box>
      
      {/* Consumer Groups Table */}
      {consumersLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Loader text="Loading consumer groups..." />
        </Box>
      ) : topicConsumerGroups.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No consumer groups for this topic
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ mt: 2 }}
          >
            Create Consumer Group
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topicConsumerGroups.map((group) => (
                <TableRow key={group.groupId}>
                  <TableCell>
                    <Typography variant="body1">{group.name}</Typography>
                    {group.description && (
                      <Typography variant="caption" color="text.secondary">
                        {group.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{group.groupId}</TableCell>
                  <TableCell>{formatDate(group.createdAt)}</TableCell>
                  <TableCell>
                    {group.lastConsumedTimestamp ? (
                      <>
                        <Typography variant="body2">
                          {formatDate(group.lastConsumedTimestamp)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getTimeSince(group.lastConsumedTimestamp)}
                        </Typography>
                      </>
                    ) : (
                      <Chip 
                        label="Never consumed" 
                        size="small" 
                        color="warning" 
                        variant="outlined" 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={group.lastConsumedTimestamp ? "Active" : "Inactive"} 
                      size="small" 
                      color={group.lastConsumedTimestamp ? "success" : "default"} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Consume Messages">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleNavigateToConsume(group.groupId)}
                      >
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Offset">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleOpenResetDialog(group.groupId, group.name)}
                      >
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(group.groupId, group.name)}
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
      )}
      
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
          <DialogContentText>
            Are you sure you want to delete the consumer group "{selectedConsumerGroup?.name}"?
            This action cannot be undone.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Deleting a consumer group will remove all of its saved offsets.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteConsumerGroup} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reset Offset Confirmation Dialog */}
      <Dialog
        open={openResetDialog}
        onClose={handleCloseResetDialog}
      >
        <DialogTitle>Reset Consumer Group Offset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the offset for consumer group "{selectedConsumerGroup?.name}"?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold', color: 'warning.main' }}>
            This will reset the consumer group to start consuming from the beginning of the topic.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>Cancel</Button>
          <Button onClick={handleResetOffset} color="warning" variant="contained">
            Reset Offset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopicConsumers;
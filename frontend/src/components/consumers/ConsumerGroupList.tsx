import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch } from '@/hooks/useRedux';
import { deleteConsumerGroup, resetConsumerGroupOffset } from '@/store/slices/consumersSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import { ConsumerGroup } from '@/types/consumer';
import { Topic } from '@/types/topic';
import Loader from '@/components/common/Loader';
import ConsumerGroupForm from './ConsumerGroupForm';

interface ConsumerGroupListProps {
  consumerGroups: ConsumerGroup[];
  topics: Topic[];
  loading?: boolean;
  onViewConsumerGroup?: (groupId: string) => void;
  onAddConsumerGroup?: () => void;
  selectedTopicId?: string;
}

const ConsumerGroupList = ({ 
  consumerGroups, 
  topics, 
  loading = false,
  onViewConsumerGroup,
  onAddConsumerGroup,
  selectedTopicId,
}: ConsumerGroupListProps) => {
  const dispatch = useAppDispatch();
  
  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedConsumerGroup, setSelectedConsumerGroup] = useState<{
    groupId: string;
    topicId: string;
    name: string;
  } | null>(null);
  
  // Format date
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never';
    
    return new Date(timestamp).toLocaleString();
  };
  
  // Calculate time since last activity
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
  
  // Get topic name from ID
  const getTopicName = (topicId: string) => {
    const topic = topics.find(t => t.topicId === topicId);
    return topic ? topic.name : topicId;
  };
  
  // Filter consumer groups based on search term and selected topic
  const filteredConsumerGroups = consumerGroups.filter((group) => {
    // Filter by selected topic if provided
    if (selectedTopicId && group.topicId !== selectedTopicId) {
      return false;
    }
    
    // Filter by search term
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in name
    if (group.name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in ID
    if (group.groupId.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in description
    if (group.description && group.description.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Get topic name and search in it
    const topicName = getTopicName(group.topicId);
    if (topicName.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });
  
  // Calculate pagination
  const paginatedConsumerGroups = filteredConsumerGroups.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when search changes
  };
  
  // Handle delete dialog
  const handleOpenDeleteDialog = (groupId: string, topicId: string, name: string) => {
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
  const handleOpenResetDialog = (groupId: string, topicId: string, name: string) => {
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
  
  // Handle view consumer group
  const handleViewConsumerGroup = (groupId: string) => {
    if (onViewConsumerGroup) {
      onViewConsumerGroup(groupId);
    }
  };
  
  // Handle create consumer group
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };
  
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };
  
  const handleCreateSuccess = () => {
    dispatch(setAlertMessage({
      type: 'success',
      message: 'Consumer group created successfully',
    }));
    
    if (onAddConsumerGroup) {
      onAddConsumerGroup();
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Loader text="Loading consumer groups..." />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Search consumer groups..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Consumer Group
        </Button>
      </Box>
      
      {filteredConsumerGroups.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {consumerGroups.length === 0 
              ? 'No consumer groups found' 
              : 'No consumer groups match your search criteria'}
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
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Topic</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedConsumerGroups.map((group) => (
                  <TableRow key={group.groupId}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {group.name}
                      </Typography>
                      {group.description && (
                        <Typography variant="body2" color="text.secondary">
                          {group.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getTopicName(group.topicId)}</TableCell>
                    <TableCell>{formatDate(group.createdAt)}</TableCell>
                    <TableCell>
                      {group.lastConsumedTimestamp 
                        ? getTimeSince(group.lastConsumedTimestamp)
                        : 'Never consumed'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={group.lastConsumedTimestamp ? "Active" : "Inactive"} 
                        size="small" 
                        color={group.lastConsumedTimestamp ? "success" : "default"} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewConsumerGroup(group.groupId)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Offset">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleOpenResetDialog(group.groupId, group.topicId, group.name)}
                        >
                          <RestartAltIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(group.groupId, group.topicId, group.name)}
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
        </Paper>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Consumer Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the consumer group "{selectedConsumerGroup?.name}"?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Deleting a consumer group will remove all of its saved offsets.
            This action cannot be undone.
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
            Messages that were already consumed will be consumed again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>Cancel</Button>
          <Button onClick={handleResetOffset} color="warning" variant="contained">
            Reset Offset
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create Consumer Group Dialog */}
      <ConsumerGroupForm
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        onSuccess={handleCreateSuccess}
        initialTopicId={selectedTopicId}
      />
    </Box>
  );
};

export default ConsumerGroupList;
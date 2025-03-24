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
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ConsumerGroup } from '@/types/consumer';
import { Topic } from '@/types/topic';
import { useAppDispatch } from '@/hooks/useRedux';
import { resetConsumerGroupOffset } from '@/store/slices/consumersSlice';
import { setAlertMessage } from '@/store/slices/uiSlice';
import Card from '@/components/common/Card';

interface ConsumerOffsetsProps {
  consumerGroups: ConsumerGroup[];
  topics: Topic[];
}

const ConsumerOffsets = ({ consumerGroups, topics }: ConsumerOffsetsProps) => {
  const dispatch = useAppDispatch();
  
  // Local state
  const [openResetDialog, setOpenResetDialog] = useState(false);
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
  
  return (
    <Box>
      <Card title="Consumer Group Offsets">
        {consumerGroups.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No consumer groups found
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Consumer Group</TableCell>
                  <TableCell>Topic</TableCell>
                  <TableCell>Last Consumed</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consumerGroups.map((group) => (
                  <TableRow key={group.groupId}>
                    <TableCell>
                      <Typography variant="body1">{group.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {group.groupId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getTopicName(group.topicId)}
                    </TableCell>
                    <TableCell>
                      {formatDate(group.lastConsumedTimestamp)}
                    </TableCell>
                    <TableCell>
                      {group.lastConsumedTimestamp 
                        ? getTimeSince(group.lastConsumedTimestamp)
                        : 'Never consumed'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Reset Offset">
                        <IconButton
                          color="warning"
                          onClick={() => handleOpenResetDialog(group.groupId, group.topicId, group.name)}
                        >
                          <RestartAltIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
      
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
          <DialogContentText sx={{ mt: 2 }}>
            Resetting the offset will cause the consumer group to start consuming from the beginning 
            of the topic, which could result in processing previously consumed messages again.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold', color: 'warning.main' }}>
            This action cannot be undone.
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

export default ConsumerOffsets;
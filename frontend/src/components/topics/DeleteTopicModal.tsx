import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
  } from '@mui/material';
  import DeleteIcon from '@mui/icons-material/Delete';
  import { useState } from 'react';
  import { useAppDispatch } from '@/hooks/useRedux';
  import { deleteTopic } from '@/store/slices/topicsSlice';
  import { setAlertMessage } from '@/store/slices/uiSlice';
  import { Topic } from '@/types/topic';
  
  interface DeleteTopicModalProps {
    open: boolean;
    onClose: () => void;
    topic: Topic | null;
    onSuccess?: () => void;
  }
  
  const DeleteTopicModal = ({ open, onClose, topic, onSuccess }: DeleteTopicModalProps) => {
    const dispatch = useAppDispatch();
    const [deleting, setDeleting] = useState(false);
    
    // Handle delete
    const handleDelete = async () => {
      if (!topic) return;
      
      try {
        setDeleting(true);
        await dispatch(deleteTopic(topic.topicId));
        
        dispatch(setAlertMessage({
          type: 'success',
          message: `Topic "${topic.name}" deleted successfully`,
        }));
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } catch (error) {
        console.error('Failed to delete topic:', error);
        dispatch(setAlertMessage({
          type: 'error',
          message: 'Failed to delete topic',
        }));
      } finally {
        setDeleting(false);
      }
    };
    
    return (
      <Dialog
        open={open}
        onClose={deleting ? undefined : onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Topic</DialogTitle>
        <DialogContent>
          {topic && (
            <>
              <DialogContentText>
                Are you sure you want to delete the topic "{topic.name}"? This action cannot be undone.
              </DialogContentText>
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Topic Details
                </Typography>
                <Typography variant="body2">
                  ID: {topic.topicId}
                </Typography>
                <Typography variant="body2">
                  Messages: {topic.messageCount}
                </Typography>
                <Typography variant="body2">
                  Created: {new Date(topic.createdAt).toLocaleString()}
                </Typography>
              </Box>
              
              <DialogContentText sx={{ fontWeight: 'bold', color: 'error.main' }}>
                Deleting this topic will permanently remove all of its messages and consumer groups.
              </DialogContentText>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting || !topic}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default DeleteTopicModal;
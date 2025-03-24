import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  TextField,
  Button,
  IconButton,
  Grid,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface MessageMetadataProps {
  metadata: Record<string, string>;
  editable?: boolean;
  onChange?: (metadata: Record<string, string>) => void;
}

const MessageMetadata = ({ 
  metadata = {}, 
  editable = false, 
  onChange 
}: MessageMetadataProps) => {
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<Record<string, string>>(metadata);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Handle edit mode toggle
  const handleEnableEdit = () => {
    setEditedMetadata({...metadata});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewKey('');
    setNewValue('');
    setError(null);
  };

  // Handle save changes
  const handleSaveChanges = () => {
    if (onChange) {
      onChange(editedMetadata);
    }
    setIsEditing(false);
    setNewKey('');
    setNewValue('');
    setError(null);
  };

  // Handle add new metadata
  const handleAddMetadata = () => {
    if (!newKey.trim()) {
      setError('Key cannot be empty');
      return;
    }

    if (editedMetadata[newKey]) {
      setError('Key already exists');
      return;
    }

    setEditedMetadata({
      ...editedMetadata,
      [newKey]: newValue.trim(),
    });

    setNewKey('');
    setNewValue('');
    setError(null);
  };

  // Handle remove metadata
  const handleRemoveMetadata = (key: string) => {
    const newMetadata = { ...editedMetadata };
    delete newMetadata[key];
    setEditedMetadata(newMetadata);
  };

  // Display render
  if (isEditing) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">Metadata</Typography>
          <Box>
            <IconButton 
              color="primary" 
              onClick={handleSaveChanges}
              size="small"
              sx={{ mr: 1 }}
            >
              <SaveIcon />
            </IconButton>
            <IconButton 
              color="default" 
              onClick={handleCancelEdit}
              size="small"
            >
              <CancelIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={5}>
            <TextField
              label="Key"
              fullWidth
              size="small"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              label="Value"
              fullWidth
              size="small"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMetadata}
              fullWidth
              size="small"
            >
              Add
            </Button>
          </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          {Object.keys(editedMetadata).length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              No metadata
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(editedMetadata).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  onDelete={() => handleRemoveMetadata(key)}
                  deleteIcon={<DeleteIcon />}
                  size="small"
                />
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">Metadata</Typography>
        {editable && (
          <IconButton 
            color="primary" 
            onClick={handleEnableEdit}
            size="small"
          >
            <EditIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Paper variant="outlined" sx={{ p: 2 }}>
        {Object.keys(metadata).length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            No metadata
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(metadata).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                size="small"
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MessageMetadata;
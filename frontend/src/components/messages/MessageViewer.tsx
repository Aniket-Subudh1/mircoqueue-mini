import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { MessageWithPayload } from '@/types/message';

interface MessageViewerProps {
  message: MessageWithPayload;
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`message-tabpanel-${index}`}
      aria-labelledby={`message-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>{children}</Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `message-tab-${index}`,
    'aria-controls': `message-tabpanel-${index}`,
  };
}

// Parse payload based on content type
const parsePayload = (payload: string, contentType: string) => {
  if (contentType.includes('json')) {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch (e) {
      return payload;
    }
  }
  return payload;
};

// Format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const MessageViewer = ({ message, open, onClose }: MessageViewerProps) => {
  // Tabs state
  const [tabValue, setTabValue] = useState(0);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Function to attempt to format JSON for display
  const formatPayload = (payload: string, contentType: string) => {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          backgroundColor: 'grey.100',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          overflow: 'auto',
          maxHeight: 400,
          whiteSpace: 'pre-wrap',
        }}
      >
        {parsePayload(payload, contentType)}
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Message Details</Typography>
          <Chip
            label={`Sequence: ${message.sequenceNumber}`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="message tabs">
          <Tab label="Payload" {...a11yProps(0)} />
          <Tab label="Metadata" {...a11yProps(1)} />
          <Tab label="Properties" {...a11yProps(2)} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Content Type
              </Typography>
              <Chip label={message.contentType} />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Payload
            </Typography>
            {formatPayload(message.payload, message.contentType)}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {message.metadata && Object.keys(message.metadata).length > 0 ? (
            <Grid container spacing={2}>
              {Object.entries(message.metadata).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {key}
                    </Typography>
                    <Typography variant="body1">
                      {value.toString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No metadata available for this message
            </Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Message ID
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {message.messageId}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Sequence Number
                </Typography>
                <Typography variant="body1">
                  {message.sequenceNumber}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Content Type
                </Typography>
                <Typography variant="body1">
                  {message.contentType}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Timestamp
                </Typography>
                <Typography variant="body1">
                  {formatDate(message.timestamp)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageViewer;
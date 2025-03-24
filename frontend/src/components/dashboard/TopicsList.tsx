import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Pagination,
  TableSortLabel,
  Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublishIcon from '@mui/icons-material/Publish';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { Topic } from '@/types/topic';
import { TopicMetrics } from '@/types/metrics';

interface TopicsListProps {
  topics: Topic[];
  topicMetrics?: TopicMetrics[];
  loading?: boolean;
  onViewTopic: (topicId: string) => void;
  onPublish: (topicId: string) => void;
  onConsume: (topicId: string) => void;
  onCreateTopic?: () => void;
}

// Sorting types
type SortColumn = 'name' | 'messageCount' | 'publishRate' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const TopicsList = ({
  topics,
  topicMetrics = [],
  loading = false,
  onViewTopic,
  onPublish,
  onConsume,
  onCreateTopic,
}: TopicsListProps) => {
  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Sorting
  const [sortBy, setSortBy] = useState<SortColumn>('messageCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle sort change
  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Sort topics
  const sortedTopics = [...topics].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'messageCount':
        aValue = a.messageCount;
        bValue = b.messageCount;
        break;
      case 'publishRate':
        // Find topic metrics or default to 0
        const aMetrics = topicMetrics.find(m => m.topicId === a.topicId);
        const bMetrics = topicMetrics.find(m => m.topicId === b.topicId);
        aValue = aMetrics?.publishRate || 0;
        bValue = bMetrics?.publishRate || 0;
        break;
      case 'createdAt':
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      default:
        aValue = a.messageCount;
        bValue = b.messageCount;
    }
    
    // Sort direction
    return sortDirection === 'asc'
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });
  
  // Paginate topics
  const startIdx = (page - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedTopics = sortedTopics.slice(startIdx, endIdx);
  
  // Calculate total pages
  const totalPages = Math.ceil(topics.length / rowsPerPage);
  
  return (
    <Card
      title="Topics"
      action={
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onCreateTopic}
        >
          Create Topic
        </Button>
      }
    >
      {loading ? (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <Loader text="Loading topics..." />
        </Box>
      ) : topics.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No topics found
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={onCreateTopic}
          >
            Create Topic
          </Button>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortDirection : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'messageCount'}
                      direction={sortBy === 'messageCount' ? sortDirection : 'asc'}
                      onClick={() => handleSort('messageCount')}
                    >
                      Messages
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'publishRate'}
                      direction={sortBy === 'publishRate' ? sortDirection : 'asc'}
                      onClick={() => handleSort('publishRate')}
                    >
                      Publish Rate
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'createdAt'}
                      direction={sortBy === 'createdAt' ? sortDirection : 'asc'}
                      onClick={() => handleSort('createdAt')}
                    >
                      Created
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTopics.map((topic) => {
                  const metrics = topicMetrics.find(m => m.topicId === topic.topicId);
                  
                  return (
                    <TableRow key={topic.topicId}>
                      <TableCell>
                        <Typography variant="body2">{topic.name}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={topic.messageCount}
                          size="small"
                          color={topic.messageCount > 0 ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {metrics ? `${metrics.publishRate.toFixed(2)}/min` : '0/min'}
                      </TableCell>
                      <TableCell align="right">{formatDate(topic.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Box>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => onViewTopic(topic.topicId)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Publish Message">
                            <IconButton
                              size="small"
                              onClick={() => onPublish(topic.topicId)}
                              color="primary"
                            >
                              <PublishIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Consume Messages">
                            <IconButton
                              size="small"
                              onClick={() => onConsume(topic.topicId)}
                              color="secondary"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Card>
  );
};

export default TopicsList;
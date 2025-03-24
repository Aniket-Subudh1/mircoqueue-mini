import { 
    Box, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    Divider, 
    Avatar, 
    Chip 
  } from '@mui/material';
  import TopicIcon from '@mui/icons-material/AccountTree';
  import MessageIcon from '@mui/icons-material/Message';
  import GroupIcon from '@mui/icons-material/Group';
  import Card from '@/components/common/Card';
  import { MessageWithPayload } from '@/types/message';
  import { Topic } from '@/types/topic';
  import { ConsumerGroup } from '@/types/consumer';
  
  // Activity type enum
  enum ActivityType {
    MESSAGE_PUBLISHED = 'Message Published',
    MESSAGE_CONSUMED = 'Message Consumed',
    TOPIC_CREATED = 'Topic Created',
    CONSUMER_GROUP_CREATED = 'Consumer Group Created',
  }
  
  // Activity interface
  interface Activity {
    id: string;
    type: ActivityType;
    timestamp: number;
    content: string;
    entity: {
      id: string;
      name: string;
      type: 'message' | 'topic' | 'consumer';
    };
    metadata?: Record<string, string>;
  }
  
  interface ActivityFeedProps {
    messages?: MessageWithPayload[];
    topics?: Topic[];
    consumerGroups?: ConsumerGroup[];
    loading?: boolean;
    maxItems?: number;
  }
  
  const ActivityFeed = ({
    messages = [],
    topics = [],
    consumerGroups = [],
    loading = false,
    maxItems = 10,
  }: ActivityFeedProps) => {
    // Combine and sort activities from different sources
    const generateActivities = (): Activity[] => {
      const activities: Activity[] = [];
      
      // Add message activities
      messages.forEach((message) => {
        activities.push({
          id: message.messageId,
          type: ActivityType.MESSAGE_PUBLISHED,
          timestamp: message.timestamp,
          content: `Message ${message.messageId.substring(0, 8)}... published`,
          entity: {
            id: message.messageId,
            name: message.messageId,
            type: 'message',
          },
          metadata: message.metadata,
        });
      });
      
      // Add topic activities
      topics.forEach((topic) => {
        activities.push({
          id: topic.topicId,
          type: ActivityType.TOPIC_CREATED,
          timestamp: topic.createdAt,
          content: `Topic "${topic.name}" created`,
          entity: {
            id: topic.topicId,
            name: topic.name,
            type: 'topic',
          },
        });
      });
      
      // Add consumer group activities
      consumerGroups.forEach((group) => {
        activities.push({
          id: group.groupId,
          type: ActivityType.CONSUMER_GROUP_CREATED,
          timestamp: group.createdAt,
          content: `Consumer Group "${group.name}" created`,
          entity: {
            id: group.groupId,
            name: group.name,
            type: 'consumer',
          },
        });
      });
      
      // Sort by timestamp (newest first)
      return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, maxItems);
    };
    
    const activities = generateActivities();
    
    // Format timestamp to relative time
    const formatRelativeTime = (timestamp: number): string => {
      const now = Date.now();
      const diff = now - timestamp;
      
      const minute = 60 * 1000;
      const hour = minute * 60;
      const day = hour * 24;
      
      if (diff < minute) {
        return 'just now';
      } else if (diff < hour) {
        const minutes = Math.floor(diff / minute);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diff < day) {
        const hours = Math.floor(diff / hour);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        const days = Math.floor(diff / day);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      }
    };
    
    // Get icon for activity type
    const getActivityIcon = (type: ActivityType, entityType: string) => {
      switch (entityType) {
        case 'message':
          return (
            <Avatar sx={{ bgcolor: 'primary.light' }}>
              <MessageIcon />
            </Avatar>
          );
        case 'topic':
          return (
            <Avatar sx={{ bgcolor: 'secondary.light' }}>
              <TopicIcon />
            </Avatar>
          );
        case 'consumer':
          return (
            <Avatar sx={{ bgcolor: 'info.light' }}>
              <GroupIcon />
            </Avatar>
          );
        default:
          return (
            <Avatar sx={{ bgcolor: 'primary.light' }}>
              <MessageIcon />
            </Avatar>
          );
      }
    };
    
    // Get chip color based on activity type
    const getChipColor = (type: ActivityType) => {
      switch (type) {
        case ActivityType.MESSAGE_PUBLISHED:
          return 'primary';
        case ActivityType.MESSAGE_CONSUMED:
          return 'success';
        case ActivityType.TOPIC_CREATED:
          return 'secondary';
        case ActivityType.CONSUMER_GROUP_CREATED:
          return 'info';
        default:
          return 'default';
      }
    };
    
    return (
      <Card
        title="Recent Activity"
        loading={loading}
      >
        {activities.length > 0 ? (
          <List sx={{ p: 0 }}>
            {activities.map((activity, index) => (
              <Box key={activity.id}>
                <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                  <Box sx={{ mr: 2 }}>
                    {getActivityIcon(activity.type, activity.entity.type)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          {activity.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(activity.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={activity.type}
                          size="small"
                          color={getChipColor(activity.type) as any}
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {Object.entries(activity.metadata).slice(0, 2).map(([key, value]) => (
                              <Chip
                                key={key}
                                label={`${key}: ${value}`}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1, mt: 0.5 }}
                              />
                            ))}
                            {Object.keys(activity.metadata).length > 2 && (
                              <Chip
                                label={`+${Object.keys(activity.metadata).length - 2} more`}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No recent activity
            </Typography>
          </Box>
        )}
      </Card>
    );
  };
  
  export default ActivityFeed;
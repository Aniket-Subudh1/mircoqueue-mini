import { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Collapse,
  Toolbar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TopicIcon from '@mui/icons-material/AccountTree';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PublishIcon from '@mui/icons-material/Publish';
import DownloadIcon from '@mui/icons-material/Download';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setSidebarOpen } from '@/store/slices/uiSlice';

interface SidebarProps {
  isMobile: boolean;
  open: boolean;
  onClose: () => void;
}

// Sidebar width
const drawerWidth = 240;
const drawerCollapsedWidth = 72;

const Sidebar = ({ isMobile, open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Redux state
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const topics = useAppSelector((state) => state.topics.topics);
  
  // Local state for nested menus
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [consumersOpen, setConsumersOpen] = useState(false);
  
  // Calculate if the current path is active
  const isActive = (path: string) => location.pathname === path;
  
  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };
  
  // Toggle nested lists
  const handleToggleTopics = () => {
    setTopicsOpen(!topicsOpen);
  };
  
  const handleToggleConsumers = () => {
    setConsumersOpen(!consumersOpen);
  };
  
  // Side effect to expand topics section if on a topic page
  useEffect(() => {
    if (location.pathname.includes('/topics/') || location.pathname === '/topics') {
      setTopicsOpen(true);
    }
    
    if (location.pathname.includes('/consumer-groups')) {
      setConsumersOpen(true);
    }
  }, [location.pathname]);
  
  const drawer = (
    <div>
      <Toolbar />
      <List>
        {/* Dashboard */}
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/')}
            onClick={() => handleNavigation('/')}
          >
            <ListItemIcon>
              <DashboardIcon color={isActive('/') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        
        {/* Topics Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleToggleTopics}>
            <ListItemIcon>
              <TopicIcon color={location.pathname.includes('/topics') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Topics" />
            {topicsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={topicsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Topics List */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActive('/topics')}
              onClick={() => handleNavigation('/topics')}
            >
              <ListItemIcon>
                <TopicIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="All Topics" />
            </ListItemButton>
            
            {/* Create Topic */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              onClick={() => handleNavigation('/topics')}
            >
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Create Topic" />
            </ListItemButton>
            
            {/* Topic specific actions */}
            {topics.slice(0, 5).map((topic) => (
              <ListItemButton 
                key={topic.topicId}
                sx={{ pl: 4 }} 
                selected={isActive(`/topics/${topic.topicId}`)}
                onClick={() => handleNavigation(`/topics/${topic.topicId}`)}
              >
                <ListItemIcon>
                  <TopicIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={topic.name} />
              </ListItemButton>
            ))}
            
            {topics.length > 5 && (
              <ListItemButton 
                sx={{ pl: 4 }} 
                onClick={() => handleNavigation('/topics')}
              >
                <ListItemText primary={`+${topics.length - 5} more...`} />
              </ListItemButton>
            )}
          </List>
        </Collapse>
        
        {/* Consumer Groups Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleToggleConsumers}>
            <ListItemIcon>
              <GroupIcon color={location.pathname.includes('/consumer-groups') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Consumer Groups" />
            {consumersOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={consumersOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Consumer Groups List */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActive('/consumer-groups')}
              onClick={() => handleNavigation('/consumer-groups')}
            >
              <ListItemIcon>
                <GroupIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="All Groups" />
            </ListItemButton>
            
            {/* Offset Management */}
            <ListItemButton 
              sx={{ pl: 4 }} 
              selected={isActive('/consumer-groups/offsets')}
              onClick={() => handleNavigation('/consumer-groups/offsets')}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Offset Management" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
      
      <Divider />
      
      <List>
        {/* Settings */}
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/settings')}
            onClick={() => handleNavigation('/settings')}
          >
            <ListItemIcon>
              <SettingsIcon color={isActive('/settings') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  // For non-mobile screens
  const permanentDrawer = (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarOpen ? drawerWidth : drawerCollapsedWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: sidebarOpen ? drawerWidth : drawerCollapsedWidth,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      open={sidebarOpen}
    >
      {drawer}
    </Drawer>
  );

  // For mobile screens
  const temporaryDrawer = (
    <Drawer
      container={window.document.body}
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      {drawer}
    </Drawer>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: sidebarOpen ? drawerWidth : drawerCollapsedWidth }, flexShrink: { sm: 0 } }}
    >
      {isMobile ? temporaryDrawer : permanentDrawer}
    </Box>
  );
};

export default Sidebar;
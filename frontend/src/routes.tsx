import { ReactNode } from 'react';
import Dashboard from '@/pages/Dashboard';

import TopicDetail from '@/pages/Topics/TopicDetail';
import PublishMessage from '@/pages/Messages/PublishMessage';
import ConsumeMessages from '@/pages/Messages/ConsumeMessages';
import ConsumerGroups from '@/pages/Consumers/ConsumerGroups';
import OffsetManagement from '@/pages/Consumers/OffsetManagement';
import Settings from '@/pages/Settings';

// Define route types
type RouteLayout = 'main' | 'auth' | 'minimal';

interface Route {
  path: string;
  component: ReactNode;
  layout?: RouteLayout;
  label?: string;
  icon?: string;
  children?: Route[];
}

// Define application routes
const routes: Route[] = [
  {
    path: '/',
    component: <Dashboard />,
    layout: 'main',
    label: 'Dashboard',
    icon: 'dashboard',
  },
  
  {
    path: '/topics/:topicId',
    component: <TopicDetail />,
    layout: 'main',
    label: 'Topic Details',
  },
  {
    path: '/publish/:topicId',
    component: <PublishMessage />,
    layout: 'main',
    label: 'Publish Message',
  },
  {
    path: '/consume/:topicId',
    component: <ConsumeMessages />,
    layout: 'main',
    label: 'Consume Messages',
  },
  {
    path: '/consumer-groups',
    component: <ConsumerGroups />,
    layout: 'main',
    label: 'Consumer Groups',
    icon: 'group',
  },
  {
    path: '/consumer-groups/offsets',
    component: <OffsetManagement />,
    layout: 'main',
    label: 'Offset Management',
  },
  {
    path: '/settings',
    component: <Settings />,
    layout: 'main',
    label: 'Settings',
    icon: 'settings',
  },
 
];

export default routes;
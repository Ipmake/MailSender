import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  SendTimeExtension as BulkIcon,
  Description as TemplateIcon,
  Settings as ConfigIcon,
  Analytics as AnalyticsIcon,
  ContactMail as ContactIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

import { useSnackbar } from './hooks/useApi';
import { useAuth } from './hooks/useAuth';
import SendEmailView from './components/SendEmailView';
import BulkEmailView from './components/BulkEmailView';
import TemplatesView from './components/TemplatesView';
import ContactListsView from './components/ContactListsView';
import ConfigurationView from './components/ConfigurationView';
import AnalyticsView from './components/AnalyticsView';
import AuthForm from './components/AuthForm';

const DRAWER_WIDTH = 200;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const App: React.FC = () => {
  const [selectedView, setSelectedView] = useState('send');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const { isAuthenticated, user, logout, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  const navigationItems: NavigationItem[] = [
    {
      id: 'send',
      label: 'Compose Email',
      icon: <EmailIcon />,
      component: <SendEmailView showSnackbar={showSnackbar} />,
    },
    {
      id: 'bulk',
      label: 'Bulk Send',
      icon: <BulkIcon />,
      component: <BulkEmailView showSnackbar={showSnackbar} />,
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <TemplateIcon />,
      component: <TemplatesView showSnackbar={showSnackbar} />,
    },
    {
      id: 'contacts',
      label: 'Contact Lists',
      icon: <ContactIcon />,
      component: <ContactListsView showSnackbar={showSnackbar} />,
    },
    {
      id: 'config',
      label: 'Configuration',
      icon: <ConfigIcon />,
      component: <ConfigurationView showSnackbar={showSnackbar} />,
    },
  ];

  const currentView = navigationItems.find(item => item.id === selectedView);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            minHeight: 48,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Email Sender
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle} size="small">
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Divider />

        {/* Navigation List */}
        <List sx={{ p: 0, flexGrow: 1 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={selectedView === item.id}
              onClick={() => setSelectedView(item.id)}
              sx={{
                borderRadius: 0,
                py: 1,
                px: 2,
                '&.Mui-selected': {
                  bgcolor: '#202020',
                  '& .MuiListItemIcon-root': {
                    color: 'text.primary',
                  },
                  '&:hover': {
                    bgcolor: '#252525',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: 400, fontSize: '0.875rem' }}
              />
            </ListItemButton>
          ))}
        </List>

        {/* User Info and Logout */}
        <Box sx={{ mt: 'auto', p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{user?.username}
            </Typography>
          </Box>
          <Button
            fullWidth
            onClick={logout}
            startIcon={<LogoutIcon />}
            sx={{
              justifyContent: 'flex-start',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            Logout
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 1, display: 'block' }}>
            v2.0.0
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'margin 0.3s',
          marginLeft: drawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            minHeight: 40,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          {!drawerOpen && (
            <IconButton onClick={handleDrawerToggle} sx={{ mr: 1 }} size="small">
              <MenuIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            {currentView?.label}
          </Typography>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 1,
            overflow: 'hidden',
            height: 'calc(100vh - 40px)',
          }}
        >
          {currentView?.component}
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App;

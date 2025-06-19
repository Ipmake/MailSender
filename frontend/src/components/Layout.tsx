import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import {
  Email as EmailIcon,
  SendTimeExtension as BulkIcon,
  Description as TemplateIcon,
  Settings as ConfigIcon,
  ContactMail as ContactIcon,
  Logout as LogoutIcon,
  People as UsersIcon,
  VpnKey as PasswordIcon,
} from '@mui/icons-material';

import { useSnackbar } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';

const DRAWER_WIDTH = 200;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Layout: React.FC = () => {
  const [drawerOpen, _] = useState(true);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    {
      id: 'send',
      label: 'Compose Email',
      icon: <EmailIcon />,
      path: '/send',
    },
    {
      id: 'bulk',
      label: 'Bulk Send',
      icon: <BulkIcon />,
      path: '/bulk',
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <TemplateIcon />,
      path: '/templates',
    },
    {
      id: 'contacts',
      label: 'Contact Lists',
      icon: <ContactIcon />,
      path: '/contacts',
    },
    {
      id: 'config',
      label: 'Configuration',
      icon: <ConfigIcon />,
      path: '/config',
    },
    ...(user?.role === 'ADMIN' ? [{
      id: 'users',
      label: 'User Management',
      icon: <UsersIcon />,
      path: '/users',
    }] : []),
    {
      id: 'password',
      label: 'Change Password',
      icon: <PasswordIcon />,
      path: '/password',
    },
  ];

  const currentPath = location.pathname;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        </Box>

        <Divider />

        {/* Navigation List */}
        <List sx={{ p: 0, flexGrow: 1 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={currentPath === item.path}
              onClick={() => handleNavigation(item.path)}
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
            onClick={handleLogout}
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
        {/* Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 1,
            overflow: 'hidden',
            height: '100vh',
          }}
        >
          <Outlet context={{ showSnackbar }} />
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

export default Layout;

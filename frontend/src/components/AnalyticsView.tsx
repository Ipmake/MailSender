import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  Description as TemplateIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

import { useEmailStats, useTemplates } from '../hooks/useApi';
import { formatDate } from '../utils/dateFormat';

const AnalyticsView: React.FC = () => {
  const { stats } = useEmailStats();
  const { templates } = useTemplates();

  const statCards = [
    {
      title: 'Total Emails Sent',
      value: stats.totalSent,
      icon: <EmailIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Templates Created',
      value: templates.length,
      icon: <TemplateIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary.main',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: <SuccessIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
  ];

  const recentTemplates = templates
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Analytics Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                Recent Templates
              </Typography>
              
              {recentTemplates.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  No templates created yet
                </Typography>
              ) : (
                <List>
                  {recentTemplates.map((template) => (
                    <ListItem key={template.id} divider>
                      <ListItemText
                        primary={template.name}
                        secondary={`Created: ${formatDate(template.createdAt)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: 'success.dark', color: 'white' }}>
                  <Typography variant="body2">
                    ✅ Email Service: Active
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: stats.totalSent > 0 ? 'success.dark' : 'warning.dark', color: 'white' }}>
                  <Typography variant="body2">
                    {stats.totalSent > 0 ? '✅' : '⚠️'} SMTP Configuration: {stats.totalSent > 0 ? 'Tested' : 'Not Tested'}
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: templates.length > 0 ? 'info.dark' : 'grey.600', color: 'white' }}>
                  <Typography variant="body2">
                    📝 Templates: {templates.length} available
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsView;

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';

import { EmailList, EmailListRequest } from '../types';
import { useEmailLists } from '../hooks/useApi';
import { apiService } from '../services/api';
import { formatDate } from '../utils/dateFormat';

interface OutletContext {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ContactListsView: React.FC = () => {
  const { showSnackbar } = useOutletContext<OutletContext>();
  const { emailLists, loading, error, refetch } = useEmailLists();
  const [selectedList, setSelectedList] = useState<EmailList | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmailListRequest>({
    name: '',
    description: '',
    emails: [],
  });
  const [emailsText, setEmailsText] = useState('');

  const handleCreateNew = () => {
    setFormData({ name: '', description: '', emails: [] });
    setEmailsText('');
    setIsEditing(false);
    setSelectedList(null);
    setDialogOpen(true);
  };

  const handleEdit = (list: EmailList) => {
    setSelectedList(list);
    setFormData({
      name: list.name,
      description: list.description,
      emails: list.emails,
    });
    setEmailsText(list.emails.join('\n'));
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this email list?')) {
      try {
        await apiService.deleteEmailList(id);
        await refetch();
        showSnackbar('Email list deleted successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to delete email list', 'error');
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showSnackbar('Please enter a list name', 'warning');
      return;
    }

    // Parse emails from text
    const emails = emailsText
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    const listData: EmailListRequest = {
      name: formData.name,
      description: formData.description,
      emails,
    };

    try {
      if (isEditing && selectedList) {
        await apiService.updateEmailList(selectedList.id, listData);
        showSnackbar('Email list updated successfully', 'success');
      } else {
        await apiService.createEmailList(listData);
        showSnackbar('Email list created successfully', 'success');
      }
      
      await refetch();
      setDialogOpen(false);
      setFormData({ name: '', description: '', emails: [] });
      setEmailsText('');
      setIsEditing(false);
      setSelectedList(null);
    } catch (error) {
      showSnackbar(isEditing ? 'Failed to update email list' : 'Failed to create email list', 'error');
    }
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const emails = content
            .split(/[,\n\r]/)
            .map(email => email.trim())
            .filter(email => email && email.includes('@'));
          
          setEmailsText(emails.join('\n'));
          showSnackbar(`Imported ${emails.length} email addresses`, 'success');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportList = (list: EmailList) => {
    const csvContent = list.emails.join('\n');
    const blob = new Blob([csvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name.replace(/\s+/g, '_')}_emails.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showSnackbar('Email list exported successfully', 'success');
  };

  const handleCopyEmails = (emails: string[]) => {
    navigator.clipboard.writeText(emails.join(', '));
    showSnackbar('Email addresses copied to clipboard', 'success');
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error loading email lists: {error}</Typography>
        <Button onClick={refetch} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Contact Lists
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleCreateNew}
        >
          Create New List
        </Button>
      </Box>

      <Grid container spacing={3}>
        {emailLists.map((list) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={list.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {list.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(list)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(list.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {list.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    icon={<EmailIcon />}
                    label={`${list.emails.length} contacts`}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Updated {formatDate(list.updatedAt)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => handleCopyEmails(list.emails)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportList(list)}
                  >
                    Export
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Recent Contacts:
                </Typography>
                <Box sx={{ maxHeight: 100, overflow: 'auto' }}>
                  {list.emails.slice(0, 5).map((email, index) => (
                    <Typography key={index} variant="caption" display="block" color="text.secondary">
                      {email}
                    </Typography>
                  ))}
                  {list.emails.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      +{list.emails.length - 5} more...
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {emailLists.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
              <EmailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No contact lists yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first contact list to organize your email recipients
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={handleCreateNew}
              >
                Create Your First List
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Contact List' : 'Create New Contact List'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="List Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Newsletter Subscribers"
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this list"
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Email Addresses (one per line)
                </Typography>
                <Button
                  startIcon={<UploadIcon />}
                  onClick={handleImportCSV}
                  size="small"
                >
                  Import CSV/TXT
                </Button>
              </Box>
              
              <Box sx={{ height: 300, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Editor
                  height="300px"
                  language="plaintext"
                  value={emailsText}
                  onChange={(value) => setEmailsText(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    lineDecorationsWidth: 20,
                    lineNumbersMinChars: 3,
                  }}
                />
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {emailsText.split('\n').filter(line => line.trim() && line.includes('@')).length} valid email addresses
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? 'Update List' : 'Create List'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactListsView;

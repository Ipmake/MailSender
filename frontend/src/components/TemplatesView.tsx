import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Description as TemplateIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';

import { useTemplates } from '../hooks/useApi';
import { apiService } from '../services/api';
import { EmailTemplate } from '../types';
import { formatDate } from '../utils/dateFormat';

interface OutletContext {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const TemplatesView: React.FC = () => {
  const { showSnackbar } = useOutletContext<OutletContext>();
  const { templates, loading: templatesLoading, refetch } = useTemplates();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    text: '',
    html: '',
  });

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      text: template.text || '',
      html: template.html || '',
    });
    setIsHtmlMode(!!template.html);
    setEditDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await apiService.updateTemplate(selectedTemplate.id, {
        name: formData.name,
        subject: formData.subject,
        text: formData.text,
        html: formData.html,
      });
      await refetch();
      setEditDialogOpen(false);
      showSnackbar('Template updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update template', 'error');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await apiService.deleteTemplate(id);
        refetch();
        showSnackbar('Template deleted successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to delete template', 'error');
      }
    }
  };

  const handlePreviewTemplate = (template: any) => {
    // Create a preview window
    const previewWindow = window.open('', '_blank', 'width=600,height=800');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Template Preview: ${template.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
              .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
              .content { line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>${template.subject}</h2>
                <small>Template: ${template.name}</small>
              </div>
              <div class="content">
                ${template.html || template.text.replace(/\\n/g, '<br>')}
              </div>
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Email Templates
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => showSnackbar('Create template from Compose Email tab', 'info')}
        >
          Create Template
        </Button>
      </Box>

      {templatesLoading ? (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TemplateIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No templates yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first email template from the Compose Email tab
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={template.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {template.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTemplate(template.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Subject: {template.subject}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    {template.html ? (
                      <Chip label="HTML" size="small" color="primary" />
                    ) : (
                      <Chip label="Text" size="small" variant="outlined" />
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    {template.text || template.html?.replace(/<[^>]*>/g, '')}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Created {formatDate(template.createdAt)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Template Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mt: 2 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Content
                </Typography>
                <Button
                  onClick={() => setIsHtmlMode(!isHtmlMode)}
                  variant="outlined"
                  size="small"
                >
                  {isHtmlMode ? 'Switch to Text' : 'Switch to HTML'}
                </Button>
              </Box>
              
              <Box sx={{ height: 400, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Editor
                  height="400px"
                  language={isHtmlMode ? 'html' : 'plaintext'}
                  value={isHtmlMode ? formData.html : formData.text}
                  onChange={(value) => {
                    if (isHtmlMode) {
                      setFormData(prev => ({ ...prev, html: value || '' }));
                    } else {
                      setFormData(prev => ({ ...prev, text: value || '' }));
                    }
                  }}
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
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesView;

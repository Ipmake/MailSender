import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  Autocomplete,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Save as SaveIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
  FolderOpen as TemplateIcon,
  InsertDriveFile as DefaultTemplateIcon,
  TextFields as ExtractTextIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';

import { apiService } from '../services/api';
import { useTemplates } from '../hooks/useApi';
import { EmailRequest } from '../types';
import { htmlToText, hasHtmlContent } from '../utils/htmlToText';

interface OutletContext {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #007bff; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; line-height: 1.6; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Company Name</h1>
            <p>Professional Email Template</p>
        </div>
        <div class="content">
            <h2>Hello [Name],</h2>
            <p>This is your email content. You can customize this template with your own branding and messaging.</p>
            <p>Add your main content here. You can include:</p>
            <ul>
                <li>Important announcements</li>
                <li>Special offers</li>
                <li>News and updates</li>
                <li>Call-to-action buttons</li>
            </ul>
            <a href="#" class="button">Call to Action</a>
        </div>
        <div class="footer">
            <p>&copy; 2025 Your Company Name. All rights reserved.</p>
            <p>123 Your Street, Your City, State 12345</p>
        </div>
    </div>
</body>
</html>`;

const SendEmailView: React.FC = () => {
  const { showSnackbar } = useOutletContext<OutletContext>();
  const [email, setEmail] = useState<EmailRequest>({
    to: '',
    subject: '',
    text: '',
    html: '',
  });
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const { templates, loading: templatesLoading, refetch } = useTemplates();

  const handleSend = async () => {
    if (!email.to || !email.subject || (!email.text && !email.html)) {
      showSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      await apiService.sendEmail(email);
      showSnackbar('✅ Email sent successfully!', 'success');
      
      // Reset form
      setEmail({
        to: '',
        subject: '',
        text: '',
        html: '',
      });
    } catch (error) {
      showSnackbar(`❌ Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleSaveTemplate = async () => {
    if (!email.subject || (!email.text && !email.html)) {
      showSnackbar('Please enter subject and content first', 'warning');
      return;
    }

    setSaveTemplateDialogOpen(true);
  };

  const handleConfirmSaveTemplate = async () => {
    if (!templateName.trim()) {
      showSnackbar('Please enter a template name', 'warning');
      return;
    }

    try {
      await apiService.saveTemplate({
        name: templateName,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
      showSnackbar('✅ Template saved successfully!', 'success');
      setTemplateName('');
      setSaveTemplateDialogOpen(false);
      refetch(); // Refresh templates list
    } catch (error) {
      showSnackbar(`❌ Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleLoadTemplate = (template: any) => {
    setEmail(prev => ({
      ...prev,
      subject: template.subject,
      text: template.text,
      html: template.html,
    }));
    setTemplateDialogOpen(false);
    showSnackbar('Template loaded successfully', 'info');
  };

  const handleLoadDefaultTemplate = () => {
    setEmail(prev => ({
      ...prev,
      html: DEFAULT_HTML_TEMPLATE,
      subject: 'Professional Email Template'
    }));
    setIsHtmlMode(true);
    showSnackbar('Default HTML template loaded', 'success');
  };

  const handleExtractTextFromHtml = () => {
    if (!email.html || !hasHtmlContent(email.html)) {
      showSnackbar('No HTML content to extract from', 'warning');
      return;
    }

    const extractedText = htmlToText(email.html);
    setEmail(prev => ({
      ...prev,
      text: extractedText
    }));
    showSnackbar('Text extracted from HTML successfully', 'success');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top Toolbar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: 1, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        bgcolor: 'background.default',
        minHeight: 48
      }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSend}
            size="small"
            sx={{ minWidth: 80 }}
          >
            Send
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveTemplate}
            size="small"
          >
            Save Template
          </Button>
          <Button
            startIcon={<TemplateIcon />}
            onClick={() => setTemplateDialogOpen(true)}
            size="small"
          >
            Load Template
          </Button>
          <Button
            startIcon={<DefaultTemplateIcon />}
            onClick={handleLoadDefaultTemplate}
            size="small"
          >
            Default Template
          </Button>
          <Button
            startIcon={<ExtractTextIcon />}
            onClick={handleExtractTextFromHtml}
            size="small"
            disabled={!email.html || !hasHtmlContent(email.html)}
          >
            Extract Text
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="Text"
            variant={!isHtmlMode ? "filled" : "outlined"}
            onClick={() => setIsHtmlMode(false)}
            size="small"
          />
          <Chip
            label="HTML"
            variant={isHtmlMode ? "filled" : "outlined"}
            onClick={() => setIsHtmlMode(true)}
            size="small"
            icon={<CodeIcon />}
          />
          <IconButton
            onClick={() => setIsPreview(!isPreview)}
            size="small"
            color={isPreview ? "primary" : "default"}
          >
            <PreviewIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Email Fields */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        p: 1, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        bgcolor: 'background.default'
      }}>
        <TextField
          label="To"
          value={email.to}
          onChange={(e) => setEmail(prev => ({ ...prev, to: e.target.value }))}
          placeholder="recipient@example.com"
          size="small"
          sx={{ flex: 2 }}
        />
        <TextField
          label="Subject"
          value={email.subject}
          onChange={(e) => setEmail(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Email subject"
          size="small"
          sx={{ flex: 3 }}
        />
      </Box>

      {/* Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {isPreview && isHtmlMode ? (
          <Box sx={{ 
            width: '50%',
            p: 0, 
            bgcolor: 'transparent',
            overflow: 'hidden',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ 
              p: 1, 
              bgcolor: 'background.default',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Email Preview
              </Typography>
            </Box>
            <Box sx={{ 
              flexGrow: 1,
              overflow: 'hidden'
            }}>
              <iframe
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'white'
                }}
                srcDoc={email.html || '<p style="padding: 20px; font-family: Arial, sans-serif;">No HTML content</p>'}
                title="Email Preview"
              />
            </Box>
          </Box>
        ) : null}
        
        <Box sx={{ 
          flex: 1,
          width: isPreview && isHtmlMode ? '50%' : '100%',
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0
        }}>
          <Editor
            height="100%"
            language={isHtmlMode ? 'html' : 'plaintext'}
            value={isHtmlMode ? email.html : email.text}
            onChange={(value) => {
              if (isHtmlMode) {
                setEmail(prev => ({ ...prev, html: value || '' }));
              } else {
                setEmail(prev => ({ ...prev, text: value || '' }));
              }
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 20,
              lineNumbersMinChars: 3,
            }}
          />
        </Box>
      </Box>

      {/* Templates Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Load Template</DialogTitle>
        <DialogContent>
          {templatesLoading ? (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : templates.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No templates found
              </Typography>
            </Box>
          ) : (
            <List>
              {templates.map((template) => (
                <ListItemButton
                  key={template.id}
                  onClick={() => handleLoadTemplate(template)}
                >
                  <ListItemText
                    primary={template.name}
                    secondary={template.subject}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={saveTemplateDialogOpen} onClose={() => setSaveTemplateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Template</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Autocomplete
              freeSolo
              loading={templatesLoading}
              options={templates.map(t => t.name)}
              value={templateName}
              onInputChange={(_, newValue) => {
                setTemplateName(newValue || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Template Name"
                  placeholder="Enter template name or select existing"
                  fullWidth
                  helperText="You can type a new name or select from existing templates to overwrite"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {templatesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTemplateName('');
            setSaveTemplateDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmSaveTemplate} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SendEmailView;

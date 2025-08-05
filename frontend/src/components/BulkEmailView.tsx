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
  LinearProgress,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  ContactMail as ContactIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
  FolderOpen as TemplateIcon,
  Save as SaveIcon,
  InsertDriveFile as DefaultTemplateIcon,
  TextFields as ExtractTextIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';

import { apiService } from '../services/api';
import { useTemplates, useEmailLists } from '../hooks/useApi';
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

const BulkEmailView: React.FC = () => {
  const { showSnackbar } = useOutletContext<OutletContext>();
  const [bulkEmail, setBulkEmail] = useState({
    subject: '',
    text: '',
    html: '',
    recipients: '',
  });
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recipientCount, setRecipientCount] = useState(0);
  const [progressDetails, setProgressDetails] = useState({
    processed: 0,
    total: 0,
    successful: 0,
    failed: 0,
    currentEmail: '',
  });
  const { templates, loading: templatesLoading } = useTemplates();
  const { emailLists, loading: emailListsLoading } = useEmailLists();

  const handleContentChange = (value: string | undefined) => {
    if (isHtmlMode) {
      setBulkEmail(prev => ({ ...prev, html: value || '' }));
    } else {
      setBulkEmail(prev => ({ ...prev, text: value || '' }));
    }
  };

  const handleRecipientsChange = (value: string | undefined) => {
    setBulkEmail(prev => ({ ...prev, recipients: value || '' }));
    
    // Count valid email addresses
    const emails = (value || '')
      .split(/[,\n\r;]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@') && email.includes('.'));
    
    setRecipientCount(emails.length);
  };

  const handleSendBulkEmail = async () => {
    if (!bulkEmail.subject || (!bulkEmail.text && !bulkEmail.html) || !bulkEmail.recipients) {
      showSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    const emails = bulkEmail.recipients
      .split(/[,\n\r;]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emails.length === 0) {
      showSnackbar('No valid email addresses found', 'warning');
      return;
    }

    try {
      setIsSending(true);
      setProgress(0);
      setProgressDetails({
        processed: 0,
        total: emails.length,
        successful: 0,
        failed: 0,
        currentEmail: '',
      });

      await apiService.sendBulkEmailStream({
        recipients: emails,
        subject: bulkEmail.subject,
        text: bulkEmail.text,
        html: bulkEmail.html,
      }, (progressData) => {
        if (progressData.type === 'progress') {
          setProgress(progressData.percentage);
          setProgressDetails({
            processed: progressData.processed,
            total: progressData.total,
            successful: progressData.successful,
            failed: progressData.failed,
            currentEmail: progressData.currentEmail || '',
          });
        } else if (progressData.type === 'complete') {
          setProgress(100);
          setProgressDetails({
            processed: progressData.processed,
            total: progressData.total,
            successful: progressData.successful,
            failed: progressData.failed,
            currentEmail: '',
          });
          
          const successMessage = progressData.failed > 0 
            ? `✅ Bulk email completed! ${progressData.successful} sent, ${progressData.failed} failed out of ${progressData.total} total.`
            : `✅ Bulk email sent successfully to all ${progressData.successful} recipients!`;
          
          showSnackbar(successMessage, progressData.failed > 0 ? 'warning' : 'success');
          
          // Reset form after successful completion
          setBulkEmail({
            subject: '',
            text: '',
            html: '',
            recipients: '',
          });
          setRecipientCount(0);
        } else if (progressData.type === 'error') {
          throw new Error(progressData.error || 'Unknown error occurred');
        }
      });

    } catch (error) {
      showSnackbar(`❌ Failed to send bulk email: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsSending(false);
      setProgress(0);
      setProgressDetails({
        processed: 0,
        total: 0,
        successful: 0,
        failed: 0,
        currentEmail: '',
      });
    }
  };

  const handleLoadTemplate = (template: any) => {
    setBulkEmail(prev => ({
      ...prev,
      subject: template.subject,
      text: template.text,
      html: template.html,
    }));
    setTemplateDialogOpen(false);
    showSnackbar('Template loaded successfully', 'info');
  };

  const handleLoadContactList = (list: any) => {
    // Load actual contact list emails
    setBulkEmail(prev => ({
      ...prev,
      recipients: list.emails.join('\n'),
    }));
    setRecipientCount(list.emails.length);
    setContactDialogOpen(false);
    showSnackbar(`Loaded ${list.emails.length} contacts from ${list.name}`, 'success');
  };

  const handleLoadDefaultTemplate = () => {
    setBulkEmail(prev => ({
      ...prev,
      html: DEFAULT_HTML_TEMPLATE,
      subject: 'Professional Email Template'
    }));
    setIsHtmlMode(true);
    showSnackbar('Default HTML template loaded', 'success');
  };

  const handleSaveTemplate = async () => {
    if (!bulkEmail.subject || (!bulkEmail.text && !bulkEmail.html)) {
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
        subject: bulkEmail.subject,
        text: bulkEmail.text,
        html: bulkEmail.html,
      });
      
      showSnackbar('✅ Template saved successfully', 'success');
      setSaveTemplateDialogOpen(false);
      setTemplateName('');
    } catch (error) {
      showSnackbar(`❌ Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleExtractTextFromHtml = () => {
    if (!bulkEmail.html || !hasHtmlContent(bulkEmail.html)) {
      showSnackbar('No HTML content to extract from', 'warning');
      return;
    }

    const extractedText = htmlToText(bulkEmail.html);
    setBulkEmail(prev => ({
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
            onClick={handleSendBulkEmail}
            size="small"
            disabled={isSending || recipientCount === 0}
            sx={{ minWidth: 120 }}
          >
            {isSending ? 'Sending...' : `Send to ${recipientCount}`}
          </Button>
          <Button
            startIcon={<ContactIcon />}
            onClick={() => setContactDialogOpen(true)}
            size="small"
          >
            Load Contacts
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
            startIcon={<SaveIcon />}
            onClick={handleSaveTemplate}
            size="small"
          >
            Save Template
          </Button>
          <Button
            startIcon={<ExtractTextIcon />}
            onClick={handleExtractTextFromHtml}
            size="small"
            disabled={!bulkEmail.html || !hasHtmlContent(bulkEmail.html)}
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
          label="Subject"
          value={bulkEmail.subject}
          onChange={(e) => setBulkEmail(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Email subject"
          size="small"
          sx={{ flex: 1 }}
        />
        <TextField
          label="Recipients"
          value={`${recipientCount} contacts`}
          placeholder="No recipients loaded"
          size="small"
          disabled
          sx={{ width: 160 }}
        />
      </Box>

      {/* Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Recipients Panel */}
        <Box sx={{ 
          width: 300, 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Recipients ({recipientCount})
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              language="plaintext"
              value={bulkEmail.recipients}
              onChange={handleRecipientsChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 12,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 20,
                lineNumbersMinChars: 3,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </Box>
        </Box>

        {/* Content Editor and Preview */}
        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
          {/* HTML Preview */}
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
                  srcDoc={bulkEmail.html || '<p style="padding: 20px; font-family: Arial, sans-serif;">No HTML content</p>'}
                  title="Email Preview"
                />
              </Box>
            </Box>
          ) : null}
          
          {/* Editor */}
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
              value={isHtmlMode ? bulkEmail.html : bulkEmail.text}
              onChange={handleContentChange}
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
      </Box>

      {/* Progress Bar */}
      {isSending && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
              Sending Bulk Email
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}% complete
            </Typography>
          </Box>
          
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 1, height: 8, borderRadius: 4 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {progressDetails.processed} of {progressDetails.total} processed
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="caption" color="success.main">
                ✅ {progressDetails.successful} sent
              </Typography>
              {progressDetails.failed > 0 && (
                <Typography variant="caption" color="error.main">
                  ❌ {progressDetails.failed} failed
                </Typography>
              )}
            </Box>
          </Box>
          
          {progressDetails.currentEmail && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontFamily: 'monospace' }}>
              Current: {progressDetails.currentEmail}
            </Typography>
          )}
        </Box>
      )}

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

      {/* Contact Lists Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Load Contact List</DialogTitle>
        <DialogContent>
          {emailListsLoading ? (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : emailLists.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No contact lists found
              </Typography>
            </Box>
          ) : (
            <List>
              {emailLists.map((list) => (
                <ListItemButton
                  key={list.id}
                  onClick={() => handleLoadContactList(list)}
                >
                  <ListItemText
                    primary={list.name}
                    secondary={`${list.emails.length} contacts`}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={saveTemplateDialogOpen} onClose={() => setSaveTemplateDialogOpen(false)}>
        <DialogTitle>Save Template</DialogTitle>
        <DialogContent>
          <TextField
            label="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" paragraph>
            This will save the current email content as a template for future use.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Subject: {bulkEmail.subject}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Recipients: {recipientCount} contacts
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveTemplateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmSaveTemplate} 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkEmailView;

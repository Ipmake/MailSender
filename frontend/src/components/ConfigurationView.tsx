import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Analytics as TestIcon,
} from '@mui/icons-material';

import { apiService } from '../services/api';
import { useConfiguration } from '../hooks/useApi';
import { SMTPConfig, EmailIdentity } from '../types';

interface OutletContext {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ConfigurationView: React.FC = () => {
  const { showSnackbar } = useOutletContext<OutletContext>();
  const { config, loading, error, refetch } = useConfiguration();
  const [smtpConfig, setSmtpConfig] = React.useState<SMTPConfig>({
    host: '',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
  });
  const [identity, setIdentity] = React.useState<EmailIdentity>({
    from: { name: '', email: '' },
    replyTo: '',
    signature: '',
  });

  React.useEffect(() => {
    if (config) {
      if (config.smtp) {
        setSmtpConfig({
          host: config.smtp.host || '',
          port: config.smtp.port || 587,
          secure: config.smtp.secure || false,
          auth: { 
            user: config.smtp.user || '', 
            pass: '' // Password not returned from API for security
          },
        });
      }
      if (config.identity) {
        setIdentity(config.identity);
      }
    }
  }, [config]);

  const handleSMTPSave = async () => {
    try {
      await apiService.updateSMTPConfig(smtpConfig);
      showSnackbar('✅ SMTP configuration saved successfully', 'success');
      refetch();
    } catch (error) {
      showSnackbar(`❌ Failed to save SMTP configuration: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleIdentitySave = async () => {
    try {
      await apiService.updateEmailIdentity(identity);
      showSnackbar('✅ Email identity saved successfully', 'success');
      refetch();
    } catch (error) {
      showSnackbar(`❌ Failed to save email identity: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const testConnection = async () => {
    try {
      await apiService.testConnection();
      showSnackbar('✅ SMTP connection successful!', 'success');
    } catch (error) {
      showSnackbar(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
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
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Configuration
      </Typography>

      <Grid container spacing={4}>
        {/* SMTP Configuration */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                📮 SMTP Configuration
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    fullWidth
                    label="SMTP Host"
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Port"
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    label="Security"
                    value={smtpConfig.secure.toString()}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, secure: e.target.value === 'true' }))}
                    SelectProps={{ native: true }}
                  >
                    <option value="false">STARTTLS (Port 587)</option>
                    <option value="true">SSL/TLS (Port 465)</option>
                  </TextField>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Username/Email"
                    type="email"
                    value={smtpConfig.auth.user}
                    onChange={(e) => setSmtpConfig(prev => ({ 
                      ...prev, 
                      auth: { ...prev.auth, user: e.target.value }
                    }))}
                    placeholder="your-email@gmail.com"
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Password/App Password"
                    type="password"
                    value={smtpConfig.auth.pass}
                    onChange={(e) => setSmtpConfig(prev => ({ 
                      ...prev, 
                      auth: { ...prev.auth, pass: e.target.value }
                    }))}
                    placeholder="your-app-password"
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSMTPSave}
                    >
                      Save SMTP Config
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TestIcon />}
                      onClick={testConnection}
                    >
                      Test Connection
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Email Identity */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                👤 Email Identity
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="From Name"
                    value={identity.from.name}
                    onChange={(e) => setIdentity(prev => ({ 
                      ...prev, 
                      from: { ...prev.from, name: e.target.value }
                    }))}
                    placeholder="Your Name"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="From Email"
                    type="email"
                    value={identity.from.email}
                    onChange={(e) => setIdentity(prev => ({ 
                      ...prev, 
                      from: { ...prev.from, email: e.target.value }
                    }))}
                    placeholder="your-email@gmail.com"
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Reply-To Email"
                    type="email"
                    value={identity.replyTo}
                    onChange={(e) => setIdentity(prev => ({ ...prev, replyTo: e.target.value }))}
                    placeholder="your-email@gmail.com"
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email Signature"
                    multiline
                    rows={4}
                    value={identity.signature}
                    onChange={(e) => setIdentity(prev => ({ ...prev, signature: e.target.value }))}
                    placeholder="Best regards,&#10;Your Name"
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleIdentitySave}
                  >
                    Save Identity
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConfigurationView;

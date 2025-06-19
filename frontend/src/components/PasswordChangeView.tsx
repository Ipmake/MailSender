import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import {
  VpnKey as PasswordIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

import { apiService } from '../services/api';

interface OutletContext {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const PasswordChangeView: React.FC = () => {
  const { showSnackbar } = useOutletContext<OutletContext>();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      showSnackbar('All fields are required', 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }

    if (formData.newPassword.length < 6) {
      showSnackbar('New password must be at least 6 characters long', 'error');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      showSnackbar('New password must be different from current password', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiService.changePassword(formData.currentPassword, formData.newPassword);
      showSnackbar('Password changed successfully', 'success');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showSnackbar(`Failed to change password: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        🔐 Change Password
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PasswordIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Update Password
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 3 }}>
                Choose a strong password with at least 6 characters. Include a mix of letters, numbers, and symbols for better security.
              </Alert>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange('currentPassword')}
                      required
                      disabled={loading}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange('newPassword')}
                      required
                      disabled={loading}
                      helperText="Minimum 6 characters"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      required
                      disabled={loading}
                      error={formData.confirmPassword !== '' && formData.newPassword !== formData.confirmPassword}
                      helperText={
                        formData.confirmPassword !== '' && formData.newPassword !== formData.confirmPassword
                          ? 'Passwords do not match'
                          : ''
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                🛡️ Password Security Tips
              </Typography>

              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Use at least 6 characters (longer is better)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Mix uppercase and lowercase letters
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Include numbers and special characters
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Avoid using personal information (names, birthdays, etc.)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Don't reuse passwords from other accounts
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Consider using a password manager
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> After changing your password, you'll remain logged in on this device, 
                  but you'll need to use the new password for future logins.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PasswordChangeView;

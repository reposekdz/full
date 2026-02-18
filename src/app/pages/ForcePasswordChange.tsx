import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  Avatar,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Fade,
  Zoom
} from '@mui/material';
import {
  Lock,
  LockOpen,
  Visibility,
  VisibilityOff,
  Email,
  Person,
  CheckCircle,
  Warning,
  Shield,
  Security,
  Key,
  VpnKey,
  AdminPanelSettings,
  AccountCircle,
  SupervisorAccount,
  School,
  Assessment,
  Inventory,
  AttachMoney,
  HomeWork,
  DirectionsRun,
  Send,
  Refresh,
  Check,
  Close
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Role configurations
const roleConfigs = {
  admin: { title: 'Administrator', icon: <AdminPanelSettings />, color: '#d32f2f' },
  headmaster: { title: 'Headmaster', icon: <School />, color: '#1976d2' },
  teacher: { title: 'Teacher', icon: <SupervisorAccount />, color: '#2e7d32' },
  accountant: { title: 'Accountant', icon: <AttachMoney />, color: '#ed6c02' },
  stock_manager: { title: 'Stock Manager', icon: <Inventory />, color: '#9c27b0' },
  dos: { title: 'Director of Studies', icon: <Assessment />, color: '#0288d1' },
  dod: { title: 'Director of Discipline', icon: <DirectionsRun />, color: '#d32f2f' },
  parent: { title: 'Parent', icon: <HomeWork />, color: '#388e3c' }
};

interface ForcePasswordChangeProps {
  onComplete: (role: string) => void;
  userData?: {
    id: number;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}

const ForcePasswordChange: React.FC<ForcePasswordChangeProps> = ({ onComplete, userData }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
  const [step, setStep] = useState<'verify' | 'change'>('verify');
  const [needsChange, setNeedsChange] = useState(false);
  const [isDefaultEmail, setIsDefaultEmail] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validation, setValidation] = useState({
    emailValid: false,
    emailFormat: false,
    passwordLength: false,
    passwordMatch: false,
    passwordStrong: false,
    passwordNotDefault: false
  });

  // Get token
  const getToken = () => localStorage.getItem('token') || localStorage.getItem('auth_token');

  // Check if password change is required
  const checkCredentials = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/force-credential-change/check-default-credentials`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNeedsChange(response.data.needsChange);
        setIsDefaultEmail(response.data.isDefaultEmail);
        
        // Pre-fill email if using default
        if (response.data.isDefaultEmail && userData?.email) {
          setFormData(prev => ({ ...prev, newEmail: userData.email }));
        }
        
        setStep('change');
      }
    } catch (error) {
      console.error('Error checking credentials:', error);
      setAlert({ type: 'error', message: 'Failed to verify credentials. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    checkCredentials();
  }, [checkCredentials]);

  // Validate form
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newEmail = formData.newEmail;
    const newPassword = formData.newPassword;
    const confirmPassword = formData.confirmPassword;

    setValidation({
      emailFormat: emailRegex.test(newEmail) && !newEmail.includes('@reponsekdz06.com'),
      emailValid: newEmail.length > 0,
      passwordLength: newPassword.length >= 8,
      passwordMatch: newPassword === confirmPassword && newPassword.length > 0,
      passwordStrong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword),
      passwordNotDefault: newPassword !== '2026' && newPassword !== 'password' && newPassword !== 'default'
    });
  }, [formData]);

  // Calculate overall validity
  const isFormValid = validation.emailFormat && 
    validation.passwordLength && 
    validation.passwordMatch && 
    validation.passwordStrong && 
    validation.passwordNotDefault;

  // Handle input change
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
    setAlert(null);
  };

  // Handle submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isFormValid) {
      setAlert({ type: 'error', message: 'Please fix all validation errors before submitting.' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const token = getToken();
      const response = await axios.post(
        `${API_BASE_URL}/force-credential-change/force-change-credentials`,
        {
          userId: userData?.id,
          currentPassword: formData.currentPassword,
          newEmail: formData.newEmail,
          newPassword: formData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Password changed successfully! Redirecting...' });
        
        // Store that password has been changed
        localStorage.setItem('password_changed', 'true');
        
        setTimeout(() => {
          onComplete(userData?.role || 'admin');
        }, 1500);
      } else {
        setAlert({ type: 'error', message: response.data.message || 'Failed to change password' });
      }
    } catch (error: any) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to change password. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get role configuration
  const roleConfig = userData?.role ? roleConfigs[userData.role as keyof typeof roleConfigs] : null;
  const roleColor = roleConfig?.color || '#1976d2';

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: roleColor }} />
          <Typography variant="h6" sx={{ mt: 2 }}>Verifying credentials...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#f5f5f5',
      py: 4
    }}>
      <Container maxWidth="md">
        <Zoom in>
          <Card sx={{ 
            maxWidth: 700, 
            mx: 'auto',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            overflow: 'visible'
          }}>
            {/* Header */}
            <Box sx={{ 
              bgcolor: roleColor,
              color: 'white',
              p: 4,
              textAlign: 'center',
              borderRadius: '12px 12px 0 0',
              position: 'relative',
              overflow: 'visible'
            }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'white',
                color: roleColor,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}>
                <Shield sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700}>
                Security Update Required
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                Your account requires a security update. Please change your credentials below.
              </Typography>
              {roleConfig && (
                <Chip 
                  icon={React.cloneElement(roleConfig.icon, { sx: { color: 'white !important' } })}
                  label={roleConfig.title}
                  sx={{ 
                    mt: 2, 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              )}
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Alert */}
              {alert && (
                <Alert 
                  severity={alert.type} 
                  onClose={() => setAlert(null)}
                  sx={{ mb: 3 }}
                  icon={alert.type === 'success' ? <CheckCircle /> : alert.type === 'warning' ? <Warning /> : <Security />}
                >
                  {alert.message}
                </Alert>
              )}

              {/* User Info */}
              {userData && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="primary" />
                        <Typography variant="body2">
                          <strong>Name:</strong> {userData.first_name} {userData.last_name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email color="primary" />
                        <Typography variant="body2">
                          <strong>Current:</strong> {userData.email}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Warning */}
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={500}>
                  Important Security Requirements:
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding sx={{ ml: 1 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}><Check fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Email must be a valid email address (not default domain)" />
                  </ListItem>
                  <ListItem disablePadding sx={{ ml: 1 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}><Check fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Password must be at least 8 characters long" />
                  </ListItem>
                  <ListItem disablePadding sx={{ ml: 1 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}><Check fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Password must contain uppercase, lowercase, number & special character" />
                  </ListItem>
                  <ListItem disablePadding sx={{ ml: 1 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}><Check fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Cannot use default passwords like '2026'" />
                  </ListItem>
                </List>
              </Alert>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Current Password */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      label="Current Password"
                      value={formData.currentPassword}
                      onChange={handleChange('currentPassword')}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* New Email */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="email"
                      label="New Email Address"
                      value={formData.newEmail}
                      onChange={handleChange('newEmail')}
                      required
                      error={formData.newEmail.length > 0 && !validation.emailFormat}
                      helperText={
                        !validation.emailFormat && formData.newEmail.length > 0 
                          ? 'Please enter a valid email (not @reponsekdz06.com)' 
                          : validation.emailFormat 
                            ? '✓ Valid email address' 
                            : ''
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* New Password */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      label="New Password"
                      value={formData.newPassword}
                      onChange={handleChange('newPassword')}
                      required
                      error={formData.newPassword.length > 0 && !validation.passwordStrong}
                      helperText={
                        formData.newPassword.length > 0 && !validation.passwordStrong
                          ? 'Must be 8+ chars with uppercase, lowercase, number & special char'
                          : ''
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VpnKey />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* Confirm Password */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      required
                      error={formData.confirmPassword.length > 0 && !validation.passwordMatch}
                      helperText={
                        formData.confirmPassword.length > 0 && !validation.passwordMatch
                          ? 'Passwords do not match'
                          : validation.passwordMatch && formData.confirmPassword.length > 0
                            ? '✓ Passwords match'
                            : ''
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Key />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* Password Strength Indicator */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Password Strength:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {['passwordLength', 'passwordStrong', 'passwordMatch', 'passwordNotDefault'].map((key) => (
                          <Box
                            key={key}
                            sx={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: validation[key as keyof typeof validation] ? 'success.main' : 'grey.200',
                              transition: 'all 0.3s'
                            }}
                          />
                        ))}
                      </Box>
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {validation.passwordLength ? <Check color="success" fontSize="small" /> : <Close color="disabled" fontSize="small" />}
                            <Typography variant="caption">8+ characters</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {validation.passwordStrong ? <Check color="success" fontSize="small" /> : <Close color="disabled" fontSize="small" />}
                            <Typography variant="caption">Strong (A-Z, a-z, 0-9, !@#)</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {validation.passwordMatch ? <Check color="success" fontSize="small" /> : <Close color="disabled" fontSize="small" />}
                            <Typography variant="caption">Passwords match</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {validation.passwordNotDefault ? <Check color="success" fontSize="small" /> : <Close color="disabled" fontSize="small" />}
                            <Typography variant="caption">Not default password</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={submitting || !isFormValid}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <LockOpen />}
                      sx={{ 
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: roleColor,
                        '&:hover': { bgcolor: roleColor, filter: 'brightness(0.9)' },
                        '&:disabled': { bgcolor: 'grey.300' }
                      }}
                    >
                      {submitting ? 'Updating Credentials...' : 'Update Credentials'}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              {/* Security Note */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                <Security color="primary" sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                <Typography variant="caption" color="text.secondary">
                  Your credentials are encrypted and stored securely. 
                  After updating, you will be redirected to your dashboard.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Zoom>
      </Container>
    </Box>
  );
};

export default ForcePasswordChange;

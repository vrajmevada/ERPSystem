import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Stack,
  Divider,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

// icons
import UserOutlined from '@ant-design/icons/UserOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import KeyOutlined from '@ant-design/icons/KeyOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';
import SaveOutlined from '@ant-design/icons/SaveOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import useAuth from 'hooks/useAuth';

// avatar assets
import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-2.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';
import avatar5 from 'assets/images/users/avatar-5.png';

const avatars = [
  { id: 'avatar-1', src: avatar1, label: 'Avatar 1' },
  { id: 'avatar-2', src: avatar2, label: 'Avatar 2' },
  { id: 'avatar-3', src: avatar3, label: 'Avatar 3' },
  { id: 'avatar-4', src: avatar4, label: 'Avatar 4' },
  { id: 'avatar-5', src: avatar5, label: 'Avatar 5' }
];

const avatarsMap = {
  'avatar-1': avatar1,
  'avatar-2': avatar2,
  'avatar-3': avatar3,
  'avatar-4': avatar4,
  'avatar-5': avatar5
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-settings-tabpanel-${index}`}
      aria-labelledby={`profile-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const roleName = user?.role || 'Administrator';
  const systemRole = user?.role?.trim().toLowerCase() || 'user';

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam ? parseInt(tabParam, 10) : 0;

  // Personal Info Form State
  const [fullName, setFullName] = useState(localStorage.getItem('erp-user-fullname') || 'John Doe');
  const [email, setEmail] = useState(localStorage.getItem('erp-user-email') || 'vraj@erpsystem.com');
  const [phone, setPhone] = useState(localStorage.getItem('erp-user-phone') || '+1 (555) 019-2834');
  const [location, setLocation] = useState(localStorage.getItem('erp-user-location') || 'Gujarat, India');
  const [department, setDepartment] = useState(localStorage.getItem('erp-user-department') || 'Information Technology');
  const [bio, setBio] = useState(
    localStorage.getItem('erp-user-bio') ||
      'ERP System Administrator overseeing security permissions, configurations, and core operational databases.'
  );
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem('erp-user-avatar') || 'avatar-1');

  // Preference Settings State
  const [emailAlerts, setEmailAlerts] = useState(localStorage.getItem('erp-pref-email-alerts') !== 'false');
  const [twoFactor, setTwoFactor] = useState(localStorage.getItem('erp-pref-2fa') === 'true');
  const [systemNotifications, setSystemNotifications] = useState(localStorage.getItem('erp-pref-sys-notify') !== 'false');

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Notification States
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleTabChange = (event, newValue) => {
    setSearchParams({ tab: newValue });
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('erp-user-fullname', fullName);
      localStorage.setItem('erp-user-email', email);
      localStorage.setItem('erp-user-phone', phone);
      localStorage.setItem('erp-user-location', location);
      localStorage.setItem('erp-user-department', department);
      localStorage.setItem('erp-user-bio', bio);
      localStorage.setItem('erp-user-avatar', selectedAvatar);

      // Trigger custom event to notify Header Profile
      window.dispatchEvent(new Event('profile-update'));

      showNotification('Profile details updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Failed to save profile details', 'error');
    }
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem('erp-pref-email-alerts', emailAlerts);
      localStorage.setItem('erp-pref-2fa', twoFactor);
      localStorage.setItem('erp-pref-sys-notify', systemNotifications);
      showNotification('Preferences updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Failed to save preferences', 'error');
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    // Success Mock
    setPasswordSuccess('Password changed successfully! (Simulation only)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showNotification('Password updated successfully!', 'success');
  };

  // Matrix of role permissions
  const getRolePermissions = () => {
    const modules = [
      { name: 'Products', admin: 'CRUD', manager: 'CRU', user: 'R' },
      { name: 'Categories', admin: 'CRUD', manager: 'CRU', user: 'R' },
      { name: 'Customers', admin: 'CRUD', manager: 'CRU', user: 'R' },
      { name: 'Suppliers', admin: 'CRUD', manager: 'CRU', user: 'R' },
      { name: 'Warehouses', admin: 'CRUD', manager: 'CRU', user: 'R' },
      { name: 'Transactions', admin: 'CRUD', manager: 'CRU', user: 'R' },
      { name: 'Purchase Orders', admin: 'CRUD', manager: 'CRU', user: 'R' },
      { name: 'Sales Orders', admin: 'CRUD', manager: 'CRU', user: 'R' },
      { name: 'Audit Logs', admin: 'CRUD', manager: 'R', user: 'None' }
    ];

    return modules.map((m) => {
      const access = m[systemRole] || 'R';
      return {
        module: m.name,
        read: access !== 'None',
        write: access.includes('C') || access.includes('U') || access.includes('D'),
        delete: access.includes('D')
      };
    });
  };

  const permissions = getRolePermissions();

  return (
    <Box>
      {/* Banner / Header Summary */}
      <Card sx={{ mb: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Box
          sx={{
            height: 140,
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            position: 'relative'
          }}
        />
        <CardContent sx={{ pt: 0, pb: 3, px: 3 }}>
          <Grid container spacing={3} alignItems="flex-end" sx={{ mt: -6 }}>
            <Grid item>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  borderRadius: '50%',
                  border: '4px solid #fff',
                  backgroundColor: '#fff',
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              >
                <Avatar
                  alt="avatar"
                  src={avatarsMap[selectedAvatar] || avatar1}
                  size="xl"
                  sx={{ width: 100, height: 100 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm>
              <Stack spacing={0.5} sx={{ mb: { xs: 2, sm: 0 } }}>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {fullName}
                </Typography>
                <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="body1" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
                    {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EnvironmentOutlined />
                    {location}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MailOutlined />
                    {email}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item sx={{ ml: 'auto' }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<UserOutlined />}
                onClick={() => setSearchParams({ tab: 0 })}
              >
                Edit Bio
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs section */}
      <MainCard content={false}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile configuration tabs">
            <Tab icon={<UserOutlined />} label="Personal Details" iconPosition="start" />
            <Tab icon={<SettingOutlined />} label="Account Settings" iconPosition="start" />
            <Tab icon={<LockOutlined />} label="Security & Activity" iconPosition="start" />
            <Tab icon={<SafetyCertificateOutlined />} label="Permissions & Role" iconPosition="start" />
          </Tabs>
        </Box>

        <Box sx={{ px: 3, pb: 2 }}>
          {/* Tab 1: Personal Details */}
          <TabPanel value={activeTab} index={0}>
            <form onSubmit={handleSaveDetails}>
              <Grid container spacing={4}>
                {/* Left Side: Avatar selection */}
                <Grid item xs={12} md={4} sx={{ textAlign: 'center', borderRight: { md: '1px solid' }, borderColor: { md: 'divider' } }}>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    Profile Avatar
                  </Typography>
                  <Avatar
                    alt="Current Avatar"
                    src={avatarsMap[selectedAvatar] || avatar1}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 3, border: '1px solid', borderColor: 'divider' }}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Choose one of the presets below to personalize your display image:
                  </Typography>
                  <Grid container spacing={1.5} justifyContent="center">
                    {avatars.map((av) => (
                      <Grid item key={av.id}>
                        <Box
                          onClick={() => setSelectedAvatar(av.id)}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: '50%',
                            p: 0.5,
                            border: '2px solid',
                            borderColor: selectedAvatar === av.id ? 'primary.main' : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              borderColor: 'primary.light'
                            }
                          }}
                        >
                          <Avatar alt={av.label} src={av.src} size="sm" />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Right Side: Inputs */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" sx={{ mb: 3 }}>
                    Contact & Personal Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Username (Read-Only)"
                        value={user?.username || 'admin'}
                        disabled
                        fullWidth
                        helperText="Used during authentication"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Bio / Notes"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    <Button
                      variant="contained"
                      type="submit"
                      startIcon={<SaveOutlined />}
                      sx={{ px: 4 }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </TabPanel>

          {/* Tab 2: Account Settings & Preferences */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  ERP Alert & System Configurations
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                  Customize your personal notifications, integration parameters, and interface parameters.
                </Typography>

                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="h6">Email Alerts</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Receive daily digests and critical stock alert warnings directly on your email.
                        </Typography>
                      </Box>
                    }
                  />

                  <Divider />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemNotifications}
                        onChange={(e) => setSystemNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="h6">Push Notifications</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Enable immediate in-app desktop notifications when new sales or purchase orders are requested.
                        </Typography>
                      </Box>
                    }
                  />

                  <Divider />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={twoFactor}
                        onChange={(e) => setTwoFactor(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="h6">Two-Factor Authentication (2FA)</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Secure your ERP login using authenticator push codes. (Highly recommended for managers/admins)
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
                  <Button
                    variant="contained"
                    onClick={handleSavePreferences}
                    startIcon={<SaveOutlined />}
                    sx={{ px: 4 }}
                  >
                    Save Preferences
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      System Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">ENVIRONMENT</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Production Cluster (Vite + .NET API)</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">API GATEWAY URL</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>/api (Proxied)</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">CLIENT AGENT</Typography>
                        <Typography variant="body2">Web Browser (React 19.2.6)</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 3: Security & Activity */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={4}>
              {/* Password change form */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  Change Account Password
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  Modify your login access codes regularly to maintain ERP security bounds.
                </Typography>

                <form onSubmit={handlePasswordChange}>
                  <Stack spacing={3}>
                    {passwordError && <Alert severity="error">{passwordError}</Alert>}
                    {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}

                    <TextField
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                      <Button
                        variant="contained"
                        type="submit"
                        startIcon={<KeyOutlined />}
                      >
                        Update Password
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </Grid>

              {/* Login history log */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryOutlined />
                  Recent Sign-in Activity
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  Review login access logs associated with your user session identifiers.
                </Typography>

                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      position: 'relative',
                      bgcolor: 'rgba(24, 144, 255, 0.03)',
                      borderLeft: '4px solid #1890ff'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Current Session — Web Browser (Chrome / Windows)
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      IP: 192.168.1.45 • Location: Ahmedabad, India
                    </Typography>
                    <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, fontWeight: 600 }}>
                      <CheckCircleOutlined /> Active Session Now
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Mobile Browser (Safari / Apple iPad)
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      IP: 103.88.22.14 • Location: Gandhinagar, India
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      June 15, 2026, 06:12 PM
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Edge Browser / Android Mobile
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      IP: 122.161.12.180 • Location: Mumbai, India
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      June 12, 2026, 09:30 AM
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 4: System Permissions Matrix */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                System Authorization Matrix
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Your account is bound to the{' '}
                <Typography component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {roleName}
                </Typography>{' '}
                role group. Below is a comprehensive audit checklist of your module write, update, and deletion rights.
              </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table aria-label="permissions lookup matrix">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Module / Feature Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Read Access</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Write/Create Access</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Deletion Access</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((row) => (
                    <TableRow key={row.module} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{row.module}</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-flex',
                            px: 1.5,
                            py: 0.25,
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: row.read ? 'success.lighter' : 'error.lighter',
                            color: row.read ? 'success.main' : 'error.main'
                          }}
                        >
                          {row.read ? 'GRANTED' : 'REVOKED'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-flex',
                            px: 1.5,
                            py: 0.25,
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: row.write ? 'success.lighter' : 'error.lighter',
                            color: row.write ? 'success.main' : 'error.main'
                          }}
                        >
                          {row.write ? 'GRANTED' : 'REVOKED'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-flex',
                            px: 1.5,
                            py: 0.25,
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: row.delete ? 'success.lighter' : 'error.lighter',
                            color: row.delete ? 'success.main' : 'error.main'
                          }}
                        >
                          {row.delete ? 'GRANTED' : 'REVOKED'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Box>
      </MainCard>

      {/* Action Toast Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Dashboard,
  CheckCircle,
  Cancel,
  Schedule,
  Assessment,
  TrendingUp,
  Person,
  School,
  Work,
  Phone,
  Email,
  LocationOn,
  History,
  Comment,
  Star,
  ExpandMore,
  Visibility,
  Edit,
  Delete,
  Send,
  Download,
  Print,
  Refresh,
  Warning,
  Priority,
  Analytics,
  Assignment,
  Gavel
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const HeadmasterApplicationsManagement = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [bulkDecision, setBulkDecision] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filters, setFilters] = useState({
    status: '',
    trade_code: '',
    priority: 'all'
  });

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/headmaster-applications/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch dashboard data', 'error');
    }
  };

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/headmaster-applications/applications?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboard();
    fetchApplications();
  }, [fetchApplications]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle final decision
  const handleFinalDecision = async (applicationId, decision, reason, notes) => {
    try {
      const response = await fetch(`/api/headmaster-applications/applications/${applicationId}/final-decision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reason,
          headmaster_notes: notes
        })
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar(`Application ${decision} successfully`, 'success');
        fetchApplications();
        fetchDashboard();
        setDialogOpen(false);
      } else {
        showSnackbar(data.message || 'Failed to process decision', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to process final decision', 'error');
    }
  };

  // Handle bulk decision
  const handleBulkDecision = async () => {
    if (!bulkDecision || selectedApplications.length === 0) return;

    try {
      const response = await fetch('/api/headmaster-applications/applications/bulk-decision', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_ids: selectedApplications,
          decision: bulkDecision,
          reason: decisionReason
        })
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar(data.message, 'success');
        setSelectedApplications([]);
        setBulkDecision('');
        setDecisionReason('');
        fetchApplications();
        fetchDashboard();
      }
    } catch (error) {
      showSnackbar('Failed to process bulk decision', 'error');
    }
  };

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#f44336';
      case 'urgent': return '#ff9800';
      default: return '#4caf50';
    }
  };

  // Status configurations
  const statusConfig = {
    pending: { color: 'warning', label: 'Pending Review', icon: <Schedule /> },
    under_review: { color: 'info', label: 'Under Review', icon: <Assessment /> },
    approved: { color: 'success', label: 'Approved', icon: <CheckCircle /> },
    rejected: { color: 'error', label: 'Rejected', icon: <Cancel /> },
    waitlisted: { color: 'secondary', label: 'Waitlisted', icon: <Schedule /> },
    enrolled: { color: 'primary', label: 'Enrolled', icon: <School /> }
  };

  // Dashboard Cards
  const DashboardCard = ({ title, value, icon, color, subtitle }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card sx={{ 
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
        height: '100%'
      }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant="body2" fontWeight="medium">
                {title}
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold" color={color}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="textSecondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar sx={{ bgcolor: color, width: 60, height: 60 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Application Card
  const ApplicationCard = ({ application }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card sx={{ 
        mb: 2, 
        border: '1px solid #e0e0e0',
        borderLeft: `4px solid ${getPriorityColor(application.priority_level)}`,
        '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }
      }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={1}>
              <Checkbox
                checked={selectedApplications.includes(application.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedApplications([...selectedApplications, application.id]);
                  } else {
                    setSelectedApplications(selectedApplications.filter(id => id !== application.id));
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: statusConfig[application.status]?.color + '.main' }}>
                  {statusConfig[application.status]?.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {application.first_name} {application.last_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" fontFamily="monospace">
                    {application.application_number}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Chip
                label={statusConfig[application.status]?.label}
                color={statusConfig[application.status]?.color}
                size="small"
                icon={statusConfig[application.status]?.icon}
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Work fontSize="small" />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {application.trade_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Level {application.level_number}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Priority fontSize="small" style={{ color: getPriorityColor(application.priority_level) }} />
                <Typography variant="body2" style={{ color: getPriorityColor(application.priority_level) }}>
                  {application.priority_level.toUpperCase()}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={1}>
              <Typography variant="body2" color="textSecondary">
                {application.days_since_application}d
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={1}>
              <Box display="flex" gap={0.5}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedApplication(application);
                      setDialogOpen(true);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Quick Approve">
                  <IconButton 
                    size="small" 
                    color="success"
                    onClick={() => handleFinalDecision(application.id, 'approved', 'Quick approval', 'Approved by Headmaster')}
                  >
                    <CheckCircle />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Decision Dialog
  const DecisionDialog = () => {
    const [decision, setDecision] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    return (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Final Decision - {selectedApplication?.application_number}
            </Typography>
            <Chip
              label={statusConfig[selectedApplication?.status]?.label}
              color={statusConfig[selectedApplication?.status]?.color}
              icon={statusConfig[selectedApplication?.status]?.icon}
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Application Details" icon={<Person />} />
            <Tab label="Academic Info" icon={<School />} />
            <Tab label="Decision" icon={<Gavel />} />
          </Tabs>
          
          <Box mt={2}>
            {activeTab === 0 && selectedApplication && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Personal Information</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Person /></ListItemIcon>
                      <ListItemText
                        primary="Full Name"
                        secondary={`${selectedApplication.first_name} ${selectedApplication.last_name}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Phone /></ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={selectedApplication.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Email /></ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={selectedApplication.email || 'Not provided'}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Application Details</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Work /></ListItemIcon>
                      <ListItemText
                        primary="Trade & Level"
                        secondary={`${selectedApplication.trade_name} - Level ${selectedApplication.level_number}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Schedule /></ListItemIcon>
                      <ListItemText
                        primary="Applied"
                        secondary={`${selectedApplication.days_since_application} days ago`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Priority /></ListItemIcon>
                      <ListItemText
                        primary="Priority"
                        secondary={selectedApplication.priority_level?.toUpperCase()}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && selectedApplication && (
              <Box>
                <Typography variant="h6" gutterBottom>Academic Background</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Education Level</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedApplication.education_level}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Previous School</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedApplication.previous_school}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Reason for Applying</Typography>
                    <Typography variant="body1">{selectedApplication.reason_for_applying}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>Headmaster Final Decision</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Decision</InputLabel>
                      <Select
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                      >
                        <MenuItem value="approved">✅ Approve Application</MenuItem>
                        <MenuItem value="rejected">❌ Reject Application</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Decision Reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Brief reason for decision"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Headmaster Notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes or comments..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {activeTab === 2 && (
            <Button
              variant="contained"
              color={decision === 'approved' ? 'success' : 'error'}
              onClick={() => handleFinalDecision(selectedApplication?.id, decision, reason, notes)}
              disabled={!decision || !reason}
              startIcon={decision === 'approved' ? <CheckCircle /> : <Cancel />}
            >
              {decision === 'approved' ? 'Approve' : 'Reject'} Application
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box p={3} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold" color="white" textAlign="center" mb={4}>
          🎓 Headmaster Applications Management
        </Typography>
      </motion.div>

      {/* Dashboard Cards */}
      {dashboardData && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={2}>
            <DashboardCard
              title="Total Applications"
              value={dashboardData.overview.total_applications}
              icon={<Assessment />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DashboardCard
              title="Pending Review"
              value={dashboardData.overview.pending}
              icon={<Schedule />}
              color="#ed6c02"
              subtitle="Awaiting decision"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DashboardCard
              title="Approved"
              value={dashboardData.overview.approved}
              icon={<CheckCircle />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DashboardCard
              title="Rejected"
              value={dashboardData.overview.rejected}
              icon={<Cancel />}
              color="#d32f2f"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DashboardCard
              title="This Week"
              value={dashboardData.overview.this_week}
              icon={<TrendingUp />}
              color="#7b1fa2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DashboardCard
              title="Today"
              value={dashboardData.overview.today}
              icon={<Analytics />}
              color="#0288d1"
            />
          </Grid>
        </Grid>
      )}

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedApplications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card sx={{ mb: 2, bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedApplications.length} applications selected
                    </Typography>
                  </Grid>
                  <Grid item>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel sx={{ color: 'white' }}>Bulk Decision</InputLabel>
                      <Select
                        value={bulkDecision}
                        onChange={(e) => setBulkDecision(e.target.value)}
                        sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
                      >
                        <MenuItem value="approved">✅ Approve All</MenuItem>
                        <MenuItem value="rejected">❌ Reject All</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <TextField
                      size="small"
                      placeholder="Reason for bulk decision"
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { color: 'white' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleBulkDecision}
                      disabled={!bulkDecision || !decisionReason}
                      startIcon={<Send />}
                    >
                      Apply Decision
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button 
                      color="inherit"
                      onClick={() => setSelectedApplications([])}
                      startIcon={<Cancel />}
                    >
                      Clear
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applications List */}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      
      <AnimatePresence>
        <Box>
          {applications.map(application => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </Box>
      </AnimatePresence>

      {/* Decision Dialog */}
      <DecisionDialog />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HeadmasterApplicationsManagement;
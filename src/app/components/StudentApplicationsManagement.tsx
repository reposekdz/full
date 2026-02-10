import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Pagination
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  Phone,
  Email,
  LocationOn,
  School,
  Work,
  Assessment,
  Notifications,
  Analytics,
  FileUpload,
  Send,
  History,
  Comment,
  Star,
  ExpandMore,
  Refresh,
  Print,
  Share
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const StudentApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    trade_code: '',
    province_id: '',
    search: '',
    date_from: null,
    date_to: null
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [analytics, setAnalytics] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [trades, setTrades] = useState([]);

  // Status colors and labels
  const statusConfig = {
    pending: { color: 'warning', label: 'Pending', icon: <Schedule /> },
    under_review: { color: 'info', label: 'Under Review', icon: <Assessment /> },
    approved: { color: 'success', label: 'Approved', icon: <CheckCircle /> },
    rejected: { color: 'error', label: 'Rejected', icon: <Cancel /> },
    waitlisted: { color: 'secondary', label: 'Waitlisted', icon: <Schedule /> },
    enrolled: { color: 'primary', label: 'Enrolled', icon: <School /> }
  };

  // Fetch applications with filters
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`/api/student-applications/list?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total_records,
          totalPages: data.pagination.total_pages
        }));
      }
    } catch (error) {
      showSnackbar('Failed to fetch applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/student-applications/analytics/dashboard');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  // Fetch reference data
  const fetchReferenceData = async () => {
    try {
      const [provincesRes, tradesRes] = await Promise.all([
        fetch('/api/student-applications/locations/provinces'),
        fetch('/api/student-applications/trades')
      ]);

      const [provincesData, tradesData] = await Promise.all([
        provincesRes.json(),
        tradesRes.json()
      ]);

      if (provincesData.success) setProvinces(provincesData.data);
      if (tradesData.success) setTrades(tradesData.data);
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchAnalytics();
    fetchReferenceData();
  }, [fetchApplications]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleStatusUpdate = async (applicationId, newStatus, reason = '') => {
    try {
      const response = await fetch(`/api/student-applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reason,
          reviewer_id: 1 // Current user ID
        })
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('Application status updated successfully', 'success');
        fetchApplications();
        fetchAnalytics();
      } else {
        showSnackbar(data.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update application status', 'error');
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkAction || selectedApplications.length === 0) return;

    try {
      const response = await fetch('/api/student-applications/bulk/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_ids: selectedApplications,
          status: bulkAction,
          reason: 'Bulk status update',
          reviewer_id: 1
        })
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar(`${selectedApplications.length} applications updated`, 'success');
        setSelectedApplications([]);
        setBulkAction('');
        fetchApplications();
        fetchAnalytics();
      }
    } catch (error) {
      showSnackbar('Failed to update applications', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/student-applications/export/csv?${queryParams}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showSnackbar('Export completed successfully', 'success');
      }
    } catch (error) {
      showSnackbar('Failed to export applications', 'error');
    }
  };

  const ApplicationCard = ({ application }) => (
    <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ bgcolor: statusConfig[application.status]?.color + '.main' }}>
                {statusConfig[application.status]?.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" noWrap>
                  {application.first_name} {application.last_name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
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
            <Box display="flex" alignItems="center" gap={0.5}>
              <Work fontSize="small" color="action" />
              <Typography variant="body2" noWrap>
                {application.trade_name}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" noWrap>
                {application.province_name}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="textSecondary">
              {application.days_since_application} days ago
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
              
              <Tooltip title="Quick Actions">
                <IconButton size="small">
                  <Edit />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const AnalyticsCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const ApplicationDetailsDialog = () => (
    <Dialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Application Details - {selectedApplication?.application_number}
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
          <Tab label="Personal Info" icon={<Person />} />
          <Tab label="Documents" icon={<FileUpload />} />
          <Tab label="History" icon={<History />} />
          <Tab label="Communications" icon={<Comment />} />
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
                  <ListItem>
                    <ListItemIcon><LocationOn /></ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={`${selectedApplication.province_name}, ${selectedApplication.district_name}`}
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
                      primary="Trade"
                      secondary={selectedApplication.trade_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><School /></ListItemIcon>
                    <ListItemText
                      primary="Level"
                      secondary={`Level ${selectedApplication.level_number}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Schedule /></ListItemIcon>
                    <ListItemText
                      primary="Applied Date"
                      secondary={new Date(selectedApplication.created_at).toLocaleDateString()}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Uploaded Documents</Typography>
              <Typography color="textSecondary">
                {selectedApplication?.document_count || 0} documents uploaded
              </Typography>
              {/* Document list would go here */}
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Status History</Typography>
              {/* Status history timeline would go here */}
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Communications</Typography>
              {/* Communications log would go here */}
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>Close</Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => handleStatusUpdate(selectedApplication?.id, 'approved')}
          disabled={selectedApplication?.status === 'approved'}
        >
          Approve
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleStatusUpdate(selectedApplication?.id, 'rejected')}
          disabled={selectedApplication?.status === 'rejected'}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Student Applications Management
        </Typography>

        {/* Analytics Cards */}
        {analytics && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={2}>
              <AnalyticsCard
                title="Total"
                value={analytics.overall.total_applications}
                icon={<Assessment />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <AnalyticsCard
                title="Pending"
                value={analytics.overall.pending}
                icon={<Schedule />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <AnalyticsCard
                title="Under Review"
                value={analytics.overall.under_review}
                icon={<Assessment />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <AnalyticsCard
                title="Approved"
                value={analytics.overall.approved}
                icon={<CheckCircle />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <AnalyticsCard
                title="Rejected"
                value={analytics.overall.rejected}
                icon={<Cancel />}
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <AnalyticsCard
                title="Today"
                value={analytics.overall.today_applications}
                icon={<Notifications />}
                color="secondary"
              />
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search applications..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  InputProps={{
                    startAdornment: <Search />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <MenuItem key={key} value={key}>{config.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trade</InputLabel>
                  <Select
                    value={filters.trade_code}
                    onChange={(e) => setFilters(prev => ({ ...prev, trade_code: e.target.value }))}
                  >
                    <MenuItem value="">All Trades</MenuItem>
                    {trades.map(trade => (
                      <MenuItem key={trade.code} value={trade.code}>{trade.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Province</InputLabel>
                  <Select
                    value={filters.province_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, province_id: e.target.value }))}
                  >
                    <MenuItem value="">All Provinces</MenuItem>
                    {provinces.map(province => (
                      <MenuItem key={province.id} value={province.id}>{province.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={fetchApplications}
                  startIcon={<Search />}
                >
                  Search
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleExport}
                  startIcon={<Download />}
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedApplications.length > 0 && (
          <Card sx={{ mb: 2, bgcolor: 'action.hover' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Typography variant="body1">
                    {selectedApplications.length} applications selected
                  </Typography>
                </Grid>
                <Grid item>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Bulk Action</InputLabel>
                    <Select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                    >
                      <MenuItem value="approved">Approve All</MenuItem>
                      <MenuItem value="rejected">Reject All</MenuItem>
                      <MenuItem value="under_review">Mark Under Review</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={handleBulkStatusUpdate}
                    disabled={!bulkAction}
                  >
                    Apply
                  </Button>
                </Grid>
                <Grid item>
                  <Button onClick={() => setSelectedApplications([])}>
                    Clear Selection
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Applications List */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        <Box>
          {applications.map(application => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </Box>

        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
            color="primary"
            size="large"
          />
        </Box>

        {/* Application Details Dialog */}
        <ApplicationDetailsDialog />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default StudentApplicationsManagement;
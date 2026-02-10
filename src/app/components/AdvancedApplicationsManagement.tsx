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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
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
  Share,
  Add,
  Build,
  Code,
  Construction,
  DirectionsCar,
  TrendingUp,
  Dashboard,
  Settings
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    trade_code: '',
    level_number: '',
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
  const [trades, setTrades] = useState([]);
  const [levels, setLevels] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Trade configurations with icons and colors
  const tradeConfig = {
    AUT: { 
      name: 'Automotive Technology', 
      icon: <DirectionsCar />, 
      color: '#FF6B35',
      levels: [4, 5],
      description: 'Vehicle repair and maintenance'
    },
    BDC: { 
      name: 'Building & Construction', 
      icon: <Construction />, 
      color: '#4ECDC4',
      levels: [3, 4, 5],
      description: 'Construction and building techniques'
    },
    SOD: { 
      name: 'Software Development', 
      icon: <Code />, 
      color: '#45B7D1',
      levels: [3, 4, 5],
      description: 'Programming and software engineering'
    }
  };

  // Status configurations
  const statusConfig = {
    pending: { color: 'warning', label: 'Pending', icon: <Schedule />, bgColor: '#FFF3CD' },
    under_review: { color: 'info', label: 'Under Review', icon: <Assessment />, bgColor: '#D1ECF1' },
    approved: { color: 'success', label: 'Approved', icon: <CheckCircle />, bgColor: '#D4EDDA' },
    rejected: { color: 'error', label: 'Rejected', icon: <Cancel />, bgColor: '#F8D7DA' },
    waitlisted: { color: 'secondary', label: 'Waitlisted', icon: <Schedule />, bgColor: '#E2E3E5' },
    enrolled: { color: 'primary', label: 'Enrolled', icon: <School />, bgColor: '#CCE5FF' }
  };

  // Fetch applications with advanced filtering
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

  // Fetch trades and levels
  const fetchTradesAndLevels = async () => {
    try {
      const [tradesRes, levelsRes] = await Promise.all([
        fetch('/api/student-applications/trades'),
        fetch('/api/student-applications/levels')
      ]);

      const [tradesData, levelsData] = await Promise.all([
        tradesRes.json(),
        levelsRes.json()
      ]);

      if (tradesData.success) setTrades(tradesData.data);
      if (levelsData.success) setLevels(levelsData.data);
    } catch (error) {
      console.error('Failed to fetch trades and levels:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchAnalytics();
    fetchTradesAndLevels();
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
          reviewer_id: 1
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

  // Advanced Application Card Component
  const ApplicationCard = ({ application }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        sx={{ 
          mb: 2, 
          border: '1px solid #e0e0e0',
          borderLeft: `4px solid ${tradeConfig[application.trade_code]?.color || '#ccc'}`,
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: statusConfig[application.status]?.color + '.main',
                    width: 50,
                    height: 50
                  }}
                >
                  {statusConfig[application.status]?.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" noWrap fontWeight="bold">
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
                sx={{ fontWeight: 'bold' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Box display="flex" alignItems="center" gap={1}>
                {tradeConfig[application.trade_code]?.icon}
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {tradeConfig[application.trade_code]?.name || application.trade_code}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Level {application.level_number}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2" noWrap>
                  {application.phone}
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
                    sx={{ color: 'primary.main' }}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Quick Actions">
                  <IconButton size="small" sx={{ color: 'secondary.main' }}>
                    <Edit />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Analytics Dashboard Component
  const AnalyticsDashboard = () => (
    <Grid container spacing={3} mb={3}>
      {analytics && Object.entries({
        total: { label: 'Total Applications', icon: <Assessment />, color: '#1976d2' },
        pending: { label: 'Pending', icon: <Schedule />, color: '#ed6c02' },
        under_review: { label: 'Under Review', icon: <Assessment />, color: '#0288d1' },
        approved: { label: 'Approved', icon: <CheckCircle />, color: '#2e7d32' },
        rejected: { label: 'Rejected', icon: <Cancel />, color: '#d32f2f' },
        today_applications: { label: 'Today', icon: <TrendingUp />, color: '#7b1fa2' }
      }).map(([key, config]) => (
        <Grid item xs={12} sm={6} md={2} key={key}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card sx={{ 
              background: `linear-gradient(135deg, ${config.color}15, ${config.color}05)`,
              border: `1px solid ${config.color}30`
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2" fontWeight="medium">
                      {config.label}
                    </Typography>
                    <Typography variant="h4" component="div" fontWeight="bold" color={config.color}>
                      {analytics.overall[key] || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: config.color, width: 56, height: 56 }}>
                    {config.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );

  // Advanced Filters Component
  const AdvancedFilters = () => (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          Advanced Filters & Search
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search applications..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {config.icon}
                      {config.label}
                    </Box>
                  </MenuItem>
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
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="">All Trades</MenuItem>
                {Object.entries(tradeConfig).map(([code, config]) => (
                  <MenuItem key={code} value={code}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {config.icon}
                      {config.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select
                value={filters.level_number}
                onChange={(e) => setFilters(prev => ({ ...prev, level_number: e.target.value }))}
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="3">Level 3</MenuItem>
                <MenuItem value="4">Level 4</MenuItem>
                <MenuItem value="5">Level 5</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchApplications}
              startIcon={<Search />}
              sx={{ height: 40 }}
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
              sx={{ height: 40 }}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box p={3} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold" color="white" textAlign="center" mb={4}>
          🎓 Advanced Student Applications Management
        </Typography>
      </motion.div>

      <AnalyticsDashboard />
      <AdvancedFilters />

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedApplications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card sx={{ mb: 2, bgcolor: 'action.hover', border: '2px solid primary.main' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Typography variant="h6" color="primary" fontWeight="bold">
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
                        <MenuItem value="approved">✅ Approve All</MenuItem>
                        <MenuItem value="rejected">❌ Reject All</MenuItem>
                        <MenuItem value="under_review">🔍 Mark Under Review</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleBulkStatusUpdate}
                      disabled={!bulkAction}
                      startIcon={<Send />}
                    >
                      Apply
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button 
                      onClick={() => setSelectedApplications([])}
                      startIcon={<Cancel />}
                    >
                      Clear Selection
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

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={pagination.totalPages}
          page={pagination.page}
          onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
          color="primary"
          size="large"
          sx={{ 
            '& .MuiPaginationItem-root': { 
              bgcolor: 'white',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white'
              }
            }
          }}
        />
      </Box>

      {/* Floating Action Button */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Refresh />}
          tooltipTitle="Refresh Data"
          onClick={() => {
            fetchApplications();
            fetchAnalytics();
          }}
        />
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="View Analytics"
          onClick={() => setActiveTab(1)}
        />
        <SpeedDialAction
          icon={<Download />}
          tooltipTitle="Export Data"
          onClick={handleExport}
        />
      </SpeedDial>

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

export default AdvancedApplicationsManagement;
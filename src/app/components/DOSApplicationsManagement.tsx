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
  AccordionDetails,
  Rating,
  Slider
} from '@mui/material';
import {
  School,
  Assessment,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  Person,
  Work,
  Phone,
  Email,
  History,
  Comment,
  Star,
  ExpandMore,
  Visibility,
  Edit,
  Send,
  Download,
  Refresh,
  Warning,
  Priority,
  Analytics,
  Assignment,
  Grade,
  MenuBook,
  Psychology,
  Recommend,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const DOSApplicationsManagement = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [bulkReview, setBulkReview] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filters, setFilters] = useState({
    education_level: '',
    trade_code: '',
    priority: 'all'
  });

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/dos-applications/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch dashboard data', 'error');
    }
  };

  // Fetch applications for academic review
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/dos-applications/applications/academic-review?${queryParams}`);
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

  // Handle academic review
  const handleAcademicReview = async (applicationId, reviewData) => {
    try {
      const response = await fetch(`/api/dos-applications/applications/${applicationId}/academic-review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('Academic review completed successfully', 'success');
        fetchApplications();
        fetchDashboard();
        setDialogOpen(false);
      } else {
        showSnackbar(data.message || 'Failed to complete academic review', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to complete academic review', 'error');
    }
  };

  // Handle bulk academic review
  const handleBulkReview = async () => {
    if (!bulkReview || selectedApplications.length === 0) return;

    try {
      const response = await fetch('/api/dos-applications/applications/bulk-academic-review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_ids: selectedApplications,
          academic_status: bulkReview,
          notes: `Bulk academic review: ${bulkReview}`
        })
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar(data.message, 'success');
        setSelectedApplications([]);
        setBulkReview('');
        fetchApplications();
        fetchDashboard();
      }
    } catch (error) {
      showSnackbar('Failed to process bulk review', 'error');
    }
  };

  // Get academic priority color
  const getAcademicPriorityColor = (priority) => {
    switch (priority) {
      case 'High Priority': return '#f44336';
      case 'Medium Priority': return '#ff9800';
      default: return '#4caf50';
    }
  };

  // Education level configurations
  const educationConfig = {
    'Primary': { color: '#ff9800', icon: <MenuBook /> },
    'Secondary': { color: '#2196f3', icon: <School /> },
    'TVET': { color: '#4caf50', icon: <Assessment /> },
    'University': { color: '#9c27b0', icon: <Psychology /> }
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

  // Application Card for Academic Review
  const AcademicReviewCard = ({ application }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card sx={{ 
        mb: 2, 
        border: '1px solid #e0e0e0',
        borderLeft: `4px solid ${getAcademicPriorityColor(application.academic_priority)}`,
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
                <Avatar sx={{ bgcolor: educationConfig[application.education_level]?.color }}>
                  {educationConfig[application.education_level]?.icon}
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
                label={application.education_level}
                color={application.education_level === 'TVET' ? 'success' : 'primary'}
                size="small"
                icon={educationConfig[application.education_level]?.icon}
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
                <Priority fontSize="small" style={{ color: getAcademicPriorityColor(application.academic_priority) }} />
                <Typography variant="body2" style={{ color: getAcademicPriorityColor(application.academic_priority) }}>
                  {application.academic_priority}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={1}>
              <Typography variant="body2" color="textSecondary">
                {application.years_since_completion ? `${application.years_since_completion}y gap` : 'Recent'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={1}>
              <Box display="flex" gap={0.5}>
                <Tooltip title="Academic Review">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedApplication(application);
                      setDialogOpen(true);
                    }}
                  >
                    <Assessment />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Quick Pass">
                  <IconButton 
                    size="small" 
                    color="success"
                    onClick={() => handleAcademicReview(application.id, {
                      academic_status: 'pass',
                      academic_notes: 'Quick academic approval',
                      prerequisites_met: true,
                      academic_score: 7
                    })}
                  >
                    <ThumbUp />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Academic Review Dialog
  const AcademicReviewDialog = () => {
    const [academicStatus, setAcademicStatus] = useState('');
    const [academicNotes, setAcademicNotes] = useState('');
    const [recommendedLevel, setRecommendedLevel] = useState('');
    const [prerequisitesMet, setPrerequisitesMet] = useState(true);
    const [academicScore, setAcademicScore] = useState(5);

    return (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Academic Review - {selectedApplication?.application_number}
            </Typography>
            <Chip
              label={selectedApplication?.education_level}
              color="primary"
              icon={educationConfig[selectedApplication?.education_level]?.icon}
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Academic Background" icon={<School />} />
            <Tab label="Trade Requirements" icon={<Work />} />
            <Tab label="Academic Review" icon={<Assessment />} />
          </Tabs>
          
          <Box mt={2}>
            {activeTab === 0 && selectedApplication && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Educational Background</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><School /></ListItemIcon>
                      <ListItemText
                        primary="Education Level"
                        secondary={selectedApplication.education_level}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><MenuBook /></ListItemIcon>
                      <ListItemText
                        primary="Previous School"
                        secondary={selectedApplication.previous_school}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Schedule /></ListItemIcon>
                      <ListItemText
                        primary="Years Since Completion"
                        secondary={selectedApplication.years_since_completion ? `${selectedApplication.years_since_completion} years` : 'Recent graduate'}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Academic Priority</Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Priority style={{ color: getAcademicPriorityColor(selectedApplication.academic_priority) }} />
                    <Typography variant="h6" style={{ color: getAcademicPriorityColor(selectedApplication.academic_priority) }}>
                      {selectedApplication.academic_priority}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Priority based on education level and completion timeline
                  </Typography>
                  <Typography variant="body1">
                    <strong>Reason for Applying:</strong><br />
                    {selectedApplication.reason_for_applying}
                  </Typography>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && selectedApplication && (
              <Box>
                <Typography variant="h6" gutterBottom>Trade Requirements Analysis</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="h6" gutterBottom>Applied Trade</Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Work />
                        <Box>
                          <Typography variant="h5">{selectedApplication.trade_name}</Typography>
                          <Typography variant="body2">Level {selectedApplication.level_number}</Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                      <Typography variant="h6" gutterBottom>Academic Match</Typography>
                      <Typography variant="body1">
                        {selectedApplication.education_level === 'TVET' ? 
                          '✅ Excellent match - Technical background' :
                          selectedApplication.education_level === 'Secondary' ?
                          '✅ Good match - Meets requirements' :
                          '⚠️ Basic requirements - May need support'
                        }
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>DOS Academic Review</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Academic Status</InputLabel>
                      <Select
                        value={academicStatus}
                        onChange={(e) => setAcademicStatus(e.target.value)}
                      >
                        <MenuItem value="pass">✅ Pass - Meets Academic Requirements</MenuItem>
                        <MenuItem value="fail">❌ Fail - Does Not Meet Requirements</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Recommended Level</InputLabel>
                      <Select
                        value={recommendedLevel}
                        onChange={(e) => setRecommendedLevel(e.target.value)}
                      >
                        <MenuItem value="">Keep Current Level</MenuItem>
                        <MenuItem value="3">Level 3</MenuItem>
                        <MenuItem value="4">Level 4</MenuItem>
                        <MenuItem value="5">Level 5</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={prerequisitesMet}
                          onChange={(e) => setPrerequisitesMet(e.target.checked)}
                        />
                      }
                      label="Prerequisites Met"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Academic Score (1-10)</Typography>
                    <Slider
                      value={academicScore}
                      onChange={(e, newValue) => setAcademicScore(newValue)}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Academic Review Notes"
                      value={academicNotes}
                      onChange={(e) => setAcademicNotes(e.target.value)}
                      placeholder="Detailed academic assessment notes..."
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
              color={academicStatus === 'pass' ? 'success' : 'error'}
              onClick={() => handleAcademicReview(selectedApplication?.id, {
                academic_status: academicStatus,
                academic_notes: academicNotes,
                recommended_level: recommendedLevel,
                prerequisites_met: prerequisitesMet,
                academic_score: academicScore
              })}
              disabled={!academicStatus}
              startIcon={academicStatus === 'pass' ? <ThumbUp /> : <ThumbDown />}
            >
              Complete Academic Review
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box p={3} sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold" color="white" textAlign="center" mb={4}>
          📚 DOS Academic Applications Review
        </Typography>
      </motion.div>

      {/* Dashboard Cards */}
      {dashboardData && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Total Applications"
              value={dashboardData.academic_overview.total_applications}
              icon={<Assessment />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Pending Review"
              value={dashboardData.academic_overview.pending_review}
              icon={<Schedule />}
              color="#ed6c02"
              subtitle="Awaiting academic review"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Under Review"
              value={dashboardData.academic_overview.under_review}
              icon={<Psychology />}
              color="#7b1fa2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Approved"
              value={dashboardData.academic_overview.approved}
              icon={<CheckCircle />}
              color="#2e7d32"
            />
          </Grid>
        </Grid>
      )}

      {/* Bulk Academic Review */}
      <AnimatePresence>
        {selectedApplications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card sx={{ mb: 2, bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedApplications.length} applications selected for academic review
                    </Typography>
                  </Grid>
                  <Grid item>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel sx={{ color: 'white' }}>Bulk Academic Review</InputLabel>
                      <Select
                        value={bulkReview}
                        onChange={(e) => setBulkReview(e.target.value)}
                        sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
                      >
                        <MenuItem value="pass">✅ Pass All - Meet Requirements</MenuItem>
                        <MenuItem value="fail">❌ Fail All - Don't Meet Requirements</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleBulkReview}
                      disabled={!bulkReview}
                      startIcon={<Send />}
                    >
                      Apply Review
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
            <AcademicReviewCard key={application.id} application={application} />
          ))}
        </Box>
      </AnimatePresence>

      {/* Academic Review Dialog */}
      <AcademicReviewDialog />

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

export default DOSApplicationsManagement;
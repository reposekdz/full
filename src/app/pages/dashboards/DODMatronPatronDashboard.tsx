import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Gavel,
  EventNote,
  PersonSearch,
  Edit,
  Delete,
  Visibility,
  Add,
  Refresh,
  CheckCircle,
  Warning,
  Cancel,
  Search,
  Description,
  Phone,
  Email,
  School,
  BarChart,
  TrendingUp,
  PersonOff
} from '@mui/icons-material';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const DODMatronPatronDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  const [dashboard, setDashboard] = useState<any>(null);
  const [disciplineRecords, setDisciplineRecords] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [openDisciplineDialog, setOpenDisciplineDialog] = useState(false);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [openConductDialog, setOpenConductDialog] = useState(false);
  const [openStudentDetails, setOpenStudentDetails] = useState(false);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  
  const [disciplineForm, setDisciplineForm] = useState({
    student_id: '',
    incident_type: '',
    incident_description: '',
    incident_date: new Date().toISOString().split('T')[0],
    severity: 'minor',
    action_taken: '',
    witnesses: '',
    location: ''
  });
  
  const [leaveForm, setLeaveForm] = useState({
    student_id: '',
    leave_type: 'sick',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    emergency_contact: '',
    destination: ''
  });
  
  const [conductForm, setConductForm] = useState({
    student_id: '',
    academic_year: new Date().getFullYear().toString(),
    term: '1',
    conduct_score: 100,
    behavior_notes: '',
    recommendations: ''
  });
  
  const [filters, setFilters] = useState({
    search: '',
    trade_code: '',
    level_number: '',
    status: 'active',
    severity: '',
    leave_status: ''
  });

  useEffect(() => {
    fetchDashboard();
    fetchDisciplineRecords();
    fetchLeaves();
    fetchStudents();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/dod-matron-patron/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      showAlert('error', 'Failed to load dashboard');
    }
  };

  const fetchDisciplineRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.severity) params.append('severity', filters.severity);
      
      const response = await axios.get(
        `${API_BASE_URL}/dod-matron-patron/discipline-records?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setDisciplineRecords(response.data.records);
      }
    } catch (error) {
      console.error('Fetch discipline records error:', error);
      showAlert('error', 'Failed to load discipline records');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.leave_status) params.append('status', filters.leave_status);
      
      const response = await axios.get(
        `${API_BASE_URL}/dod-matron-patron/student-leaves?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setLeaves(response.data.leaves);
      }
    } catch (error) {
      console.error('Fetch leaves error:', error);
      showAlert('error', 'Failed to load leave requests');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.trade_code) params.append('trade_code', filters.trade_code);
      if (filters.level_number) params.append('level_number', filters.level_number);
      if (filters.status) params.append('status', filters.status);
      
      const response = await axios.get(
        `${API_BASE_URL}/dod-matron-patron/students?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Fetch students error:', error);
      showAlert('error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (student_id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/dod-matron-patron/students/${student_id}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setStudentDetails(response.data);
        setOpenStudentDetails(true);
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to load student details');
    }
  };

  const handleAddDiscipline = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/dod-matron-patron/discipline-records`,
        disciplineForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', 'Discipline record created and parent notified via SMS');
        setOpenDisciplineDialog(false);
        fetchDisciplineRecords();
        fetchDashboard();
        resetDisciplineForm();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to create discipline record');
    }
  };

  const handleAddLeave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/dod-matron-patron/student-leaves`,
        leaveForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', 'Leave request created successfully');
        setOpenLeaveDialog(false);
        fetchLeaves();
        fetchDashboard();
        resetLeaveForm();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to create leave request');
    }
  };

  const handleApproveLeave = async (leave_id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/dod-matron-patron/student-leaves/${leave_id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', `Leave ${status} and parent notified via SMS`);
        fetchLeaves();
        fetchDashboard();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to update leave request');
    }
  };

  const handleAddConduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/dod-matron-patron/student-conduct`,
        conductForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', 'Conduct record saved successfully');
        setOpenConductDialog(false);
        fetchDashboard();
        resetConductForm();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to save conduct record');
    }
  };

  const resetDisciplineForm = () => {
    setDisciplineForm({
      student_id: '',
      incident_type: '',
      incident_description: '',
      incident_date: new Date().toISOString().split('T')[0],
      severity: 'minor',
      action_taken: '',
      witnesses: '',
      location: ''
    });
  };

  const resetLeaveForm = () => {
    setLeaveForm({
      student_id: '',
      leave_type: 'sick',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      reason: '',
      emergency_contact: '',
      destination: ''
    });
  };

  const resetConductForm = () => {
    setConductForm({
      student_id: '',
      academic_year: new Date().getFullYear().toString(),
      term: '1',
      conduct_score: 100,
      behavior_notes: '',
      recommendations: ''
    });
  };

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'major': return 'warning';
      case 'minor': return 'info';
      default: return 'default';
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getConductColor = (grade: string) => {
    switch (grade) {
      case 'Excellent': return 'success';
      case 'Good': return 'primary';
      case 'Fair': return 'warning';
      case 'Poor': return 'error';
      default: return 'default';
    }
  };

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Statistics Cards */}
      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboard?.discipline?.total_records || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Discipline Records (30d)
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                <Gavel sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboard?.discipline?.critical_cases || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Critical Cases
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                <Warning sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboard?.leaves?.pending_leaves || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Pending Leave Requests
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                <EventNote sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboard?.conduct?.students_tracked || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Students Tracked
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                <BarChart sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Conduct Grade Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Student Conduct Distribution
            </Typography>
            {dashboard?.conduct_trends && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboard.conduct_trends}
                    dataKey="student_count"
                    nameKey="conduct_grade"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.conduct_grade}: ${entry.student_count}`}
                  >
                    {dashboard.conduct_trends.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Discipline Records */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Discipline Cases
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard?.recent_discipline?.slice(0, 5).map((record: any) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {record.first_name} {record.last_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {record.student_code}
                        </Typography>
                      </TableCell>
                      <TableCell>{record.incident_type}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.severity}
                          color={getSeverityColor(record.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(record.incident_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Leave Requests */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Pending Leave Requests</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenLeaveDialog(true)}
              >
                Create Leave Request
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white' }}>Student</TableCell>
                    <TableCell sx={{ color: 'white' }}>Type</TableCell>
                    <TableCell sx={{ color: 'white' }}>Period</TableCell>
                    <TableCell sx={{ color: 'white' }}>Reason</TableCell>
                    <TableCell sx={{ color: 'white' }}>Guardian</TableCell>
                    <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard?.pending_leaves?.map((leave: any) => (
                    <TableRow key={leave.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {leave.first_name} {leave.last_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {leave.trade_code} L{leave.level_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={leave.leave_type} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{leave.reason?.substring(0, 50)}...</TableCell>
                      <TableCell>
                        <Typography variant="caption">{leave.guardian_name}</Typography><br />
                        <Typography variant="caption" color="textSecondary">{leave.guardian_phone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveLeave(leave.id, 'approved')}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleApproveLeave(leave.id, 'rejected')}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDiscipline = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" gap={2}>
          <TextField
            placeholder="Search student..."
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={filters.severity}
              label="Severity"
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="minor">Minor</MenuItem>
              <MenuItem value="major">Major</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={fetchDisciplineRecords}
          >
            Search
          </Button>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenDisciplineDialog(true)}
        >
          Add Discipline Record
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Student</TableCell>
                <TableCell sx={{ color: 'white' }}>Incident Type</TableCell>
                <TableCell sx={{ color: 'white' }}>Description</TableCell>
                <TableCell sx={{ color: 'white' }}>Severity</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Reported By</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disciplineRecords.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{new Date(record.incident_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {record.first_name} {record.last_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {record.student_code} - {record.trade_code} L{record.level_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{record.incident_type}</TableCell>
                  <TableCell>{record.incident_description?.substring(0, 60)}...</TableCell>
                  <TableCell>
                    <Chip
                      label={record.severity}
                      color={getSeverityColor(record.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={record.status === 'resolved' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {record.reported_by_first_name} {record.reported_by_last_name}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="info">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderLeaves = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.leave_status}
            label="Status"
            onChange={(e) => {
              setFilters({ ...filters, leave_status: e.target.value });
              fetchLeaves();
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenLeaveDialog(true)}
        >
          Create Leave Request
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Student</TableCell>
              <TableCell sx={{ color: 'white' }}>Type</TableCell>
              <TableCell sx={{ color: 'white' }}>Start Date</TableCell>
              <TableCell sx={{ color: 'white' }}>End Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Reason</TableCell>
              <TableCell sx={{ color: 'white' }}>Guardian Contact</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {leave.first_name} {leave.last_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {leave.student_code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={leave.leave_type} size="small" color="primary" />
                </TableCell>
                <TableCell>{new Date(leave.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(leave.end_date).toLocaleDateString()}</TableCell>
                <TableCell>{leave.reason?.substring(0, 50)}...</TableCell>
                <TableCell>
                  <Typography variant="caption">{leave.guardian_name}</Typography><br />
                  <Typography variant="caption" color="textSecondary">{leave.guardian_phone}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={leave.status}
                    color={getLeaveStatusColor(leave.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {leave.status === 'pending' && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApproveLeave(leave.id, 'approved')}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleApproveLeave(leave.id, 'rejected')}
                        >
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderStudents = () => (
    <Box>
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search by name or code..."
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trade</InputLabel>
          <Select
            value={filters.trade_code}
            label="Trade"
            onChange={(e) => setFilters({ ...filters, trade_code: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="AUT">AUT</MenuItem>
            <MenuItem value="BDC">BDC</MenuItem>
            <MenuItem value="SOD">SOD</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Level</InputLabel>
          <Select
            value={filters.level_number}
            label="Level"
            onChange={(e) => setFilters({ ...filters, level_number: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="3">Level 3</MenuItem>
            <MenuItem value="4">Level 4</MenuItem>
            <MenuItem value="5">Level 5</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="graduated">Graduated</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Search />} onClick={fetchStudents}>
          Search
        </Button>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => {
          setFilters({ search: '', trade_code: '', level_number: '', status: 'active', severity: '', leave_status: '' });
          fetchStudents();
        }}>
          Reset
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}>Student Code</TableCell>
                <TableCell sx={{ color: 'white' }}>Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Trade/Level</TableCell>
                <TableCell sx={{ color: 'white' }}>Gender</TableCell>
                <TableCell sx={{ color: 'white' }}>Guardian Info</TableCell>
                <TableCell sx={{ color: 'white' }}>Discipline Count</TableCell>
                <TableCell sx={{ color: 'white' }}>Conduct Grade</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.student_id} hover>
                  <TableCell>{student.student_code}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {student.first_name} {student.last_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{student.trade_code} L{student.level_number}{student.level_suffix || ''}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>
                    <Typography variant="caption">{student.guardian_name}</Typography><br />
                    <Typography variant="caption" color="textSecondary">{student.guardian_phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.discipline_count || 0}
                      color={student.discipline_count > 3 ? 'error' : student.discipline_count > 0 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {student.latest_conduct_grade ? (
                      <Chip
                        label={student.latest_conduct_grade}
                        color={getConductColor(student.latest_conduct_grade)}
                        size="small"
                      />
                    ) : (
                      <Typography variant="caption" color="textSecondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.status}
                      color={student.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Full Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => fetchStudentDetails(student.student_id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Discipline Record">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setDisciplineForm({ ...disciplineForm, student_id: student.student_id });
                          setOpenDisciplineDialog(true);
                        }}
                      >
                        <Gavel />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Conduct">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => {
                          setConductForm({ ...conductForm, student_id: student.student_id });
                          setOpenConductDialog(true);
                        }}
                      >
                        <BarChart />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
          DOD / Matron / Patron Management
        </Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchDashboard}>
          Refresh
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" />
        <Tab label="Discipline Records" />
        <Tab label="Leave Management" />
        <Tab label="Student Directory" />
      </Tabs>

      {activeTab === 0 && dashboard && renderDashboard()}
      {activeTab === 1 && renderDiscipline()}
      {activeTab === 2 && renderLeaves()}
      {activeTab === 3 && renderStudents()}

      {/* Add Discipline Dialog */}
      <Dialog open={openDisciplineDialog} onClose={() => setOpenDisciplineDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Discipline Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student ID *"
                type="number"
                value={disciplineForm.student_id}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, student_id: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Incident Type *"
                value={disciplineForm.incident_type}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, incident_type: e.target.value })}
                placeholder="e.g., Fighting, Disrespect, Theft"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Severity *</InputLabel>
                <Select
                  value={disciplineForm.severity}
                  label="Severity *"
                  onChange={(e) => setDisciplineForm({ ...disciplineForm, severity: e.target.value })}
                >
                  <MenuItem value="minor">Minor</MenuItem>
                  <MenuItem value="major">Major</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Incident Description *"
                value={disciplineForm.incident_description}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, incident_description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Incident Date"
                type="date"
                value={disciplineForm.incident_date}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, incident_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={disciplineForm.location}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, location: e.target.value })}
                placeholder="e.g., Classroom 101, Playground"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Action Taken"
                multiline
                rows={2}
                value={disciplineForm.action_taken}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, action_taken: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Witnesses (comma separated)"
                value={disciplineForm.witnesses}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, witnesses: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDisciplineDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddDiscipline}
            disabled={!disciplineForm.student_id || !disciplineForm.incident_type || !disciplineForm.incident_description}
          >
            Add Record & Notify Parent
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Leave Dialog */}
      <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Leave Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student ID *"
                type="number"
                value={leaveForm.student_id}
                onChange={(e) => setLeaveForm({ ...leaveForm, student_id: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Leave Type *</InputLabel>
                <Select
                  value={leaveForm.leave_type}
                  label="Leave Type *"
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                >
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="family">Family Emergency</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="personal">Personal</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                value={leaveForm.start_date}
                onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date *"
                type="date"
                value={leaveForm.end_date}
                onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason *"
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Destination"
                value={leaveForm.destination}
                onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={leaveForm.emergency_contact}
                onChange={(e) => setLeaveForm({ ...leaveForm, emergency_contact: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLeaveDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddLeave}
            disabled={!leaveForm.student_id || !leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason}
          >
            Create Leave Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conduct Dialog */}
      <Dialog open={openConductDialog} onClose={() => setOpenConductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Student Conduct</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student ID *"
                type="number"
                value={conductForm.student_id}
                onChange={(e) => setConductForm({ ...conductForm, student_id: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Academic Year *"
                value={conductForm.academic_year}
                onChange={(e) => setConductForm({ ...conductForm, academic_year: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Term *</InputLabel>
                <Select
                  value={conductForm.term}
                  label="Term *"
                  onChange={(e) => setConductForm({ ...conductForm, term: e.target.value })}
                >
                  <MenuItem value="1">Term 1</MenuItem>
                  <MenuItem value="2">Term 2</MenuItem>
                  <MenuItem value="3">Term 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Conduct Score (0-100) *"
                type="number"
                value={conductForm.conduct_score}
                onChange={(e) => setConductForm({ ...conductForm, conduct_score: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Behavior Notes"
                value={conductForm.behavior_notes}
                onChange={(e) => setConductForm({ ...conductForm, behavior_notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Recommendations"
                value={conductForm.recommendations}
                onChange={(e) => setConductForm({ ...conductForm, recommendations: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConductDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddConduct}
            disabled={!conductForm.student_id}
          >
            Save Conduct Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={openStudentDetails} onClose={() => setOpenStudentDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Student Details - {studentDetails?.student?.first_name} {studentDetails?.student?.last_name}
        </DialogTitle>
        <DialogContent>
          {studentDetails && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Student Code" secondary={studentDetails.student.student_code} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Gender" secondary={studentDetails.student.gender} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Trade/Level" secondary={`${studentDetails.student.trade_code} Level ${studentDetails.student.level_number}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Status" secondary={studentDetails.student.status} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Guardian Information</Typography>
                    {studentDetails.linked_parent ? (
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Name" 
                            secondary={`${studentDetails.linked_parent.first_name} ${studentDetails.linked_parent.last_name}`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Phone" secondary={studentDetails.linked_parent.phone} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Email" secondary={studentDetails.linked_parent.email} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Relationship" secondary={studentDetails.linked_parent.relationship} />
                        </ListItem>
                      </List>
                    ) : (
                      <Alert severity="warning">No linked parent found</Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Discipline Records ({studentDetails.discipline_records.length})</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentDetails.discipline_records.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.incident_date).toLocaleDateString()}</TableCell>
                          <TableCell>{record.incident_type}</TableCell>
                          <TableCell>
                            <Chip label={record.severity} color={getSeverityColor(record.severity)} size="small" />
                          </TableCell>
                          <TableCell>{record.incident_description?.substring(0, 50)}...</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStudentDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DODMatronPatronDashboard;

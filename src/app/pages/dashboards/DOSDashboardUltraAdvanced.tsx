import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  Chip,
  IconButton,
  Tab,
  Tabs,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Avatar,
  Badge
} from '@mui/material';
import {
  Dashboard,
  People,
  School,
  Assessment,
  TrendingUp,
  Add,
  Edit,
  Delete,
  Search,
  Download,
  CalendarToday,
  AttachMoney,
  Assignment,
  Group,
  LocalLibrary,
  PeopleAlt,
  Person,
  PersonAdd,
  BarChart,
  CheckCircle,
  Cancel,
  Warning
} from '@mui/icons-material';
import axios from 'axios';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface DashboardData {
  students: any;
  teachers: any;
  trades: any[];
  levels: any[];
  recent_activities: any[];
  financial: any;
}

const DOSDashboardUltraAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  
  const [openAddStudent, setOpenAddStudent] = useState(false);
  const [openAddTeacher, setOpenAddTeacher] = useState(false);
  const [openAssignTeacher, setOpenAssignTeacher] = useState(false);
  const [openGenerateReport, setOpenGenerateReport] = useState(false);
  
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [newStudent, setNewStudent] = useState({
    student_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    trade_code: '',
    level_number: '',
    level_suffix: '',
    guardian_name: '',
    guardian_phone: ''
  });

  const [teacherAssignment, setTeacherAssignment] = useState({
    teacher_id: '',
    subject_id: '',
    trade_code: '',
    level_number: '',
    level_suffix: '',
    weekly_periods: 4
  });

  const [reportConfig, setReportConfig] = useState({
    trade_code: '',
    level_number: '',
    level_suffix: '',
    term: 1,
    academic_year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/dos-ultra-advanced/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showAlert('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTrade) params.append('trade_code', selectedTrade);
      if (selectedLevel) params.append('level_number', selectedLevel);
      
      const response = await axios.get(`${API_BASE_URL}/dos-ultra-advanced/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      showAlert('error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/dos-ultra-advanced/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showAlert('error', 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/dos-ultra-advanced/students/add`, newStudent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert('success', 'Student added successfully');
      setOpenAddStudent(false);
      fetchDashboardData();
      fetchStudents();
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleAssignTeacher = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/dos-ultra-advanced/teachers/assign-subject`, teacherAssignment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert('success', 'Teacher assigned successfully');
      setOpenAssignTeacher(false);
      fetchTeachers();
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to assign teacher');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/dos-ultra-advanced/reports/generate`, reportConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert('success', `Report generated successfully with ${response.data.reports.length} students`);
      setOpenGenerateReport(false);
      
      // Download report as JSON
      const dataStr = JSON.stringify(response.data.reports, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${reportConfig.trade_code}_L${reportConfig.level_number}_T${reportConfig.term}.json`;
      link.click();
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to generate report');
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    if (activeTab === 1) fetchStudents();
    if (activeTab === 2) fetchTeachers();
  }, [activeTab, searchQuery, selectedTrade, selectedLevel]);

  const renderDashboardOverview = () => (
    <Grid container spacing={3}>
      {/* Statistics Cards */}
      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">{dashboard?.students?.total_students || 0}</Typography>
                <Typography variant="body2">Total Students</Typography>
              </Box>
              <School fontSize="large" />
            </Box>
            <LinearProgress variant="determinate" value={75} sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">{dashboard?.teachers?.total_teachers || 0}</Typography>
                <Typography variant="body2">Total Teachers</Typography>
              </Box>
              <PeopleAlt fontSize="large" />
            </Box>
            <Typography variant="caption">{dashboard?.teachers?.assigned_teachers || 0} Assigned</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">{dashboard?.students?.avg_gpa?.toFixed(2) || '0.00'}</Typography>
                <Typography variant="body2">Average GPA</Typography>
              </Box>
              <TrendingUp fontSize="large" />
            </Box>
            <Typography variant="caption">{dashboard?.students?.avg_attendance?.toFixed(1) || 0}% Attendance</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">{dashboard?.financial?.collected_revenue ? (dashboard.financial.collected_revenue / 1000000).toFixed(1) + 'M' : '0'}</Typography>
                <Typography variant="body2">Revenue (RWF)</Typography>
              </Box>
              <AttachMoney fontSize="large" />
            </Box>
            <Typography variant="caption">{dashboard?.financial?.outstanding_balance ? (dashboard.financial.outstanding_balance / 1000000).toFixed(1) + 'M' : '0'} Outstanding</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Students by Trade</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboard?.trades || []}
                  dataKey="student_count"
                  nameKey="trade_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {dashboard?.trades?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Students by Level</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={dashboard?.levels || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level_number" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="student_count" fill="#8884d8" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activities */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Activities</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard?.recent_activities?.slice(0, 10).map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip 
                          label={activity.activity_type} 
                          size="small" 
                          color={activity.activity_type === 'student_enrolled' ? 'success' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>{new Date(activity.activity_time).toLocaleString()}</TableCell>
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

  const renderStudentsManagement = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Student Management</Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setOpenAddStudent(true)}>
          Add Student
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Students"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ startAdornment: <Search /> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trade</InputLabel>
                <Select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="AUT">AUT</MenuItem>
                  <MenuItem value="BDC">BDC</MenuItem>
                  <MenuItem value="SOD">SOD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="3">Level 3</MenuItem>
                  <MenuItem value="4">Level 4</MenuItem>
                  <MenuItem value="5">Level 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={fetchStudents}>Search</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Trade</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>GPA</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.student_code}</TableCell>
                    <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                    <TableCell>{student.trade_code}</TableCell>
                    <TableCell>L{student.level_number}{student.level_suffix}</TableCell>
                    <TableCell>
                      <Chip 
                        label={student.gpa?.toFixed(2) || 'N/A'} 
                        color={student.gpa >= 3.5 ? 'success' : student.gpa >= 2.5 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={student.status} 
                        color={student.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><Edit /></IconButton>
                      <IconButton size="small" color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );

  const renderTeachersManagement = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Teacher Management</Typography>
        <Box>
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setOpenAddTeacher(true)} sx={{ mr: 1 }}>
            Add Teacher
          </Button>
          <Button variant="outlined" startIcon={<Assignment />} onClick={() => setOpenAssignTeacher(true)}>
            Assign Subject
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Assignments</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((teacher: any) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{`${teacher.first_name} ${teacher.last_name}`}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
                    <TableCell>
                      <Chip label={teacher.assignment_count} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{teacher.subjects_taught || 'None'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={teacher.is_active ? 'Active' : 'Inactive'} 
                        color={teacher.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><Edit /></IconButton>
                      <IconButton size="small" color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );

  const renderReportsGeneration = () => (
    <Box>
      <Typography variant="h5" mb={3}>Reports & Analytics</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Generate Student Report</Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Generate comprehensive reports with auto-grading and ranking
              </Typography>
              <Button fullWidth variant="contained" startIcon={<Assessment />} onClick={() => setOpenGenerateReport(true)}>
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Financial Reports</Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                View payment status and outstanding balances
              </Typography>
              <Button fullWidth variant="outlined" startIcon={<AttachMoney />}>
                View Finances
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Attendance Reports</Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Track student attendance across all trades
              </Typography>
              <Button fullWidth variant="outlined" startIcon={<CalendarToday />}>
                View Attendance
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">DOS Dashboard - Ultra Advanced</Typography>
        <Button variant="outlined" startIcon={<Download />}>Export Data</Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Overview" icon={<Dashboard />} iconPosition="start" />
        <Tab label="Students" icon={<School />} iconPosition="start" />
        <Tab label="Teachers" icon={<PeopleAlt />} iconPosition="start" />
        <Tab label="Reports" icon={<Assessment />} iconPosition="start" />
      </Tabs>

      {activeTab === 0 && renderDashboardOverview()}
      {activeTab === 1 && renderStudentsManagement()}
      {activeTab === 2 && renderTeachersManagement()}
      {activeTab === 3 && renderReportsGeneration()}

      {/* Add Student Dialog */}
      <Dialog open={openAddStudent} onClose={() => setOpenAddStudent(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Student Code" value={newStudent.student_code} 
                onChange={(e) => setNewStudent({...newStudent, student_code: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="First Name" value={newStudent.first_name}
                onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Last Name" value={newStudent.last_name}
                onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" type="email" value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" value={newStudent.phone}
                onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trade</InputLabel>
                <Select value={newStudent.trade_code} onChange={(e) => setNewStudent({...newStudent, trade_code: e.target.value})}>
                  <MenuItem value="AUT">AUT</MenuItem>
                  <MenuItem value="BDC">BDC</MenuItem>
                  <MenuItem value="SOD">SOD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select value={newStudent.level_number} onChange={(e) => setNewStudent({...newStudent, level_number: e.target.value})}>
                  <MenuItem value="3">Level 3</MenuItem>
                  <MenuItem value="4">Level 4</MenuItem>
                  <MenuItem value="5">Level 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Level Suffix (A/B)" value={newStudent.level_suffix}
                onChange={(e) => setNewStudent({...newStudent, level_suffix: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Guardian Name" value={newStudent.guardian_name}
                onChange={(e) => setNewStudent({...newStudent, guardian_name: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Guardian Phone" value={newStudent.guardian_phone}
                onChange={(e) => setNewStudent({...newStudent, guardian_phone: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddStudent(false)}>Cancel</Button>
          <Button onClick={handleAddStudent} variant="contained">Add Student</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Teacher Dialog */}
      <Dialog open={openAssignTeacher} onClose={() => setOpenAssignTeacher(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Teacher to Subject</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Teacher ID" type="number" value={teacherAssignment.teacher_id}
                onChange={(e) => setTeacherAssignment({...teacherAssignment, teacher_id: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Subject ID" type="number" value={teacherAssignment.subject_id}
                onChange={(e) => setTeacherAssignment({...teacherAssignment, subject_id: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trade</InputLabel>
                <Select value={teacherAssignment.trade_code} onChange={(e) => setTeacherAssignment({...teacherAssignment, trade_code: e.target.value})}>
                  <MenuItem value="AUT">AUT</MenuItem>
                  <MenuItem value="BDC">BDC</MenuItem>
                  <MenuItem value="SOD">SOD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select value={teacherAssignment.level_number} onChange={(e) => setTeacherAssignment({...teacherAssignment, level_number: e.target.value})}>
                  <MenuItem value="3">Level 3</MenuItem>
                  <MenuItem value="4">Level 4</MenuItem>
                  <MenuItem value="5">Level 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Weekly Periods" type="number" value={teacherAssignment.weekly_periods}
                onChange={(e) => setTeacherAssignment({...teacherAssignment, weekly_periods: parseInt(e.target.value)})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignTeacher(false)}>Cancel</Button>
          <Button onClick={handleAssignTeacher} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={openGenerateReport} onClose={() => setOpenGenerateReport(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Student Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trade</InputLabel>
                <Select value={reportConfig.trade_code} onChange={(e) => setReportConfig({...reportConfig, trade_code: e.target.value})}>
                  <MenuItem value="AUT">AUT</MenuItem>
                  <MenuItem value="BDC">BDC</MenuItem>
                  <MenuItem value="SOD">SOD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select value={reportConfig.level_number} onChange={(e) => setReportConfig({...reportConfig, level_number: e.target.value})}>
                  <MenuItem value="3">Level 3</MenuItem>
                  <MenuItem value="4">Level 4</MenuItem>
                  <MenuItem value="5">Level 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
                <Select value={reportConfig.term} onChange={(e) => setReportConfig({...reportConfig, term: parseInt(e.target.value.toString())})}>
                  <MenuItem value={1}>Term 1</MenuItem>
                  <MenuItem value={2}>Term 2</MenuItem>
                  <MenuItem value={3}>Term 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Academic Year" type="number" value={reportConfig.academic_year}
                onChange={(e) => setReportConfig({...reportConfig, academic_year: parseInt(e.target.value)})} />
            </Grid>
          </Grid>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Report will include auto-grading, GPA calculation, and class ranking
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerateReport(false)}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant="contained">Generate & Download</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DOSDashboardUltraAdvanced;

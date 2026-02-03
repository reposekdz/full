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
  LinearProgress,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Badge
} from '@mui/material';
import {
  Dashboard,
  School,
  Assessment,
  Assignment,
  CalendarToday,
  TrendingUp,
  LocalLibrary,
  Download,
  Upload,
  CheckCircle,
  Warning,
  AttachFile,
  Visibility,
  Schedule,
  EmojiEvents,
  Grade,
  BarChart,
  MenuBook
} from '@mui/icons-material';
import axios from 'axios';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
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

interface StudentProfile {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  trade_code: string;
  trade_name: string;
  level_number: number;
  level_suffix: string;
  gpa: number;
  attendance_percentage: number;
  status: string;
}

const StudentPortalUltraAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [marks, setMarks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');

  useEffect(() => {
    fetchStudentProfile();
    fetchStudentDashboard();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/student-ultra-advanced/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showAlert('error', 'Failed to load profile');
    }
  };

  const fetchStudentDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/student-ultra-advanced/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showAlert('error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/student-ultra-advanced/marks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMarks(response.data.marks);
    } catch (error) {
      console.error('Error fetching marks:', error);
      showAlert('error', 'Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        trade_code: profile?.trade_code || '',
        level_number: profile?.level_number.toString() || '',
        level_suffix: profile?.level_suffix || ''
      });
      
      const response = await axios.get(`${API_BASE_URL}/teacher-content/notes/student-view?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      showAlert('error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        trade_code: profile?.trade_code || '',
        level_number: profile?.level_number.toString() || ''
      });
      
      const response = await axios.get(`${API_BASE_URL}/teacher-content/works/student-view?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorks(response.data.works);
    } catch (error) {
      console.error('Error fetching works:', error);
      showAlert('error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/timetable-ultra-advanced/student-timetable`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimetable(response.data.timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      showAlert('error', 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!submissionFile) {
      showAlert('error', 'Please select a file to submit');
      return;
    }

    const formData = new FormData();
    formData.append('work_id', selectedWork.id);
    formData.append('file', submissionFile);
    formData.append('notes', submissionNotes);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/teacher-content/works/submit`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      showAlert('success', 'Work submitted successfully');
      setOpenSubmitDialog(false);
      setSubmissionFile(null);
      setSubmissionNotes('');
      fetchWorks();
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to submit work');
    }
  };

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    if (activeTab === 1 && profile) fetchMarks();
    if (activeTab === 2 && profile) fetchNotes();
    if (activeTab === 3 && profile) fetchWorks();
    if (activeTab === 4 && profile) fetchTimetable();
  }, [activeTab, profile]);

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Profile Card */}
      <Grid item xs={12}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: '#667eea' }}>
                  {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4">{profile?.first_name} {profile?.last_name}</Typography>
                <Typography variant="body1">{profile?.student_code}</Typography>
                <Typography variant="body2">{profile?.trade_name} - Level {profile?.level_number}{profile?.level_suffix}</Typography>
              </Grid>
              <Grid item>
                <Box textAlign="center" mr={3}>
                  <Typography variant="h3">{profile?.gpa?.toFixed(2) || '0.00'}</Typography>
                  <Typography variant="body2">GPA</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box textAlign="center">
                  <Typography variant="h3">{profile?.attendance_percentage?.toFixed(0) || '0'}%</Typography>
                  <Typography variant="body2">Attendance</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Statistics Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">{dashboard?.total_subjects || 0}</Typography>
                <Typography variant="body2" color="textSecondary">Total Subjects</Typography>
              </Box>
              <LocalLibrary fontSize="large" color="primary" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">{dashboard?.pending_assignments || 0}</Typography>
                <Typography variant="body2" color="textSecondary">Pending Works</Typography>
              </Box>
              <Assignment fontSize="large" color="warning" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">{dashboard?.class_rank || 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary">Class Rank</Typography>
              </Box>
              <EmojiEvents fontSize="large" color="success" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">{dashboard?.attendance_days || 0}</Typography>
                <Typography variant="body2" color="textSecondary">Days Present</Typography>
              </Box>
              <CheckCircle fontSize="large" color="info" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Performance Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard?.performance_trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="term" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="gpa" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="attendance" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Subject Performance Radar */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Subject Performance</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={dashboard?.subject_performance || []}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Marks" dataKey="percentage" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Upcoming Classes */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Today's Classes</Typography>
            <List>
              {dashboard?.today_classes?.slice(0, 5).map((cls: any, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Schedule color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={cls.subject_name}
                    secondary={`${cls.start_time} - ${cls.end_time} | Room ${cls.room_number}`}
                  />
                </ListItem>
              )) || <Typography variant="body2" color="textSecondary">No classes today</Typography>}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Announcements */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Announcements</Typography>
            <List>
              {dashboard?.announcements?.slice(0, 5).map((announcement: any, index: number) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={announcement.title}
                      secondary={new Date(announcement.created_at).toLocaleDateString()}
                    />
                  </ListItem>
                  {index < 4 && <Divider />}
                </React.Fragment>
              )) || <Typography variant="body2" color="textSecondary">No announcements</Typography>}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMarks = () => (
    <Box>
      <Typography variant="h5" mb={3}>My Marks & Grades</Typography>
      
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
                  <TableCell>Subject</TableCell>
                  <TableCell>Assessment Type</TableCell>
                  <TableCell>Marks Obtained</TableCell>
                  <TableCell>Total Marks</TableCell>
                  <TableCell>Percentage</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Term</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marks.map((mark: any) => (
                  <TableRow key={mark.id}>
                    <TableCell>{mark.subject_name}</TableCell>
                    <TableCell>
                      <Chip label={mark.assessment_type} size="small" />
                    </TableCell>
                    <TableCell>{mark.marks_obtained}</TableCell>
                    <TableCell>{mark.total_marks}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box width="100%" mr={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={mark.percentage} 
                            color={mark.percentage >= 70 ? 'success' : mark.percentage >= 50 ? 'warning' : 'error'}
                          />
                        </Box>
                        <Typography variant="body2">{mark.percentage}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={mark.grade} 
                        color={mark.grade.includes('A') ? 'success' : mark.grade.includes('B') ? 'primary' : mark.grade.includes('C') ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>Term {mark.term}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );

  const renderNotes = () => (
    <Box>
      <Typography variant="h5" mb={3}>Study Notes & Materials</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {notes.map((note: any) => (
            <Grid item xs={12} md={6} key={note.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6">{note.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {note.subject_name} | {note.topic}
                      </Typography>
                    </Box>
                    <Chip label={note.category} size="small" color="primary" />
                  </Box>
                  
                  <Typography variant="body2" mb={2}>{note.description}</Typography>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                      {note.teacher_first_name?.charAt(0)}
                    </Avatar>
                    <Typography variant="caption">
                      {note.teacher_first_name} {note.teacher_last_name}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="textSecondary">
                      {JSON.parse(note.files || '[]').length} file(s)
                    </Typography>
                    <Button size="small" variant="outlined" startIcon={<Download />}>
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderWorks = () => (
    <Box>
      <Typography variant="h5" mb={3}>Assignments & Works</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {works.map((work: any) => {
            const isOverdue = new Date(work.due_date) < new Date() && work.submission_status !== 'submitted';
            const isSubmitted = work.submission_status === 'submitted';
            
            return (
              <Grid item xs={12} md={6} key={work.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box>
                        <Typography variant="h6">{work.title}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {work.subject_name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={work.work_type} 
                        size="small" 
                        color={work.work_type === 'assignment' ? 'primary' : 'secondary'}
                      />
                    </Box>
                    
                    <Typography variant="body2" mb={2}>{work.instructions}</Typography>
                    
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="caption" color="textSecondary">
                        <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                        Due: {new Date(work.due_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption">
                        Total Marks: {work.total_marks}
                      </Typography>
                    </Box>
                    
                    {isSubmitted ? (
                      <Box>
                        <Chip 
                          label={`Submitted - ${work.obtained_marks ? `${work.obtained_marks}/${work.total_marks}` : 'Pending Grading'}`}
                          color="success" 
                          size="small"
                          icon={<CheckCircle />}
                        />
                        {work.feedback && (
                          <Typography variant="caption" display="block" mt={1}>
                            Feedback: {work.feedback}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Button 
                        fullWidth 
                        variant={isOverdue ? 'outlined' : 'contained'}
                        color={isOverdue ? 'error' : 'primary'}
                        startIcon={<Upload />}
                        onClick={() => {
                          setSelectedWork(work);
                          setOpenSubmitDialog(true);
                        }}
                      >
                        {isOverdue ? 'Submit (Overdue)' : 'Submit Work'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );

  const renderTimetable = () => (
    <Box>
      <Typography variant="h5" mb={3}>My Timetable</Typography>
      
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
                  <TableCell>Day</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Room</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timetable.map((entry: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{entry.day_of_week}</TableCell>
                    <TableCell>{entry.start_time} - {entry.end_time}</TableCell>
                    <TableCell>{entry.subject_name}</TableCell>
                    <TableCell>{entry.teacher_name}</TableCell>
                    <TableCell>{entry.room_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
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
        <Typography variant="h4">Student Portal</Typography>
        <Button variant="outlined" startIcon={<Download />}>Download Report</Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" icon={<Dashboard />} iconPosition="start" />
        <Tab label="Marks & Grades" icon={<Grade />} iconPosition="start" />
        <Tab label="Study Notes" icon={<MenuBook />} iconPosition="start" />
        <Tab label="Assignments" icon={<Assignment />} iconPosition="start" />
        <Tab label="Timetable" icon={<CalendarToday />} iconPosition="start" />
      </Tabs>

      {activeTab === 0 && renderDashboard()}
      {activeTab === 1 && renderMarks()}
      {activeTab === 2 && renderNotes()}
      {activeTab === 3 && renderWorks()}
      {activeTab === 4 && renderTimetable()}

      {/* Submit Work Dialog */}
      <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Work: {selectedWork?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" mb={2}>
              Due Date: {selectedWork?.due_date ? new Date(selectedWork.due_date).toLocaleDateString() : 'N/A'}
            </Typography>
            
            <Button
              fullWidth
              variant="outlined"
              component="label"
              startIcon={<AttachFile />}
              sx={{ mb: 2 }}
            >
              {submissionFile ? submissionFile.name : 'Select File'}
              <input
                type="file"
                hidden
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
              />
            </Button>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes (Optional)"
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmitDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitWork} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentPortalUltraAdvanced;

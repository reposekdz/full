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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Dashboard,
  School,
  Assignment,
  Upload,
  Download,
  Visibility,
  Edit,
  Delete,
  Assessment,
  CalendarToday,
  CheckCircle,
  Warning,
  LocalLibrary,
  Work,
  BeachAccess,
  Quiz,
  People,
  Grading,
  AttachFile,
  Send,
  FilePresent,
  CloudUpload,
  Refresh,
  Add,
  TrendingUp,
  BarChart,
  PieChart
} from '@mui/icons-material';
import { API_BASE_URL } from '@/app/config/apiBase';
import axios from 'axios';
import { ParentManagementWidget } from '@/app/components/shared/ParentManagementWidget';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface TeacherProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const TeacherPortalUltraAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [holidayPackages, setHolidayPackages] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  
  // Student filters for Level 4 SOD
  const [studentFilters, setStudentFilters] = useState({
    trade_code: 'SOD',
    level: '4',
    level_suffix: '',
    search: ''
  });
  
  // Real trades and levels from database
  const [availableTrades, setAvailableTrades] = useState<any[]>([]);
  const [availableLevels, setAvailableLevels] = useState<any[]>([]);
  
  const [openUploadNote, setOpenUploadNote] = useState(false);
  const [openUploadWork, setOpenUploadWork] = useState(false);
  const [openUploadHoliday, setOpenUploadHoliday] = useState(false);
  const [openCreateQuiz, setOpenCreateQuiz] = useState(false);
  const [openGradeSubmission, setOpenGradeSubmission] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    trade_code: '',
    level_number: '',
    level_suffix: '',
    topic: '',
    category: 'general'
  });
  
  const [workForm, setWorkForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    trade_code: '',
    level_number: '',
    level_suffix: '',
    work_type: 'assignment',
    total_marks: 100,
    due_date: '',
    instructions: '',
    submission_required: true
  });
  
  const [holidayForm, setHolidayForm] = useState({
    title: '',
    description: '',
    trade_code: '',
    level_number: '',
    level_suffix: '',
    subject_id: '',
    package_type: 'revision',
    estimated_days: 7,
    difficulty_level: 'medium',
    instructions: '',
    start_date: '',
    end_date: ''
  });
  
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    class_id: '',
    difficulty_level: 'medium',
    time_limit: 60,
    total_marks: 100,
    passing_marks: 50,
    instructions: '',
    start_time: '',
    end_time: '',
    randomize_questions: false,
    show_results_immediately: true,
    allow_review: true,
    max_attempts: 3,
    questions: [] as any[]
  });
  
  const [gradeForm, setGradeForm] = useState({
    marks_obtained: '',
    feedback: '',
    status: 'graded'
  });
  
  const [subjectColumns, setSubjectColumns] = useState<any[]>([]);
  const [openCreateColumn, setOpenCreateColumn] = useState(false);
  const [columnForm, setColumnForm] = useState({
    subject_name: '',
    subject_code: '',
    max_marks: 100,
    trade_code: '',
    level_number: '',
    level_suffix: '',
    term: 1,
    academic_year: new Date().getFullYear()
  });
  const [selectedColumn, setSelectedColumn] = useState<any>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [openRecordMarks, setOpenRecordMarks] = useState(false);
  const [marksForm, setMarksForm] = useState({
    student_id: '',
    marks: '',
    remarks: ''
  });
  const [workSubmissions, setWorkSubmissions] = useState<any[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetchTeacherProfile();
    fetchDashboard();
    fetchStatistics();
    fetchTrades().then(() => {
      // After fetching trades, fetch levels for default SOD
      fetchLevels('SOD');
    });
  }, []);

  useEffect(() => {
    if (activeTab === 1) fetchNotes();
    if (activeTab === 2) fetchWorks();
    if (activeTab === 3) fetchHolidayPackages();
    if (activeTab === 4) fetchQuizzes();
    if (activeTab === 5) fetchStudents();
    if (activeTab === 6) fetchSubjectColumns();
    if (activeTab === 7) fetchSubmissions();
  }, [activeTab]);

  const fetchTeacherProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/teacher-portal-ultra/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/teacher-portal-ultra/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showAlert('error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/teacher-content/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch real trades from database - BDC, SOD, AUT only
      const response = await axios.get(`${API_BASE_URL}/trades-levels/trades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAvailableTrades(response.data.trades || []);
        setTrades(response.data.trades || []);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      // Fallback to SOD if API fails
      setAvailableTrades([
        { trade_code: 'SOD', trade_name: 'Software Development' },
        { trade_code: 'BDC', trade_name: 'Building and Construction' },
        { trade_code: 'AUT', trade_name: 'Automotive Technology' }
      ]);
    }
  };

  // Fetch levels from database based on selected trade
  const fetchLevels = async (tradeCode: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/trades-levels/trades/${tradeCode}/levels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAvailableLevels(response.data.levels || []);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      // Fallback levels based on trade
      if (tradeCode === 'AUT') {
        setAvailableLevels([
          { level_number: 3, level_suffix: '', level_display: '3' },
          { level_number: 4, level_suffix: 'A', level_display: '4A' },
          { level_number: 4, level_suffix: 'B', level_display: '4B' },
          { level_number: 5, level_suffix: 'A', level_display: '5A' },
          { level_number: 5, level_suffix: 'B', level_display: '5B' }
        ]);
      } else {
        setAvailableLevels([
          { level_number: 3, level_suffix: '', level_display: '3' },
          { level_number: 4, level_suffix: '', level_display: '4' },
          { level_number: 5, level_suffix: '', level_display: '5' }
        ]);
      }
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/teacher-content/notes/my-notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotes(response.data.notes);
      }
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
      const response = await axios.get(`${API_BASE_URL}/teacher-content/works/my-works`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setWorks(response.data.works);
      }
    } catch (error) {
      console.error('Error fetching works:', error);
      showAlert('error', 'Failed to load works');
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidayPackages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/teacher-content/holiday/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setHolidayPackages(response.data.packages);
      }
    } catch (error) {
      console.error('Error fetching holiday packages:', error);
      showAlert('error', 'Failed to load holiday packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setQuizzes(response.data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      showAlert('error', 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Build query params with filters for Level 4 SOD - limit to 29 students
      const queryParams = new URLSearchParams();
      if (studentFilters.trade_code) queryParams.append('trade_code', studentFilters.trade_code);
      if (studentFilters.level) queryParams.append('level_number', studentFilters.level);
      if (studentFilters.level_suffix) queryParams.append('level_suffix', studentFilters.level_suffix);
      if (studentFilters.search) queryParams.append('search', studentFilters.search);
      // Default limit to 29 students for Level 4 SOD
      queryParams.append('limit', '29');
      
      const response = await axios.get(`${API_BASE_URL}/teacher-comprehensive/students?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStudents(response.data.students || []);
      } else {
        // Fallback to teacher-portal-ultra if teacher-comprehensive doesn't work
        const fallbackResponse = await axios.get(`${API_BASE_URL}/teacher-portal-ultra/students?limit=29`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (fallbackResponse.data.success) {
          setStudents(fallbackResponse.data.students || []);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Try the alternative endpoint
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/teacher-portal-ultra/students?limit=29`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setStudents(response.data.students || []);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        showAlert('error', 'Failed to load students');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectColumns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/teacher-student-marks/subject-columns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSubjectColumns(response.data.columns);
      }
    } catch (error) {
      console.error('Error fetching subject columns:', error);
      showAlert('error', 'Failed to load subject columns');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (trade_code: string, level_number: string, level_suffix: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/dos-ultra-advanced/students/search?trade_code=${trade_code}&level_number=${level_number}&level_suffix=${level_suffix}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setClassStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching class students:', error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [worksRes, quizRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/teacher-content/works/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/teacher-content/quiz/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      if (worksRes.data.success) {
        setWorkSubmissions(worksRes.data.submissions || []);
      }
      if (quizRes.data.success) {
        setQuizSubmissions(quizRes.data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      showAlert('error', 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColumn = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/teacher-student-marks/add-subject-column`,
        columnForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', 'Subject column created successfully');
        setOpenCreateColumn(false);
        setColumnForm({
          subject_name: '',
          subject_code: '',
          max_marks: 100,
          trade_code: '',
          level_number: '',
          level_suffix: '',
          term: 1,
          academic_year: new Date().getFullYear()
        });
        fetchSubjectColumns();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to create column');
    }
  };

  const handleRecordMarks = async () => {
    try {
      if (!selectedColumn) {
        showAlert('error', 'Please select a subject column');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/teacher-student-marks/record-marks`,
        {
          column_id: selectedColumn.id,
          student_id: marksForm.student_id,
          marks: parseFloat(marksForm.marks),
          remarks: marksForm.remarks,
          exam_type: 'exam'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', `Marks recorded: ${response.data.marks}/${selectedColumn.max_marks} (${response.data.grade})`);
        setOpenRecordMarks(false);
        setMarksForm({ student_id: '', marks: '', remarks: '' });
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to record marks');
    }
  };

  const handleGradeSubmission = async () => {
    try {
      if (!selectedSubmission) return;
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/teacher-content/works/grade`,
        {
          submission_id: selectedSubmission.id,
          marks_obtained: parseFloat(gradeForm.marks_obtained),
          feedback: gradeForm.feedback,
          status: 'graded'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', 'Submission graded successfully');
        setOpenGradeSubmission(false);
        setSelectedSubmission(null);
        setGradeForm({ marks_obtained: '', feedback: '', status: 'graded' });
        fetchSubmissions();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to grade submission');
    }
  };

  const handleUploadNote = async () => {
    try {
      if (!selectedFiles || selectedFiles.length === 0) {
        showAlert('error', 'Please select files to upload');
        return;
      }

      const formData = new FormData();
      Object.entries(noteForm).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/teacher-content/notes/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showAlert('success', 'Notes uploaded successfully');
        setOpenUploadNote(false);
        resetNoteForm();
        fetchNotes();
        fetchStatistics();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to upload notes');
    }
  };

  const handleUploadWork = async () => {
    try {
      const formData = new FormData();
      Object.entries(workForm).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      if (selectedFiles) {
        Array.from(selectedFiles).forEach((file) => {
          formData.append('files', file);
        });
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/teacher-content/works/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showAlert('success', 'Work uploaded successfully');
        setOpenUploadWork(false);
        resetWorkForm();
        fetchWorks();
        fetchStatistics();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to upload work');
    }
  };

  const handleUploadHolidayPackage = async () => {
    try {
      const formData = new FormData();
      Object.entries(holidayForm).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      if (selectedFiles) {
        Array.from(selectedFiles).forEach((file) => {
          formData.append('files', file);
        });
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/teacher-content/holiday/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showAlert('success', 'Holiday package uploaded successfully');
        setOpenUploadHoliday(false);
        resetHolidayForm();
        fetchHolidayPackages();
        fetchStatistics();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to upload holiday package');
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/quizzes`, quizForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showAlert('success', 'Quiz created successfully');
        setOpenCreateQuiz(false);
        resetQuizForm();
        fetchQuizzes();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to create quiz');
    }
  };

  const handleGradeSubmission = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/teacher-content/works/submissions/${selectedSubmission.id}/grade`,
        gradeForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showAlert('success', 'Submission graded successfully');
        setOpenGradeSubmission(false);
        setSelectedSubmission(null);
        resetGradeForm();
        fetchWorks();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to grade submission');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/teacher-content/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showAlert('success', 'Note deleted successfully');
        fetchNotes();
        fetchStatistics();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to delete note');
    }
  };

  const resetNoteForm = () => {
    setNoteForm({
      title: '',
      description: '',
      subject_id: '',
      trade_code: '',
      level_number: '',
      level_suffix: '',
      topic: '',
      category: 'general'
    });
    setSelectedFiles(null);
  };

  const resetWorkForm = () => {
    setWorkForm({
      title: '',
      description: '',
      subject_id: '',
      trade_code: '',
      level_number: '',
      level_suffix: '',
      work_type: 'assignment',
      total_marks: 100,
      due_date: '',
      instructions: '',
      submission_required: true
    });
    setSelectedFiles(null);
  };

  const resetHolidayForm = () => {
    setHolidayForm({
      title: '',
      description: '',
      trade_code: '',
      level_number: '',
      level_suffix: '',
      subject_id: '',
      package_type: 'revision',
      estimated_days: 7,
      difficulty_level: 'medium',
      instructions: '',
      start_date: '',
      end_date: ''
    });
    setSelectedFiles(null);
  };

  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      subject_id: '',
      class_id: '',
      difficulty_level: 'medium',
      time_limit: 60,
      total_marks: 100,
      passing_marks: 50,
      instructions: '',
      start_time: '',
      end_time: '',
      randomize_questions: false,
      show_results_immediately: true,
      allow_review: true,
      max_attempts: 3,
      questions: []
    });
  };

  const resetGradeForm = () => {
    setGradeForm({
      marks_obtained: '',
      feedback: '',
      status: 'graded'
    });
  };

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">
                  {dashboard?.assigned_classes || 0}
                </Typography>
                <Typography variant="body2">Assigned Classes</Typography>
              </Box>
              <School fontSize="large" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignments="center">
              <Box>
                <Typography variant="h4">
                  {dashboard?.total_students || 0}
                </Typography>
                <Typography variant="body2">Total Students</Typography>
              </Box>
              <People fontSize="large" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">
                  {statistics?.notes_uploaded || 0}
                </Typography>
                <Typography variant="body2">Notes Uploaded</Typography>
              </Box>
              <LocalLibrary fontSize="large" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">
                  {dashboard?.pending_submissions || 0}
                </Typography>
                <Typography variant="body2">Pending Grading</Typography>
              </Box>
              <Grading fontSize="large" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Class Performance</Typography>
            {dashboard?.class_performance && dashboard.class_performance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={dashboard.class_performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class_name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="avg_gpa" fill="#8884d8" name="Average GPA" />
                  <Bar dataKey="avg_attendance" fill="#82ca9d" name="Attendance %" />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary">No performance data available</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Content Statistics</Typography>
            {statistics && (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Notes', value: statistics.notes_uploaded || 0 },
                      { name: 'Works', value: statistics.works_created || 0 },
                      { name: 'Holiday Packages', value: statistics.holiday_packages || 0 },
                      { name: 'Submissions', value: statistics.submissions_received || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Upcoming Assignments</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Submissions</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard?.upcoming_assignments && dashboard.upcoming_assignments.length > 0 ? (
                    dashboard.upcoming_assignments.map((assignment: any) => (
                      <TableRow key={assignment.id}>
                        <TableCell>{assignment.title}</TableCell>
                        <TableCell>{new Date(assignment.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>{assignment.submission_count || 0}</TableCell>
                        <TableCell>
                          <Chip 
                            label={assignment.status} 
                            color={assignment.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No upcoming assignments</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotes = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Study Notes & Materials</Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setOpenUploadNote(true)}
        >
          Upload Notes
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Trade/Level</TableCell>
              <TableCell>Topic</TableCell>
              <TableCell>Files</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.map((note) => (
              <TableRow key={note.id}>
                <TableCell>{note.title}</TableCell>
                <TableCell>
                  <Chip label={`${note.trade_code} L${note.level_number}${note.level_suffix || ''}`} size="small" />
                </TableCell>
                <TableCell>{note.topic}</TableCell>
                <TableCell>
                  <Badge badgeContent={note.files?.length || 0} color="primary">
                    <FilePresent />
                  </Badge>
                </TableCell>
                <TableCell>{note.view_count || 0}</TableCell>
                <TableCell>{new Date(note.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteNote(note.id)} size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {notes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No notes uploaded yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderWorks = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Class Works & Assignments</Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setOpenUploadWork(true)}
        >
          Create Work
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Trade/Level</TableCell>
              <TableCell>Total Marks</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Submissions</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {works.map((work) => (
              <TableRow key={work.id}>
                <TableCell>{work.title}</TableCell>
                <TableCell>
                  <Chip label={work.work_type} size="small" color="primary" />
                </TableCell>
                <TableCell>
                  <Chip label={`${work.trade_code} L${work.level_number}${work.level_suffix || ''}`} size="small" />
                </TableCell>
                <TableCell>{work.total_marks}</TableCell>
                <TableCell>{new Date(work.due_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge badgeContent={work.submission_count || 0} color="secondary">
                    <Assignment />
                  </Badge>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={work.status}
                    color={work.status === 'published' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {works.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No works created yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderHolidayPackages = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Holiday Packages</Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setOpenUploadHoliday(true)}
        >
          Create Package
        </Button>
      </Box>

      <Grid container spacing={3}>
        {holidayPackages.map((pkg) => (
          <Grid item xs={12} md={6} lg={4} key={pkg.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BeachAccess color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">{pkg.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {pkg.description}
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <Chip label={`${pkg.trade_code} L${pkg.level_number}${pkg.level_suffix || ''}`} size="small" />
                  <Chip label={pkg.package_type} size="small" color="primary" />
                  <Chip label={pkg.difficulty_level} size="small" color="secondary" />
                </Box>
                <Typography variant="caption" display="block">
                  Duration: {pkg.estimated_days} days
                </Typography>
                <Typography variant="caption" display="block">
                  Period: {new Date(pkg.start_date).toLocaleDateString()} - {new Date(pkg.end_date).toLocaleDateString()}
                </Typography>
                <Box mt={2}>
                  <Chip 
                    label={`${pkg.files?.length || 0} files`}
                    icon={<AttachFile />}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {holidayPackages.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No holiday packages created yet</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const renderQuizzes = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Quizzes & Assessments</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreateQuiz(true)}
        >
          Create Quiz
        </Button>
      </Box>

      <Grid container spacing={3}>
        {quizzes.map((quiz) => (
          <Grid item xs={12} md={6} lg={4} key={quiz.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Quiz color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">{quiz.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {quiz.description}
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <Chip label={quiz.difficulty_level} size="small" color="warning" />
                  <Chip label={`${quiz.time_limit} min`} size="small" icon={<CalendarToday />} />
                </Box>
                <Typography variant="caption" display="block">
                  Total Marks: {quiz.total_marks} | Passing: {quiz.passing_marks}
                </Typography>
                <Typography variant="caption" display="block">
                  Max Attempts: {quiz.max_attempts}
                </Typography>
                <Box mt={2}>
                  <Chip 
                    label={quiz.status}
                    color={quiz.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {quizzes.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No quizzes created yet</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const renderStudents = () => (
    <Box>
      <Typography variant="h5" mb={3}>My Students</Typography>
      
      {/* Filters for Trade and Level - Real Database Values */}
      <Box mb={3} p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Trade</InputLabel>
              <Select
                value={studentFilters.trade_code}
                label="Trade"
                onChange={(e) => {
                  const newTrade = e.target.value;
                  setStudentFilters({ ...studentFilters, trade_code: newTrade, level: '4', level_suffix: '' });
                  fetchLevels(newTrade);
                  fetchStudents();
                }}
              >
                {availableTrades.length > 0 ? (
                  availableTrades.map((trade: any) => (
                    <MenuItem key={trade.trade_code} value={trade.trade_code}>
                      {trade.trade_code} - {trade.trade_name}
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value="SOD">SOD - Software Development</MenuItem>
                    <MenuItem value="BDC">BDC - Building and Construction</MenuItem>
                    <MenuItem value="AUT">AUT - Automotive Technology</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select
                value={studentFilters.level}
                label="Level"
                onChange={(e) => {
                  setStudentFilters({ ...studentFilters, level: e.target.value });
                  fetchStudents();
                }}
              >
                {availableLevels.length > 0 ? (
                  availableLevels.map((level: any) => (
                    <MenuItem key={level.level_display} value={String(level.level_number)}>
                      Level {level.level_display}
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value="3">Level 3</MenuItem>
                    <MenuItem value="4">Level 4</MenuItem>
                    <MenuItem value="5">Level 5</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Search Student"
              value={studentFilters.search}
              onChange={(e) => setStudentFilters({ ...studentFilters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && fetchStudents()}
            />
          </Grid>
        </Grid>
        <Box mt={2} display="flex" gap={1}>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<Refresh />}
            onClick={fetchStudents}
          >
            Load Students
          </Button>
          <Typography variant="body2" color="textSecondary" sx={{ alignSelf: 'center' }}>
            Currently showing: <strong>{studentFilters.trade_code} Level {studentFilters.level}</strong>
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Trade/Level</TableCell>
              <TableCell>GPA</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.student_id}>
                <TableCell>{student.student_code}</TableCell>
                <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                <TableCell>
                  <Chip label={`${student.trade_code} L${student.level_number}${student.level_suffix || ''}`} size="small" />
                </TableCell>
                <TableCell>{student.gpa?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell>{student.attendance_percentage?.toFixed(1) || '0'}%</TableCell>
                <TableCell>
                  <Chip 
                    label={student.status}
                    color={student.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No students found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderMarksManagement = () => (
    <Box>
      <Typography variant="h5" mb={3}>Marks Management</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Create custom subject columns to record student marks for your assigned classes
      </Alert>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Create Subject Column</Typography>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField 
                  fullWidth 
                  label="Subject Name" 
                  value={columnForm.subject_name}
                  onChange={(e) => setColumnForm({...columnForm, subject_name: e.target.value})}
                  sx={{ mb: 2 }} 
                />
                <TextField 
                  fullWidth 
                  label="Subject Code" 
                  value={columnForm.subject_code}
                  onChange={(e) => setColumnForm({...columnForm, subject_code: e.target.value})}
                  sx={{ mb: 2 }} 
                />
                <TextField 
                  fullWidth 
                  type="number" 
                  label="Max Marks" 
                  value={columnForm.max_marks}
                  onChange={(e) => setColumnForm({...columnForm, max_marks: parseInt(e.target.value)})}
                  sx={{ mb: 2 }} 
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Trade</InputLabel>
                  <Select 
                    value={columnForm.trade_code} 
                    label="Trade"
                    onChange={(e) => setColumnForm({...columnForm, trade_code: e.target.value})}
                  >
                    <MenuItem value="AUT">AUT - Automotive</MenuItem>
                    <MenuItem value="BDC">BDC - Building Construction</MenuItem>
                    <MenuItem value="SOD">SOD - Software Development</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Level</InputLabel>
                  <Select 
                    value={columnForm.level_number} 
                    label="Level"
                    onChange={(e) => setColumnForm({...columnForm, level_number: e.target.value})}
                  >
                    <MenuItem value="3">Level 3</MenuItem>
                    <MenuItem value="4">Level 4</MenuItem>
                    <MenuItem value="5">Level 5</MenuItem>
                  </Select>
                </FormControl>
                {columnForm.trade_code === 'AUT' && (columnForm.level_number === '4' || columnForm.level_number === '5') && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Suffix</InputLabel>
                    <Select 
                      value={columnForm.level_suffix} 
                      label="Suffix"
                      onChange={(e) => setColumnForm({...columnForm, level_suffix: e.target.value})}
                    >
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                    </Select>
                  </FormControl>
                )}
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<Add />}
                  onClick={handleCreateColumn}
                  disabled={!columnForm.subject_name || !columnForm.trade_code || !columnForm.level_number}
                >
                  Create Column
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Your Subject Columns</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Max Marks</TableCell>
                      <TableCell>Trade/Level</TableCell>
                      <TableCell>Term</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjectColumns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">No columns created yet</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      subjectColumns.map((column) => (
                        <TableRow key={column.id}>
                          <TableCell>{column.subject_name}</TableCell>
                          <TableCell>{column.subject_code}</TableCell>
                          <TableCell>{column.max_marks}</TableCell>
                          <TableCell>{column.trade_code} L{column.level_number}{column.level_suffix}</TableCell>
                          <TableCell>T{column.term}</TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => {
                                setSelectedColumn(column);
                                fetchClassStudents(column.trade_code, column.level_number, column.level_suffix);
                                setOpenRecordMarks(true);
                              }}
                            >
                              Record Marks
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Record Marks Dialog */}
      <Dialog open={openRecordMarks} onClose={() => setOpenRecordMarks(false)} maxWidth="md" fullWidth>
        <DialogTitle>Record Marks - {selectedColumn?.subject_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Student</InputLabel>
              <Select
                value={marksForm.student_id}
                label="Select Student"
                onChange={(e) => setMarksForm({...marksForm, student_id: e.target.value})}
              >
                {classStudents.map((student) => (
                  <MenuItem key={student.student_id} value={student.student_id}>
                    {student.first_name} {student.last_name} - {student.student_code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label={`Marks (Max: ${selectedColumn?.max_marks})`}
              value={marksForm.marks}
              onChange={(e) => setMarksForm({...marksForm, marks: e.target.value})}
              sx={{ mb: 2 }}
              inputProps={{ max: selectedColumn?.max_marks }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Remarks (Optional)"
              value={marksForm.remarks}
              onChange={(e) => setMarksForm({...marksForm, remarks: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecordMarks(false)}>Cancel</Button>
          <Button 
            onClick={handleRecordMarks} 
            variant="contained"
            disabled={!marksForm.student_id || !marksForm.marks}
          >
            Record Marks
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderCorrections = () => {
    const [correctionTab, setCorrectionTab] = useState(0);
    const submissions = correctionTab === 0 ? quizSubmissions : workSubmissions;
    
    return (
      <Box>
        <Typography variant="h5" mb={3}>Online Corrections</Typography>
        <Tabs value={correctionTab} onChange={(e, v) => setCorrectionTab(v)} sx={{ mb: 3 }}>
          <Tab label={`Quiz Submissions (${quizSubmissions.length})`} />
          <Tab label={`Work Submissions (${workSubmissions.length})`} />
        </Tabs>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {correctionTab === 0 ? 'Quiz Submissions' : 'Work Submissions'}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Assignment/Quiz</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Marks</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">No pending corrections</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((submission: any) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.student_name}</TableCell>
                        <TableCell>{submission.title}</TableCell>
                        <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {submission.marks_obtained ? `${submission.marks_obtained}/${submission.total_marks}` : 'Not Graded'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={submission.status} 
                            color={submission.status === 'graded' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setGradeForm({
                                marks_obtained: submission.marks_obtained?.toString() || '',
                                feedback: submission.feedback || '',
                                status: 'graded'
                              });
                              setOpenGradeSubmission(true);
                            }}
                          >
                            {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Grade Submission Dialog */}
        <Dialog open={openGradeSubmission} onClose={() => setOpenGradeSubmission(false)} maxWidth="md" fullWidth>
          <DialogTitle>Grade Submission - {selectedSubmission?.title}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Student: {selectedSubmission?.student_name}<br />
                Submitted: {selectedSubmission?.submitted_at && new Date(selectedSubmission.submitted_at).toLocaleString()}
              </Alert>
              {selectedSubmission?.file_url && (
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  href={selectedSubmission.file_url}
                  target="_blank"
                  sx={{ mb: 2 }}
                  fullWidth
                >
                  Download Submission
                </Button>
              )}
              <TextField
                fullWidth
                type="number"
                label={`Marks Obtained (Max: ${selectedSubmission?.total_marks})`}
                value={gradeForm.marks_obtained}
                onChange={(e) => setGradeForm({...gradeForm, marks_obtained: e.target.value})}
                sx={{ mb: 2 }}
                inputProps={{ max: selectedSubmission?.total_marks }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Feedback"
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                placeholder="Provide feedback to the student..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGradeSubmission(false)}>Cancel</Button>
            <Button 
              onClick={handleGradeSubmission} 
              variant="contained"
              disabled={!gradeForm.marks_obtained}
            >
              Submit Grade
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Teacher Portal - Ultra Advanced
          </Typography>
          <Typography color="text.secondary">
            Manage content, track student progress, and enhance learning
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            fetchDashboard();
            fetchStatistics();
          }}
        >
          Refresh
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab icon={<Dashboard />} label="Dashboard" />
        <Tab icon={<LocalLibrary />} label="Notes" />
        <Tab icon={<Work />} label="Works" />
        <Tab icon={<BeachAccess />} label="Holiday Packages" />
        <Tab icon={<Quiz />} label="Quizzes" />
        <Tab icon={<People />} label="Students" />
        <Tab icon={<Grading />} label="Marks Management" />
        <Tab icon={<Assessment />} label="Corrections" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 && renderDashboard()}
          {activeTab === 6 && renderMarksManagement()}
          {activeTab === 7 && renderCorrections()}
          {activeTab === 1 && renderNotes()}
          {activeTab === 2 && renderWorks()}
          {activeTab === 3 && renderHolidayPackages()}
          {activeTab === 4 && renderQuizzes()}
          {activeTab === 5 && renderStudents()}
        </>
      )}

      <Dialog open={openUploadNote} onClose={() => setOpenUploadNote(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Study Notes</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={noteForm.description}
                onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trade</InputLabel>
                <Select
                  value={noteForm.trade_code}
                  onChange={(e) => setNoteForm({ ...noteForm, trade_code: e.target.value })}
                  label="Trade"
                >
                  <MenuItem value="AUT">AUT</MenuItem>
                  <MenuItem value="BDC">BDC</MenuItem>
                  <MenuItem value="SOD">SOD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Level"
                value={noteForm.level_number}
                onChange={(e) => setNoteForm({ ...noteForm, level_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Suffix (A/B)"
                value={noteForm.level_suffix}
                onChange={(e) => setNoteForm({ ...noteForm, level_suffix: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Topic"
                value={noteForm.topic}
                onChange={(e) => setNoteForm({ ...noteForm, topic: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={noteForm.category}
                  onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="theory">Theory</MenuItem>
                  <MenuItem value="practical">Practical</MenuItem>
                  <MenuItem value="revision">Revision</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUpload />}
              >
                Select Files (PDF, DOC, PPT, etc.)
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
              </Button>
              {selectedFiles && (
                <Typography variant="caption" display="block" mt={1}>
                  {selectedFiles.length} file(s) selected
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadNote(false)}>Cancel</Button>
          <Button onClick={handleUploadNote} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUploadWork} onClose={() => setOpenUploadWork(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Class Work/Assignment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={workForm.title}
                onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={workForm.description}
                onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trade</InputLabel>
                <Select
                  value={workForm.trade_code}
                  onChange={(e) => setWorkForm({ ...workForm, trade_code: e.target.value })}
                  label="Trade"
                >
                  <MenuItem value="AUT">AUT</MenuItem>
                  <MenuItem value="BDC">BDC</MenuItem>
                  <MenuItem value="SOD">SOD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Level"
                value={workForm.level_number}
                onChange={(e) => setWorkForm({ ...workForm, level_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Suffix"
                value={workForm.level_suffix}
                onChange={(e) => setWorkForm({ ...workForm, level_suffix: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Work Type</InputLabel>
                <Select
                  value={workForm.work_type}
                  onChange={(e) => setWorkForm({ ...workForm, work_type: e.target.value })}
                  label="Work Type"
                >
                  <MenuItem value="assignment">Assignment</MenuItem>
                  <MenuItem value="homework">Homework</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                  <MenuItem value="lab_work">Lab Work</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Total Marks"
                value={workForm.total_marks}
                onChange={(e) => setWorkForm({ ...workForm, total_marks: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={workForm.due_date}
                onChange={(e) => setWorkForm({ ...workForm, due_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={workForm.submission_required}
                    onChange={(e) => setWorkForm({ ...workForm, submission_required: e.target.checked })}
                  />
                }
                label="Submission Required"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Instructions"
                value={workForm.instructions}
                onChange={(e) => setWorkForm({ ...workForm, instructions: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUpload />}
              >
                Attach Files (Optional)
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
              </Button>
              {selectedFiles && (
                <Typography variant="caption" display="block" mt={1}>
                  {selectedFiles.length} file(s) selected
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadWork(false)}>Cancel</Button>
          <Button onClick={handleUploadWork} variant="contained">Create Work</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUploadHoliday} onClose={() => setOpenUploadHoliday(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Holiday Package</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Package Title"
                value={holidayForm.title}
                onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={holidayForm.description}
                onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Trade</InputLabel>
                <Select
                  value={holidayForm.trade_code}
                  onChange={(e) => setHolidayForm({ ...holidayForm, trade_code: e.target.value })}
                  label="Trade"
                >
                  <MenuItem value="AUT">AUT</MenuItem>
                  <MenuItem value="BDC">BDC</MenuItem>
                  <MenuItem value="SOD">SOD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Level"
                value={holidayForm.level_number}
                onChange={(e) => setHolidayForm({ ...holidayForm, level_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Suffix"
                value={holidayForm.level_suffix}
                onChange={(e) => setHolidayForm({ ...holidayForm, level_suffix: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Package Type</InputLabel>
                <Select
                  value={holidayForm.package_type}
                  onChange={(e) => setHolidayForm({ ...holidayForm, package_type: e.target.value })}
                  label="Package Type"
                >
                  <MenuItem value="revision">Revision</MenuItem>
                  <MenuItem value="practice">Practice</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                  <MenuItem value="reading">Reading</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={holidayForm.difficulty_level}
                  onChange={(e) => setHolidayForm({ ...holidayForm, difficulty_level: e.target.value })}
                  label="Difficulty Level"
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Days"
                value={holidayForm.estimated_days}
                onChange={(e) => setHolidayForm({ ...holidayForm, estimated_days: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={holidayForm.start_date}
                onChange={(e) => setHolidayForm({ ...holidayForm, start_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={holidayForm.end_date}
                onChange={(e) => setHolidayForm({ ...holidayForm, end_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Instructions"
                value={holidayForm.instructions}
                onChange={(e) => setHolidayForm({ ...holidayForm, instructions: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUpload />}
              >
                Upload Package Files
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
              </Button>
              {selectedFiles && (
                <Typography variant="caption" display="block" mt={1}>
                  {selectedFiles.length} file(s) selected
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadHoliday(false)}>Cancel</Button>
          <Button onClick={handleUploadHolidayPackage} variant="contained">Create Package</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherPortalUltraAdvanced;

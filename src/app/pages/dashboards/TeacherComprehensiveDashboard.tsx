import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardActions,
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
  TablePagination,
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
  Collapse,
  useTheme,
  Avatar,
  Stack,
  Badge,
  TextFieldProps,
  SelectProps,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Breadcrumbs,
  Link,
  Skeleton,
  alpha,
  Fade,
  Grow,
  Zoom,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  Slider,
  Autocomplete
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School,
  Assignment,
  Quiz,
  People,
  CalendarToday,
  Edit,
  Delete,
  Add,
  Refresh,
  Search,
  Visibility,
  Class,
  Grade,
  Gavel,
  AssignmentTurnedIn,
  Person,
  FileDownload,
  FileUpload,
  Print,
  FilterList,
  MoreVert,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  TrendingUp,
  BarChart,
  PieChart,
  Timeline,
  Notifications,
  Settings,
  CloudUpload,
  CloudDownload,
  Send,
  Close,
  Menu,
  Home,
  ExpandMore,
  ExpandLess,
  ArrowForward,
  ArrowBack,
  FirstPage,
  LastPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Sync,
  PersonAdd,
  GroupAdd,
  RemoveCircle,
  AddCircle,
  Block,
  CheckCircleOutline,
  HighlightOff,
  FactCheck,
  RateReview,
  Assessment,
  EmojiEvents,
  MilitaryTech,
  WorkspacePremium,
  Stars,
  Lock,
  LockOpen,
  Schedule,
  Today,
  DateRange,
  AccessTime,
  DoneAll,
  PendingActions,
  EventNote,
  NoteAdd,
  EditNote,
  PlaylistAddCheck,
  Quiz as QuizIcon,
  FactCheck as FactCheckIcon,
  Assignment as AssignmentIcon,
  Note,
  LibraryBooks,
  BrowseGallery,
  Analytics,
  Speed,
  Timer,
  Publish,
  GetApp,
  Save,
  Share,
  ContentCopy,
  ContentCut,
  ContentPaste,
  FilterAlt,
  Sort,
  Clear,
  DragIndicator,
  More,
  OpenInNew,
  Fullscreen,
  FullscreenExit,
  NotificationsActive,
  NotificationImportant,
  Message,
  Email,
  Phone,
  WhatsApp,
  Sms,
  Send as SendIcon,
  ArrowUpward,
  ArrowDownward,
  SwapVert,
  Reorder,
  DragHandle,
  TableChart,
  ViewList,
  ViewModule,
  ViewWeek,
  ViewColumn,
  CalendarMonth,
  Schedule as ScheduleIcon,
  EventRepeat,
  Repeat,
  Alarm,
  Snooze,
  Bookmark,
  BookmarkBorder,
  Favorite,
  FavoriteBorder,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  ThumbUpOffAlt,
  ThumbDownOffAlt
} from '@mui/icons-material';
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
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  FunnelChart,
  Funnel,
  Treemap
} from 'recharts';
import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Custom colors
const COLORS = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#212121',
  textSecondary: '#757575',
  divider: '#e0e0e0',
  chart: ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02', '#d32f2f', '#0288d1', '#ffc107', '#00bcd4', '#8bc34a', '#ff5722']
};

// Interfaces
interface TeacherProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  photo_url?: string;
  assigned_classes: number;
  subjects?: string[];
  join_date?: string;
  experience_years?: number;
}

interface DashboardData {
  assigned_classes: number;
  total_students: number;
  today_attendance_marked: number;
  pending_submissions: number;
  active_quizzes: number;
  recent_incidents: number;
  upcoming_assignments: any[];
  class_performance: any[];
  assigned_classes_list: any[];
  recent_activities?: ActivityData[];
  attendance_trends?: TrendData[];
  performance_trends?: TrendData[];
}

interface ActivityData {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface TrendData {
  name: string;
  value: number;
  date?: string;
}

interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  student_code: string;
  class_name: string;
  trade_code?: string;
  level_number?: string;
  gender?: string;
  phone?: string;
  email?: string;
  gpa?: number;
  attendance_percentage?: number;
  status?: string;
  date_of_birth?: string;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
  image_url?: string;
}

interface ClassData {
  id: number;
  name: string;
  trade_name: string;
  trade_code: string;
  student_count: number;
  subject_count: number;
  level?: string;
  section?: string;
  room?: string;
  schedule?: any[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  subject_name?: string;
  class_name?: string;
  difficulty_level: string;
  time_limit: number;
  total_marks: number;
  passing_marks: number;
  status: string;
  start_time?: string;
  end_time?: string;
  questions_count?: number;
  submissions_count?: number;
  average_score?: number;
  created_at: string;
  updated_at?: string;
}

interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  marks: number;
  explanation?: string;
  question_order: number;
}

interface ConductRecord {
  id: number;
  student_id: number;
  first_name: string;
  last_name: string;
  student_code: string;
  class_name: string;
  category_name: string;
  category_color: string;
  incident_date: string;
  incident_type: string;
  description: string;
  severity: string;
  action_name: string;
  action_type: string;
  status: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  reported_by?: string;
  attachments?: string[];
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  class_name: string;
  subject: string;
  total_marks: number;
  due_date: string;
  instructions?: string;
  work_type: string;
  status: string;
  submission_count: number;
  graded_count?: number;
  attachments?: string[];
}

interface MarksColumn {
  id: number;
  subject_name: string;
  subject_code: string;
  max_marks: number;
  class_name: string;
  term: number;
  academic_year: number;
  exam_type: string;
  exam_date?: string;
  weight?: number;
  average_marks?: number;
  highest_marks?: number;
  lowest_marks?: number;
}

interface AttendanceRecord {
  id: number;
  student_id: number;
  first_name: string;
  last_name: string;
  student_code: string;
  class_name: string;
  attendance_date: string;
  status: string;
  remarks?: string;
  marked_by?: number;
  marked_by_name?: string;
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

interface Statistics {
  students: number;
  attendance_rate: number;
  quizzes: {
    total: number;
    active: number;
    attempts: number;
    average_score: number;
  };
  assignments: {
    total: number;
    submissions: number;
    completion_rate: number;
  };
  conduct_incidents: number;
  resolved_incidents: number;
}

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3, minHeight: '60vh' }}>{children}</Box>}
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
}

function StatsCard({ title, value, subtitle, icon, color, trend, onClick }: StatsCardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: 4 } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ color, fontWeight: 'bold' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip 
                  icon={trend.isPositive ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                  label={`${trend.value}%`}
                  size="small"
                  color={trend.isPositive ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 32, color } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Enhanced Expand Card
interface ExpandCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  actions?: React.ReactNode;
}

function ExpandCard({ title, icon, children, defaultExpanded = false, actions }: ExpandCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card sx={{ mb: 2, overflow: 'hidden' }}>
      <CardContent 
        onClick={() => setExpanded(!expanded)}
        sx={{ 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          bgcolor: expanded ? 'action.hover' : 'transparent',
          py: 1.5,
          '&:hover': { bgcolor: 'action.hover' } 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
          <Typography variant="h6" fontWeight={600}>{title}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actions}
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </Box>
      </CardContent>
      <Collapse in={expanded}>
        <Divider />
        <CardContent sx={{ p: 0 }}>{children}</CardContent>
      </Collapse>
    </Card>
  );
}

// Quick Action Button
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

function QuickAction({ icon, label, onClick, color = 'primary' }: QuickActionProps) {
  return (
    <Tooltip title={label}>
      <Button
        variant="outlined"
        onClick={onClick}
        sx={{ 
          flexDirection: 'column',
          minWidth: 80,
          py: 1.5,
          borderColor: alpha(COLORS[color as keyof typeof COLORS] || COLORS.primary, 0.3),
          '&:hover': { borderColor: COLORS[color as keyof typeof COLORS] || COLORS.primary, bgcolor: alpha(COLORS[color as keyof typeof COLORS] || COLORS.primary, 0.05) }
        }}
      >
        {React.cloneElement(icon as React.ReactElement, { color: color as any })}
        <Typography variant="caption" sx={{ mt: 0.5 }}>{label}</Typography>
      </Button>
    </Tooltip>
  );
}

// Custom Card for charts
function ChartCard({ title, children, height = 300 }: { title: string; children: React.ReactNode; height?: number }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
        <Box sx={{ height }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

const TeacherComprehensiveDashboard: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Data states
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [conductRecords, setConductRecords] = useState<ConductRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [marksColumns, setMarksColumns] = useState<MarksColumn[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ 
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });

  // Dialog states
  const [openQuizDialog, setOpenQuizDialog] = useState(false);
  const [openQuizDetailDialog, setOpenQuizDetailDialog] = useState(false);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [openConductDialog, setOpenConductDialog] = useState(false);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [openMarksDialog, setOpenMarksDialog] = useState(false);
  const [openClassDetailDialog, setOpenClassDetailDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);

  // Form states
  const [quizForm, setQuizForm] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    subject_id: '',
    class_id: '',
    trade_code: '',
    level_number: '',
    difficulty_level: 'medium',
    time_limit: 30,
    total_marks: 100,
    passing_marks: 50,
    instructions: '',
    start_time: '',
    end_time: '',
    randomize_questions: false,
    show_results_immediately: true,
    allow_review: true,
    max_attempts: 3,
    status: 'draft'
  });

  const [assignmentForm, setAssignmentForm] = useState<Partial<Assignment>>({
    title: '',
    description: '',
    class_name: '',
    subject: '',
    total_marks: 100,
    due_date: '',
    instructions: '',
    work_type: 'assignment'
  });

  const [attendanceForm, setAttendanceForm] = useState({
    class_name: '',
    date: new Date().toISOString().split('T')[0],
    records: [] as { student_id: string; status: string; remarks: string }[]
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassData | null>(null);

  // Show alert helper
  const showAlert = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  // Get auth token
  const getToken = () => localStorage.getItem('token') || localStorage.getItem('auth_token');

  // API helper
  const apiCall = useCallback(async (endpoint: string, options: any = {}) => {
    const token = getToken();
    return axios({
      url: `${API_BASE_URL}${endpoint}`,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchDashboard(),
          fetchProfile(),
          fetchStatistics()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 0: fetchDashboard(); break;
      case 1: fetchStudents(); break;
      case 2: fetchClasses(); break;
      case 3: fetchQuizzes(); break;
      case 4: fetchConductRecords(); break;
      case 5: fetchAttendance(); break;
      case 6: fetchMarksColumns(); break;
      case 7: fetchAssignments(); break;
      default: break;
    }
  }, [activeTab, selectedClass, selectedStatus]);

  // Fetch functions
  const fetchDashboard = async () => {
    try {
      const response = await apiCall('/teacher-comprehensive/dashboard');
      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      showAlert('error', 'Failed to load dashboard data');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await apiCall('/teacher-comprehensive/profile');
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiCall('/teacher-comprehensive/statistics');
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedClass) params.append('class_name', selectedClass);
      params.append('limit', String(rowsPerPage));
      params.append('offset', String(page * rowsPerPage));
      
      const response = await apiCall(`/teacher-comprehensive/students?${params}`);
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showAlert('error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/teacher-comprehensive/classes');
      if (response.data.success) {
        setClasses(response.data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showAlert('error', 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await apiCall(`/teacher-comprehensive/quizzes?${params}`);
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

  const fetchQuizDetail = async (quizId: number) => {
    try {
      const response = await apiCall(`/teacher-comprehensive/quizzes/${quizId}`);
      if (response.data.success) {
        setSelectedQuiz(response.data.quiz);
        setQuizQuestions(response.data.quiz.questions || []);
        setOpenQuizDetailDialog(true);
      }
    } catch (error) {
      console.error('Error fetching quiz detail:', error);
      showAlert('error', 'Failed to load quiz details');
    }
  };

  const fetchConductRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (dateRange.start) params.append('date_from', dateRange.start);
      if (dateRange.end) params.append('date_to', dateRange.end);
      
      const response = await apiCall(`/teacher-comprehensive/conduct?${params}`);
      if (response.data.success) {
        setConductRecords(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching conduct records:', error);
      showAlert('error', 'Failed to load conduct records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append('class_name', selectedClass);
      if (dateRange.start) params.append('date_from', dateRange.start);
      if (dateRange.end) params.append('date_to', dateRange.end);
      
      const response = await apiCall(`/teacher-comprehensive/attendance?${params}`);
      if (response.data.success) {
        setAttendance(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showAlert('error', 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarksColumns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append('class_name', selectedClass);
      
      const response = await apiCall(`/teacher-comprehensive/marks/columns?${params}`);
      if (response.data.success) {
        setMarksColumns(response.data.columns);
      }
    } catch (error) {
      console.error('Error fetching marks columns:', error);
      showAlert('error', 'Failed to load marks columns');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedClass) params.append('class_name', selectedClass);
      
      const response = await apiCall(`/teacher-comprehensive/assignments?${params}`);
      if (response.data.success) {
        setAssignments(response.data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showAlert('error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreateQuiz = async () => {
    try {
      const response = await apiCall('/teacher-comprehensive/quizzes', {
        method: 'POST',
        data: quizForm
      });
      
      if (response.data.success) {
        showAlert('success', 'Quiz created successfully!');
        setOpenQuizDialog(false);
        resetQuizForm();
        fetchQuizzes();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to create quiz');
    }
  };

  const handleUpdateQuiz = async () => {
    if (!selectedQuiz) return;
    
    try {
      const response = await apiCall(`/teacher-comprehensive/quizzes/${selectedQuiz.id}`, {
        method: 'PUT',
        data: quizForm
      });
      
      if (response.data.success) {
        showAlert('success', 'Quiz updated successfully!');
        setOpenQuizDialog(false);
        fetchQuizzes();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to update quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
    
    try {
      const response = await apiCall(`/teacher-comprehensive/quizzes/${quizId}`, {
        method: 'DELETE'
      });
      
      if (response.data.success) {
        showAlert('success', 'Quiz deleted successfully!');
        fetchQuizzes();
      }
    } catch (error) {
      showAlert('error', 'Failed to delete quiz');
    }
  };

  const handleRemoveConductRecord = async (recordId: number) => {
    if (!confirm('Are you sure you want to remove this conduct record? This action cannot be undone.')) return;
    
    try {
      const response = await apiCall(`/teacher-comprehensive/conduct/${recordId}`, {
        method: 'DELETE'
      });
      
      if (response.data.success) {
        showAlert('success', 'Conduct record removed successfully!');
        fetchConductRecords();
      }
    } catch (error) {
      showAlert('error', 'Failed to remove conduct record');
    }
  };

  const handleBulkRemoveConduct = async (recordIds: number[]) => {
    if (!confirm(`Are you sure you want to remove ${recordIds.length} conduct record(s)?`)) return;
    
    try {
      const response = await apiCall('/teacher-comprehensive/conduct/bulk-delete', {
        method: 'POST',
        data: { record_ids: recordIds }
      });
      
      if (response.data.success) {
        showAlert('success', response.data.message);
        fetchConductRecords();
      }
    } catch (error) {
      showAlert('error', 'Failed to remove conduct records');
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const response = await apiCall('/teacher-comprehensive/assignments', {
        method: 'POST',
        data: assignmentForm
      });
      
      if (response.data.success) {
        showAlert('success', 'Assignment created successfully!');
        setOpenAssignmentDialog(false);
        resetAssignmentForm();
        fetchAssignments();
      }
    } catch (error) {
      showAlert('error', 'Failed to create assignment');
    }
  };

  const handleMarkAttendance = async () => {
    if (!attendanceForm.class_name || attendanceForm.records.length === 0) {
      showAlert('warning', 'Please select a class and enter attendance records');
      return;
    }
    
    try {
      const response = await apiCall('/teacher-comprehensive/attendance/mark', {
        method: 'POST',
        data: attendanceForm
      });
      
      if (response.data.success) {
        showAlert('success', response.data.message);
        setOpenAttendanceDialog(false);
        fetchAttendance();
      }
    } catch (error) {
      showAlert('error', 'Failed to mark attendance');
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setOpenStudentDialog(true);
  };

  const handleViewClassDetail = (cls: ClassData) => {
    setSelectedClassDetail(cls);
    setOpenClassDetailDialog(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setQuizForm(quiz);
    setSelectedQuiz(quiz);
    setOpenQuizDialog(true);
  };

  // Reset forms
  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      subject_id: '',
      class_id: '',
      trade_code: '',
      level_number: '',
      difficulty_level: 'medium',
      time_limit: 30,
      total_marks: 100,
      passing_marks: 50,
      instructions: '',
      start_time: '',
      end_time: '',
      randomize_questions: false,
      show_results_immediately: true,
      allow_review: true,
      max_attempts: 3,
      status: 'draft'
    });
    setSelectedQuiz(null);
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      title: '',
      description: '',
      class_name: '',
      subject: '',
      total_marks: 100,
      due_date: '',
      instructions: '',
      work_type: 'assignment'
    });
  };

  // Helper functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'success';
      case 'moderate': return 'warning';
      case 'severe': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'info';
      case 'closed': return 'default';
      case 'pending': return 'warning';
      case 'resolved': return 'success';
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'default';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#4caf50';
      case 'absent': return '#f44336';
      case 'late': return '#ff9800';
      case 'excused': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Calculate attendance summary
  const getAttendanceSummary = (): AttendanceSummary => {
    const summary = { present: 0, absent: 0, late: 0, excused: 0, total: attendance.length, percentage: 0 };
    attendance.forEach(record => {
      switch (record.status) {
        case 'present': summary.present++; break;
        case 'absent': summary.absent++; break;
        case 'late': summary.late++; break;
        case 'excused': summary.excused++; break;
      }
    });
    summary.percentage = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;
    return summary;
  };

  // Export functions
  const handleExport = (type: 'students' | 'quizzes' | 'conduct' | 'attendance' | 'marks' | 'assignments') => {
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'students':
        data = students;
        filename = 'students.csv';
        break;
      case 'quizzes':
        data = quizzes;
        filename = 'quizzes.csv';
        break;
      case 'conduct':
        data = conductRecords;
        filename = 'conduct_records.csv';
        break;
      case 'attendance':
        data = attendance;
        filename = 'attendance.csv';
        break;
      case 'marks':
        data = marksColumns;
        filename = 'marks.csv';
        break;
      case 'assignments':
        data = assignments;
        filename = 'assignments.csv';
        break;
    }

    // Simple CSV export
    if (data.length > 0) {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => Object.values(item).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      showAlert('success', `Exported ${data.length} records to ${filename}`);
    }
    
    setOpenExportDialog(false);
  };

  // Quick actions
  const quickActions = [
    { icon: <QuizIcon />, label: 'Create Quiz', action: () => { resetQuizForm(); setOpenQuizDialog(true); }, color: 'primary' as const },
    { icon: <AssignmentIcon />, label: 'Create Assignment', action: () => { resetAssignmentForm(); setOpenAssignmentDialog(true); }, color: 'secondary' as const },
    { icon: <FactCheckIcon />, label: 'Mark Attendance', action: () => setOpenAttendanceDialog(true), color: 'success' as const },
    { icon: <Grade />, label: 'Record Marks', action: () => setOpenMarksDialog(true), color: 'warning' as const },
    { icon: <Sync />, label: 'Refresh Data', action: () => fetchDashboard(), color: 'info' as const },
  ];

  if (initialLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
        <Container maxWidth="xl">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'primary.main',
                    fontSize: 24,
                    fontWeight: 'bold'
                  }}
                >
                  {profile ? getInitials(profile.first_name, profile.last_name) : 'T'}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Welcome back, {profile?.first_name || 'Teacher'}!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile?.role || 'Teacher'} | {dashboard?.assigned_classes || 0} Classes | {dashboard?.total_students || 0} Students
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                {quickActions.map((action, index) => (
                  <QuickAction 
                    key={index}
                    icon={action.icon}
                    label={action.label}
                    onClick={action.action}
                    color={action.color}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* Alert */}
        {alert && (
          <Alert 
            severity={alert.type} 
            onClose={() => setAlert(null)} 
            sx={{ mb: 3 }}
            variant="filled"
          >
            {alert.message}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatsCard
              title="Classes"
              value={dashboard?.assigned_classes || 0}
              subtitle="Assigned"
              icon={<School />}
              color={COLORS.primary}
              onClick={() => setActiveTab(2)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatsCard
              title="Students"
              value={dashboard?.total_students || 0}
              subtitle="Enrolled"
              icon={<People />}
              color={COLORS.success}
              onClick={() => setActiveTab(1)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatsCard
              title="Quizzes"
              value={dashboard?.active_quizzes || 0}
              subtitle="Active"
              icon={<Quiz />}
              color={COLORS.warning}
              onClick={() => setActiveTab(3)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatsCard
              title="Submissions"
              value={dashboard?.pending_submissions || 0}
              subtitle="Pending"
              icon={<Assignment />}
              color={COLORS.info}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatsCard
              title="Incidents"
              value={dashboard?.recent_incidents || 0}
              subtitle="This week"
              icon={<Gavel />}
              color={COLORS.error}
              onClick={() => setActiveTab(4)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatsCard
              title="Attendance"
              value={`${statistics?.attendance_rate || 0}%`}
              subtitle="Rate"
              icon={<CalendarToday />}
              color={COLORS.secondary}
              onClick={() => setActiveTab(5)}
            />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => { setActiveTab(newValue); setPage(0); }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              px: 2,
              '& .MuiTab-root': { minHeight: 56 }
            }}
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
            <Tab icon={<People />} label="Students" iconPosition="start" />
            <Tab icon={<Class />} label="Classes" iconPosition="start" />
            <Tab icon={<Quiz />} label="Quizzes" iconPosition="start" />
            <Tab icon={<Gavel />} label="Conduct" iconPosition="start" />
            <Tab icon={<CalendarToday />} label="Attendance" iconPosition="start" />
            <Tab icon={<Grade />} label="Gradebook" iconPosition="start" />
            <Tab icon={<AssignmentTurnedIn />} label="Assignments" iconPosition="start" />
          </Tabs>

          {/* Dashboard Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Upcoming Assignments */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <ExpandCard title="Upcoming Assignments" icon={<Assignment />} defaultExpanded>
                  <List disablePadding>
                    {dashboard?.upcoming_assignments?.slice(0, 5).map((assignment: any, index: number) => (
                      <ListItem 
                        key={index} 
                        divider={index < Math.min((dashboard.upcoming_assignments?.length || 1) - 1, 4)}
                        sx={{ px: 2, py: 1.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AssignmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={assignment.title}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <Chip label={assignment.class_name} size="small" variant="outlined" />
                              <Typography variant="caption">Due: {formatDate(assignment.due_date)}</Typography>
                              <Chip 
                                label={`${assignment.submission_count} submitted`} 
                                size="small" 
                                color={assignment.submission_count > 0 ? 'success' : 'default'}
                              />
                            </Stack>
                          }
                        />
                      </ListItem>
                    ))}
                    {(!dashboard?.upcoming_assignments || dashboard.upcoming_assignments.length === 0) && (
                      <ListItem>
                        <ListItemText primary="No upcoming assignments" secondary="You're all caught up!" />
                      </ListItem>
                    )}
                  </List>
                </ExpandCard>
              </Grid>

              {/* Class Performance */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <ExpandCard title="Class Performance" icon={<TrendingUp />} defaultExpanded>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Class</TableCell>
                          <TableCell align="center">Students</TableCell>
                          <TableCell align="center">Avg GPA</TableCell>
                          <TableCell align="center">Attendance</TableCell>
                          <TableCell align="center">Trend</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboard?.class_performance?.map((cls: any, index: number) => (
                          <TableRow key={index} hover>
                            <TableCell>{cls.class_name}</TableCell>
                            <TableCell align="center">{cls.student_count}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={cls.avg_gpa || 'N/A'} 
                                size="small" 
                                color={cls.avg_gpa >= 3.0 ? 'success' : cls.avg_gpa >= 2.0 ? 'warning' : 'error'}
                              />
                            </TableCell>
                            <TableCell align="center">{cls.avg_attendance || 0}%</TableCell>
                            <TableCell align="center">
                              <IconButton size="small" color="primary">
                                <TrendingUp fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ExpandCard>
              </Grid>

              {/* Quick Stats Charts */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard title="Attendance Overview" height={250}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: getAttendanceSummary().present, color: '#4caf50' },
                          { name: 'Absent', value: getAttendanceSummary().absent, color: '#f44336' },
                          { name: 'Late', value: getAttendanceSummary().late, color: '#ff9800' },
                          { name: 'Excused', value: getAttendanceSummary().excused, color: '#2196f3' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Present', value: getAttendanceSummary().present, color: '#4caf50' },
                          { name: 'Absent', value: getAttendanceSummary().absent, color: '#f44336' },
                          { name: 'Late', value: getAttendanceSummary().late, color: '#ff9800' },
                          { name: 'Excused', value: getAttendanceSummary().excused, color: '#2196f3' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard title="Activity Overview" height={250}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Quizzes', value: statistics?.quizzes?.total || 0 },
                      { name: 'Assignments', value: statistics?.assignments?.total || 0 },
                      { name: 'Incidents', value: statistics?.conduct_incidents || 0 },
                      { name: 'Resolved', value: statistics?.resolved_incidents || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Students Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    placeholder="Search students by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchStudents()}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => { setSearchTerm(''); fetchStudents(); }}>
                            <Clear />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Class</InputLabel>
                    <Select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      label="Class"
                    >
                      <MenuItem value="">All Classes</MenuItem>
                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.name}>{cls.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, value) => value && setViewMode(value)}
                    size="small"
                  >
                    <ToggleButton value="grid"><ViewModule /></ToggleButton>
                    <ToggleButton value="list"><ViewList /></ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<Search />}
                    onClick={fetchStudents}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : viewMode === 'grid' ? (
              <Grid container spacing={2}>
                {students.map((student, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                    <Card sx={{ 
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {getInitials(student.first_name, student.last_name)}
                          </Avatar>
                          <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="subtitle1" fontWeight={600} noWrap>
                              {student.first_name} {student.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.student_code}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Grid container spacing={1}>
                          <Grid size={6}>
                            <Typography variant="caption" color="text.secondary">Class</Typography>
                            <Typography variant="body2" fontWeight={500}>{student.class_name}</Typography>
                          </Grid>
                          <Grid size={6}>
                            <Typography variant="caption" color="text.secondary">Trade</Typography>
                            <Typography variant="body2" fontWeight={500}>{student.trade_code || 'N/A'}</Typography>
                          </Grid>
                          <Grid size={6}>
                            <Typography variant="caption" color="text.secondary">GPA</Typography>
                            <Typography variant="body2" fontWeight={500} color={student.gpa && student.gpa >= 3 ? 'success.main' : 'text.primary'}>
                              {student.gpa || 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid size={6}>
                            <Typography variant="caption" color="text.secondary">Attendance</Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {student.attendance_percentage || 0}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button 
                          size="small" 
                          startIcon={<Visibility />}
                          onClick={() => handleViewStudent(student)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Trade</TableCell>
                      <TableCell align="center">GPA</TableCell>
                      <TableCell align="center">Attendance</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{student.student_code}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                              {getInitials(student.first_name, student.last_name)}
                            </Avatar>
                            {student.first_name} {student.last_name}
                          </Box>
                        </TableCell>
                        <TableCell>{student.class_name}</TableCell>
                        <TableCell>{student.trade_code || 'N/A'}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={student.gpa || 'N/A'} 
                            size="small"
                            color={student.gpa && student.gpa >= 3 ? 'success' : student.gpa && student.gpa >= 2 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="center">{student.attendance_percentage || 0}%</TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton onClick={() => handleViewStudent(student)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={students.length}
                  page={page}
                  onPageChange={(_, newPage) => { setPage(newPage); fetchStudents(); }}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                />
              </TableContainer>
            )}
          </TabPanel>

          {/* Classes Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              {classes.map((cls, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>{cls.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{cls.trade_name}</Typography>
                        </Box>
                        <Chip label={cls.trade_code} size="small" variant="outlined" />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: alpha(COLORS.primary, 0.1), borderRadius: 2 }}>
                            <Typography variant="h4" color="primary">{cls.student_count}</Typography>
                            <Typography variant="caption">Students</Typography>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: alpha(COLORS.success, 0.1), borderRadius: 2 }}>
                            <Typography variant="h4" color="success">{cls.subject_count}</Typography>
                            <Typography variant="caption">Subjects</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        startIcon={<Visibility />}
                        onClick={() => handleViewClassDetail(cls)}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              {classes.length === 0 && (
                <Grid size={12}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Class sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No classes assigned yet</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Quizzes Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchQuizzes}>
                  Refresh
                </Button>
              </Box>
              <Button variant="contained" startIcon={<Add />} onClick={() => { resetQuizForm(); setOpenQuizDialog(true); }}>
                Create Quiz
              </Button>
            </Box>

            <Grid container spacing={3}>
              {quizzes.map((quiz, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" fontWeight={600} noWrap sx={{ maxWidth: '70%' }}>
                          {quiz.title}
                        </Typography>
                        <Chip label={quiz.status} color={getStatusColor(quiz.status) as any} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {quiz.description || 'No description'}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Grid container spacing={1}>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">Time Limit</Typography>
                          <Typography variant="body2" fontWeight={500}>{quiz.time_limit} min</Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">Total Marks</Typography>
                          <Typography variant="body2" fontWeight={500}>{quiz.total_marks}</Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">Difficulty</Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                            {quiz.difficulty_level}
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">Questions</Typography>
                          <Typography variant="body2" fontWeight={500}>{quiz.questions_count || 0}</Typography>
                        </Grid>
                      </Grid>
                      {quiz.submissions_count !== undefined && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="caption" color="text.secondary">
                            {quiz.submissions_count} submissions | Avg: {quiz.average_score || 0}%
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Button size="small" startIcon={<Visibility />} onClick={() => fetchQuizDetail(quiz.id)}>
                        View
                      </Button>
                      <Button size="small" startIcon={<Edit />} onClick={() => handleEditQuiz(quiz)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDeleteQuiz(quiz.id)}>
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              {quizzes.length === 0 && (
                <Grid size={12}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Quiz sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No quizzes created yet</Typography>
                    <Button variant="contained" startIcon={<Add />} sx={{ mt: 2 }} onClick={() => setOpenQuizDialog(true)}>
                      Create Your First Quiz
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Conduct Tab */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    type="date"
                    label="From Date"
                    InputLabelProps={{ shrink: true }}
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    type="date"
                    label="To Date"
                    InputLabelProps={{ shrink: true }}
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" onClick={fetchConductRecords}>Apply</Button>
                    <Button variant="outlined" startIcon={<FileDownload />} onClick={() => handleExport('conduct')}>
                      Export
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {conductRecords.map((record, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                            {getInitials(record.first_name, record.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{record.first_name} {record.last_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{record.student_code}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{record.class_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.category_name} 
                          size="small" 
                          sx={{ bgcolor: record.category_color, color: 'white' }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.severity} 
                          color={getSeverityColor(record.severity) as any} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{formatDate(record.incident_date)}</TableCell>
                      <TableCell>
                        <Chip label={record.status} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Remove Record">
                          <IconButton color="error" onClick={() => handleRemoveConductRecord(record.id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Attendance Tab */}
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Class</InputLabel>
                    <Select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      label="Class"
                    >
                      <MenuItem value="">All Classes</MenuItem>
                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.name}>{cls.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    type="date"
                    label="From Date"
                    InputLabelProps={{ shrink: true }}
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    type="date"
                    label="To Date"
                    InputLabelProps={{ shrink: true }}
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" onClick={fetchAttendance}>Filter</Button>
                    <Button variant="outlined" startIcon={<FileDownload />} onClick={() => handleExport('attendance')}>
                      Export
                    </Button>
                    <Button variant="contained" color="success" startIcon={<Add />} onClick={() => setOpenAttendanceDialog(true)}>
                      Mark
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Attendance Summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card sx={{ bgcolor: alpha('#4caf50', 0.1) }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="success">{getAttendanceSummary().present}</Typography>
                    <Typography variant="body2">Present</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card sx={{ bgcolor: alpha('#f44336', 0.1) }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="error">{getAttendanceSummary().absent}</Typography>
                    <Typography variant="body2">Absent</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card sx={{ bgcolor: alpha('#ff9800', 0.1) }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="warning">{getAttendanceSummary().late}</Typography>
                    <Typography variant="body2">Late</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card sx={{ bgcolor: alpha('#2196f3', 0.1) }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="info">{getAttendanceSummary().percentage}%</Typography>
                    <Typography variant="body2">Attendance Rate</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Student Code</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.slice(0, 50).map((record, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                            {getInitials(record.first_name, record.last_name)}
                          </Avatar>
                          {record.first_name} {record.last_name}
                        </Box>
                      </TableCell>
                      <TableCell>{record.student_code}</TableCell>
                      <TableCell>{record.class_name}</TableCell>
                      <TableCell>{formatDate(record.attendance_date)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.status} 
                          sx={{ 
                            bgcolor: getAttendanceStatusColor(record.status),
                            color: 'white'
                          }} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{record.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Gradebook Tab */}
          <TabPanel value={activeTab} index={6}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    label="Class"
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.name}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={fetchMarksColumns}>Filter</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={() => handleExport('marks')}>
                  Export
                </Button>
              </Box>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenMarksDialog(true)}>
                Add Column
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Term</TableCell>
                    <TableCell align="center">Max Marks</TableCell>
                    <TableCell>Exam Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marksColumns.map((column, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{column.subject_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{column.subject_code}</Typography>
                      </TableCell>
                      <TableCell>{column.class_name}</TableCell>
                      <TableCell>Term {column.term}</TableCell>
                      <TableCell align="center">{column.max_marks}</TableCell>
                      <TableCell>
                        <Chip label={column.exam_type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{column.exam_date ? formatDate(column.exam_date) : '-'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Marks">
                          <IconButton><Visibility /></IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton><Edit /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Assignments Tab */}
          <TabPanel value={activeTab} index={7}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    label="Class"
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.name}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={fetchAssignments}>Filter</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={() => handleExport('assignments')}>
                  Export
                </Button>
              </Box>
              <Button variant="contained" startIcon={<Add />} onClick={() => { resetAssignmentForm(); setOpenAssignmentDialog(true); }}>
                Create Assignment
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell align="center">Marks</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="center">Submissions</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{assignment.title}</Typography>
                        {assignment.description && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                            {assignment.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{assignment.class_name}</TableCell>
                      <TableCell>{assignment.subject}</TableCell>
                      <TableCell align="center">{assignment.total_marks}</TableCell>
                      <TableCell>{formatDate(assignment.due_date)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${assignment.submission_count} submitted`}
                          size="small"
                          color={assignment.submission_count > 0 ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={assignment.status} color={assignment.status === 'active' ? 'success' : 'default'} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>

        {/* Create/Edit Quiz Dialog */}
        <Dialog open={openQuizDialog} onClose={() => setOpenQuizDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedQuiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  value={quizForm.title || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={quizForm.description || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={String(quizForm.class_id || '')}
                    onChange={(e) => setQuizForm({ ...quizForm, class_id: e.target.value })}
                    label="Class"
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={quizForm.difficulty_level || 'medium'}
                    onChange={(e) => setQuizForm({ ...quizForm, difficulty_level: e.target.value })}
                    label="Difficulty"
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Time Limit (minutes)"
                  value={quizForm.time_limit || 30}
                  onChange={(e) => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Marks"
                  value={quizForm.total_marks || 100}
                  onChange={(e) => setQuizForm({ ...quizForm, total_marks: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Passing Marks"
                  value={quizForm.passing_marks || 50}
                  onChange={(e) => setQuizForm({ ...quizForm, passing_marks: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Start Time"
                  InputLabelProps={{ shrink: true }}
                  value={quizForm.start_time || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, start_time: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="End Time"
                  InputLabelProps={{ shrink: true }}
                  value={quizForm.end_time || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, end_time: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Instructions"
                  value={quizForm.instructions || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, instructions: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={quizForm.status || 'draft'}
                    onChange={(e) => setQuizForm({ ...quizForm, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Attempts"
                  value={quizForm.max_attempts || 3}
                  onChange={(e) => setQuizForm({ ...quizForm, max_attempts: parseInt(e.target.value) })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenQuizDialog(false)}>Cancel</Button>
            {selectedQuiz ? (
              <Button variant="contained" onClick={handleUpdateQuiz}>Update Quiz</Button>
            ) : (
              <Button variant="contained" onClick={handleCreateQuiz}>Create Quiz</Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Quiz Detail Dialog */}
        <Dialog open={openQuizDetailDialog} onClose={() => setOpenQuizDetailDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedQuiz?.title}
              <Chip label={selectedQuiz?.status} color={getStatusColor(selectedQuiz?.status || '') as any} />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedQuiz?.description || 'No description'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Questions ({quizQuestions.length})</Typography>
            {quizQuestions.map((question, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="body1" fontWeight={500}>
                    Q{index + 1}. {question.question_text}
                    <Chip label={`${question.marks} marks`} size="small" sx={{ ml: 1 }} />
                  </Typography>
                  {question.options && question.options.length > 0 && (
                    <List dense>
                      {question.options.map((option, optIndex) => (
                        <ListItem key={optIndex}>
                          <ListItemIcon>
                            {option === question.correct_answer ? 
                              <CheckCircle color="success" /> : 
                              <CircleOutlined />
                            }
                          </ListItemIcon>
                          <ListItemText primary={option} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenQuizDetailDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Create Assignment Dialog */}
        <Dialog open={openAssignmentDialog} onClose={() => setOpenAssignmentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Assignment Title"
                  value={assignmentForm.title || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={assignmentForm.description || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={assignmentForm.class_name || ''}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, class_name: e.target.value })}
                    label="Class"
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.name}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={assignmentForm.subject || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Marks"
                  value={assignmentForm.total_marks || 100}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, total_marks: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Due Date"
                  InputLabelProps={{ shrink: true }}
                  value={assignmentForm.due_date || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Instructions"
                  value={assignmentForm.instructions || ''}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAssignmentDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateAssignment}>Create Assignment</Button>
          </DialogActions>
        </Dialog>

        {/* Student Details Dialog */}
        <Dialog open={openStudentDialog} onClose={() => setOpenStudentDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Student Details</DialogTitle>
          <DialogContent>
            {selectedStudent && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ width: 64, height: 64, fontSize: 24, bgcolor: 'primary.main' }}>
                    {getInitials(selectedStudent.first_name, selectedStudent.last_name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStudent.student_code}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Class</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedStudent.class_name}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Trade</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedStudent.trade_code || 'N/A'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Level</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedStudent.level_number || 'N/A'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedStudent.gender || 'N/A'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">GPA</Typography>
                    <Typography variant="body1" fontWeight={500} color={selectedStudent.gpa && selectedStudent.gpa >= 3 ? 'success.main' : 'text.primary'}>
                      {selectedStudent.gpa || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Attendance</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedStudent.attendance_percentage || 0}%
                    </Typography>
                  </Grid>
                  {selectedStudent.phone && (
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedStudent.phone}</Typography>
                    </Grid>
                  )}
                  {selectedStudent.email && (
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedStudent.email}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStudentDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Mark Attendance Dialog */}
        <Dialog open={openAttendanceDialog} onClose={() => setOpenAttendanceDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={attendanceForm.class_name}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, class_name: e.target.value })}
                    label="Class"
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.name}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={attendanceForm.date}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAttendanceDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleMarkAttendance}>Continue</Button>
          </DialogActions>
        </Dialog>

        {/* Class Detail Dialog */}
        <Dialog open={openClassDetailDialog} onClose={() => setOpenClassDetailDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Class Details</DialogTitle>
          <DialogContent>
            {selectedClassDetail && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {selectedClassDetail.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedClassDetail.trade_name} ({selectedClassDetail.trade_code})
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Students</Typography>
                    <Typography variant="h4" color="primary">{selectedClassDetail.student_count}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Subjects</Typography>
                    <Typography variant="h4" color="success">{selectedClassDetail.subject_count}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenClassDetailDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default TeacherComprehensiveDashboard;

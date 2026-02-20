import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, GraduationCap, TrendingUp, Calendar, Bell, DollarSign,
  BookOpen, Award, Clock, MessageSquare, FileText, BarChart3,
  CheckCircle, XCircle, AlertCircle, Phone, Mail, MapPin, User,
  Loader2, RefreshCw, Search, Filter, ChevronRight, Star, Target,
  Activity, Wallet, BookMarked, Home, LogOut, Send, Plus, Edit,
  Trash2, MoreVertical, Eye, Download, Upload, CheckSquare,
  X, Menu, BellRing, MessageCircle, Wifi, WifiOff, Smartphone,
  CreditCard, Receipt, PiggyBank, TrendingDown, TrendingUp as TrendUp,
  Book, Clipboard, FileCheck, AlertTriangle, Info, HelpCircle,
  Settings, LogOut as LogoutIcon, UserPlus, UserCheck, UserX,
  CheckCircle2, Circle, ArrowRight, ArrowLeft, ChevronDown,
  CalendarDays, Clock3, BookOpenCheck, Trophy,
  Medal, Crown, Gem, Sparkles, Zap, Palette, LayoutGrid, List,
  SearchCode, BarChart, PieChart, LineChart, AreaChart,
  Smile, Frown, Meh, SendHorizontal, Paperclip, Image, File,
  Video, Mic, MicOff, Camera, CameraOff, Monitor, Tablet, Smartphone as SmartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '../components/ui/dropdown-menu';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { toast, Toaster } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

interface ParentDashboardProps {
  onNavigate: (page: string) => void;
}

interface LinkedStudent {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_name: string;
  trade_code: string;
  level_number: number;
  level_suffix?: string;
  gender: string;
  gpa?: number;
  attendance_percentage?: number;
  balance?: number;
  total_fees?: number;
  paid_fees?: number;
  photo_url?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
}

interface Grade {
  id: number;
  subject: string;
  subject_rw?: string;
  score: number;
  max_score: number;
  grade: string;
  grade_points: number;
  exam_type: string;
  exam_date: string;
  term: string;
  academic_year: string;
  teacher_name?: string;
  comments?: string;
}

interface Attendance {
  id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  period?: string;
  subject?: string;
  notes?: string;
}

interface FeePayment {
  id: number;
  amount: number;
  description: string;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  term?: string;
  academic_year?: string;
}

interface DODMessage {
  id: number;
  message: string;
  message_rw?: string;
  type: 'leave' | 'conduct' | 'sick' | 'general' | 'achievement' | 'warning' | 'info';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  is_read: boolean;
  sender_name: string;
  sender_role?: string;
  student_name?: string;
}

interface ExamSchedule {
  id: number;
  subject: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  exam_type: string;
  term: string;
  academic_year?: string;
  notes?: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  photo_url?: string;
}

interface TimetableEntry {
  id: number;
  day: string;
  period: number;
  subject: string;
  subject_rw?: string;
  room: string;
  teacher_name: string;
  start_time: string;
  end_time: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  is_read: boolean;
}

interface ActivityUpdate {
  type: 'performance' | 'attendance' | 'exam' | 'conduct';
  title: string;
  description: string;
  date: string;
  data: any;
}

interface ConductDetails {
  current_score: number;
  total_incidents: number;
  total_points_lost: number;
  records: Array<{
    id: number;
    incident_type: string;
    severity: string;
    description: string;
    action_taken: string;
    conduct_points_deducted: number;
    new_conduct_score: number;
    removed_by_name: string;
    created_at: string;
    incident_date: string;
  }>;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [linking, setLinking] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [language, setLanguage] = useState<'en' | 'rw'>('en');

  // Student detail data
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [dodMessages, setDodMessages] = useState<DODMessage[]>([]);
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityUpdates, setActivityUpdates] = useState<ActivityUpdate[]>([]);
  const [activitySummary, setActivitySummary] = useState<any>(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityUpdate | null>(null);
  const [conductDetails, setConductDetails] = useState<ConductDetails | null>(null);
  const [showConductDialog, setShowConductDialog] = useState(false);

  // Linking form - NO student code needed!
  const [linkForm, setLinkForm] = useState({
    trade_code: 'SOD',
    level: '4',
    student_first_name: '',
    student_last_name: '',
    gender: '',
    student_phone: '',
    relationship: 'parent'
  });

  // Message form
  const [messageForm, setMessageForm] = useState({
    recipient: 'all',
    subject: '',
    message: '',
    priority: 'normal'
  });

  // Payment form state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'mobile_money',
    phone: '',
    reference_number: '',
    payment_type: 'tuition',
    term: 'Term 1',
    notes: ''
  });
  const [feeStructure, setFeeStructure] = useState<{
    term: string;
    amount: number;
    due_date: string;
    status: string;
  }[]>([]);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterTrade, setFilterTrade] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch all initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentDetails(selectedStudent.id);
      loadActivityUpdates(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);

      // Try to auto-fetch Level 4 SOD student
      try {
        const autoFetchRes = await fetch(`${API_BASE}/parent-dashboard/student/auto-fetch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ parent_id: user.id, phone: user.phone })
        });

        const autoFetchData = await autoFetchRes.json();

        if (autoFetchData.success && autoFetchData.student) {
          setStudents([autoFetchData.student]);
          setSelectedStudent(autoFetchData.student);
        } else {
          fetchLinkedStudents();
        }
      } catch (autoError) {
        console.log('Auto-fetch failed, trying linked students');
        fetchLinkedStudents();
      }

      // Fetch notifications
      try {
        const notifRes = await fetch(`${API_BASE}/parent-dashboard/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const notifData = await notifRes.json();
        if (notifData.success) setNotifications(notifData.notifications || []);
      } catch (e) {
        console.log('No notifications');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/parent-dashboard/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.students) {
        setStudents(data.students);
        if (data.students.length > 0) {
          setSelectedStudent(data.students[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching linked students:', error);
    }
  };

  const loadStudentDetails = async (studentId: number) => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');

      const [gradesRes, attendanceRes, feesRes, messagesRes, examsRes, teachersRes, timetableRes] = await Promise.all([
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/grades`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/attendance`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/fees`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/dod-messages`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/exams`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/teachers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/timetable`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const gradesData = await gradesRes.json();
      const attendanceData = await attendanceRes.json();
      const feesData = await feesRes.json();
      const messagesData = await messagesRes.json();
      const examsData = await examsRes.json();
      const teachersData = await teachersRes.json();
      const timetableData = await timetableRes.json();

      if (gradesData.success) setGrades(gradesData.grades || gradesData.data || []);
      if (attendanceData.success) setAttendance(attendanceData.records || attendanceData.data || []);
      if (feesData.success) {
        setFeePayments(feesData.payments || feesData.fees || feesData.data || []);
        // Set up fee structure from the student data
        const totalFee = selectedStudent?.total_fees || feesData.total_fees || 0;
        const paidFee = selectedStudent?.paid_fees || feesData.paid_amount || 0;
        const terms = ['Term 1', 'Term 2', 'Term 3'];
        const termAmount = totalFee / 3;
        const structure = terms.map((term, idx) => {
          const paid = idx === 0 ? Math.min(termAmount, paidFee) : 0;
          return {
            term,
            amount: termAmount,
            due_date: new Date(2024, idx * 3 + 1, 15).toISOString().split('T')[0],
            status: idx === 0 && paid < termAmount ? 'due' : (paid >= termAmount ? 'paid' : 'upcoming')
          };
        });
        setFeeStructure(structure);
      }
      if (messagesData.success) setDodMessages(messagesData.messages || []);
      if (examsData.success) setExams(examsData.exams || examsData.schedule || []);
      if (teachersData.success) setTeachers(teachersData.teachers || []);
      if (timetableData.success) setTimetable(timetableData.schedule || timetableData.timetable || []);

    } catch (error) {
      console.error('Error loading student details:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadActivityUpdates = async (studentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/parent-activity/student/${studentId}/activity-updates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActivityUpdates(data.updates || []);
        setActivitySummary(data.summary || null);
      }
    } catch (error) {
      console.error('Error loading activity updates:', error);
    }
  };

  const loadConductDetails = async (studentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/parent-activity/student/${studentId}/conduct-details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConductDetails(data);
        setShowConductDialog(true);
      }
    } catch (error) {
      console.error('Error loading conduct details:', error);
    }
  };

  const handleLinkStudent = async () => {
    try {
      setLinking(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE}/parent-links/link-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_first_name: linkForm.student_first_name,
          student_last_name: linkForm.student_last_name,
          gender: linkForm.gender,
          trade_code: linkForm.trade_code,
          level: linkForm.level,
          relationship: linkForm.relationship
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(language === 'rw' ? 'Ubusabe bwo guhuza bwoherejwe!' : 'Link request submitted successfully!');
        setShowLinkDialog(false);
        setLinkForm({
          trade_code: 'SOD',
          level: '4',
          student_first_name: '',
          student_last_name: '',
          gender: '',
          student_phone: '',
          relationship: 'parent'
        });
        fetchDashboardData();
      } else {
        toast.error(data.message || 'Failed to link student');
      }
    } catch (error) {
      console.error('Error linking student:', error);
      toast.error('Failed to link student');
    } finally {
      setLinking(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE}/parent-dashboard/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: selectedStudent?.id,
          subject: messageForm.subject,
          message: messageForm.message,
          priority: messageForm.priority
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(language === 'rw' ? 'Message yoherejwe!' : 'Message sent successfully!');
        setShowMessageDialog(false);
        setMessageForm({ recipient: 'all', subject: '', message: '', priority: 'normal' });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAutoFetch = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/parent-dashboard/student/auto-fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ parent_id: user.id, phone: user.phone })
      });

      const data = await res.json();

      if (data.success && data.student) {
        setStudents([data.student]);
        setSelectedStudent(data.student);
        toast.success(language === 'rw' ? 'Umwana wawe wasanze!' : 'Your student found!');
      } else {
        toast.error(language === 'rw' ? 'Nta mwana washintse' : 'No student found');
      }
    } catch (error) {
      console.error('Auto-fetch error:', error);
      toast.error('Failed to auto-fetch student');
    }
  };

  // Fetch fee structure for student
  const fetchFeeStructure = async (studentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/parent-dashboard/student/${studentId}/fees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        // Create fee structure from the data
        const terms = ['Term 1', 'Term 2', 'Term 3'];
        const totalFee = selectedStudent?.total_fees || 0;
        const termAmount = totalFee / 3;

        const structure = terms.map((term, idx) => ({
          term,
          amount: termAmount,
          due_date: new Date(2024, idx + 1, 15).toISOString().split('T')[0],
          status: idx === 0 ? 'due' : 'upcoming'
        }));
        setFeeStructure(structure);
      }
    } catch (error) {
      console.error('Fee structure error:', error);
    }
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!selectedStudent) return;

    try {
      setProcessingPayment(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          amount: parseFloat(paymentForm.amount),
          payment_type: paymentForm.payment_type,
          payment_method: paymentForm.payment_method,
          mobile_number: paymentForm.phone,
          term: paymentForm.term,
          description: paymentForm.notes || `${paymentForm.payment_type} payment for ${selectedStudent.first_name} ${selectedStudent.last_name}`
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(language === 'rw' ?
          'Ibyishuri byoherejwe! Tegereza ikiganiro kuri telephone yawe.' :
          'Payment initiated! Check your phone for confirmation.');
        setShowPaymentDialog(false);
        setPaymentForm({
          amount: '',
          payment_method: 'mobile_money',
          phone: '',
          reference_number: '',
          payment_type: 'tuition',
          term: 'Term 1',
          notes: ''
        });
        // Refresh fee data
        loadStudentDetails(selectedStudent.id);
      } else {
        toast.error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(language === 'rw' ? 'Ibyishuri byanze' : 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Calculate stats
  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    const totalPoints = grades.reduce((acc, g) => acc + (g.grade_points || 0), 0);
    return (totalPoints / grades.length).toFixed(2);
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-500', 'A': 'bg-green-400', 'A-': 'bg-green-300',
      'B+': 'bg-blue-400', 'B': 'bg-blue-300', 'B-': 'bg-blue-200',
      'C+': 'bg-yellow-400', 'C': 'bg-yellow-300', 'C-': 'bg-yellow-200',
      'D': 'bg-orange-400', 'F': 'bg-red-500'
    };
    return colors[grade] || 'bg-gray-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'late': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const unreadMessages = dodMessages.filter(m => !m.is_read).length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  const menuItems = [
    { id: 'overview', label: 'Overview', labelRw: 'Ibirimo', icon: LayoutGrid },
    { id: 'students', label: 'My Children', labelRw: 'Abana Banji', icon: Users },
    { id: 'performance', label: 'Performance', labelRw: 'Imikorere', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance', labelRw: 'Imbitso', icon: Calendar },
    { id: 'exams', label: 'Exams', labelRw: 'Ibizamini', icon: FileText },
    { id: 'timetable', label: 'Timetable', labelRw: 'Igihe', icon: Clock3 },
    { id: 'fees', label: 'Fees', labelRw: 'Amafaranga', icon: DollarSign },
    { id: 'messages', label: 'Messages', labelRw: 'Message', icon: MessageSquare },
    { id: 'teachers', label: 'Teachers', labelRw: 'Abarimu', icon: BookOpen },
    { id: 'trade', label: 'Trade Info', labelRw: 'Umwuga', icon: Book },
    { id: 'link', label: 'Link Student', labelRw: 'Fatanisha', icon: UserPlus },
    { id: 'settings', label: 'Settings', labelRw: 'Igenamiterwe', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-yellow-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-yellow-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-xl font-semibold mt-6">Loading Parent Portal...</p>
          <p className="text-yellow-300 text-sm mt-2">Preparing your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 via-yellow-700 to-green-800 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Garden TVET
                </h1>
                <p className="text-xs text-green-200">Parent Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'rw' : 'en')}
                className="text-white hover:bg-white/10"
              >
                {language === 'en' ? '🇷🇼 Kinyarwanda' : '🇬🇧 English'}
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-3 border-b">
                    <h3 className="font-bold">Notifications</h3>
                  </div>
                  <ScrollArea className="h-64">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <DropdownMenuItem key={notif.id} className="flex items-start gap-3 p-3">
                          <div className={`w-2 h-2 mt-2 rounded-full ${notif.type === 'error' ? 'bg-red-500' :
                            notif.type === 'warning' ? 'bg-yellow-500' :
                              notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                          <div>
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-xs text-gray-500">{notif.message}</p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">{user.first_name?.[0] || 'P'}</span>
                    </div>
                    <span className="hidden md:inline">{user.first_name || user.phone || 'Parent'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLinkDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" /> Link Student
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Student Selector Card */}
        {students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-purple-200 shadow-xl bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Selected Child</p>
                      <p className="font-bold text-lg">{selectedStudent?.first_name} {selectedStudent?.last_name}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <Select
                      value={selectedStudent?.id?.toString() || ''}
                      onValueChange={(val) => {
                        const student = students.find(s => s.id.toString() === val);
                        if (student) setSelectedStudent(student);
                      }}
                    >
                      <SelectTrigger className="w-full md:w-80">
                        <SelectValue placeholder="Switch child" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {student.first_name[0]}{student.last_name[0]}
                              </div>
                              <div>
                                <span className="font-bold">{student.first_name} {student.last_name}</span>
                                <span className="text-gray-500 text-sm ml-2">- {student.trade_name} L{student.level_number}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAutoFetch}
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Auto-Find
                    </Button>
                    <Button
                      onClick={() => setShowLinkDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Link More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Student Activity Updates */}
        {selectedStudent && activityUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-blue-200 shadow-xl bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {selectedStudent.first_name} {selectedStudent.last_name} Activities
                  {activitySummary && (
                    <Badge className="ml-auto bg-white text-blue-600">
                      {activityUpdates.length} updates
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <button
                    onClick={() => setActiveTab('performance')}
                    className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      {activitySummary?.performance > 0 && (
                        <Badge className="bg-green-500 text-white text-xs">{activitySummary.performance}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2">Performance</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      {activitySummary?.attendance > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs">{activitySummary.attendance}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2">Attendance</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('exams')}
                    className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <FileText className="w-5 h-5 text-orange-600" />
                      {activitySummary?.exams > 0 && (
                        <Badge className="bg-orange-500 text-white text-xs">{activitySummary.exams}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2">Exams</p>
                  </button>

                  <button
                    onClick={() => selectedStudent && loadConductDetails(selectedStudent.id)}
                    className="p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      {activitySummary?.conduct > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">{activitySummary.conduct}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2">Conduct</p>
                    {activitySummary?.conduct_details && (
                      <p className="text-xs text-red-600 font-bold mt-1">
                        {activitySummary.conduct_details.current_score}/40
                      </p>
                    )}
                  </button>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {activityUpdates.map((update, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          if (update.type === 'conduct') {
                            selectedStudent && loadConductDetails(selectedStudent.id);
                          } else {
                            setSelectedActivity(update);
                            setShowActivityDetail(true);
                          }
                        }}
                        className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${
                          update.type === 'performance' ? 'bg-green-50 border-green-500' :
                          update.type === 'attendance' ? 'bg-blue-50 border-blue-500' :
                          update.type === 'exam' ? 'bg-orange-50 border-orange-500' :
                          'bg-red-50 border-red-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {update.type === 'performance' && <TrendingUp className="w-4 h-4 text-green-600" />}
                              {update.type === 'attendance' && <Calendar className="w-4 h-4 text-blue-600" />}
                              {update.type === 'exam' && <FileText className="w-4 h-4 text-orange-600" />}
                              {update.type === 'conduct' && <AlertCircle className="w-4 h-4 text-red-600" />}
                              <p className="font-bold text-sm capitalize">{update.type}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-800 mt-1">{update.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{update.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">{new Date(update.date).toLocaleDateString()}</p>
                            <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* No Students State */}
        {students.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="border-2 border-dashed border-purple-300 shadow-xl bg-white/80">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {language === 'rw' ? 'Nta mwana ufite' : 'No Children Linked'}
                </h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {language === 'rw'
                    ? 'Fatanisha umwana wawe kugira ngo ubone amakuru yawe mu ishuri'
                    : 'Link your child to view their academic information and progress'
                  }
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleAutoFetch}
                    variant="outline"
                    className="border-purple-300"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {language === 'rw' ? 'Fata Jye' : 'Auto-Find My Child'}
                  </Button>
                  <Button
                    onClick={() => setShowLinkDialog(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {language === 'rw' ? 'Fatanisha' : 'Link Child'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">GPA</p>
                    <p className="text-3xl font-black">{calculateGPA()}</p>
                  </div>
                  <Award className="w-10 h-10 text-green-200 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Attendance</p>
                    <p className="text-3xl font-black">{calculateAttendanceRate()}%</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-200 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Balance</p>
                    <p className="text-2xl font-black">{(selectedStudent.balance || 0).toLocaleString()}</p>
                    <p className="text-xs text-orange-200">RWF</p>
                  </div>
                  <Wallet className="w-10 h-10 text-orange-200 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Messages</p>
                    <p className="text-3xl font-black">{unreadMessages}</p>
                    <p className="text-xs text-purple-200">unread</p>
                  </div>
                  <MessageSquare className="w-10 h-10 text-purple-200 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white shadow-lg p-1 flex flex-wrap gap-1 h-auto">
            {menuItems.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {language === 'rw' ? item.labelRw : item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Recent Grades */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {language === 'rw' ? 'Imyigishirize' : 'Recent Grades'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {loadingData ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : grades.length > 0 ? (
                    <div className="space-y-3">
                      {grades.slice(0, 5).map((grade) => (
                        <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{grade.subject}</p>
                            <p className="text-xs text-gray-500">{grade.exam_date} - {grade.term}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-blue-600">{grade.score}/{grade.max_score}</p>
                            <Badge className={`${getGradeColor(grade.grade)} text-white text-xs`}>
                              {grade.grade}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>{language === 'rw' ? 'Nta myigishirize iriho' : 'No grades available'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Messages */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    {language === 'rw' ? 'Message' : 'Messages'}
                    {unreadMessages > 0 && (
                      <Badge className="bg-red-500 text-white ml-auto">{unreadMessages}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {dodMessages.length > 0 ? (
                    <div className="space-y-3">
                      {dodMessages.slice(0, 5).map((msg) => (
                        <div key={msg.id} className={`p-3 rounded-lg ${msg.is_read ? 'bg-gray-50' : 'bg-purple-50 border-l-4 border-purple-500'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-sm">{msg.sender_name}</p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{msg.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">{msg.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>{language === 'rw' ? 'Nta message zihari' : 'No messages'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {language === 'rw' ? 'Imbitso' : 'Attendance'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {loadingData ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    </div>
                  ) : attendance.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Present</span>
                        <span className="font-bold text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {attendance.filter(a => a.status === 'present').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Absent</span>
                        <span className="font-bold text-red-600 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          {attendance.filter(a => a.status === 'absent').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Late</span>
                        <span className="font-bold text-yellow-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {attendance.filter(a => a.status === 'late').length}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Rate</span>
                        <span className="font-black text-2xl text-green-600">{calculateAttendanceRate()}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>{language === 'rw' ? 'Nta mpaka ziriho' : 'No attendance records'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fees Summary */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {language === 'rw' ? 'Amafaranga' : 'Fees Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {selectedStudent ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Total</span>
                        <span className="font-bold text-gray-800">{(selectedStudent.total_fees || 0).toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700">Paid</span>
                        <span className="font-bold text-green-600">{(selectedStudent.paid_fees || 0).toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-orange-700">Balance</span>
                        <span className="font-bold text-orange-600">{(selectedStudent.balance || 0).toLocaleString()} RWF</span>
                      </div>
                      <Progress value={selectedStudent.total_fees ? ((selectedStudent.paid_fees || 0) / selectedStudent.total_fees) * 100 : 0} className="h-2" />
                      <p className="text-xs text-center text-gray-500">
                        {selectedStudent.total_fees ? Math.round(((selectedStudent.paid_fees || 0) / selectedStudent.total_fees) * 100) : 0}% Paid
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>{language === 'rw' ? 'Nta mwana utagaragaye' : 'No student selected'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Exams */}
              <Card className="shadow-lg lg:col-span-2">
                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {language === 'rw' ? 'Ibizamini Bizaza' : 'Upcoming Exams'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {exams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exams.slice(0, 4).map((exam) => (
                        <div key={exam.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-800">{exam.subject}</p>
                              <p className="text-xs text-gray-500">{exam.exam_type}</p>
                            </div>
                            <Badge variant="outline">{exam.term}</Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exam.exam_date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.start_time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>{language === 'rw' ? 'Nta bizamini bizaza' : 'No upcoming exams'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  {language === 'rw' ? 'Abana Banji' : 'My Children'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedStudent?.id === student.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                          }`}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{student.first_name} {student.last_name}</h3>
                            <Badge variant="outline">{student.student_code}</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Trade</span>
                            <span className="font-medium">{student.trade_name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Level</span>
                            <span className="font-medium">Level {student.level_number}{student.level_suffix || ''}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Gender</span>
                            <span className="font-medium capitalize">{student.gender}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">{language === 'rw' ? 'Nta mwana ufite' : 'No children linked'}</h3>
                    <Button onClick={() => setShowLinkDialog(true)} className="mt-4">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {language === 'rw' ? 'Fatanisha Umwana' : 'Link a Child'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  {language === 'rw' ? 'Imikorere y\'Umwana' : 'Academic Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : grades.length > 0 ? (
                  <div className="space-y-4">
                    {grades.map((grade) => (
                      <div key={grade.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg">{grade.subject}</h4>
                            <p className="text-sm text-gray-500">{grade.exam_type} - {grade.term} {grade.academic_year}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-purple-600">{grade.score}/{grade.max_score}</p>
                            <Badge className={`${getGradeColor(grade.grade)} text-white`}>Grade: {grade.grade}</Badge>
                          </div>
                        </div>
                        <Progress value={(grade.score / grade.max_score) * 100} className="h-2" />
                        {grade.teacher_name && (
                          <p className="text-xs text-gray-500 mt-2">Teacher: {grade.teacher_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>{language === 'rw' ? 'Nta myigishirize iriho' : 'No grades available'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  {language === 'rw' ? 'Imbitso' : 'Attendance Records'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  </div>
                ) : attendance.length > 0 ? (
                  <div className="space-y-2">
                    {attendance.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(record.status)}
                          <div>
                            <p className="font-medium">{record.date}</p>
                            {record.subject && <p className="text-sm text-gray-500">{record.subject}</p>}
                          </div>
                        </div>
                        <Badge className={`${record.status === 'present' ? 'bg-green-100 text-green-700' :
                          record.status === 'absent' ? 'bg-red-100 text-red-700' :
                            record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>{language === 'rw' ? 'Nta mpaka ziriho' : 'No attendance records'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  {language === 'rw' ? 'Ibizamini' : 'Exam Schedule'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exams.length > 0 ? (
                  <div className="space-y-3">
                    {exams.map((exam) => (
                      <div key={exam.id} className="p-4 border-2 border-red-100 rounded-xl bg-red-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{exam.subject}</h4>
                            <p className="text-sm text-gray-600">{exam.exam_type} - {exam.term}</p>
                          </div>
                          <Badge variant="destructive">{exam.academic_year}</Badge>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-500" />
                            <span>{exam.exam_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-500" />
                            <span>{exam.start_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span>{exam.venue}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>{language === 'rw' ? 'Nta bizamini bizaza' : 'No upcoming exams'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timetable Tab */}
          <TabsContent value="timetable" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="w-5 h-5 text-blue-600" />
                  {language === 'rw' ? 'Igihe cy\'Ishuri' : 'Weekly Timetable'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timetable.length > 0 ? (
                  <div className="space-y-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                      const dayClasses = timetable.filter(t => t.day === day);
                      if (dayClasses.length === 0) return null;
                      return (
                        <div key={day} className="border rounded-lg overflow-hidden">
                          <div className="bg-blue-500 text-white px-4 py-2 font-bold">{day}</div>
                          <div className="divide-y">
                            {dayClasses.map((entry) => (
                              <div key={entry.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                  <p className="font-medium">{entry.subject}</p>
                                  <p className="text-sm text-gray-500">{entry.teacher_name} - {entry.room}</p>
                                </div>
                                <Badge variant="outline">{entry.start_time} - {entry.end_time}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Clock3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>{language === 'rw' ? 'Nta gihe cyoherejwe' : 'No timetable available'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  {language === 'rw' ? 'Amafaranga y\'Ishuri' : 'Fee Payments'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    {/* Fee Summary Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <p className="text-sm text-blue-600">Total Fees</p>
                        <p className="text-2xl font-black text-blue-700">{(selectedStudent.total_fees || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl text-center">
                        <p className="text-sm text-green-600">Paid</p>
                        <p className="text-2xl font-black text-green-700">{(selectedStudent.paid_fees || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-xl text-center">
                        <p className="text-sm text-orange-600">Balance</p>
                        <p className="text-2xl font-black text-orange-700">{(selectedStudent.balance || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <Progress value={selectedStudent.total_fees ? ((selectedStudent.paid_fees || 0) / selectedStudent.total_fees) * 100 : 0} className="h-3" />

                    {/* Payment History */}
                    <h4 className="font-bold text-lg">{language === 'rw' ? 'Ibyishyuriwe' : 'Payment History'}</h4>
                    {feePayments.length > 0 ? (
                      <div className="space-y-2">
                        {feePayments.map((payment) => (
                          <div key={payment.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{payment.description}</p>
                                <p className="text-sm text-gray-500">{payment.payment_date} - {payment.receipt_number}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">{payment.amount.toLocaleString()} RWF</p>
                                <Badge className={`${payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                  {payment.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>{language === 'rw' ? 'Nta byishyuriwe biriho' : 'No payment history'}</p>
                      </div>
                    )}

                    <Button
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500"
                      onClick={() => {
                        if (selectedStudent) {
                          fetchFeeStructure(selectedStudent.id);
                          setPaymentForm({
                            ...paymentForm,
                            amount: selectedStudent.balance ? selectedStudent.balance.toString() : ''
                          });
                        }
                        setShowPaymentDialog(true);
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {language === 'rw' ? 'Fata Amafaranga' : 'Pay Fees'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>{language === 'rw' ? 'Nta mwana utagaragaye' : 'No student selected'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  {language === 'rw' ? 'Ubutumwa' : 'Messages'}
                  {unreadMessages > 0 && (
                    <Badge className="bg-red-500 text-white ml-2">{unreadMessages} new</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setShowMessageDialog(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    {language === 'rw' ? 'Tuma Message' : 'Send Message'}
                  </Button>
                </div>
                {dodMessages.length > 0 ? (
                  <div className="space-y-3">
                    {dodMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 border rounded-lg ${msg.is_read ? 'bg-gray-50' : 'bg-purple-50 border-l-4 border-purple-500'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                              <span className="text-xs font-bold text-purple-700">{msg.sender_name[0]}</span>
                            </div>
                            <div>
                              <p className="font-bold">{msg.sender_name}</p>
                              <p className="text-xs text-gray-500">{msg.sender_role}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">{msg.type}</Badge>
                        </div>
                        <p className="mt-3 text-gray-700">{msg.message}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</p>
                          {!msg.is_read && (
                            <Badge className="bg-purple-100 text-purple-700">New</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>{language === 'rw' ? 'Nta butumwa bwahari' : 'No messages'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trade Info Tab */}
          <TabsContent value="trade" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-green-600" />
                  {language === 'rw' ? 'Umwuga wa Mwana' : 'Trade Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className={`px-8 py-4 rounded-2xl text-white text-center ${selectedStudent.trade_code === 'SOD' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : selectedStudent.trade_code === 'BDC' ? 'bg-gradient-to-r from-orange-500 to-red-600' : selectedStudent.trade_code === 'AUT' ? 'bg-gradient-to-r from-green-500 to-teal-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                        <p className="text-3xl font-black">{selectedStudent.trade_code}</p>
                        <p className="text-sm font-semibold">{selectedStudent.trade_name}</p>
                        <p className="text-xs mt-1">Level {selectedStudent.level_number}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-bold text-lg mb-2">{selectedStudent.trade_name}</h4>
                      <p className="text-gray-600 text-sm">
                        {selectedStudent.trade_code === 'SOD' ? 'Learn software development, programming, web technologies, mobile apps, database management.' :
                          selectedStudent.trade_code === 'BDC' ? 'Master building construction, carpentry, masonry, plumbing, electrical installation.' :
                            selectedStudent.trade_code === 'AUT' ? 'Study automotive mechanics, engine repair, electrical systems, vehicle diagnostics.' :
                              'Technical vocational education program.'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <p className="text-sm text-blue-600">Level</p>
                        <p className="text-2xl font-black text-blue-700">{selectedStudent.level_number}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl text-center">
                        <p className="text-sm text-green-600">Duration</p>
                        <p className="text-2xl font-black text-green-700">3 Years</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Book className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No student selected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {language === 'rw' ? 'Abarimu' : 'Teachers'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teachers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teachers.map((teacher) => (
                      <div key={teacher.id} className="p-4 border rounded-lg flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {teacher.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{teacher.name}</p>
                          {teacher.subject && <p className="text-sm text-gray-500">{teacher.subject}</p>}
                          <div className="flex gap-2 mt-2">
                            {teacher.phone && (
                              <a href={`tel:${teacher.phone}`} className="text-blue-500 hover:underline text-sm flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {teacher.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>{language === 'rw' ? 'Nta barimu babashije' : 'No teachers found'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Link Student Tab */}
          <TabsContent value="link" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                  {language === 'rw' ? 'Fatanisha Umwana' : 'Link a Child'}
                </CardTitle>
                <CardDescription>
                  {language === 'rw'
                    ? 'Shyiramo amakuru y\'umwana wishushanira kugira ngo ubohereze ubusabe'
                    : 'Enter your child\'s information to submit a link request'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'rw' ? 'Izina rya mbere' : 'First Name'}</Label>
                    <Input
                      placeholder={language === 'rw' ? 'Izina rya mbere' : 'First Name'}
                      value={linkForm.student_first_name}
                      onChange={(e) => setLinkForm({ ...linkForm, student_first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{language === 'rw' ? 'Izina ry nyuma' : 'Last Name'}</Label>
                    <Input
                      placeholder={language === 'rw' ? 'Izina ry nyuma' : 'Last Name'}
                      value={linkForm.student_last_name}
                      onChange={(e) => setLinkForm({ ...linkForm, student_last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'rw' ? 'Imihango (Trade)' : 'Trade'}</Label>
                    <Select value={linkForm.trade_code} onValueChange={(val) => setLinkForm({ ...linkForm, trade_code: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOD">SOD - Software Development</SelectItem>
                        <SelectItem value="BDC">BDC - Building & Construction</SelectItem>
                        <SelectItem value="AUT">AUT - Automotive Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'rw' ? 'Icyiciro (Level)' : 'Level'}</Label>
                    <Select value={linkForm.level} onValueChange={(val) => setLinkForm({ ...linkForm, level: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Level 3</SelectItem>
                        <SelectItem value="4">Level 4</SelectItem>
                        <SelectItem value="5">Level 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'rw' ? 'Igitsina (Gender)' : 'Gender'}</Label>
                    <Select value={linkForm.gender} onValueChange={(val) => setLinkForm({ ...linkForm, gender: val })}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{language === 'rw' ? 'Gabo (Male)' : 'Male'}</SelectItem>
                        <SelectItem value="Female">{language === 'rw' ? 'Gore (Female)' : 'Female'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'rw' ? 'Nomero ya telephone (igaragaye)' : 'Phone (if available)'}</Label>
                    <Input
                      placeholder="0788xxxxxx"
                      value={linkForm.student_phone}
                      onChange={(e) => setLinkForm({ ...linkForm, student_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>{language === 'rw' ? 'Isano (Relationship)' : 'Relationship'}</Label>
                  <Select value={linkForm.relationship} onValueChange={(val) => setLinkForm({ ...linkForm, relationship: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">{language === 'rw' ? 'Umubyeyi (Parent)' : 'Parent'}</SelectItem>
                      <SelectItem value="father">{language === 'rw' ? 'Data (Father)' : 'Father'}</SelectItem>
                      <SelectItem value="mother">{language === 'rw' ? 'Mama (Mother)' : 'Mother'}</SelectItem>
                      <SelectItem value="guardian">{language === 'rw' ? 'Umurinzi (Guardian)' : 'Guardian'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                  onClick={handleLinkStudent}
                  disabled={linking || !linkForm.student_first_name || !linkForm.student_last_name || !linkForm.gender}
                >
                  {linking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'rw' ? 'Birikora...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {language === 'rw' ? 'Ohereza Ubusabe' : 'Submit Request'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  {language === 'rw' ? 'Igenamiterwe' : 'Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Language / Ikirango</p>
                    <p className="text-sm text-gray-500">Choose your preferred language</p>
                  </div>
                  <Select value={language} onValueChange={(val) => setLanguage(val as 'en' | 'rw')}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="rw">🇷🇼 Kinyarwanda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-gray-500">Receive push notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Alerts</p>
                    <p className="text-sm text-gray-500">Receive SMS for important updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  {language === 'rw' ? 'Sohoka' : 'Logout'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Link Student Dialog - Simple form without student code */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{language === 'rw' ? 'Fatanisha Umwana' : 'Link Your Child'}</DialogTitle>
            <DialogDescription>
              {language === 'rw'
                ? 'Shyiramo amakuru y\'umwana wishushanira. Ntabwo ugira ikibazo n\'umukode.'
                : 'Enter your child\'s information. No student code needed!'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'rw' ? 'Izina rya mbere' : 'First Name'}</Label>
                <Input
                  placeholder="John"
                  value={linkForm.student_first_name}
                  onChange={(e) => setLinkForm({ ...linkForm, student_first_name: e.target.value })}
                />
              </div>
              <div>
                <Label>{language === 'rw' ? 'Izina ry nyuma' : 'Last Name'}</Label>
                <Input
                  placeholder="Doe"
                  value={linkForm.student_last_name}
                  onChange={(e) => setLinkForm({ ...linkForm, student_last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'rw' ? 'Imihango' : 'Trade'}</Label>
                <Select value={linkForm.trade_code} onValueChange={(val) => setLinkForm({ ...linkForm, trade_code: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOD">SOD</SelectItem>
                    <SelectItem value="BDC">BDC</SelectItem>
                    <SelectItem value="AUT">AUT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'rw' ? 'Icyiciro' : 'Level'}</Label>
                <Select value={linkForm.level} onValueChange={(val) => setLinkForm({ ...linkForm, level: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'rw' ? 'Igitsina' : 'Gender'}</Label>
                <Select value={linkForm.gender} onValueChange={(val) => setLinkForm({ ...linkForm, gender: val })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'rw' ? 'Isano' : 'Relationship'}</Label>
                <Select value={linkForm.relationship} onValueChange={(val) => setLinkForm({ ...linkForm, relationship: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              {language === 'rw' ? 'Reka' : 'Cancel'}
            </Button>
            <Button
              onClick={handleLinkStudent}
              disabled={linking || !linkForm.student_first_name || !linkForm.student_last_name || !linkForm.gender}
            >
              {linking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {language === 'rw' ? 'Ohereza' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{language === 'rw' ? 'Tuma Message' : 'Send Message'}</DialogTitle>
            <DialogDescription>
              {language === 'rw'
                ? 'Ohereza ubutumwa kuri ishuri'
                : 'Send a message to the school'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Enter subject"
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <textarea
                className="w-full p-3 border rounded-lg min-h-[120px]"
                placeholder="Type your message here..."
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={messageForm.priority} onValueChange={(val) => setMessageForm({ ...messageForm, priority: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              {language === 'rw' ? 'Reka' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageForm.subject || !messageForm.message}
            >
              {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {language === 'rw' ? 'Ohereza' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              {language === 'rw' ? 'Ibyishuri' : 'Make Payment'}
            </DialogTitle>
            <DialogDescription>
              {language === 'rw' ? `Fata amafaranga ya ${selectedStudent?.first_name} ${selectedStudent?.last_name}` : `Pay fees for ${selectedStudent?.first_name} ${selectedStudent?.last_name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-xl mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">{language === 'rw' ? 'Ibishyuriwe' : 'Balance Due'}</p>
              <p className="text-3xl font-black text-green-700">{(selectedStudent?.balance || 0).toLocaleString()} RWF</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>{language === 'rw' ? 'Icyiciro yishyuriwe' : 'Payment Type'}</Label>
              <Select value={paymentForm.payment_type} onValueChange={(val) => setPaymentForm({ ...paymentForm, payment_type: val })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tuition">{language === 'rw' ? 'Ishuri' : 'Tuition'}</SelectItem>
                  <SelectItem value="registration">{language === 'rw' ? 'Ibyandikwa' : 'Registration'}</SelectItem>
                  <SelectItem value="exam">{language === 'rw' ? 'Ibigenge' : 'Exams'}</SelectItem>
                  <SelectItem value="material">{language === 'rw' ? 'Ibirango' : 'Materials'}</SelectItem>
                  <SelectItem value="transport">{language === 'rw' ? 'Igend滚' : 'Transport'}</SelectItem>
                  <SelectItem value="other">{language === 'rw' ? 'Ibindi' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{language === 'rw' ? 'Igihe' : 'Term'}</Label>
              <Select value={paymentForm.term} onValueChange={(val) => setPaymentForm({ ...paymentForm, term: val })}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">{language === 'rw' ? 'Igihe cya 1' : 'Term 1'}</SelectItem>
                  <SelectItem value="Term 2">{language === 'rw' ? 'Igihe cya 2' : 'Term 2'}</SelectItem>
                  <SelectItem value="Term 3">{language === 'rw' ? 'Igihe cya 3' : 'Term 3'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{language === 'rw' ? 'Iburyo bishyuriwe' : 'Amount (RWF)'}</Label>
              <Input type="number" placeholder="Enter amount" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
            </div>

            <div>
              <Label>{language === 'rw' ? 'Uburyo bwishyura' : 'Payment Method'}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button type="button" className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${paymentForm.payment_method === 'mobile_money' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentForm({ ...paymentForm, payment_method: 'mobile_money' })}>
                  <Smartphone className="w-6 h-6 text-green-600" />
                  <span className="text-xs font-medium">Mobile Money</span>
                </button>
                <button type="button" className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${paymentForm.payment_method === 'bank_transfer' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentForm({ ...paymentForm, payment_method: 'bank_transfer' })}>
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <span className="text-xs font-medium">Bank Transfer</span>
                </button>
                <button type="button" className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${paymentForm.payment_method === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentForm({ ...paymentForm, payment_method: 'cash' })}>
                  <PiggyBank className="w-6 h-6 text-orange-600" />
                  <span className="text-xs font-medium">Cash</span>
                </button>
                <button type="button" className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${paymentForm.payment_method === 'airtel_money' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentForm({ ...paymentForm, payment_method: 'airtel_money' })}>
                  <Smartphone className="w-6 h-6 text-red-600" />
                  <span className="text-xs font-medium">Airtel Money</span>
                </button>
              </div>
            </div>

            {(paymentForm.payment_method === 'mobile_money' || paymentForm.payment_method === 'airtel_money') && (
              <div>
                <Label>{language === 'rw' ? 'Nomero ya telephone' : 'Phone Number'}</Label>
                <Input type="tel" placeholder="e.g., 078xxxxxx" value={paymentForm.phone} onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">{language === 'rw' ? 'Nomero yishyuraphone ya Mobile Money/Airtel Money' : 'Enter the Mobile Money/Airtel Money phone number'}</p>
              </div>
            )}

            {paymentForm.payment_method === 'bank_transfer' && (
              <div>
                <Label>{language === 'rw' ? 'Nomero yibwirucu' : 'Transaction Reference'}</Label>
                <Input placeholder="Enter bank transaction reference" value={paymentForm.reference_number} onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })} />
              </div>
            )}

            <div>
              <Label>{language === 'rw' ? 'Ibyavuzwe' : 'Notes (Optional)'}</Label>
              <textarea className="w-full p-3 border rounded-lg min-h-[60px]" placeholder="Any additional notes..." value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button className="w-full bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600" onClick={handlePayment} disabled={processingPayment || !paymentForm.amount || (paymentForm.payment_method.includes('mobile') && !paymentForm.phone)}>
              {processingPayment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
              {language === 'rw' ? 'Fata Amafaranga' : 'Pay Now'}
            </Button>
            <p className="text-xs text-center text-gray-500">{language === 'rw' ? 'Uburyo bwishyura: Mobile Money, Airtel Money, Bank Transfer, Cash' : 'Payment methods: Mobile Money, Airtel Money, Bank Transfer, Cash'}</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conduct Details Dialog */}
      <Dialog open={showConductDialog} onOpenChange={setShowConductDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Conduct History - {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogTitle>
            <DialogDescription>
              Complete conduct record and discipline history
            </DialogDescription>
          </DialogHeader>

          {conductDetails && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-xl text-center">
                  <p className="text-sm text-red-600">Current Score</p>
                  <p className="text-3xl font-black text-red-700">{conductDetails.current_score}/40</p>
                  <Badge className={`mt-2 ${
                    conductDetails.current_score >= 36 ? 'bg-green-500' :
                    conductDetails.current_score >= 32 ? 'bg-blue-500' :
                    conductDetails.current_score >= 28 ? 'bg-yellow-500' :
                    conductDetails.current_score >= 24 ? 'bg-orange-500' : 'bg-red-500'
                  }`}>
                    {conductDetails.current_score >= 36 ? 'A' :
                     conductDetails.current_score >= 32 ? 'B' :
                     conductDetails.current_score >= 28 ? 'C' :
                     conductDetails.current_score >= 24 ? 'D' : 'F'}
                  </Badge>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl text-center">
                  <p className="text-sm text-orange-600">Total Incidents</p>
                  <p className="text-3xl font-black text-orange-700">{conductDetails.total_incidents}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl text-center">
                  <p className="text-sm text-yellow-600">Points Lost</p>
                  <p className="text-3xl font-black text-yellow-700">{conductDetails.total_points_lost}</p>
                </div>
              </div>

              {/* Records List */}
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {conductDetails.records.length > 0 ? (
                    conductDetails.records.map((record) => (
                      <div key={record.id} className="p-4 border-2 border-red-100 rounded-lg bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-gray-800">{record.incident_type}</p>
                            <Badge className={`mt-1 ${
                              record.severity === 'minor' ? 'bg-yellow-500' :
                              record.severity === 'moderate' ? 'bg-orange-500' :
                              record.severity === 'major' ? 'bg-red-500' : 'bg-red-700'
                            }`}>
                              {record.severity}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">-{record.conduct_points_deducted} points</p>
                            <p className="text-xs text-gray-500">{new Date(record.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                        {record.action_taken && (
                          <p className="text-xs text-gray-600"><strong>Action:</strong> {record.action_taken}</p>
                        )}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-red-200">
                          <p className="text-xs text-gray-500">By: {record.removed_by_name}</p>
                          <p className="text-xs font-medium">New Score: {record.new_conduct_score}/40</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-30" />
                      <p className="font-medium">No conduct incidents</p>
                      <p className="text-sm">Excellent behavior record!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowConductDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentDashboard;

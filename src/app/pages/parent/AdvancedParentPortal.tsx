import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  BarChart,
  CheckCircle,
  DollarSign,
  FileText,
  MessageSquare,
  Heart,
  AlertTriangle,
  BookOpen,
  Trophy,
  Bell,
  Loader2,
  CreditCard,
  Send,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  Activity,
  Clock,
  BookMarked,
  Users,
  FileCheck,
  School,
  Home,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  Menu,
  X,
  Star,
  Target,
  Zap,
  Shield,
  Wallet,
  Video,
  Calculator,
  MapPin,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { OfflineBanner } from '@/components/OfflineBanner';
import { offlineFetch, syncPendingRequests } from '@/utils/offlineApi';
import { initDB } from '@/utils/offlineStorage';

// Language context
const useLanguage = () => {
  const [language, setLanguage] = useState<'en' | 'rw'>('en');
  return { language, setLanguage };
};

interface LinkedStudent {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_name: string;
  trade_code: string;
  level_number: number;
  gender: string;
  gpa?: number;
  attendance_percentage?: number;
  balance?: number;
  total_fees?: number;
  paid_fees?: number;
  photo_url?: string;
}

interface Grade {
  id: number;
  subject: string;
  subject_rw: string;
  score: number;
  max_score: number;
  grade: string;
  exam_type: string;
  exam_date: string;
  term: string;
  teacher_name: string;
  comments?: string;
}

interface Attendance {
  id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  period?: string;
  notes?: string;
}

interface DisciplineRecord {
  id: number;
  incident_type: string;
  incident_type_rw: string;
  description: string;
  description_rw: string;
  action_taken: string;
  action_taken_rw: string;
  date: string;
  status: string;
  points?: number;
}

interface DODMessage {
  id: number;
  message: string;
  message_rw: string;
  type: 'leave' | 'conduct' | 'sick' | 'general' | 'achievement' | 'warning';
  created_at: string;
  is_read: boolean;
  sender_name: string;
}

interface FeePayment {
  id: number;
  amount: number;
  description: string;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  status: string;
}

interface TimetableEntry {
  id: number;
  day: string;
  period: number;
  subject: string;
  subject_rw: string;
  room: string;
  teacher_name: string;
  start_time: string;
  end_time: string;
}

interface Teacher {
  id: number;
  name: string;
  subject: string;
  subject_rw: string;
  phone: string;
  email: string;
  photo_url?: string;
}

interface ExamSchedule {
  id: number;
  subject: string;
  subject_rw: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room: string;
  exam_type: string;
}

const API_BASE = 'http://localhost:5000/api';

export default function AdvancedParentPortal() {
  const { language, setLanguage } = useLanguage();
  const { isOnline, showOfflineBanner } = useOfflineStatus();
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [disciplineRecords, setDisciplineRecords] = useState<DisciplineRecord[]>([]);
  const [dodMessages, setDodMessages] = useState<DODMessage[]>([]);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showLinkRequestModal, setShowLinkRequestModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    description: 'School Fees Payment',
    payment_method: 'momo'
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    initDB();
    if (isOnline) syncPendingRequests();
  }, [isOnline]);

  // Translations
  const t = {
    en: {
      welcome: 'Welcome to Parent Portal',
      myChildren: 'My Children',
      overview: 'Overview',
      grades: 'Grades',
      attendance: 'Attendance',
      discipline: 'Discipline',
      fees: 'Fees',
      timetable: 'Timetable',
      teachers: 'Teachers',
      exams: 'Exams',
      messages: 'Messages',
      profile: 'Profile',
      logout: 'Logout',
      payFees: 'Pay Fees',
      sendMessage: 'Send Message',
      requestLink: 'Link New Student',
      noStudents: 'No linked students found',
      loading: 'Loading...',
      gpa: 'GPA',
      attendanceRate: 'Attendance',
      balance: 'Balance',
      totalFees: 'Total Fees',
      paidFees: 'Paid',
      recentGrades: 'Recent Grades',
      recentAttendance: 'Recent Attendance',
      recentDiscipline: 'Recent Discipline',
      recentMessages: 'Recent Messages',
      noGrades: 'No grades available',
      noAttendance: 'No attendance records',
      noDiscipline: 'No discipline records',
      noMessages: 'No messages',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused',
      enterAmount: 'Enter amount',
      enterPhone: 'Enter phone number',
      enterStudentCode: 'Enter student code',
      processPayment: 'Process Payment',
      cancel: 'Cancel',
      success: 'Success',
      error: 'Error',
      paymentSuccess: 'Payment initiated successfully!',
      paymentError: 'Payment failed',
      messageSent: 'Message sent successfully!',
      linkRequested: 'Link request submitted!',
      selectChild: 'Select a child to view details',
      term: 'Term',
      examSchedule: 'Exam Schedule',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      level: 'Level',
      trade: 'Trade',
      autoFetch: 'Auto-fetch My Student',
      searchStudent: 'Search Student by Code'
    },
    rw: {
      welcome: 'Murakaza neza kuri Portal y\'Ababyeyi',
      myChildren: 'Abana Bashyinguguwe',
      overview: 'Ibirimo',
      grades: 'Imyigishirize',
      attendance: 'Imbitso',
      discipline: 'Improto',
      fees: 'Amafaranga y\'ishuri',
      timetable: 'Igihe cy\'ishuri',
      teachers: 'Abarimu',
      exams: 'Ibizamini',
      messages: 'Message',
      profile: 'Profili',
      logout: 'Sohoka',
      payFees: 'Fata Amafaranga',
      sendMessage: 'Tuma Message',
      requestLink: 'Fatanisha Umwana',
      noStudents: 'Nta mwana ufite',
      loading: 'Gutegura...',
      gpa: 'GPA',
      attendanceRate: 'Imbitso',
      balance: 'Ibyaba',
      totalFees: 'Amafaranga yose',
      paidFees: 'Ayishyuye',
      recentGrades: 'Ibyagaragaye mu myigishirize',
      recentAttendance: 'Imbitso yakiriwe',
      recentDiscipline: 'Improto zakorewe',
      recentMessages: 'Message zishya',
      noGrades: 'Nta myigishirize iriho',
      noAttendance: 'Nta mpaka ziriho',
      noDiscipline: 'Nta proto iriho',
      noMessages: 'Nta message',
      present: 'Waraje',
      absent: 'Ntabaye',
      late: 'Waraje nyuma',
      excused: 'Yaremwe',
      enterAmount: 'Andika amafranga',
      enterPhone: 'Andika nimero ya telephone',
      enterStudentCode: 'Andika kode y\'umwana',
      processPayment: 'Fata Amafaranga',
      cancel: 'Reka',
      success: 'Byagenze',
      error: 'Ibyo bishije',
      paymentSuccess: 'Ibyifuzo byatangiye!',
      paymentError: 'Ibyifuzo byanze',
      messageMessage: 'Message yatangiwe!',
      linkRequested: 'Ibyifuzo byatangiwe!',
      selectChild: 'Hitamo umwana wosoma ibitekerezo',
      term: 'Igice',
      examSchedule: 'Igihe by\'ibizamini',
      monday: 'Kuwa mbere',
      tuesday: 'Kuwa kabiri',
      wednesday: 'Kuwa gatatu',
      thursday: 'Kuwa kane',
      friday: 'Kuwa gatanu',
      saturday: 'Kuwa gatandatu',
      sunday: 'Ku cyumweru',
      level: 'Icyiciro',
      trade: 'Imihango',
      autoFetch: 'Fata Umwana Jye',
      searchStudent: 'Shaka Umwana ukoresheje Kode'
    }
  };

  const isRTL = language === 'rw';

  // Status labels for attendance
  const getStatusLabel = (status: string) => {
    const labels = {
      en: { present: 'Present', absent: 'Absent', late: 'Late', excused: 'Excused' },
      rw: { present: 'Waraje', absent: 'Ntabaye', late: 'Waraje nyuma', excused: 'Yaremwe' }
    };
    return labels[language]?.[status as keyof typeof labels.en] || status;
  };

  // Day labels for timetable
  const getDayLabel = (day: string) => {
    const labels = {
      en: { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' },
      rw: { monday: 'Kuwa mbere', tuesday: 'Kuwa kabiri', wednesday: 'Kuwa gatatu', thursday: 'Kuwa kane', friday: 'Kuwa gatanu', saturday: 'Kuwa gatandatu', sunday: 'Ku cyumweru' }
    };
    return labels[language]?.[day.toLowerCase() as keyof typeof labels.en] || day;
  };

  useEffect(() => {
    loadParentData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentDetails(selectedStudent.id);
    }
  }, [selectedStudent]);

  const loadParentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // First try to get linked children
      let response = await fetch(`${API_BASE}/parent-dashboard/children`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let result = await response.json();
      
      // If no linked children, try to get student directly
      if (!result.success || !result.children || result.children.length === 0) {
        // Try alternative endpoints
        response = await fetch(`${API_BASE}/parent-linking/parent/${user.id}/students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        result = await response.json();
        
        if (!result.success || !result.students) {
          // Try the enhanced parent dashboard endpoint
          response = await fetch(`${API_BASE}/parent-dashboard-enhanced/children`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          result = await response.json();
        }
      }

      const children = result.children || result.students || [];
      
      if (children.length > 0) {
        setLinkedStudents(children);
        setSelectedStudent(children[0]);
      }

      if (user.phone) {
        setPhoneNumber(user.phone);
      }

      loadDODMessages();
    } catch (error) {
      console.error('Error loading parent data:', error);
      // Try to fetch unlinked students from Level 4 SOD as fallback
      tryAutoFetchStudent();
    } finally {
      setLoading(false);
    }
  };

  const tryAutoFetchStudent = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Try to auto-fetch student from Level 4 SOD
      const response = await fetch(`${API_BASE}/parent-dashboard/student/auto-fetch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ parent_id: user.id, phone: user.phone })
      });
      
      const data = await response.json();
      if (data.success && data.student) {
        setLinkedStudents([data.student]);
        setSelectedStudent(data.student);
        toast.success(language === 'rw' ? 'Umwana wawe wasanze!' : 'Your student found!');
      }
    } catch (error) {
      console.error('Auto-fetch error:', error);
    }
  };

  const loadStudentDetails = async (studentId: number) => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');

      // Load all student data in parallel
      const [gradesRes, attendanceRes, disciplineRes, feesRes, timetableRes, teachersRes, examsRes] = await Promise.all([
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/grades`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/attendance`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/discipline`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/fees`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/timetable`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/teachers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/parent-dashboard/student/${studentId}/exams`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const gradesData = await gradesRes.json();
      const attendanceData = await attendanceRes.json();
      const disciplineData = await disciplineRes.json();
      const feesData = await feesRes.json();
      const timetableData = await timetableRes.json();
      const teachersData = await teachersRes.json();
      const examsData = await examsRes.json();

      if (gradesData.success) setGrades(gradesData.grades || gradesData.data || []);
      if (attendanceData.success) setAttendance(attendanceData.records || attendanceData.data || []);
      if (disciplineData.success) setDisciplineRecords(disciplineData.records || disciplineData.data || []);
      if (feesData.success) setFeePayments(feesData.payments || feesData.fees || feesData.data || []);
      if (timetableData.success) setTimetable(timetableData.schedule || timetableData.timetable || timetableData.data || []);
      if (teachersData.success) setTeachers(teachersData.teachers || teachersData.data || []);
      if (examsData.success) setExams(examsData.exams || examsData.schedule || examsData.data || []);
    } catch (error) {
      console.error('Error loading student details:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadDODMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-dashboard/dod-messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setDodMessages(result.messages || []);
      }
    } catch (error) {
      console.error('Error loading DOD messages:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedStudent) {
      toast.error(language === 'rw' ? 'Hitamo umwana' : 'Please select a student');
      return;
    }

    if (!phoneNumber || paymentData.amount <= 0) {
      toast.error(language === 'rw' ? 'Shyiramo telephone n\'amafaranga' : 'Please enter valid payment details');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          phone_number: phoneNumber,
          description: paymentData.description
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(language === 'rw' ? 'Ibyifuzo byatangiye! Reba telephone yawe' : 'Payment initiated! Check your phone');
        setShowPaymentModal(false);
        loadStudentDetails(selectedStudent.id);
      } else {
        toast.error(result.message || (language === 'rw' ? 'Ibyifuzo byanze' : 'Payment failed'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(language === 'rw' ? 'Ibyifuzo byanze' : 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTeacher || !messageText) {
      toast.error(language === 'rw' ? 'Andika message' : 'Please enter a message');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-dashboard/message/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: selectedTeacher.id,
          message: messageText,
          student_id: selectedStudent?.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(language === 'rw' ? 'Message yatangiwe!' : 'Message sent!');
        setShowMessageModal(false);
        setMessageText('');
      } else {
        toast.error(result.message || (language === 'rw' ? 'Message itumire' : 'Message failed'));
      }
    } catch (error) {
      console.error('Message error:', error);
      toast.error(language === 'rw' ? 'Message itumire' : 'Message sending failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleLinkRequest = async () => {
    if (!studentCode) {
      toast.error(language === 'rw' ? 'Andika kode y\'umwana' : 'Please enter student code');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${API_BASE}/parent-linking/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          parent_id: user.id,
          student_code: studentCode,
          phone: phoneNumber
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(language === 'rw' ? 'Ibyifuzo byatangiwe! Utegereze ubutumwa bwo kwemera' : 'Request submitted! Wait for approval');
        setShowLinkRequestModal(false);
        setStudentCode('');
        loadParentData();
      } else {
        toast.error(result.message || (language === 'rw' ? 'Ibyifuzo byanze' : 'Request failed'));
      }
    } catch (error) {
      console.error('Link request error:', error);
      toast.error(language === 'rw' ? 'Ibyifuzo byanze' : 'Request failed');
    } finally {
      setProcessing(false);
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/parent-dashboard/dod-messages/${messageId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadDODMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeUpper = grade?.toUpperCase() || '';
    if (gradeUpper === 'A' || gradeUpper === 'A+' || gradeUpper === 'A-') return 'text-green-600';
    if (gradeUpper === 'B' || gradeUpper === 'B+' || gradeUpper === 'B-') return 'text-blue-600';
    if (gradeUpper === 'C' || gradeUpper === 'C+' || gradeUpper === 'C-') return 'text-yellow-600';
    if (gradeUpper === 'D' || gradeUpper === 'D+' || gradeUpper === 'D-') return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-400 to-green-500 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-xl font-bold">{t[language].loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      <OfflineBanner isOnline={isOnline} showBanner={showOfflineBanner} />
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">{t[language].welcome}</h1>
                  <p className="text-green-100 text-sm">{phoneNumber}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'rw' : 'en')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {language === 'en' ? 'Kinyarwanda' : 'English'}
              </Button>
              <Button 
                onClick={() => setShowLinkRequestModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t[language].requestLink}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Student Selector */}
        <Card className="mb-6 shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-yellow-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              {t[language].myChildren}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {linkedStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 rounded-xl cursor-pointer transition-all shadow-lg ${
                      selectedStudent?.id === student.id
                        ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white'
                        : 'bg-white hover:bg-green-50 border-2 border-transparent hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedStudent?.id === student.id ? 'bg-white/30' : 'bg-gradient-to-r from-green-400 to-yellow-400'
                      }`}>
                        <span className="text-2xl font-black text-white">{student.first_name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold">{student.first_name} {student.last_name}</p>
                        <p className={`text-sm ${selectedStudent?.id === student.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {student.trade_name} - {t[language].level} {student.level_number}
                        </p>
                        <p className={`text-xs ${selectedStudent?.id === student.id ? 'text-white/60' : 'text-gray-400'}`}>
                          {student.student_code}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{t[language].noStudents}</p>
                <Button 
                  onClick={tryAutoFetchStudent}
                  className="bg-gradient-to-r from-green-500 to-yellow-500"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {t[language].autoFetch}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedStudent && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="shadow-xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <TrendingUp className="w-8 h-8 opacity-80" />
                      <Star className="w-5 h-5 opacity-60" />
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-3xl font-black text-green-600">{selectedStudent.gpa || 'N/A'}</p>
                    <p className="text-sm text-gray-600 font-medium">{t[language].gpa}</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="shadow-xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <CheckCircle className="w-8 h-8 opacity-80" />
                      <Shield className="w-5 h-5 opacity-60" />
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-3xl font-black text-blue-600">{selectedStudent.attendance_percentage || 0}%</p>
                    <p className="text-sm text-gray-600 font-medium">{t[language].attendanceRate}</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="shadow-xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-br from-red-400 to-red-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <DollarSign className="w-8 h-8 opacity-80" />
                      <Wallet className="w-5 h-5 opacity-60" />
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-3xl font-black text-red-600">{(selectedStudent.balance || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 font-medium">{t[language].balance}</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="shadow-xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <Calculator className="w-8 h-8 opacity-80" />
                      <Target className="w-5 h-5 opacity-60" />
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-3xl font-black text-orange-600">{(selectedStudent.total_fees || selectedStudent.balance || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 font-medium">{t[language].totalFees}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 h-14 text-lg font-bold shadow-lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {t[language].payFees}
              </Button>
              <Button 
                onClick={() => setShowMessageModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-14 text-lg font-bold shadow-lg"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                {t[language].sendMessage}
              </Button>
              <Button 
                onClick={loadParentData}
                variant="outline"
                className="h-14 text-lg font-bold shadow-lg border-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowLinkRequestModal(true)}
                variant="outline"
                className="h-14 text-lg font-bold shadow-lg border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                <Users className="w-5 h-5 mr-2" />
                {t[language].requestLink}
              </Button>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 bg-white shadow-lg p-1">
                <TabsTrigger value="overview" className="font-bold">{t[language].overview}</TabsTrigger>
                <TabsTrigger value="grades" className="font-bold">{t[language].grades}</TabsTrigger>
                <TabsTrigger value="attendance" className="font-bold">{t[language].attendance}</TabsTrigger>
                <TabsTrigger value="discipline" className="font-bold">{t[language].discipline}</TabsTrigger>
                <TabsTrigger value="fees" className="font-bold">{t[language].fees}</TabsTrigger>
                <TabsTrigger value="timetable" className="font-bold">{t[language].timetable}</TabsTrigger>
                <TabsTrigger value="teachers" className="font-bold">{t[language].teachers}</TabsTrigger>
                <TabsTrigger value="exams" className="font-bold">{t[language].exams}</TabsTrigger>
                <TabsTrigger value="messages" className="font-bold">{t[language].messages}</TabsTrigger>
              </TabsList>

              {loadingData && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              )}

              <AnimatePresence>
                {/* Overview Tab */}
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Grades */}
                    <Card className="shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-green-500 to-yellow-500 text-white">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          {t[language].recentGrades}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {grades.length > 0 ? (
                          <div className="space-y-3">
                            {grades.slice(0, 5).map((grade) => (
                              <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-bold">{language === 'rw' ? grade.subject_rw : grade.subject}</p>
                                  <p className="text-xs text-gray-500">{grade.exam_type} - {grade.term}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xl font-black ${getGradeColor(grade.grade)}`}>{grade.grade}</p>
                                  <p className="text-xs text-gray-500">{grade.score}/{grade.max_score}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">{t[language].noGrades}</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Messages */}
                    <Card className="shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5" />
                          {t[language].recentMessages}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {dodMessages.length > 0 ? (
                          <div className="space-y-3">
                            {dodMessages.slice(0, 5).map((msg) => (
                              <div 
                                key={msg.id} 
                                onClick={() => markMessageAsRead(msg.id)}
                                className={`p-3 rounded-lg cursor-pointer ${msg.is_read ? 'bg-gray-50' : 'bg-yellow-50 border-l-4 border-yellow-500'}`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${msg.is_read ? 'bg-gray-300' : 'bg-yellow-500'}`} />
                                  <div>
                                    <p className="font-medium">{msg.sender_name}</p>
                                    <p className="text-sm text-gray-600">{language === 'rw' ? msg.message_rw : msg.message}</p>
                                    <p className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">{t[language].noMessages}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Grades Tab */}
                <TabsContent value="grades">
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-yellow-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {t[language].grades}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {grades.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-green-500">
                                <th className="text-left py-3 px-4 font-black text-green-600">{language === 'rw' ? 'Ishami' : 'Subject'}</th>
                                <th className="text-left py-3 px-4 font-black text-green-600">{t[language].examSchedule}</th>
                                <th className="text-left py-3 px-4 font-black text-green-600">Term</th>
                                <th className="text-center py-3 px-4 font-black text-green-600">Score</th>
                                <th className="text-center py-3 px-4 font-black text-green-600">Grade</th>
                                <th className="text-left py-3 px-4 font-black text-green-600">Teacher</th>
                              </tr>
                            </thead>
                            <tbody>
                              {grades.map((grade) => (
                                <tr key={grade.id} className="border-b hover:bg-green-50">
                                  <td className="py-3 px-4 font-medium">{language === 'rw' ? grade.subject_rw : grade.subject}</td>
                                  <td className="py-3 px-4">{grade.exam_type}</td>
                                  <td className="py-3 px-4">{grade.term}</td>
                                  <td className="py-3 px-4 text-center font-bold">{grade.score}/{grade.max_score}</td>
                                  <td className={`py-3 px-4 text-center font-black text-xl ${getGradeColor(grade.grade)}`}>{grade.grade}</td>
                                  <td className="py-3 px-4 text-gray-600">{grade.teacher_name}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">{t[language].noGrades}</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance">
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {t[language].attendance}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {attendance.length > 0 ? (
                        <div className="space-y-3">
                          {attendance.slice(0, 20).map((record) => (
                            <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  record.status === 'present' ? 'bg-green-100' :
                                  record.status === 'absent' ? 'bg-red-100' :
                                  record.status === 'late' ? 'bg-yellow-100' : 'bg-blue-100'
                                }`}>
                                  {record.status === 'present' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                  {record.status === 'absent' && <X className="w-5 h-5 text-red-600" />}
                                  {record.status === 'late' && <Clock className="w-5 h-5 text-yellow-600" />}
                                  {record.status === 'excused' && <FileCheck className="w-5 h-5 text-blue-600" />}
                                </div>
                                <div>
                                  <p className="font-bold">{new Date(record.date).toLocaleDateString()}</p>
                                  <p className="text-sm text-gray-500">{record.period || 'Full Day'}</p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(record.status)}>
                                {getStatusLabel(record.status)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">{t[language].noAttendance}</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Discipline Tab */}
                <TabsContent value="discipline">
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {t[language].discipline}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {disciplineRecords.length > 0 ? (
                        <div className="space-y-3">
                          {disciplineRecords.map((record) => (
                            <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-bold">{language === 'rw' ? record.incident_type_rw : record.incident_type}</p>
                                  <p className="text-sm text-gray-600 mt-1">{language === 'rw' ? record.description_rw : record.description}</p>
                                  <p className="text-xs text-gray-400 mt-2">{new Date(record.date).toLocaleDateString()}</p>
                                </div>
                                <Badge variant={record.status === 'resolved' ? 'default' : 'destructive'}>
                                  {record.status}
                                </Badge>
                              </div>
                              <div className="mt-3 p-2 bg-blue-50 rounded">
                                <p className="text-sm font-medium text-blue-800">
                                  {language === 'rw' ? 'Igikoro:' : 'Action:'} {language === 'rw' ? record.action_taken_rw : record.action_taken}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">{t[language].noDiscipline}</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Fees Tab */}
                <TabsContent value="fees">
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        {t[language].fees}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80">{t[language].totalFees}</p>
                          <p className="text-2xl font-black">{(selectedStudent.total_fees || 0).toLocaleString()} RWF</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80">{t[language].paidFees}</p>
                          <p className="text-2xl font-black">{(selectedStudent.paid_fees || 0).toLocaleString()} RWF</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-400 to-red-600 p-4 rounded-xl text-white">
                          <p className="text-sm opacity-80">{t[language].balance}</p>
                          <p className="text-2xl font-black">{(selectedStudent.balance || 0).toLocaleString()} RWF</p>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-4">Payment History</h3>
                      {feePayments.length > 0 ? (
                        <div className="space-y-3">
                          {feePayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-bold">{payment.description}</p>
                                <p className="text-sm text-gray-500">{payment.payment_date} - {payment.payment_method}</p>
                                <p className="text-xs text-gray-400">Receipt: {payment.receipt_number}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-green-600">{payment.amount.toLocaleString()} RWF</p>
                                <Badge className="bg-green-100 text-green-800">{payment.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No payment history</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Timetable Tab */}
                <TabsContent value="timetable">
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {t[language].timetable}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {timetable.length > 0 ? (
                        <div className="space-y-4">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                            <div key={day}>
                              <h4 className="font-bold text-green-600 mb-2">{getDayLabel(day)}</h4>
                              <div className="space-y-2">
                                {timetable.filter(t => t.day === day).map((entry) => (
                                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-yellow-400 rounded-lg flex items-center justify-center">
                                        <span className="font-black text-white">{entry.period}</span>
                                      </div>
                                      <div>
                                        <p className="font-bold">{language === 'rw' ? entry.subject_rw : entry.subject}</p>
                                        <p className="text-sm text-gray-500">{entry.start_time} - {entry.end_time}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">{entry.room}</p>
                                      <p className="text-xs text-gray-500">{entry.teacher_name}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No timetable available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Teachers Tab */}
                <TabsContent value="teachers">
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {t[language].teachers}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {teachers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {teachers.map((teacher) => (
                            <div key={teacher.id} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full flex items-center justify-center">
                                  <span className="text-xl font-black text-white">{teacher.name?.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-bold">{teacher.name}</p>
                                  <p className="text-sm text-gray-500">{language === 'rw' ? teacher.subject_rw : teacher.subject}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-green-600" />
                                  <span>{teacher.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-4 h-4 text-blue-600" />
                                  <span className="truncate">{teacher.email}</span>
                                </div>
                              </div>
                              <Button 
                                onClick={() => { setSelectedTeacher(teacher); setShowMessageModal(true); }}
                                className="w-full mt-3 bg-gradient-to-r from-green-500 to-yellow-500"
                                size="sm"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {t[language].sendMessage}
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No teachers available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Exams Tab */}
                <TabsContent value="exams">
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {t[language].examSchedule}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {exams.length > 0 ? (
                        <div className="space-y-3">
                          {exams.map((exam) => (
                            <div key={exam.id} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-l-4 border-red-500">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-lg">{language === 'rw' ? exam.subject_rw : exam.subject}</p>
                                  <p className="text-sm text-gray-600">{exam.exam_type}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-red-600">{new Date(exam.exam_date).toLocaleDateString()}</p>
                                  <p className="text-sm text-gray-500">{exam.start_time} - {exam.end_time}</p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{exam.room}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No exams scheduled</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages">
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        {t[language].messages}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {dodMessages.length > 0 ? (
                        <div className="space-y-3">
                          {dodMessages.map((msg) => (
                            <div 
                              key={msg.id}
                              onClick={() => markMessageAsRead(msg.id)}
                              className={`p-4 rounded-lg cursor-pointer transition ${msg.is_read ? 'bg-gray-50' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500'}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  msg.type === 'achievement' ? 'bg-yellow-100' :
                                  msg.type === 'warning' ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                  {msg.type === 'achievement' && <Trophy className="w-5 h-5 text-yellow-600" />}
                                  {msg.type === 'warning' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                                  {msg.type === 'leave' && <Calendar className="w-5 h-5 text-blue-600" />}
                                  {msg.type === 'conduct' && <Shield className="w-5 h-5 text-purple-600" />}
                                  {msg.type === 'sick' && <Heart className="w-5 h-5 text-red-600" />}
                                  {msg.type === 'general' && <Bell className="w-5 h-5 text-blue-600" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-bold">{msg.sender_name}</p>
                                    <p className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{language === 'rw' ? msg.message_rw : msg.message}</p>
                                </div>
                                {!msg.is_read && (
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">{t[language].noMessages}</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              {t[language].payFees}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'rw' ? 'Umwana' : 'Student'}</Label>
              <p className="font-bold">{selectedStudent?.first_name} {selectedStudent?.last_name}</p>
            </div>
            <div>
              <Label>{language === 'rw' ? 'Nimero ya telephone' : 'Phone Number'}</Label>
              <Input 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t[language].enterPhone}
              />
            </div>
            <div>
              <Label>{language === 'rw' ? 'Amafaranga' : 'Amount'}</Label>
              <Input 
                type="number"
                value={paymentData.amount || ''}
                onChange={(e) => setPaymentData({...paymentData, amount: parseInt(e.target.value) || 0})}
                placeholder={t[language].enterAmount}
              />
            </div>
            <div>
              <Label>{language === 'rw' ? 'Ubwikode' : 'Payment Method'}</Label>
              <Select value={paymentData.payment_method} onValueChange={(v) => setPaymentData({...paymentData, payment_method: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="momo">MoMo Pay</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              {t[language].cancel}
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={processing}
              className="bg-gradient-to-r from-green-500 to-yellow-500"
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t[language].processPayment}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              {t[language].sendMessage}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'rw' ? 'Umwarimu' : 'Teacher'}</Label>
              <Select 
                value={selectedTeacher?.id?.toString() || ''} 
                onValueChange={(v) => {
                  const teacher = teachers.find(t => t.id.toString() === v);
                  setSelectedTeacher(teacher || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name} - {language === 'rw' ? teacher.subject_rw : teacher.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{language === 'rw' ? 'Message' : 'Message'}</Label>
              <textarea 
                className="w-full p-3 border rounded-lg min-h-[100px]"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={language === 'rw' ? 'Andika message yawe...' : 'Write your message...'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageModal(false)}>
              {t[language].cancel}
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={processing}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Send className="w-4 h-4 mr-2" />
              {t[language].sendMessage}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Request Modal */}
      <Dialog open={showLinkRequestModal} onOpenChange={setShowLinkRequestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-600" />
              {t[language].requestLink}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'rw' ? 'Kode y\'umwana' : 'Student Code'}</Label>
              <Input 
                value={studentCode} 
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder={t[language].enterStudentCode}
              />
              <p className="text-xs text-gray-500 mt-1">
                {language === 'rw' ? 'Shaka umwana ufite muri Level 4 SOD' : 'Find student in Level 4 SOD'}
              </p>
            </div>
            <div>
              <Label>{language === 'rw' ? 'Nimero ya telephone' : 'Phone Number'}</Label>
              <Input 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t[language].enterPhone}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkRequestModal(false)}>
              {t[language].cancel}
            </Button>
            <Button 
              onClick={handleLinkRequest} 
              disabled={processing}
              className="bg-gradient-to-r from-yellow-500 to-orange-500"
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'rw' ? 'Shaka' : 'Search'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

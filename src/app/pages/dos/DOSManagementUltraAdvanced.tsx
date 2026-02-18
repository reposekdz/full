import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/app/config/apiBase';
import {
  Users, BookOpen, TrendingUp, Clock, FileText,
  Plus, Search, Filter, Download, Edit, Trash2, Eye, UserPlus,
  GraduationCap, Award, BarChart3, CheckCircle,
  AlertCircle, XCircle, Settings, RefreshCw,
  Calculator, Printer, Send, Phone, MessageSquare,
  FilePlus, FileSpreadsheet,
  Bell, UserCheck, UserX,
  Book, GraduationCap as GradIcon,
  User, UserCog, MessageCircle, Users2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { PowerfulStudentSelector } from '@/app/components/PowerfulStudentSelector';

// Types
interface DOSManagementProps {
  onNavigate: (page: string) => void;
}

interface Student {
  student_id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_code: string;
  trade_name: string;
  level_number: number;
  level_suffix: string;
  class_name: string;
  parent_phone: string;
  parent_id: string;
  parent_name: string;
  gpa: number;
  attendance_rate: number;
  status: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject_specialization: string;
  assigned_subjects: string[];
  assigned_classes: string[];
  status: string;
}

interface Course {
  course_id: string;
  course_code: string;
  course_name: string;
  trade_code: string;
  level_number: number;
  teacher_id: string;
  teacher_name: string;
  credits: number;
  max_marks: number;
  passing_marks: number;
}

interface MarkEntry {
  id: string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  quiz_marks: number;
  midterm_marks: number;
  final_marks: number;
  total_marks: number;
  percentage: number;
  grade: string;
  term: string;
  academic_year: string;
  entered_by: string;
  entered_at: string;
}

interface ReportCard {
  report_id: string;
  student_id: string;
  student_name: string;
  trade_name: string;
  level: string;
  academic_year: string;
  term: string;
  gpa: number;
  total_marks: number;
  average_percentage: number;
  rank: number;
  attendance_rate: number;
  conduct_score: number;
  teacher_comment: string;
  dos_comment: string;
  headmaster_comment: string;
  generated_at: string;
  status: string;
}

interface ParentConnection {
  connection_id: string;
  student_id: string;
  student_name: string;
  parent_id: string;
  parent_name: string;
  parent_phone: string;
  access_granted_by: string;
  access_granted_at: string;
  access_level: string;
  can_view_marks: boolean;
  can_view_attendance: boolean;
  can_view_discipline: boolean;
  can_receive_notifications: boolean;
  status: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  recipient_type: string;
  recipient_ids: string[];
  sent_via: string;
  status: string;
  sent_at: string;
}

const DOSManagementUltraAdvanced: React.FC<DOSManagementProps> = ({ onNavigate }) => {
  // State Management
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [parentConnections, setParentConnections] = useState<ParentConnection[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  // Filter States
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('current');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    avgGPA: 0,
    avgAttendance: 0,
    reportsGenerated: 0,
    parentConnections: 0,
    notificationsSent: 0
  });

  // Modal States
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showEnterMarksModal, setShowEnterMarksModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showParentAccessModal, setShowParentAccessModal] = useState(false);
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null);

  // Form States
  const [newCourse, setNewCourse] = useState({
    course_name: '', course_code: '', trade_code: '', level_number: '',
    credits: 3, max_marks: 100, passing_marks: 40, description: ''
  });
  const [teacherAssignment, setTeacherAssignment] = useState({
    teacher_id: '', course_id: '', academic_year: new Date().getFullYear().toString()
  });
  const [markEntry, setMarkEntry] = useState({
    student_id: '', course_id: '', quiz_marks: 0, midterm_marks: 0, final_marks: 0,
    term: 'Term 1', academic_year: new Date().getFullYear().toString()
  });
  const [reportConfig, setReportConfig] = useState({
    trade_code: '', level_number: '', level_suffix: '', term: 'Term 1',
    academic_year: new Date().getFullYear().toString(), include_ranks: true,
    include_teacher_comments: true, include_dos_comments: true, include_attendance: true
  });
  const [parentAccessConfig, setParentAccessConfig] = useState({
    student_id: '', parent_phone: '', parent_name: '', can_view_marks: true,
    can_view_attendance: true, can_view_discipline: false, can_receive_notifications: true
  });
  const [notificationConfig, setNotificationConfig] = useState({
    type: 'general', title: '', message: '', recipient_type: 'all',
    send_via: 'african_talking', specific_recipients: ''
  });

  // Initialize
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [studentsRes, teachersRes, coursesRes, tradesRes, marksRes,
        reportsRes, parentsRes, notificationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/global-sheets/students`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/teachers`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/courses`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/trades`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/global-sheets/students/marks/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/dos-management/report-cards`, { headers: { 'Authorization': `Bearer ${token}` } }),
          // Use enhanced parent management API for real database data
          fetch(`${API_BASE_URL}/management/parents`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/management/parents/pending-links`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/parent-linking/connections`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/notifications/sent`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();
      const coursesData = await coursesRes.json();
      const tradesData = await tradesRes.json();
      const marksData = await marksRes.json();
      const reportsData = await reportsRes.json();
      const parentsData = await parentsRes.json();
      const notificationsData = await notificationsRes.json();

      if (studentsData.success) setStudents(studentsData.students || []);
      if (teachersData.success) setTeachers(teachersData.teachers || []);
      if (coursesData.success) setCourses(coursesData.courses || []);
      if (tradesData.success) setTrades(tradesData.trades || []);
      if (marksData.success) setMarks(marksData.marks || []);
      if (reportsData.success) setReportCards(reportsData.reports || []);
      if (parentsData.success) setParentConnections(parentsData.connections || []);
      if (notificationsData.success) setNotifications(notificationsData.notifications || []);

      calculateStats(
        studentsData.students || [],
        teachersData.teachers || [],
        coursesData.courses || [],
        reportsData.reports || [],
        parentsData.connections || []
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Byanze kubona amakuru');
    }
    setLoading(false);
  };

  const calculateStats = (studentsData: Student[], teachersData: Teacher[],
    coursesData: Course[], reportsData: ReportCard[], parentsData: ParentConnection[]) => {
    setStats({
      totalStudents: studentsData.length,
      totalTeachers: teachersData.length,
      totalCourses: coursesData.length,
      avgGPA: studentsData.length > 0
        ? studentsData.reduce((acc, s) => acc + (s.gpa || 0), 0) / studentsData.length : 0,
      avgAttendance: studentsData.length > 0
        ? studentsData.reduce((acc, s) => acc + (s.attendance_rate || 0), 0) / studentsData.length : 0,
      reportsGenerated: reportsData.length,
      parentConnections: parentsData.length,
      notificationsSent: 0
    });
  };

  // Handlers
  const handleAddCourse = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Kurse yongeywe neza!');
        setShowAddCourseModal(false);
        setNewCourse({
          course_name: '', course_code: '', trade_code: '', level_number: '',
          credits: 3, max_marks: 100, passing_marks: 40, description: ''
        });
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleAssignTeacher = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dos-management/assign-teacher`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherAssignment)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Umwarimu yahereywe neza!');
        setShowAssignTeacherModal(false);
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleEnterMarks = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/global-sheets/students/${markEntry.student_id}/marks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(markEntry)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Amazina yanditswe neza!');
        setShowEnterMarksModal(false);
        setMarkEntry({
          student_id: '', course_id: '', quiz_marks: 0, midterm_marks: 0, final_marks: 0,
          term: 'Term 1', academic_year: new Date().getFullYear().toString()
        });
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleGenerateReportCard = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dos-management/reports/generate-report-card`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(reportConfig)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Raporo yagenerewe neza!');
        setShowGenerateReportModal(false);
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleGrantParentAccess = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/parent-linking/grant-access`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(parentAccessConfig)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Uburyo bwo kubona amakuru bwatangiwe ababyeyi!');
        setShowParentAccessModal(false);
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleSendNotification = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/notifications/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...notificationConfig,
          send_via: 'african_talking'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Ubutumwa bwoherejwe neza! (African Talking SMS)');
        setShowSendNotificationModal(false);
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleRevokeParentAccess = async (connectionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/parent-linking/revoke-access/${connectionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuccessMessage('Uburyo bwaremezwe!');
      fetchInitialData();
    } catch (error) {
      setErrorMessage('Byanze');
    }
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D+';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesTrade = selectedTrade === 'all' || student.trade_code === selectedTrade;
      const matchesLevel = selectedLevel === 'all' || student.level_number === parseInt(selectedLevel);
      const matchesSearch = searchQuery === '' ||
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTrade && matchesLevel && matchesSearch;
    });
  };

  const getStudentMarks = (studentId: string) => {
    return marks.filter(m => m.student_id === studentId);
  };

  const getGradeColor = (grade: string): string => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-500', 'A': 'bg-green-400', 'A-': 'bg-green-300',
      'B+': 'bg-blue-400', 'B': 'bg-blue-300', 'B-': 'bg-blue-200',
      'C+': 'bg-yellow-400', 'C': 'bg-yellow-300', 'C-': 'bg-yellow-200',
      'D+': 'bg-orange-400', 'D': 'bg-orange-300', 'F': 'bg-red-500'
    };
    return colors[grade] || 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Tegereza...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            {successMessage}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <XCircle className="w-6 h-6" />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                <GradIcon className="w-10 h-10 text-indigo-600" />
                DOS Management System
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Director of Studies - Academic Management & Report Cards
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchInitialData} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Kuvugurura
              </Button>
              <Button
                onClick={() => setShowGenerateReportModal(true)}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Gukora Report Card
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <Label>Trade:</Label>
                  <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Hitamo Trade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Byose</SelectItem>
                      {trades.map((trade: any) => (
                        <SelectItem key={trade.trade_code} value={trade.trade_code}>
                          {trade.trade_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <GradIcon className="w-5 h-5 text-purple-600" />
                  <Label>Level:</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Hitamo Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Byose</SelectItem>
                      {[1, 2, 3].map((level: any) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-pink-600" />
                  <Label>Term:</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Hitamo Term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Term 1</SelectItem>
                      <SelectItem value="term2">Term 2</SelectItem>
                      <SelectItem value="term3">Term 3</SelectItem>
                      <SelectItem value="all">Byose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Shakisha umunyeshuri..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setSelectedTrade('all'); setSelectedLevel('all'); setSearchQuery(''); }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[
            { title: 'Abanyeshuri', value: stats.totalStudents, icon: Users, color: 'from-blue-500 to-indigo-500', change: '+5%' },
            { title: 'Abwarimu', value: stats.totalTeachers, icon: UserCog, color: 'from-green-500 to-teal-500', change: '+2%' },
            { title: 'Kurse', value: stats.totalCourses, icon: Book, color: 'from-purple-500 to-violet-500', change: '+3%' },
            { title: 'Avg GPA', value: stats.avgGPA.toFixed(2), icon: TrendingUp, color: 'from-yellow-500 to-amber-500', change: '+0.1' },
            { title: 'Avg Attendance', value: `${stats.avgAttendance.toFixed(1)}%`, icon: Clock, color: 'from-pink-500 to-rose-500', change: '+2%' },
            { title: 'Report Cards', value: stats.reportsGenerated, icon: FileSpreadsheet, color: 'from-indigo-500 to-blue-500', change: '+10' },
            { title: 'Parents Connected', value: stats.parentConnections, icon: Users2, color: 'from-orange-500 to-red-500', change: '+5' },
            { title: 'Notifications', value: stats.notificationsSent, icon: Bell, color: 'from-cyan-500 to-blue-500', change: '+20' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${stat.color} p-4 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="relative z-10">
                      <p className="text-white/90 text-xs mb-1">{stat.title}</p>
                      <p className="text-2xl font-black">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-medium">{stat.change}</span>
                      </div>
                    </div>
                    <stat.icon className="absolute bottom-2 right-2 w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3 mb-8">
          {[
            { icon: Book, label: 'Add Course', color: 'from-blue-500 to-indigo-600', action: () => setShowAddCourseModal(true) },
            { icon: UserCog, label: 'Assign Teacher', color: 'from-green-500 to-teal-600', action: () => setShowAssignTeacherModal(true) },
            { icon: Calculator, label: 'Enter Marks', color: 'from-purple-500 to-violet-600', action: () => setShowEnterMarksModal(true) },
            { icon: FileSpreadsheet, label: 'Report Card', color: 'from-yellow-500 to-amber-600', action: () => setShowGenerateReportModal(true) },
            { icon: Users2, label: 'Parent Access', color: 'from-pink-500 to-rose-600', action: () => setShowParentAccessModal(true) },
            { icon: Bell, label: 'Send SMS', color: 'from-cyan-500 to-blue-600', action: () => setShowSendNotificationModal(true) },
            { icon: FileText, label: 'View Reports', color: 'from-orange-500 to-red-600', action: () => setActiveTab('reports') },
            { icon: Users, label: 'Parents', color: 'from-indigo-500 to-purple-600', action: () => setActiveTab('parents') }
          ].map((action, index) => (
            <motion.div
              key={action.label}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={action.action}
                className={`w-full h-24 bg-gradient-to-br ${action.color} hover:opacity-90 text-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 text-xs font-semibold`}
              >
                <action.icon className="w-6 h-6" />
                {action.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-lg rounded-xl p-2 border-2">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="teachers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white">
              <UserCog className="w-4 h-4 mr-2" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              <Book className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="marks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Marks
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="parents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
              <Users2 className="w-4 h-4 mr-2" />
              Parents
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Academic Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-teal-100 rounded-xl">
                      <span className="font-semibold">Average GPA</span>
                      <span className="text-2xl font-black text-green-600">{stats.avgGPA.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                      <span className="font-semibold">Average Attendance</span>
                      <span className="text-2xl font-black text-blue-600">{stats.avgAttendance.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                      <span className="font-semibold">Students with A Grade</span>
                      <span className="text-2xl font-black text-purple-600">
                        {marks.filter(m => m.grade?.startsWith('A')).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl">
                      <span className="font-semibold">Students Needing Support</span>
                      <span className="text-2xl font-black text-orange-600">
                        {marks.filter(m => parseFloat(m.percentage?.toString() || '0') < 50).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-500" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notif: any) => (
                      <div key={notif.id} className="p-3 bg-gray-50 rounded-xl flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-blue-500 mt-1" />
                        <div>
                          <p className="font-semibold">{notif.title}</p>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(notif.sent_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-center text-gray-500 py-4">Nta bubutumwa bwoherejwe</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                    Recent Report Cards Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-indigo-100 to-purple-100">
                        <TableHead>Student</TableHead>
                        <TableHead>Trade/Level</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>GPA</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportCards.slice(0, 10).map((report: any) => (
                        <motion.tr
                          key={report.report_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="hover:bg-indigo-50"
                        >
                          <TableCell className="font-semibold">{report.student_name}</TableCell>
                          <TableCell>{report.trade_name} - Level {report.level}</TableCell>
                          <TableCell>{report.term}</TableCell>
                          <TableCell>
                            <Badge className={report.gpa >= 3.5 ? 'bg-green-500' : report.gpa >= 3.0 ? 'bg-blue-500' : 'bg-yellow-500'}>
                              {report.gpa?.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell>#{report.rank}</TableCell>
                          <TableCell>
                            <Badge className={report.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedReportCard(report); setShowReportCardModal(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Students Management with Marks</CardTitle>
                    <CardDescription>View students and their academic performance</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-green-100 to-teal-100">
                      <TableHead className="font-bold">Code</TableHead>
                      <TableHead className="font-bold">Names</TableHead>
                      <TableHead className="font-bold">Trade/Level</TableHead>
                      <TableHead className="font-bold">Parent Phone</TableHead>
                      <TableHead className="font-bold">GPA</TableHead>
                      <TableHead className="font-bold">Attendance</TableHead>
                      <TableHead className="font-bold">Avg Marks</TableHead>
                      <TableHead className="font-bold">Grade</TableHead>
                      <TableHead className="font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredStudents().slice(0, 50).map((student, idx) => {
                      const studentMarks = getStudentMarks(student.student_id);
                      const avgMarks = studentMarks.length > 0
                        ? studentMarks.reduce((acc, m) => acc + (m.total_marks || 0), 0) / studentMarks.length
                        : 0;
                      const grade = calculateGrade(avgMarks);
                      return (
                        <motion.tr
                          key={student.student_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="hover:bg-green-50"
                        >
                          <TableCell className="font-mono font-semibold">{student.student_code}</TableCell>
                          <TableCell className="font-semibold">{student.first_name} {student.last_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.trade_name}</Badge>
                            <Badge variant="secondary" className="ml-1">L{student.level_number}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{student.parent_phone || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={student.gpa >= 3.5 ? 'bg-green-500' : student.gpa >= 3.0 ? 'bg-blue-500' : 'bg-yellow-500'}>
                              {student.gpa?.toFixed(2) || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${student.attendance_rate >= 90 ? 'bg-green-500' : student.attendance_rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${student.attendance_rate}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{student.attendance_rate?.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{avgMarks.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge className={`${getGradeColor(grade)} text-white`}>
                              {grade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => { setSelectedStudent(student); setShowStudentDetailModal(true); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { const report = reportCards.find((r: any) => r.student_id === student.student_id); if (report) { setSelectedReportCard(report); setShowReportCardModal(true); } }}>
                                <FileSpreadsheet className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Teachers Management</CardTitle>
                    <CardDescription>Manage teachers and their assignments</CardDescription>
                  </div>
                  <Button onClick={() => setShowAssignTeacherModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Subject
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.map((teacher: any, idx) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-2 rounded-xl p-4 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          {teacher.first_name?.charAt(0)}{teacher.last_name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{teacher.first_name} {teacher.last_name}</h4>
                          <p className="text-sm text-gray-600">{teacher.email}</p>
                          <p className="text-sm text-gray-600">{teacher.phone}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(teacher.assigned_subjects || []).slice(0, 3).map((subj: string) => (
                              <Badge key={subj} variant="outline" className="text-xs">{subj}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assign
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Courses Management</CardTitle>
                    <CardDescription>Manage all courses and subjects</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddCourseModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-yellow-100 to-amber-100">
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Trade</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Max Marks</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course: any, idx) => (
                      <motion.tr
                        key={course.course_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-yellow-50"
                      >
                        <TableCell className="font-mono">{course.course_code}</TableCell>
                        <TableCell className="font-semibold">{course.course_name}</TableCell>
                        <TableCell>{course.trade_code}</TableCell>
                        <TableCell>Level {course.level_number}</TableCell>
                        <TableCell>{course.teacher_name || 'Not Assigned'}</TableCell>
                        <TableCell>{course.max_marks}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marks Tab */}
          <TabsContent value="marks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Marks Entry & Management</CardTitle>
                    <CardDescription>View and enter student marks for courses</CardDescription>
                  </div>
                  <Button onClick={() => setShowEnterMarksModal(true)}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Enter Marks
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-pink-100 to-rose-100">
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Midterm</TableHead>
                      <TableHead>Final</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marks.slice(0, 50).map((mark: any, idx) => (
                      <motion.tr
                        key={mark.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-pink-50"
                      >
                        <TableCell className="font-semibold">{mark.student_name}</TableCell>
                        <TableCell>{mark.course_name}</TableCell>
                        <TableCell>{mark.quiz_marks}</TableCell>
                        <TableCell>{mark.midterm_marks}</TableCell>
                        <TableCell>{mark.final_marks}</TableCell>
                        <TableCell className="font-bold">{mark.total_marks}</TableCell>
                        <TableCell>{mark.percentage?.toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge className={`${getGradeColor(mark.grade)} text-white`}>
                            {mark.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>{mark.term}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Report Cards Management</CardTitle>
                    <CardDescription>Generate and manage student report cards</CardDescription>
                  </div>
                  <Button onClick={() => setShowGenerateReportModal(true)}>
                    <FilePlus className="w-4 h-4 mr-2" />
                    Generate New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportCards.map((report: any, idx) => (
                    <motion.div
                      key={report.report_id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-2 rounded-xl p-4 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold">{report.student_name}</h4>
                          <p className="text-sm text-gray-600">{report.trade_name} - Level {report.level}</p>
                        </div>
                        <Badge className={report.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-gray-500">GPA</p>
                          <p className="font-bold">{report.gpa?.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-gray-500">Rank</p>
                          <p className="font-bold">#{report.rank}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-gray-500">Attendance</p>
                          <p className="font-bold">{report.attendance_rate}%</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-gray-500">Term</p>
                          <p className="font-bold">{report.term}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedReportCard(report); setShowReportCardModal(true); }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Printer className="w-4 h-4 mr-2" />
                          Print
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parents Tab */}
          <TabsContent value="parents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parent Connections & Access Management</CardTitle>
                    <CardDescription>Manage parent access to student information</CardDescription>
                  </div>
                  <Button onClick={() => setShowParentAccessModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Grant Access
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-orange-100 to-red-100">
                      <TableHead>Student</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Can View Marks</TableHead>
                      <TableHead>Can View Attendance</TableHead>
                      <TableHead>Can View Discipline</TableHead>
                      <TableHead>Notifications</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parentConnections.map((conn: any, idx) => (
                      <motion.tr
                        key={conn.connection_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-orange-50"
                      >
                        <TableCell className="font-semibold">{conn.student_name}</TableCell>
                        <TableCell>{conn.parent_name}</TableCell>
                        <TableCell>{conn.parent_phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{conn.access_level}</Badge>
                        </TableCell>
                        <TableCell>
                          {conn.can_view_marks ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                        </TableCell>
                        <TableCell>
                          {conn.can_view_attendance ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                        </TableCell>
                        <TableCell>
                          {conn.can_view_discipline ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                        </TableCell>
                        <TableCell>
                          {conn.can_receive_notifications ? <Badge className="bg-green-500">SMS Enabled</Badge> : <Badge variant="outline">Disabled</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge className={conn.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                            {conn.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleRevokeParentAccess(conn.connection_id)}>
                              <UserX className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setNotificationConfig({ ...notificationConfig, specific_recipients: conn.parent_phone }); setShowSendNotificationModal(true); }}>
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {/* Add Course Modal */}
      <Dialog open={showAddCourseModal} onOpenChange={setShowAddCourseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Book className="w-6 h-6 text-blue-500" />
              Add New Course
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Course Name</Label>
              <Input value={newCourse.course_name} onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })} placeholder="Course name" />
            </div>
            <div>
              <Label>Course Code</Label>
              <Input value={newCourse.course_code} onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })} placeholder="MATH101" />
            </div>
            <div>
              <Label>Trade</Label>
              <Select value={newCourse.trade_code} onValueChange={(v) => setNewCourse({ ...newCourse, trade_code: v })}>
                <SelectTrigger><SelectValue placeholder="Select Trade" /></SelectTrigger>
                <SelectContent>
                  {trades.map((trade: any) => (
                    <SelectItem key={trade.trade_code} value={trade.trade_code}>{trade.trade_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={newCourse.level_number} onValueChange={(v) => setNewCourse({ ...newCourse, level_number: v })}>
                <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((l: any) => (
                    <SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Max Marks</Label>
              <Input type="number" value={newCourse.max_marks} onChange={(e) => setNewCourse({ ...newCourse, max_marks: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Credits</Label>
              <Input type="number" value={newCourse.credits} onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Course description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCourseModal(false)}>Cancel</Button>
            <Button onClick={handleAddCourse} disabled={processing}>{processing ? 'Processing...' : 'Add Course'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Teacher Modal */}
      <Dialog open={showAssignTeacherModal} onOpenChange={setShowAssignTeacherModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-6 h-6 text-green-500" />
              Assign Teacher to Course
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Teacher</Label>
              <Select value={teacherAssignment.teacher_id} onValueChange={(v) => setTeacherAssignment({ ...teacherAssignment, teacher_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher: any) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course</Label>
              <Select value={teacherAssignment.course_id} onValueChange={(v) => setTeacherAssignment({ ...teacherAssignment, course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course.course_id} value={course.course_id}>{course.course_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignTeacherModal(false)}>Cancel</Button>
            <Button onClick={handleAssignTeacher} disabled={processing}>{processing ? 'Processing...' : 'Assign'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enter Marks Modal */}
      <Dialog open={showEnterMarksModal} onOpenChange={setShowEnterMarksModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-purple-500" />
              Enter Student Marks
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Student</Label>
              <PowerfulStudentSelector
                value={markEntry.student_id}
                onChange={(studentId: string) => setMarkEntry({ ...markEntry, student_id: studentId })}
                placeholder="Select student"
              />
            </div>
            <div>
              <Label>Course</Label>
              <Select value={markEntry.course_id} onValueChange={(v) => setMarkEntry({ ...markEntry, course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course.course_id} value={course.course_id}>{course.course_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Term</Label>
              <Select value={markEntry.term} onValueChange={(v) => setMarkEntry({ ...markEntry, term: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quiz Marks</Label>
              <Input type="number" value={markEntry.quiz_marks} onChange={(e) => setMarkEntry({ ...markEntry, quiz_marks: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>Midterm Marks</Label>
              <Input type="number" value={markEntry.midterm_marks} onChange={(e) => setMarkEntry({ ...markEntry, midterm_marks: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>Final Marks</Label>
              <Input type="number" value={markEntry.final_marks} onChange={(e) => setMarkEntry({ ...markEntry, final_marks: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>Total Marks</Label>
              <Input value={(markEntry.quiz_marks + markEntry.midterm_marks + markEntry.final_marks).toString()} readOnly />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnterMarksModal(false)}>Cancel</Button>
            <Button onClick={handleEnterMarks} disabled={processing}>{processing ? 'Processing...' : 'Save Marks'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Report Card Modal */}
      <Dialog open={showGenerateReportModal} onOpenChange={setShowGenerateReportModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-indigo-500" />
              Generate Report Card
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trade</Label>
              <Select value={reportConfig.trade_code} onValueChange={(v) => setReportConfig({ ...reportConfig, trade_code: v })}>
                <SelectTrigger><SelectValue placeholder="Select Trade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  {trades.map((trade: any) => (
                    <SelectItem key={trade.trade_code} value={trade.trade_code}>{trade.trade_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={reportConfig.level_number} onValueChange={(v) => setReportConfig({ ...reportConfig, level_number: v })}>
                <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {[1, 2, 3].map((l: any) => (
                    <SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Term</Label>
              <Select value={reportConfig.term} onValueChange={(v) => setReportConfig({ ...reportConfig, term: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Year</Label>
              <Input value={reportConfig.academic_year} onChange={(e) => setReportConfig({ ...reportConfig, academic_year: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label className="flex items-center gap-2">
                <input type="checkbox" checked={reportConfig.include_ranks} onChange={(e) => setReportConfig({ ...reportConfig, include_ranks: e.target.checked })} />
                Include Rankings
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" checked={reportConfig.include_teacher_comments} onChange={(e) => setReportConfig({ ...reportConfig, include_teacher_comments: e.target.checked })} />
                Include Teacher Comments
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" checked={reportConfig.include_dos_comments} onChange={(e) => setReportConfig({ ...reportConfig, include_dos_comments: e.target.checked })} />
                Include DOS Comments
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" checked={reportConfig.include_attendance} onChange={(e) => setReportConfig({ ...reportConfig, include_attendance: e.target.checked })} />
                Include Attendance
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateReportModal(false)}>Cancel</Button>
            <Button onClick={handleGenerateReportCard} disabled={processing}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {processing ? 'Generating...' : 'Generate Report Cards'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parent Access Modal */}
      <Dialog open={showParentAccessModal} onOpenChange={setShowParentAccessModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users2 className="w-6 h-6 text-orange-500" />
              Grant Parent Access
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Student</Label>
              <PowerfulStudentSelector
                value={parentAccessConfig.student_id}
                onChange={(studentId: string) => setParentAccessConfig({ ...parentAccessConfig, student_id: studentId })}
                placeholder="Select student"
              />
            </div>
            <div>
              <Label>Parent Name</Label>
              <Input value={parentAccessConfig.parent_name} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, parent_name: e.target.value })} placeholder="Parent full name" />
            </div>
            <div>
              <Label>Parent Phone</Label>
              <Input value={parentAccessConfig.parent_phone} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, parent_phone: e.target.value })} placeholder="+250..." />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <input type="checkbox" checked={parentAccessConfig.can_view_marks} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_view_marks: e.target.checked })} />
                Can View Marks
              </Label>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <input type="checkbox" checked={parentAccessConfig.can_view_attendance} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_view_attendance: e.target.checked })} />
                Can View Attendance
              </Label>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <input type="checkbox" checked={parentAccessConfig.can_view_discipline} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_view_discipline: e.target.checked })} />
                Can View Discipline
              </Label>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <input type="checkbox" checked={parentAccessConfig.can_receive_notifications} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_receive_notifications: e.target.checked })} />
                Receive SMS Notifications
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParentAccessModal(false)}>Cancel</Button>
            <Button onClick={handleGrantParentAccess} disabled={processing}>
              <UserCheck className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : 'Grant Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Modal */}
      <Dialog open={showSendNotificationModal} onOpenChange={setShowSendNotificationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-cyan-500" />
              Send SMS via African Talking
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Notification Type</Label>
              <Select value={notificationConfig.type} onValueChange={(v) => setNotificationConfig({ ...notificationConfig, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="attendance">Attendance Alert</SelectItem>
                  <SelectItem value="marks">Marks Notification</SelectItem>
                  <SelectItem value="discipline">Discipline Notice</SelectItem>
                  <SelectItem value="fees">Fees Reminder</SelectItem>
                  <SelectItem value="event">Event Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={notificationConfig.title} onChange={(e) => setNotificationConfig({ ...notificationConfig, title: e.target.value })} placeholder="Notification title" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={notificationConfig.message} onChange={(e) => setNotificationConfig({ ...notificationConfig, message: e.target.value })} placeholder="Enter message in Kinyarwanda or English" rows={4} />
            </div>
            <div>
              <Label>Recipients</Label>
              <Select value={notificationConfig.recipient_type} onValueChange={(v) => setNotificationConfig({ ...notificationConfig, recipient_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parents</SelectItem>
                  <SelectItem value="specific">Specific Phone Number</SelectItem>
                  <SelectItem value="trade">By Trade</SelectItem>
                  <SelectItem value="level">By Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {notificationConfig.recipient_type === 'specific' && (
              <div>
                <Label>Phone Number</Label>
                <Input value={notificationConfig.specific_recipients} onChange={(e) => setNotificationConfig({ ...notificationConfig, specific_recipients: e.target.value })} placeholder="+250..." />
              </div>
            )}
            <div className="p-3 bg-cyan-50 rounded-xl">
              <p className="text-sm text-cyan-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                SMS will be sent via African Talking API
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendNotificationModal(false)}>Cancel</Button>
            <Button onClick={handleSendNotification} disabled={processing}>
              <Send className="w-4 h-4 mr-2" />
              {processing ? 'Sending...' : 'Send SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Detail Modal */}
      <Dialog open={showStudentDetailModal} onOpenChange={setShowStudentDetailModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                    {selectedStudent.first_name?.charAt(0)}{selectedStudent.last_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
                    <p className="text-gray-600">{selectedStudent.student_code}</p>
                    <Badge variant="outline">{selectedStudent.trade_name} - Level {selectedStudent.level_number}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label>Parent Phone</Label>
                <Input value={selectedStudent.parent_phone || 'N/A'} readOnly />
              </div>
              <div>
                <Label>GPA</Label>
                <Input value={selectedStudent.gpa?.toFixed(2) || 'N/A'} readOnly />
              </div>
              <div>
                <Label>Attendance Rate</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${selectedStudent.attendance_rate}%` }}></div>
                  </div>
                  <span>{selectedStudent.attendance_rate}%</span>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Badge className={selectedStudent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                  {selectedStudent.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudentDetailModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Card Modal */}
      <Dialog open={showReportCardModal} onOpenChange={setShowReportCardModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-indigo-500" />
              Student Report Card
            </DialogTitle>
          </DialogHeader>
          {selectedReportCard && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedReportCard.student_name}</h3>
                    <p className="text-gray-600">{selectedReportCard.trade_name} - Level {selectedReportCard.level}</p>
                    <p className="text-sm text-gray-500">Academic Year: {selectedReportCard.academic_year}</p>
                    <p className="text-sm text-gray-500">Term: {selectedReportCard.term}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-indigo-600">{selectedReportCard.gpa?.toFixed(2)}</p>
                    <p className="text-gray-600">GPA</p>
                    <Badge className="mt-2">Rank: #{selectedReportCard.rank}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedReportCard.attendance_rate}%</p>
                  <p className="text-sm text-gray-600">Attendance</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedReportCard.conduct_score}</p>
                  <p className="text-sm text-gray-600">Conduct Score</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedReportCard.average_percentage?.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Average</p>
                </div>
              </div>

              {selectedReportCard.teacher_comment && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Class Teacher Comment</h4>
                  <p className="text-yellow-700 italic">"{selectedReportCard.teacher_comment}"</p>
                </div>
              )}

              {selectedReportCard.dos_comment && (
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2">DOS Comment</h4>
                  <p className="text-indigo-700 italic">"{selectedReportCard.dos_comment}"</p>
                </div>
              )}

              {selectedReportCard.headmaster_comment && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Headmaster Comment</h4>
                  <p className="text-purple-700 italic">"{selectedReportCard.headmaster_comment}"</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportCardModal(false)}>Close</Button>
            <Button>
              <Printer className="w-4 h-4 mr-2" />
              Print PDF
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DOSManagementUltraAdvanced;

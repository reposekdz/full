import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/app/config/apiBase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, TrendingUp, AlertTriangle, Calendar, Award, FileText,
  BarChart3, Clock, CheckCircle, XCircle, Activity, Target,
  UserCheck, Heart, Shield, Bell, Download, Filter, Search,
  Ban, Plane, Mail, MessageSquare, RefreshCw, Loader2, Plus, Eye, Edit, Trash2,
  BookOpen, ClipboardList, FileBarChart, Settings, ChevronDown, ChevronUp, Save, X,
  GraduationCap, Building, Phone, MapPin, User, FilePlus, Printer, Send, Archive,
  MoreHorizontal, EyeOff, Lock, Unlock, FilterX, Download as DownloadIcon, Upload,
  PieChart, TrendingDown, MinusCircle, PlusCircle, CalendarDays, ClipboardCheck,
  GraduationCap as GradIcon, Clipboard, Briefcase, BarChart, Activity as ActivityIcon,
  Menu, X as CloseIcon, Home, Book, File, MessageCircle, UserPlus, LogOut,
  ChevronLeft, ChevronRight, LayoutDashboard, ClipboardCheckIcon, AlertOctagon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { PowerfulStudentSelector } from '@/app/components/PowerfulStudentSelector';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { cn } from '@/app/components/ui/utils';

// Types
interface DODManagementProps {
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
  gender: string;
  phone: string;
  parent_phone: string;
  attendance_rate: number;
  conduct_score: number;
  discipline_count: number;
  status: string;
}

interface Incident {
  id: string;
  student_id: string;
  student_name: string;
  incident_type: string;
  severity: string;
  description: string;
  location: string;
  action_taken: string;
  created_at: string;
  status: string;
}

interface LeaveRequest {
  id: string;
  student_id: string;
  student_name: string;
  leave_type: string;
  reason: string;
  start_time: string;
  end_time: string;
  status: string;
  approved_by: string;
}

interface ConductRecord {
  id: string;
  student_id: string;
  student_name: string;
  conduct_type: string;
  description: string;
  action_taken: string;
  date_recorded: string;
  points_deducted: number;
}

interface CounselingSession {
  id: string;
  student_id: string;
  student_name: string;
  session_type: string;
  notes: string;
  scheduled_date: string;
  counselor: string;
  status: string;
}

interface TimetableSlot {
  id: string;
  day_of_week: string;
  period: number;
  start_time: string;
  end_time: string;
  activity_type: string;
  location: string;
  description: string;
}

interface CustomColumn {
  column_id: string;
  column_name: string;
  column_label: string;
  column_type: string;
  select_options?: string[];
  scope: string;
  scope_value: string;
  value?: any;
}

interface Report {
  id: string;
  report_type: string;
  title: string;
  generated_date: string;
  period_start: string;
  period_end: string;
  status: string;
  data: any;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

// Navigation items for DOD
const navItems = [
  { id: 'dashboard', label: 'Dashboard', labelRw: 'Ahabanza', icon: LayoutDashboard },
  { id: 'students', label: 'Students', labelRw: 'Abanyeshuri', icon: Users },
  { id: 'incidents', label: 'Incidents', labelRw: 'Ibibazo', icon: AlertOctagon },
  { id: 'leaves', label: 'Leaves', labelRw: 'Amanywa', icon: Plane },
  { id: 'conduct', label: 'Conduct', labelRw: 'Imyifatire', icon: ClipboardCheckIcon },
  { id: 'counseling', label: 'Counseling', labelRw: 'Inama', icon: Heart },
  { id: 'timetable', label: 'Timetable', labelRw: 'Gahunda', icon: Calendar },
  { id: 'reports', label: 'Reports', labelRw: 'Raporo', icon: FileBarChart },
  { id: 'sms', label: 'SMS', labelRw: 'Ubutumwa', icon: MessageSquare },
];

const DODManagement: React.FC<DODManagementProps> = ({ onNavigate }) => {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // State Management
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [conducts, setConducts] = useState<ConductRecord[]>([]);
  const [counselingSessions, setCounselingSessions] = useState<CounselingSession[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  // Filter States
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Modal States
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showConductModal, setShowConductModal] = useState(false);
  const [showCounselingModal, setShowCounselingModal] = useState(false);
  const [showRecognitionModal, setShowRecognitionModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showCustomColumnModal, setShowCustomColumnModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [showStudentSheetModal, setShowStudentSheetModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form States
  const [newIncident, setNewIncident] = useState({
    student_id: '', incident_type: 'behavioral', description: '',
    severity: 'medium', location: '', witnesses: ''
  });
  const [newLeave, setNewLeave] = useState({
    student_id: '', leave_type: 'sick', reason: '',
    start_time: '', end_time: '', approved_by: 'dod'
  });
  const [newConduct, setNewConduct] = useState({
    student_id: '', conduct_type: 'warning', description: '',
    action_taken: '', points_deducted: 0
  });
  const [newCounseling, setNewCounseling] = useState({
    student_id: '', session_type: 'individual', notes: '',
    scheduled_date: '', counselor: ''
  });
  const [newTimetable, setNewTimetable] = useState({
    day_of_week: 'monday', period: 1, start_time: '08:00',
    end_time: '09:00', activity_type: 'discipline_inspection',
    location: '', description: ''
  });
  const [newCustomColumn, setNewCustomColumn] = useState({
    column_name: '', column_label: '', column_type: 'text',
    select_options: '', scope: 'dod', scope_value: 'global'
  });
  const [reportConfig, setReportConfig] = useState({
    report_type: 'discipline_monthly', period_start: '', period_end: '',
    trade_code: 'all', include_charts: true, include_details: true
  });

  // Stats State
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeIncidents: 0,
    pendingLeaves: 0,
    activeCounseling: 0,
    avgConductScore: 0,
    incidentsThisMonth: 0,
    criticalCases: 0,
    resolvedCases: 0
  });

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize and fetch data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [studentsRes, tradesRes, incidentsRes, leavesRes, conductsRes,
              counselingRes, timetableRes, customColsRes, reportsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/global-sheets/students`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/trades`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/discipline-management/incidents/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/discipline-management/leave/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/discipline-management/conduct/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/discipline-management/counseling/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/dod/timetable`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/global-sheets/custom-columns?scope=dod`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/dod/reports`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const studentsData = await studentsRes.json();
      const tradesData = await tradesRes.json();
      const incidentsData = await incidentsRes.json();
      const leavesData = await leavesRes.json();
      const conductsData = await conductsRes.json();
      const counselingData = await counselingRes.json();
      const timetableData = await timetableRes.json();
      const customColsData = await customColsRes.json();
      const reportsData = await reportsRes.json();

      if (studentsData.success) setStudents(studentsData.students || []);
      if (tradesData.success) setTrades(tradesData.trades || []);
      if (incidentsData.success) setIncidents(incidentsData.incidents || []);
      if (leavesData.success) setLeaves(leavesData.leaves || []);
      if (conductsData.success) setConducts(conductsData.conducts || []);
      if (counselingData.success) setCounselingSessions(counselingData.sessions || []);
      if (timetableData.success) setTimetable(timetableData.timetable || []);
      if (customColsData.success) setCustomColumns(customColsData.columns || []);
      if (reportsData.success) setReports(reportsData.reports || []);

      calculateStats(
        studentsData.students || [],
        incidentsData.incidents || [],
        leavesData.leaves || [],
        counselingData.sessions || []
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Byanze kubona amakuru');
    }
    setLoading(false);
  };

  const calculateStats = (studentsData: Student[], incidentsData: Incident[],
                          leavesData: LeaveRequest[], counselingData: CounselingSession[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();

    setStats({
      totalStudents: studentsData.length,
      activeIncidents: incidentsData.filter(i => i.status === 'active').length,
      pendingLeaves: leavesData.filter(l => l.status === 'pending').length,
      activeCounseling: counselingData.filter(c => c.status === 'active').length,
      avgConductScore: studentsData.length > 0
        ? studentsData.reduce((acc, s) => acc + (s.conduct_score || 100), 0) / studentsData.length : 100,
      incidentsThisMonth: incidentsData.filter(i => {
        const date = new Date(i.created_at);
        return date.getMonth() === thisMonth;
      }).length,
      criticalCases: incidentsData.filter(i => i.severity === 'critical').length,
      resolvedCases: incidentsData.filter(i => i.status === 'resolved').length
    });
  };

  // Handlers
  const handleCreateIncident = async () => {
    if (!newIncident.student_id || !newIncident.description) {
      setErrorMessage('Uzuza ibisabwa byose');
      return;
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/global-sheets/students/${newIncident.student_id}/discipline`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIncident, type: 'incident' })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Ikibazo cyongewe neza!');
        setShowIncidentModal(false);
        setNewIncident({ student_id: '', incident_type: 'behavioral', description: '', severity: 'medium', location: '', witnesses: '' });
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleApproveLeave = async (leaveId: string, status: string) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/discipline-management/leave/${leaveId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(status === 'approved' ? 'Amanywa yemerewe' : 'Amanywa yanzwe');
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleCreateConduct = async () => {
    if (!newConduct.student_id || !newConduct.description) {
      setErrorMessage('Uzuza ibisabwa byose');
      return;
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/global-sheets/students/${newConduct.student_id}/discipline`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newConduct, type: 'conduct' })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Imyifatire yanditswe neza!');
        setShowConductModal(false);
        setNewConduct({ student_id: '', conduct_type: 'warning', description: '', action_taken: '', points_deducted: 0 });
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleCreateCounseling = async () => {
    if (!newCounseling.student_id || !newCounseling.notes) {
      setErrorMessage('Uzuza ibisabwa byose');
      return;
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/discipline-management/counseling`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newCounseling)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Inama yagenwe neza!');
        setShowCounselingModal(false);
        setNewCounseling({ student_id: '', session_type: 'individual', notes: '', scheduled_date: '', counselor: '' });
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleGenerateReport = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dod/reports/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(reportConfig)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Raporo yagenerewe neza!');
        setShowReportModal(false);
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleResolveIncident = async (incidentId: string) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/discipline-management/incidents/${incidentId}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Ikibazo cyasuzumewe!');
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleSendSMS = async (phone: string, message: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/sms/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ specific_phones: phone, message, type: 'discipline', title: 'Discipline Notification' })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Ubutumwa bwoherejwe!');
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
  };

  // Filter helpers
  const filteredStudents = students.filter(s => {
    const matchTrade = selectedTrade === 'all' || s.trade_code === selectedTrade;
    const matchSearch = searchQuery === '' || 
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTrade && matchSearch;
  });

  const filteredIncidents = incidents.filter(i => {
    const matchSeverity = filterSeverity === 'all' || i.severity === filterSeverity;
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSeverity && matchStatus;
  });

  const filteredLeaves = leaves.filter(l => {
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchStatus;
  });

  // Get today's timetable
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = days[new Date().getDay() - 1] || 'monday';
  const todayTimetable = timetable.filter(t => t.day_of_week === today).sort((a, b) => a.period - b.period);

  // Severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'approved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Render stats cards
  const renderStatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Students</p>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </div>
          <Users className="w-8 h-8 text-blue-200" />
        </div>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm">Active Incidents</p>
            <p className="text-2xl font-bold">{stats.activeIncidents}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-200" />
        </div>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm">Pending Leaves</p>
            <p className="text-2xl font-bold">{stats.pendingLeaves}</p>
          </div>
          <Plane className="w-8 h-8 text-yellow-200" />
        </div>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Avg Conduct</p>
            <p className="text-2xl font-bold">{stats.avgConductScore.toFixed(1)}%</p>
          </div>
          <Heart className="w-8 h-8 text-green-200" />
        </div>
      </motion.div>
    </div>
  );

  // Render dashboard content
  const renderDashboard = () => (
    <div className="space-y-4 lg:space-y-6">
      {renderStatsCards()}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Button onClick={() => setShowIncidentModal(true)} className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
          <AlertTriangle className="w-6 h-6" />
          <span className="text-sm">Report Incident</span>
        </Button>
        <Button onClick={() => setShowLeaveModal(true)} className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700">
          <Plane className="w-6 h-6" />
          <span className="text-sm">Approve Leaves</span>
        </Button>
        <Button onClick={() => setShowCounselingModal(true)} className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
          <Heart className="w-6 h-6" />
          <span className="text-sm">Schedule Counseling</span>
        </Button>
        <Button onClick={() => { setActiveNav('reports'); setShowReportModal(true); }} className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
          <FileBarChart className="w-6 h-6" />
          <span className="text-sm">Generate Report</span>
        </Button>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Recent Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredIncidents.slice(0, 5).map((incident, index) => (
              <motion.div 
                key={incident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getSeverityColor(incident.severity)}`} />
                  <div>
                    <p className="font-medium">{incident.student_name}</p>
                    <p className="text-sm text-gray-500">{incident.incident_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => handleResolveIncident(incident.id)}>
                    Resolve
                  </Button>
                </div>
              </motion.div>
            ))}
            {filteredIncidents.length === 0 && (
              <p className="text-center text-gray-500 py-4">Nta bibazo birebwa</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Timetable */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {todayTimetable.map((slot, index) => (
              <motion.div 
                key={slot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg"
              >
                <div className="text-center min-w-[60px]">
                  <p className="font-bold text-blue-600">{slot.period}</p>
                  <p className="text-xs text-gray-500">{slot.start_time}</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{slot.activity_type}</p>
                  <p className="text-sm text-gray-500">{slot.description}</p>
                </div>
                <Badge variant="outline">{slot.location}</Badge>
              </motion.div>
            ))}
            {todayTimetable.length === 0 && (
              <p className="text-center text-gray-500 py-4">Nta gahunda ya none</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render incidents content
  const renderIncidents = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Input 
          placeholder="Search incidents..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => setShowIncidentModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Incident
        </Button>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.student_name}</TableCell>
                  <TableCell>{incident.incident_type}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(incident.created_at), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleResolveIncident(incident.id)}>
                        Resolve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSendSMS('+250000000000', `Dear parent, ${incident.student_name} had an incident: ${incident.description}`)}>
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Render leaves content
  const renderLeaves = () => (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Input 
          placeholder="Search leaves..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.student_name}</TableCell>
                  <TableCell>{leave.leave_type}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                  <TableCell>{format(new Date(leave.start_time), 'dd/MM')} - {format(new Date(leave.end_time), 'dd/MM')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {leave.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApproveLeave(leave.id, 'approved')}>
                          Approve
                        </Button>
                        <Button size="sm" className="bg-red-500 hover:bg-red-600" onClick={() => handleApproveLeave(leave.id, 'rejected')}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Render students content
  const renderStudents = () => (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <Select value={selectedTrade} onValueChange={setSelectedTrade}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Select Trade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trades</SelectItem>
            {trades.map((trade) => (
              <SelectItem key={trade.trade_code} value={trade.trade_code}>{trade.trade_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input 
          placeholder="Search students..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.student_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => { setSelectedStudent(student); setShowStudentDetailModal(true); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {student.first_name[0]}{student.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-gray-500">{student.student_code}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Trade</p>
                    <p className="font-medium">{student.trade_name}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Level</p>
                    <p className="font-medium">{student.level_number}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Attendance</p>
                    <p className={`font-medium ${student.attendance_rate < 80 ? 'text-red-500' : 'text-green-500'}`}>
                      {student.attendance_rate?.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Conduct</p>
                    <p className={`font-medium ${student.conduct_score < 70 ? 'text-red-500' : 'text-green-500'}`}>
                      {student.conduct_score?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="text-white hover:bg-white/20">
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="font-bold text-lg">DOD Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-72 bg-white h-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-bold text-xl text-blue-600">DOD Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveNav(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeNav === item.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-white shadow-xl transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              D
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-gray-800">DOD Portal</h2>
                <p className="text-xs text-gray-500">Discipline Management</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition",
                activeNav === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full flex items-center gap-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {sidebarOpen && <span>Collapse</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300 pt-16 lg:pt-0",
        sidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between px-6 py-4 bg-white shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Director of Discipline</h1>
            <p className="text-gray-500">Manage student discipline and welfare</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={fetchInitialData} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="relative">
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                Notifications
              </span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                D
              </div>
              <div>
                <p className="font-medium">DOD Admin</p>
                <p className="text-xs text-gray-500">Director of Discipline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700"
                >
                  <CheckCircle className="w-5 h-5" />
                  {successMessage}
                  <button onClick={() => setSuccessMessage('')} className="ml-auto"><X className="w-4 h-4" /></button>
                </motion.div>
              )}
              
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {errorMessage}
                  <button onClick={() => setErrorMessage('')} className="ml-auto"><X className="w-4 h-4" /></button>
                </motion.div>
              )}

              <Tabs value={activeNav} onValueChange={setActiveNav} className="space-y-4">
                <div className="lg:hidden overflow-x-auto pb-2">
                  <TabsList className="flex gap-2 bg-transparent">
                    {navItems.slice(0, 5).map((item) => (
                      <TabsTrigger 
                        key={item.id} 
                        value={item.id}
                        className="flex items-center gap-2 px-3 py-2 whitespace-nowrap"
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value="dashboard">{renderDashboard()}</TabsContent>
                <TabsContent value="students">{renderStudents()}</TabsContent>
                <TabsContent value="incidents">{renderIncidents()}</TabsContent>
                <TabsContent value="leaves">{renderLeaves()}</TabsContent>
                <TabsContent value="conduct">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conduct Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setShowConductModal(true)} className="mb-4 gap-2">
                        <Plus className="w-4 h-4" /> Add Conduct Record
                      </Button>
                      <p className="text-gray-500 text-center py-8">Conduct records will be displayed here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="counseling">
                  <Card>
                    <CardHeader>
                      <CardTitle>Counseling Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setShowCounselingModal(true)} className="mb-4 gap-2">
                        <Plus className="w-4 h-4" /> Schedule Counseling
                      </Button>
                      <p className="text-gray-500 text-center py-8">Counseling sessions will be displayed here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="timetable">
                  <Card>
                    <CardHeader>
                      <CardTitle>Discipline Timetable</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setShowTimetableModal(true)} className="mb-4 gap-2">
                        <Plus className="w-4 h-4" /> Add Timetable Slot
                      </Button>
                      <p className="text-gray-500 text-center py-8">Timetable will be displayed here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="reports">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setShowReportModal(true)} className="mb-4 gap-2">
                        <FileBarChart className="w-4 h-4" /> Generate Report
                      </Button>
                      <p className="text-gray-500 text-center py-8">Reports will be displayed here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="sms">
                  <Card>
                    <CardHeader>
                      <CardTitle>SMS Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-center py-8">SMS functionality available through incident actions</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showIncidentModal} onOpenChange={setShowIncidentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Incident</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={newIncident.student_id} onValueChange={(v) => setNewIncident({...newIncident, student_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Incident Type</Label>
              <Select value={newIncident.incident_type} onValueChange={(v) => setNewIncident({...newIncident, incident_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="disciplinary">Disciplinary</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={newIncident.severity} onValueChange={(v) => setNewIncident({...newIncident, severity: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newIncident.description} onChange={(e) => setNewIncident({...newIncident, description: e.target.value})} placeholder="Describe the incident..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIncidentModal(false)}>Cancel</Button>
            <Button onClick={handleCreateIncident} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {leaves.filter(l => l.status === 'pending').map((leave) => (
              <div key={leave.id} className="p-4 border rounded-lg">
                <p className="font-medium">{leave.student_name}</p>
                <p className="text-sm text-gray-500">{leave.leave_type} - {leave.reason}</p>
                <p className="text-sm">{format(new Date(leave.start_time), 'dd/MM')} - {format(new Date(leave.end_time), 'dd/MM')}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="bg-green-500" onClick={() => handleApproveLeave(leave.id, 'approved')}>Approve</Button>
                  <Button size="sm" className="bg-red-500" onClick={() => handleApproveLeave(leave.id, 'rejected')}>Reject</Button>
                </div>
              </div>
            ))}
            {leaves.filter(l => l.status === 'pending').length === 0 && (
              <p className="text-center text-gray-500 py-4">No pending leave requests</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCounselingModal} onOpenChange={setShowCounselingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Counseling</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={newCounseling.student_id} onValueChange={(v) => setNewCounseling({...newCounseling, student_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Session Type</Label>
              <Select value={newCounseling.session_type} onValueChange={(v) => setNewCounseling({...newCounseling, session_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="parent">Parent Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={newCounseling.notes} onChange={(e) => setNewCounseling({...newCounseling, notes: e.target.value})} placeholder="Session notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCounselingModal(false)}>Cancel</Button>
            <Button onClick={handleCreateCounseling} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportConfig.report_type} onValueChange={(v) => setReportConfig({...reportConfig, report_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discipline_monthly">Monthly Discipline Report</SelectItem>
                  <SelectItem value="incident_summary">Incident Summary</SelectItem>
                  <SelectItem value="conduct_records">Conduct Records Report</SelectItem>
                  <SelectItem value="leave_analysis">Leave Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={reportConfig.period_start} onChange={(e) => setReportConfig({...reportConfig, period_start: e.target.value})} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={reportConfig.period_end} onChange={(e) => setReportConfig({...reportConfig, period_end: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
            <Button onClick={handleGenerateReport} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStudentDetailModal} onOpenChange={setShowStudentDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                  <p className="text-gray-500">{selectedStudent.student_code}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Trade</p>
                  <p className="font-medium">{selectedStudent.trade_name}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium">{selectedStudent.level_number}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Attendance</p>
                  <p className={`font-medium ${selectedStudent.attendance_rate < 80 ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedStudent.attendance_rate?.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Conduct Score</p>
                  <p className={`font-medium ${selectedStudent.conduct_score < 70 ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedStudent.conduct_score?.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handleSendSMS(selectedStudent.parent_phone || '+250000000000', `Dear parent, regarding ${selectedStudent.first_name}'s discipline at school.`)}>
                  <MessageSquare className="w-4 h-4" /> Send SMS
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => { setShowStudentDetailModal(false); setShowCounselingModal(true); }}>
                  <Heart className="w-4 h-4" /> Schedule Counseling
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudentDetailModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConductModal} onOpenChange={setShowConductModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Conduct Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={newConduct.student_id} onValueChange={(v) => setNewConduct({...newConduct, student_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conduct Type</Label>
              <Select value={newConduct.conduct_type} onValueChange={(v) => setNewConduct({...newConduct, conduct_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value=" commendation">Commendation</SelectItem>
                  <SelectItem value="improvement">Improvement Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newConduct.description} onChange={(e) => setNewConduct({...newConduct, description: e.target.value})} placeholder="Describe the conduct..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConductModal(false)}>Cancel</Button>
            <Button onClick={handleCreateConduct} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTimetableModal} onOpenChange={setShowTimetableModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Timetable Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Day</Label>
              <Select value={newTimetable.day_of_week} onValueChange={(v) => setNewTimetable({...newTimetable, day_of_week: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
                    <SelectItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Period</Label>
              <Input type="number" value={newTimetable.period} onChange={(e) => setNewTimetable({...newTimetable, period: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Activity Type</Label>
              <Select value={newTimetable.activity_type} onValueChange={(v) => setNewTimetable({...newTimetable, activity_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discipline_inspection">Discipline Inspection</SelectItem>
                  <SelectItem value="assembly">Morning Assembly</SelectItem>
                  <SelectItem value="counseling">Counseling Session</SelectItem>
                  <SelectItem value="meeting">DOD Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimetableModal(false)}>Cancel</Button>
            <Button onClick={() => { /* Add timetable handler */ setShowTimetableModal(false); }} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DODManagement;

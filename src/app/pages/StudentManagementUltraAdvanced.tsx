import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/app/config/apiBase';
import {
  Users, User, UserCheck, UserX, UserPlus, UserCog, UserShield, Users2,
  GraduationCap, BookOpen, Book, Calculator, FileText, FileSpreadsheet, FilePlus,
  Award, Medal, Trophy, Star, Heart, Shield, Bell, Mail, Phone, MessageSquare,
  Send, Download, Upload, Edit, Trash2, Eye, EyeOff, Lock, Unlock, CheckCircle, XCircle,
  AlertCircle, AlertTriangle, Info, Settings, RefreshCw, Search, Filter, FilterX,
  Plus, Minus, PlusCircle, MinusCircle, ChevronRight, ChevronDown, ChevronUp,
  Calendar, Clock, MapPin, Home, Briefcase, GraduationCap as GradIcon,
  ChartBar, ChartLine, PieChart, TrendingUp, TrendingDown, Activity,
  MessageCircle, Chat, Comment, Feedback, Notification, BellRing,
  PhoneCall, PhoneMissed, PhoneForwarded, Smartphone, SimCard,
  Parents, Family, Mother, Father, Guardian,
  Access, Permission, Authorization, Role, Security,
  African, Globe, World, Internet, Connection,
  PDF, File, Folder, Document, Clipboard, ClipboardCheck
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
import RwandaLocationSelector from '@/app/components/RwandaLocationSelector';

// ==================== TYPES ====================

interface Student {
  student_id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  email: string;
  phone: string;
  trade_code: string;
  trade_name: string;
  level_number: number;
  level_suffix: string;
  class_name: string;
  academic_year: string;
  enrollment_date: string;
  status: string;
  gpa: number;
  attendance_rate: number;
  conduct_score: number;
  parent_id: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_relation: string;
  address: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

interface ParentConnection {
  connection_id: string;
  student_id: string;
  student_name: string;
  parent_id: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  parent_type: string;
  access_granted_by: string;
  access_granted_by_role: string;
  access_granted_at: string;
  access_level: string;
  can_view_marks: boolean;
  can_view_attendance: boolean;
  can_view_discipline: boolean;
  can_view_report_cards: boolean;
  can_receive_sms: boolean;
  can_receive_email: boolean;
  can_receive_app_notifications: boolean;
  sms_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  app_notifications_enabled: boolean;
  notification_preferences: {
    marks_alerts: boolean;
    attendance_alerts: boolean;
    discipline_alerts: boolean;
    fees_alerts: boolean;
    events_alerts: boolean;
    general_alerts: boolean;
  };
  status: string;
  last_accessed_at: string;
  revoked_at: string;
  revoked_by: string;
  revocation_reason: string;
}

interface Notification {
  notification_id: string;
  type: string;
  title: string;
  message: string;
  sent_to: string;
  recipient_count: number;
  delivery_channel: string;
  status: string;
  sent_at: string;
  delivered_at: string;
  read_count: number;
}

interface SMSTemplate {
  template_id: string;
  name: string;
  content: string;
  type: string;
  is_active: boolean;
}

interface StudentActivity {
  activity_id: string;
  student_id: string;
  activity_type: string;
  description: string;
  timestamp: string;
  metadata: any;
}

interface StudentPerformance {
  student_id: string;
  term: string;
  academic_year: string;
  subjects: {
    subject_name: string;
    quiz_marks: number;
    midterm_marks: number;
    final_marks: number;
    total_marks: number;
    percentage: number;
    grade: string;
  }[];
  gpa: number;
  rank: number;
  attendance_percentage: number;
  conduct_score: number;
}

// ==================== COMPONENT ====================

interface StudentManagementUltraAdvancedProps {
  onNavigate?: (page: string) => void;
}

const StudentManagementUltraAdvanced: React.FC<StudentManagementUltraAdvancedProps> = ({ onNavigate }) => {
  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('students');

  // Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [parentConnections, setParentConnections] = useState<ParentConnection[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [smsTemplates, setSmsTemplates] = useState<SMSTemplate[]>([]);
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    parentsConnected: 0,
    activeParents: 0,
    smsSent: 0,
    notificationsSent: 0,
    avgGPA: 0,
    avgAttendance: 0
  });

  // Filter States
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [parentSearch, setParentSearch] = useState('');

  // Modal States
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showParentConnectionModal, setShowParentConnectionModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showSMSHistoryModal, setShowSMSHistoryModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [showAccessControlModal, setShowAccessControlModal] = useState(false);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ParentConnection | null>(null);

  // Form States
  const [newStudent, setNewStudent] = useState({
    first_name: '', last_name: '', gender: 'M', date_of_birth: '',
    email: '', phone: '', trade_code: '', level_number: '1',
    parent_name: '', parent_phone: '', parent_email: '',
    guardian_name: '', guardian_phone: '', guardian_relation: '',
    address: '', district: '', sector: '', cell: '', village: ''
  });

  const [parentAccessConfig, setParentAccessConfig] = useState({
    student_id: '', parent_name: '', parent_phone: '', parent_email: '', parent_type: 'father',
    access_level: 'full',
    can_view_marks: true,
    can_view_attendance: true,
    can_view_discipline: true,
    can_view_report_cards: true,
    can_receive_sms: true,
    can_receive_email: true,
    can_receive_app_notifications: true,
    marks_alerts: true,
    attendance_alerts: true,
    discipline_alerts: true,
    fees_alerts: false,
    events_alerts: true,
    general_alerts: true
  });

  const [smsConfig, setSmsConfig] = useState({
    type: 'general',
    template_id: '',
    title: '',
    message: '',
    recipients: 'all',
    specific_phones: '',
    send_via: 'african_talking',
    schedule_send: false,
    scheduled_time: ''
  });

  const [smsTemplate, setSmsTemplate] = useState({
    name: '', content: '', type: 'general'
  });

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [studentsRes, tradesRes, connectionsRes, notificationsRes, templatesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/global-sheets/students`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/trades`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/parent-linking/connections`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/notifications/sent`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/sms/templates`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const studentsData = await studentsRes.json();
      const tradesData = await tradesRes.json();
      const connectionsData = await connectionsRes.json();
      const notificationsData = await notificationsRes.json();
      const templatesData = await templatesRes.json();

      if (studentsData.success) setStudents(studentsData.students || []);
      if (tradesData.success) setTrades(tradesData.trades || []);
      if (connectionsData.success) setParentConnections(connectionsData.connections || []);
      if (notificationsData.success) setNotifications(notificationsData.notifications || []);
      if (templatesData.success) setSmsTemplates(templatesData.templates || []);

      calculateStats(
        studentsData.students || [],
        connectionsData.connections || [],
        notificationsData.notifications || []
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Byanze kubona amakuru');
    }
    setLoading(false);
  };

  const calculateStats = (studentsData: Student[], connectionsData: ParentConnection[], notificationsData: Notification[]) => {
    setStats({
      totalStudents: studentsData.length,
      activeStudents: studentsData.filter(s => s.status === 'active').length,
      parentsConnected: connectionsData.length,
      activeParents: connectionsData.filter(c => c.status === 'active').length,
      smsSent: notificationsData.filter(n => n.delivery_channel === 'sms').length,
      notificationsSent: notificationsData.length,
      avgGPA: studentsData.length > 0
        ? studentsData.reduce((acc, s) => acc + (s.gpa || 0), 0) / studentsData.length : 0,
      avgAttendance: studentsData.length > 0
        ? studentsData.reduce((acc, s) => acc + (s.attendance_rate || 0), 0) / studentsData.length : 0
    });
  };

  // ==================== HANDLERS ====================

  const handleAddStudent = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/global-sheets/students`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Umunyeshuri yanditswe neza!');
        setShowAddStudentModal(false);
        setNewStudent({
          first_name: '', last_name: '', gender: 'M', date_of_birth: '',
          email: '', phone: '', trade_code: '', level_number: '1',
          parent_name: '', parent_phone: '', parent_email: '',
          guardian_name: '', guardian_phone: '', guardian_relation: '',
          address: '', district: '', sector: '', cell: '', village: ''
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

  const handleGrantParentAccess = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/parent-linking/grant-access`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parentAccessConfig,
          notification_preferences: {
            marks_alerts: parentAccessConfig.marks_alerts,
            attendance_alerts: parentAccessConfig.attendance_alerts,
            discipline_alerts: parentAccessConfig.discipline_alerts,
            fees_alerts: parentAccessConfig.fees_alerts,
            events_alerts: parentAccessConfig.events_alerts,
            general_alerts: parentAccessConfig.general_alerts
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Uburyo bwo kubona amakuru bwatangiwe ababyeyi!');
        setShowParentConnectionModal(false);
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleUpdateParentAccess = async (connectionId: string, updates: Partial<ParentConnection>) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/parent-linking/connections/${connectionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setSuccessMessage('Uburyo bwateguwe!');
      fetchInitialData();
    } catch (error) {
      setErrorMessage('Byanze');
    }
  };

  const handleRevokeParentAccess = async (connectionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/parent-linking/revoke-access/${connectionId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuccessMessage('Uburyo bwategewe!');
      fetchInitialData();
    } catch (error) {
      setErrorMessage('Byanze');
    }
  };

  const handleSendSMS = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/sms/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...smsConfig,
          send_via: 'african_talking',
          delivery_channel: 'sms'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Ubutumwa bwoherejwe neza! (${data.sent_count} abantu)`);
        setShowSMSModal(false);
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  const handleAddSMSTemplate = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/sms/templates`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(smsTemplate)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Template yashyizwe!');
        setShowAddTemplateModal(false);
        fetchInitialData();
      } else {
        setErrorMessage(data.message || 'Byanze');
      }
    } catch (error) {
      setErrorMessage('Byanze');
    }
    setProcessing(false);
  };

  // ==================== HELPERS ====================

  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesTrade = selectedTrade === 'all' || student.trade_code === selectedTrade;
      const matchesLevel = selectedLevel === 'all' || student.level_number === parseInt(selectedLevel);
      const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
      const matchesSearch = searchQuery === '' ||
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parent_phone?.includes(searchQuery);
      return matchesTrade && matchesLevel && matchesStatus && matchesSearch;
    });
  };

  const getFilteredConnections = () => {
    return parentConnections.filter(conn => {
      const matchesSearch = parentSearch === '' ||
        conn.parent_name.toLowerCase().includes(parentSearch.toLowerCase()) ||
        conn.student_name.toLowerCase().includes(parentSearch.toLowerCase()) ||
        conn.parent_phone.includes(parentSearch);
      return matchesSearch;
    });
  };

  const getPermissionBadge = (enabled: boolean) => {
    return enabled 
      ? <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Yes</Badge>
      : <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" /> No</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
      suspended: 'bg-yellow-500',
      revoked: 'bg-red-500',
      pending: 'bg-blue-500'
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Tegereza...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            {successMessage}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <XCircle className="w-6 h-6" />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                <GradIcon className="w-10 h-10 text-blue-600" />
                Student Management System
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Complete Student Management with Parent Connections & African Talking SMS
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchInitialData} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Kuvugurura
              </Button>
              <Button onClick={() => setShowAddStudentModal(true)} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                <UserPlus className="w-4 h-4" />
                Add Student
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <Label>Trade:</Label>
                  <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Hitamo Trade" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Byose</SelectItem>
                      {trades.map((trade: any) => (
                        <SelectItem key={trade.trade_code} value={trade.trade_code}>{trade.trade_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <GradIcon className="w-5 h-5 text-indigo-600" />
                  <Label>Level:</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Byose</SelectItem>
                      {[1, 2, 3].map((l: any) => (
                        <SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  <Label>Status:</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Byose</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input placeholder="Shakisha umunyeshuri, code, phone..." className="pl-10"
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                <Button variant="outline" onClick={() => { setSelectedTrade('all'); setSelectedLevel('all'); setSelectedStatus('all'); setSearchQuery(''); }}>
                  <FilterX className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[
            { title: 'Abanyeshuri', value: stats.totalStudents, icon: Users, color: 'from-blue-500 to-indigo-500' },
            { title: 'Active', value: stats.activeStudents, icon: UserCheck, color: 'from-green-500 to-teal-500' },
            { title: 'Parents Connected', value: stats.parentsConnected, icon: Users2, color: 'from-purple-500 to-pink-500' },
            { title: 'Active Parents', value: stats.activeParents, icon: UserCog, color: 'from-indigo-500 to-blue-500' },
            { title: 'SMS Sent', value: stats.smsSent, icon: MessageSquare, color: 'from-cyan-500 to-blue-500' },
            { title: 'Notifications', value: stats.notificationsSent, icon: Bell, color: 'from-orange-500 to-red-500' },
            { title: 'Avg GPA', value: stats.avgGPA.toFixed(2), icon: Trophy, color: 'from-yellow-500 to-amber-500' },
            { title: 'Avg Attendance', value: `${stats.avgAttendance.toFixed(1)}%`, icon: Clock, color: 'from-pink-500 to-rose-500' }
          ].map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${stat.color} p-4 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="relative z-10">
                      <p className="text-white/90 text-xs mb-1">{stat.title}</p>
                      <p className="text-2xl font-black">{stat.value}</p>
                    </div>
                    <stat.icon className="absolute bottom-2 right-2 w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {[
            { icon: UserPlus, label: 'Add Student', color: 'from-blue-500 to-indigo-600', action: () => setShowAddStudentModal(true) },
            { icon: Users2, label: 'Parent Access', color: 'from-purple-500 to-pink-600', action: () => setShowParentConnectionModal(true) },
            { icon: MessageSquare, label: 'Send SMS', color: 'from-cyan-500 to-blue-600', action: () => setShowSMSModal(true) },
            { icon: Phone, label: 'SMS History', color: 'from-green-500 to-teal-600', action: () => setShowSMSHistoryModal(true) },
            { icon: Shield, label: 'Access Control', color: 'from-orange-500 to-red-600', action: () => setActiveTab('access') },
            { icon: FileText, label: 'Report Cards', color: 'from-indigo-500 to-purple-600', action: () => setActiveTab('reports') }
          ].map((action, index) => (
            <motion.div key={action.label} whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={action.action}
                className={`w-full h-24 bg-gradient-to-br ${action.color} hover:opacity-90 text-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 text-xs font-semibold`}>
                <action.icon className="w-6 h-6" />
                {action.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-lg rounded-xl p-2 border-2">
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" /> Students
            </TabsTrigger>
            <TabsTrigger value="parents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Users2 className="w-4 h-4 mr-2" /> Parents
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" /> Access Control
            </TabsTrigger>
            <TabsTrigger value="sms" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" /> SMS
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" /> Templates
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Reports
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Students Management</CardTitle>
                    <CardDescription>All registered students with details</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
                    <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />Import</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-100 to-indigo-100">
                      <TableHead className="font-bold">Code</TableHead>
                      <TableHead className="font-bold">Names</TableHead>
                      <TableHead className="font-bold">Trade/Level</TableHead>
                      <TableHead className="font-bold">Parent Phone</TableHead>
                      <TableHead className="font-bold">GPA</TableHead>
                      <TableHead className="font-bold">Attendance</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredStudents().slice(0, 50).map((student, idx) => (
                      <motion.tr key={student.student_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }} className="hover:bg-blue-50">
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
                              <div className={`h-full ${student.attendance_rate >= 90 ? 'bg-green-500' : student.attendance_rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${student.attendance_rate}%` }}></div>
                            </div>
                            <span className="text-xs">{student.attendance_rate?.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => { setSelectedStudent(student); setShowStudentDetailModal(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedStudent(student); setShowAccessControlModal(true); }}>
                              <Shield className="w-4 h-4" />
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

          {/* Parents Tab */}
          <TabsContent value="parents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parent Connections</CardTitle>
                    <CardDescription>Parents connected to students with access management</CardDescription>
                  </div>
                  <Button onClick={() => setShowParentConnectionModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Grant Access
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input placeholder="Shakisha ababyeyi..." value={parentSearch} onChange={(e) => setParentSearch(e.target.value)} />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-purple-100 to-pink-100">
                      <TableHead>Student</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Discipline</TableHead>
                      <TableHead>SMS</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredConnections().map((conn, idx) => (
                      <motion.tr key={conn.connection_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }} className="hover:bg-purple-50">
                        <TableCell className="font-semibold">{conn.student_name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{conn.parent_name}</p>
                            <p className="text-xs text-gray-500">{conn.parent_type}</p>
                          </div>
                        </TableCell>
                        <TableCell>{conn.parent_phone}</TableCell>
                        <TableCell>{getPermissionBadge(conn.can_view_marks)}</TableCell>
                        <TableCell>{getPermissionBadge(conn.can_view_attendance)}</TableCell>
                        <TableCell>{getPermissionBadge(conn.can_view_discipline)}</TableCell>
                        <TableCell>{getPermissionBadge(conn.can_receive_sms)}</TableCell>
                        <TableCell>{getStatusBadge(conn.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => { setSelectedConnection(conn); setShowAccessControlModal(true); }}>
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setSmsConfig({ ...smsConfig, specific_phones: conn.parent_phone }); setShowSMSModal(true); }}>
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRevokeParentAccess(conn.connection_id)}>
                              <UserX className="w-4 h-4" />
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

          {/* Access Control Tab */}
          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-500" />
                  Access Control Management
                </CardTitle>
                <CardDescription>Manage what parents can see and receive</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                    <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      View Permissions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Marks</span>
                        <Badge className="bg-green-500">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Attendance</span>
                        <Badge className="bg-green-500">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Discipline</span>
                        <Badge className="bg-yellow-500">Partial</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Report Cards</span>
                        <Badge className="bg-green-500">Enabled</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl">
                    <h4 className="font-bold text-cyan-700 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Notification Channels
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SMS (African Talking)</span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email</span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">App Notifications</span>
                        <Badge className="bg-yellow-500">Beta</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                    <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Alert Types
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Marks Alerts</span>
                        <Badge className="bg-green-500">On</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Attendance Alerts</span>
                        <Badge className="bg-green-500">On</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Discipline Alerts</span>
                        <Badge className="bg-green-500">On</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Fees Alerts</span>
                        <Badge className="bg-yellow-500">Optional</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Tab */}
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-cyan-500" />
                      African Talking SMS
                    </CardTitle>
                    <CardDescription>Send SMS notifications to parents</CardDescription>
                  </div>
                  <Button onClick={() => setShowSMSModal(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send SMS
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-cyan-100 to-blue-100">
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.slice(0, 20).map((notif, idx) => (
                      <motion.tr key={notif.notification_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }} className="hover:bg-cyan-50">
                        <TableCell><Badge variant="outline">{notif.type}</Badge></TableCell>
                        <TableCell className="font-semibold">{notif.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{notif.message}</TableCell>
                        <TableCell>{notif.recipient_count}</TableCell>
                        <TableCell>{getStatusBadge(notif.status)}</TableCell>
                        <TableCell>{new Date(notif.sent_at).toLocaleDateString()}</TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>SMS Templates</CardTitle>
                    <CardDescription>Pre-defined SMS templates for quick sending</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddTemplateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {smsTemplates.map((template, idx) => (
                    <motion.div key={template.template_id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }} className="border-2 rounded-xl p-4 hover:shadow-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold">{template.name}</h4>
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>{template.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.content}</p>
                      <Badge variant="outline">{template.type}</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Student Reports</CardTitle>
                <CardDescription>Generate and view student reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
                    <FileSpreadsheet className="w-8 h-8 mb-2" />
                    <h4 className="font-bold">Report Cards</h4>
                    <p className="text-sm opacity-80">Generate term reports</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl text-white">
                    <ChartBar className="w-8 h-8 mb-2" />
                    <h4 className="font-bold">Performance</h4>
                    <p className="text-sm opacity-80">Academic analysis</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                    <Users className="w-8 h-8 mb-2" />
                    <h4 className="font-bold">Parent Access</h4>
                    <p className="text-sm opacity-80">Access logs</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
                    <MessageSquare className="w-8 h-8 mb-2" />
                    <h4 className="font-bold">SMS History</h4>
                    <p className="text-sm opacity-80">Notification history</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Add Student Modal */}
      <Dialog open={showAddStudentModal} onOpenChange={setShowAddStudentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-blue-500" />
              Add New Student
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3">
              <h4 className="font-bold text-gray-700 mb-2">Personal Information</h4>
            </div>
            <div><Label>First Name</Label><Input value={newStudent.first_name} onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })} /></div>
            <div><Label>Last Name</Label><Input value={newStudent.last_name} onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })} /></div>
            <div>
              <Label>Gender</Label>
              <Select value={newStudent.gender} onValueChange={(v) => setNewStudent({ ...newStudent, gender: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Date of Birth</Label><Input type="date" value={newStudent.date_of_birth} onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} /></div>

            <div className="col-span-3 mt-4">
              <h4 className="font-bold text-gray-700 mb-2">Location Information</h4>
              <RwandaLocationSelector
                onLocationChange={(location) => setNewStudent({...newStudent, ...location})}
                required={true}
              />
            </div>

            <div className="col-span-3 mt-4"><h4 className="font-bold text-gray-700 mb-2">Academic Information</h4></div>
            <div>
              <Label>Trade</Label>
              <Select value={newStudent.trade_code} onValueChange={(v) => setNewStudent({ ...newStudent, trade_code: v })}>
                <SelectTrigger><SelectValue placeholder="Select Trade" /></SelectTrigger>
                <SelectContent>
                  {trades.map((trade: any) => (<SelectItem key={trade.trade_code} value={trade.trade_code}>{trade.trade_name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={newStudent.level_number} onValueChange={(v) => setNewStudent({ ...newStudent, level_number: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((l: any) => (<SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3 mt-4"><h4 className="font-bold text-gray-700 mb-2">Parent Information</h4></div>
            <div><Label>Parent Name</Label><Input value={newStudent.parent_name} onChange={(e) => setNewStudent({ ...newStudent, parent_name: e.target.value })} /></div>
            <div><Label>Parent Phone</Label><Input value={newStudent.parent_phone} onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })} /></div>
            <div><Label>Parent Email</Label><Input type="email" value={newStudent.parent_email} onChange={(e) => setNewStudent({ ...newStudent, parent_email: e.target.value })} /></div>

            <div className="col-span-3 mt-4"><h4 className="font-bold text-gray-700 mb-2">Guardian Information</h4></div>
            <div><Label>Guardian Name</Label><Input value={newStudent.guardian_name} onChange={(e) => setNewStudent({ ...newStudent, guardian_name: e.target.value })} /></div>
            <div><Label>Guardian Phone</Label><Input value={newStudent.guardian_phone} onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })} /></div>
            <div><Label>Relation</Label><Input value={newStudent.guardian_relation} onChange={(e) => setNewStudent({ ...newStudent, guardian_relation: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStudentModal(false)}>Cancel</Button>
            <Button onClick={handleAddStudent} disabled={processing}>{processing ? 'Processing...' : 'Add Student'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parent Access Modal */}
      <Dialog open={showParentConnectionModal} onOpenChange={setShowParentConnectionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users2 className="w-6 h-6 text-purple-500" />
              Grant Parent Access
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Student</Label>
              <PowerfulStudentSelector value={parentAccessConfig.student_id}
                onChange={(studentId: string) => setParentAccessConfig({ ...parentAccessConfig, student_id: studentId })}
                placeholder="Select student" />
            </div>
            <div><Label>Parent Name</Label><Input value={parentAccessConfig.parent_name} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, parent_name: e.target.value })} /></div>
            <div><Label>Parent Phone</Label><Input value={parentAccessConfig.parent_phone} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, parent_phone: e.target.value })} /></div>
            <div><Label>Parent Email</Label><Input value={parentAccessConfig.parent_email} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, parent_email: e.target.value })} /></div>
            <div>
              <Label>Parent Type</Label>
              <Select value={parentAccessConfig.parent_type} onValueChange={(v) => setParentAccessConfig({ ...parentAccessConfig, parent_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 mt-4"><h4 className="font-bold text-gray-700 mb-2">View Permissions</h4></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={parentAccessConfig.can_view_marks} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_view_marks: e.target.checked })} /><Label>Can View Marks</Label></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={parentAccessConfig.can_view_attendance} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_view_attendance: e.target.checked })} /><Label>Can View Attendance</Label></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={parentAccessConfig.can_view_discipline} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_view_discipline: e.target.checked })} /><Label>Can View Discipline</Label></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={parentAccessConfig.can_view_report_cards} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_view_report_cards: e.target.checked })} /><Label>Can View Report Cards</Label></div>
            <div className="col-span-2 mt-4"><h4 className="font-bold text-gray-700 mb-2">Notification Preferences</h4></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={parentAccessConfig.can_receive_sms} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_receive_sms: e.target.checked })} /><Label>Receive SMS</Label></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={parentAccessConfig.can_receive_email} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_receive_email: e.target.checked })} /><Label>Receive Email</Label></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={parentAccessConfig.can_receive_app_notifications} onChange={(e) => setParentAccessConfig({ ...parentAccessConfig, can_receive_app_notifications: e.target.checked })} /><Label>App Notifications</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParentConnectionModal(false)}>Cancel</Button>
            <Button onClick={handleGrantParentAccess} disabled={processing}>{processing ? 'Processing...' : 'Grant Access'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Modal */}
      <Dialog open={showSMSModal} onOpenChange={setShowSMSModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-cyan-500" />
              Send SMS via African Talking
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Message Type</Label>
              <Select value={smsConfig.type} onValueChange={(v) => setSmsConfig({ ...smsConfig, type: v })}>
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
            <div><Label>Title</Label><Input value={smsConfig.title} onChange={(e) => setSmsConfig({ ...smsConfig, title: e.target.value })} /></div>
            <div><Label>Message</Label><Textarea value={smsConfig.message} onChange={(e) => setSmsConfig({ ...smsConfig, message: e.target.value })} rows={4} /></div>
            <div>
              <Label>Recipients</Label>
              <Select value={smsConfig.recipients} onValueChange={(v) => setSmsConfig({ ...smsConfig, recipients: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parents</SelectItem>
                  <SelectItem value="specific">Specific Numbers</SelectItem>
                  <SelectItem value="trade">By Trade</SelectItem>
                  <SelectItem value="level">By Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {smsConfig.recipients === 'specific' && (
              <div><Label>Phone Numbers (comma separated)</Label><Input value={smsConfig.specific_phones} onChange={(e) => setSmsConfig({ ...smsConfig, specific_phones: e.target.value })} placeholder="+250...,+250..." /></div>
            )}
            <div className="p-3 bg-cyan-50 rounded-xl flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-600" />
              <span className="text-sm text-cyan-700">SMS will be sent via African Talking API</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSMSModal(false)}>Cancel</Button>
            <Button onClick={handleSendSMS} disabled={processing}><Send className="w-4 h-4 mr-2" />{processing ? 'Sending...' : 'Send SMS'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Template Modal */}
      <Dialog open={showAddTemplateModal} onOpenChange={setShowAddTemplateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-500" />
              Add SMS Template
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div><Label>Template Name</Label><Input value={smsTemplate.name} onChange={(e) => setSmsTemplate({ ...smsTemplate, name: e.target.value })} /></div>
            <div>
              <Label>Template Type</Label>
              <Select value={smsTemplate.type} onValueChange={(v) => setSmsTemplate({ ...smsTemplate, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="marks">Marks</SelectItem>
                  <SelectItem value="discipline">Discipline</SelectItem>
                  <SelectItem value="fees">Fees</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Template Content</Label><Textarea value={smsTemplate.content} onChange={(e) => setSmsTemplate({ ...smsTemplate, content: e.target.value })} rows={6} placeholder="Use {student_name}, {parent_name}, {marks}, {date}, etc." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTemplateModal(false)}>Cancel</Button>
            <Button onClick={handleAddSMSTemplate} disabled={processing}>{processing ? 'Processing...' : 'Add Template'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagementUltraAdvanced;

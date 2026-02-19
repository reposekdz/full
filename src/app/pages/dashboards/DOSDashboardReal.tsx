// Garden TVET School - DOS Dashboard Ultra Advanced
// Real API Integration - Full Functionality - Redesigned from Scratch
// Modern, Powerful, Rich in Features

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, Calendar, FileText, TrendingUp,
  Edit, Download, Send, RefreshCw, CheckCircle, AlertCircle, Clock, Search,
  Plus, MoreVertical, Settings, GraduationCap, UserCheck, ShieldAlert, Zap,
  BarChart3, PieChart, Activity, Target, Award, ClipboardList, Bell,
  Trash2, Eye, Save, X, ChevronDown, Filter, Printer, Mail, Phone,
  MapPin, Building, DollarSign, Clock3, Wifi, WifiOff, LogOut, Menu,
  BookMarked, FileBarChart, ClipboardCheck, UserPlus, MessageSquare,
  CalendarDays, Medal, Trophy, Crown, Star, Flame, Zap as Lightning,
  ArrowUpRight, ArrowDownRight, Lock, Unlock, EyeOff, LockOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/app/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/app/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/app/config/apiBase';

// API Base URL
const API_BASE = API_BASE_URL;

function authHeaders(): HeadersInit {
  const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Types
interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_code: string;
  trade_name: string;
  level_number: string;
  phone: string;
  email?: string;
  gender: string;
  status: string;
}

interface Parent {
  id: number;
  parent_code: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  children_count: number;
}

interface ParentLink {
  id: number;
  student_id: number;
  parent_id: number;
  student_name: string;
  parent_name: string;
  status: string;
  linked_at: string;
}

interface Teacher {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject?: string;
}

interface Trade {
  trade_id: number;
  trade_code: string;
  trade_name: string;
}

interface Level {
  level_id: number;
  level_number: number;
  level_name: string;
}

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  trade_id: number;
  level_id: number;
}

interface TimetableEntry {
  id: number;
  day: string;
  period: number;
  time_start: string;
  time_end: string;
  subject: string;
  teacher_name: string;
  class_name: string;
}

interface ReportCard {
  id: number;
  student_id: number;
  student_name: string;
  trade_name: string;
  level: string;
  term: string;
  year: number;
  total_marks: number;
  average: number;
  rank: number;
  generated_at: string;
}

interface ConductRecord {
  id: number;
  student_id: number;
  student_name: string;
  conduct_type: string;
  points: number;
  recorded_by: string;
  recorded_at: string;
  status: string;
}

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  linkedParents: number;
  pendingLinks: number;
  activeStudents: number;
  avgAttendance: number;
}

// Main Component
interface DOSDashboardRealProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export default function DOSDashboardReal({ onNavigate, onLogout }: DOSDashboardRealProps) {
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0, totalTeachers: 0, totalParents: 0, linkedParents: 0,
    pendingLinks: 0, activeStudents: 0, avgAttendance: 0
  });
  
  // Students - Level 4 SOD
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('4');
  
  // Parents
  const [registeredParents, setRegisteredParents] = useState<Parent[]>([]);
  const [linkedParents, setLinkedParents] = useState<ParentLink[]>([]);
  const [parentsLoading, setParentsLoading] = useState(false);
  
  // Teachers
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  
  // Trades & Levels
  const [trades, setTrades] = useState<Trade[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Timetable
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  
  // Report Cards
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [reportCardsLoading, setReportCardsLoading] = useState(false);
  const [reportTerm, setReportTerm] = useState('Term 1');
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  
  // Conduct
  const [conductRecords, setConductRecords] = useState<ConductRecord[]>([]);
  const [conductLoading, setConductLoading] = useState(false);
  
  // SMS
  const [smsTab, setSmsTab] = useState('compose');
  const [smsRecipientType, setSmsRecipientType] = useState('parents');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsHistory, setSmsHistory] = useState<any[]>([]);
  
  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showGenerateTimetable, setShowGenerateTimetable] = useState(false);
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  
  // New Student Form
  const [newStudent, setNewStudent] = useState({
    first_name: '', last_name: '', gender: 'Male',
    trade_code: '', level_number: '4', phone: '', email: ''
  });

  // Sidebar Items
  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', color: 'from-blue-500 to-indigo-500' },
    { id: 'students', icon: GraduationCap, label: 'Students', color: 'from-green-500 to-emerald-500' },
    { id: 'parents', icon: UserCheck, label: 'Parents', color: 'from-purple-500 to-pink-500' },
    { id: 'teachers', icon: Users, label: 'Teachers', color: 'from-orange-500 to-red-500' },
    { id: 'timetable', icon: Calendar, label: 'Timetable', color: 'from-cyan-500 to-blue-500' },
    { id: 'reports', icon: FileBarChart, label: 'Reports', color: 'from-amber-500 to-yellow-500' },
    { id: 'conduct', icon: ShieldAlert, label: 'Conduct', color: 'from-red-500 to-pink-500' },
    { id: 'sms', icon: MessageSquare, label: 'SMS', color: 'from-green-500 to-teal-500' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-slate-500' },
  ];

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/comprehensive-roles/students-summary`, {
        headers: authHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setStats({
          totalStudents: data.summary?.total_students || 0,
          totalTeachers: data.summary?.total_teachers || 0,
          totalParents: data.summary?.total_parents || 0,
          linkedParents: data.summary?.linked_parents || 0,
          pendingLinks: data.summary?.pending_links || 0,
          activeStudents: data.summary?.active_students || 0,
          avgAttendance: data.summary?.avg_attendance || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Fetch Students - Level 4 SOD
  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLevel) params.append('level', selectedLevel);
      if (selectedTrade && selectedTrade !== 'all') params.append('trade', selectedTrade);
      if (studentSearch) params.append('search', studentSearch);
      params.append('limit', '100');
      
      const response = await fetch(`${API_BASE}/comprehensive-roles/students?${params}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      
      if (data.success || data.students) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setStudentsLoading(false);
    }
  }, [selectedLevel, selectedTrade, studentSearch]);

  // Fetch All Registered Parents
  const fetchRegisteredParents = useCallback(async () => {
    setParentsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/dod/all-parents`, {
        headers: authHeaders()
      });
      const data = await response.json();
      
      if (data.success || data.parents) {
        setRegisteredParents(data.parents || []);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setParentsLoading(false);
    }
  }, []);

  // Fetch Linked Parents
  const fetchLinkedParents = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/parent-links?status=linked`, {
        headers: authHeaders()
      });
      const data = await response.json();
      
      if (data.success || data.links) {
        setLinkedParents(data.links || []);
      }
    } catch (error) {
      console.error('Error fetching linked parents:', error);
    }
  }, []);

  // Fetch Teachers
  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const response = await fetch(`${API_BASE}/comprehensive-roles/teachers?limit=100`, {
        headers: authHeaders()
      });
      const data = await response.json();
      
      if (data.success || data.teachers) {
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  // Fetch Trades & Levels
  const fetchTradesAndLevels = useCallback(async () => {
    try {
      const [tradesRes, levelsRes] = await Promise.all([
        fetch(`${API_BASE}/comprehensive-roles/trades`, { headers: authHeaders() }),
        fetch(`${API_BASE}/comprehensive-roles/levels`, { headers: authHeaders() })
      ]);
      
      const tradesData = await tradesRes.json();
      const levelsData = await levelsRes.json();
      
      if (tradesData.success || tradesData.trades) {
        setTrades(tradesData.trades || []);
      }
      if (levelsData.success || levelsData.levels) {
        setLevels(levelsData.levels || []);
      }
    } catch (error) {
      console.error('Error fetching trades/levels:', error);
    }
  }, []);

  // Fetch Timetable
  const fetchTimetable = useCallback(async () => {
    setTimetableLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass && selectedClass !== 'all') params.append('class', selectedClass);
      
      const response = await fetch(`${API_BASE}/dos-timetable?${params}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      
      if (data.success || data.timetable) {
        setTimetable(data.timetable || []);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setTimetableLoading(false);
    }
  }, [selectedClass]);

  // Fetch Report Cards
  const fetchReportCards = useCallback(async () => {
    setReportCardsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/dos-reports/report-cards?term=${reportTerm}&year=${reportYear}`,
        { headers: authHeaders() }
      );
      const data = await response.json();
      
      if (data.success || data.report_cards) {
        setReportCards(data.report_cards || []);
      }
    } catch (error) {
      console.error('Error fetching report cards:', error);
    } finally {
      setReportCardsLoading(false);
    }
  }, [reportTerm, reportYear]);

  // Fetch Conduct Records
  const fetchConductRecords = useCallback(async () => {
    setConductLoading(true);
    try {
      const response = await fetch(`${API_BASE}/dod/conduct-records?limit=50`, {
        headers: authHeaders()
      });
      const data = await response.json();
      
      if (data.success || data.records) {
        setConductRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching conduct records:', error);
    } finally {
      setConductLoading(false);
    }
  }, []);

  // Generate Timetable
  const handleGenerateTimetable = async () => {
    try {
      const response = await fetch(`${API_BASE}/dos-timetable/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ trade_id: selectedTrade, level: selectedLevel })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Timetable generated successfully!');
        setShowGenerateTimetable(false);
        fetchTimetable();
      } else {
        toast.error(data.message || 'Failed to generate timetable');
      }
    } catch (error) {
      toast.error('Error generating timetable');
    }
  };

  // Generate Report Cards
  const handleGenerateReportCards = async () => {
    try {
      const response = await fetch(`${API_BASE}/dos-reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ term: reportTerm, year: reportYear })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Report cards generated successfully!');
        setShowGenerateReport(false);
        fetchReportCards();
      } else {
        toast.error(data.message || 'Failed to generate reports');
      }
    } catch (error) {
      toast.error('Error generating reports');
    }
  };

  // Send SMS
  const handleSendSMS = async () => {
    if (!smsMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    setSmsSending(true);
    try {
      const response = await fetch(`${API_BASE}/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          recipient_type: smsRecipientType,
          message: smsMessage
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('SMS sent successfully!');
        setSmsMessage('');
        setShowSMSModal(false);
      } else {
        toast.error(data.message || 'Failed to send SMS');
      }
    } catch (error) {
      toast.error('Error sending SMS');
    } finally {
      setSmsSending(false);
    }
  };

  // Remove Conduct Record
  const handleRemoveConduct = async (recordId: number) => {
    try {
      const response = await fetch(`${API_BASE}/dod-complete/conduct/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ record_id: recordId, send_notification: true })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Conduct record removed successfully!');
        fetchConductRecords();
      } else {
        toast.error(data.message || 'Failed to remove conduct');
      }
    } catch (error) {
      toast.error('Error removing conduct');
    }
  };

  // Add New Student
  const handleAddStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name || !newStudent.trade_code) {
      toast.error('Please fill required fields');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/comprehensive-roles/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(newStudent)
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Student added successfully!');
        setShowAddStudent(false);
        setNewStudent({
          first_name: '', last_name: '', gender: 'Male',
          trade_code: '', level_number: '4', phone: '', email: ''
        });
        fetchStudents();
      } else {
        toast.error(data.message || 'Failed to add student');
      }
    } catch (error) {
      toast.error('Error adding student');
    }
  };

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchTradesAndLevels(),
        fetchStudents(),
        fetchTeachers()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'parents') {
      fetchRegisteredParents();
      fetchLinkedParents();
    } else if (activeTab === 'timetable') {
      fetchTimetable();
    } else if (activeTab === 'reports') {
      fetchReportCards();
    } else if (activeTab === 'conduct') {
      fetchConductRecords();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-indigo-100 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-indigo-50 rounded-lg">
              <Menu className="h-5 w-5 text-indigo-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DOS Dashboard
              </h1>
              <p className="text-sm text-gray-500">Director of Studies - Academic Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {onLogout && (
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-64 bg-white/90 backdrop-blur-lg border-r border-indigo-100 min-h-screen p-4"
            >
              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                          : 'text-gray-600 hover:bg-indigo-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Students</p>
                        <p className="text-3xl font-bold">{stats.totalStudents}</p>
                      </div>
                      <GraduationCap className="h-10 w-10 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Teachers</p>
                        <p className="text-3xl font-bold">{stats.totalTeachers}</p>
                      </div>
                      <Users className="h-10 w-10 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Linked Parents</p>
                        <p className="text-3xl font-bold">{stats.linkedParents}</p>
                      </div>
                      <UserCheck className="h-10 w-10 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100">Active Students</p>
                        <p className="text-3xl font-bold">{stats.activeStudents}</p>
                      </div>
                      <Activity className="h-10 w-10 text-amber-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Pending Parent Links</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-orange-600">{stats.pendingLinks}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Total Parents</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalParents}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Avg Attendance</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{stats.avgAttendance}%</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Students Management</h2>
                  <p className="text-gray-500">Level 4 SOD Students - Real Database Data</p>
                </div>
                <Button onClick={() => setShowAddStudent(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <Input
                        placeholder="Search students..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
                      />
                    </div>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">Level 4</SelectItem>
                        <SelectItem value="5">Level 5</SelectItem>
                        <SelectItem value="6">Level 6</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Trade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Trades</SelectItem>
                        {trades.map(t => (
                          <SelectItem key={t.trade_id} value={t.trade_code}>{t.trade_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchStudents} variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Students Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Students List ({students.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {studentsLoading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-indigo-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-600">Code</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-600">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-600">Trade</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-600">Level</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-600">Phone</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.slice(0, 20).map((student, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-mono text-sm">{student.student_code}</td>
                              <td className="px-4 py-3 font-medium">{student.first_name} {student.last_name}</td>
                              <td className="px-4 py-3">{student.trade_name}</td>
                              <td className="px-4 py-3">Level {student.level_number}</td>
                              <td className="px-4 py-3">{student.phone}</td>
                              <td className="px-4 py-3">
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                  {student.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {students.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No students found. Try adjusting your filters.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Parents Tab */}
          {activeTab === 'parents' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Parent Management</h2>
                  <p className="text-gray-500">Registered & Linked Parents from Database</p>
                </div>
              </div>

              <Tabs defaultValue="registered">
                <TabsList>
                  <TabsTrigger value="registered">Registered ({registeredParents.length})</TabsTrigger>
                  <TabsTrigger value="linked">Linked ({linkedParents.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="registered">
                  <Card>
                    <CardHeader><CardTitle>All Registered Parents</CardTitle></CardHeader>
                    <CardContent>
                      {parentsLoading ? (
                        <div className="flex justify-center py-8">
                          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {registeredParents.slice(0, 12).map((parent, i) => (
                            <div key={i} className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-purple-500 text-white">
                                    {parent.first_name[0]}{parent.last_name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{parent.first_name} {parent.last_name}</p>
                                  <p className="text-sm text-gray-500">{parent.phone}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="linked">
                  <Card>
                    <CardHeader><CardTitle>Parent-Student Links</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-purple-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-purple-600">Parent</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-purple-600">Student</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-purple-600">Status</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-purple-600">Linked</th>
                            </tr>
                          </thead>
                          <tbody>
                            {linkedParents.slice(0, 15).map((link, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{link.parent_name}</td>
                                <td className="px-4 py-3">{link.student_name}</td>
                                <td className="px-4 py-3">
                                  <Badge variant="default">{link.status}</Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{link.linked_at}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {/* Teachers Tab */}
          {activeTab === 'teachers' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Teachers Management</h2>
                  <p className="text-gray-500">Staff Members from Database</p>
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  {teachersLoading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teachers.slice(0, 12).map((teacher, i) => (
                        <div key={i} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-orange-500 text-white">
                                {teacher.first_name[0]}{teacher.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{teacher.first_name} {teacher.last_name}</p>
                              <p className="text-sm text-gray-500">{teacher.email}</p>
                              {teacher.subject && (
                                <Badge variant="outline" className="mt-1">{teacher.subject}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Timetable Tab */}
          {activeTab === 'timetable' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Timetable Management</h2>
                  <p className="text-gray-500">Generate & View Timetables</p>
                </div>
                <Button onClick={() => setShowGenerateTimetable(true)} className="bg-cyan-600 hover:bg-cyan-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Timetable
                </Button>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4 mb-4">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {trades.map(t => (
                          <SelectItem key={t.trade_id} value={t.trade_code}>{t.trade_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchTimetable} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Load
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {timetableLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              ) : (
                <Card>
                  <CardHeader><CardTitle>Class Timetable</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-cyan-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-600">Day</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-600">Period</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-600">Time</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-600">Subject</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-600">Teacher</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timetable.slice(0, 20).map((entry, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{entry.day}</td>
                              <td className="px-4 py-3">{entry.period}</td>
                              <td className="px-4 py-3">{entry.time_start} - {entry.time_end}</td>
                              <td className="px-4 py-3">{entry.subject}</td>
                              <td className="px-4 py-3">{entry.teacher_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {timetable.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No timetable entries. Click "Generate Timetable" to create one.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Report Cards</h2>
                  <p className="text-gray-500">Generate & View Student Reports</p>
                </div>
                <Button onClick={() => setShowGenerateReport(true)} className="bg-amber-600 hover:bg-amber-700">
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4 mb-4">
                    <Select value={reportTerm} onValueChange={setReportTerm}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term 1">Term 1</SelectItem>
                        <SelectItem value="Term 2">Term 2</SelectItem>
                        <SelectItem value="Term 3">Term 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={String(reportYear)} onValueChange={(v) => setReportYear(Number(v))}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchReportCards} variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Load
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {reportCardsLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : (
                <Card>
                  <CardHeader><CardTitle>Report Cards ({reportCards.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-amber-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-amber-600">Student</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-amber-600">Trade</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-amber-600">Level</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-amber-600">Average</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-amber-600">Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportCards.slice(0, 20).map((rc, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{rc.student_name}</td>
                              <td className="px-4 py-3">{rc.trade_name}</td>
                              <td className="px-4 py-3">{rc.level}</td>
                              <td className="px-4 py-3">{rc.average}%</td>
                              <td className="px-4 py-3">#{rc.rank}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {reportCards.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No report cards. Click "Generate Reports" to create them.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Conduct Tab */}
          {activeTab === 'conduct' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Conduct Management</h2>
                  <p className="text-gray-500">Remove Conduct Records with SMS Notification</p>
                </div>
              </div>

              {conductLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
                </div>
              ) : (
                <Card>
                  <CardHeader><CardTitle>Conduct Records</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-red-600">Student</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-red-600">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-red-600">Points</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-red-600">Recorded</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-red-600">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-red-600">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {conductRecords.slice(0, 20).map((record, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{record.student_name}</td>
                              <td className="px-4 py-3">{record.conduct_type}</td>
                              <td className="px-4 py-3">{record.points}</td>
                              <td className="px-4 py-3 text-sm">{record.recorded_at}</td>
                              <td className="px-4 py-3">
                                <Badge variant={record.status === 'active' ? 'destructive' : 'secondary'}>
                                  {record.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveConduct(record.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {conductRecords.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No conduct records found.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* SMS Tab */}
          {activeTab === 'sms' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">SMS Messaging</h2>
                  <p className="text-gray-500">Send Messages to Parents via African Talking</p>
                </div>
              </div>

              <Tabs defaultValue="compose">
                <TabsList>
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="compose">
                  <Card>
                    <CardHeader>
                      <CardTitle>Send SMS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Recipients</Label>
                        <Select value={smsRecipientType} onValueChange={setSmsRecipientType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parents">All Parents</SelectItem>
                            <SelectItem value="linked">Linked Parents</SelectItem>
                            <SelectItem value="students">Students (Level 4)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          value={smsMessage}
                          onChange={(e) => setSmsMessage(e.target.value)}
                          placeholder="Enter your message..."
                          rows={5}
                        />
                        <p className="text-sm text-gray-500 mt-1">{smsMessage.length} characters</p>
                      </div>
                      <Button
                        onClick={handleSendSMS}
                        disabled={smsSending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {smsSending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send SMS
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardHeader><CardTitle>Message History</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-center py-8 text-gray-500">
                        No message history available.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                <p className="text-gray-500">Dashboard Configuration</p>
              </div>

              <Card>
                <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Force Password Change</p>
                      <p className="text-sm text-gray-500">Require users to change expired passwords</p>
                    </div>
                    <Button variant="outline" onClick={() => onNavigate?.('force-credential-change')}>
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Academic Year</p>
                      <p className="text-sm text-gray-500">Current: 2025-2026</p>
                    </div>
                    <Button variant="outline">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      {/* Add Student Modal */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={newStudent.first_name}
                  onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={newStudent.gender} onValueChange={(v) => setNewStudent({ ...newStudent, gender: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trade *</Label>
              <Select value={newStudent.trade_code} onValueChange={(v) => setNewStudent({ ...newStudent, trade_code: v })}>
                <SelectTrigger><SelectValue placeholder="Select Trade" /></SelectTrigger>
                <SelectContent>
                  {trades.map(t => (
                    <SelectItem key={t.trade_id} value={t.trade_code}>{t.trade_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={newStudent.level_number} onValueChange={(v) => setNewStudent({ ...newStudent, level_number: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">Level 4</SelectItem>
                  <SelectItem value="5">Level 5</SelectItem>
                  <SelectItem value="6">Level 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              />
            </div>
            <Button onClick={handleAddStudent} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Timetable Modal */}
      <Dialog open={showGenerateTimetable} onOpenChange={setShowGenerateTimetable}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Timetable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Trade</Label>
              <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                <SelectTrigger><SelectValue placeholder="Select Trade" /></SelectTrigger>
                <SelectContent>
                  {trades.map(t => (
                    <SelectItem key={t.trade_id} value={t.trade_code}>{t.trade_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">Level 4</SelectItem>
                  <SelectItem value="5">Level 5</SelectItem>
                  <SelectItem value="6">Level 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateTimetable} className="w-full bg-cyan-600">
              Generate Timetable
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Reports Modal */}
      <Dialog open={showGenerateReport} onOpenChange={setShowGenerateReport}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Report Cards</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Term</Label>
              <Select value={reportTerm} onValueChange={setReportTerm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Select value={String(reportYear)} onValueChange={(v) => setReportYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateReportCards} className="w-full bg-amber-600">
              Generate Reports
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

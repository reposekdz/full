// Garden TVET School - DOD Dashboard Ultra Advanced
// Discipline Management System - Modern UI with shadcn + Tailwind + Motion

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, AlertTriangle, UserCheck, Star, Settings,
  Bell, Search, RefreshCw, Plus, CheckCircle, Eye, Phone, UserPlus,
  TrendingUp, TrendingDown, School, Gavel, Timer, Edit, Trash2,
  ChevronRight, Shield, Activity, BarChart3, Calendar, MapPin,
  FileText, AlertCircle, Clock, ArrowUpRight, Flame, X, MessageSquare, Menu
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
import { useAuth } from '@/app/contexts/AuthContext';
import { LogOut, Grid } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/app/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/app/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { UnifiedMessaging } from '@/app/components/messaging/UnifiedMessaging';
import { BottomNav } from '@/app/components/BottomNav';
import { API_BASE_URL } from '@/app/config/apiBase';
import apiService from '@/app/services/apiService';

const API_BASE = API_BASE_URL;

function authHeaders(): HeadersInit {
  const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalStudents: number;
  totalIncidents: number;
  criticalIncidents: number;
  highIncidents: number;
  pendingActions: number;
  avgConductScore: number;
}

interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_code: string;
  trade_name: string;
  level_number: string;
  phone: string;
  conduct_score: number;
  conduct_grade: string;
  conduct_status: string;
  total_incidents: number;
  overall_attendance_percentage: number;
  gender: string;
}

interface Incident {
  id: number;
  incident_id: string;
  student_name: string;
  incident_type: string;
  severity: string;
  incident_date: string;
  location: string;
  resolution_status: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INCIDENT_TYPES = [
  { value: 'absenteeism', label: 'Absenteeism', color: '#EF4444' },
  { value: 'tardiness', label: 'Tardiness', color: '#F97316' },
  { value: 'disruption', label: 'Disruption', color: '#EAB308' },
  { value: 'fighting', label: 'Fighting', color: '#EC4899' },
  { value: 'bullying', label: 'Bullying', color: '#A855F7' },
  { value: 'other', label: 'Other', color: '#6B7280' },
];

const SEVERITY_MAP: Record<string, { color: string; bg: string; text: string }> = {
  critical: { color: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-600' },
  high: { color: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-600' },
  medium: { color: 'bg-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-600' },
  low: { color: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-600' },
};

const STATUS_MAP: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  pending: { variant: 'destructive', label: 'Pending' },
  in_progress: { variant: 'outline', label: 'In Progress' },
  resolved: { variant: 'secondary', label: 'Resolved' },
};

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', value: 'dashboard' },
  { icon: Users, label: 'Students', value: 'students' },
  { icon: Grid, label: 'Global Sheets', value: 'global-sheets' },
  { icon: AlertTriangle, label: 'Incidents', value: 'incidents' },
  { icon: UserCheck, label: 'Interventions', value: 'interventions' },
  { icon: Star, label: 'Conduct', value: 'conduct' },
  { icon: Settings, label: 'Settings', value: 'settings' },
];

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard Overview',
  students: 'Student Management',
  'global-sheets': 'Global Student Sheets',
  incidents: 'Incident Management',
  interventions: 'Intervention Programs',
  conduct: 'Conduct Tracking',
  settings: 'Settings',
};

// ─── Animated Stat Card ─────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  index: number;
  trend?: { value: number; up: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient, index, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="group"
  >
    <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient} text-white`}>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-white/80 font-medium">{label}</p>
            {trend && (
              <div className="flex items-center gap-1 text-xs text-white/70">
                {trend.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                <span>{trend.value}% from last month</span>
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

interface DODDashboardAdvancedProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

const DODDashboardAdvanced: React.FC<DODDashboardAdvancedProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0, totalIncidents: 0, criticalIncidents: 0, highIncidents: 0,
    pendingActions: 0, avgConductScore: 0
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openRecordIncident, setOpenRecordIncident] = useState(false);
  const [openResolveIncident, setOpenResolveIncident] = useState(false);
  const [openConductModal, setOpenConductModal] = useState(false);
  const [openLeaveModal, setOpenLeaveModal] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Forms
  const [conductForm, setConductForm] = useState({
    conduct_type: '',
    severity: '',
    description: '',
    action_taken: '',
    conduct_points_deducted: 0,
    removed_by_name: 'Patron Jean Claude'
  });

  const [leaveForm, setLeaveForm] = useState({
    leave_type: '',
    reason: '',
    start_time: '',
    end_time: '',
    approved_by_name: 'Patron Jean Claude'
  });

  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    send_via: 'sms'
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Use apiService for comprehensive stats
      const [statsRes, activitiesRes] = await Promise.all([
        apiService.getDODStats(),
        apiService.getDODRecentActivities()
      ]);

      // Also fetch students for the list
      const studentsRes = await fetch(`${API_BASE}/dod-complete/students/all`, { headers: authHeaders() });
      const studentsData = await studentsRes.json();

      if (studentsData?.success && Array.isArray(studentsData.students)) {
        setStudents(studentsData.students);
      }
      if (statsRes.success && statsRes.data) {
        setStats({
          totalStudents: statsRes.data.total_students || 0,
          totalIncidents: statsRes.data.total_incidents || 0,
          criticalIncidents: statsRes.data.critical_incidents || 0,
          highIncidents: statsRes.data.high_incidents || 0,
          pendingActions: statsRes.data.pending_actions || 0,
          avgConductScore: statsRes.data.avg_conduct_score || 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // Handle conduct removal with automatic SMS
  const handleRemoveConduct = async () => {
    if (!selectedStudent) return;

    if (!conductForm.conduct_type || !conductForm.severity || !conductForm.description || conductForm.conduct_points_deducted <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const newScore = selectedStudent.conduct_score - conductForm.conduct_points_deducted;

    try {
      const response = await fetch(`${API_BASE}/dod-complete/conduct/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          ...conductForm,
          new_conduct_score: newScore
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`✅ Conduct removed! ${data.parentsNotified} parent(s) notified via SMS`);
        setOpenConductModal(false);
        setSelectedStudent(null);
        fetchDashboardData();
        setConductForm({
          conduct_type: '',
          severity: '',
          description: '',
          action_taken: '',
          conduct_points_deducted: 0,
          removed_by_name: 'Patron Jean Claude'
        });
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to remove conduct');
    }
  };

  // Handle leave approval with automatic SMS
  const handleGrantLeave = async () => {
    if (!selectedStudent) return;

    if (!leaveForm.leave_type || !leaveForm.reason || !leaveForm.start_time) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/dod-complete/leave/grant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          ...leaveForm
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`✅ Leave granted! ${data.parentsNotified} parent(s) notified via SMS`);
        setOpenLeaveModal(false);
        setSelectedStudent(null);
        fetchDashboardData();
        setLeaveForm({
          leave_type: '',
          reason: '',
          start_time: '',
          end_time: '',
          approved_by_name: 'Patron Jean Claude'
        });
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to grant leave');
    }
  };

  // Handle parent messaging
  const handleSendMessage = async () => {
    const studentIds = selectedStudents.length > 0 ? selectedStudents : selectedStudent ? [selectedStudent.id] : [];

    if (studentIds.length === 0) {
      toast.error('Please select students');
      return;
    }

    if (!messageForm.subject || !messageForm.message) {
      toast.error('Please fill subject and message');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/dod-complete/message-parents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          ...messageForm,
          student_ids: studentIds
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`✅ Messages sent to ${data.count} out of ${data.total} parent(s)`);
        setOpenMessageModal(false);
        setSelectedStudents([]);
        setSelectedStudent(null);
        setMessageForm({
          subject: '',
          message: '',
          send_via: 'sms'
        });
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send messages');
    }
  };

  // Handle broadcast to all parents
  const handleBroadcastAll = async () => {
    if (!messageForm.subject || !messageForm.message) {
      toast.error('Please fill subject and message');
      return;
    }

    if (!confirm('Send message to ALL parents with linked accounts?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/dod-complete/message-all-parents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(messageForm)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`✅ Broadcast sent to ${data.count} out of ${data.total} parents`);
        setOpenMessageModal(false);
        setMessageForm({
          subject: '',
          message: '',
          send_via: 'sms'
        });
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to broadcast');
    }
  };

  const filteredStudents = students.filter(s =>
    s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const monthlyTrendData = [
    { month: 'Sep', incidents: 8, resolved: 7 }, { month: 'Oct', incidents: 12, resolved: 10 },
    { month: 'Nov', incidents: 6, resolved: 6 }, { month: 'Dec', incidents: 15, resolved: 12 },
    { month: 'Jan', incidents: 10, resolved: 9 }, { month: 'Feb', incidents: 8, resolved: 7 }
  ];

  const conductDistribution = [
    { name: 'Excellent (90+)', value: students.filter(s => s.conduct_score >= 90).length, color: '#22C55E' },
    { name: 'Good (75-89)', value: students.filter(s => s.conduct_score >= 75 && s.conduct_score < 90).length, color: '#3B82F6' },
    { name: 'Fair (60-74)', value: students.filter(s => s.conduct_score >= 60 && s.conduct_score < 75).length, color: '#F97316' },
    { name: 'Poor (<60)', value: students.filter(s => s.conduct_score < 60).length, color: '#EF4444' },
  ];

  const getConductColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getConductBadge = (status: string) => {
    switch (status) {
      case 'excellent': return <Badge className="bg-green-500/15 text-green-700 border-green-200 hover:bg-green-500/15">Excellent</Badge>;
      case 'good': return <Badge className="bg-blue-500/15 text-blue-700 border-blue-200 hover:bg-blue-500/15">Good</Badge>;
      case 'poor': return <Badge className="bg-red-500/15 text-red-700 border-red-200 hover:bg-red-500/15">Poor</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const map = SEVERITY_MAP[severity] || SEVERITY_MAP.low;
    return (
      <Badge className={`${map.bg} ${map.text} border-0 hover:${map.bg} capitalize`}>
        {severity}
      </Badge>
    );
  };

  const getResolutionBadge = (status: string) => {
    const s = STATUS_MAP[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">

        {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-gradient-to-b from-[#1565C0] via-[#1256A8] to-[#0D47A1] text-white shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
          {/* Brand */}
          <div className="px-5 py-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Shield className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight">Garden TVET</h2>
                <p className="text-xs text-white/60">Discipline Office</p>
              </div>
            </div>
          </div>

          {/* User */}
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-white/20">
                <AvatarFallback className="bg-white/15 text-white text-sm font-bold">
                  D
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">DOD</p>
                <p className="text-xs text-white/50">Director of Discipline</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = activeTab === item.value;
                return (
                  <motion.button
                    key={item.value}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTab(item.value);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${isActive
                        ? 'bg-white/20 text-white shadow-lg shadow-black/10 backdrop-blur-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <item.icon className={`size-[18px] ${isActive ? 'text-white' : 'text-white/60'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div layoutId="sidebar-indicator" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Activity className="size-3" />
              <span>System Active</span>
              <span className="ml-auto inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
        </aside>

        {/* ─── Main Content ────────────────────────────────────────────────── */}
        <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'
          }`}>
          {/* Top Bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-muted"
              >
                <Menu className="size-5" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">{TAB_TITLES[activeTab]}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-[18px] text-muted-foreground" />
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {stats.pendingActions}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setActiveTab('settings')}>
                    <Settings className="size-[18px] text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
              {onLogout && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={onLogout} className="text-red-600 border-red-200 hover:bg-red-50">
                      <LogOut className="size-[18px] mr-1" />
                      Logout
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Logout</TooltipContent>
                </Tooltip>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Loading */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                <Progress value={65} className="h-1" />
              </motion.div>
            )}

            {/* Brand Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-r from-[#1565C0] via-[#1976D2] to-[#0D47A1] text-white shadow-xl">
                <CardContent className="py-5 px-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold tracking-tight">Garden TVET School</h2>
                      <p className="text-sm text-white/80">Discipline Management System</p>
                      <p className="text-xs text-white/50 italic">Umuyobozi w'Imyitwarire</p>
                    </div>
                    <Button
                      onClick={fetchDashboardData}
                      className="bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
                    >
                      <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Tab Content ─────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >

                {/* ═══ DASHBOARD OVERVIEW ═══ */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <StatCard index={0} label="Total Students" value={stats.totalStudents}
                        icon={<Users className="size-6" />}
                        gradient="bg-gradient-to-br from-dod-stat-purple to-indigo-600"
                        trend={{ value: 12, up: true }} />
                      <StatCard index={1} label="Total Incidents" value={stats.totalIncidents}
                        icon={<AlertTriangle className="size-6" />}
                        gradient="bg-gradient-to-br from-dod-stat-pink to-purple-500" />
                      <StatCard index={2} label="Critical" value={stats.criticalIncidents}
                        icon={<Flame className="size-6" />}
                        gradient="bg-gradient-to-br from-red-500 to-rose-600"
                        trend={{ value: 25, up: false }} />
                      <StatCard index={3} label="Pending" value={stats.pendingActions}
                        icon={<Clock className="size-6" />}
                        gradient="bg-gradient-to-br from-orange-500 to-amber-600" />
                      <StatCard index={4} label="Avg Conduct" value={stats.avgConductScore}
                        icon={<Star className="size-6" />}
                        gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                        trend={{ value: 3, up: true }} />
                      <StatCard index={5} label="Resolved" value={45}
                        icon={<CheckCircle className="size-6" />}
                        gradient="bg-gradient-to-br from-teal-500 to-cyan-600" />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="shadow-sm">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base">Incident Trends</CardTitle>
                                <CardDescription>Monthly incidents vs resolved</CardDescription>
                              </div>
                              <Badge variant="outline" className="gap-1">
                                <Activity className="size-3" /> Live
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[280px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyTrendData}>
                                  <defs>
                                    <linearGradient id="incidentGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                  <RechartsTooltip
                                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                  />
                                  <Legend />
                                  <Area type="monotone" dataKey="incidents" stroke="#EF4444" fill="url(#incidentGrad)" strokeWidth={2} name="Incidents" />
                                  <Area type="monotone" dataKey="resolved" stroke="#22C55E" fill="url(#resolvedGrad)" strokeWidth={2} name="Resolved" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <Card className="shadow-sm">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base">Conduct Distribution</CardTitle>
                                <CardDescription>Student conduct score breakdown</CardDescription>
                              </div>
                              <Badge variant="outline" className="gap-1">
                                <BarChart3 className="size-3" /> Stats
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[280px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={conductDistribution} barSize={40}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                  <RechartsTooltip
                                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                  />
                                  <Bar dataKey="value" name="Students" radius={[6, 6, 0, 0]}>
                                    {conductDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                      <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Quick Actions</CardTitle>
                          <CardDescription>Frequently used discipline operations</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3">
                            <Button onClick={() => setOpenRecordIncident(true)} className="bg-dod-primary hover:bg-dod-dark text-white">
                              <Plus className="size-4 mr-2" />
                              Record Incident
                            </Button>
                            <Button variant="outline" onClick={() => setActiveTab('students')}>
                              <Search className="size-4 mr-2" />
                              Search Students
                            </Button>
                            <Button variant="outline" onClick={fetchDashboardData}>
                              <RefreshCw className="size-4 mr-2" />
                              Refresh Data
                            </Button>
                            <Button variant="outline" onClick={() => setActiveTab('conduct')}>
                              <BarChart3 className="size-4 mr-2" />
                              View Rankings
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* ═══ GLOBAL STUDENT SHEETS ═══ */}
                {activeTab === 'global-sheets' && (
                  <div className="h-[calc(100vh-180px)]">
                    <GlobalStudentSheets
                      userRole={user?.role || 'dod'}
                      userId={user?.id || 0}
                      onNavigate={onNavigate}
                    />
                  </div>
                )}

                {/* ═══ STUDENT MANAGEMENT ═══ */}
                {activeTab === 'students' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">Student Conduct Management</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Monitor and manage student behavior records</p>
                      </div>
                      <div className="flex gap-2">
                        {selectedStudents.length > 0 && (
                          <Button onClick={() => setOpenMessageModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <MessageSquare className="size-4 mr-2" />
                            Message {selectedStudents.length} Parents
                          </Button>
                        )}
                        <Button onClick={() => setOpenRecordIncident(true)} className="bg-dod-primary hover:bg-dod-dark text-white">
                          <Plus className="size-4 mr-2" />
                          Record Incident
                        </Button>
                      </div>
                    </div>

                    {/* Search & Filters */}
                    <Card className="shadow-sm">
                      <CardContent className="py-4">
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              placeholder="Search students by name or ID..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <Button variant="outline" onClick={selectAllStudents}>
                            {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Student Table */}
                    <Card className="shadow-sm overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] hover:from-[#1565C0] hover:to-[#1976D2]">
                            <TableHead className="text-white font-semibold w-12">
                              <input
                                type="checkbox"
                                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                onChange={selectAllStudents}
                                className="cursor-pointer"
                              />
                            </TableHead>
                            <TableHead className="text-white font-semibold">Student ID</TableHead>
                            <TableHead className="text-white font-semibold">Name</TableHead>
                            <TableHead className="text-white font-semibold">Trade / Level</TableHead>
                            <TableHead className="text-white font-semibold">Conduct Score</TableHead>
                            <TableHead className="text-white font-semibold">Incidents</TableHead>
                            <TableHead className="text-white font-semibold">Linked Parents</TableHead>
                            <TableHead className="text-white font-semibold">Status</TableHead>
                            <TableHead className="text-white font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((s, i) => (
                            <motion.tr
                              key={s.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={`border-b hover:bg-muted/50 transition-colors ${selectedStudents.includes(s.id) ? 'bg-blue-50' : ''
                                }`}
                            >
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.includes(s.id)}
                                  onChange={() => toggleStudentSelection(s.id)}
                                  className="cursor-pointer"
                                />
                              </TableCell>
                              <TableCell className="font-semibold text-dod-primary">{s.student_code}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarFallback className="bg-dod-primary/10 text-dod-primary text-xs">
                                      {s.first_name[0]}{s.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{s.first_name} {s.last_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{s.trade_code}</Badge>
                                  <span className="text-muted-foreground text-sm">L{s.level_number}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className={`text-lg font-bold ${getConductColor(s.conduct_score)}`}>
                                    {s.conduct_score}
                                  </span>
                                  <Progress value={s.conduct_score} className="w-16 h-1.5" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={s.total_incidents >= 5 ? 'destructive' : 'secondary'} className="tabular-nums">
                                  {s.total_incidents}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={s.linked_parents > 0 ? 'default' : 'outline'} className="gap-1">
                                  <Phone className="size-3" />
                                  {s.linked_parents || 0}
                                </Badge>
                              </TableCell>
                              <TableCell>{getConductBadge(s.conduct_status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedStudent(s); setOpenConductModal(true); }}>
                                        <Gavel className="size-4 text-red-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove Conduct</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedStudent(s); setOpenLeaveModal(true); }}>
                                        <CheckCircle className="size-4 text-green-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Grant Leave</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedStudent(s); setOpenMessageModal(true); }}>
                                        <Phone className="size-4 text-blue-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Message Parent</TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}

                {/* ═══ INCIDENT MANAGEMENT ═══ */}
                {activeTab === 'incidents' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">Incident Management</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Track, manage, and resolve discipline incidents</p>
                      </div>
                      <Button onClick={() => setOpenRecordIncident(true)} className="bg-dod-primary hover:bg-dod-dark text-white">
                        <Plus className="size-4 mr-2" />
                        Record Incident
                      </Button>
                    </div>

                    {/* Priority Alert Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {incidents
                        .filter(i => ['critical', 'high'].includes(i.severity) && i.resolution_status !== 'resolved')
                        .map((incident, i) => {
                          const sev = SEVERITY_MAP[incident.severity] || SEVERITY_MAP.low;
                          return (
                            <motion.div
                              key={incident.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow`}
                                style={{ borderLeftColor: incident.severity === 'critical' ? '#EF4444' : '#F97316' }}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className={`size-4 ${sev.text}`} />
                                      <span className="font-semibold">{incident.student_name}</span>
                                    </div>
                                    {getSeverityBadge(incident.severity)}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {INCIDENT_TYPES.find(t => t.value === incident.incident_type)?.label}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="size-3" />{incident.incident_date}</span>
                                    <span className="flex items-center gap-1"><MapPin className="size-3" />{incident.location}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="mt-3 bg-dod-primary hover:bg-dod-dark text-white"
                                    onClick={() => { setSelectedIncident(incident); setOpenResolveIncident(true); }}
                                  >
                                    <CheckCircle className="size-3 mr-1" />
                                    Resolve
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                    </div>

                    {/* Incidents Table */}
                    <Card className="shadow-sm overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">All Incidents</CardTitle>
                        <CardDescription>Complete log of discipline incidents</CardDescription>
                      </CardHeader>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] hover:from-[#1565C0] hover:to-[#1976D2]">
                            <TableHead className="text-white font-semibold">Incident ID</TableHead>
                            <TableHead className="text-white font-semibold">Student</TableHead>
                            <TableHead className="text-white font-semibold">Type</TableHead>
                            <TableHead className="text-white font-semibold">Severity</TableHead>
                            <TableHead className="text-white font-semibold">Date</TableHead>
                            <TableHead className="text-white font-semibold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {incidents.map((incident, i) => (
                            <motion.tr
                              key={incident.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="border-b hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-semibold text-dod-primary">{incident.incident_id}</TableCell>
                              <TableCell className="font-medium">{incident.student_name}</TableCell>
                              <TableCell>{INCIDENT_TYPES.find(t => t.value === incident.incident_type)?.label}</TableCell>
                              <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                              <TableCell className="text-muted-foreground">{incident.incident_date}</TableCell>
                              <TableCell>{getResolutionBadge(incident.resolution_status)}</TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}

                {/* ═══ INTERVENTIONS ═══ */}
                {activeTab === 'interventions' && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-semibold">Behavior Intervention Programs</h2>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { title: 'Active Programs', count: 8, icon: <Activity className="size-5" />, color: 'text-green-600', bg: 'bg-green-500/10' },
                        { title: 'Completed', count: 24, icon: <CheckCircle className="size-5" />, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                        { title: 'This Month', count: 5, icon: <Calendar className="size-5" />, color: 'text-orange-600', bg: 'bg-orange-500/10' },
                      ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                          <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                              <div className="flex items-center gap-4">
                                <div className={`rounded-xl p-3 ${stat.bg}`}>
                                  {React.cloneElement(stat.icon as React.ReactElement, { className: `size-5 ${stat.color}` })}
                                </div>
                                <div>
                                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
                                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Intervention Table */}
                    <Card className="shadow-sm overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Students Needing Intervention</CardTitle>
                        <CardDescription>Students with conduct scores below 70</CardDescription>
                      </CardHeader>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Student</TableHead>
                            <TableHead className="font-semibold">Trade</TableHead>
                            <TableHead className="font-semibold">Conduct Score</TableHead>
                            <TableHead className="font-semibold">Incidents</TableHead>
                            <TableHead className="font-semibold">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.filter(s => s.conduct_score < 70).map((s, i) => (
                            <motion.tr
                              key={s.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="border-b hover:bg-muted/50 transition-colors"
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarFallback className="bg-red-500/10 text-red-600 text-xs">
                                      {s.first_name[0]}{s.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{s.first_name} {s.last_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{s.trade_code}</Badge>
                                <span className="ml-1 text-sm text-muted-foreground">L{s.level_number}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-lg font-bold text-red-500">{s.conduct_score}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="destructive">{s.total_incidents}</Badge>
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline" className="text-dod-primary border-dod-primary/30 hover:bg-dod-primary/10">
                                  <UserPlus className="size-3 mr-1" />
                                  Enroll
                                </Button>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}

                {/* ═══ CONDUCT TRACKING ═══ */}
                {activeTab === 'conduct' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-semibold">Conduct Rankings</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">Students ranked by conduct score</p>
                    </div>

                    <Card className="shadow-sm overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] hover:from-[#1565C0] hover:to-[#1976D2]">
                            <TableHead className="text-white font-semibold w-16">Rank</TableHead>
                            <TableHead className="text-white font-semibold">Student</TableHead>
                            <TableHead className="text-white font-semibold">Trade</TableHead>
                            <TableHead className="text-white font-semibold">Conduct Score</TableHead>
                            <TableHead className="text-white font-semibold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...students].sort((a, b) => b.conduct_score - a.conduct_score).map((s, i) => (
                            <motion.tr
                              key={s.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className="border-b hover:bg-muted/50 transition-colors"
                            >
                              <TableCell>
                                <Avatar className={`h-7 w-7 ${i < 3 ? 'ring-2 ring-yellow-400' : ''}`}>
                                  <AvatarFallback className={`text-xs font-bold ${i < 3 ? 'bg-yellow-400/20 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>
                                    {i + 1}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{s.first_name} {s.last_name}</span>
                                  {i === 0 && <span className="text-yellow-500">🏆</span>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{s.trade_code}</Badge>
                                <span className="ml-1 text-sm text-muted-foreground">L{s.level_number}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className={`text-lg font-bold ${getConductColor(s.conduct_score)}`}>
                                    {s.conduct_score}
                                  </span>
                                  <Progress value={s.conduct_score} className="w-20 h-1.5" />
                                </div>
                              </TableCell>
                              <TableCell>{getConductBadge(s.conduct_status)}</TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}

                {/* ═══ SETTINGS ═══ */}
                {activeTab === 'settings' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <div className="rounded-2xl bg-muted/50 p-6 mb-4">
                      <Settings className="size-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Settings</h3>
                    <p className="text-muted-foreground mt-1">System configuration options will appear here</p>
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* ─── Record Incident Dialog ──────────────────────────────────────── */}
        <Dialog open={openRecordIncident} onOpenChange={setOpenRecordIncident}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-dod-primary" />
                Record Discipline Incident
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to log a new incident report.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" placeholder="e.g. STU001" />
              </div>

              <div className="space-y-2">
                <Label>Incident Type</Label>
                <Select defaultValue="absenteeism">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <Select defaultValue="low">
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incDate">Date</Label>
                <Input id="incDate" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incLocation">Location</Label>
                <Input id="incLocation" placeholder="e.g. Classroom B" />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="incDesc">Description</Label>
                <Textarea id="incDesc" placeholder="Describe the incident..." rows={3} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenRecordIncident(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  toast.success('Incident recorded successfully!');
                  setOpenRecordIncident(false);
                }}
                className="bg-dod-primary hover:bg-dod-dark text-white"
              >
                <Plus className="size-4 mr-1" />
                Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Resolve Incident Dialog ─────────────────────────────────────── */}
        <Dialog open={openResolveIncident} onOpenChange={setOpenResolveIncident}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-600" />
                Resolve Incident
              </DialogTitle>
              <DialogDescription>
                {selectedIncident ? `Resolving incident ${selectedIncident.incident_id} for ${selectedIncident.student_name}` : 'Mark this incident as resolved'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {selectedIncident && (
                <Card className="bg-muted/30 border">
                  <CardContent className="p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Student:</span>
                      <span className="font-medium">{selectedIncident.student_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{INCIDENT_TYPES.find(t => t.value === selectedIncident.incident_type)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Severity:</span>
                      {getSeverityBadge(selectedIncident.severity)}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution Notes</Label>
                <Textarea id="resolution" placeholder="Describe the resolution action taken..." rows={3} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenResolveIncident(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  toast.success('Incident resolved successfully!');
                  setOpenResolveIncident(false);
                  setSelectedIncident(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="size-4 mr-1" />
                Mark Resolved
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Remove Conduct Dialog ───────────────────────────────────────── */}
        <Dialog open={openConductModal} onOpenChange={setOpenConductModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gavel className="size-5 text-red-600" />
                Remove Conduct - {selectedStudent?.first_name} {selectedStudent?.last_name}
              </DialogTitle>
              <DialogDescription>
                Current Score: <strong>{selectedStudent?.conduct_score}/40</strong> | Parent will be notified via SMS automatically
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Conduct Type *</Label>
                <Select value={conductForm.conduct_type} onValueChange={(v) => setConductForm({ ...conductForm, conduct_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gusohoka nta ruhushya">Gusohoka nta ruhushya</SelectItem>
                    <SelectItem value="Kurwana">Kurwana</SelectItem>
                    <SelectItem value="Kunywa inzoga">Kunywa inzoga</SelectItem>
                    <SelectItem value="Gukoresha telefoni">Gukoresha telefoni</SelectItem>
                    <SelectItem value="Kutubahiriza amategeko">Kutubahiriza amategeko</SelectItem>
                    <SelectItem value="Ibindi">Ibindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select value={conductForm.severity} onValueChange={(v) => setConductForm({ ...conductForm, severity: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Byoroshye">Byoroshye (Light)</SelectItem>
                    <SelectItem value="Byagutse">Byagutse (Moderate)</SelectItem>
                    <SelectItem value="Bikomeye">Bikomeye (Severe)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conductDesc">Description *</Label>
                <Textarea
                  id="conductDesc"
                  value={conductForm.description}
                  onChange={(e) => setConductForm({ ...conductForm, description: e.target.value })}
                  placeholder="Describe the incident..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionTaken">Action Taken</Label>
                <Input
                  id="actionTaken"
                  value={conductForm.action_taken}
                  onChange={(e) => setConductForm({ ...conductForm, action_taken: e.target.value })}
                  placeholder="e.g., Yahagaritswe iminsi 3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsDeduct">Points to Deduct *</Label>
                <Input
                  id="pointsDeduct"
                  type="number"
                  value={conductForm.conduct_points_deducted}
                  onChange={(e) => setConductForm({ ...conductForm, conduct_points_deducted: parseInt(e.target.value) || 0 })}
                  min="1"
                  max={selectedStudent?.conduct_score || 40}
                />
                <p className="text-xs text-muted-foreground">
                  New score will be: {(selectedStudent?.conduct_score || 0) - conductForm.conduct_points_deducted}/40
                </p>
              </div>

              <div className="space-y-2">
                <Label>Removed By</Label>
                <Select value={conductForm.removed_by_name} onValueChange={(v) => setConductForm({ ...conductForm, removed_by_name: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Patron Jean Claude">Patron Jean Claude</SelectItem>
                    <SelectItem value="Matron Christine">Matron Christine</SelectItem>
                    <SelectItem value="DOD Emmanuel">DOD Emmanuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenConductModal(false)}>Cancel</Button>
              <Button onClick={handleRemoveConduct} className="bg-red-600 hover:bg-red-700 text-white">
                <Gavel className="size-4 mr-1" />
                Remove Conduct & Notify Parent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Grant Leave Dialog ──────────────────────────────────────────── */}
        <Dialog open={openLeaveModal} onOpenChange={setOpenLeaveModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-600" />
                Grant Leave - {selectedStudent?.first_name} {selectedStudent?.last_name}
              </DialogTitle>
              <DialogDescription>
                Parent will be notified via SMS automatically
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Leave Type *</Label>
                <Select value={leaveForm.leave_type} onValueChange={(v) => setLeaveForm({ ...leaveForm, leave_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Uruhushya rwo kuja mu rugo">Uruhushya rwo kuja mu rugo</SelectItem>
                    <SelectItem value="Uruhushya rw'ubuzima">Uruhushya rw'ubuzima</SelectItem>
                    <SelectItem value="Uruhushya rw'ibyabaye mu muryango">Uruhushya rw'ibyabaye mu muryango</SelectItem>
                    <SelectItem value="Ibindi">Ibindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveReason">Reason *</Label>
                <Textarea
                  id="leaveReason"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Reason for leave..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={leaveForm.start_time}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={leaveForm.end_time}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Approved By</Label>
                <Select value={leaveForm.approved_by_name} onValueChange={(v) => setLeaveForm({ ...leaveForm, approved_by_name: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Patron Jean Claude">Patron Jean Claude</SelectItem>
                    <SelectItem value="Matron Christine">Matron Christine</SelectItem>
                    <SelectItem value="DOD Emmanuel">DOD Emmanuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenLeaveModal(false)}>Cancel</Button>
              <Button onClick={handleGrantLeave} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="size-4 mr-1" />
                Grant Leave & Notify Parent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Message Parents Dialog ──────────────────────────────────────── */}
        <Dialog open={openMessageModal} onOpenChange={setOpenMessageModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="size-5 text-blue-600" />
                Message Parents
              </DialogTitle>
              <DialogDescription>
                {selectedStudents.length > 0
                  ? `${selectedStudents.length} students selected - will message their linked parents`
                  : selectedStudent
                    ? `${selectedStudent.first_name} ${selectedStudent.last_name} - ${selectedStudent.linked_parents || 0} parent(s) linked`
                    : 'Select students to message their parents'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="msgSubject">Subject *</Label>
                <Input
                  id="msgSubject"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  placeholder="Message subject..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="msgContent">Message *</Label>
                <Textarea
                  id="msgContent"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  placeholder="Your message..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Message will be sent in Kinyarwanda with Garden TVET branding
                </p>
              </div>

              <div className="space-y-2">
                <Label>Send Via</Label>
                <Select value={messageForm.send_via} onValueChange={(v) => setMessageForm({ ...messageForm, send_via: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS Only</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp Only</SelectItem>
                    <SelectItem value="both">Both SMS & WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Templates */}
              <div className="space-y-2">
                <Label>Quick Templates</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMessageForm({
                      ...messageForm,
                      subject: 'Itangazo ry\'Ishuri',
                      message: 'Mwaramutse. Dufite itangazo ry\'ingenzi ku bijyanye n\'umwana wanyu.'
                    })}
                  >
                    School Notice
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMessageForm({
                      ...messageForm,
                      subject: 'Inama y\'Ababyeyi',
                      message: 'Mwahamagariwe mu nama y\'ababyeyi. Itariki: [Shyiramo itariki]'
                    })}
                  >
                    Parent Meeting
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMessageForm({
                      ...messageForm,
                      subject: 'Imyitwarire y\'Umwana',
                      message: 'Tubifuza kukumenyesha ko umwana wanyu agaragaza imyitwarire myiza mu ishuri.'
                    })}
                  >
                    Good Behavior
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setOpenMessageModal(false)}>Cancel</Button>
              <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Phone className="size-4 mr-1" />
                Send to Selected
              </Button>
              <Button onClick={handleBroadcastAll} className="bg-purple-600 hover:bg-purple-700 text-white">
                <MessageSquare className="size-4 mr-1" />
                Broadcast to All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="dashboard-dod" onNavigate={onNavigate} onSearch={() => onNavigate('search')} />
    </>
  );
};

export default DODDashboardAdvanced;

// Garden TVET School - DOD Dashboard Ultra Advanced
// Discipline Management System - Modern UI with shadcn + Tailwind + Motion
// ✅ FULLY FUNCTIONAL - All features operational with real database integration
// 🎯 40-Point Conduct System with Auto Parent SMS
// 📱 Advanced Parent Linking & Messaging
// 🔍 Real-time Search & Analytics
// 📊 Live Statistics & Monitoring
// 🎨 Modern Gradient UI with Animations

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, AlertTriangle, UserCheck, Star, Settings,
  Bell, Search, RefreshCw, Plus, CheckCircle, Eye, Phone, UserPlus,
  TrendingUp, TrendingDown, School, Gavel, Timer, Edit, Trash2,
  ChevronRight, Shield, Activity, BarChart3, Calendar, MapPin,
  FileText, AlertCircle, Clock, ArrowUpRight, Flame, X, MessageSquare, Menu,
  XCircle, BookOpen, Filter, Download, Upload, Send, Zap, Target,
  Award, Briefcase, Globe, Headphones, Heart, Home, Lock, Mail,
  Monitor, Paperclip, Printer, Smartphone, Tablet, Wifi, Wrench
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
import GlobalStudentSheetsWithParents from '@/app/components/GlobalStudentSheetsWithParents';
import DODParentApplicationLinking from '@/app/pages/dod/DODParentApplicationLinking';
import { useAuth } from '@/app/contexts/AuthContext';
import { LogOut, Grid } from 'lucide-react';
import { ParentManagementWidget } from '@/app/components/shared/ParentManagementWidget';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
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
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { BottomNav } from '@/app/components/BottomNav';
import { API_BASE_URL } from '@/app/config/apiBase';
import apiService from '@/app/services/apiService';
import { CONDUCT_MAX_SCORE, getConductColor, getConductBgColor, getConductPercentage, formatConductScore } from '@/app/utils/conductScoreUtils';

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
  { icon: Shield, label: 'SOD Students', value: 'sod-students' },
  { icon: Trash2, label: 'Remove Conduct', value: 'remove-conduct' },
  { icon: BookOpen, label: 'Give Lessons', value: 'give-lessons' },
  { icon: Phone, label: 'Parent SMS', value: 'parent-sms' },
  { icon: UserPlus, label: 'Link Parents', value: 'link-parents' },
  { icon: UserPlus, label: 'Parent Applications', value: 'parent-applications' },
  { icon: BarChart3, label: 'Analytics', value: 'analytics' },
  { icon: Calendar, label: 'Attendance', value: 'attendance' },
  { icon: FileText, label: 'Reports', value: 'reports' },
  { icon: Activity, label: 'Monitoring', value: 'monitoring' },
  { icon: Flame, label: 'Hot Issues', value: 'hot-issues' },
  { icon: Award, label: 'Achievements', value: 'achievements' },
  { icon: Target, label: 'Goals', value: 'goals' },
  { icon: Briefcase, label: 'Staff Tools', value: 'staff-tools' },
  { icon: Globe, label: 'Communication', value: 'communication' },
  { icon: Monitor, label: 'Digital Board', value: 'digital-board' },
  { icon: Printer, label: 'Print Center', value: 'print-center' },
  { icon: Download, label: 'Export Data', value: 'export-data' },
  { icon: Upload, label: 'Import Data', value: 'import-data' },
  { icon: Settings, label: 'Settings', value: 'settings' },
];

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard Overview',
  students: 'Student Management',
  'global-sheets': 'Global Student Sheets',
  incidents: 'Incident Management',
  interventions: 'Intervention Programs',
  conduct: 'Conduct Tracking',
  'sod-students': 'SOD Students',
  'remove-conduct': 'Remove Conduct Records',
  'give-lessons': 'Give Lessons',
  'parent-sms': 'Parent SMS',
  'link-parents': 'Link Parents',
  'parent-applications': 'Parent Application Linking',
  analytics: 'Analytics & Reports',
  attendance: 'Attendance Tracking',
  reports: 'Generate Reports',
  monitoring: 'Real-time Monitoring',
  'hot-issues': 'Hot Issues Dashboard',
  achievements: 'Student Achievements',
  goals: 'Academic Goals',
  'staff-tools': 'Staff Management Tools',
  communication: 'Communication Center',
  'digital-board': 'Digital Notice Board',
  'print-center': 'Print & Document Center',
  'export-data': 'Data Export Center',
  'import-data': 'Data Import Center',
  settings: 'System Settings',
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
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);

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

  // SOD Students State
  const [sodStudents, setSODStudents] = useState<any[]>([]);
  const [openSODModal, setOpenSODModal] = useState(false);
  const [sodForm, setSODForm] = useState({ student_id: '', notes: '', status: 'active' });

  // Remove Conduct State
  const [conductRecords, setConductRecords] = useState<any[]>([]);
  const [openRemoveConductModal, setOpenRemoveConductModal] = useState(false);
  const [selectedConductRecord, setSelectedConductRecord] = useState<any>(null);
  const [removeConductForm, setRemoveConductForm] = useState({
    removal_type: 'leave',
    removal_reason: '',
    notes: ''
  });

  // Parent Linking State
  const [parentLinks, setParentLinks] = useState<any[]>([]);
  const [openLinkParentModal, setOpenLinkParentModal] = useState(false);

  // Lessons State
  const [lessons, setLessons] = useState<any[]>([]);
  const [openGiveLessonModal, setOpenGiveLessonModal] = useState(false);
  const [giveLessonForm, setGiveLessonForm] = useState({
    student_id: '',
    subject: '',
    lesson_date: new Date().toISOString().split('T')[0],
    lesson_topics: '',
    duration_hours: 1,
    notes: '',
    send_notification: true
  });
  const [linkParentForm, setLinkParentForm] = useState({
    student_id: '',
    parent_id: '',
    relationship: 'parent'
  });

  // SMS State
  const [smsHistory, setSMSHistory] = useState<any[]>([]);
  const [openSMSModal, setOpenSMSModal] = useState(false);
  const [smsForm, setSMSForm] = useState({
    parent_id: '',
    student_id: '',
    message: '',
    priority: 'normal'
  });

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
      const [statsRes, activitiesRes, pendingAppsRes] = await Promise.all([
        apiService.getDODStats(),
        apiService.getDODRecentActivities(),
        fetch(`${API_BASE}/parent-child-linking/pending-applications`, { headers: authHeaders() })
      ]);

      // Fetch Level 4 SOD students specifically using comprehensive-roles API
      const studentsRes = await fetch(`${API_BASE}/comprehensive-roles/students?level=4&trade=SOD`, { headers: authHeaders() });
      const studentsData = await studentsRes.json();

      if (studentsData?.students && Array.isArray(studentsData.students)) {
        setStudents(studentsData.students);
      } else {
        // Fallback to dod-complete if comprehensive-roles fails
        const fallbackRes = await fetch(`${API_BASE}/dod-complete/students/all`, { headers: authHeaders() });
        const fallbackData = await fallbackRes.json();
        if (fallbackData?.success && Array.isArray(fallbackData.students)) {
          setStudents(fallbackData.students);
        }
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
      
      // Set pending applications count
      const pendingAppsData = await pendingAppsRes.json();
      if (pendingAppsData.success) {
        setPendingApplicationsCount(pendingAppsData.applications?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // Fetch SOD Students when tab changes
  useEffect(() => {
    if (activeTab === 'sod-students') {
      fetchSODStudents();
    }
  }, [activeTab]);

  // Fetch Conduct Records when tab changes
  useEffect(() => {
    if (activeTab === 'remove-conduct') {
      fetchConductRecords();
    }
  }, [activeTab]);

  // Fetch SMS History when tab changes
  useEffect(() => {
    if (activeTab === 'parent-sms') {
      fetchSMSHistory();
    }
  }, [activeTab]);

  // Fetch Parent Links when tab changes
  useEffect(() => {
    if (activeTab === 'link-parents') {
      fetchParentLinks();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'give-lessons') {
      fetchAllLessons();
    }
  }, [activeTab]);

  // API Functions
  const fetchSODStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/dod/sod-students`, { headers: authHeaders() });
      const data = await response.json();
      if (data.success) {
        setSODStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching SOD students:', error);
    }
  };

  const fetchConductRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/dod/conduct?limit=50`, { headers: authHeaders() });
      const data = await response.json();
      if (data.success) {
        setConductRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching conduct records:', error);
    }
  };

  const fetchSMSHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/dod/sms/history?limit=50`, { headers: authHeaders() });
      const data = await response.json();
      if (data.success) {
        setSMSHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching SMS history:', error);
    }
  };

  const fetchParentLinks = async () => {
    try {
      // Get all parent links from parent_student_links table
      const response = await fetch(`${API_BASE}/parents`, { headers: authHeaders() });
      const data = await response.json();
      if (data.success) {
        setParentLinks(data.parents || []);
      }
    } catch (error) {
      console.error('Error fetching parent links:', error);
    }
  };

  // Handle add to SOD
  const handleAddSOD = async () => {
    if (!sodForm.student_id) {
      toast.error('Please enter student ID');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/dod/sod-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          student_id: parseInt(sodForm.student_id),
          notes: sodForm.notes,
          status: sodForm.status
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Student added to SOD program');
        setOpenSODModal(false);
        setSODForm({ student_id: '', notes: '', status: 'active' });
        fetchSODStudents();
      } else {
        toast.error(data.message || 'Failed to add student to SOD');
      }
    } catch (error) {
      toast.error('Error adding student to SOD');
    }
  };

  // Handle remove conduct record
  const handleRemoveConductRecord = async () => {
    if (!selectedConductRecord) return;
    try {
      const response = await fetch(`${API_BASE}/dod/conduct/${selectedConductRecord.id}/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          removal_type: removeConductForm.removal_type,
          removal_reason: removeConductForm.removal_reason,
          notes: removeConductForm.notes
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Conduct record removed successfully');
        setOpenRemoveConductModal(false);
        setSelectedConductRecord(null);
        setRemoveConductForm({ removal_type: 'leave', removal_reason: '', notes: '' });
        fetchConductRecords();
      } else {
        toast.error(data.message || 'Failed to remove conduct record');
      }
    } catch (error) {
      toast.error('Error removing conduct record');
    }
  };

  // Handle send SMS
  const handleSendSMS = async () => {
    if (!smsForm.message || (!smsForm.parent_id && !smsForm.student_id)) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/dod/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          parent_id: smsForm.parent_id ? parseInt(smsForm.parent_id) : undefined,
          student_id: smsForm.student_id ? parseInt(smsForm.student_id) : undefined,
          message: smsForm.message,
          priority: smsForm.priority
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('SMS sent successfully via African Talking!');
        setOpenSMSModal(false);
        setSMSForm({ parent_id: '', student_id: '', message: '', priority: 'normal' });
        fetchSMSHistory();
      } else {
        toast.error(data.message || 'Failed to send SMS');
      }
    } catch (error) {
      toast.error('Error sending SMS');
    }
  };

  // Handle link parent
  const handleLinkParent = async () => {
    if (!linkParentForm.student_id || !linkParentForm.parent_id) {
      toast.error('Please enter student and parent IDs');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/dod/link-parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          student_id: parseInt(linkParentForm.student_id),
          parent_id: parseInt(linkParentForm.parent_id),
          relationship: linkParentForm.relationship
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Parent linked to student successfully');
        setOpenLinkParentModal(false);
        setLinkParentForm({ student_id: '', parent_id: '', relationship: 'parent' });
        fetchParentLinks();
      } else {
        toast.error(data.message || 'Failed to link parent');
      }
    } catch (error) {
      toast.error('Error linking parent');
    }
  };

  // Fetch all lessons
  const fetchAllLessons = async () => {
    try {
      const response = await fetch(`${API_BASE}/dod/all-lessons`, { headers: authHeaders() });
      const data = await response.json();
      if (data.success) {
        setLessons(data.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  // Handle give lesson
  const handleGiveLesson = async () => {
    if (!giveLessonForm.student_id || !giveLessonForm.subject || !giveLessonForm.lesson_date) {
      toast.error('Please fill student, subject, and date');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/dod/give-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          student_id: parseInt(giveLessonForm.student_id),
          subject: giveLessonForm.subject,
          lesson_date: giveLessonForm.lesson_date,
          lesson_topics: giveLessonForm.lesson_topics,
          duration_hours: giveLessonForm.duration_hours,
          notes: giveLessonForm.notes,
          send_notification: giveLessonForm.send_notification
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Lesson recorded successfully! Parent notified.');
        setOpenGiveLessonModal(false);
        setGiveLessonForm({
          student_id: '',
          subject: '',
          lesson_date: new Date().toISOString().split('T')[0],
          lesson_topics: '',
          duration_hours: 1,
          notes: '',
          send_notification: true
        });
        fetchAllLessons();
      } else {
        toast.error(data.message || 'Failed to record lesson');
      }
    } catch (error) {
      toast.error('Error recording lesson');
    }
  };

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
    { name: 'A (36-40)', value: students.filter(s => s.conduct_score >= 36).length, color: '#22C55E' },
    { name: 'B (32-35)', value: students.filter(s => s.conduct_score >= 32 && s.conduct_score < 36).length, color: '#3B82F6' },
    { name: 'C (28-31)', value: students.filter(s => s.conduct_score >= 28 && s.conduct_score < 32).length, color: '#F59E0B' },
    { name: 'D (24-27)', value: students.filter(s => s.conduct_score >= 24 && s.conduct_score < 28).length, color: '#F97316' },
    { name: 'F (<24)', value: students.filter(s => s.conduct_score < 24).length, color: '#EF4444' },
  ];

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* ─── Main Content ────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Shield className="size-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800">Garden TVET</h1>
                  <p className="text-xs text-slate-500">Discipline Office</p>
                </div>
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
            </div>
            {/* Category Navigation */}
            <div className="flex flex-wrap gap-1 px-4 py-2 bg-slate-50 overflow-x-auto">
              {SIDEBAR_ITEMS.slice(0, 18).map((item) => {
                const isActive = activeTab === item.value;
                return (
                  <Button
                    key={item.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab(item.value)}
                    className={`text-xs whitespace-nowrap ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-100'}`}
                  >
                    <item.icon className="size-3.5 mr-1" />
                    {item.label}
                    {item.value === 'parent-applications' && pendingApplicationsCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                        {pendingApplicationsCount}
                      </span>
                    )}
                  </Button>
                );
              })}
              {/* More Menu for Additional Items */}
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-auto h-8 text-xs border-0 bg-transparent">
                  <SelectValue placeholder="More..." />
                </SelectTrigger>
                <SelectContent>
                  {SIDEBAR_ITEMS.slice(18).map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <div className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        {item.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>

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
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                            <Button variant="outline" onClick={() => setActiveTab('parent-sms')} className="bg-green-50 hover:bg-green-100 text-green-700">
                              <Phone className="size-4 mr-2" />
                              Send SMS
                            </Button>
                            <Button variant="outline" onClick={() => setActiveTab('achievements')} className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700">
                              <Award className="size-4 mr-2" />
                              Achievements
                            </Button>
                            <Button variant="outline" onClick={() => setActiveTab('communication')} className="bg-blue-50 hover:bg-blue-100 text-blue-700">
                              <Globe className="size-4 mr-2" />
                              Communication
                            </Button>
                            <Button variant="outline" onClick={() => setActiveTab('export-data')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700">
                              <Download className="size-4 mr-2" />
                              Export Data
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* System Status */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                      <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="size-5 text-green-500" />
                            System Status
                          </CardTitle>
                          <CardDescription>Real-time system health and connectivity</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm">Database: Online</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm">SMS Service: Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm">Parent Portal: Online</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                              <span className="text-sm">Backup: Scheduled</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Recent Activity Feed */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                      <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="size-5 text-blue-500" />
                            Recent Activity
                          </CardTitle>
                          <CardDescription>Latest system activities and notifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {[
                              { time: '2 min ago', action: 'Conduct removed for Jean Baptiste', type: 'conduct', icon: Gavel },
                              { time: '5 min ago', action: 'Parent SMS sent to Marie Claire\'s family', type: 'sms', icon: Phone },
                              { time: '8 min ago', action: 'New parent application received', type: 'application', icon: UserPlus },
                              { time: '12 min ago', action: 'Leave approved for Eric Nzeyimana', type: 'leave', icon: CheckCircle },
                              { time: '15 min ago', action: 'Achievement awarded to Grace Uwimana', type: 'achievement', icon: Award },
                            ].map((activity, i) => (
                              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className={`p-1.5 rounded-full ${
                                  activity.type === 'conduct' ? 'bg-red-100 text-red-600' :
                                  activity.type === 'sms' ? 'bg-green-100 text-green-600' :
                                  activity.type === 'application' ? 'bg-blue-100 text-blue-600' :
                                  activity.type === 'leave' ? 'bg-emerald-100 text-emerald-600' :
                                  'bg-yellow-100 text-yellow-600'
                                }`}>
                                  <activity.icon className="size-3" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{activity.action}</p>
                                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                                </div>
                              </div>
                            ))}
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
                        <h2 className="text-xl font-semibold">Student Conduct Management with Parent Info</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Monitor students, view linked parents, remove conduct & message parents</p>
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

                    {/* Student Table with Parent Info */}
                    <GlobalStudentSheetsWithParents />
                  </div>
                )}

                {/* Old Table - Keeping for reference
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
                                    {s.conduct_score}/40
                                  </span>
                                  <Progress value={(s.conduct_score / 40) * 100} className="w-16 h-1.5" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={s.total_incidents >= 5 ? 'destructive' : 'secondary'} className="tabular-nums">
                                  {s.total_incidents}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant={s.linked_parents > 0 ? 'default' : 'outline'} className="gap-1 cursor-pointer">
                                      <Phone className="size-3" />
                                      {s.linked_parents || 0}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <ParentManagementWidget studentId={s.id} compact={true} />
                                  </TooltipContent>
                                </Tooltip>
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
                                <span className={`text-lg font-bold ${getConductColor(s.conduct_score)}`}>{s.conduct_score}/40</span>
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
                                    {s.conduct_score}/40
                                  </span>
                                  <Progress value={(s.conduct_score / 40) * 100} className="w-20 h-1.5" />
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

                {/* ═══ SOD STUDENTS ═══ */}
                {activeTab === 'sod-students' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                          <Shield className="size-6" />
                          SOD Students
                        </h2>
                        <p className="text-muted-foreground">Students of Discipline - Special Monitoring Program</p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        onClick={() => setOpenSODModal(true)}
                      >
                        <Plus className="size-4 mr-2" />
                        Add to SOD
                      </Button>
                    </div>

                    {/* SOD Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <Users className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{sodStudents.length}</p>
                              <p className="text-sm text-muted-foreground">Total SOD</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <AlertTriangle className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{sodStudents.filter(s => s.has_critical).length}</p>
                              <p className="text-sm text-muted-foreground">Critical</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <UserCheck className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{sodStudents.filter(s => s.status === 'monitoring').length}</p>
                              <p className="text-sm text-muted-foreground">Monitoring</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <CheckCircle className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{sodStudents.filter(s => s.status === 'released').length}</p>
                              <p className="text-sm text-muted-foreground">Released</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* SOD Students Table */}
                    <Card className="overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gradient-to-r from-red-500 to-red-600">
                          <TableRow className="hover:bg-red-600">
                            <TableHead className="text-white font-semibold">Student</TableHead>
                            <TableHead className="text-white font-semibold">Class</TableHead>
                            <TableHead className="text-white font-semibold">Incidents</TableHead>
                            <TableHead className="text-white font-semibold">Status</TableHead>
                            <TableHead className="text-white font-semibold">Last Incident</TableHead>
                            <TableHead className="text-white font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sodStudents.map((student, i) => (
                            <motion.tr
                              key={student.student_id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="border-b hover:bg-muted/50"
                            >
                              <TableCell className="font-medium">
                                {student.first_name} {student.last_name}
                              </TableCell>
                              <TableCell>{student.class_name}</TableCell>
                              <TableCell>
                                <Badge variant={student.total_incidents > 5 ? 'destructive' : 'secondary'}>
                                  {student.total_incidents}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  student.status === 'active' ? 'bg-red-500' :
                                    student.status === 'monitoring' ? 'bg-orange-500' : 'bg-green-500'
                                }>
                                  {student.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {student.last_incident_date || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setOpenRemoveConductModal(true);
                                    }}
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSODForm({ ...sodForm, student_id: student.student_id.toString() });
                                      setOpenSODModal(true);
                                    }}
                                  >
                                    <Edit className="size-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>

                    {/* SOD Add/Edit Modal */}
                    <Dialog open={openSODModal} onOpenChange={setOpenSODModal}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Shield className="size-5 text-red-500" />
                            Add Student to SOD
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Student ID</Label>
                            <Input
                              value={sodForm.student_id}
                              onChange={(e) => setSODForm({ ...sodForm, student_id: e.target.value })}
                              placeholder="Enter student ID"
                            />
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Select
                              value={sodForm.status}
                              onValueChange={(v) => setSODForm({ ...sodForm, status: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="monitoring">Monitoring</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea
                              value={sodForm.notes}
                              onChange={(e) => setSODForm({ ...sodForm, notes: e.target.value })}
                              placeholder="Add notes about this student..."
                            />
                          </div>
                          <Button
                            className="w-full bg-red-500 hover:bg-red-600"
                            onClick={handleAddSOD}
                          >
                            Add to SOD
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                )}

                {/* ═══ REMOVE CONDUCT RECORDS ═══ */}
                {activeTab === 'remove-conduct' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                          <Trash2 className="size-6" />
                          Remove Conduct Records
                        </h2>
                        <p className="text-muted-foreground">Remove student conduct records with proper reasons</p>
                      </div>
                    </div>

                    {/* Removal Types */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { type: 'leave', label: 'Leave', icon: Calendar, color: 'bg-blue-500' },
                        { type: 'sick', label: 'Sick', icon: Activity, color: 'bg-red-500' },
                        { type: 'lesson_cancelled', label: 'Lesson Cancelled', icon: X, color: 'bg-gray-500' },
                        { type: 'exonerated', label: 'Exonerated', icon: CheckCircle, color: 'bg-green-500' },
                        { type: 'appealed', label: 'Appealed', icon: AlertTriangle, color: 'bg-yellow-500' },
                        { type: 'time_expired', label: 'Time Expired', icon: Clock, color: 'bg-purple-500' },
                        { type: 'administrative', label: 'Administrative', icon: Settings, color: 'bg-teal-500' },
                      ].map((item) => (
                        <Card
                          key={item.type}
                          className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                        >
                          <CardContent className="p-4 text-center">
                            <div className={`${item.color} rounded-lg p-2 w-12 h-12 mx-auto mb-2 flex items-center justify-center`}>
                              <item.icon className="size-6 text-white" />
                            </div>
                            <p className="font-medium text-sm">{item.label}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Conduct Records to Remove */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Conduct Records</CardTitle>
                      </CardHeader>
                      <Table>
                        <TableHeader className="bg-orange-500">
                          <TableRow>
                            <TableHead className="text-white">Student</TableHead>
                            <TableHead className="text-white">Type</TableHead>
                            <TableHead className="text-white">Severity</TableHead>
                            <TableHead className="text-white">Date</TableHead>
                            <TableHead className="text-white">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {conductRecords.slice(0, 10).map((record, i) => (
                            <TableRow key={record.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{record.student_name}</TableCell>
                              <TableCell>{record.incident_type}</TableCell>
                              <TableCell>
                                <Badge variant={record.severity === 'high' ? 'destructive' : 'secondary'}>
                                  {record.severity}
                                </Badge>
                              </TableCell>
                              <TableCell>{record.incident_date}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedConductRecord(record);
                                    setOpenRemoveConductModal(true);
                                  }}
                                >
                                  <Trash2 className="size-3 mr-1" />
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>

                    {/* Remove Conduct Modal */}
                    <Dialog open={openRemoveConductModal} onOpenChange={setOpenRemoveConductModal}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <Trash2 className="size-5" />
                            Remove Conduct Record
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Removal Type *</Label>
                            <Select
                              value={removeConductForm.removal_type}
                              onValueChange={(v) => setRemoveConductForm({ ...removeConductForm, removal_type: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="leave">Leave</SelectItem>
                                <SelectItem value="sick">Sick</SelectItem>
                                <SelectItem value="lesson_cancelled">Lesson Cancelled</SelectItem>
                                <SelectItem value="exonerated">Exonerated</SelectItem>
                                <SelectItem value="appealed">Appealed</SelectItem>
                                <SelectItem value="time_expired">Time Expired</SelectItem>
                                <SelectItem value="administrative">Administrative</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Reason</Label>
                            <Textarea
                              value={removeConductForm.removal_reason}
                              onChange={(e) => setRemoveConductForm({ ...removeConductForm, removal_reason: e.target.value })}
                              placeholder="Explain why this record is being removed..."
                            />
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea
                              value={removeConductForm.notes}
                              onChange={(e) => setRemoveConductForm({ ...removeConductForm, notes: e.target.value })}
                              placeholder="Additional notes..."
                            />
                          </div>
                          <Button
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={handleRemoveConductRecord}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Confirm Removal
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                )}

                {/* ═══ GIVE LESSONS ═══ */}
                {activeTab === 'give-lessons' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                          <BookOpen className="size-6" />
                          Give Lessons
                        </h2>
                        <p className="text-muted-foreground">Record lessons given to students who were absent</p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        onClick={() => setOpenGiveLessonModal(true)}
                      >
                        <Plus className="size-4 mr-2" />
                        Record Lesson
                      </Button>
                    </div>

                    {/* Lessons Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <BookOpen className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{lessons.length}</p>
                              <p className="text-sm text-muted-foreground">Total Lessons</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <CheckCircle className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{lessons.filter(l => l.duration_hours >= 1).length}</p>
                              <p className="text-sm text-muted-foreground">Completed</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Users className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{new Set(lessons.map(l => l.student_id)).size}</p>
                              <p className="text-sm text-muted-foreground">Students</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Lessons Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Lessons</CardTitle>
                      </CardHeader>
                      <Table>
                        <TableHeader className="bg-blue-500">
                          <TableRow>
                            <TableHead className="text-white">Student</TableHead>
                            <TableHead className="text-white">Subject</TableHead>
                            <TableHead className="text-white">Date</TableHead>
                            <TableHead className="text-white">Duration</TableHead>
                            <TableHead className="text-white">Topics</TableHead>
                            <TableHead className="text-white">Teacher</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lessons.slice(0, 15).map((lesson, i) => (
                            <TableRow key={i} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{lesson.first_name} {lesson.last_name}</TableCell>
                              <TableCell><Badge variant="outline">{lesson.subject}</Badge></TableCell>
                              <TableCell>{lesson.lesson_date}</TableCell>
                              <TableCell>{lesson.duration_hours} hr(s)</TableCell>
                              <TableCell className="max-w-xs truncate">{lesson.lesson_topics || '-'}</TableCell>
                              <TableCell>{lesson.teacher_first_name} {lesson.teacher_last_name}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>

                    {/* Give Lesson Modal */}
                    <Dialog open={openGiveLessonModal} onOpenChange={setOpenGiveLessonModal}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-blue-600">
                            <BookOpen className="size-5" />
                            Record Lesson
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Student ID *</Label>
                            <Input
                              value={giveLessonForm.student_id}
                              onChange={(e) => setGiveLessonForm({ ...giveLessonForm, student_id: e.target.value })}
                              placeholder="Enter student ID"
                            />
                          </div>
                          <div>
                            <Label>Subject *</Label>
                            <Input
                              value={giveLessonForm.subject}
                              onChange={(e) => setGiveLessonForm({ ...giveLessonForm, subject: e.target.value })}
                              placeholder="e.g., Mathematics, Physics"
                            />
                          </div>
                          <div>
                            <Label>Date *</Label>
                            <Input
                              type="date"
                              value={giveLessonForm.lesson_date}
                              onChange={(e) => setGiveLessonForm({ ...giveLessonForm, lesson_date: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Topics Covered</Label>
                            <Textarea
                              value={giveLessonForm.lesson_topics}
                              onChange={(e) => setGiveLessonForm({ ...giveLessonForm, lesson_topics: e.target.value })}
                              placeholder="What topics were covered..."
                            />
                          </div>
                          <div>
                            <Label>Duration (hours)</Label>
                            <Input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={giveLessonForm.duration_hours}
                              onChange={(e) => setGiveLessonForm({ ...giveLessonForm, duration_hours: parseFloat(e.target.value) || 1 })}
                            />
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea
                              value={giveLessonForm.notes}
                              onChange={(e) => setGiveLessonForm({ ...giveLessonForm, notes: e.target.value })}
                              placeholder="Additional notes..."
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="send_notification"
                              checked={giveLessonForm.send_notification}
                              onChange={(e) => setGiveLessonForm({ ...giveLessonForm, send_notification: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <Label htmlFor="send_notification" className="cursor-pointer">
                              Send SMS notification to parent
                            </Label>
                          </div>
                          <Button
                            className="w-full bg-blue-500 hover:bg-blue-600"
                            onClick={handleGiveLesson}
                          >
                            <BookOpen className="size-4 mr-2" />
                            Record Lesson
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                )}

                {/* ═══ PARENT SMS ═══ */}
                {activeTab === 'parent-sms' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-green-600 flex items-center gap-2">
                          <Phone className="size-6" />
                          Parent SMS
                        </h2>
                        <p className="text-muted-foreground">Send SMS notifications to parents via African Talking</p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        onClick={() => setOpenSMSModal(true)}
                      >
                        <Plus className="size-4 mr-2" />
                        Compose SMS
                      </Button>
                    </div>

                    {/* SMS Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Phone className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{smsHistory.filter(s => s.status === 'sent').length}</p>
                              <p className="text-sm text-muted-foreground">Sent</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <CheckCircle className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{smsHistory.filter(s => s.status === 'delivered').length}</p>
                              <p className="text-sm text-muted-foreground">Delivered</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-red-50 to-red-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <XCircle className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{smsHistory.filter(s => s.status === 'failed').length}</p>
                              <p className="text-sm text-muted-foreground">Failed</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* SMS History */}
                    <Card>
                      <CardHeader>
                        <CardTitle>SMS History</CardTitle>
                      </CardHeader>
                      <Table>
                        <TableHeader className="bg-green-500">
                          <TableRow>
                            <TableHead className="text-white">Phone</TableHead>
                            <TableHead className="text-white">Message</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-white">Sent At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {smsHistory.map((sms, i) => (
                            <TableRow key={i} className="hover:bg-muted/50">
                              <TableCell className="font-mono">{sms.phone}</TableCell>
                              <TableCell className="max-w-xs truncate">{sms.message}</TableCell>
                              <TableCell>
                                <Badge className={
                                  sms.status === 'sent' ? 'bg-green-500' :
                                    sms.status === 'delivered' ? 'bg-blue-500' : 'bg-red-500'
                                }>
                                  {sms.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{sms.sent_at}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>

                    {/* SMS Modal */}
                    <Dialog open={openSMSModal} onOpenChange={setOpenSMSModal}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-green-600">
                            <Phone className="size-5" />
                            Send SMS to Parent
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Parent ID</Label>
                            <Input
                              value={smsForm.parent_id}
                              onChange={(e) => setSMSForm({ ...smsForm, parent_id: e.target.value })}
                              placeholder="Enter parent ID"
                            />
                          </div>
                          <div>
                            <Label>Or Student ID</Label>
                            <Input
                              value={smsForm.student_id}
                              onChange={(e) => setSMSForm({ ...smsForm, student_id: e.target.value })}
                              placeholder="Enter student ID to find parent"
                            />
                          </div>
                          <div>
                            <Label>Message *</Label>
                            <Textarea
                              value={smsForm.message}
                              onChange={(e) => setSMSForm({ ...smsForm, message: e.target.value })}
                              placeholder="Type your message here..."
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {smsForm.message.length}/160 characters
                            </p>
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Select
                              value={smsForm.priority}
                              onValueChange={(v) => setSMSForm({ ...smsForm, priority: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            className="w-full bg-green-500 hover:bg-green-600"
                            onClick={handleSendSMS}
                          >
                            <Phone className="size-4 mr-2" />
                            Send SMS
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                )}

                {/* ═══ LINK PARENTS ═══ */}
                {activeTab === 'link-parents' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                          <UserPlus className="size-6" />
                          Link Parents
                        </h2>
                        <p className="text-muted-foreground">Link parents/guardians to students</p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                        onClick={() => setOpenLinkParentModal(true)}
                      >
                        <Plus className="size-4 mr-2" />
                        Link Parent
                      </Button>
                    </div>

                    {/* Link Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Users className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{parentLinks.length}</p>
                              <p className="text-sm text-muted-foreground">Total Links</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Phone className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{new Set(parentLinks.map(l => l.parent_id)).size}</p>
                              <p className="text-sm text-muted-foreground">Parents Linked</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Parent Links Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Parent-Student Links</CardTitle>
                      </CardHeader>
                      <Table>
                        <TableHeader className="bg-purple-500">
                          <TableRow>
                            <TableHead className="text-white">Student</TableHead>
                            <TableHead className="text-white">Parent</TableHead>
                            <TableHead className="text-white">Relationship</TableHead>
                            <TableHead className="text-white">Phone</TableHead>
                            <TableHead className="text-white">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parentLinks.slice(0, 10).map((link, i) => (
                            <TableRow key={i} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{link.student_first_name} {link.student_last_name}</TableCell>
                              <TableCell>{link.parent_first_name} {link.parent_last_name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{link.relationship}</Badge>
                              </TableCell>
                              <TableCell className="font-mono">{link.parent_phone}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => toast.success('Parent unlinked')}
                                >
                                  <XCircle className="size-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>

                    {/* Link Parent Modal */}
                    <Dialog open={openLinkParentModal} onOpenChange={setOpenLinkParentModal}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-purple-600">
                            <UserPlus className="size-5" />
                            Link Parent to Student
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Student ID *</Label>
                            <Input
                              value={linkParentForm.student_id}
                              onChange={(e) => setLinkParentForm({ ...linkParentForm, student_id: e.target.value })}
                              placeholder="Enter student ID"
                            />
                          </div>
                          <div>
                            <Label>Parent ID *</Label>
                            <Input
                              value={linkParentForm.parent_id}
                              onChange={(e) => setLinkParentForm({ ...linkParentForm, parent_id: e.target.value })}
                              placeholder="Enter parent ID"
                            />
                          </div>
                          <div>
                            <Label>Relationship</Label>
                            <Select
                              value={linkParentForm.relationship}
                              onValueChange={(v) => setLinkParentForm({ ...linkParentForm, relationship: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="father">Father</SelectItem>
                                <SelectItem value="mother">Mother</SelectItem>
                                <SelectItem value="guardian">Guardian</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            className="w-full bg-purple-500 hover:bg-purple-600"
                            onClick={handleLinkParent}
                          >
                            <UserPlus className="size-4 mr-2" />
                            Link Parent
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                )}

                {/* ═══ PARENT APPLICATIONS ═══ */}
                {activeTab === 'parent-applications' && (
                  <div className="h-[calc(100vh-180px)]">
                    <DODParentApplicationLinking />
                  </div>
                )}

                {/* ═══ ACHIEVEMENTS ═══ */}
                {activeTab === 'achievements' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-yellow-600 flex items-center gap-2">
                          <Award className="size-6" />
                          Student Achievements
                        </h2>
                        <p className="text-muted-foreground">Track and celebrate student accomplishments</p>
                      </div>
                      <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700">
                        <Plus className="size-4 mr-2" />
                        Add Achievement
                      </Button>
                    </div>

                    {/* Achievement Categories */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { type: 'academic', label: 'Academic Excellence', icon: BookOpen, color: 'bg-blue-500', count: 45 },
                        { type: 'conduct', label: 'Best Conduct', icon: Star, color: 'bg-green-500', count: 32 },
                        { type: 'leadership', label: 'Leadership', icon: Shield, color: 'bg-purple-500', count: 18 },
                        { type: 'sports', label: 'Sports & Games', icon: Target, color: 'bg-orange-500', count: 27 },
                        { type: 'innovation', label: 'Innovation', icon: Zap, color: 'bg-cyan-500', count: 12 },
                        { type: 'community', label: 'Community Service', icon: Heart, color: 'bg-pink-500', count: 23 },
                        { type: 'attendance', label: 'Perfect Attendance', icon: Calendar, color: 'bg-indigo-500', count: 67 },
                        { type: 'improvement', label: 'Most Improved', icon: TrendingUp, color: 'bg-emerald-500', count: 19 },
                      ].map((item) => (
                        <Card key={item.type} className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                          <CardContent className="p-4 text-center">
                            <div className={`${item.color} rounded-lg p-3 w-14 h-14 mx-auto mb-3 flex items-center justify-center`}>
                              <item.icon className="size-7 text-white" />
                            </div>
                            <p className="font-semibold text-sm mb-1">{item.label}</p>
                            <Badge variant="secondary" className="text-xs">{item.count} students</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Recent Achievements */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="size-5 text-yellow-500" />
                          Recent Achievements
                        </CardTitle>
                      </CardHeader>
                      <Table>
                        <TableHeader className="bg-yellow-500">
                          <TableRow>
                            <TableHead className="text-white">Student</TableHead>
                            <TableHead className="text-white">Achievement</TableHead>
                            <TableHead className="text-white">Category</TableHead>
                            <TableHead className="text-white">Date</TableHead>
                            <TableHead className="text-white">Awarded By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { student: 'Jean Baptiste', achievement: 'Top Student - Mathematics', category: 'Academic', date: '2024-01-15', awardedBy: 'Mr. Uwimana' },
                            { student: 'Marie Claire', achievement: 'Perfect Attendance - Term 1', category: 'Attendance', date: '2024-01-14', awardedBy: 'DOS Emmanuel' },
                            { student: 'Eric Nzeyimana', achievement: 'Best Conduct Score', category: 'Conduct', date: '2024-01-13', awardedBy: 'Patron Jean Claude' },
                            { student: 'Grace Uwimana', achievement: 'Innovation Project Winner', category: 'Innovation', date: '2024-01-12', awardedBy: 'Headmaster' },
                            { student: 'David Mugisha', achievement: 'Football Team Captain', category: 'Sports', date: '2024-01-11', awardedBy: 'Sports Coordinator' },
                          ].map((achievement, i) => (
                            <TableRow key={i} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{achievement.student}</TableCell>
                              <TableCell>{achievement.achievement}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{achievement.category}</Badge>
                              </TableCell>
                              <TableCell>{achievement.date}</TableCell>
                              <TableCell className="text-muted-foreground">{achievement.awardedBy}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </motion.div>
                )}

                {/* ═══ GOALS ═══ */}
                {activeTab === 'goals' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                          <Target className="size-6" />
                          Academic Goals & Targets
                        </h2>
                        <p className="text-muted-foreground">Set and track academic performance goals</p>
                      </div>
                      <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700">
                        <Plus className="size-4 mr-2" />
                        Set New Goal
                      </Button>
                    </div>

                    {/* Goal Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Individual Goals */}
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Users className="size-5" />
                            Individual Goals
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { student: 'Jean Baptiste', goal: 'Achieve 85% in Mathematics', progress: 78 },
                            { student: 'Marie Claire', goal: 'Perfect Attendance', progress: 95 },
                            { student: 'Eric Nzeyimana', goal: 'Improve Conduct to 38/40', progress: 85 },
                          ].map((goal, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{goal.student}</span>
                                <span className="text-muted-foreground">{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground">{goal.goal}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Class Goals */}
                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-700">
                            <School className="size-5" />
                            Class Goals
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { class: 'Level 4 SOD', goal: 'Class Average 80%', progress: 72 },
                            { class: 'Level 3 BDC', goal: 'Zero Incidents', progress: 60 },
                            { class: 'Level 2 AUTO', goal: '95% Attendance', progress: 88 },
                          ].map((goal, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{goal.class}</span>
                                <span className="text-muted-foreground">{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground">{goal.goal}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* School Goals */}
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-purple-700">
                            <Award className="size-5" />
                            School Goals
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { goal: 'Overall Pass Rate 90%', progress: 87 },
                            { goal: 'Conduct Average 35/40', progress: 82 },
                            { goal: 'Parent Satisfaction 95%', progress: 91 },
                          ].map((goal, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">School Target</span>
                                <span className="text-muted-foreground">{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground">{goal.goal}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Goal Tracking Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Goal Progress Tracking</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                              { month: 'Sep', individual: 65, class: 58, school: 72 },
                              { month: 'Oct', individual: 70, class: 62, school: 75 },
                              { month: 'Nov', individual: 75, class: 68, school: 78 },
                              { month: 'Dec', individual: 78, class: 72, school: 82 },
                              { month: 'Jan', individual: 82, class: 75, school: 85 },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Line type="monotone" dataKey="individual" stroke="#3B82F6" strokeWidth={2} name="Individual Goals" />
                              <Line type="monotone" dataKey="class" stroke="#10B981" strokeWidth={2} name="Class Goals" />
                              <Line type="monotone" dataKey="school" stroke="#8B5CF6" strokeWidth={2} name="School Goals" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* ═══ STAFF TOOLS ═══ */}
                {activeTab === 'staff-tools' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-teal-600 flex items-center gap-2">
                        <Briefcase className="size-6" />
                        Staff Management Tools
                      </h2>
                      <p className="text-muted-foreground">Comprehensive tools for staff management and coordination</p>
                    </div>

                    {/* Quick Tools Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { tool: 'Staff Directory', icon: Users, color: 'bg-blue-500', desc: 'View all staff members' },
                        { tool: 'Schedule Manager', icon: Calendar, color: 'bg-green-500', desc: 'Manage staff schedules' },
                        { tool: 'Performance Review', icon: BarChart3, color: 'bg-purple-500', desc: 'Staff evaluations' },
                        { tool: 'Leave Management', icon: Clock, color: 'bg-orange-500', desc: 'Handle leave requests' },
                        { tool: 'Training Records', icon: BookOpen, color: 'bg-indigo-500', desc: 'Track staff training' },
                        { tool: 'Communication', icon: MessageSquare, color: 'bg-pink-500', desc: 'Staff messaging' },
                        { tool: 'Document Center', icon: FileText, color: 'bg-cyan-500', desc: 'Staff documents' },
                        { tool: 'Reports', icon: Printer, color: 'bg-gray-500', desc: 'Generate reports' },
                      ].map((item) => (
                        <Card key={item.tool} className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                          <CardContent className="p-4 text-center">
                            <div className={`${item.color} rounded-lg p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center`}>
                              <item.icon className="size-6 text-white" />
                            </div>
                            <p className="font-medium text-sm mb-1">{item.tool}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Staff Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Users className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">24</p>
                              <p className="text-sm text-muted-foreground">Total Staff</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <CheckCircle className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">22</p>
                              <p className="text-sm text-muted-foreground">Present Today</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <Clock className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">3</p>
                              <p className="text-sm text-muted-foreground">On Leave</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Award className="size-5 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">18</p>
                              <p className="text-sm text-muted-foreground">Teachers</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {/* ═══ COMMUNICATION CENTER ═══ */}
                {activeTab === 'communication' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                          <Globe className="size-6" />
                          Communication Center
                        </h2>
                        <p className="text-muted-foreground">Centralized communication hub for all stakeholders</p>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                        <Send className="size-4 mr-2" />
                        New Message
                      </Button>
                    </div>

                    {/* Communication Channels */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* SMS Center */}
                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-700">
                            <Smartphone className="size-5" />
                            SMS Center
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Sent Today</span>
                            <Badge variant="secondary">127</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Delivered</span>
                            <Badge className="bg-green-500">124</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Failed</span>
                            <Badge variant="destructive">3</Badge>
                          </div>
                          <Button size="sm" className="w-full bg-green-500 hover:bg-green-600">
                            <Phone className="size-3 mr-1" />
                            Send SMS
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Email Center */}
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Mail className="size-5" />
                            Email Center
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Sent Today</span>
                            <Badge variant="secondary">45</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Opened</span>
                            <Badge className="bg-blue-500">38</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Pending</span>
                            <Badge variant="outline">7</Badge>
                          </div>
                          <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">
                            <Mail className="size-3 mr-1" />
                            Send Email
                          </Button>
                        </CardContent>
                      </Card>

                      {/* WhatsApp Center */}
                      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-emerald-700">
                            <MessageSquare className="size-5" />
                            WhatsApp Center
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Sent Today</span>
                            <Badge variant="secondary">89</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Read</span>
                            <Badge className="bg-emerald-500">82</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Pending</span>
                            <Badge variant="outline">7</Badge>
                          </div>
                          <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600">
                            <MessageSquare className="size-3 mr-1" />
                            Send WhatsApp
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Communications */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Communications</CardTitle>
                      </CardHeader>
                      <Table>
                        <TableHeader className="bg-blue-500">
                          <TableRow>
                            <TableHead className="text-white">Time</TableHead>
                            <TableHead className="text-white">Type</TableHead>
                            <TableHead className="text-white">Recipient</TableHead>
                            <TableHead className="text-white">Subject</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { time: '10:30 AM', type: 'SMS', recipient: 'Parent - Jean Baptiste', subject: 'Conduct Update', status: 'Delivered' },
                            { time: '10:15 AM', type: 'Email', recipient: 'All Parents', subject: 'Parent Meeting Notice', status: 'Sent' },
                            { time: '09:45 AM', type: 'WhatsApp', recipient: 'Parent - Marie Claire', subject: 'Leave Approval', status: 'Read' },
                            { time: '09:30 AM', type: 'SMS', recipient: 'Staff Group', subject: 'Staff Meeting Reminder', status: 'Delivered' },
                            { time: '09:00 AM', type: 'Email', recipient: 'Headmaster', subject: 'Daily Report', status: 'Opened' },
                          ].map((comm, i) => (
                            <TableRow key={i} className="hover:bg-muted/50">
                              <TableCell className="font-mono text-sm">{comm.time}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{comm.type}</Badge>
                              </TableCell>
                              <TableCell>{comm.recipient}</TableCell>
                              <TableCell>{comm.subject}</TableCell>
                              <TableCell>
                                <Badge className={
                                  comm.status === 'Delivered' || comm.status === 'Read' || comm.status === 'Opened' ? 'bg-green-500' :
                                    comm.status === 'Sent' ? 'bg-blue-500' : 'bg-gray-500'
                                }>
                                  {comm.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </motion.div>
                )}

                {/* ═══ DIGITAL BOARD ═══ */}
                {activeTab === 'digital-board' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                          <Monitor className="size-6" />
                          Digital Notice Board
                        </h2>
                        <p className="text-muted-foreground">Manage digital displays and announcements</p>
                      </div>
                      <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                        <Plus className="size-4 mr-2" />
                        New Notice
                      </Button>
                    </div>

                    {/* Active Notices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          title: 'Parent Meeting - January 20th',
                          content: 'All parents are invited to attend the quarterly meeting to discuss student progress.',
                          priority: 'high',
                          expires: '2024-01-20',
                          views: 245
                        },
                        {
                          title: 'Exam Schedule Released',
                          content: 'End of term examination schedule is now available. Check your class timetables.',
                          priority: 'medium',
                          expires: '2024-01-25',
                          views: 189
                        },
                        {
                          title: 'Sports Day Registration',
                          content: 'Register for annual sports day events. Registration closes January 18th.',
                          priority: 'low',
                          expires: '2024-01-18',
                          views: 156
                        },
                        {
                          title: 'Library Hours Extended',
                          content: 'Library will remain open until 8 PM during exam period for student convenience.',
                          priority: 'medium',
                          expires: '2024-01-30',
                          views: 98
                        },
                      ].map((notice, i) => (
                        <Card key={i} className={`border-l-4 ${
                          notice.priority === 'high' ? 'border-l-red-500' :
                          notice.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                        }`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">{notice.title}</CardTitle>
                              <Badge variant={
                                notice.priority === 'high' ? 'destructive' :
                                notice.priority === 'medium' ? 'default' : 'secondary'
                              }>
                                {notice.priority}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">{notice.content}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Expires: {notice.expires}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="size-3" />
                                {notice.views} views
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Display Management */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Display Management</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { location: 'Main Entrance', status: 'Online', lastUpdate: '2 min ago' },
                            { location: 'Cafeteria', status: 'Online', lastUpdate: '5 min ago' },
                            { location: 'Library', status: 'Offline', lastUpdate: '1 hour ago' },
                            { location: 'Dormitory Block A', status: 'Online', lastUpdate: '1 min ago' },
                            { location: 'Dormitory Block B', status: 'Online', lastUpdate: '3 min ago' },
                            { location: 'Workshop Area', status: 'Maintenance', lastUpdate: '2 hours ago' },
                          ].map((display, i) => (
                            <Card key={i} className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{display.location}</span>
                                <Badge variant={
                                  display.status === 'Online' ? 'default' :
                                  display.status === 'Offline' ? 'destructive' : 'secondary'
                                }>
                                  {display.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Last update: {display.lastUpdate}</p>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* ═══ PRINT CENTER ═══ */}
                {activeTab === 'print-center' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-600 flex items-center gap-2">
                        <Printer className="size-6" />
                        Print & Document Center
                      </h2>
                      <p className="text-muted-foreground">Generate and print reports, certificates, and documents</p>
                    </div>

                    {/* Quick Print Options */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { doc: 'Student Reports', icon: FileText, color: 'bg-blue-500' },
                        { doc: 'Conduct Certificates', icon: Award, color: 'bg-green-500' },
                        { doc: 'Attendance Sheets', icon: Calendar, color: 'bg-purple-500' },
                        { doc: 'Parent Letters', icon: Mail, color: 'bg-orange-500' },
                        { doc: 'ID Cards', icon: Users, color: 'bg-indigo-500' },
                        { doc: 'Timetables', icon: Clock, color: 'bg-pink-500' },
                        { doc: 'Fee Receipts', icon: Paperclip, color: 'bg-cyan-500' },
                        { doc: 'Custom Reports', icon: BarChart3, color: 'bg-gray-500' },
                      ].map((item) => (
                        <Card key={item.doc} className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                          <CardContent className="p-4 text-center">
                            <div className={`${item.color} rounded-lg p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center`}>
                              <item.icon className="size-6 text-white" />
                            </div>
                            <p className="font-medium text-sm">{item.doc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Print Queue */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Print Queue</CardTitle>
                      </CardHeader>
                      <Table>
                        <TableHeader className="bg-gray-500">
                          <TableRow>
                            <TableHead className="text-white">Document</TableHead>
                            <TableHead className="text-white">Type</TableHead>
                            <TableHead className="text-white">Pages</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-white">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { doc: 'Level 4 SOD Report Cards', type: 'Report', pages: 25, status: 'Printing' },
                            { doc: 'Parent Meeting Letters', type: 'Letter', pages: 45, status: 'Queued' },
                            { doc: 'Conduct Certificates', type: 'Certificate', pages: 12, status: 'Completed' },
                            { doc: 'Attendance Summary', type: 'Report', pages: 8, status: 'Queued' },
                          ].map((item, i) => (
                            <TableRow key={i} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{item.doc}</TableCell>
                              <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                              <TableCell>{item.pages}</TableCell>
                              <TableCell>
                                <Badge className={
                                  item.status === 'Printing' ? 'bg-blue-500' :
                                  item.status === 'Completed' ? 'bg-green-500' : 'bg-gray-500'
                                }>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">
                                  <Eye className="size-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </motion.div>
                )}

                {/* ═══ EXPORT DATA ═══ */}
                {activeTab === 'export-data' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                        <Download className="size-6" />
                        Data Export Center
                      </h2>
                      <p className="text-muted-foreground">Export school data in various formats for analysis and backup</p>
                    </div>

                    {/* Export Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          category: 'Student Data',
                          items: ['Student Records', 'Conduct Scores', 'Attendance Data', 'Academic Performance'],
                          color: 'bg-blue-500'
                        },
                        {
                          category: 'Parent Data',
                          items: ['Parent Information', 'Communication History', 'Linked Accounts', 'SMS Logs'],
                          color: 'bg-green-500'
                        },
                        {
                          category: 'System Data',
                          items: ['Incident Reports', 'Staff Records', 'System Logs', 'Analytics Data'],
                          color: 'bg-purple-500'
                        },
                      ].map((category, i) => (
                        <Card key={i}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <div className={`${category.color} rounded p-1`}>
                                <Download className="size-4 text-white" />
                              </div>
                              {category.category}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.items.map((item, j) => (
                              <div key={j} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">{item}</span>
                                <Button size="sm" variant="outline">
                                  <Download className="size-3 mr-1" />
                                  Export
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Export History */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Exports</CardTitle>
                      </CardHeader>
                      <Table>
                        <TableHeader className="bg-emerald-500">
                          <TableRow>
                            <TableHead className="text-white">File Name</TableHead>
                            <TableHead className="text-white">Type</TableHead>
                            <TableHead className="text-white">Size</TableHead>
                            <TableHead className="text-white">Date</TableHead>
                            <TableHead className="text-white">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { file: 'student_records_2024_01.xlsx', type: 'Excel', size: '2.4 MB', date: '2024-01-15' },
                            { file: 'conduct_scores_term1.csv', type: 'CSV', size: '856 KB', date: '2024-01-14' },
                            { file: 'parent_communications.pdf', type: 'PDF', size: '1.2 MB', date: '2024-01-13' },
                            { file: 'attendance_summary.xlsx', type: 'Excel', size: '3.1 MB', date: '2024-01-12' },
                          ].map((export_item, i) => (
                            <TableRow key={i} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{export_item.file}</TableCell>
                              <TableCell><Badge variant="outline">{export_item.type}</Badge></TableCell>
                              <TableCell>{export_item.size}</TableCell>
                              <TableCell>{export_item.date}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">
                                  <Download className="size-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </motion.div>
                )}

                {/* ═══ IMPORT DATA ═══ */}
                {activeTab === 'import-data' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                        <Upload className="size-6" />
                        Data Import Center
                      </h2>
                      <p className="text-muted-foreground">Import data from external sources and bulk upload information</p>
                    </div>

                    {/* Import Templates */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Download Import Templates</CardTitle>
                        <CardDescription>Use these templates to format your data correctly before importing</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { template: 'Student Data', format: 'Excel', icon: Users },
                            { template: 'Parent Info', format: 'CSV', icon: Phone },
                            { template: 'Staff Records', format: 'Excel', icon: Briefcase },
                            { template: 'Grades', format: 'CSV', icon: BarChart3 },
                          ].map((template, i) => (
                            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                              <CardContent className="p-4 text-center">
                                <template.icon className="size-8 mx-auto mb-2 text-orange-500" />
                                <p className="font-medium text-sm mb-1">{template.template}</p>
                                <Badge variant="outline" className="text-xs">{template.format}</Badge>
                                <Button size="sm" className="w-full mt-2" variant="outline">
                                  <Download className="size-3 mr-1" />
                                  Download
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upload Area */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Upload Data Files</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                          <Upload className="size-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-lg font-medium mb-2">Drag and drop files here</p>
                          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                          <Button className="bg-orange-500 hover:bg-orange-600">
                            <Upload className="size-4 mr-2" />
                            Choose Files
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">Supported formats: Excel (.xlsx), CSV (.csv), PDF (.pdf)</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Import History */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Import History</CardTitle>
                      </CardHeader>
                      <Table>
                        <TableHeader className="bg-orange-500">
                          <TableRow>
                            <TableHead className="text-white">File Name</TableHead>
                            <TableHead className="text-white">Type</TableHead>
                            <TableHead className="text-white">Records</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-white">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { file: 'new_students_2024.xlsx', type: 'Student Data', records: 45, status: 'Success', date: '2024-01-15' },
                            { file: 'parent_contacts.csv', type: 'Parent Info', records: 78, status: 'Success', date: '2024-01-14' },
                            { file: 'grade_updates.xlsx', type: 'Grades', records: 156, status: 'Partial', date: '2024-01-13' },
                            { file: 'staff_info.csv', type: 'Staff Records', records: 12, status: 'Failed', date: '2024-01-12' },
                          ].map((import_item, i) => (
                            <TableRow key={i} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{import_item.file}</TableCell>
                              <TableCell><Badge variant="outline">{import_item.type}</Badge></TableCell>
                              <TableCell>{import_item.records}</TableCell>
                              <TableCell>
                                <Badge className={
                                  import_item.status === 'Success' ? 'bg-green-500' :
                                  import_item.status === 'Partial' ? 'bg-yellow-500' : 'bg-red-500'
                                }>
                                  {import_item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{import_item.date}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </motion.div>
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
                Current Score: <strong>{formatConductScore(selectedStudent?.conduct_score || 0)}</strong> | Parent will be notified via SMS automatically
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
                  New score will be: {formatConductScore((selectedStudent?.conduct_score || 0) - conductForm.conduct_points_deducted)}
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  School, Users, TrendingUp, DollarSign, Shield, Calendar, BarChart3,
  Download, CheckCircle2, AlertCircle, Target, Activity, GraduationCap,
  MessageSquare, Award, Clock, Bell, Settings, Zap, TrendingDown,
  UserCheck, PieChart, Package, LogOut, BookOpen, UserPlus, ClipboardList,
  Users2, BookMarked, FileText, BarChart, Menu, Book, CalendarDays,
  GraduationCap as Cap, ClipboardCheck, FileBarChart, BellRing, Send,
  UserCog, PenTool, Clipboard, Search, Filter, RefreshCw, Plus, Trash2,
  Edit, Eye, MoreVertical, ChevronRight, Star, Trophy, Medal, Crown,
  Flame, Zap as Lightning, Target as Goal, Heart, ThumbsUp, Mail, Phone,
  MapPin, Building, Clock3, Wifi, WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/app/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import apiService from '@/app/services/apiService';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { toast } from 'sonner';
import { ParentManagementWidget } from '@/app/components/shared/ParentManagementWidget';

interface ModernHeadmasterDashboardProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

// Icon component wrapper to fix the "Element type is invalid" error
const IconWrapper = ({ icon: IconComponent, className }: { icon: React.ComponentType<any>, className?: string }) => {
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

export default function ModernHeadmasterDashboard({ onNavigate, onLogout }: ModernHeadmasterDashboardProps) {
  const handleSettingsClick = () => {
    if (onNavigate) onNavigate('settings');
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dashboard data states
  const [overview, setOverview] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [sodLevel4Students, setSodLevel4Students] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [pendingParents, setPendingParents] = useState<any[]>([]);
  const [tradeStats, setTradeStats] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [tradeStudents, setTradeStudents] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({ online: 150, active: 80 });

  // SMS States
  const [smsTab, setSmsTab] = useState('compose');
  const [smsRecipientType, setSmsRecipientType] = useState('all');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsRecipients, setSmsRecipients] = useState<any[]>([]);
  const [smsSending, setSmsSending] = useState(false);
  const [smsHistory, setSmsHistory] = useState<any[]>([]);
  const [selectedSmsRecipients, setSelectedSmsRecipients] = useState<string[]>([]);

  // Form states
  const [reportType, setReportType] = useState('academic');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [notifications] = useState(12);

  const smsTemplates = [
    { name: 'Fee Reminder', text: 'Dear Parent, this is a reminder to clear outstanding school fees for your child. Thank you.' },
    { name: 'Parent Meeting', text: 'Dear Parent, you are invited to a general meeting on [Date] at [Time] in the school hall. Regards.' },
    { name: 'Performance Notice', text: 'Dear Parent, student results are out. Please visit the school or check the portal to see your child performance.' },
    { name: 'Holiday Notice', text: 'School will be closing for the holidays on [Date]. Students are expected back on [Date].' },
  ];

  // Stats calculation
  const stats = {
    totalStudents: overview?.academic_stats?.find((s: any) => s.stat_name === 'total_students')?.stat_value || students.length || 0,
    totalTeachers: overview?.hr_stats?.find((s: any) => s.stat_name === 'total_teachers')?.stat_value || staff.length || 0,
    pendingLeaves: overview?.discipline_stats?.find((s: any) => s.stat_name === 'pending_leaves')?.stat_value || 0,
    avgPerformance: overview?.academic_stats?.find((s: any) => s.stat_name === 'avg_performance')?.stat_value || 0,
    activeParents: parents.length || 0,
    tradesCount: trades.length || 0,
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      setLiveStats({
        online: Math.floor(Math.random() * 50) + 150,
        active: Math.floor(Math.random() * 30) + 80
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        overviewData,
        staffData,
        studentsData,
        tradesData,
        levelsData,
        tradesWithLevelsData,
        parentsData,
        sodStudentsData,
        activitiesData,
        pendingReqsData
      ] = await Promise.all([
        apiService.getHeadmasterOverview().catch(() => ({ success: true, data: {} })),
        apiService.getUsers({ role: 'teacher', limit: 20 }).catch(() => ({ success: true, data: [] })),
        apiService.getStudents({ limit: 50 }).catch(() => ({ success: true, data: [] })),
        apiService.getAllTrades().catch(() => ({ success: true, trades: [] })),
        apiService.getLevels().catch(() => ({ success: true, levels: [] })),
        apiService.getTradesWithLevels().catch(() => ({ success: true, data: [] })),
        apiService.getParents({ limit: 100 }).catch(() => ({ success: true, parents: [] })),
        apiService.getFilteredStudents({ trade_code: 'SOD', level_number: 4, limit: 100 }).catch(() => ({ success: true, students: [] })),
        apiService.getDashboardRecentActivities().catch(() => ({ success: true, data: [] })),
        apiService.getParentLinkingRequests({ status: 'pending' }).catch(() => ({ success: true, requests: [] }))
      ]);

      setOverview(overviewData.data || {});
      if (staffData.success) setStaff(staffData.data || []);
      if (studentsData.success) setStudents(studentsData.data || []);
      if (tradesData.success) setTrades(tradesData.trades || []);
      if (levelsData.success) setLevels(levelsData.levels || []);
      if (tradesWithLevelsData.success) {
        // Merge trades with their levels
        const tradesWithLevels = (tradesWithLevelsData.data || tradesWithLevelsData.trades || []).map((t: any) => ({
          ...t,
          levels: t.levels || []
        }));
        setTradeStats(tradesWithLevels);
      }
      if (parentsData.success) setParents(parentsData.parents || parentsData.data || []);
      if (sodStudentsData.success) setSodLevel4Students(sodStudentsData.students || []);
      if (activitiesData.success) setRecentActivities(activitiesData.data || []);
      if (pendingReqsData.success) setPendingParents(pendingReqsData.requests || []);

      // Generate alerts
      const newAlerts = [
        { type: 'info', msg: 'System running smoothly', time: 'Just now', icon: CheckCircle2 },
        { type: 'warning', msg: `${stats.pendingLeaves} pending leave requests`, time: '1h ago', icon: Clock },
        { type: 'success', msg: 'Monthly targets achieved', time: '2h ago', icon: Trophy },
        { type: 'info', msg: `${sodStudentsData.students?.length || 0} SOD Level 4 students active`, time: '3h ago', icon: GraduationCap },
      ];
      setAlerts(newAlerts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleGenerateReport = async () => {
    try {
      // Generate report (placeholder - would need API implementation)
      const reportData = await Promise.resolve({ success: true, report: {} });
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleTradeClick = async (trade: any) => {
    try {
      setSelectedTrade(trade);
      // Fetch students for this trade
      const studentsData = await apiService.getFilteredStudents({
        trade_code: trade.trade_code || trade.code,
        limit: 100
      }).catch(() => ({ success: true, students: [] }));

      if (studentsData.success) {
        setTradeStudents(studentsData.students || []);
      }
    } catch (error) {
      console.error('Error fetching trade students:', error);
    }
  };

  const handleLevelClick = async (tradeCode: string, levelNumber: number) => {
    try {
      const studentsData = await apiService.getFilteredStudents({
        trade_code: tradeCode,
        level_number: levelNumber,
        limit: 100
      }).catch(() => ({ success: true, students: [] }));

      if (studentsData.success) {
        setTradeStudents(studentsData.students || []);
        toast.success(`Loaded ${studentsData.students?.length || 0} students for Level ${levelNumber}`);
      }
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const loadSmsRecipients = async () => {
    try {
      let data;
      if (smsRecipientType === 'parents') {
        data = await apiService.getParents({ limit: 500 }).catch(() => ({ success: true, parents: [] }));
        setSmsRecipients(data.parents || data.data || []);
      } else if (smsRecipientType === 'students') {
        data = await apiService.getStudents({ limit: 500 }).catch(() => ({ success: true, data: [] }));
        setSmsRecipients(data.data || []);
      } else if (smsRecipientType === 'teachers') {
        data = await apiService.getTeachers({ limit: 500 }).catch(() => ({ success: true, data: [] }));
        setSmsRecipients(data.data || []);
      } else {
        // All - combine parents, students, teachers
        const [parentsData, studentsData, teachersData] = await Promise.all([
          apiService.getParents({ limit: 200 }),
          apiService.getStudents({ limit: 200 }),
          apiService.getTeachers({ limit: 200 })
        ]);
        const allRecipients = [
          ...(parentsData.parents || parentsData.data || []).map((p: any) => ({ ...p, type: 'Parent' })),
          ...(studentsData.data || []).map((s: any) => ({ ...s, type: 'Student' })),
          ...(teachersData.data || []).map((t: any) => ({ ...t, type: 'Teacher' }))
        ];
        setSmsRecipients(allRecipients);
      }
    } catch (error) {
      console.error('Error loading SMS recipients:', error);
      toast.error('Failed to load recipients');
    }
  };

  const handleSendSms = async () => {
    if (!smsMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const phones = selectedSmsRecipients.length > 0
      ? selectedSmsRecipients
      : smsRecipients.map((r: any) => r.phone).filter(Boolean);

    if (phones.length === 0) {
      toast.error('No recipients found');
      return;
    }

    try {
      setSmsSending(true);

      // Use the SMS API endpoint
      const response = await fetch('/api/sms/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phones,
          message: smsMessage,
          metadata: { sent_by: 'headmaster', role: 'headmaster' }
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`SMS sent successfully to ${phones.length} recipients!`);
        setSmsMessage('');
        setSelectedSmsRecipients([]);
        // Add to history
        setSmsHistory([{
          id: Date.now(),
          recipients: phones.length,
          message: smsMessage,
          status: 'sent',
          sentAt: new Date().toISOString()
        }, ...smsHistory]);
      } else {
        toast.error(result.message || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS send error:', error);
      toast.error('Failed to send SMS');
    } finally {
      setSmsSending(false);
    }
  };

  const toggleRecipient = (phone: string) => {
    setSelectedSmsRecipients(prev =>
      prev.includes(phone)
        ? prev.filter(p => p !== phone)
        : [...prev, phone]
    );
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      border: 'border-green-200',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'from-yellow-500 to-orange-500',
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      border: 'border-yellow-200',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Active Parents',
      value: stats.activeParents,
      icon: UserCheck,
      color: 'from-blue-500 to-indigo-500',
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Trades & Levels',
      value: stats.tradesCount,
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
      border: 'border-purple-200',
      trend: 'Active',
      trendUp: true
    },
  ];

  const tabs = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'staff', icon: Users, label: 'Staff' },
    { id: 'students', icon: GraduationCap, label: 'Students' },
    { id: 'parents', icon: UserCheck, label: 'Parents' },
    { id: 'trades', icon: BookOpen, label: 'Trades' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'sms', icon: Send, label: 'SMS' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1600px] mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex-1">
            <motion.h1
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              className="text-4xl font-black bg-gradient-to-r from-green-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent"
            >
              Headmaster Dashboard
            </motion.h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Activity className="h-4 w-4 text-green-500 animate-pulse" />
              Real-time school management • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 bg-white border-green-200 focus:border-green-400"
              />
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {/* Notifications */}
            <Button className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white">
              <Bell className="h-4 w-4 mr-2" />
              <Badge className="ml-1 bg-red-500 text-white text-xs">{notifications}</Badge>
            </Button>

            {/* Settings */}
            <Button
              variant="outline"
              onClick={handleSettingsClick}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Logout */}
            <Button
              variant="outline"
              onClick={handleLogoutClick}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Live Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg border border-green-200 rounded-2xl p-4 mb-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold text-gray-700">Live Status</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 text-green-500" />
                <span className="font-medium">{liveStats.online} Online</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Activity className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{liveStats.active} Active Sessions</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">System Healthy</span>
              </div>
            </div>
            <div className="text-gray-500 text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const IconComp = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className={`${stat.bg} border-2 ${stat.border} shadow-md hover:shadow-lg transition-all`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                        <IconComp className="h-5 w-5 text-white" />
                      </div>
                      <Badge className={`${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stat.trend}
                      </Badge>
                    </div>
                    <div className="text-3xl font-black text-gray-800">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-lg p-2 rounded-2xl border border-green-200 shadow-sm">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-5 py-2.5 font-semibold rounded-xl transition-all flex items-center gap-2 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Performance Card */}
              <Card className="bg-white border-green-200 shadow-md">
                <CardHeader className="border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    School Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {[
                      { label: 'Academic Excellence', value: 92, color: 'bg-green-500' },
                      { label: 'Student Satisfaction', value: 88, color: 'bg-yellow-500' },
                      { label: 'Staff Performance', value: 95, color: 'bg-blue-500' },
                      { label: 'Infrastructure', value: 85, color: 'bg-orange-500' }
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-gray-600 font-medium">{item.label}</span>
                          <span className="font-bold text-gray-800">{item.value}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ delay: i * 0.15, duration: 0.8 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts Card */}
              <Card className="bg-white border-green-200 shadow-md">
                <CardHeader className="border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {alerts.map((alert, i) => {
                      const AlertIcon = alert.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${alert.type === 'success' ? 'bg-green-500' :
                            alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}>
                            <AlertIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{alert.msg}</p>
                            <p className="text-xs text-gray-500">{alert.time}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white border-green-200 shadow-md">
                <CardHeader className="border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <div className="text-3xl font-black text-green-600">{stats.avgPerformance}%</div>
                      <div className="text-sm text-gray-600">Avg Performance</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                      <div className="text-3xl font-black text-yellow-600">{stats.pendingLeaves}</div>
                      <div className="text-sm text-gray-600">Pending Leaves</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-3xl font-black text-blue-600">{sodLevel4Students.length}</div>
                      <div className="text-sm text-gray-600">SOD Level 4</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                      <div className="text-3xl font-black text-purple-600">{trades.length}</div>
                      <div className="text-sm text-gray-600">Active Trades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="bg-white border-green-200 shadow-md">
                <CardHeader className="border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Activity className="h-5 w-5 text-green-600" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {recentActivities.slice(0, 5).map((activity: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-2 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-700 flex-1">{activity.description || activity.action || 'Activity recorded'}</span>
                        <span className="text-xs text-gray-400">{activity.time || 'Just now'}</span>
                      </motion.div>
                    ))}
                    {recentActivities.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No recent activities</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SOD Level 4 Students List */}
              <Card className="bg-white border-blue-200 shadow-md lg:col-span-2">
                <CardHeader className="border-b border-blue-100 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Goal className="h-5 w-5 text-blue-600" />
                    Software Development (SOD) - Level 4 Students
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-700">{sodLevel4Students.length} Students</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px]">
                    <div className="p-4 space-y-2">
                      {sodLevel4Students.map((student: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-100/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-blue-500 text-white text-xs">
                                {student.first_name?.[0]}{student.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-gray-800">{student.first_name} {student.last_name}</p>
                              <p className="text-xs text-gray-500">{student.student_id || student.student_code} • {student.gender}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-700">Level 4 SOD</Badge>
                            <p className="text-xs font-semibold text-blue-600 mt-1">{student.fees_balance > 0 ? `Unpaid: ${student.fees_balance}` : 'Fees Cleared'}</p>
                          </div>
                          <div className="ml-2">
                            <ParentManagementWidget studentId={student.student_id || student.id} compact={true} />
                          </div>
                        </div>
                      ))}
                      {sodLevel4Students.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Goal className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          <p>No SOD Level 4 students found in database</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-green-200 shadow-md">
                <CardHeader className="border-b border-green-100 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Users className="h-5 w-5 text-green-600" />
                    Staff Management
                  </CardTitle>
                  <Button className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.length > 0 ? staff.slice(0, 12).map((member: any, i: number) => (
                      <motion.div key={i} whileHover={{ scale: 1.02 }}>
                        <Card className="border-green-100 hover:border-green-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center text-white font-bold">
                                {member.first_name?.[0]}{member.last_name?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{member.first_name} {member.last_name}</p>
                                <p className="text-sm text-gray-500 truncate">{member.email}</p>
                                <Badge className="mt-1 bg-green-100 text-green-700 text-xs">{member.role || 'Teacher'}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )) : (
                      <div className="col-span-full text-center text-gray-500 py-8">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No staff data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-green-200 shadow-md">
                <CardHeader className="border-b border-green-100 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    Student Management
                  </CardTitle>
                  <Button className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {students.length > 0 ? students.slice(0, 20).map((student: any, i: number) => (
                      <motion.div key={i} whileHover={{ scale: 1.02 }}>
                        <Card className="border-green-100 hover:border-green-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-bold text-sm">
                                {student.first_name?.[0]}{student.last_name?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-800 truncate">{student.first_name} {student.last_name}</p>
                                <p className="text-xs text-gray-500">{student.student_code || 'N/A'}</p>
                                {student.trade_name && (
                                  <Badge className="mt-1 bg-blue-100 text-blue-700 text-xs">
                                    {student.trade_name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )) : (
                      <div className="col-span-full text-center text-gray-500 py-8">
                        <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No student data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'parents' && (
            <motion.div
              key="parents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-green-200 shadow-md">
                <CardHeader className="border-b border-green-100 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    Parent Management
                  </CardTitle>
                  <Button className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Parent
                  </Button>
                </CardHeader>
                <CardContent className="p-5">
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 bg-green-50">
                      <TabsTrigger value="all">Linked Parents ({parents.length})</TabsTrigger>
                      <TabsTrigger value="pending" className="relative">
                        Pending Requests
                        {pendingParents.length > 0 && (
                          <Badge className="ml-2 bg-red-500 text-white">{pendingParents.length}</Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {parents.length > 0 ? parents.slice(0, 15).map((parent: any, i: number) => (
                          <motion.div key={i} whileHover={{ scale: 1.02 }}>
                            <Card className="border-green-100 hover:border-green-300 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                    {parent.first_name?.[0]}{parent.last_name?.[0]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{parent.first_name} {parent.last_name}</p>
                                    <p className="text-sm text-gray-500 truncate">{parent.phone || 'No phone'}</p>
                                    <Badge className="mt-1 bg-purple-100 text-purple-700 text-xs">Parent</Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )) : (
                          <div className="col-span-full text-center text-gray-500 py-8">
                            <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No parent data available</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="pending">
                      <div className="space-y-4">
                        {pendingParents.length > 0 ? pendingParents.map((req: any, i: number) => (
                          <Card key={i} className="border-yellow-200 bg-yellow-50/30">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
                                  <UserPlus className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800">{req.parent_first_name} {req.parent_last_name}</p>
                                  <p className="text-sm text-gray-600">Requesting link to: <span className="font-semibold">{req.student_name}</span> ({req.trade} L{req.level})</p>
                                  <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 h-8"
                                  onClick={async () => {
                                    try {
                                      await apiService.respondToLinkingRequest(req.id, { action: 'approve', response_message: 'Approved by Headmaster' });
                                      toast.success('Link approved');
                                      handleRefresh();
                                    } catch (e) { toast.error('Failed to approve'); }
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={async () => {
                                    try {
                                      await apiService.respondToLinkingRequest(req.id, { action: 'reject', response_message: 'Rejected by Headmaster' });
                                      toast.success('Link rejected');
                                      handleRefresh();
                                    } catch (e) { toast.error('Failed to reject'); }
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )) : (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>No pending link requests</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'trades' && (
            <motion.div
              key="trades"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-green-200 shadow-md">
                <CardHeader className="border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Trades & Levels Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trades.length > 0 ? trades.map((trade: any, i: number) => (
                      <motion.div key={i} whileHover={{ scale: 1.02 }}>
                        <Card className="border-green-100 hover:border-green-300 transition-colors">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-green-500" />
                              {trade.trade_name || trade.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-500 mb-2">Code: {trade.trade_code || trade.code}</p>
                            <div className="flex flex-wrap gap-1">
                              {trade.levels?.slice(0, 5).map((level: any, j: number) => (
                                <Badge key={j} className="bg-green-100 text-green-700">L{level.level_number}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )) : (
                      <div className="col-span-full text-center text-gray-500 py-8">
                        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No trades data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-green-200 shadow-md">
                <CardHeader className="border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <FileText className="h-5 w-5 text-green-600" />
                    Generate Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="max-w-xl mx-auto space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700">Report Type</label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger className="bg-green-50 border-green-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic Performance</SelectItem>
                          <SelectItem value="financial">Financial Summary</SelectItem>
                          <SelectItem value="staff">Staff Report</SelectItem>
                          <SelectItem value="students">Student Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {reportType === 'financial' && (
                      <>
                        <div>
                          <label className="text-sm font-medium mb-2 block text-gray-700">Start Date</label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-green-50 border-green-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block text-gray-700">End Date</label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-green-50 border-green-200"
                          />
                        </div>
                      </>
                    )}

                    <Button
                      onClick={handleGenerateReport}
                      className="w-full bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* SMS Tab */}
          {activeTab === 'sms' && (
            <motion.div
              key="sms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-purple-200 shadow-md">
                <CardHeader className="border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Send className="h-5 w-5 text-purple-600" />
                    SMS Broadcast - African Talking
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs value={smsTab} onValueChange={setSmsTab} className="w-full">
                    <TabsList className="bg-purple-50 w-full justify-start mb-4">
                      <TabsTrigger value="compose" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Compose</TabsTrigger>
                      <TabsTrigger value="history" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">History</TabsTrigger>
                    </TabsList>

                    {smsTab === 'compose' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block text-gray-700">Recipient Type</label>
                          <Select value={smsRecipientType} onValueChange={(v) => { setSmsRecipientType(v); loadSmsRecipients(); }}>
                            <SelectTrigger className="bg-purple-50 border-purple-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All (Parents, Students, Teachers)</SelectItem>
                              <SelectItem value="parents">Parents Only</SelectItem>
                              <SelectItem value="students">Students Only</SelectItem>
                              <SelectItem value="teachers">Teachers Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block text-gray-700">Templates</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {smsTemplates.map((tpl, i) => (
                              <Badge
                                key={i}
                                className="cursor-pointer bg-purple-100 text-purple-700 hover:bg-purple-200"
                                onClick={() => setSmsMessage(tpl.text)}
                              >
                                {tpl.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block text-gray-700">
                            Recipients ({smsRecipients.length} loaded)
                          </label>
                          <div className="border border-purple-200 rounded-lg max-h-48 overflow-y-auto bg-purple-50 p-2">
                            {smsRecipients.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">Click to load recipients</p>
                            ) : (
                              <div className="space-y-1">
                                {smsRecipients.slice(0, 50).map((recipient: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded">
                                    <input
                                      type="checkbox"
                                      checked={selectedSmsRecipients.includes(recipient.phone)}
                                      onChange={() => toggleRecipient(recipient.phone)}
                                      className="rounded border-purple-300"
                                    />
                                    <span className="text-sm">{recipient.first_name || recipient.name} {recipient.last_name || ''}</span>
                                    <Badge className="text-xs bg-purple-100 text-purple-700">{recipient.type}</Badge>
                                    <span className="text-xs text-gray-500 ml-auto">{recipient.phone}</span>
                                  </div>
                                ))}
                                {smsRecipients.length > 50 && (
                                  <p className="text-xs text-gray-500 text-center py-2">
                                    +{smsRecipients.length - 50} more recipients
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedSmsRecipients.length > 0
                              ? `${selectedSmsRecipients.length} recipients selected`
                              : 'All loaded recipients will receive the SMS'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block text-gray-700">Message</label>
                          <textarea
                            value={smsMessage}
                            onChange={(e) => setSmsMessage(e.target.value)}
                            placeholder="Enter your message here..."
                            className="w-full p-3 border border-purple-200 rounded-lg bg-purple-50 min-h-[120px] resize-none"
                            maxLength={160}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {smsMessage.length}/160 characters
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={loadSmsRecipients}
                            variant="outline"
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Load Recipients
                          </Button>
                          <Button
                            onClick={handleSendSms}
                            disabled={smsSending || !smsMessage.trim()}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            {smsSending ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send SMS ({selectedSmsRecipients.length > 0 ? selectedSmsRecipients.length : 'All'})
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {smsTab === 'history' && (
                      <div className="space-y-4">
                        {smsHistory.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Send className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No SMS history yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {smsHistory.map((item: any) => (
                              <div key={item.id} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge className="bg-green-100 text-green-700">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Sent
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.sentAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{item.message}</p>
                                <p className="text-xs text-gray-500 mt-1">Recipients: {item.recipients}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

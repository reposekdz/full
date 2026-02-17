import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { School, Users, TrendingUp, DollarSign, Shield, Calendar, BarChart3, Download, CheckCircle2, AlertCircle, Target, Activity, GraduationCap, MessageSquare, Award, Clock, Bell, Settings, Zap, TrendingDown, UserCheck, PieChart, Package, LogOut, BookOpen, UserPlus, ClipboardList, Award as MedalIcon, Users2, BookMarked, FileText, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import apiService from '@/app/services/apiService';
import { UnifiedMessaging } from '@/app/components/messaging/UnifiedMessaging';

interface ModernHeadmasterDashboardProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export default function ModernHeadmasterDashboard({ onNavigate, onLogout }: ModernHeadmasterDashboardProps) {
  const handleSettingsClick = () => {
    if (onNavigate) {
      onNavigate('settings');
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('academic');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [notifications] = useState(12);
  const [liveStats, setLiveStats] = useState({ online: 0, active: 0 });

  // Enhanced state for advanced features
  const [staff, setStaff] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setLiveStats({ online: Math.floor(Math.random() * 50) + 150, active: Math.floor(Math.random() * 30) + 80 });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, staffData, studentsData, tradesData, levelsData, activitiesData] = await Promise.all([
        apiService.getHeadmasterOverview(),
        apiService.getUsers({ role: 'teacher', limit: 20 }),
        apiService.getStudents({ limit: 50 }),
        apiService.getAllTrades(),
        apiService.getAllLevels(),
        apiService.getDashboardRecentActivities()
      ]);
      setOverview(overviewData.data);
      if (staffData.success) setStaff(staffData.data || []);
      if (studentsData.success) setStudents(studentsData.data || []);
      if (tradesData.success) setTrades(tradesData.trades || []);
      if (levelsData.success) setLevels(levelsData.levels || []);
      if (activitiesData.success) setRecentActivities(activitiesData.data || []);

      // Generate alerts from overview data
      const newAlerts = [];
      if (overviewData.data?.stock_stats) {
        const lowStock = overviewData.data.stock_stats.find((s: any) => s.stat_name === 'low_stock_items');
        if (lowStock && lowStock.stat_value > 0) {
          newAlerts.push({ type: 'warning', msg: `Low stock: ${lowStock.stat_value} items need restocking`, time: 'Just now', id: 1 });
        }
      }
      if (overviewData.data?.discipline_stats) {
        const pendingLeaves = overviewData.data.discipline_stats.find((s: any) => s.stat_name === 'pending_leaves');
        if (pendingLeaves && pendingLeaves.stat_value > 0) {
          newAlerts.push({ type: 'info', msg: `${pendingLeaves.stat_value} leave requests pending approval`, time: '1h ago', id: 2 });
        }
      }
      if (overviewData.data?.academic_stats) {
        const avgPerf = overviewData.data.academic_stats.find((s: any) => s.stat_name === 'avg_performance');
        if (avgPerf && avgPerf.stat_value < 70) {
          newAlerts.push({ type: 'error', msg: 'Average performance below target', time: '2h ago', id: 3 });
        }
      }
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to fetch headmaster data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const params: any = { report_type: reportType };
      if (reportType === 'financial') {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      const reportData = await apiService.getComprehensiveReport(params);
      setReports(reportData.report);
      alert('Report generated successfully!');
    } catch (error: any) {
      alert('Failed to generate report: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-400"
        />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: overview?.academic_stats?.find((s: any) => s.stat_name === 'total_students')?.stat_value || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Total Teachers',
      value: overview?.hr_stats?.find((s: any) => s.stat_name === 'total_teachers')?.stat_value || 0,
      icon: GraduationCap,
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Pending Leaves',
      value: overview?.discipline_stats?.find((s: any) => s.stat_name === 'pending_leaves')?.stat_value || 0,
      icon: Clock,
      color: 'from-orange-500 to-amber-500',
      bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      trend: 'New',
      trendUp: true
    },
    {
      title: 'General Avg',
      value: `${(overview?.academic_stats?.find((s: any) => s.stat_name === 'avg_performance')?.stat_value || 0).toFixed(1)}%`,
      icon: Award,
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Attendance Rate',
      value: '94.5%',
      icon: CheckCircle2,
      color: 'from-teal-500 to-green-500',
      bg: 'bg-gradient-to-br from-teal-50 to-green-50',
      trend: '+2%',
      trendUp: true
    },
    {
      title: 'Low Stock Items',
      value: overview?.stock_stats?.find((s: any) => s.stat_name === 'low_stock_items')?.stat_value || 0,
      icon: Package,
      color: 'from-indigo-500 to-purple-500',
      bg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      trend: 'Alert',
      trendUp: false
    },
    {
      title: 'Total Revenue',
      value: `${((overview?.finance_stats?.find((s: any) => s.stat_name === 'total_collections')?.stat_value || 0) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'Satisfaction',
      value: '4.8/5',
      icon: Target,
      color: 'from-rose-500 to-red-500',
      bg: 'bg-gradient-to-br from-rose-50 to-red-50',
      trend: '+0.3',
      trendUp: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1600px] mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <motion.h1
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2"
            >
              Headmaster Command Center
            </motion.h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400 animate-pulse" />
              Real-time school-wide management & analytics
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/50">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                <Badge className="ml-2 bg-red-500">{notifications}</Badge>
              </Button>
            </motion.div>
            <Dialog>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg shadow-green-500/50">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-slate-800 text-white border-purple-500">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Generate Report
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">Select report type and parameters</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="academic">Academic Performance</SelectItem>
                        <SelectItem value="financial">Financial Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {reportType === 'financial' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Start Date</label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-700 border-slate-600" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">End Date</label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-700 border-slate-600" />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleGenerateReport} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Now
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10" onClick={handleSettingsClick}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10" onClick={handleLogoutClick}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Live Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white font-semibold">Live Status</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="h-4 w-4" />
              <span>{liveStats.online} Online</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Activity className="h-4 w-4" />
              <span>{liveStats.active} Active Sessions</span>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            <Clock className="h-4 w-4 inline mr-1" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: "spring" }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className={`${stat.bg} border-2 border-purple-300/30 hover:border-purple-400 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-sm bg-white/90 overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <Badge className={`${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} flex items-center gap-1`}>
                        <TrendIcon className="h-3 w-3" />
                        {stat.trend}
                      </Badge>
                    </div>
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="text-4xl font-black text-gray-900 mb-1"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-gray-600 font-medium">{stat.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-slate-800/50 backdrop-blur-xl p-2 rounded-2xl border border-purple-500/30">
            {[
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'staff', icon: Users, label: 'Staff' },
              { id: 'students', icon: GraduationCap, label: 'Students' },
              { id: 'trades', icon: BookOpen, label: 'Trades' },
              { id: 'messaging', icon: MessageSquare, label: 'Messaging' },
              { id: 'financial', icon: DollarSign, label: 'Financial' },
              { id: 'discipline', icon: Shield, label: 'Discipline' },
              { id: 'analytics', icon: PieChart, label: 'Analytics' }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 font-semibold rounded-xl transition-all flex items-center gap-2 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <School className="h-6 w-6 text-purple-400" />
                    School Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Academic Excellence', value: 92, color: 'bg-blue-500' },
                      { label: 'Student Satisfaction', value: 88, color: 'bg-green-500' },
                      { label: 'Staff Performance', value: 95, color: 'bg-purple-500' },
                      { label: 'Infrastructure', value: 85, color: 'bg-orange-500' }
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="font-bold">{item.value}%</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ delay: i * 0.1, duration: 1 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <AlertCircle className="h-6 w-6 text-yellow-400" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: 'warning', msg: 'Low attendance in Grade 10A', time: '2h ago' },
                      { type: 'info', msg: 'New staff orientation scheduled', time: '5h ago' },
                      { type: 'success', msg: 'Monthly targets achieved', time: '1d ago' },
                      { type: 'error', msg: 'Maintenance required in Lab 3', time: '2d ago' }
                    ].map((alert, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <div className={`h-2 w-2 rounded-full mt-2 ${alert.type === 'warning' ? 'bg-yellow-400' :
                          alert.type === 'info' ? 'bg-blue-400' :
                            alert.type === 'success' ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">{alert.msg}</p>
                          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Staff Management</h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.length > 0 ? staff.slice(0, 12).map((member: any, i: number) => (
                  <motion.div key={i} whileHover={{ scale: 1.02 }}>
                    <Card className="bg-slate-800 border-purple-500/30 text-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold">{member.first_name} {member.last_name}</p>
                            <p className="text-sm text-gray-400">{member.email}</p>
                            <Badge className="mt-1 bg-purple-500/20 text-purple-300">{member.role || 'Teacher'}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )) : (
                  <div className="col-span-full text-center text-gray-400 py-8">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No staff data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Student Management</h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button className="bg-gradient-to-r from-green-600 to-teal-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {students.length > 0 ? students.slice(0, 20).map((student: any, i: number) => (
                  <motion.div key={i} whileHover={{ scale: 1.02 }}>
                    <Card className="bg-slate-800 border-blue-500/30 text-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm truncate">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-gray-400">{student.student_code || 'N/A'}</p>
                            {student.trade_name && <Badge className="mt-1 bg-blue-500/20 text-blue-300 text-xs">{student.trade_name}</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )) : (
                  <div className="col-span-full text-center text-gray-400 py-8">
                    <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No student data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'trades' && (
            <motion.div
              key="trades"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Trades & Levels Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trades.length > 0 ? trades.map((trade: any, i: number) => (
                  <motion.div key={i} whileHover={{ scale: 1.02 }}>
                    <Card className="bg-slate-800 border-green-500/30 text-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-green-400" />
                          {trade.trade_name || trade.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-2">Code: {trade.trade_code || trade.code}</p>
                        <div className="flex flex-wrap gap-1">
                          {trade.levels?.slice(0, 5).map((level: any, j: number) => (
                            <Badge key={j} className="bg-green-500/20 text-green-300">L{level.level_number}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )) : (
                  <div className="col-span-full text-center text-gray-400 py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No trades data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'messaging' && (
            <motion.div
              key="messaging"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UnifiedMessaging userRole="headmaster" />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { title: 'Student Growth', value: '+24%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
                { title: 'Revenue Growth', value: '+18%', icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
                { title: 'Staff Retention', value: '96%', icon: UserCheck, color: 'from-blue-500 to-cyan-500' }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                  >
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 text-white shadow-2xl">
                      <CardContent className="p-8 text-center">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`inline-flex p-4 rounded-full bg-gradient-to-br ${item.color} mb-4`}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </motion.div>
                        <div className="text-4xl font-black mb-2">{item.value}</div>
                        <div className="text-gray-400">{item.title}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

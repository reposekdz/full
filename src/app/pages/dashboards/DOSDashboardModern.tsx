import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp, Calendar, FileText, BarChart3, RefreshCw, Bell, LogOut, Search, Grid, Award, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Progress } from '@/app/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:3000/api';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

const StatCard = ({ label, value, icon, gradient, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
    whileHover={{ y: -4, scale: 1.02 }}
  >
    <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient} text-white`}>
      <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-white/80 font-medium">{label}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function DOSDashboard({ onNavigate, onLogout, user }: any) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    avgAttendance: 0,
    avgGrade: 0,
    pendingReports: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/comprehensive-roles/students-summary`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStats({
          totalStudents: data.summary?.total_students || 0,
          totalTeachers: data.summary?.total_teachers || 0,
          avgAttendance: data.summary?.avg_attendance || 0,
          avgGrade: data.summary?.avg_grade || 0,
          pendingReports: data.summary?.pending_reports || 0
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'global-sheets', label: 'Global Sheets', icon: Grid },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
              <BookOpen className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Garden TVET</h1>
              <p className="text-xs text-slate-500">Director of Studies</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-[18px] text-muted-foreground" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {stats.pendingReports}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pending Reports</TooltipContent>
            </Tooltip>
            {onLogout && (
              <Button variant="outline" size="sm" onClick={onLogout} className="text-red-600 border-red-200 hover:bg-red-50">
                <LogOut className="size-[18px] mr-1" />
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 px-4 py-2 bg-slate-50">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-100'}`}
              >
                <tab.icon className="size-3.5 mr-1" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
            <Progress value={65} className="h-1" />
          </motion.div>
        )}

        {/* Brand Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-r from-[#1565C0] via-[#1976D2] to-[#0D47A1] text-white shadow-xl">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">Garden TVET School</h2>
                  <p className="text-sm text-white/80">Academic Management System</p>
                  <p className="text-xs text-white/50 italic">Gucunga Amasomo y'Ishuri</p>
                </div>
                <Button
                  onClick={fetchStats}
                  className="bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
                >
                  <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard index={0} label="Total Students" value={stats.totalStudents}
                  icon={<Users className="size-6" />}
                  gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
                <StatCard index={1} label="Total Teachers" value={stats.totalTeachers}
                  icon={<Users className="size-6" />}
                  gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
                <StatCard index={2} label="Avg Attendance" value={`${stats.avgAttendance}%`}
                  icon={<CheckCircle className="size-6" />}
                  gradient="bg-gradient-to-br from-purple-500 to-pink-600" />
                <StatCard index={3} label="Avg Grade" value={stats.avgGrade}
                  icon={<Award className="size-6" />}
                  gradient="bg-gradient-to-br from-orange-500 to-red-600" />
                <StatCard index={4} label="Pending Reports" value={stats.pendingReports}
                  icon={<Clock className="size-6" />}
                  gradient="bg-gradient-to-br from-teal-500 to-cyan-600" />
              </div>

              {/* Quick Actions */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setActiveTab('global-sheets')} className="bg-blue-600 hover:bg-blue-700">
                      <Grid className="size-4 mr-2" />
                      View Global Sheets
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('timetable')}>
                      <Calendar className="size-4 mr-2" />
                      Generate Timetable
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('reports')}>
                      <FileText className="size-4 mr-2" />
                      Generate Reports
                    </Button>
                    <Button variant="outline" onClick={fetchStats}>
                      <RefreshCw className="size-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'global-sheets' && (
            <div className="h-[calc(100vh-180px)]">
              <GlobalStudentSheets
                userRole={user?.role || 'dos'}
                userId={user?.id || 0}
                onNavigate={onNavigate}
              />
            </div>
          )}

          {activeTab === 'timetable' && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Timetable Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Timetable generation and management features coming soon...</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'reports' && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Report Card Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Report card generation features coming soon...</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Academic Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics and insights features coming soon...</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

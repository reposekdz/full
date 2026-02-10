import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import apiService from '@/app/services/apiService';
import { 
  School, 
  Users, 
  TrendingUp, 
  DollarSign, 
  BookOpen,
  Trophy,
  Shield,
  Wrench,
  BarChart3,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  Target,
  Activity,
  FileText,
  ClipboardList,
  Award,
  Bell,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import LeftSidebar from '@/app/components/LeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';
import ComprehensiveAnalyticsDashboard from '@/app/components/analytics/ComprehensiveAnalyticsDashboard';
import HRManagementDashboard from '@/app/components/hr/HRManagementDashboard';
import InventoryManagementDashboard from '@/app/components/inventory/InventoryManagementDashboard';
import EventManagementDashboard from '@/app/components/events/EventManagementDashboard';
import CommunicationHubDashboard from '@/app/components/communication/CommunicationHubDashboard';
import StaffDynamicSheetsDashboard from '@/app/components/staff/StaffDynamicSheetsDashboard';
import ClassLevelSheetsDashboard from '@/app/components/admin/ClassLevelSheetsDashboard';
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
import { ApplicationManagementDashboard } from '@/app/components/ApplicationManagementDashboard';

interface HeadMasterDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const HeadMasterDashboard: React.FC<HeadMasterDashboardProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await apiService.getHeadMasterDashboard();
        if (res.success) {
          setDashboardData(res);
        }
      } catch (error) {
        console.error('Error fetching headmaster dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Abanyeshuri Bose',
      value: dashboardData?.stats?.total_students?.toLocaleString() || '1,248',
      change: '+5.2%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Abarimu',
      value: dashboardData?.stats?.total_teachers?.toLocaleString() || '84',
      change: '+3.5%',
      trend: 'up',
      icon: GraduationCap,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Amafaranga',
      value: dashboardData?.stats?.total_revenue ? `RWF ${dashboardData.stats.total_revenue.toLocaleString()}` : 'RWF 45M',
      change: '+12.8%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Imikorere Rusange',
      value: dashboardData?.stats?.overall_performance ? `${dashboardData.stats.overall_performance}%` : '92.5%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

  const departments = dashboardData?.departments || [
    {
      name: 'Amashuri',
      head: 'Dr. Sarah Johnson',
      performance: 87,
      status: 'excellent',
      icon: BookOpen,
      color: 'from-yellow-500 to-amber-500',
      students: 1248,
      trend: 'up'
    },
    {
      name: 'Imyitwarire',
      head: 'Ms. Emily Roberts',
      performance: 94,
      status: 'excellent',
      icon: Shield,
      color: 'from-green-500 to-teal-500',
      incidents: 23,
      trend: 'down'
    },
    {
      name: 'Siporo',
      head: 'Coach Mike Williams',
      performance: 85,
      status: 'good',
      icon: Trophy,
      color: 'from-orange-500 to-red-500',
      events: 12,
      trend: 'up'
    },
    {
      name: 'Amafaranga',
      head: 'Mrs. Patricia Lee',
      performance: 96,
      status: 'excellent',
      icon: DollarSign,
      color: 'from-blue-500 to-indigo-500',
      revenue: 'RWF 45M',
      trend: 'up'
    },
    {
      name: 'IT & Maintenance',
      head: 'Mr. James Anderson',
      performance: 88,
      status: 'good',
      icon: Wrench,
      color: 'from-purple-500 to-pink-500',
      tickets: 15,
      trend: 'down'
    },
    {
      name: 'Administration',
      head: 'Mr. David Chen',
      performance: 91,
      status: 'excellent',
      icon: Briefcase,
      color: 'from-teal-500 to-cyan-500',
      tasks: 28,
      trend: 'up'
    },
  ];

  const recentActivities = dashboardData?.recentActivities || [
    {
      title: 'Ikizamini cya National yasozwe',
      department: 'Amashuri',
      time: '1 isaha ishize',
      type: 'exam',
      status: 'completed',
      priority: 'high'
    },
    {
      title: 'Raporo y\'amafaranga yasohotse',
      department: 'Amafaranga',
      time: '3 amasaha ashize',
      type: 'finance',
      status: 'completed',
      priority: 'high'
    },
    {
      title: 'Inama y\'abarimu',
      department: 'Amashuri',
      time: 'Ejo',
      type: 'meeting',
      status: 'scheduled',
      priority: 'medium'
    },
    {
      title: 'Sistema nshya y\'IT',
      department: 'IT',
      time: '5 amasaha ashize',
      type: 'technology',
      status: 'in_progress',
      priority: 'medium'
    },
    {
      title: 'Umukino wa Basketball',
      department: 'Siporo',
      time: 'Ejo',
      type: 'sports',
      status: 'scheduled',
      priority: 'low'
    },
  ];

  const upcomingEvents = dashboardData?.upcomingEvents || [
    {
      title: 'Inama y\'Ababyeyi',
      date: 'Jan 25, 2026',
      time: '14:00',
      location: 'Ikibuga Kinini',
      attendees: 120,
      type: 'meeting'
    },
    {
      title: 'Ikizamini cya Semester',
      date: 'Feb 1, 2026',
      time: '08:00',
      location: 'Amaklasi Yose',
      attendees: 1248,
      type: 'exam'
    },
    {
      title: 'Irushanwa rya Siporo',
      date: 'Feb 5, 2026',
      time: '10:00',
      location: 'Ikibuga cya Siporo',
      attendees: 500,
      type: 'sports'
    },
    {
      title: 'Imihango yo Kwihana',
      date: 'Feb 10, 2026',
      time: '09:00',
      location: 'Ikibuga Kinini',
      attendees: 200,
      type: 'ceremony'
    },
  ];

  const schoolPerformance = dashboardData?.schoolPerformance || [
    {
      category: 'Amasomo',
      score: 87,
      target: 90,
      status: 'progress'
    },
    {
      category: 'Imyitwarire',
      score: 94,
      target: 95,
      status: 'excellent'
    },
    {
      category: 'Siporo',
      score: 85,
      target: 85,
      status: 'target'
    },
    {
      category: 'Amafaranga',
      score: 96,
      target: 90,
      status: 'excellent'
    },
    {
      category: 'Infrastructure',
      score: 88,
      target: 90,
      status: 'progress'
    },
  ];

  const keyMetrics = dashboardData?.keyMetrics || [
    { label: 'Kwitabira', value: '96.8%', change: '+1.2%', trend: 'up', color: 'text-green-600' },
    { label: 'Gusubira Inyuma', value: '2.3%', change: '-0.8%', trend: 'down', color: 'text-green-600' },
    { label: 'Kwinjiza Amafaranga', value: '98.5%', change: '+2.5%', trend: 'up', color: 'text-green-600' },
    { label: 'Uko Abarimu Bimeze', value: '91.2%', change: '+0.5%', trend: 'up', color: 'text-green-600' },
    { label: 'Ibikoresho', value: '94.7%', change: '+1.8%', trend: 'up', color: 'text-green-600' },
    { label: 'Ihiganwa', value: '88.4%', change: '+3.2%', trend: 'up', color: 'text-green-600' },
  ];

  const strategicGoals = dashboardData?.strategicGoals || [
    {
      goal: 'Kuzamura Ubwiza bw\'Amasomo',
      progress: 75,
      deadline: 'Jun 2026',
      status: 'on_track',
      tasks: 12,
      completed: 9
    },
    {
      goal: 'Kwagura Infrastructure',
      progress: 60,
      deadline: 'Dec 2026',
      status: 'on_track',
      tasks: 15,
      completed: 9
    },
    {
      goal: 'Guhuza Tekinolojiya',
      progress: 85,
      deadline: 'Mar 2026',
      status: 'ahead',
      tasks: 10,
      completed: 8
    },
    {
      goal: 'Gushyira mu Bikorwa Siporo',
      progress: 45,
      deadline: 'Aug 2026',
      status: 'at_risk',
      tasks: 20,
      completed: 9
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
        <LeftSidebar currentPage="dashboard" onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <UniversalMessagingWidget />
      <LeftSidebar currentPage="dashboard" onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                  Ikibanza cy'Umuyobozi Mukuru
                </h1>
                <p className="text-gray-600 mt-2">Gucunga ishuri muri rusange n\'ibyerekeye byose</p>
              </div>
              <div className="flex space-x-3">
                <Button className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Raporo Rusange
                </Button>
                <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Ibirori Bishya
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className={`border-2 border-yellow-200 ${stat.bgColor} hover:shadow-xl transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <Badge className={`${
                            stat.trend === 'up' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {stat.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {stat.change}
                          </Badge>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:grid-cols-15 bg-white border-2 border-yellow-200 p-1 gap-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Incamake
              </TabsTrigger>
              <TabsTrigger value="global-sheets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Global Sheets
              </TabsTrigger>
              <TabsTrigger value="applications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amasaba
              </TabsTrigger>
              <TabsTrigger value="departments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Ibice
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Imikorere
              </TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Intego
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Ibirori
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Raporo
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="hr" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                HR
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Inventory
              </TabsTrigger>
              <TabsTrigger value="events-mgmt" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Events
              </TabsTrigger>
              <TabsTrigger value="communication" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Messages
              </TabsTrigger>
              <TabsTrigger value="staff-sheets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Staff Performance
              </TabsTrigger>
              <TabsTrigger value="class-sheets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Class Sheets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="global-sheets">
              <GlobalStudentSheets onNavigate={onNavigate} />
            </TabsContent>

            <TabsContent value="applications">
              <ApplicationManagementDashboard />
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Activity className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibikorwa Biheruka
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {recentActivities.map((activity, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{activity.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{activity.department}</p>
                              </div>
                              <Badge className={
                                activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                                activity.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }>
                                {activity.priority === 'high' ? 'Ngombwa' : activity.priority === 'medium' ? 'Byiciriritse' : 'Byoroshye'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{activity.time}</span>
                              <Badge variant="outline" className={
                                activity.status === 'completed' ? 'border-green-300 text-green-700' :
                                activity.status === 'in_progress' ? 'border-orange-300 text-orange-700' :
                                'border-blue-300 text-blue-700'
                              }>
                                {activity.status === 'completed' ? 'Byarangiye' : 
                                 activity.status === 'in_progress' ? 'Birakorwa' : 'Biteguwe'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Target className="h-5 w-5 mr-2 text-yellow-600" />
                      Imibare Ngombwa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="grid grid-cols-2 gap-4">
                        {keyMetrics.map((metric, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 transition-all bg-gradient-to-br from-yellow-50 to-green-50">
                            <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
                            <p className="text-2xl font-black text-gray-900">{metric.value}</p>
                            <div className="flex items-center mt-2">
                              {metric.trend === 'up' ? (
                                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                              )}
                              <span className={`text-xs font-bold ${metric.color}`}>
                                {metric.change}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-5 w-5 mr-2 text-yellow-600" />
                    Imikorere y\'Ishuri Rusange
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schoolPerformance.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg border-2 border-yellow-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900">{item.category}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Intego: {item.target}%</span>
                            <Badge className={
                              item.status === 'excellent' ? 'bg-green-100 text-green-700' :
                              item.status === 'target' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {item.status === 'excellent' ? 'Byiza' : 
                               item.status === 'target' ? 'Ku Ntego' : 'Iterambere'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.score}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-full rounded-full ${
                                item.status === 'excellent' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                                item.status === 'target' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                'bg-gradient-to-r from-yellow-500 to-orange-500'
                              }`}
                            />
                          </div>
                          <span className="font-bold text-lg text-gray-900 min-w-[50px]">{item.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="departments" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept, index) => {
                  const Icon = dept.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all h-full">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${dept.color}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <Badge className={
                              dept.status === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }>
                              {dept.status === 'excellent' ? 'Byiza Cyane' : 'Byiza'}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-black text-gray-900 mb-1">{dept.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{dept.head}</p>
                          
                          <div className="space-y-3 mb-4">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Imikorere</span>
                                <span className="text-sm font-bold text-gray-900">{dept.performance}%</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full bg-gradient-to-r ${dept.color}`}
                                  style={{ width: `${dept.performance}%` }}
                                />
                              </div>
                            </div>
                            
                            {dept.students && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Abanyeshuri:</span>
                                <Badge variant="outline">{dept.students}</Badge>
                              </div>
                            )}
                            {dept.incidents !== undefined && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Impamvu:</span>
                                <Badge variant="outline">{dept.incidents}</Badge>
                              </div>
                            )}
                            {dept.events && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Ibirori:</span>
                                <Badge variant="outline">{dept.events}</Badge>
                              </div>
                            )}
                            {dept.revenue && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Amafaranga:</span>
                                <Badge variant="outline">{dept.revenue}</Badge>
                              </div>
                            )}
                            {dept.tickets && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Tickets:</span>
                                <Badge variant="outline">{dept.tickets}</Badge>
                              </div>
                            )}
                            {dept.tasks && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Imirimo:</span>
                                <Badge variant="outline">{dept.tasks}</Badge>
                              </div>
                            )}
                          </div>

                          <Button className="w-full" variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-2" />
                            Reba Amakuru
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Imikorere y\'Ishuri - Imibare Irambuye</CardTitle>
                  <CardDescription>Gusuzuma imikorere y\'ishuri muri rusange</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {keyMetrics.map((metric, index) => (
                      <Card key={index} className="border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-green-50">
                        <CardContent className="p-6">
                          <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
                          <p className="text-3xl font-black text-gray-900 mb-2">{metric.value}</p>
                          <div className="flex items-center">
                            {metric.trend === 'up' ? (
                              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                            )}
                            <span className={`text-sm font-bold ${metric.color}`}>
                              {metric.change} vuba aha
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Imikorere y\'Ibice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200">
                          <th className="text-left p-3 font-bold text-gray-700">Igice</th>
                          <th className="text-left p-3 font-bold text-gray-700">Umuyobozi</th>
                          <th className="text-left p-3 font-bold text-gray-700">Imikorere</th>
                          <th className="text-left p-3 font-bold text-gray-700">Status</th>
                          <th className="text-left p-3 font-bold text-gray-700">Icyerekezo</th>
                          <th className="text-left p-3 font-bold text-gray-700">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((dept, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50">
                            <td className="p-3 font-bold">{dept.name}</td>
                            <td className="p-3 text-sm">{dept.head}</td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full bg-gradient-to-r ${dept.color}`}
                                    style={{ width: `${dept.performance}%` }}
                                  />
                                </div>
                                <span className="font-bold text-sm">{dept.performance}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge className={
                                dept.status === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }>
                                {dept.status === 'excellent' ? 'Byiza Cyane' : 'Byiza'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {dept.trend === 'up' ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-red-600" />
                              )}
                            </td>
                            <td className="p-3">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Reba
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Target className="h-5 w-5 mr-2 text-yellow-600" />
                    Intego z\'Ishuri - Gahunda Nderabuzima
                  </CardTitle>
                  <CardDescription>Gukurikirana intego n\'ibikorwa by\'ishuri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {strategicGoals.map((goal, index) => (
                      <div key={index} className="p-6 rounded-lg border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-green-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900">{goal.goal}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-600">Itariki: {goal.deadline}</span>
                              <Badge variant="outline" className="text-xs">
                                {goal.completed}/{goal.tasks} imirimo
                              </Badge>
                            </div>
                          </div>
                          <Badge className={
                            goal.status === 'ahead' ? 'bg-green-100 text-green-700' :
                            goal.status === 'at_risk' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {goal.status === 'ahead' ? 'Imbere' : 
                             goal.status === 'at_risk' ? 'Mu Kaga' : 'Ku Murongo'}
                          </Badge>
                        </div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Iterambere</span>
                            <span className="text-lg font-bold text-gray-900">{goal.progress}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${goal.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-full rounded-full ${
                                goal.status === 'ahead' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                                goal.status === 'at_risk' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                'bg-gradient-to-r from-yellow-500 to-green-500'
                              }`}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between mt-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-2" />
                            Reba Ibisobanuro
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-2" />
                            Hindura
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibirori Bizaza
                    </CardTitle>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Ongeraho
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <Card key={index} className="border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900">{event.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                            </div>
                            <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                              {event.type === 'meeting' ? 'Inama' :
                               event.type === 'exam' ? 'Ikizamini' :
                               event.type === 'sports' ? 'Siporo' : 'Ihembo'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{event.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{event.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{event.attendees} abantu</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-2" />
                              Reba
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-3 w-3 mr-2" />
                              Hindura
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Raporo Rusange</h3>
                    <p className="text-sm text-gray-600 mb-4">Raporo yuzuye y\'ishuri</p>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Kuramo
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Imibare</h3>
                    <p className="text-sm text-gray-600 mb-4">Imibare y\'imikorere</p>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      Reba
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Amafaranga</h3>
                    <p className="text-sm text-gray-600 mb-4">Raporo y\'amafaranga</p>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Kuramo
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <ClipboardList className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Raporo Yihariye</h3>
                    <p className="text-sm text-gray-600 mb-4">Kora raporo yihariye</p>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Kora
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <ComprehensiveAnalyticsDashboard userRole="headmaster" userId={1} />
            </TabsContent>

            <TabsContent value="hr">
              <HRManagementDashboard userRole="headmaster" userId={1} />
            </TabsContent>

            <TabsContent value="inventory">
              <InventoryManagementDashboard userRole="headmaster" userId={1} />
            </TabsContent>

            <TabsContent value="events-mgmt">
              <EventManagementDashboard userRole="headmaster" userId={1} />
            </TabsContent>

            <TabsContent value="communication">
              <CommunicationHubDashboard userRole="headmaster" userId={1} />
            </TabsContent>

            <TabsContent value="staff-sheets">
              <StaffDynamicSheetsDashboard userRole="headmaster" userId={1} />
            </TabsContent>

            <TabsContent value="class-sheets">
              <ClassLevelSheetsDashboard userRole="headmaster" userId={1} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default HeadMasterDashboard;

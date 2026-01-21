import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Award, 
  FileText,
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Target,
  BarChart3,
  ClipboardList,
  UserCheck,
  UserX,
  Bell,
  RefreshCw,
  BookOpen,
  GraduationCap,
  LogOut,
  Home,
  Settings,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Activity,
  TrendingUp as TrendUp,
  PieChart,
  UserPlus,
  FileSearch,
  Trash2,
  Archive,
  AlertOctagon,
  Bookmark,
  Flag,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Coffee,
  Monitor,
  Wifi,
  Database,
  Server
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import LeftSidebar from '@/app/components/LeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import DOSService, { 
  Student as APIStudent, 
  ConductRecord, 
  AnalyticsOverview, 
  TradeLevel,
  CreateStudentRequest,
  CreateConductRequest
} from '@/app/services/dosService';

interface DirectorDisciplineDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DirectorDisciplineDashboard: React.FC<DirectorDisciplineDashboardProps> = ({ onNavigate, onLogout }) => {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<APIStudent[]>([]);
  const [conducts, setConducts] = useState<ConductRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [trades, setTrades] = useState<TradeLevel[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<APIStudent | null>(null);
  const [isAddConductOpen, setIsAddConductOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isRemoveConductOpen, setIsRemoveConductOpen] = useState(false);
  const [selectedConduct, setSelectedConduct] = useState<ConductRecord | null>(null);
  const [notifyParent, setNotifyParent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Enhanced UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<APIStudent | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form states for adding conduct
  const [conductForm, setConductForm] = useState<Partial<CreateConductRequest>>({
    incident_type: 'negative',
    severity: 'medium',
    title: '',
    description: '',
    location: '',
    action_taken: '',
    points_awarded: 0,
    points_deducted: 0,
    parent_notification: true
  });

  // Form state for adding student
  const [studentForm, setStudentForm] = useState<Partial<CreateStudentRequest>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    trade_code: '',
    level_number: 3,
    level_suffix: '',
    address: '',
    emergency_contact: '',
    medical_info: '',
    parent_info: {
      first_name: '',
      last_name: '',
      phone: '',
      email: ''
    }
  });

  // Fetch all data when component mounts
  useEffect(() => {
    fetchAllData();
  }, [currentPage, selectedTrade, selectedLevel, selectedStatus, searchQuery]);

  const fetchAllData = async (showRefreshIndicator = true) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    }
    setLoading(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchConductRecords(),
        fetchAnalytics(),
        fetchTrades()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  const handleRefresh = async () => {
    await fetchAllData(true);
  };

  const fetchStudents = async () => {
    try {
      const response = await DOSService.getStudents({
        page: currentPage,
        limit: 20,
        trade: selectedTrade || undefined,
        level: selectedLevel ? parseInt(selectedLevel) : undefined,
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
        sort_by: 'last_name',
        sort_order: 'ASC'
      });
      
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchConductRecords = async () => {
    try {
      const response = await DOSService.getConductRecords({
        page: 1,
        limit: 50,
        sort_by: 'incident_date',
        sort_order: 'DESC'
      });
      
      setConducts(response.data.conducts);
    } catch (error) {
      console.error('Error fetching conduct records:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await DOSService.getAnalyticsOverview();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchTrades = async () => {
    try {
      const response = await DOSService.getTrades();
      setTrades(response.data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  // Calculate stats from real data
  const stats = [
    {
      title: 'Abanyeshuri Bose',
      value: analytics?.overall_statistics?.total_students?.toString() || '0',
      change: '+5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Impamvu Mbi',
      value: conducts.filter(c => c.incident_type === 'negative').length.toString(),
      change: '-15%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Ibihembo',
      value: conducts.filter(c => c.incident_type === 'positive').length.toString(),
      change: '+8%',
      trend: 'up',
      icon: Award,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Imyitwarire Myiza',
      value: analytics?.overall_statistics?.overall_conduct_score 
        ? `${Math.round(analytics.overall_statistics.overall_conduct_score)}%` 
        : '0%',
      change: '+3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
  ];

  const handleAddConduct = (student: APIStudent) => {
    setSelectedStudent(student);
    setConductForm({
      ...conductForm,
      student_id: student.id,
      trade_class_id: student.class_id,
      reported_by: 1
    });
    setIsAddConductOpen(true);
  };

  const handleRemoveConduct = (conduct: ConductRecord) => {
    setSelectedConduct(conduct);
    setIsRemoveConductOpen(true);
  };

  const confirmRemoveConduct = async () => {
    if (selectedConduct) {
      try {
        await DOSService.deleteConductRecord(selectedConduct.id);
        await fetchConductRecords();
        alert('Conduct record removed successfully');
      } catch (error) {
        console.error('Error removing conduct record:', error);
        alert('Failed to remove conduct record');
      }
      
      setIsRemoveConductOpen(false);
      setSelectedConduct(null);
    }
  };

  const confirmAddConduct = async () => {
    if (!conductForm.title || !conductForm.description || !conductForm.student_id) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const conductData: CreateConductRequest = {
        student_id: conductForm.student_id!,
        trade_class_id: conductForm.trade_class_id,
        incident_type: conductForm.incident_type || 'negative',
        severity: conductForm.severity || 'medium',
        title: conductForm.title!,
        description: conductForm.description!,
        location: conductForm.location,
        incident_date: new Date().toISOString(),
        reported_by: conductForm.reported_by || 1,
        action_taken: conductForm.action_taken,
        points_awarded: conductForm.points_awarded || 0,
        points_deducted: conductForm.points_deducted || 0,
        parent_notification: conductForm.parent_notification
      };

      await DOSService.createConductRecord(conductData);
      await fetchConductRecords();
      alert('Conduct record added successfully');
      
      setConductForm({
        incident_type: 'negative',
        severity: 'medium',
        title: '',
        description: '',
        location: '',
        action_taken: '',
        points_awarded: 0,
        points_deducted: 0,
        parent_notification: true
      });
    } catch (error) {
      console.error('Error adding conduct record:', error);
      alert('Failed to add conduct record');
    }
    
    setIsAddConductOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Modern Sidebar */}
      <motion.div 
        className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transition-all duration-300 flex flex-col`}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DOS Dashboard
                </h2>
                <p className="text-sm text-gray-600 mt-1">Director of Studies Management</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hover:bg-blue-50"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          {[
            { key: 'overview', icon: Home, label: 'Overview', color: 'blue' },
            { key: 'students', icon: Users, label: 'Students', color: 'green' },
            { key: 'conduct', icon: ClipboardList, label: 'Conduct Records', color: 'yellow' },
            { key: 'analytics', icon: BarChart3, label: 'Analytics', color: 'purple' },
            { key: 'reports', icon: FileText, label: 'Reports', color: 'orange' },
            { key: 'timetable', icon: Calendar, label: 'Timetable', color: 'teal' },
            { key: 'teachers', icon: GraduationCap, label: 'Teachers', color: 'indigo' }
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.key;
            
            return (
              <motion.button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'justify-start p-4'} rounded-xl transition-all duration-200 ${
                  isActive 
                    ? `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white shadow-lg` 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconComponent className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {!sidebarCollapsed && isActive && (
                  <motion.div
                    className="ml-auto"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50">
          <Button
            variant="ghost"
            onClick={onLogout}
            className={`w-full ${sidebarCollapsed ? 'px-2' : ''} text-red-600 hover:bg-red-50`}
          >
            <LogOut className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
            {!sidebarCollapsed && 'Logout'}
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DOS Management Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive student conduct and academic oversight</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  <Badge className="ml-2 bg-red-500 text-white px-1 py-0 text-xs">
                    {conducts.filter(c => c.status === 'pending').length}
                  </Badge>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 border-gray-200 hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                              <div className="flex items-center mt-2">
                                {stat.trend === 'up' ? (
                                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                )}
                                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                  {stat.change}
                                </span>
                                <span className="text-sm text-gray-500 ml-1">from last month</span>
                              </div>
                            </div>
                            <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                      Recent Incidents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {conducts.slice(0, 5).map((conduct, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-all">
                            <div className={`w-3 h-3 rounded-full ${
                              conduct.incident_type === 'negative' ? 'bg-red-500' : 
                              conduct.incident_type === 'positive' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{conduct.title}</p>
                              <p className="text-sm text-gray-600">{conduct.student_name || 'Unknown Student'}</p>
                              <p className="text-xs text-gray-500">{new Date(conduct.incident_date).toLocaleDateString('rw-RW')}</p>
                            </div>
                            <Badge variant={conduct.incident_type === 'negative' ? 'destructive' : 'default'}>
                              {conduct.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Award className="h-5 w-5 mr-2 text-yellow-600" />
                      Recognition & Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {conducts.filter(c => c.incident_type === 'positive').slice(0, 5).map((conduct, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-50 transition-all">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{conduct.title}</p>
                              <p className="text-sm text-gray-600">{conduct.student_name || 'Unknown Student'}</p>
                              <p className="text-xs text-gray-500">{new Date(conduct.incident_date).toLocaleDateString('rw-RW')}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium text-yellow-600">{conduct.points_awarded || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Student Management</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                      <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Trade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Trades</SelectItem>
                          {trades.map((trade) => (
                            <SelectItem key={trade.trade_code} value={trade.trade_code}>
                              {trade.trade_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {students.map((student) => (
                        <Card key={student.id} className="border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                                  {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{student.first_name} {student.last_name}</h4>
                                <p className="text-sm text-gray-600">{student.student_id}</p>
                                <Badge className="mt-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                  {student.trade_name}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Conduct Score:</span>
                                <span className="font-bold text-green-600">{student.conduct_score || 0}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Attendance:</span>
                                <span className="font-bold text-blue-600">{student.attendance_percentage || 0}%</span>
                              </div>
                            </div>

                            <div className="flex space-x-2 mt-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                                onClick={() => handleAddConduct(student)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Record
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conduct" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Conduct Records</CardTitle>
                  <CardDescription>Review and manage student conduct records</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {conducts.map((conduct) => (
                        <Card key={conduct.id} className="border border-gray-200 hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`w-4 h-4 rounded-full ${
                                  conduct.incident_type === 'negative' ? 'bg-red-500' : 
                                  conduct.incident_type === 'positive' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}></div>
                                <div>
                                  <h4 className="font-bold text-gray-900">{conduct.title}</h4>
                                  <p className="text-sm text-gray-600">{conduct.student_name || 'Unknown Student'}</p>
                                  <p className="text-xs text-gray-500">{new Date(conduct.incident_date).toLocaleDateString('rw-RW')}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={conduct.incident_type === 'negative' ? 'destructive' : 'default'}
                                  className={conduct.incident_type === 'positive' ? 'bg-green-500' : ''}
                                >
                                  {conduct.severity}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                  onClick={() => handleRemoveConduct(conduct)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {conduct.description && (
                              <p className="text-sm text-gray-600 mt-2 pl-8">{conduct.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trades.map((trade) => {
                  const tradeStudents = students.filter(s => s.trade_code === trade.trade_code);
                  const avgGrade = tradeStudents.reduce((sum, s) => sum + (s.average_grade || 0), 0) / tradeStudents.length || 0;
                  const avgAttendance = tradeStudents.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0) / tradeStudents.length || 0;
                  const avgConduct = tradeStudents.reduce((sum, s) => sum + (s.conduct_score || 0), 0) / tradeStudents.length || 0;

                  return (
                    <Card key={trade.id} className="border-2 border-purple-200">
                      <CardHeader>
                        <CardTitle className="text-lg">{trade.trade_name}</CardTitle>
                        <CardDescription>{trade.full_name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">Average Grade</span>
                              <span className="font-bold">{avgGrade.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${avgGrade}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">Attendance</span>
                              <span className="font-bold">{avgAttendance.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${avgAttendance}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">Conduct Score</span>
                              <span className="font-bold">{avgConduct.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${avgConduct}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              Total Students: <span className="font-bold">{tradeStudents.length}</span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Conduct Dialog */}
      <Dialog open={isAddConductOpen} onOpenChange={setIsAddConductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Conduct Record</DialogTitle>
            <DialogDescription>
              Record student behavior incident or achievement
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={conductForm.incident_type} onValueChange={(value: 'positive' | 'negative' | 'neutral') => 
                  setConductForm({...conductForm, incident_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={conductForm.severity} onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                  setConductForm({...conductForm, severity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={conductForm.title}
                onChange={(e) => setConductForm({...conductForm, title: e.target.value})}
                placeholder="Brief description of the incident" 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={conductForm.description}
                onChange={(e) => setConductForm({...conductForm, description: e.target.value})}
                placeholder="Detailed description of what happened..." 
                rows={4} 
              />
            </div>
            <div className="space-y-2">
              <Label>Action Taken</Label>
              <Input 
                value={conductForm.action_taken}
                onChange={(e) => setConductForm({...conductForm, action_taken: e.target.value})}
                placeholder="What action was taken?" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddConductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddConduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Conduct Confirmation Dialog */}
      <Dialog open={isRemoveConductOpen} onOpenChange={setIsRemoveConductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertOctagon className="h-5 w-5 mr-2" />
              Confirm Removal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this conduct record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedConduct && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedConduct.title}</p>
              <p className="text-sm text-gray-600">{selectedConduct.student_name}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveConductOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveConduct}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectorDisciplineDashboard;
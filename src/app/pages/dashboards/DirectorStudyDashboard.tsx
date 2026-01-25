import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar, 
  ClipboardList,
  Award,
  FileText,
  BarChart3,
  GraduationCap,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Eye,
  Trash2,
  UserPlus,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import LeftSidebar from '@/app/components/LeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import dosService from '@/app/services/dosService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface DirectorStudyDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DirectorStudyDashboard: React.FC<DirectorStudyDashboardProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load students when filters change
  useEffect(() => {
    loadStudents();
  }, [searchQuery, selectedTrade, selectedLevel, pagination.current_page]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, tradesData] = await Promise.all([
        dosService.getAnalyticsOverview(),
        dosService.getTrades()
      ]);
      
      setAnalytics(analyticsData.data);
      setTrades(tradesData.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const params: any = {
        page: pagination.current_page,
        limit: pagination.per_page
      };
      
      if (searchQuery) params.search = searchQuery;
      if (selectedTrade !== 'all') params.trade = selectedTrade;
      if (selectedLevel !== 'all') params.level = selectedLevel;
      
      const response = await dosService.getStudents(params);
      setStudents(response.data.students);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleCreateStudent = async (studentData: any) => {
    try {
      await dosService.createStudent(studentData);
      setIsAddDialogOpen(false);
      loadStudents();
      loadDashboardData(); // Refresh analytics
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (confirm('Are you sure you want to remove this student?')) {
      try {
        await dosService.deleteStudent(studentId);
        loadStudents();
        loadDashboardData(); // Refresh analytics
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleViewStudent = async (student: any) => {
    try {
      const response = await dosService.getStudentDetails(student.id);
      setSelectedStudent(response.data);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error loading student details:', error);
    }
  };

  // Generate stats from analytics data
  const stats = analytics ? [
    {
      title: 'Abanyeshuri Bose',
      value: analytics.overall_statistics?.total_students?.toString() || '0',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Abarimu',
      value: analytics.overall_statistics?.total_teachers?.toString() || '0',
      change: '+3%',
      trend: 'up',
      icon: GraduationCap,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Amaklasi',
      value: analytics.overall_statistics?.total_classes?.toString() || '0',
      change: '+5%',
      trend: 'up',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Impera Rusange',
      value: `${Math.round(analytics.overall_statistics?.overall_average_grade || 0)}%`,
      change: '+2.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ] : [];

  const recentActivities = [
    {
      title: 'Ikizamini cya Mathematics yanditswe',
      teacher: 'Dr. Jean Mugabo',
      time: '2 amasaha ashize',
      type: 'exam',
      status: 'completed'
    },
    {
      title: 'Gahunda y\'Amasomo yahinduwe',
      teacher: 'Prof. Marie Uwase',
      time: '5 amasaha ashize',
      type: 'curriculum',
      status: 'pending'
    },
    {
      title: 'Raporo y\'Igice yasohotse',
      teacher: 'Mr. Patrick Nkusi',
      time: '1 umunsi ushize',
      type: 'report',
      status: 'completed'
    },
    {
      title: 'Inama y\'Abarimu',
      teacher: 'Admin Team',
      time: 'Ejo',
      type: 'meeting',
      status: 'upcoming'
    },
  ];

  const classPerformance = [
    { className: 'S1 A', students: 45, avgScore: 89, attendance: 96, rank: 1, trend: 'up' },
    { className: 'S2 B', students: 42, avgScore: 85, attendance: 94, rank: 2, trend: 'up' },
    { className: 'S3 A', students: 38, avgScore: 87, attendance: 92, rank: 3, trend: 'down' },
    { className: 'S4 C', students: 40, avgScore: 82, attendance: 90, rank: 4, trend: 'up' },
    { className: 'S5 A', students: 35, avgScore: 91, attendance: 97, rank: 5, trend: 'up' },
  ];

  const teachers = [
    { name: 'Dr. Jean Mugabo', subject: 'Mathematics', classes: 6, students: 240, rating: 4.8 },
    { name: 'Prof. Marie Uwase', subject: 'Physics', classes: 5, students: 200, rating: 4.9 },
    { name: 'Mr. Patrick Nkusi', subject: 'Chemistry', classes: 4, students: 160, rating: 4.6 },
    { name: 'Ms. Grace Uwera', subject: 'Biology', classes: 5, students: 210, rating: 4.7 },
    { name: 'Mr. Eric Habimana', subject: 'English', classes: 7, students: 280, rating: 4.5 },
  ];

  const upcomingExams = [
    { subject: 'Mathematics', class: 'S3 A', date: '2026-01-25', time: '08:00', duration: '2h' },
    { subject: 'Physics', class: 'S4 B', date: '2026-01-26', time: '10:00', duration: '2h' },
    { subject: 'Chemistry', class: 'S5 A', date: '2026-01-27', time: '08:00', duration: '3h' },
    { subject: 'Biology', class: 'S2 C', date: '2026-01-28', time: '14:00', duration: '2h' },
  ];

  const curricullumProgress = [
    { subject: 'Mathematics', progress: 78, status: 'on-track' },
    { subject: 'Physics', progress: 82, status: 'ahead' },
    { subject: 'Chemistry', progress: 65, status: 'behind' },
    { subject: 'Biology', progress: 75, status: 'on-track' },
    { subject: 'English', progress: 88, status: 'ahead' },
  ];

  const filteredStudents = students;

  const getAvailableLevels = () => {
    if (selectedTrade === 'all') return [];
    const trade = trades.find(t => t.trade_code === selectedTrade);
    if (!trade) return [];
    return trades.filter(t => t.trade_code === selectedTrade).map(t => `${t.level_number}${t.level_suffix || ''}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <LeftSidebar currentPage="dashboard-director-study" onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Gukuramo amakuru...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      <LeftSidebar currentPage="dashboard-director-study" onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-2">
                  Dashbord y'Umuyobozi w'Amasomo
                </h1>
                <p className="text-gray-600">Gucunga imyigire n'imyigishirize</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Pakurura Raporo
                </Button>
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ongeramo
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats && stats.length > 0 && stats.map((stat, index) => {
                const Icon = stat.icon;
                const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-2 border-yellow-200 hover:shadow-lg transition-all ${stat.bgColor}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <Badge className={`${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-0`}>
                            <TrendIcon className="h-3 w-3 mr-1" />
                            {stat.change}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto bg-white border-2 border-yellow-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Incamake
              </TabsTrigger>
              <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Abanyeshuri
              </TabsTrigger>
              <TabsTrigger value="classes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amaklasi
              </TabsTrigger>
              <TabsTrigger value="teachers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Abarimu
              </TabsTrigger>
              <TabsTrigger value="exams" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Ibizamini
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Gahunda
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibikorwa Bya Vuba
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-yellow-50 transition-colors">
                            <div className={`p-2 rounded-lg ${
                              activity.status === 'completed' ? 'bg-green-100' :
                              activity.status === 'pending' ? 'bg-yellow-100' :
                              'bg-blue-100'
                            }`}>
                              {activity.type === 'exam' && <ClipboardList className="h-4 w-4 text-green-600" />}
                              {activity.type === 'curriculum' && <BookOpen className="h-4 w-4 text-yellow-600" />}
                              {activity.type === 'report' && <FileText className="h-4 w-4 text-blue-600" />}
                              {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-purple-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">{activity.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{activity.teacher}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {activity.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Upcoming Exams */}
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibizamini Bizaza
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {upcomingExams.map((exam, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-gray-900">{exam.subject}</h4>
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                {exam.class}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {exam.date}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {exam.time}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-500">Igihe: {exam.duration}</span>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost" className="h-7 px-2">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2">
                                  <Edit className="h-3 w-3" />
                                </Button>
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

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gucunga Abanyeshuri</CardTitle>
                      <CardDescription>Reba, ongeraho, hindura, n\'ukure abanyeshuri</CardDescription>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Ongeraho Umunyeshuri
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Ongeraho Umunyeshuri Mushya</DialogTitle>
                          <DialogDescription>
                            Uzuza amakuru y\'umunyeshuri mushya
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Izina</Label>
                              <Input id="name" placeholder="Izina ryuzuye" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" placeholder="email@example.com" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="trade">Umwuga</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Hitamo umwuga" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SOD">Software Development (SOD)</SelectItem>
                                  <SelectItem value="BDC">Building & Construction (BDC)</SelectItem>
                                  <SelectItem value="AUT">Automobile Technology (AUT)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="level">Urwego</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Hitamo urwego" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Level 3 SOD">Level 3</SelectItem>
                                  <SelectItem value="Level 4 SOD">Level 4</SelectItem>
                                  <SelectItem value="Level 5 SOD">Level 5</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="parent-phone">Telefoni y\'Umubyeyi</Label>
                            <Input id="parent-phone" placeholder="+250..." />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Hagarika
                          </Button>
                          <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                            Bika
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex items-center space-x-3 mt-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Shakisha umunyeshuri (izina cyangwa code)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={selectedTrade} onValueChange={(value) => { setSelectedTrade(value); setSelectedLevel('all'); }}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Hitamo umwuga" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Imyuga Yose</SelectItem>
                        {[...new Set(trades.map(t => t.trade_code))].map(tradeCode => (
                          <SelectItem key={tradeCode} value={tradeCode}>{tradeCode}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value)} disabled={selectedTrade === 'all'}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Hitamo urwego" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Inzego Zose</SelectItem>
                        {getAvailableLevels().map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {filteredStudents.map((student) => (
                        <Card key={student.id} className="border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-14 w-14 border-2 border-yellow-400">
                                  <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold text-lg">
                                    {student.first_name?.charAt(0) || 'S'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-bold text-gray-900">{student.first_name} {student.last_name}</h4>
                                  <p className="text-sm text-gray-600">{student.student_id}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 text-xs">
                                      {student.trade_code}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      Level {student.level_number}{student.level_suffix || ''}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-6">
                                <div className="text-center">
                                  <p className="text-2xl font-black text-yellow-600">{Math.round(student.average_grade || 0)}%</p>
                                  <p className="text-xs text-gray-500">Impera</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-black text-green-600">{Math.round(student.attendance_percentage || 0)}%</p>
                                  <p className="text-xs text-gray-500">Kwitabira</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleViewStudent(student)}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Reba
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Hindura
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteStudent(student.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Kuraho
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {(student.parent_first_name || student.parent_phone) && (
                              <div className="mt-3 pt-3 border-t border-yellow-100 flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  <span>Umubyeyi: {student.parent_first_name} {student.parent_last_name}</span>
                                </div>
                                {student.parent_phone && (
                                  <div className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    <span>{student.parent_phone}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      {filteredStudents.length === 0 && (
                        <div className="text-center py-12">
                          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">Nta munyeshuri wabonetse</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Student Details Dialog */}
              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  {selectedStudent && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Amakuru ya {selectedStudent.first_name} {selectedStudent.last_name}</DialogTitle>
                        <DialogDescription>
                          Code: {selectedStudent.student_id}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-bold text-sm text-gray-700 mb-2">Amakuru Rusange</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{selectedStudent.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Umwuga:</span>
                                <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                  {selectedStudent.trade_code}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Urwego:</span>
                                <span className="font-medium">Level {selectedStudent.level_number}{selectedStudent.level_suffix || ''}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <Badge variant="outline">{selectedStudent.is_active ? 'Active' : 'Inactive'}</Badge>
                              </div>
                            </div>
                          </div>
                          {(selectedStudent.parent_first_name || selectedStudent.parent_phone) && (
                            <div>
                              <h3 className="font-bold text-sm text-gray-700 mb-2">Umubyeyi</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Izina:</span>
                                  <span className="font-medium">{selectedStudent.parent_first_name} {selectedStudent.parent_last_name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Telefoni:</span>
                                  <span className="font-medium">{selectedStudent.parent_phone}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Email:</span>
                                  <span className="font-medium">{selectedStudent.parent_email}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {selectedStudent.recent_grades && selectedStudent.recent_grades.length > 0 && (
                          <div>
                            <h3 className="font-bold text-sm text-gray-700 mb-3">Amanota</h3>
                            <div className="space-y-2">
                              {selectedStudent.recent_grades.map((grade: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 border-2 border-yellow-100 rounded-lg">
                                  <div>
                                    <p className="font-medium">{grade.subject_name}</p>
                                    <p className="text-xs text-gray-500">Umwarimu: {grade.teacher_name} {grade.teacher_lastname}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 text-lg">
                                      {grade.obtained_marks}/{grade.max_marks}
                                    </Badge>
                                    <p className="text-xs text-gray-500 mt-1">{Math.round((grade.obtained_marks / grade.max_marks) * 100)}%</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedStudent.recent_conducts && selectedStudent.recent_conducts.length > 0 && (
                          <div>
                            <h3 className="font-bold text-sm text-gray-700 mb-3">Imyitwarire</h3>
                            <div className="space-y-2">
                              {selectedStudent.recent_conducts.map((conduct: any) => (
                                <div key={conduct.id} className={`p-3 border-2 rounded-lg ${
                                  conduct.incident_type === 'positive' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{conduct.title}</h4>
                                    <Badge className={conduct.incident_type === 'positive' ? 'bg-green-500' : 'bg-red-500'}>
                                      {conduct.incident_type}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{conduct.description}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {conduct.incident_date} - Raporo: {conduct.reported_by_name} {conduct.reported_by_lastname}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Imikorere y'Amaklasi</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Shakisha ikilas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200">
                          <th className="text-left p-3 font-bold text-gray-700">Ikilas</th>
                          <th className="text-left p-3 font-bold text-gray-700">Abanyeshuri</th>
                          <th className="text-left p-3 font-bold text-gray-700">Impera</th>
                          <th className="text-left p-3 font-bold text-gray-700">Kwitabira</th>
                          <th className="text-left p-3 font-bold text-gray-700">Umwanya</th>
                          <th className="text-left p-3 font-bold text-gray-700">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classPerformance.map((cls, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-3">
                              <span className="font-bold text-gray-900">{cls.className}</span>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="border-yellow-300">
                                {cls.students} abanyeshuri
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <span className="font-bold text-gray-900 mr-2">{cls.avgScore}%</span>
                                {cls.trend === 'up' ? (
                                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-gray-700">{cls.attendance}%</span>
                            </td>
                            <td className="p-3">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                #{cls.rank}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teachers Tab */}
            <TabsContent value="teachers" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Abarimu</CardTitle>
                  <CardDescription>Gucunga abarimu n'imikorere yabo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachers.map((teacher, index) => (
                      <Card key={index} className="border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="h-12 w-12 border-2 border-yellow-400">
                              <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                                {teacher.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{teacher.name}</p>
                              <p className="text-xs text-gray-600">{teacher.subject}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Amaklasi:</span>
                              <Badge variant="outline">{teacher.classes}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Abanyeshuri:</span>
                              <Badge variant="outline">{teacher.students}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Amanota:</span>
                              <div className="flex items-center">
                                <Award className="h-3 w-3 text-yellow-600 mr-1" />
                                <span className="font-bold">{teacher.rating}/5</span>
                              </div>
                            </div>
                          </div>
                          <Button className="w-full mt-3" variant="outline" size="sm">
                            Reba Amakuru
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Iterambere ry'Integanyanyigisho</CardTitle>
                  <CardDescription>Kugenzura iterambere ry'amasomo ku buryo buri somo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {curricullumProgress.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg border-2 border-yellow-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900">{item.subject}</h4>
                          <Badge className={
                            item.status === 'ahead' ? 'bg-green-100 text-green-700' :
                            item.status === 'behind' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {item.status === 'ahead' ? 'Imbere' : item.status === 'behind' ? 'Inyuma' : 'Ku Murongo'}
                          </Badge>
                        </div>
                        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full rounded-full ${
                              item.status === 'ahead' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                              item.status === 'behind' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                              'bg-gradient-to-r from-yellow-500 to-green-500'
                            }`}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{item.progress}% byarangiye</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exams Tab */}
            <TabsContent value="exams" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ibizamini Bizaza</p>
                        <p className="text-3xl font-black text-gray-900">12</p>
                      </div>
                      <Calendar className="h-12 w-12 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-yellow-200 bg-gradient-to-br from-green-50 to-teal-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Bisubizwa</p>
                        <p className="text-3xl font-black text-gray-900">8</p>
                      </div>
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-yellow-200 bg-gradient-to-br from-orange-50 to-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Birategerejwe</p>
                        <p className="text-3xl font-black text-gray-900">4</p>
                      </div>
                      <AlertCircle className="h-12 w-12 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Iyandikwa ry'Ibizamini</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {upcomingExams.map((exam, index) => (
                        <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">{exam.subject}</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {exam.class}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {exam.date}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {exam.time}
                                </div>
                                <div className="flex items-center">
                                  <Target className="h-3 w-3 mr-1" />
                                  {exam.duration}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                Reba
                              </Button>
                              <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                                <Edit className="h-4 w-4 mr-1" />
                                Hindura
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DirectorStudyDashboard;

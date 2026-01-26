import React, { useState, useEffect } from 'react';
import { apiService } from '@/app/services/apiService';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  Calendar, 
  TrendingUp,
  Award,
  FileText,
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
  Target,
  BarChart3,
  GraduationCap,
  Bell,
  TrendingDown,
  ArrowUpRight,
  UserCheck,
  Trophy,
  Activity,
  BookMarked,
  Briefcase,
  Star,
  MessageSquare,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import StaffManagementPage from '../StaffManagementPage';
import StudentCompetitionsPage from '../student/StudentCompetitionsPage';
import LibraryPage from '../student/LibraryPage';
import TransportPage from '../student/TransportPage';
import HostelPage from '../student/HostelPage';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [assignmentsData, setAssignmentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentView === 'dashboard') fetchDashboardData();
  }, [currentView]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const [dashRes, assignmentsRes] = await Promise.all([
        apiService.getStudentDashboard(),
        user ? apiService.getStudentAssignments(user.id) : Promise.resolve([])
      ]);
      
      if (dashRes.success) {
        setDashboardData(dashRes.data);
      }
      
      if (Array.isArray(assignmentsRes)) {
        setAssignmentsData(assignmentsRes);
      } else if (assignmentsRes && assignmentsRes.success && Array.isArray(assignmentsRes.data)) {
        setAssignmentsData(assignmentsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (page: string) => {
    if (page === 'staff-management') {
      setCurrentView('staff-management');
    } else if (page === 'competitions') {
      setCurrentView('competitions');
    } else if (page === 'library') {
      setCurrentView('library');
    } else if (page === 'transport') {
      setCurrentView('transport');
    } else if (page === 'hostel') {
      setCurrentView('hostel');
    } else {
      setCurrentView('dashboard');
      onNavigate(page);
    }
  };

  if (currentView === 'staff-management') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-green-50/30 overflow-hidden">
        <AdvancedLeftSidebar currentPage="staff-management" onNavigate={handleNavigation} onLogout={onLogout} />
        <div className="flex-1 overflow-auto">
          <StaffManagementPage />
        </div>
      </div>
    );
  }

  if (currentView === 'competitions') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
        <AdvancedLeftSidebar currentPage="competitions" onNavigate={handleNavigation} onLogout={onLogout} />
        <div className="flex-1 overflow-auto">
          <StudentCompetitionsPage />
        </div>
      </div>
    );
  }

  if (currentView === 'library') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <AdvancedLeftSidebar currentPage="library" onNavigate={handleNavigation} onLogout={onLogout} />
        <div className="flex-1 overflow-auto">
          <LibraryPage />
        </div>
      </div>
    );
  }

  if (currentView === 'transport') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 overflow-hidden">
        <AdvancedLeftSidebar currentPage="transport" onNavigate={handleNavigation} onLogout={onLogout} />
        <div className="flex-1 overflow-auto">
          <TransportPage />
        </div>
      </div>
    );
  }

  if (currentView === 'hostel') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
        <AdvancedLeftSidebar currentPage="hostel" onNavigate={handleNavigation} onLogout={onLogout} />
        <div className="flex-1 overflow-auto">
          <HostelPage />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Amaklasi Yanjye',
      value: dashboardData?.enrollments?.length || '0',
      change: 'Iri giciro',
      trend: 'up',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ibizamini',
      value: dashboardData?.recent_grades?.length || '0',
      change: 'Bitegerejwe',
      trend: 'up',
      icon: ClipboardList,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Impera',
      value: `${dashboardData?.average_grade?.toFixed(1) || 0}%`,
      change: '+4.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Kwitabira',
      value: `${((dashboardData?.attendance?.present / dashboardData?.attendance?.total * 100) || 0).toFixed(1)}%`,
      change: '+1.5%',
      trend: 'up',
      icon: Calendar,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

  const myClasses = dashboardData?.enrollments?.map((enrollment: any) => ({
    name: enrollment.course_name || 'N/A',
    teacher: enrollment.teacher_name || 'N/A',
    schedule: 'Mon, Wed, Fri - 8:00 AM', // This could be improved if backend provides timetable
    grade: 0, 
    attendance: 0,
    assignments: 0,
    color: 'from-yellow-500 to-amber-500',
    room: 'A-201'
  })) || [];

  const assignments = assignmentsData.map((assign: any) => ({
    title: assign.title,
    subject: assign.course_name,
    dueDate: new Date(assign.due_date).toLocaleDateString(),
    status: assign.submission_status || 'pending',
    priority: new Date(assign.due_date) < new Date(Date.now() + 86400000 * 2) ? 'high' : 'medium',
    points: assign.total_marks,
    submitted: !!assign.submission_id,
    grade: assign.marks_obtained,
    description: assign.description
  }));

  const grades = dashboardData?.recent_grades?.map((grade: any) => ({
    subject: grade.subject_name || 'N/A',
    term1: 0, // Backend doesn't provide per-term breakdown yet in dashboard
    term2: 0,
    term3: 0,
    average: ((grade.obtained_marks / grade.max_marks) * 100).toFixed(1),
    grade: grade.grade_letter || 'N/A',
    rank: 0,
    totalStudents: 0,
    teacher: grade.teacher_name || 'N/A',
    comment: grade.comments || ''
  })) || [];

  const attendance = [
    {
      month: 'Current Term',
      present: dashboardData?.attendance?.present || 0,
      absent: dashboardData?.attendance?.absent || 0,
      late: dashboardData?.attendance?.late || 0,
      total: dashboardData?.attendance?.total || 0,
      percentage: ((dashboardData?.attendance?.present / dashboardData?.attendance?.total * 100) || 0).toFixed(1)
    }
  ];

  const activities = []; // Fetch from activities API if needed

  const recentActivities = dashboardData?.recent_grades?.slice(0, 5).map((grade: any) => ({
    title: `Ikizamini cya ${grade.subject_name}`,
    description: `Waronse amanota ${grade.obtained_marks}/${grade.max_marks}`,
    time: new Date(grade.assessment_date).toLocaleDateString(),
    type: 'exam',
    icon: Award,
    color: 'text-yellow-600'
  })) || [];

  const upcomingDeadlines = assignmentsData
    .filter(a => !a.submission_id && new Date(a.due_date) > new Date())
    .slice(0, 5)
    .map(a => ({
      title: a.title,
      date: new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      subject: a.course_name,
      type: 'assignment',
      priority: new Date(a.due_date) < new Date(Date.now() + 86400000 * 2) ? 'high' : 'medium'
    }));

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-green-50/30 overflow-hidden">
      <UniversalMessagingWidget />
      <AdvancedLeftSidebar currentPage="dashboard" onNavigate={handleNavigation} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 via-green-500 to-teal-500 text-white shadow-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black">DASHBORD Y'UMUNYESHURI</h1>
                <p className="text-white/90 mt-1">Murakaza neza</p>
              </div>
              <Button 
                onClick={onLogout}
                variant="ghost" 
                className="text-white hover:bg-white/20 border-2 border-white/30"
              >
                Gusohoka
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : (
        <ScrollArea className="flex-1">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all ${stat.bgColor}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
                            {stat.trend === 'up' ? (
                              <span className="flex items-center text-sm font-bold text-green-600">
                                <ArrowUpRight className="w-4 h-4" />
                                {stat.change}
                              </span>
                            ) : (
                              <span className="flex items-center text-sm font-bold text-gray-600">
                                {stat.change}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-2 border-yellow-200 shadow-lg">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader className="border-b-2 border-yellow-100 bg-gradient-to-r from-yellow-50 to-green-50">
                  <TabsList className="grid w-full grid-cols-6 gap-4 bg-transparent h-auto p-0">
                    <TabsTrigger 
                      value="overview"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white border-2 border-yellow-200"
                    >
                      Incamake
                    </TabsTrigger>
                    <TabsTrigger 
                      value="classes"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white border-2 border-yellow-200"
                    >
                      Amaklasi
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assignments"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white border-2 border-yellow-200"
                    >
                      Ibizamini
                    </TabsTrigger>
                    <TabsTrigger 
                      value="grades"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white border-2 border-yellow-200"
                    >
                      Amanota
                    </TabsTrigger>
                    <TabsTrigger 
                      value="attendance"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white border-2 border-yellow-200"
                    >
                      Kwitabira
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activities"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white border-2 border-yellow-200"
                    >
                      Ibikorwa
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="p-6">
                  <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="border-2 border-yellow-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-yellow-600" />
                            Ibikorwa Bya Vuba
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                              <div key={index} className="flex items-start gap-4 p-3 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border border-yellow-100">
                                <div className={`p-2 rounded-lg bg-white ${activity.color}`}>
                                  <activity.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900">{activity.title}</h4>
                                  <p className="text-sm text-gray-600">{activity.description}</p>
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {activity.time}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-yellow-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-orange-600" />
                            Ibitegerejwe
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {upcomingDeadlines.map((deadline, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                                <div className="flex items-center gap-3">
                                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-lg px-3 py-2 text-center">
                                    <div className="text-lg font-black">{deadline.date.split(' ')[1]}</div>
                                    <div className="text-xs">{deadline.date.split(' ')[0]}</div>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900">{deadline.title}</h4>
                                    <p className="text-sm text-gray-600">{deadline.subject}</p>
                                  </div>
                                </div>
                                <Badge className={`${
                                  deadline.priority === 'high' 
                                    ? 'bg-red-500' 
                                    : 'bg-yellow-500'
                                } text-white border-0`}>
                                  {deadline.type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="classes" className="mt-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            placeholder="Shakisha amaklasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-80 border-yellow-200 focus:border-yellow-500"
                          />
                        </div>
                        <Button variant="outline" className="border-yellow-200 hover:bg-yellow-50">
                          <Filter className="w-4 h-4 mr-2" />
                          Kugenzura
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {myClasses.map((classItem, index) => (
                        <Card key={index} className="border-2 border-yellow-100 hover:shadow-lg transition-shadow">
                          <CardHeader className={`bg-gradient-to-r ${classItem.color} text-white`}>
                            <CardTitle className="flex items-center justify-between">
                              <span>{classItem.name}</span>
                              <BookOpen className="w-5 h-5" />
                            </CardTitle>
                            <CardDescription className="text-white/90">
                              {classItem.teacher}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Igihe:</span>
                                <span className="font-bold">{classItem.schedule}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Icyumba:</span>
                                <span className="font-bold">{classItem.room}</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Amanota:</span>
                                  <span className="font-bold text-green-600">{classItem.grade}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all"
                                    style={{ width: `${classItem.grade}%` }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Kwitabira:</span>
                                  <span className="font-bold text-blue-600">{classItem.attendance}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                                    style={{ width: `${classItem.attendance}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <Badge className="bg-yellow-500 text-white border-0">
                                  {classItem.assignments} ibizamini
                                </Badge>
                                <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                                  Reba Byinshi
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="assignments" className="mt-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            placeholder="Shakisha ibizamini..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-80 border-yellow-200 focus:border-yellow-500"
                          />
                        </div>
                        <Button variant="outline" className="border-yellow-200 hover:bg-yellow-50">
                          <Filter className="w-4 h-4 mr-2" />
                          Kugenzura
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {assignments.map((assignment, index) => (
                        <Card key={index} className={`border-2 ${
                          assignment.status === 'completed' ? 'border-green-200 bg-green-50/50' : 'border-yellow-200'
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start gap-4">
                                  <div className={`p-3 rounded-lg ${
                                    assignment.status === 'completed' 
                                      ? 'bg-green-500' 
                                      : assignment.priority === 'high'
                                      ? 'bg-red-500'
                                      : assignment.priority === 'medium'
                                      ? 'bg-yellow-500'
                                      : 'bg-blue-500'
                                  }`}>
                                    <ClipboardList className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                      <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                        {assignment.subject}
                                      </Badge>
                                      <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {assignment.dueDate}
                                      </span>
                                      <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <Target className="w-4 h-4" />
                                        {assignment.points} pts
                                      </span>
                                      {assignment.submitted && assignment.grade && (
                                        <Badge className="bg-green-600 text-white border-0">
                                          Amanota: {assignment.grade}/{assignment.points}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {assignment.status === 'completed' ? (
                                  <Badge className="bg-green-500 text-white border-0">
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Byashyizweho
                                  </Badge>
                                ) : (
                                  <>
                                    <Badge className={`${
                                      assignment.priority === 'high' 
                                        ? 'bg-red-500' 
                                        : assignment.priority === 'medium'
                                        ? 'bg-yellow-500'
                                        : 'bg-blue-500'
                                    } text-white border-0`}>
                                      {assignment.priority === 'high' ? 'Byihutirwa' : assignment.priority === 'medium' ? 'Hagati' : 'Bihoro'}
                                    </Badge>
                                    <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                                      Shyira
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="grades" className="mt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-yellow-50 to-green-50 border-b-2 border-yellow-200">
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Isomo</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Igice 1</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Igice 2</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Igice 3</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Impuzamishije</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Urwego</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Umwanya</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Icyifuzo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grades.map((grade, index) => (
                            <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-bold text-gray-900">{grade.subject}</div>
                                  <div className="text-sm text-gray-600">{grade.teacher}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-blue-600">{grade.term1}%</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-blue-600">{grade.term2}%</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-blue-600">{grade.term3}%</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-green-600">{grade.average}%</span>
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full"
                                      style={{ width: `${grade.average}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={`${
                                  grade.grade === 'A' || grade.grade === 'A-' 
                                    ? 'bg-green-500' 
                                    : grade.grade.startsWith('B')
                                    ? 'bg-yellow-500'
                                    : 'bg-orange-500'
                                } text-white border-0 text-lg font-black`}>
                                  {grade.grade}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-gray-900">
                                  {grade.rank}/{grade.totalStudents}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-gray-600 italic">{grade.comment}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border-2 border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Impera Rusange</h3>
                          <p className="text-sm text-gray-600">Mu masomo yose</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black text-green-600">88.5%</div>
                          <Badge className="bg-green-500 text-white border-0 mt-2">
                            Rank 5/42
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="attendance" className="mt-0">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-2 border-green-200 bg-green-50">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Yitabye</p>
                                <p className="text-3xl font-black text-green-600">78</p>
                              </div>
                              <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-red-200 bg-red-50">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Yatakaje</p>
                                <p className="text-3xl font-black text-red-600">2</p>
                              </div>
                              <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-yellow-200 bg-yellow-50">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Yatinze</p>
                                <p className="text-3xl font-black text-yellow-600">3</p>
                              </div>
                              <AlertCircle className="w-10 h-10 text-yellow-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-200 bg-blue-50">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Igiteranyo</p>
                                <p className="text-3xl font-black text-blue-600">96.2%</p>
                              </div>
                              <Target className="w-10 h-10 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-yellow-50 to-green-50 border-b-2 border-yellow-200">
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Ukwezi</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Yitabye</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Yatakaje</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Yatinze</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Byose</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Ijanisha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendance.map((record, index) => (
                              <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="font-bold text-gray-900">{record.month}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className="bg-green-500 text-white border-0">
                                    {record.present}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className="bg-red-500 text-white border-0">
                                    {record.absent}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className="bg-yellow-500 text-white border-0">
                                    {record.late}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-bold text-gray-900">{record.total}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-blue-600">{record.percentage.toFixed(1)}%</span>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                                        style={{ width: `${record.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activities" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {activities.map((activity, index) => (
                        <Card key={index} className="border-2 border-yellow-100 hover:shadow-lg transition-shadow">
                          <CardHeader className={`bg-gradient-to-r ${activity.color} text-white`}>
                            <CardTitle className="flex items-center justify-between">
                              <span>{activity.name}</span>
                              <Trophy className="w-5 h-5" />
                            </CardTitle>
                            <CardDescription className="text-white/90">
                              {activity.coach}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Uruhare:</span>
                                <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                  {activity.role}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Igihe:</span>
                                <span className="font-bold text-gray-900">{activity.schedule}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Ibihembo:</span>
                                <div className="flex items-center gap-2">
                                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                  <span className="font-bold text-gray-900">{activity.achievements}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <Badge className={`${
                                  activity.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                                } text-white border-0`}>
                                  {activity.status === 'active' ? 'Bikora' : 'Byahagaritswe'}
                                </Badge>
                                <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                                  Reba Byinshi
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="mt-6 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                      <CardHeader>
                        <CardTitle>Ibihembo Byawe</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { title: 'MVP Basketball', date: 'Dec 2025', icon: Trophy },
                            { title: 'Science Fair 1st', date: 'Nov 2025', icon: Award },
                            { title: 'Best Debater', date: 'Oct 2025', icon: Star },
                            { title: 'Perfect Attendance', date: 'Sep 2025', icon: Target },
                          ].map((achievement, index) => (
                            <div key={index} className="p-4 bg-white rounded-lg border-2 border-yellow-200 text-center">
                              <achievement.icon className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                              <h4 className="font-bold text-sm text-gray-900">{achievement.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{achievement.date}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

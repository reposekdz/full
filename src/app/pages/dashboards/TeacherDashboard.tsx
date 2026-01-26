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
  PenTool,
  Bell,
  TrendingDown,
  ArrowUpRight,
  UserCheck,
  UserX,
  RefreshCw,
  MoreVertical,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { useAuth } from '@/app/contexts/AuthContext';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';

interface TeacherDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudents(selectedClassId);
    }
  }, [selectedClassId]);

  const handleViewClass = (classId: number) => {
    setSelectedClassId(classId);
    setActiveTab('students');
  };

  const fetchClassStudents = async (classId: number) => {
    try {
      setLoadingStudents(true);
      const res = await apiService.getClassStudents(classId);
      if (res.success) {
        setClassStudents(res.students);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      const [statsRes, classesRes, assignmentsRes] = await Promise.all([
        apiService.getTeacherStatistics(),
        apiService.getTeacherClasses(),
        currentUser ? apiService.getAssignmentsByTeacher(currentUser.id) : Promise.resolve([])
      ]);

      if (statsRes.success) {
        setStatsData(statsRes.statistics);
      }
      if (classesRes.success) {
        setTeacherClasses(classesRes.classes);
      }
      if (Array.isArray(assignmentsRes)) {
        setAssignments(assignmentsRes);
      }
    } catch (err) {
      console.error('Failed to fetch teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const stats = [
    {
      title: 'Amaklasi',
      value: statsData?.total_classes || '0',
      change: 'Iri giciro',
      trend: 'up',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Abanyeshuri',
      value: statsData?.total_students || '0',
      change: 'Bose',
      trend: 'up',
      icon: Users,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ibizamini',
      value: statsData?.total_assignments || '0',
      change: 'Iri giciro',
      trend: 'up',
      icon: ClipboardList,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Impera',
      value: `${Math.round(statsData?.average_performance || 0)}%`,
      change: '+3.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

  const myClasses = teacherClasses.map((cls, index) => ({
    id: cls.id,
    name: `${cls.class_name} - ${cls.course_name}`,
    students: cls.student_count || 0,
    attendance: Math.round(cls.attendance_rate || 0),
    avgGrade: Math.round(cls.average_grade || 0),
    lessons: cls.total_sessions || 0,
    pending: cls.pending_assignments || 0,
    color: index % 5 === 0 ? 'from-yellow-500 to-amber-500' :
           index % 5 === 1 ? 'from-green-500 to-teal-500' :
           index % 5 === 2 ? 'from-blue-500 to-indigo-500' :
           index % 5 === 3 ? 'from-orange-500 to-red-500' :
           'from-purple-500 to-pink-500'
  }));

  const upcomingLessons = [
    {
      class: 'S3 A',
      subject: 'Mathematics',
      topic: 'Algebra - Quadratic Equations',
      time: 'Uyumunsi - 8:00 AM',
      duration: '90 min',
      room: 'Room 301'
    },
    {
      class: 'S4 B',
      subject: 'Mathematics',
      topic: 'Geometry - Triangles',
      time: 'Uyumunsi - 10:00 AM',
      duration: '90 min',
      room: 'Room 302'
    },
    {
      class: 'S5 A',
      subject: 'Mathematics',
      topic: 'Calculus - Derivatives',
      time: 'Ejo - 8:00 AM',
      duration: '90 min',
      room: 'Room 301'
    },
    {
      class: 'S6 A',
      subject: 'Mathematics',
      topic: 'Statistics - Probability',
      time: 'Ejo - 2:00 PM',
      duration: '90 min',
      room: 'Room 305'
    },
  ];

  const recentGrades = [
    {
      student: 'Jean Mugisha',
      class: 'S3 A',
      assignment: 'Algebra Quiz',
      grade: 85,
      date: 'Jan 18, 2026',
      status: 'excellent'
    },
    {
      student: 'Marie Uwase',
      class: 'S4 B',
      assignment: 'Geometry Test',
      grade: 78,
      date: 'Jan 19, 2026',
      status: 'good'
    },
    {
      student: 'Patrick Nkusi',
      class: 'S5 A',
      assignment: 'Calculus Assignment',
      grade: 92,
      date: 'Jan 20, 2026',
      status: 'excellent'
    },
    {
      student: 'Grace Mutesi',
      class: 'S6 A',
      assignment: 'Statistics Project',
      grade: 88,
      date: 'Jan 20, 2026',
      status: 'excellent'
    },
    {
      student: 'David Habimana',
      class: 'S3 A',
      assignment: 'Homework #5',
      grade: 65,
      date: 'Jan 19, 2026',
      status: 'needs_improvement'
    },
  ];

  const attendance = [
    {
      class: 'S3 A',
      date: 'Jan 20, 2026',
      present: 40,
      absent: 2,
      late: 0,
      total: 42,
      percentage: 95
    },
    {
      class: 'S4 B',
      date: 'Jan 20, 2026',
      present: 35,
      absent: 2,
      late: 1,
      total: 38,
      percentage: 92
    },
    {
      class: 'S5 A',
      date: 'Jan 19, 2026',
      present: 34,
      absent: 1,
      late: 0,
      total: 35,
      percentage: 97
    },
    {
      class: 'S5 C',
      date: 'Jan 19, 2026',
      present: 36,
      absent: 3,
      late: 1,
      total: 40,
      percentage: 90
    },
    {
      class: 'S6 A',
      date: 'Jan 18, 2026',
      present: 32,
      absent: 0,
      late: 0,
      total: 32,
      percentage: 100
    },
  ];

  const topStudents = [
    { name: 'Patrick Nkusi', class: 'S5 A', avgGrade: 92, avatar: 'PN', rank: 1 },
    { name: 'Grace Mutesi', class: 'S6 A', avgGrade: 88, avatar: 'GM', rank: 2 },
    { name: 'Jean Mugisha', class: 'S3 A', avgGrade: 85, avatar: 'JM', rank: 3 },
    { name: 'Alice Umutoni', class: 'S4 B', avgGrade: 84, avatar: 'AU', rank: 4 },
    { name: 'Eric Nshuti', class: 'S5 C', avgGrade: 82, avatar: 'EN', rank: 5 },
  ];

  const pendingTasks = [
    {
      task: 'Gutanga Amanota - S3 A Quiz',
      deadline: 'Uyumunsi',
      priority: 'high',
      type: 'grading'
    },
    {
      task: 'Gutegura Isomo - S6 A',
      deadline: 'Ejo',
      priority: 'medium',
      type: 'planning'
    },
    {
      task: 'Kwemeza Kwitabira - S4 B',
      deadline: 'Uyumunsi',
      priority: 'high',
      type: 'attendance'
    },
    {
      task: 'Raporo y\'Igice',
      deadline: 'Vuba',
      priority: 'low',
      type: 'report'
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 overflow-hidden">
      <AdvancedLeftSidebar currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
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
                  Ikibanza cy'Umwarimu
                </h1>
                <p className="text-gray-600 mt-2">Gucunga amaklasi, amanota, n\'iterambere ry\'abanyeshuri</p>
              </div>
              <div className="flex space-x-3">
                <Button className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Raporo
                </Button>
                <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Isomo Rishya
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
                          <Badge className="bg-gradient-to-r from-yellow-100 to-green-100 text-gray-700">
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full grid-cols-6 lg:w-auto bg-white border-2 border-yellow-200 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Incamake
                </TabsTrigger>
                <TabsTrigger value="classes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Amaklasi
                </TabsTrigger>
                <TabsTrigger value="assignments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Ibizamini
                </TabsTrigger>
                <TabsTrigger value="grades" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Amanota
                </TabsTrigger>
                <TabsTrigger value="attendance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Kwitabira
                </TabsTrigger>
                <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Abanyeshuri
                </TabsTrigger>
              </TabsList>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-yellow-200 hover:bg-yellow-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Kuvugurura
              </Button>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin text-yellow-600" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="border-2 border-yellow-200">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                          Ibizamini Bifite Itariki ya Hafi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-80">
                          <div className="space-y-3">
                            {assignments.length > 0 ? assignments.slice(0, 5).map((assignment, index) => (
                              <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 mb-2">
                                      {assignment.class_name}
                                    </Badge>
                                    <h4 className="font-bold text-gray-900 text-sm">{assignment.title}</h4>
                                  </div>
                                </div>
                                <div className="space-y-1 text-xs text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Itariki ntarengwa: {new Date(assignment.due_date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    {assignment.submission_count} / {assignment.student_count || 0} Batanze
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <p className="text-center text-gray-500 py-8">Nta bizamini bihari</p>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-yellow-200">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <ClipboardList className="h-5 w-5 mr-2 text-yellow-600" />
                          Amaklasi Yanjye
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-80">
                          <div className="space-y-3">
                            {myClasses.map((cls, index) => (
                              <div 
                                key={index} 
                                className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => {
                                  setSelectedClassId(cls.id);
                                }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm">{cls.name}</h4>
                                  </div>
                                  <Badge className="bg-blue-100 text-blue-700">
                                    {cls.students} Abanyeshuri
                                  </Badge>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${cls.avgGrade}%` }}
                                  />
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                                  <span>Impuzandengo y'amanota</span>
                                  <span>{cls.avgGrade}%</span>
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
                          <Award className="h-5 w-5 mr-2 text-yellow-600" />
                          Imibare y'Icyiciro
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                            <p className="text-sm text-blue-600 font-bold mb-1">Amanota Yatanzwe</p>
                            <p className="text-2xl font-black text-blue-900">{statsData?.total_grades || 0}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-teal-50 border border-green-100">
                            <p className="text-sm text-green-600 font-bold mb-1">Kwitabira Kwishyuwe</p>
                            <p className="text-2xl font-black text-green-900">{statsData?.total_attendance || 0}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                            <p className="text-sm text-orange-600 font-bold mb-1">Ibizamini Byose</p>
                            <p className="text-2xl font-black text-orange-900">{statsData?.total_assignments || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="classes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClasses.map((classItem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all h-full">
                      <CardContent className="p-6">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${classItem.color} mb-4`}>
                          <h3 className="text-lg font-black text-white">{classItem.name}</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Abanyeshuri:</span>
                            <Badge variant="outline" className="font-bold">{classItem.students}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Kwitabira:</span>
                            <Badge className="bg-green-100 text-green-700">{classItem.attendance}%</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Impera:</span>
                            <Badge className="bg-blue-100 text-blue-700">{classItem.avgGrade}%</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Amasomo:</span>
                            <Badge variant="outline">{classItem.lessons}</Badge>
                          </div>
                          {classItem.pending > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Irategerezwa:</span>
                              <Badge className="bg-orange-100 text-orange-700">{classItem.pending}</Badge>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-yellow-200 flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                            onClick={() => handleViewClass(classItem.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Reba
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Kosora
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Ibizamini Yanjye</CardTitle>
                      <CardDescription>Gucunga no gutanga ibizamini bishya</CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Ikizamini Rishya
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.length > 0 ? assignments.map((assignment, index) => (
                      <Card key={index} className="border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                  {assignment.class_name}
                                </Badge>
                                <Badge variant="outline">{assignment.course_name}</Badge>
                                <Badge className={assignment.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                  {assignment.is_published ? 'Byashyizwe hanze' : 'Draft'}
                                </Badge>
                              </div>
                              <h4 className="font-bold text-lg text-gray-900">{assignment.title}</h4>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Amanota yose</p>
                              <p className="text-xl font-black text-yellow-600">{assignment.total_marks}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Itariki ntarengwa: {new Date(assignment.due_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{assignment.submission_count} Batanze</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{assignment.graded_count} Byakosowe</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-2" />
                              Reba
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-3 w-3 mr-2" />
                              Kosora
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 text-green-600 hover:text-green-700">
                              <Award className="h-3 w-3 mr-2" />
                              Tanga Amanota
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )) : (
                      <div className="text-center py-12 border-2 border-dashed border-yellow-200 rounded-xl">
                        <ClipboardList className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nta bizamini urashyiraho</p>
                        <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Tanga Ikizamini cya Mbere
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Gutanga Amanota</CardTitle>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Mugaragaza
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200">
                          <th className="text-left p-3 font-bold text-gray-700">Umunyeshuri</th>
                          <th className="text-left p-3 font-bold text-gray-700">Icyiciro</th>
                          <th className="text-left p-3 font-bold text-gray-700">Ikibazo</th>
                          <th className="text-left p-3 font-bold text-gray-700">Amanota</th>
                          <th className="text-left p-3 font-bold text-gray-700">Itariki</th>
                          <th className="text-left p-3 font-bold text-gray-700">Uko bimeze</th>
                          <th className="text-left p-3 font-bold text-gray-700">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentGrades.map((grade, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50">
                            <td className="p-3 font-medium">{grade.student}</td>
                            <td className="p-3">
                              <Badge variant="outline">{grade.class}</Badge>
                            </td>
                            <td className="p-3 text-sm">{grade.assignment}</td>
                            <td className="p-3">
                              <span className={`font-bold text-lg ${
                                grade.grade >= 85 ? 'text-green-600' :
                                grade.grade >= 70 ? 'text-blue-600' :
                                'text-orange-600'
                              }`}>
                                {grade.grade}%
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-600">{grade.date}</td>
                            <td className="p-3">
                              <Badge className={
                                grade.status === 'excellent' ? 'bg-green-100 text-green-700' :
                                grade.status === 'good' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }>
                                {grade.status === 'excellent' ? 'Byiza Cyane' :
                                 grade.status === 'good' ? 'Byiza' : 'Birakenewe'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
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

            <TabsContent value="attendance" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Kwitabira kw\'Amaklasi</CardTitle>
                  <CardDescription>Gukurikirana kwitabira kw\'abanyeshuri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200">
                          <th className="text-left p-3 font-bold text-gray-700">Icyiciro</th>
                          <th className="text-left p-3 font-bold text-gray-700">Itariki</th>
                          <th className="text-left p-3 font-bold text-gray-700">Bari Aho</th>
                          <th className="text-left p-3 font-bold text-gray-700">Batari Aho</th>
                          <th className="text-left p-3 font-bold text-gray-700">Batinze</th>
                          <th className="text-left p-3 font-bold text-gray-700">Bose</th>
                          <th className="text-left p-3 font-bold text-gray-700">%</th>
                          <th className="text-left p-3 font-bold text-gray-700">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50">
                            <td className="p-3 font-bold">{record.class}</td>
                            <td className="p-3 text-sm text-gray-600">{record.date}</td>
                            <td className="p-3">
                              <Badge className="bg-green-100 text-green-700">{record.present}</Badge>
                            </td>
                            <td className="p-3">
                              <Badge className="bg-red-100 text-red-700">{record.absent}</Badge>
                            </td>
                            <td className="p-3">
                              <Badge className="bg-orange-100 text-orange-700">{record.late}</Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{record.total}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" 
                                    style={{ width: `${record.percentage}%` }}
                                  />
                                </div>
                                <span className="font-bold text-sm">{record.percentage}%</span>
                              </div>
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

            <TabsContent value="students" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Urutonde rw'Abanyeshuri</CardTitle>
                      <CardDescription>Reba abanyeshuri ukurikije ikilasi</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select 
                        className="bg-white border-2 border-yellow-200 rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                        value={selectedClassId || ''}
                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                      >
                        <option value="">Hitamo Ikilasi</option>
                        {teacherClasses.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.class_name} - {cls.course_name}</option>
                        ))}
                      </select>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Shakisha umunyeshuri..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-full sm:w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-yellow-600" />
                    </div>
                  ) : classStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-yellow-200 text-left">
                            <th className="p-3 font-bold text-gray-700">Umunyeshuri</th>
                            <th className="p-3 font-bold text-gray-700 hidden md:table-cell">Email</th>
                            <th className="p-3 font-bold text-gray-700">Amanota</th>
                            <th className="p-3 font-bold text-gray-700">Kwitabira</th>
                            <th className="p-3 font-bold text-gray-700">Ibikorwa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudents.filter(s => 
                            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
                          ).map((student, index) => (
                            <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-9 w-9 border-2 border-yellow-400">
                                    <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                                      {student.first_name[0]}{student.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-bold text-gray-900">{student.first_name} {student.last_name}</p>
                                    <p className="text-xs text-gray-500 md:hidden">{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-sm text-gray-600 hidden md:table-cell">{student.email}</td>
                              <td className="p-3">
                                <Badge className={Number(student.average_grade) >= 70 ? 'bg-green-100 text-green-700' : Number(student.average_grade) >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}>
                                  {Math.round(student.average_grade || 0)}%
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col space-y-1">
                                  <div className="flex justify-between text-[10px] text-gray-500">
                                    <span>{student.present_count}/{student.total_attendance || 0}</span>
                                    <span>{Math.round((student.present_count / (student.total_attendance || 1)) * 100)}%</span>
                                  </div>
                                  <Progress value={(student.present_count / (student.total_attendance || 1)) * 100} className="h-1.5 w-24" />
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-1">
                                  <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <TrendingUp className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-yellow-50/50 rounded-xl border-2 border-dashed border-yellow-200">
                      <Users className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Nta Banyeshuri Bagaragara</h3>
                      <p className="text-gray-500 max-w-xs mx-auto">
                        Hitamo ikilasi haruguru kugira ngo urebe urutonde rw'abanyeshuri bayigize.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

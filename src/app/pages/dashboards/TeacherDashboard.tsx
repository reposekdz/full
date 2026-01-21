import React, { useState } from 'react';
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
  UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface TeacherDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      title: 'Amaklasi',
      value: '5',
      change: 'Iri giciro',
      trend: 'up',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Abanyeshuri',
      value: '187',
      change: 'Bose',
      trend: 'up',
      icon: Users,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ibizamini',
      value: '12',
      change: 'Iri giciro',
      trend: 'up',
      icon: ClipboardList,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Impera',
      value: '85.3%',
      change: '+3.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

  const myClasses = [
    {
      name: 'S3 A - Mathematics',
      students: 42,
      attendance: 95,
      avgGrade: 78,
      lessons: 24,
      pending: 3,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      name: 'S4 B - Mathematics',
      students: 38,
      attendance: 92,
      avgGrade: 82,
      lessons: 28,
      pending: 1,
      color: 'from-green-500 to-teal-500'
    },
    {
      name: 'S5 A - Mathematics',
      students: 35,
      attendance: 97,
      avgGrade: 85,
      lessons: 32,
      pending: 2,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'S5 C - Mathematics',
      students: 40,
      attendance: 89,
      avgGrade: 75,
      lessons: 30,
      pending: 5,
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'S6 A - Mathematics',
      students: 32,
      attendance: 98,
      avgGrade: 88,
      lessons: 36,
      pending: 0,
      color: 'from-purple-500 to-pink-500'
    },
  ];

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

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto bg-white border-2 border-yellow-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Incamake
              </TabsTrigger>
              <TabsTrigger value="classes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amaklasi
              </TabsTrigger>
              <TabsTrigger value="lessons" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amasomo
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

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                      Amasomo Azaza
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {upcomingLessons.map((lesson, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 mb-2">
                                  {lesson.class}
                                </Badge>
                                <h4 className="font-bold text-gray-900 text-sm">{lesson.topic}</h4>
                              </div>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {lesson.time} ({lesson.duration})
                              </div>
                              <div className="flex items-center">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {lesson.room}
                              </div>
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
                      <ClipboardList className="h-5 w-5 mr-2 text-yellow-600" />
                      Imirimo Irategerezwa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {pendingTasks.map((task, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-sm">{task.task}</h4>
                              </div>
                              <Badge className={
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }>
                                {task.priority === 'high' ? 'Byihutirwa' : 
                                 task.priority === 'medium' ? 'Byiciriritse' : 'Byoroshye'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>{task.deadline}</span>
                              <Badge variant="outline" className="text-xs">
                                {task.type === 'grading' ? 'Gutanga Amanota' :
                                 task.type === 'planning' ? 'Gutegura' :
                                 task.type === 'attendance' ? 'Kwitabira' : 'Raporo'}
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
                      <Award className="h-5 w-5 mr-2 text-yellow-600" />
                      Abanyeshuri Bakomeye
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {topStudents.map((student, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50 transition-all">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold text-sm">
                              {student.rank}
                            </div>
                            <Avatar className="h-10 w-10 border-2 border-yellow-400">
                              <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold text-xs">
                                {student.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-bold text-sm text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-600">{student.class}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-yellow-600">{student.avgGrade}%</p>
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
                    <TrendingUp className="h-5 w-5 mr-2 text-yellow-600" />
                    Amanota y\'Iki gihe
                  </CardTitle>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
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
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            Reba
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Hindura
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Amasomo Yanjye</CardTitle>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Isomo Rishya
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingLessons.map((lesson, index) => (
                      <Card key={index} className="border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                  {lesson.class}
                                </Badge>
                                <Badge variant="outline">{lesson.subject}</Badge>
                              </div>
                              <h4 className="font-bold text-lg text-gray-900">{lesson.topic}</h4>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{lesson.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{lesson.duration}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{lesson.room}</span>
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
                            <Button variant="outline" size="sm" className="flex-1">
                              <FileText className="h-3 w-3 mr-2" />
                              Ibikoresho
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
                  <CardTitle className="flex items-center text-lg">
                    <Award className="h-5 w-5 mr-2 text-yellow-600" />
                    Abanyeshuri Bakomeye - Impera
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topStudents.map((student, index) => (
                      <Card key={index} className="border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-lg transition-all bg-gradient-to-br from-yellow-50 to-green-50">
                        <CardContent className="p-6 text-center">
                          <div className="flex items-center justify-center mb-3">
                            <div className="relative">
                              <Avatar className="h-16 w-16 border-4 border-yellow-400">
                                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold text-xl">
                                  {student.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold flex items-center justify-center text-sm">
                                {student.rank}
                              </div>
                            </div>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-1">{student.name}</h4>
                          <Badge variant="outline" className="mb-3">{student.class}</Badge>
                          <div className="bg-white rounded-lg p-2">
                            <p className="text-3xl font-black text-yellow-600">{student.avgGrade}%</p>
                            <p className="text-xs text-gray-600">Impera</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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

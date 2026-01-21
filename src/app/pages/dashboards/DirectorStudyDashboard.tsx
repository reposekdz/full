import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import LeftSidebar from '@/app/components/LeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface DirectorStudyDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DirectorStudyDashboard: React.FC<DirectorStudyDashboardProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      title: 'Abanyeshuri Bose',
      value: '1,248',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Abarimu',
      value: '84',
      change: '+3%',
      trend: 'up',
      icon: GraduationCap,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Amasomo',
      value: '42',
      change: '+5%',
      trend: 'up',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Impera Rusange',
      value: '87.5%',
      change: '+2.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

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
              {stats.map((stat, index) => {
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
            <TabsList className="grid w-full grid-cols-5 lg:w-auto bg-white border-2 border-yellow-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Incamake
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

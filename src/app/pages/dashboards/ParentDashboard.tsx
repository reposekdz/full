import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  MessageSquare,
  FileText,
  Award,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  TrendingDown,
  Target,
  BarChart3,
  Phone,
  Mail,
  Send,
  UserCheck,
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

interface ParentDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      title: 'Abana',
      value: '3',
      change: 'Bose bariga',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Impera Rusange',
      value: '85.3%',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Kwitabira',
      value: '94.5%',
      change: '+2.1%',
      trend: 'up',
      icon: Calendar,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Amafaranga',
      value: 'RWF 450K',
      change: 'Byishyuwe',
      trend: 'up',
      icon: DollarSign,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

  const children = [
    {
      name: 'Jean Mugisha',
      class: 'S3 A',
      avatar: 'JM',
      performance: 88,
      attendance: 96,
      rank: 5,
      totalStudents: 42,
      subjects: 8,
      status: 'excellent'
    },
    {
      name: 'Marie Uwase',
      class: 'S5 B',
      avatar: 'MU',
      performance: 82,
      attendance: 93,
      rank: 12,
      totalStudents: 38,
      subjects: 10,
      status: 'good'
    },
    {
      name: 'Patrick Nkusi',
      class: 'S2 C',
      avatar: 'PN',
      performance: 85,
      attendance: 95,
      rank: 8,
      totalStudents: 40,
      subjects: 7,
      status: 'excellent'
    },
  ];

  const recentActivities = [
    {
      student: 'Jean Mugisha',
      activity: 'Ikizamini cya Mathematics cyarangiye',
      grade: '85%',
      date: '2 amasaha ashize',
      type: 'exam',
      status: 'good'
    },
    {
      student: 'Marie Uwase',
      activity: 'Umukino wa Basketball yatsinze',
      achievement: 'MVP',
      date: '5 amasaha ashize',
      type: 'sports',
      status: 'excellent'
    },
    {
      student: 'Patrick Nkusi',
      activity: 'Akazi ka Science karangiye',
      grade: '92%',
      date: '1 umunsi ushize',
      type: 'assignment',
      status: 'excellent'
    },
    {
      student: 'Jean Mugisha',
      activity: 'Kwitabira: Yarahari',
      date: 'Uyu munsi',
      type: 'attendance',
      status: 'present'
    },
  ];

  const grades = [
    {
      student: 'Jean Mugisha',
      subject: 'Mathematics',
      score: 88,
      grade: 'A',
      exam: 'Mid-term',
      date: '2025-01-15',
      teacher: 'Dr. Jean Mugabo',
      comment: 'Byiza cyane'
    },
    {
      student: 'Marie Uwase',
      subject: 'Chemistry',
      score: 82,
      grade: 'B+',
      exam: 'Quiz',
      date: '2025-01-16',
      teacher: 'Prof. Marie Uwase',
      comment: 'Komeza gutyo'
    },
    {
      student: 'Patrick Nkusi',
      subject: 'English',
      score: 85,
      grade: 'A-',
      exam: 'Essay',
      date: '2025-01-17',
      teacher: 'Mr. Patrick Nkusi',
      comment: 'Mwiza cyane'
    },
    {
      student: 'Jean Mugisha',
      subject: 'Physics',
      score: 90,
      grade: 'A',
      exam: 'Lab Report',
      date: '2025-01-18',
      teacher: 'Dr. Sarah Johnson',
      comment: 'Excellent work'
    },
    {
      student: 'Marie Uwase',
      subject: 'Biology',
      score: 78,
      grade: 'B',
      exam: 'Mid-term',
      date: '2025-01-19',
      teacher: 'Ms. Alice Uwera',
      comment: 'Wongere gukora'
    },
  ];

  const attendance = [
    {
      student: 'Jean Mugisha',
      class: 'S3 A',
      present: 45,
      absent: 2,
      late: 1,
      total: 48,
      percentage: 93.8,
      lastAbsent: '2025-01-10'
    },
    {
      student: 'Marie Uwase',
      class: 'S5 B',
      present: 42,
      absent: 3,
      late: 2,
      total: 47,
      percentage: 89.4,
      lastAbsent: '2025-01-15'
    },
    {
      student: 'Patrick Nkusi',
      class: 'S2 C',
      present: 47,
      absent: 1,
      late: 0,
      total: 48,
      percentage: 97.9,
      lastAbsent: '2025-01-05'
    },
  ];

  const feeRecords = [
    {
      student: 'Jean Mugisha',
      term: 'Igice cya 1',
      totalFee: 'RWF 150,000',
      paid: 'RWF 150,000',
      balance: 'RWF 0',
      status: 'paid',
      dueDate: '2025-01-15',
      paymentDate: '2025-01-10'
    },
    {
      student: 'Marie Uwase',
      term: 'Igice cya 1',
      totalFee: 'RWF 150,000',
      paid: 'RWF 100,000',
      balance: 'RWF 50,000',
      status: 'partial',
      dueDate: '2025-01-15',
      paymentDate: '2025-01-08'
    },
    {
      student: 'Patrick Nkusi',
      term: 'Igice cya 1',
      totalFee: 'RWF 150,000',
      paid: 'RWF 150,000',
      balance: 'RWF 0',
      status: 'paid',
      dueDate: '2025-01-15',
      paymentDate: '2025-01-12'
    },
  ];

  const messages = [
    {
      from: 'Dr. Jean Mugabo',
      role: 'Umwarimu',
      subject: 'Imikorere ya Jean mu Mathematics',
      message: 'Jean arakora neza cyane mu mathematics. Komeza kumushigikira.',
      date: '2025-01-19',
      read: false,
      priority: 'normal'
    },
    {
      from: 'Director of Studies',
      role: 'Umuyobozi',
      subject: 'Inama y\'Ababyeyi',
      message: 'Inama y\'ababyeyi izaba ku wa 25/01/2025 saa 3 z\'umugoroba.',
      date: '2025-01-18',
      read: false,
      priority: 'high'
    },
    {
      from: 'Coach David',
      role: 'Umutoza',
      subject: 'Marie - Basketball Team',
      message: 'Marie arakora neza mu mukino. Yatorewe mu ikipe y\'ishuri.',
      date: '2025-01-17',
      read: true,
      priority: 'normal'
    },
    {
      from: 'Bursar Office',
      role: 'Ibiro by\'Amafaranga',
      subject: 'Kwishyura Amafaranga',
      message: 'Murakoze kwishyura amafaranga kuri wese. Balance ya Marie: RWF 50,000.',
      date: '2025-01-16',
      read: true,
      priority: 'medium'
    },
  ];

  const upcomingEvents = [
    {
      title: 'Inama y\'Ababyeyi',
      date: '2025-01-25',
      time: '15:00',
      location: 'Main Hall',
      type: 'meeting',
      attendees: 'Ababyeyi bose'
    },
    {
      title: 'Ikizamini cya Semestre',
      date: '2025-02-05',
      time: '08:00',
      location: 'Exam Hall',
      type: 'exam',
      attendees: 'Abanyeshuri bose'
    },
    {
      title: 'Umukino wa Basketball',
      date: '2025-01-28',
      time: '14:00',
      location: 'Sports Ground',
      type: 'sports',
      attendees: 'Ikipe y\'ishuri'
    },
    {
      title: 'Ibirori byo Guhabwa Impamyabonerwa',
      date: '2025-02-15',
      time: '10:00',
      location: 'School Grounds',
      type: 'ceremony',
      attendees: 'Abanyeshuri n\'Ababyeyi'
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-white overflow-hidden">
      <LeftSidebar currentPage="parent-dashboard" onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                  Dashbord y'Umubyeyi
                </h1>
                <p className="text-gray-600">Gukurikirana iterambere ry'abana</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ohereza Ubutumwa
                </Button>
                <Button variant="outline" className="border-2 border-yellow-200 hover:bg-yellow-50">
                  <Download className="h-4 w-4 mr-2" />
                  Raporo
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
                  >
                    <Card className={`border-2 border-yellow-200 hover:shadow-lg transition-all ${stat.bgColor}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex items-center space-x-1">
                            {stat.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto bg-white border-2 border-yellow-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Incamake
              </TabsTrigger>
              <TabsTrigger value="children" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Abana
              </TabsTrigger>
              <TabsTrigger value="grades" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amanota
              </TabsTrigger>
              <TabsTrigger value="attendance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Kwitabira
              </TabsTrigger>
              <TabsTrigger value="fees" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amafaranga
              </TabsTrigger>
              <TabsTrigger value="communication" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Itumanaho
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Bell className="h-5 w-5 mr-2 text-yellow-600" />
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
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                    {activity.student}
                                  </Badge>
                                  <Badge className={
                                    activity.type === 'exam' ? 'bg-blue-100 text-blue-700' :
                                    activity.type === 'sports' ? 'bg-orange-100 text-orange-700' :
                                    activity.type === 'assignment' ? 'bg-purple-100 text-purple-700' :
                                    'bg-green-100 text-green-700'
                                  }>
                                    {activity.type === 'exam' ? 'Ikizamini' :
                                     activity.type === 'sports' ? 'Siporo' :
                                     activity.type === 'assignment' ? 'Akazi' : 'Kwitabira'}
                                  </Badge>
                                </div>
                                <h4 className="font-bold text-gray-900">{activity.activity}</h4>
                                {activity.grade && (
                                  <p className="text-sm text-gray-600 mt-1">Amanota: {activity.grade}</p>
                                )}
                                {activity.achievement && (
                                  <p className="text-sm text-gray-600 mt-1">Achievement: {activity.achievement}</p>
                                )}
                              </div>
                              <Badge className={
                                activity.status === 'excellent' ? 'bg-green-100 text-green-700' :
                                activity.status === 'good' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {activity.status === 'excellent' ? 'Byiza cyane' :
                                 activity.status === 'good' ? 'Byiza' :
                                 activity.status === 'present' ? 'Yarahari' : 'Ntabwo yari'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{activity.date}</span>
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
                      <Calendar className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibirori Bizaza
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {upcomingEvents.map((event, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{event.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{event.attendees}</p>
                              </div>
                              <Badge className={
                                event.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                                event.type === 'exam' ? 'bg-red-100 text-red-700' :
                                event.type === 'sports' ? 'bg-orange-100 text-orange-700' :
                                'bg-purple-100 text-purple-700'
                              }>
                                {event.type === 'meeting' ? 'Inama' :
                                 event.type === 'exam' ? 'Ikizamini' :
                                 event.type === 'sports' ? 'Siporo' : 'Ibirori'}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {event.date} - {event.time}
                              </div>
                              <div className="flex items-center">
                                <Target className="h-3 w-3 mr-1" />
                                {event.location}
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

            <TabsContent value="children" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {children.map((child, index) => (
                  <Card key={index} className="border-2 border-yellow-200 hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center mb-4">
                        <Avatar className="h-24 w-24 border-4 border-yellow-400 mb-3">
                          <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-2xl font-bold">
                            {child.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-black text-gray-900 text-xl">{child.name}</h3>
                        <Badge className="mt-2 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                          {child.class}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Imikorere</span>
                            <span className="font-bold text-gray-900">{child.performance}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-yellow-500 to-green-500 h-3 rounded-full"
                              style={{ width: `${child.performance}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Kwitabira</span>
                            <span className="font-bold text-gray-900">{child.attendance}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full"
                              style={{ width: `${child.attendance}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-yellow-100">
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Rank</p>
                            <p className="text-lg font-black text-gray-900">{child.rank}/{child.totalStudents}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Amasomo</p>
                            <p className="text-lg font-black text-gray-900">{child.subjects}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Status</p>
                            <Badge className={
                              child.status === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }>
                              {child.status === 'excellent' ? 'Byiza' : 'Neza'}
                            </Badge>
                          </div>
                        </div>

                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0 mt-4">
                          <Eye className="h-4 w-4 mr-2" />
                          Reba Byose
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="grades" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Award className="h-5 w-5 mr-2 text-yellow-600" />
                      Amanota y'Abana
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-2 border-yellow-200 focus:border-yellow-400"
                      />
                      <Button variant="outline" className="border-2 border-yellow-200">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                          <th className="text-left p-4 font-bold text-gray-900">Umwana</th>
                          <th className="text-left p-4 font-bold text-gray-900">Isomo</th>
                          <th className="text-left p-4 font-bold text-gray-900">Amanota</th>
                          <th className="text-left p-4 font-bold text-gray-900">Icyiciro</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ikizamini</th>
                          <th className="text-left p-4 font-bold text-gray-900">Itariki</th>
                          <th className="text-left p-4 font-bold text-gray-900">Umwarimu</th>
                          <th className="text-left p-4 font-bold text-gray-900">Icyo bavuze</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((grade, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-4">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                {grade.student}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-gray-900">{grade.subject}</td>
                            <td className="p-4">
                              <span className="text-2xl font-black text-gray-900">{grade.score}%</span>
                            </td>
                            <td className="p-4">
                              <Badge className={
                                grade.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                grade.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }>
                                {grade.grade}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-700">{grade.exam}</td>
                            <td className="p-4 text-gray-700">{grade.date}</td>
                            <td className="p-4 text-gray-700">{grade.teacher}</td>
                            <td className="p-4 text-gray-700 italic">{grade.comment}</td>
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
                  <CardTitle className="flex items-center text-lg">
                    <UserCheck className="h-5 w-5 mr-2 text-yellow-600" />
                    Kwitabira kw'Abana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                          <th className="text-left p-4 font-bold text-gray-900">Umwana</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ikidasobwa</th>
                          <th className="text-left p-4 font-bold text-gray-900">Yarahari</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ntabwo yari</th>
                          <th className="text-left p-4 font-bold text-gray-900">Yatinze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Total</th>
                          <th className="text-left p-4 font-bold text-gray-900">%</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ubwa nyuma atari</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-4">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                {record.student}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-gray-900">{record.class}</td>
                            <td className="p-4 font-bold text-green-600">{record.present}</td>
                            <td className="p-4 font-bold text-red-600">{record.absent}</td>
                            <td className="p-4 font-bold text-orange-600">{record.late}</td>
                            <td className="p-4 font-medium text-gray-900">{record.total}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                                  <div
                                    className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full"
                                    style={{ width: `${record.percentage}%` }}
                                  />
                                </div>
                                <span className="font-bold text-gray-900">{record.percentage}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-700">{record.lastAbsent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                      Amafaranga y'Ishuri
                    </CardTitle>
                    <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                      <Plus className="h-4 w-4 mr-2" />
                      Ishyura
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                          <th className="text-left p-4 font-bold text-gray-900">Umwana</th>
                          <th className="text-left p-4 font-bold text-gray-900">Igice</th>
                          <th className="text-left p-4 font-bold text-gray-900">Total</th>
                          <th className="text-left p-4 font-bold text-gray-900">Byishyuwe</th>
                          <th className="text-left p-4 font-bold text-gray-900">Balance</th>
                          <th className="text-left p-4 font-bold text-gray-900">Uko Bimeze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Itariki y'Ishyura</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeRecords.map((record, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-4">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                {record.student}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-gray-900">{record.term}</td>
                            <td className="p-4 font-medium text-gray-900">{record.totalFee}</td>
                            <td className="p-4 font-medium text-green-600">{record.paid}</td>
                            <td className="p-4 font-bold text-red-600">{record.balance}</td>
                            <td className="p-4">
                              <Badge className={
                                record.status === 'paid' ? 'bg-green-100 text-green-700' :
                                record.status === 'partial' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }>
                                {record.status === 'paid' ? 'Byishyuwe' :
                                 record.status === 'partial' ? 'Igice' : 'Ntabwo byishyuwe'}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-700">{record.paymentDate}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Download className="h-4 w-4" />
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

            <TabsContent value="communication" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />
                      Ubutumwa bw'Abarimu
                    </CardTitle>
                    <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                      <Send className="h-4 w-4 mr-2" />
                      Ohereza Ubutumwa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <Card key={index} className={`border-2 ${message.read ? 'border-yellow-100 bg-white' : 'border-yellow-300 bg-yellow-50'} hover:shadow-md transition-all`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-12 w-12 border-2 border-yellow-400">
                                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                                  {message.from.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{message.from}</h4>
                                <p className="text-xs text-gray-600">{message.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={
                                message.priority === 'high' ? 'bg-red-100 text-red-700' :
                                message.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }>
                                {message.priority === 'high' ? 'Ngombwa' :
                                 message.priority === 'medium' ? 'Byiciriritse' : 'Normal'}
                              </Badge>
                              {!message.read && (
                                <Badge className="bg-yellow-500 text-white">Nshya</Badge>
                              )}
                            </div>
                          </div>
                          <h5 className="font-bold text-gray-900 mb-2">{message.subject}</h5>
                          <p className="text-gray-700 text-sm mb-3">{message.message}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-yellow-100">
                            <span className="text-xs text-gray-500">{message.date}</span>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" className="border-yellow-200">
                                <Send className="h-4 w-4 mr-1" />
                                Subiza
                              </Button>
                              <Button size="sm" variant="outline" className="border-yellow-200">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
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
    </div>
  );
};

export default ParentDashboard;

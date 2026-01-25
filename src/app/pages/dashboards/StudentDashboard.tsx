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
      value: '8',
      change: 'Iri giciro',
      trend: 'up',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ibizamini',
      value: '5',
      change: 'Bitegerejwe',
      trend: 'up',
      icon: ClipboardList,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Impera',
      value: '88.5%',
      change: '+4.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Kwitabira',
      value: '96.2%',
      change: '+1.5%',
      trend: 'up',
      icon: Calendar,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

  const myClasses = [
    {
      name: 'Mathematics',
      teacher: 'Mr. John Mugisha',
      schedule: 'Mon, Wed, Fri - 8:00 AM',
      grade: 92,
      attendance: 98,
      assignments: 2,
      color: 'from-yellow-500 to-amber-500',
      room: 'A-201'
    },
    {
      name: 'Physics',
      teacher: 'Dr. Sarah Uwase',
      schedule: 'Tue, Thu - 10:00 AM',
      grade: 85,
      attendance: 95,
      assignments: 1,
      color: 'from-blue-500 to-indigo-500',
      room: 'B-105'
    },
    {
      name: 'Chemistry',
      teacher: 'Mrs. Grace Ingabire',
      schedule: 'Mon, Wed - 1:00 PM',
      grade: 88,
      attendance: 97,
      assignments: 3,
      color: 'from-green-500 to-teal-500',
      room: 'B-107'
    },
    {
      name: 'English',
      teacher: 'Mr. Peter Karenzi',
      schedule: 'Tue, Thu, Fri - 2:00 PM',
      grade: 90,
      attendance: 96,
      assignments: 1,
      color: 'from-orange-500 to-red-500',
      room: 'A-103'
    },
    {
      name: 'Kinyarwanda',
      teacher: 'Mrs. Alice Mukandori',
      schedule: 'Mon, Wed - 11:00 AM',
      grade: 94,
      attendance: 99,
      assignments: 0,
      color: 'from-pink-500 to-rose-500',
      room: 'A-104'
    },
  ];

  const assignments = [
    {
      title: 'Imbaraga za Mathematique',
      subject: 'Mathematics',
      dueDate: 'Jan 28, 2026',
      status: 'pending',
      priority: 'high',
      points: 100,
      submitted: false,
      description: 'Gukora ibiganiro bya 1-20'
    },
    {
      title: 'Raporo ya Lab ya Physics',
      subject: 'Physics',
      dueDate: 'Jan 30, 2026',
      status: 'pending',
      priority: 'medium',
      points: 50,
      submitted: false,
      description: 'Kwandika raporo y\'ibizamini bya lab'
    },
    {
      title: 'Ibiganiro bya Chemistry',
      subject: 'Chemistry',
      dueDate: 'Feb 2, 2026',
      status: 'pending',
      priority: 'high',
      points: 75,
      submitted: false,
      description: 'Gukora ibiganiro 5-10'
    },
    {
      title: 'Inyandiko ya English',
      subject: 'English',
      dueDate: 'Jan 25, 2026',
      status: 'completed',
      priority: 'medium',
      points: 100,
      submitted: true,
      grade: 92,
      description: 'Kwandika inyandiko y\'amagambo 500'
    },
    {
      title: 'Ubushakashatsi bwa Kinyarwanda',
      subject: 'Kinyarwanda',
      dueDate: 'Jan 22, 2026',
      status: 'completed',
      priority: 'low',
      points: 50,
      submitted: true,
      grade: 95,
      description: 'Gukora ubushakashatsi ku by\'umuco'
    },
  ];

  const grades = [
    {
      subject: 'Mathematics',
      term1: 92,
      term2: 90,
      term3: 94,
      average: 92,
      grade: 'A',
      rank: 5,
      totalStudents: 42,
      teacher: 'Mr. John Mugisha',
      comment: 'Byiza cyane! Komeza gutyo.'
    },
    {
      subject: 'Physics',
      term1: 85,
      term2: 83,
      term3: 87,
      average: 85,
      grade: 'B+',
      rank: 12,
      totalStudents: 42,
      teacher: 'Dr. Sarah Uwase',
      comment: 'Ushobora kuzamura amanota.'
    },
    {
      subject: 'Chemistry',
      term1: 88,
      term2: 87,
      term3: 89,
      average: 88,
      grade: 'A-',
      rank: 8,
      totalStudents: 42,
      teacher: 'Mrs. Grace Ingabire',
      comment: 'Imikorere myiza. Komeza!'
    },
    {
      subject: 'English',
      term1: 90,
      term2: 89,
      term3: 91,
      average: 90,
      grade: 'A',
      rank: 6,
      totalStudents: 42,
      teacher: 'Mr. Peter Karenzi',
      comment: 'Excellent progress!'
    },
    {
      subject: 'Kinyarwanda',
      term1: 94,
      term2: 93,
      term3: 95,
      average: 94,
      grade: 'A',
      rank: 3,
      totalStudents: 42,
      teacher: 'Mrs. Alice Mukandori',
      comment: 'Byiza cyane! Urabikora neza.'
    },
  ];

  const attendance = [
    {
      month: 'Mutarama 2026',
      present: 18,
      absent: 0,
      late: 1,
      total: 19,
      percentage: 98.4
    },
    {
      month: 'Ukuboza 2025',
      present: 20,
      absent: 1,
      late: 0,
      total: 21,
      percentage: 95.2
    },
    {
      month: 'Ugushyingo 2025',
      present: 19,
      absent: 0,
      late: 2,
      total: 21,
      percentage: 96.8
    },
    {
      month: 'Ukwakira 2025',
      present: 21,
      absent: 1,
      late: 0,
      total: 22,
      percentage: 95.5
    },
  ];

  const activities = [
    {
      name: 'Basketball Team',
      role: 'Umukinnyi',
      schedule: 'Tue, Thu - 4:00 PM',
      status: 'active',
      achievements: 3,
      color: 'from-orange-500 to-red-500',
      coach: 'Coach Mike'
    },
    {
      name: 'Science Club',
      role: 'Umunyamuryango',
      schedule: 'Wed - 3:00 PM',
      status: 'active',
      achievements: 2,
      color: 'from-green-500 to-teal-500',
      coach: 'Dr. Sarah Uwase'
    },
    {
      name: 'Debate Team',
      role: 'Umuvugizi',
      schedule: 'Fri - 3:30 PM',
      status: 'active',
      achievements: 5,
      color: 'from-blue-500 to-indigo-500',
      coach: 'Mr. Peter Karenzi'
    },
    {
      name: 'Music Band',
      role: 'Umunyamuryango',
      schedule: 'Mon - 4:00 PM',
      status: 'active',
      achievements: 1,
      color: 'from-pink-500 to-rose-500',
      coach: 'Mrs. Grace Umutoni'
    },
  ];

  const recentActivities = [
    {
      title: 'Ikizamini cya Mathematics',
      description: 'Waronse amanota 92/100',
      time: '2 amasaha ashize',
      type: 'exam',
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      title: 'Umukino wa Basketball',
      description: 'Twatsinze 45-32',
      time: '1 umunsi ushize',
      type: 'sports',
      icon: Trophy,
      color: 'text-orange-600'
    },
    {
      title: 'Ibizamini bya Chemistry',
      description: 'Byashyizweho',
      time: '2 iminsi ishize',
      type: 'assignment',
      icon: ClipboardList,
      color: 'text-green-600'
    },
    {
      title: 'Inama ya Debate',
      description: 'Twaganiriye ku bibazo by\'ibidukikije',
      time: '3 iminsi ishize',
      type: 'activity',
      icon: MessageSquare,
      color: 'text-blue-600'
    },
  ];

  const upcomingDeadlines = [
    {
      title: 'Imbaraga za Math',
      date: 'Jan 28',
      subject: 'Mathematics',
      type: 'assignment',
      priority: 'high'
    },
    {
      title: 'Ikizamini cya Physics',
      date: 'Jan 29',
      subject: 'Physics',
      type: 'exam',
      priority: 'high'
    },
    {
      title: 'Raporo ya Lab',
      date: 'Jan 30',
      subject: 'Physics',
      type: 'assignment',
      priority: 'medium'
    },
    {
      title: 'Ibiganiro bya Chemistry',
      date: 'Feb 2',
      subject: 'Chemistry',
      type: 'assignment',
      priority: 'high'
    },
  ];

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
                <p className="text-white/90 mt-1">Murakaza neza, Jean Claude Mugisha - S3 A</p>
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
      </div>
    </div>
  );
};

export default StudentDashboard;

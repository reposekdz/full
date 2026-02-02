import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, BookOpen, Calendar, Clock, Award, TrendingUp, RefreshCw, Bell, Eye, MessageSquare, Trophy, ClipboardList, Target, Upload, Download, PlayCircle, Star, Zap, Activity, Users, FileText, Video, Headphones, CheckCircle, AlertCircle, TrendingDown, BarChart3, PieChart, Search, Filter, ChevronRight, Heart, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useAuth } from '@/app/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import ModernUniversalSidebar from '@/app/components/ModernUniversalSidebar';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';

interface RealEnhancedStudentDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const RealEnhancedStudentDashboard: React.FC<RealEnhancedStudentDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const API_BASE = 'http://localhost:5000/api';

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/dashboard`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setDashboardData(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/grades`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setGrades(data.grades);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/attendance`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setAttendance(data.attendance);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/performance`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setPerformance(data.performance);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/timetable`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setTimetable(data.timetable);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboard(), fetchGrades(), fetchAttendance(), fetchPerformance(), fetchTimetable()]);
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const stats = dashboardData ? {
    overall_grade: Math.round(dashboardData.average_grade || 0),
    attendance_rate: dashboardData.attendance?.total > 0 ? Math.round((dashboardData.attendance.present / dashboardData.attendance.total) * 100) : 0,
    completed_assignments: grades.filter(g => g.obtained_marks).length,
    total_assignments: grades.length,
    enrollments: dashboardData.enrollments?.length || 0
  } : { overall_grade: 0, attendance_rate: 0, completed_assignments: 0, total_assignments: 0, enrollments: 0 };

  const getPerformanceLevel = (grade: number) => {
    if (grade >= 90) return { label: 'Excellent', color: 'text-green-600', emoji: '🌟' };
    if (grade >= 80) return { label: 'Good', color: 'text-blue-600', emoji: '👍' };
    if (grade >= 70) return { label: 'Average', color: 'text-yellow-600', emoji: '👌' };
    if (grade >= 60) return { label: 'Below Average', color: 'text-orange-600', emoji: '⚠️' };
    return { label: 'Needs Improvement', color: 'text-red-600', emoji: '❗' };
  };

  const performanceLevel = getPerformanceLevel(stats.overall_grade);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <UniversalMessagingWidget />
      <ModernUniversalSidebar 
        currentPage="dashboard" 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 overflow-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-b sticky top-0 z-10 shadow-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl"
                >
                  <GraduationCap className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                    STUDENT PORTAL
                    <Badge className="bg-yellow-400 text-yellow-900 border-0">{performanceLevel.emoji}</Badge>
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base">Welcome back, {user?.name} • {performanceLevel.label}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 w-full sm:w-64"
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing} className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="secondary" size="icon" className="relative bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-white">3</Badge>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Alert className="mb-6 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
              <Trophy className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 font-bold text-lg">Outstanding Performance! 🎉</AlertTitle>
              <AlertDescription className="text-green-700">
                You're maintaining a <span className="font-bold">{stats.overall_grade}%</span> average with <span className="font-bold">{stats.attendance_rate}%</span> attendance. Keep up the excellent work!
              </AlertDescription>
            </Alert>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[
              { title: 'Overall Grade', value: `${stats.overall_grade}%`, icon: Target, color: 'from-green-500 via-emerald-500 to-teal-500', trend: '+5%', trendUp: true },
              { title: 'Attendance Rate', value: `${stats.attendance_rate}%`, icon: Calendar, color: 'from-blue-500 via-indigo-500 to-purple-500', trend: '+2%', trendUp: true },
              { title: 'Assignments', value: `${stats.completed_assignments}/${stats.total_assignments}`, icon: ClipboardList, color: 'from-purple-500 via-pink-500 to-rose-500', trend: '3 pending', trendUp: false },
              { title: 'Enrolled Courses', value: stats.enrollments.toString(), icon: BookOpen, color: 'from-yellow-500 via-orange-500 to-red-500', trend: 'Active', trendUp: true }
            ].map((stat, index) => (
              <motion.div 
                key={stat.title} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-white">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${stat.color} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-white/90 text-xs sm:text-sm mb-2 font-medium">{stat.title}</p>
                            <p className="text-3xl sm:text-4xl font-black">{stat.value}</p>
                          </div>
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <stat.icon className="w-10 h-10 sm:w-12 sm:h-12 opacity-90" />
                          </motion.div>
                        </div>
                        <div className="flex items-center gap-2">
                          {stat.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="text-xs font-medium">{stat.trend}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-full sm:w-auto min-w-full sm:min-w-0 bg-white shadow-lg rounded-xl p-2 border-2 border-gray-100">
                {[
                  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { value: 'courses', label: 'Courses', icon: BookOpen },
                  { value: 'grades', label: 'Grades', icon: Award },
                  { value: 'attendance', label: 'Attendance', icon: Calendar },
                  { value: 'timetable', label: 'Timetable', icon: Clock }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </ScrollArea>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Today's Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {timetable.filter(t => t.day_of_week === new Date().toLocaleDateString('en-US', { weekday: 'long' })).slice(0, 3).map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <div>
                              <p className="font-medium text-gray-900">{item.subject_name}</p>
                              <p className="text-sm text-gray-500">{item.teacher_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{item.start_time}</p>
                            <p className="text-xs text-gray-500">Room {item.room_number}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Recent Grades</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {grades.slice(0, 3).map((grade, index) => (
                        <motion.div key={grade.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div>
                            <p className="font-medium text-gray-900">{grade.subject_name}</p>
                            <p className="text-sm text-gray-500">{grade.assessment_name}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${Math.round((grade.obtained_marks / grade.max_marks) * 100) >= 90 ? 'bg-green-500' : Math.round((grade.obtained_marks / grade.max_marks) * 100) >= 80 ? 'bg-blue-500' : 'bg-yellow-500'} text-white`}>
                              {Math.round((grade.obtained_marks / grade.max_marks) * 100)}%
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Upload className="w-6 h-6" />
                      <span className="text-sm">Submit Assignment</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Calendar className="w-6 h-6" />
                      <span className="text-sm">View Schedule</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <MessageSquare className="w-6 h-6" />
                      <span className="text-sm">Message Teacher</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Download className="w-6 h-6" />
                      <span className="text-sm">Download Materials</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData?.enrollments?.map((enrollment: any) => (
                  <motion.div key={enrollment.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{enrollment.course_name}</CardTitle>
                            <CardDescription>{enrollment.course_code} • {enrollment.teacher_name}</CardDescription>
                          </div>
                          <Badge className="bg-blue-500 text-white">{enrollment.class_name}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Academic Year:</span>
                            <span className="text-sm font-medium">{enrollment.academic_year_name}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1"><Eye className="w-4 h-4 mr-2" />View</Button>
                            <Button size="sm" className="flex-1"><PlayCircle className="w-4 h-4 mr-2" />Continue</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="grades" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Grades</CardTitle>
                  <CardDescription>Track your academic performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Assessment</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Teacher</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grades.map((grade) => (
                          <TableRow key={grade.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{grade.subject_name}</TableCell>
                            <TableCell>{grade.assessment_name}</TableCell>
                            <TableCell>{new Date(grade.assessment_date).toLocaleDateString()}</TableCell>
                            <TableCell>{grade.obtained_marks}/{grade.max_marks}</TableCell>
                            <TableCell>
                              <Badge className={`${Math.round((grade.obtained_marks / grade.max_marks) * 100) >= 90 ? 'bg-green-500' : Math.round((grade.obtained_marks / grade.max_marks) * 100) >= 80 ? 'bg-blue-500' : Math.round((grade.obtained_marks / grade.max_marks) * 100) >= 70 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                {grade.grade_letter}
                              </Badge>
                            </TableCell>
                            <TableCell>{grade.teacher_name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>Monitor your attendance history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Marked By</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.map((record) => (
                          <TableRow key={record.id} className="hover:bg-gray-50">
                            <TableCell>{new Date(record.attendance_date).toLocaleDateString()}</TableCell>
                            <TableCell>{record.subject_name}</TableCell>
                            <TableCell>{record.class_name}</TableCell>
                            <TableCell>
                              <Badge variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'secondary' : 'destructive'}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.marked_by_name}</TableCell>
                            <TableCell className="text-sm text-gray-500">{record.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timetable" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Timetable</CardTitle>
                  <CardDescription>Your class schedule for the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day}>
                        <h3 className="font-bold text-lg mb-3">{day}</h3>
                        <div className="space-y-2">
                          {timetable.filter(t => t.day_of_week === day).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center space-x-4">
                                <div className="text-center">
                                  <p className="text-sm font-medium">{item.start_time}</p>
                                  <p className="text-xs text-gray-500">{item.end_time}</p>
                                </div>
                                <div>
                                  <p className="font-medium">{item.subject_name}</p>
                                  <p className="text-sm text-gray-500">{item.teacher_name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">Room {item.room_number}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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

export default RealEnhancedStudentDashboard;

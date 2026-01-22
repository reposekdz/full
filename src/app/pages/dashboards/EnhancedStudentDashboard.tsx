import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, BookOpen, Calendar, Clock, Award, TrendingUp, User, LogOut,
  Bell, Download, Upload, FileText, BarChart, Target, CheckCircle, XCircle,
  PlayCircle, PauseCircle, RefreshCw, Eye, MessageSquare, Star, Trophy,
  ClipboardList, Zap, Brain, Heart, Smile, AlertTriangle, Settings
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useAuth } from '@/app/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';

interface EnhancedStudentDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface Course {
  id: number;
  name: string;
  code: string;
  instructor: string;
  progress: number;
  grade: string;
  status: 'active' | 'completed' | 'pending';
  next_class?: string;
}

interface Assignment {
  id: number;
  title: string;
  course: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  description: string;
}

interface Attendance {
  date: string;
  course: string;
  status: 'present' | 'absent' | 'late';
  time_in?: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  date_earned: string;
  category: 'academic' | 'sports' | 'behavior' | 'special';
}

interface StudentStats {
  overall_grade: number;
  attendance_rate: number;
  completed_assignments: number;
  total_assignments: number;
  current_rank: number;
  total_students: number;
  achievements_count: number;
}

const EnhancedStudentDashboard: React.FC<EnhancedStudentDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const API_BASE = 'http://localhost:5000/api';

  // Fetch student courses
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/assignments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  // Fetch attendance
  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/attendance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAttendance(data.attendance || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  // Fetch achievements
  const fetchAchievements = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/achievements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Fetch student statistics
  const fetchStudentStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStudentStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCourses(),
      fetchAssignments(),
      fetchAttendance(),
      fetchAchievements(),
      fetchStudentStats()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  // Mock data for demo purposes when API doesn't return data
  const mockStats = {
    overall_grade: 87.5,
    attendance_rate: 94.2,
    completed_assignments: 23,
    total_assignments: 28,
    current_rank: 15,
    total_students: 120,
    achievements_count: 7
  };

  const mockCourses = [
    { id: 1, name: 'JavaScript Programming', code: 'JS101', instructor: 'Mr. Johnson', progress: 75, grade: 'A-', status: 'active' as const, next_class: '2024-01-23 09:00' },
    { id: 2, name: 'Database Design', code: 'DB201', instructor: 'Ms. Smith', progress: 60, grade: 'B+', status: 'active' as const, next_class: '2024-01-23 11:00' },
    { id: 3, name: 'Web Development', code: 'WEB301', instructor: 'Mr. Brown', progress: 90, grade: 'A', status: 'active' as const, next_class: '2024-01-23 14:00' },
  ];

  const mockAssignments = [
    { id: 1, title: 'React Component Development', course: 'JavaScript Programming', due_date: '2024-01-25', status: 'pending' as const, description: 'Create a functional React component with state management' },
    { id: 2, title: 'Database Schema Design', course: 'Database Design', due_date: '2024-01-27', status: 'pending' as const, description: 'Design a normalized database schema for e-commerce platform' },
    { id: 3, title: 'Portfolio Website', course: 'Web Development', due_date: '2024-01-30', status: 'submitted' as const, grade: 92, description: 'Create a professional portfolio website' },
  ];

  const stats = studentStats || mockStats;
  const coursesData = courses.length > 0 ? courses : mockCourses;
  const assignmentsData = assignments.length > 0 ? assignments : mockAssignments;

  const getGradeColor = (grade: string) => {
    switch (grade.charAt(0)) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600';
      case 'absent': return 'text-red-600';
      case 'late': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceLevel = (grade: number) => {
    if (grade >= 90) return { label: 'Excellent', color: 'text-green-600', emoji: '🌟' };
    if (grade >= 80) return { label: 'Good', color: 'text-blue-600', emoji: '👍' };
    if (grade >= 70) return { label: 'Average', color: 'text-yellow-600', emoji: '👌' };
    if (grade >= 60) return { label: 'Below Average', color: 'text-orange-600', emoji: '⚠️' };
    return { label: 'Needs Improvement', color: 'text-red-600', emoji: '❗' };
  };

  const performance = getPerformanceLevel(stats.overall_grade);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <AdvancedLeftSidebar currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-black text-gray-900">STUDENT DASHBOARD</h1>
                  <p className="text-gray-600">
                    Welcome back, {user?.name} • Grade {performance.emoji} {performance.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                    3
                  </Badge>
                </Button>
                <Button variant="ghost" className="rounded-full" onClick={onLogout}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Performance Alert */}
          <Alert className={`mb-6 border-green-200 bg-green-50`}>
            <Trophy className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Outstanding Performance! 🎉</AlertTitle>
            <AlertDescription className="text-green-700">
              You're in the top 15% of your class with a {stats.overall_grade}% average. Keep up the excellent work!
            </AlertDescription>
          </Alert>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Overall Grade',
                value: `${stats.overall_grade}%`,
                change: '+2.5%',
                icon: Target,
                color: 'from-green-500 to-green-600',
                trend: 'up'
              },
              {
                title: 'Attendance Rate',
                value: `${stats.attendance_rate}%`,
                change: '+1.2%',
                icon: Calendar,
                color: 'from-blue-500 to-blue-600',
                trend: 'up'
              },
              {
                title: 'Assignments',
                value: `${stats.completed_assignments}/${stats.total_assignments}`,
                change: '+3 this week',
                icon: ClipboardList,
                color: 'from-purple-500 to-purple-600',
                trend: 'up'
              },
              {
                title: 'Class Rank',
                value: `#${stats.current_rank}`,
                change: '+2 positions',
                icon: Award,
                color: 'from-yellow-500 to-yellow-600',
                trend: 'up'
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white/80 text-sm mb-1">{stat.title}</p>
                          <p className="text-3xl font-black">{stat.value}</p>
                        </div>
                        <stat.icon className="w-10 h-10 opacity-80" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-white/20 text-white text-xs">
                          {stat.change}
                        </Badge>
                        <span className="text-sm text-white/80">vs last week</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Today's Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {coursesData.slice(0, 3).map((course, index) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full bg-blue-500`}></div>
                            <div>
                              <p className="font-medium text-gray-900">{course.name}</p>
                              <p className="text-sm text-gray-500">{course.instructor}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{course.next_class?.split(' ')[1] || '09:00'}</p>
                            <p className="text-xs text-gray-500">Room A102</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Grades */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart className="w-5 h-5" />
                      <span>Recent Grades</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignmentsData.filter(a => a.grade).slice(0, 3).map((assignment, index) => (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-sm text-gray-500">{assignment.course}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${assignment.grade! >= 90 ? 'bg-green-500' : assignment.grade! >= 80 ? 'bg-blue-500' : 'bg-yellow-500'} text-white`}>
                              {assignment.grade}%
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
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

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesData.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                            <CardDescription>{course.code} • {course.instructor}</CardDescription>
                          </div>
                          <Badge className={`${getGradeColor(course.grade)} text-white`}>
                            {course.grade}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Next Class:</span>
                            <span className="text-sm font-medium">
                              {course.next_class ? new Date(course.next_class).toLocaleString() : 'TBD'}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button size="sm" className="flex-1">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Management</CardTitle>
                  <CardDescription>Track your assignments and deadlines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignmentsData.map((assignment) => (
                          <TableRow key={assignment.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <p className="font-medium">{assignment.title}</p>
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {assignment.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{assignment.course}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{new Date(assignment.due_date).toLocaleDateString()}</p>
                                <p className="text-gray-500">
                                  {new Date(assignment.due_date) > new Date() ? 
                                    `${Math.ceil((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left` : 
                                    'Past due'
                                  }
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={assignment.status === 'submitted' ? 'default' : 
                                            assignment.status === 'graded' ? 'secondary' : 'destructive'}>
                                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {assignment.grade ? (
                                <Badge className={`${assignment.grade >= 90 ? 'bg-green-500' : 
                                                   assignment.grade >= 80 ? 'bg-blue-500' : 'bg-yellow-500'} text-white`}>
                                  {assignment.grade}%
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {assignment.status === 'pending' ? (
                                <Button size="sm">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Submit
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {coursesData.map((course) => (
                        <div key={course.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{course.name}</span>
                            <span className="text-sm text-gray-500">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Performance chart will be implemented here</p>
                        <p className="text-sm">Track your academic progress over time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 1, title: 'Perfect Attendance', description: 'Attended all classes this month', icon: '🎯', category: 'behavior', date_earned: '2024-01-15' },
                  { id: 2, title: 'Top Student', description: 'Ranked in top 10% of class', icon: '🏆', category: 'academic', date_earned: '2024-01-10' },
                  { id: 3, title: 'Assignment Master', description: 'Submitted all assignments on time', icon: '📋', category: 'academic', date_earned: '2024-01-08' },
                  { id: 4, title: 'Team Player', description: 'Excellent collaboration in group projects', icon: '🤝', category: 'behavior', date_earned: '2024-01-05' },
                  { id: 5, title: 'Quick Learner', description: 'Mastered new concepts rapidly', icon: '⚡', category: 'academic', date_earned: '2024-01-03' },
                  { id: 6, title: 'Problem Solver', description: 'Solved complex challenges independently', icon: '🧩', category: 'academic', date_earned: '2024-01-01' },
                ].map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="text-4xl">{achievement.icon}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                          </div>
                          <Badge variant={achievement.category === 'academic' ? 'default' : 'secondary'}>
                            {achievement.category}
                          </Badge>
                          <p className="text-xs text-gray-400">
                            Earned on {new Date(achievement.date_earned).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;
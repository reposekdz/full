import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Users, Calendar, Clock, Award, TrendingUp, LogOut, Settings,
  Bell, Download, Upload, FileText, BarChart, Target, CheckCircle, XCircle,
  PlayCircle, PauseCircle, RefreshCw, Eye, MessageSquare, Star, Trophy,
  ClipboardList, UserCheck, GraduationCap, Brain, AlertTriangle, Plus,
  Edit, Trash2, Search, Filter, ChevronDown, ChevronRight, Zap
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
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
import { Grid } from 'lucide-react';

interface EnhancedTeacherDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface Class {
  id: number;
  name: string;
  code: string;
  students_count: number;
  schedule: string;
  room: string;
  progress: number;
  next_session: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  class: string;
  attendance_rate: number;
  avg_grade: number;
  status: 'active' | 'inactive' | 'warning';
  last_activity: string;
}

interface Assignment {
  id: number;
  title: string;
  class: string;
  due_date: string;
  submissions: number;
  total_students: number;
  avg_grade?: number;
  status: 'active' | 'graded' | 'past_due';
}

interface TeacherStats {
  total_students: number;
  total_classes: number;
  avg_attendance: number;
  assignments_pending: number;
  avg_class_performance: number;
  weekly_hours: number;
}

const EnhancedTeacherDashboard: React.FC<EnhancedTeacherDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [expandedClasses, setExpandedClasses] = useState<Set<number>>(new Set());

  // New assignment form
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    class_id: '',
    due_date: '',
    total_points: 100,
    instructions: ''
  });

  const API_BASE = 'http://localhost:5000/api';

  // Fetch teacher classes
  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboards/teacher`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data.classes || []);
        setTeacherStats({
          total_students: data.data.total_students || 0,
          total_classes: data.data.classes?.length || 0,
          avg_attendance: 92.5,
          assignments_pending: 8,
          avg_class_performance: 84.2,
          weekly_hours: 24
        });
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/teachers/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE}/teachers/assignments`, {
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

  // Fetch teacher statistics
  const fetchTeacherStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/teachers/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTeacherStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
    }
  };

  // Create new assignment
  const handleCreateAssignment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/teachers/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAssignment)
      });

      const data = await response.json();
      if (data.success) {
        setIsCreateAssignmentOpen(false);
        setNewAssignment({
          title: '',
          description: '',
          class_id: '',
          due_date: '',
          total_points: 100,
          instructions: ''
        });
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark attendance
  const handleMarkAttendance = async (classId: number, studentId: number, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/teachers/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          class_id: classId,
          student_id: studentId,
          status,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchClasses(),
      fetchStudents(),
      fetchAssignments(),
      fetchTeacherStats()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  // Mock data for demo
  const mockStats = {
    total_students: 125,
    total_classes: 6,
    avg_attendance: 92.5,
    assignments_pending: 8,
    avg_class_performance: 84.2,
    weekly_hours: 24
  };

  const mockClasses = [
    { id: 1, name: 'Advanced JavaScript', code: 'JS301', students_count: 28, schedule: 'Mon/Wed/Fri 9:00-10:30', room: 'A101', progress: 75, next_session: '2024-01-23 09:00' },
    { id: 2, name: 'Database Systems', code: 'DB201', students_count: 32, schedule: 'Tue/Thu 11:00-12:30', room: 'B203', progress: 60, next_session: '2024-01-23 11:00' },
    { id: 3, name: 'Web Development', code: 'WEB101', students_count: 25, schedule: 'Mon/Wed 14:00-15:30', room: 'C105', progress: 85, next_session: '2024-01-23 14:00' },
  ];

  const mockStudents = [
    { id: 1, name: 'John Doe', email: 'john@example.com', class: 'JS301', attendance_rate: 95, avg_grade: 88, status: 'active' as const, last_activity: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', class: 'DB201', attendance_rate: 87, avg_grade: 92, status: 'active' as const, last_activity: '1 day ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', class: 'WEB101', attendance_rate: 78, avg_grade: 75, status: 'warning' as const, last_activity: '3 days ago' },
  ];

  const mockAssignments = [
    { id: 1, title: 'React Components Project', class: 'JS301', due_date: '2024-01-25', submissions: 20, total_students: 28, status: 'active' as const },
    { id: 2, title: 'Database Design Exercise', class: 'DB201', due_date: '2024-01-27', submissions: 25, total_students: 32, avg_grade: 85, status: 'graded' as const },
    { id: 3, title: 'Portfolio Website', class: 'WEB101', due_date: '2024-01-20', submissions: 22, total_students: 25, avg_grade: 78, status: 'past_due' as const },
  ];

  const stats = teacherStats || mockStats;
  const classesData = classes.length > 0 ? classes : mockClasses;
  const studentsData = students.length > 0 ? students : mockStudents;
  const assignmentsData = assignments.length > 0 ? assignments : mockAssignments;

  // Filter students
  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const toggleClassExpansion = (classId: number) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'graded': return 'bg-green-500';
      case 'past_due': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <UniversalMessagingWidget />
      <AdvancedLeftSidebar currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-black text-gray-900">TEACHER DASHBOARD</h1>
                  <p className="text-gray-600">
                    Welcome back, {user?.name} • {classesData.length} Active Classes
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
                    {stats.assignments_pending}
                  </Badge>
                </Button>
                <Button variant="ghost" className="rounded-full" onClick={onLogout}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Alert */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Teaching Excellence</AlertTitle>
            <AlertDescription className="text-blue-700">
              Your classes maintain a {stats.avg_attendance}% attendance rate with {stats.avg_class_performance}% average performance. Keep up the great work!
            </AlertDescription>
          </Alert>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[
              {
                title: 'Total Students',
                value: stats.total_students.toString(),
                change: '+5 this week',
                icon: Users,
                color: 'from-blue-500 to-blue-600',
                trend: 'up'
              },
              {
                title: 'Active Classes',
                value: stats.total_classes.toString(),
                change: '2 today',
                icon: BookOpen,
                color: 'from-green-500 to-green-600',
                trend: 'neutral'
              },
              {
                title: 'Avg Attendance',
                value: `${stats.avg_attendance}%`,
                change: '+1.2%',
                icon: UserCheck,
                color: 'from-purple-500 to-purple-600',
                trend: 'up'
              },
              {
                title: 'Pending Reviews',
                value: stats.assignments_pending.toString(),
                change: '-3 today',
                icon: ClipboardList,
                color: 'from-yellow-500 to-yellow-600',
                trend: 'down'
              },
              {
                title: 'Class Performance',
                value: `${stats.avg_class_performance}%`,
                change: '+2.5%',
                icon: TrendingUp,
                color: 'from-pink-500 to-pink-600',
                trend: 'up'
              },
              {
                title: 'Weekly Hours',
                value: stats.weekly_hours.toString(),
                change: 'This week',
                icon: Clock,
                color: 'from-teal-500 to-teal-600',
                trend: 'neutral'
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-r ${stat.color} p-4 text-white`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white/80 text-xs font-medium">{stat.title}</p>
                          <p className="text-2xl font-black">{stat.value}</p>
                        </div>
                        <stat.icon className="w-8 h-8 opacity-80" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">
                          {stat.change}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="global-sheets">Global Sheets</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Classes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Today's Classes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {classesData.slice(0, 3).map((cls, index) => (
                        <motion.div
                          key={cls.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <div>
                              <p className="font-medium text-gray-900">{cls.name}</p>
                              <p className="text-sm text-gray-500">{cls.students_count} students • {cls.room}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{cls.next_session?.split(' ')[1] || '09:00'}</p>
                            <Badge variant="outline" className="text-xs">
                              {cls.progress}% Complete
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ClipboardList className="w-5 h-5" />
                        <span>Assignments to Review</span>
                      </div>
                      <Badge variant="outline">{assignmentsData.filter(a => a.status === 'active').length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignmentsData.filter(a => a.status === 'active').slice(0, 3).map((assignment, index) => (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-sm text-gray-500">{assignment.class}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{assignment.submissions}/{assignment.total_students}</p>
                            <p className="text-xs text-gray-500">submissions</p>
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
                    <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                          <Plus className="w-6 h-6" />
                          <span className="text-sm">Create Assignment</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Assignment</DialogTitle>
                          <DialogDescription>Create a new assignment for your students</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Assignment Title</Label>
                            <Input
                              id="title"
                              value={newAssignment.title}
                              onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="React Components Project"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={newAssignment.description}
                              onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Brief description of the assignment"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="class">Class</Label>
                              <Select value={newAssignment.class_id} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, class_id: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                  {classesData.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id.toString()}>
                                      {cls.name} ({cls.code})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="due_date">Due Date</Label>
                              <Input
                                id="due_date"
                                type="datetime-local"
                                value={newAssignment.due_date}
                                onChange={(e) => setNewAssignment(prev => ({ ...prev, due_date: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="points">Total Points</Label>
                            <Input
                              id="points"
                              type="number"
                              value={newAssignment.total_points}
                              onChange={(e) => setNewAssignment(prev => ({ ...prev, total_points: parseInt(e.target.value) }))}
                              placeholder="100"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCreateAssignmentOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateAssignment} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Assignment'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <UserCheck className="w-6 h-6" />
                      <span className="text-sm">Mark Attendance</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <BarChart className="w-6 h-6" />
                      <span className="text-sm">Grade Assignments</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <MessageSquare className="w-6 h-6" />
                      <span className="text-sm">Message Students</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes" className="space-y-6">
              <div className="space-y-4">
                {classesData.map((cls) => (
                  <Card key={cls.id} className="overflow-hidden">
                    <Collapsible
                      open={expandedClasses.has(cls.id)}
                      onOpenChange={() => toggleClassExpansion(cls.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {expandedClasses.has(cls.id) ?
                                  <ChevronDown className="w-5 h-5" /> :
                                  <ChevronRight className="w-5 h-5" />
                                }
                                <div>
                                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                                  <CardDescription>{cls.code} • {cls.students_count} students • {cls.room}</CardDescription>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm font-medium">{cls.progress}% Complete</p>
                                <p className="text-xs text-gray-500">{cls.schedule}</p>
                              </div>
                              <Progress value={cls.progress} className="w-24 h-2" />
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="border-t bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Class Statistics</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Average Grade:</span>
                                  <span className="font-medium">85%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Attendance Rate:</span>
                                  <span className="font-medium">92%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Active Assignments:</span>
                                  <span className="font-medium">3</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                              <div className="space-y-2 text-sm">
                                <p className="text-gray-600">• 5 students submitted assignments</p>
                                <p className="text-gray-600">• 2 students were absent yesterday</p>
                                <p className="text-gray-600">• New quiz scheduled for Friday</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                              <div className="space-y-2">
                                <Button size="sm" className="w-full">View All Students</Button>
                                <Button size="sm" variant="outline" className="w-full">Create Assignment</Button>
                                <Button size="sm" variant="outline" className="w-full">Mark Attendance</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Student Management</CardTitle>
                      <CardDescription>Monitor student progress and performance</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search students by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterClass} onValueChange={setFilterClass}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classesData.map((cls) => (
                          <SelectItem key={cls.id} value={cls.code}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Students Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Avg Grade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Activity</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {student.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{student.name}</p>
                                  <p className="text-sm text-gray-500">{student.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={student.attendance_rate} className="w-16 h-2" />
                                <span className="text-sm font-medium">{student.attendance_rate}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${student.avg_grade >= 90 ? 'bg-green-500' :
                                student.avg_grade >= 80 ? 'bg-blue-500' :
                                  student.avg_grade >= 70 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                {student.avg_grade}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(student.status)}`}></div>
                                <span className="text-sm capitalize">{student.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {student.last_activity}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex space-x-2 justify-end">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Assignment Management</CardTitle>
                      <CardDescription>Create, track, and grade assignments</CardDescription>
                    </div>
                    <Button onClick={() => setIsCreateAssignmentOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Assignment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Submissions</TableHead>
                          <TableHead>Avg Grade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignmentsData.map((assignment) => (
                          <TableRow key={assignment.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <p className="font-medium">{assignment.title}</p>
                                <p className="text-sm text-gray-500">{assignment.class}</p>
                              </div>
                            </TableCell>
                            <TableCell>{assignment.class}</TableCell>
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
                              <div className="flex items-center space-x-2">
                                <Progress value={(assignment.submissions / assignment.total_students) * 100} className="w-16 h-2" />
                                <span className="text-sm font-medium">
                                  {assignment.submissions}/{assignment.total_students}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {assignment.avg_grade ? (
                                <Badge className="bg-blue-500 text-white">
                                  {assignment.avg_grade}%
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getAssignmentStatusColor(assignment.status)} text-white`}>
                                {assignment.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex space-x-2 justify-end">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <BarChart className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Class Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Performance analytics chart will be implemented here</p>
                        <p className="text-sm">Track student progress over time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Attendance trends chart will be implemented here</p>
                        <p className="text-sm">Monitor attendance patterns</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div >
  );
};

export default EnhancedTeacherDashboard;
ing students import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Users, Calendar, Clock, Award, TrendingUp, RefreshCw, Bell, Eye, MessageSquare, ClipboardList, UserCheck, BarChart, Plus, Search, Filter, Download, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';

interface RealEnhancedTeacherDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const RealEnhancedTeacherDashboard: React.FC<RealEnhancedTeacherDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [expandedClasses, setExpandedClasses] = useState<Set<number>>(new Set());
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);

  const API_BASE = 'http://localhost:5000/api';

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/teachers/classes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setClasses(data.classes);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const classesRes = await fetch(`${API_BASE}/teachers/classes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const classesData = await classesRes.json();
      if (!classesData.success) return;

      const allStudents: any[] = [];
      for (const cls of classesData.classes) {
        const studentsRes = await fetch(`${API_BASE}/teachers/classes/${cls.id}/students`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const studentsData = await studentsRes.json();
        if (studentsData.success) {
          studentsData.students.forEach((s: any) => {
            allStudents.push({
              ...s,
              name: `${s.first_name} ${s.last_name}`,
              class: cls.course_code,
              attendance_rate: s.total_attendance > 0 ? Math.round((s.present_count / s.total_attendance) * 100) : 0,
              avg_grade: Math.round(s.average_grade || 0),
              status: s.is_active ? 'active' : 'inactive'
            });
          });
        }
      }
      setStudents(allStudents);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTeacherStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/teachers/statistics`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setTeacherStats(data.statistics);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchClassStudents = async (classId: number) => {
    try {
      const response = await fetch(`${API_BASE}/teachers/classes/${classId}/students`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setClassStudents(data.students);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchClasses(), fetchAllStudents(), fetchTeacherStats()]);
    setRefreshing(false);
  };

  const handleMarkAttendance = async (attendanceData: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/teachers/attendance/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(attendanceData)
      });
      const data = await response.json();
      if (data.success) {
        setIsAttendanceDialogOpen(false);
        handleRefresh();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGrades = async (gradesData: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/teachers/grades/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ grades: gradesData })
      });
      const data = await response.json();
      if (data.success) {
        setIsGradeDialogOpen(false);
        handleRefresh();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const stats = teacherStats || { total_students: 0, total_classes: 0, total_grades: 0, total_attendance: 0 };
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || s.class === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <UniversalMessagingWidget />
      <AdvancedLeftSidebar currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-black text-gray-900">TEACHER DASHBOARD</h1>
                  <p className="text-gray-600">Welcome back, {user?.name} • {classes.length} Active Classes</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">3</Badge>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Teaching Excellence</AlertTitle>
            <AlertDescription className="text-blue-700">
              You're managing {stats.total_classes} classes with {stats.total_students} students. Keep up the great work!
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: 'Total Students', value: stats.total_students.toString(), icon: Users, color: 'from-blue-500 to-blue-600' },
              { title: 'Active Classes', value: stats.total_classes.toString(), icon: BookOpen, color: 'from-green-500 to-green-600' },
              { title: 'Grades Submitted', value: stats.total_grades.toString(), icon: Award, color: 'from-purple-500 to-purple-600' },
              { title: 'Attendance Marked', value: stats.total_attendance.toString(), icon: UserCheck, color: 'from-yellow-500 to-yellow-600' }
            ].map((stat, index) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="overflow-hidden hover:shadow-lg transition-all">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white/80 text-xs font-medium">{stat.title}</p>
                          <p className="text-2xl font-black">{stat.value}</p>
                        </div>
                        <stat.icon className="w-8 h-8 opacity-80" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Today's Classes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {classes.slice(0, 3).map((cls, index) => (
                        <motion.div key={cls.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <div>
                              <p className="font-medium text-gray-900">{cls.course_name}</p>
                              <p className="text-sm text-gray-500">{cls.student_count} students</p>
                            </div>
                          </div>
                          <Badge variant="outline">{cls.course_code}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" onClick={() => setIsGradeDialogOpen(true)}>
                        <BarChart className="w-6 h-6" />
                        <span className="text-sm">Grade Assignments</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" onClick={() => setIsAttendanceDialogOpen(true)}>
                        <UserCheck className="w-6 h-6" />
                        <span className="text-sm">Mark Attendance</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                        <MessageSquare className="w-6 h-6" />
                        <span className="text-sm">Message Students</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                        <Download className="w-6 h-6" />
                        <span className="text-sm">Export Data</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="classes" className="space-y-6">
              <div className="space-y-4">
                {classes.map((cls) => (
                  <Card key={cls.id} className="overflow-hidden">
                    <Collapsible open={expandedClasses.has(cls.id)} onOpenChange={() => {
                      const newExpanded = new Set(expandedClasses);
                      if (newExpanded.has(cls.id)) newExpanded.delete(cls.id);
                      else { newExpanded.add(cls.id); fetchClassStudents(cls.id); }
                      setExpandedClasses(newExpanded);
                    }}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {expandedClasses.has(cls.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                <div>
                                  <CardTitle className="text-lg">{cls.course_name}</CardTitle>
                                  <CardDescription>{cls.course_code} • {cls.student_count} students</CardDescription>
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-blue-500 text-white">{cls.academic_year_name}</Badge>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="border-t bg-gray-50">
                          <div className="py-4">
                            <h4 className="font-medium text-gray-900 mb-3">Students in this class</h4>
                            <div className="space-y-2">
                              {classStudents.map((student) => (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                  <div>
                                    <p className="font-medium">{student.first_name} {student.last_name}</p>
                                    <p className="text-sm text-gray-500">{student.email}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge>{Math.round(student.average_grade || 0)}%</Badge>
                                    <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Student Management</CardTitle>
                      <CardDescription>Monitor student progress and performance</CardDescription>
                    </div>
                    <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export Data</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Select value={filterClass} onValueChange={setFilterClass}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((cls) => (<SelectItem key={cls.id} value={cls.course_code}>{cls.course_name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Avg Grade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-blue-100 text-blue-600">{student.name?.charAt(0)}</AvatarFallback>
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
                              <Badge className={`${student.avg_grade >= 90 ? 'bg-green-500' : student.avg_grade >= 80 ? 'bg-blue-500' : student.avg_grade >= 70 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                {student.avg_grade}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm capitalize">{student.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex space-x-2 justify-end">
                                <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
                                <Button size="sm" variant="outline"><MessageSquare className="w-4 h-4" /></Button>
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

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Performance Analytics</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Analytics dashboard with real-time data visualization</p>
                    </div>
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

export default RealEnhancedTeacherDashboard;

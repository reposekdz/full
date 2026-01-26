import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, GraduationCap, FileText, CheckCircle, XCircle, Clock, Calendar,
  TrendingUp, Award, BookOpen, Edit, Trash2, Plus, Save, X, Eye, Download,
  Upload, MessageSquare, Bell, Settings, BarChart3, PieChart, Activity,
  Target, Trophy, AlertCircle, Search, Filter, RefreshCw, Send, Mail,
  Phone, MapPin, DollarSign, Clipboard, ClipboardCheck, UserCheck, Home,
  Star, ThumbsUp, MessageCircle, Share2, Printer, FileDown, Image as ImageIcon,
  Video, Headphones, FolderOpen, Lock, Unlock, AlertTriangle, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';

const API_BASE = 'http://localhost:5000/api';

interface Class {
  id: number;
  name: string;
  level: string;
  total_students: number;
  subjects: string[];
  class_teacher?: string;
}

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  attendance_rate: number;
  average_grade: number;
  status: string;
  profile_picture?: string;
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  class: string;
  due_date: string;
  total_marks: number;
  submissions: number;
  total_students: number;
  graded: number;
  status: 'active' | 'closed' | 'draft';
}

interface Attendance {
  date: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

interface GradeRecord {
  student_id: number;
  student_name: string;
  assignments: number;
  quizzes: number;
  exams: number;
  final_grade: string;
  percentage: number;
  rank: number;
}

const ComprehensiveTeacherPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    subject: '',
    class_id: '',
    due_date: '',
    total_marks: 100,
    instructions: ''
  });

  const [attendanceForm, setAttendanceForm] = useState<Record<number, string>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [stats, setStats] = useState({
    total_classes: 0,
    total_students: 0,
    pending_submissions: 0,
    pending_grading: 0,
    average_attendance: 0,
    assignments_created: 0,
    materials_uploaded: 0,
    announcements_sent: 0
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassData();
    }
  }, [selectedClass]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [classesRes, assignmentsRes, materialsRes, announcementsRes] = await Promise.all([
        fetch(`${API_BASE}/teachers/my-classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/assignments/teacher`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/academic-system/materials/teacher`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/announcements?published_by=me`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [classesData, assignmentsData, materialsData, announcementsData] = await Promise.all([
        classesRes.json(),
        assignmentsRes.json(),
        materialsRes.json(),
        announcementsRes.json()
      ]);

      if (classesData.success) {
        const classList = classesData.data || classesData.classes || [];
        setClasses(classList);
        setStats(prev => ({ ...prev, total_classes: classList.length }));
        if (classList.length > 0) {
          setSelectedClass(classList[0]);
        }
      }

      if (assignmentsData.success) {
        const assignmentsList = assignmentsData.data || assignmentsData.assignments || [];
        setAssignments(assignmentsList);
        const pending = assignmentsList.filter((a: Assignment) => a.graded < a.submissions).length;
        setStats(prev => ({ 
          ...prev, 
          assignments_created: assignmentsList.length,
          pending_grading: pending 
        }));
      }

      if (materialsData.success) {
        setMaterials(materialsData.data || materialsData.materials || []);
        setStats(prev => ({ ...prev, materials_uploaded: (materialsData.data || []).length }));
      }

      if (announcementsData.success) {
        setAnnouncements(announcementsData.data || []);
        setStats(prev => ({ ...prev, announcements_sent: (announcementsData.data || []).length }));
      }

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassData = async () => {
    if (!selectedClass) return;

    setRefreshing(true);
    const token = localStorage.getItem('token');

    try {
      const [studentsRes, attendanceRes, gradesRes, submissionsRes] = await Promise.all([
        fetch(`${API_BASE}/students?class_id=${selectedClass.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/attendance/class/${selectedClass.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/grades/class/${selectedClass.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/assignments/submissions?class_id=${selectedClass.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [studentsData, attendanceData, gradesData, submissionsData] = await Promise.all([
        studentsRes.json(),
        attendanceRes.json(),
        gradesRes.json(),
        submissionsRes.json()
      ]);

      if (studentsData.success) {
        setStudents(studentsData.data || studentsData.students || []);
        setStats(prev => ({ ...prev, total_students: (studentsData.data || []).length }));
      }

      if (attendanceData.success) {
        setAttendanceRecords(attendanceData.data || attendanceData.records || []);
        const records = attendanceData.data || [];
        const avgAttendance = records.reduce((sum: number, r: Attendance) => sum + r.percentage, 0) / (records.length || 1);
        setStats(prev => ({ ...prev, average_attendance: Math.round(avgAttendance) }));
      }

      if (gradesData.success) {
        setGradeRecords(gradesData.data || gradesData.grades || []);
      }

      if (submissionsData.success) {
        const submissionsList = submissionsData.data || submissionsData.submissions || [];
        setSubmissions(submissionsList);
        const pending = submissionsList.filter((s: any) => !s.graded).length;
        setStats(prev => ({ ...prev, pending_submissions: pending }));
      }

    } catch (error) {
      console.error('Error fetching class data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateAssignment = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...assignmentForm,
          class_id: selectedClass?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowAssignmentDialog(false);
        setAssignmentForm({
          title: '',
          description: '',
          subject: '',
          class_id: '',
          due_date: '',
          total_marks: 100,
          instructions: ''
        });
        fetchTeacherData();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleMarkAttendance = async () => {
    const token = localStorage.getItem('token');
    
    const attendanceData = Object.entries(attendanceForm).map(([student_id, status]) => ({
      student_id: parseInt(student_id),
      status,
      date: selectedDate
    }));

    try {
      const response = await fetch(`${API_BASE}/attendance/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class_id: selectedClass?.id,
          date: selectedDate,
          attendance: attendanceData
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowAttendanceDialog(false);
        setAttendanceForm({});
        fetchClassData();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const handleRefresh = () => {
    if (selectedClass) {
      fetchClassData();
    }
    fetchTeacherData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading teacher portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Teacher Portal</h1>
              <p className="text-green-100">Manage classes, assignments, and student progress</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>

          {classes.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {classes.map(cls => (
                <Button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`${
                    selectedClass?.id === cls.id
                      ? 'bg-white text-green-700 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  {cls.name} ({cls.total_students} students)
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <h3 className="text-3xl font-bold text-green-700">{stats.total_students}</h3>
                </div>
                <Users className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Grading</p>
                  <h3 className="text-3xl font-bold text-yellow-700">{stats.pending_grading}</h3>
                </div>
                <ClipboardCheck className="w-12 h-12 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Attendance</p>
                  <h3 className="text-3xl font-bold text-emerald-700">{stats.average_attendance}%</h3>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assignments</p>
                  <h3 className="text-3xl font-bold text-green-700">{stats.assignments_created}</h3>
                </div>
                <FileText className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5" />
                      Pending Submissions
                    </span>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats.pending_submissions}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {submissions
                      .filter(s => !s.graded)
                      .slice(0, 5)
                      .map((submission, idx) => (
                        <div key={idx} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{submission.student_name}</p>
                              <p className="text-sm text-gray-600">{submission.assignment_title}</p>
                            </div>
                            <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600">
                              Grade
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Class Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {gradeRecords.slice(0, 5).map((record, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{record.student_name}</p>
                          <p className="text-sm text-gray-500">Rank #{record.rank}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{record.percentage}%</p>
                          <Badge className="bg-green-100 text-green-800">{record.final_grade}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAssignmentDialog(true)}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-100 rounded-lg">
                      <Plus className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Create Assignment</h4>
                      <p className="text-sm text-gray-600">Add new assignment for students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAttendanceDialog(true)}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-yellow-100 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Mark Attendance</h4>
                      <p className="text-sm text-gray-600">Record student attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowMaterialDialog(true)}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-100 rounded-lg">
                      <Upload className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Upload Material</h4>
                      <p className="text-sm text-gray-600">Share learning resources</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Class Students
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      <tr>
                        <th className="text-left p-3">Student ID</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-center p-3">Class</th>
                        <th className="text-center p-3">Attendance</th>
                        <th className="text-center p-3">Avg Grade</th>
                        <th className="text-center p-3">Status</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {students.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="p-3 font-semibold">{student.student_id}</td>
                          <td className="p-3">{student.first_name} {student.last_name}</td>
                          <td className="p-3 text-center">{student.class_name}</td>
                          <td className="p-3 text-center">
                            <Badge className={student.attendance_rate >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {student.attendance_rate}%
                            </Badge>
                          </td>
                          <td className="p-3 text-center font-bold text-green-600">{student.average_grade}%</td>
                          <td className="p-3 text-center">
                            <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
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

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">All Assignments</h3>
              <Button
                onClick={() => setShowAssignmentDialog(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map(assignment => (
                <Card key={assignment.id}>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                      <CardTitle>{assignment.title}</CardTitle>
                      <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                    </div>
                    <CardDescription>{assignment.subject} - {assignment.class}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-semibold">{new Date(assignment.due_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Marks:</span>
                        <span className="font-semibold">{assignment.total_marks}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Submissions:</span>
                        <span className="font-semibold">{assignment.submissions}/{assignment.total_students}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Graded:</span>
                        <span className="font-semibold">{assignment.graded}/{assignment.submissions}</span>
                      </div>
                      <Progress 
                        value={(assignment.graded / (assignment.submissions || 1)) * 100} 
                        className="h-2" 
                      />
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Attendance Records</h3>
              <Button
                onClick={() => setShowAttendanceDialog(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Mark Attendance
              </Button>
            </div>

            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle>Attendance History</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {attendanceRecords.map((record, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold">{new Date(record.date).toLocaleDateString()}</h4>
                        <Badge className="bg-green-100 text-green-800">{record.percentage}%</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-2xl font-bold">{record.total_students}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Present</p>
                          <p className="text-2xl font-bold text-green-600">{record.present}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Absent</p>
                          <p className="text-2xl font-bold text-red-600">{record.absent}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Late</p>
                          <p className="text-2xl font-bold text-yellow-600">{record.late}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Student Grades
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white">
                      <tr>
                        <th className="text-left p-3">Rank</th>
                        <th className="text-left p-3">Student Name</th>
                        <th className="text-center p-3">Assignments</th>
                        <th className="text-center p-3">Quizzes</th>
                        <th className="text-center p-3">Exams</th>
                        <th className="text-center p-3">Average</th>
                        <th className="text-center p-3">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {gradeRecords.map(record => (
                        <tr key={record.student_id} className="hover:bg-gray-50">
                          <td className="p-3 font-bold">#{record.rank}</td>
                          <td className="p-3">{record.student_name}</td>
                          <td className="p-3 text-center">{record.assignments}%</td>
                          <td className="p-3 text-center">{record.quizzes}%</td>
                          <td className="p-3 text-center">{record.exams}%</td>
                          <td className="p-3 text-center font-bold text-green-600">{record.percentage}%</td>
                          <td className="p-3 text-center">
                            <Badge className="bg-green-100 text-green-800">{record.final_grade}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Learning Materials</h3>
              <Button
                onClick={() => setShowMaterialDialog(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        {material.type === 'video' ? <Video className="w-6 h-6" /> :
                         material.type === 'audio' ? <Headphones className="w-6 h-6" /> :
                         <FileText className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold line-clamp-2">{material.title}</h4>
                        <p className="text-sm text-gray-600">{material.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>{material.type}</span>
                      <span>{material.size || material.duration}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  Assignment Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {submissions.map((submission, idx) => (
                    <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold">{submission.student_name}</h4>
                          <p className="text-sm text-gray-600">{submission.assignment_title}</p>
                        </div>
                        {submission.graded ? (
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">{submission.score}/{submission.total_marks}</p>
                            <Badge className="bg-green-100 text-green-800">Graded</Badge>
                          </div>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      {!submission.graded && (
                        <Button size="sm" className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                          Grade Submission
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Assignment title"
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={assignmentForm.subject}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Subject"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Assignment description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={assignmentForm.due_date}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  value={assignmentForm.total_marks}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, total_marks: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateAssignment}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark Attendance - {selectedDate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-semibold">{student.first_name} {student.last_name}</span>
                  <Select
                    value={attendanceForm[student.id] || 'present'}
                    onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, [student.id]: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="excused">Excused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleMarkAttendance}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveTeacherPortal;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, GraduationCap, Calendar, DollarSign, MessageSquare, Bell, User, 
  School, Mail, Award, BookOpen, TrendingUp, Clock, CheckCircle, XCircle, 
  AlertCircle, BarChart3, FileText, Download, Phone, MapPin, Activity,
  Target, Trophy, Medal, Heart, Eye, Edit, RefreshCw, ChevronRight, Wallet,
  CreditCard, Receipt, AlertTriangle, UserCheck, ClipboardList, Home, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

const API_BASE = 'http://localhost:5000/api';

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  class_id: number;
  admission_number: string;
  date_of_birth: string;
  gender: string;
  profile_picture?: string;
  status: string;
}

interface AcademicRecord {
  subject: string;
  teacher: string;
  current_grade: string;
  average_score: number;
  assignments_completed: number;
  assignments_total: number;
  trend: 'up' | 'down' | 'stable';
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

interface FeeRecord {
  id: number;
  term: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  status: 'paid' | 'partial' | 'overdue' | 'pending';
}

interface DisciplineRecord {
  id: number;
  date: string;
  incident_type: string;
  description: string;
  action_taken: string;
  severity: 'minor' | 'moderate' | 'major';
  resolved: boolean;
}

const ComprehensiveParentPortal: React.FC = () => {
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [disciplineRecords, setDisciplineRecords] = useState<DisciplineRecord[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [stats, setStats] = useState({
    attendance_percentage: 0,
    average_grade: 0,
    pending_fees: 0,
    active_assignments: 0,
    unread_messages: 0,
    total_children: 0
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchStudentData();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/comprehensive-auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.profile.children) {
        setChildren(data.profile.children);
        setStats(prev => ({ ...prev, total_children: data.profile.children.length }));
        if (data.profile.children.length > 0) {
          setSelectedChild(data.profile.children[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async () => {
    if (!selectedChild) return;
    
    setRefreshing(true);
    const token = localStorage.getItem('token');
    
    try {
      const [academicRes, attendanceRes, feesRes, disciplineRes, assignmentsRes, examsRes, timetableRes, messagesRes] = 
        await Promise.all([
          fetch(`${API_BASE}/grades?student_id=${selectedChild.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/attendance?student_id=${selectedChild.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/finance/student/${selectedChild.id}/fees`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/discipline/student/${selectedChild.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/assignments?student_id=${selectedChild.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/exams?student_id=${selectedChild.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/timetable?class_id=${selectedChild.class_id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/messages?recipient_type=parent`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

      const [academic, attendance, fees, discipline, assignmentsData, examsData, timetableData, messagesData] = 
        await Promise.all([
          academicRes.json(),
          attendanceRes.json(),
          feesRes.json(),
          disciplineRes.json(),
          assignmentsRes.json(),
          examsRes.json(),
          timetableRes.json(),
          messagesRes.json()
        ]);

      if (academic.success) {
        const records = academic.data.map((grade: any) => ({
          subject: grade.subject_name || grade.subject,
          teacher: grade.teacher_name || 'N/A',
          current_grade: grade.grade || grade.letter_grade || 'N/A',
          average_score: grade.score || grade.percentage || 0,
          assignments_completed: grade.assignments_completed || 0,
          assignments_total: grade.assignments_total || 0,
          trend: grade.trend || 'stable'
        }));
        setAcademicRecords(records);
        
        const avgGrade = records.reduce((sum: number, r: AcademicRecord) => sum + r.average_score, 0) / (records.length || 1);
        setStats(prev => ({ ...prev, average_grade: Math.round(avgGrade) }));
      }

      if (attendance.success) {
        setAttendanceRecords(attendance.data || []);
        const total = attendance.data?.length || 0;
        const present = attendance.data?.filter((a: any) => a.status === 'present').length || 0;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        setStats(prev => ({ ...prev, attendance_percentage: percentage }));
      }

      if (fees.success) {
        setFeeRecords(fees.data || fees.fees || []);
        const pending = (fees.data || fees.fees || []).reduce((sum: number, f: FeeRecord) => sum + f.balance, 0);
        setStats(prev => ({ ...prev, pending_fees: pending }));
      }

      if (discipline.success) {
        setDisciplineRecords(discipline.data || discipline.records || []);
      }

      if (assignmentsData.success) {
        setAssignments(assignmentsData.data || assignmentsData.assignments || []);
        const active = (assignmentsData.data || []).filter((a: any) => a.status === 'pending' || !a.submitted).length;
        setStats(prev => ({ ...prev, active_assignments: active }));
      }

      if (examsData.success) {
        setExams(examsData.data || examsData.exams || []);
      }

      if (timetableData.success) {
        setTimetable(timetableData.data || timetableData.schedule || []);
      }

      if (messagesData.success) {
        setMessages(messagesData.data || messagesData.messages || []);
        const unread = (messagesData.data || []).filter((m: any) => !m.read).length;
        setStats(prev => ({ ...prev, unread_messages: unread }));
      }

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStudentData();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading parent portal...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              No Children Linked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              No children are currently linked to your account. Please contact the school administration to link your child's account.
            </p>
            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
              Contact School
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Parent Portal</h1>
              <p className="text-green-100">Monitor your child's academic progress and school activities</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            {children.map(child => (
              <Button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`${
                  selectedChild?.id === child.id
                    ? 'bg-white text-green-700 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                {child.first_name} {child.last_name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {selectedChild && (
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
                    <p className="text-sm text-gray-600 mb-1">Attendance</p>
                    <h3 className="text-3xl font-bold text-green-700">{stats.attendance_percentage}%</h3>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Grade</p>
                    <h3 className="text-3xl font-bold text-yellow-700">{stats.average_grade}%</h3>
                  </div>
                  <Award className="w-12 h-12 text-yellow-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Fees</p>
                    <h3 className="text-2xl font-bold text-emerald-700">RWF {stats.pending_fees.toLocaleString()}</h3>
                  </div>
                  <Wallet className="w-12 h-12 text-emerald-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Assignments</p>
                    <h3 className="text-3xl font-bold text-green-700">{stats.active_assignments}</h3>
                  </div>
                  <ClipboardList className="w-12 h-12 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white shadow-sm border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="discipline">Discipline</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="timetable">Timetable</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Name:</span>
                      <span className="font-semibold">{selectedChild.first_name} {selectedChild.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student ID:</span>
                      <span className="font-semibold">{selectedChild.student_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Admission No:</span>
                      <span className="font-semibold">{selectedChild.admission_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Class:</span>
                      <span className="font-semibold">{selectedChild.class_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-semibold capitalize">{selectedChild.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="font-semibold">{new Date(selectedChild.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Recent Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {academicRecords.slice(0, 5).map((record, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{record.subject}</p>
                            <p className="text-sm text-gray-500">Grade: {record.current_grade}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{record.average_score}%</p>
                            <div className={`flex items-center gap-1 text-sm ${
                              record.trend === 'up' ? 'text-green-600' : 
                              record.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {record.trend === 'up' ? '↑' : record.trend === 'down' ? '↓' : '→'}
                              {record.trend}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="academics" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <tr>
                          <th className="text-left p-3">Subject</th>
                          <th className="text-left p-3">Teacher</th>
                          <th className="text-center p-3">Grade</th>
                          <th className="text-center p-3">Average</th>
                          <th className="text-center p-3">Assignments</th>
                          <th className="text-center p-3">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {academicRecords.map((record, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3 font-semibold">{record.subject}</td>
                            <td className="p-3">{record.teacher}</td>
                            <td className="p-3 text-center">
                              <Badge className="bg-green-100 text-green-800">{record.current_grade}</Badge>
                            </td>
                            <td className="p-3 text-center font-bold text-green-600">{record.average_score}%</td>
                            <td className="p-3 text-center">
                              {record.assignments_completed}/{record.assignments_total}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`flex items-center justify-center gap-1 ${
                                record.trend === 'up' ? 'text-green-600' : 
                                record.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {record.trend === 'up' ? '↑' : record.trend === 'down' ? '↓' : '→'}
                              </span>
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
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Attendance Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attendanceRecords.slice(0, 30).map((record, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">{new Date(record.date).toLocaleDateString()}</span>
                          <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                        </div>
                        {record.remarks && (
                          <p className="text-sm text-gray-600">{record.remarks}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Fee Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {feeRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg">{record.term}</h4>
                            <p className="text-sm text-gray-500">Due: {new Date(record.due_date).toLocaleDateString()}</p>
                          </div>
                          <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Amount Due</p>
                            <p className="text-lg font-bold">RWF {record.amount_due.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Amount Paid</p>
                            <p className="text-lg font-bold text-green-600">RWF {record.amount_paid.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Balance</p>
                            <p className="text-lg font-bold text-red-600">RWF {record.balance.toLocaleString()}</p>
                          </div>
                        </div>
                        {record.balance > 0 && (
                          <Button className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600">
                            Pay Now
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discipline" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Discipline Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {disciplineRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-green-700">Excellent Behavior!</p>
                      <p className="text-gray-600">No discipline incidents recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {disciplineRecords.map((record) => (
                        <div key={record.id} className={`p-4 border-l-4 rounded-r-lg ${
                          record.severity === 'major' ? 'border-red-500 bg-red-50' :
                          record.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-bold">{record.incident_type}</h4>
                              <p className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                            </div>
                            <Badge className={record.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {record.resolved ? 'Resolved' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                          <p className="text-sm font-semibold">Action: {record.action_taken}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {assignments.map((assignment, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold">{assignment.title || assignment.name}</h4>
                          <Badge className={assignment.submitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {assignment.submitted ? 'Submitted' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {assignment.subject || assignment.subject_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                          {assignment.score && (
                            <span className="flex items-center gap-1 font-semibold text-green-600">
                              <Award className="w-4 h-4" />
                              Score: {assignment.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exams" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Examination Schedule & Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {exams.map((exam, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg">{exam.title || exam.name}</h4>
                            <p className="text-sm text-gray-500">{exam.subject || exam.subject_name}</p>
                          </div>
                          {exam.score !== undefined && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">{exam.score}%</p>
                              <p className="text-sm text-gray-500">Grade: {exam.grade}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(exam.date || exam.exam_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {exam.duration || exam.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timetable" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Class Timetable
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <tr>
                          <th className="p-3 text-left">Time</th>
                          <th className="p-3 text-left">Monday</th>
                          <th className="p-3 text-left">Tuesday</th>
                          <th className="p-3 text-left">Wednesday</th>
                          <th className="p-3 text-left">Thursday</th>
                          <th className="p-3 text-left">Friday</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {timetable.map((slot, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3 font-semibold">{slot.time || slot.period}</td>
                            <td className="p-3">{slot.monday || '-'}</td>
                            <td className="p-3">{slot.tuesday || '-'}</td>
                            <td className="p-3">{slot.wednesday || '-'}</td>
                            <td className="p-3">{slot.thursday || '-'}</td>
                            <td className="p-3">{slot.friday || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveParentPortal;

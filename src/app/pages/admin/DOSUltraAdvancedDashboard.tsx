import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  Users, BookOpen, School, TrendingUp, DollarSign, Clock,
  Plus, Search, Filter, Download, Edit, Trash2, Eye,
  UserPlus, GraduationCap, FileText, Calendar, Award,
  BarChart3, Target, Activity, CheckCircle, AlertCircle,
  XCircle, Settings, RefreshCw, ChevronRight, Layers
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/dos-ultra-advanced';
const TIMETABLE_API = 'http://localhost:5000/api/timetable-ultra-advanced';
const STUDENT_API = 'http://localhost:5000/api/student-ultra-advanced';

interface DashboardStats {
  total_students: number;
  active_students: number;
  graduated_students: number;
  suspended_students: number;
  avg_gpa: number;
  avg_attendance: number;
  total_teachers: number;
  assigned_teachers: number;
  expected_revenue: number;
  collected_revenue: number;
  outstanding_balance: number;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  qualifications?: string;
  specialization?: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  trade_code?: string;
  level_number?: number;
}

const DOSUltraAdvancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [searchFilters, setSearchFilters] = useState({
    search: '',
    trade_code: '',
    level_number: '',
    status: 'active',
    payment_status: '',
    sort_by: 'student_code',
    order: 'asc',
    page: 1,
    limit: 50
  });

  const [newTeacher, setNewTeacher] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    qualifications: '',
    specialization: '',
    password: ''
  });

  const [teacherAssignment, setTeacherAssignment] = useState({
    teacher_id: '',
    subject_id: '',
    trade_code: '',
    level_number: '',
    level_suffix: '',
    weekly_periods: 5,
    academic_year: new Date().getFullYear()
  });

  const [reportParams, setReportParams] = useState({
    trade_code: '',
    level_number: '',
    level_suffix: '',
    term: 1,
    academic_year: new Date().getFullYear(),
    report_type: 'term_report'
  });

  const [timetableParams, setTimetableParams] = useState({
    trade_code: '',
    level_number: '',
    level_suffix: '',
    academic_year: new Date().getFullYear(),
    days_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    description: '',
    trade_code: '',
    level_number: ''
  });

  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    description: '',
    category: ''
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchDashboard();
    fetchTeachers();
    fetchSubjects();
    fetchCourses();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard/overview`, config);
      if (response.data.success) {
        setDashboardData(response.data.dashboard);
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to fetch dashboard');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/teachers`, config);
      if (response.data.success) {
        setTeachers(response.data.teachers);
      }
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}/subjects`, config);
      if (response.data.success) {
        setSubjects(response.data.subjects);
      }
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE}/courses`, config);
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    }
  };

  const searchStudents = async () => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(searchFilters as any).toString();
      const response = await axios.get(`${API_BASE}/students/search?${queryString}`, config);
      if (response.data.success) {
        setStudents(response.data.students);
        showMessage('success', `Found ${response.data.pagination.total_students} students`);
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to search students');
    } finally {
      setLoading(false);
    }
  };

  const addNewTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/teachers/add`, newTeacher, config);
      if (response.data.success) {
        showMessage('success', 'Teacher added successfully');
        fetchTeachers();
        setNewTeacher({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          qualifications: '',
          specialization: '',
          password: ''
        });
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  const assignTeacherToSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/teachers/assign`, teacherAssignment, config);
      if (response.data.success) {
        showMessage('success', 'Teacher assigned to subject successfully');
        setTeacherAssignment({
          teacher_id: '',
          subject_id: '',
          trade_code: '',
          level_number: '',
          level_suffix: '',
          weekly_periods: 5,
          academic_year: new Date().getFullYear()
        });
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to assign teacher');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/reports/generate`, reportParams, config);
      if (response.data.success) {
        showMessage('success', `Report generated for ${response.data.reports.length} students`);
        const blob = new Blob([JSON.stringify(response.data.reports, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportParams.trade_code}-level${reportParams.level_number}.json`;
        a.click();
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${TIMETABLE_API}/generate`, timetableParams, config);
      if (response.data.success) {
        showMessage('success', 'Timetable generated successfully');
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to generate timetable');
    } finally {
      setLoading(false);
    }
  };

  const addNewCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/courses`, newCourse, config);
      if (response.data.success) {
        showMessage('success', 'Course added successfully');
        fetchCourses();
        setNewCourse({
          name: '',
          code: '',
          description: '',
          trade_code: '',
          level_number: ''
        });
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const addNewSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/subjects`, newSubject, config);
      if (response.data.success) {
        showMessage('success', 'Subject added successfully');
        fetchSubjects();
        setNewSubject({
          name: '',
          code: '',
          description: '',
          category: ''
        });
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  };

  const removeTeacher = async (teacherId: number) => {
    if (!confirm('Are you sure you want to remove this teacher?')) return;
    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE}/teachers/${teacherId}`, config);
      if (response.data.success) {
        showMessage('success', 'Teacher removed successfully');
        fetchTeachers();
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to remove teacher');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'teachers', label: 'Teachers', icon: <Users size={20} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={20} /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen size={20} /> },
    { id: 'subjects', label: 'Subjects', icon: <Layers size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
    { id: 'timetable', label: 'Timetable', icon: <Calendar size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <School className="text-white" size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  DOS Ultra Advanced Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Powerful School Management System</p>
              </div>
            </div>
            <Button onClick={fetchDashboard} variant="outline">
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {message.text && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {dashboardData && activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Users size={32} />
                <Badge className="bg-white/20">{dashboardData.student_stats.active_students}</Badge>
              </div>
              <h3 className="text-2xl font-bold">{dashboardData.student_stats.total_students}</h3>
              <p className="text-blue-100">Total Students</p>
              <div className="mt-2 text-sm">Avg GPA: {dashboardData.student_stats.avg_gpa?.toFixed(2)}</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap size={32} />
                <Badge className="bg-white/20">{dashboardData.teacher_stats.assigned_teachers}</Badge>
              </div>
              <h3 className="text-2xl font-bold">{dashboardData.teacher_stats.total_teachers}</h3>
              <p className="text-green-100">Total Teachers</p>
              <div className="mt-2 text-sm">Avg Periods: {dashboardData.teacher_stats.avg_weekly_periods?.toFixed(1)}</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={32} />
                <Badge className="bg-white/20">Financial</Badge>
              </div>
              <h3 className="text-2xl font-bold">${dashboardData.financial_summary.collected_revenue?.toLocaleString()}</h3>
              <p className="text-purple-100">Revenue Collected</p>
              <div className="mt-2 text-sm">Outstanding: ${dashboardData.financial_summary.outstanding_balance?.toLocaleString()}</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Activity size={32} />
                <Badge className="bg-white/20">Performance</Badge>
              </div>
              <h3 className="text-2xl font-bold">{dashboardData.student_stats.avg_attendance?.toFixed(1)}%</h3>
              <p className="text-orange-100">Avg Attendance</p>
              <div className="mt-2 text-sm">{dashboardData.trade_stats?.length} Trades Active</div>
            </motion.div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'teachers' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Teacher Management</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus size={24} />
                        Add New Teacher
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={addNewTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>First Name</Label>
                          <Input
                            value={newTeacher.first_name}
                            onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input
                            value={newTeacher.last_name}
                            onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newTeacher.email}
                            onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={newTeacher.phone}
                            onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Qualifications</Label>
                          <Input
                            value={newTeacher.qualifications}
                            onChange={(e) => setNewTeacher({ ...newTeacher, qualifications: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Specialization</Label>
                          <Input
                            value={newTeacher.specialization}
                            onChange={(e) => setNewTeacher({ ...newTeacher, specialization: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Password</Label>
                          <Input
                            type="password"
                            value={newTeacher.password}
                            onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          <Button type="submit" disabled={loading} className="w-full">
                            <Plus size={18} className="mr-2" />
                            Add Teacher
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Assign Teacher to Subject & Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={assignTeacherToSubject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Teacher</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={teacherAssignment.teacher_id}
                            onChange={(e) => setTeacherAssignment({ ...teacherAssignment, teacher_id: e.target.value })}
                            required
                          >
                            <option value="">Select Teacher</option>
                            {teachers.map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.first_name} {teacher.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Subject</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={teacherAssignment.subject_id}
                            onChange={(e) => setTeacherAssignment({ ...teacherAssignment, subject_id: e.target.value })}
                            required
                          >
                            <option value="">Select Subject</option>
                            {subjects.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Trade Code</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={teacherAssignment.trade_code}
                            onChange={(e) => setTeacherAssignment({ ...teacherAssignment, trade_code: e.target.value })}
                            required
                          >
                            <option value="">Select Trade</option>
                            <option value="AUT">AUT</option>
                            <option value="BDC">BDC</option>
                            <option value="SOD">SOD</option>
                          </select>
                        </div>
                        <div>
                          <Label>Level Number</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={teacherAssignment.level_number}
                            onChange={(e) => setTeacherAssignment({ ...teacherAssignment, level_number: e.target.value })}
                            required
                          >
                            <option value="">Select Level</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                            <option value="5">Level 5</option>
                          </select>
                        </div>
                        <div>
                          <Label>Level Suffix (for AUT only)</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={teacherAssignment.level_suffix}
                            onChange={(e) => setTeacherAssignment({ ...teacherAssignment, level_suffix: e.target.value })}
                          >
                            <option value="">No Suffix</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                          </select>
                        </div>
                        <div>
                          <Label>Weekly Periods</Label>
                          <Input
                            type="number"
                            value={teacherAssignment.weekly_periods}
                            onChange={(e) => setTeacherAssignment({ ...teacherAssignment, weekly_periods: parseInt(e.target.value) })}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Button type="submit" disabled={loading} className="w-full">
                            <CheckCircle size={18} className="mr-2" />
                            Assign Teacher
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>All Teachers ({teachers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {teachers.map((teacher) => (
                          <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Users className="text-indigo-600" size={24} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{teacher.first_name} {teacher.last_name}</h4>
                                <p className="text-sm text-gray-600">{teacher.email}</p>
                                <p className="text-xs text-gray-500">{teacher.phone}</p>
                              </div>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => removeTeacher(teacher.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'students' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Student Search & Management</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search size={24} />
                        Advanced Search
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label>Search</Label>
                          <Input
                            placeholder="Name, code, email..."
                            value={searchFilters.search}
                            onChange={(e) => setSearchFilters({ ...searchFilters, search: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Trade</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={searchFilters.trade_code}
                            onChange={(e) => setSearchFilters({ ...searchFilters, trade_code: e.target.value })}
                          >
                            <option value="">All Trades</option>
                            <option value="AUT">AUT</option>
                            <option value="BDC">BDC</option>
                            <option value="SOD">SOD</option>
                          </select>
                        </div>
                        <div>
                          <Label>Level</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={searchFilters.level_number}
                            onChange={(e) => setSearchFilters({ ...searchFilters, level_number: e.target.value })}
                          >
                            <option value="">All Levels</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                            <option value="5">Level 5</option>
                          </select>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={searchFilters.status}
                            onChange={(e) => setSearchFilters({ ...searchFilters, status: e.target.value })}
                          >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="graduated">Graduated</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                        <div>
                          <Label>Payment Status</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={searchFilters.payment_status}
                            onChange={(e) => setSearchFilters({ ...searchFilters, payment_status: e.target.value })}
                          >
                            <option value="">All</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="unpaid">Unpaid</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <Button onClick={searchStudents} disabled={loading} className="w-full">
                            <Search size={18} className="mr-2" />
                            Search Students
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Search Results ({students.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {students.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <GraduationCap className="text-blue-600" size={24} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{student.first_name} {student.last_name}</h4>
                                <p className="text-sm text-gray-600">{student.student_code} - {student.trade_code} Level {student.level_number}{student.level_suffix}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>{student.status}</Badge>
                                  <Badge variant={student.payment_status === 'paid' ? 'default' : 'secondary'}>{student.payment_status}</Badge>
                                  {student.gpa && <Badge>GPA: {student.gpa.toFixed(2)}</Badge>}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'courses' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Course Management</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Add New Course</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={addNewCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Course Name</Label>
                          <Input
                            value={newCourse.name}
                            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Course Code</Label>
                          <Input
                            value={newCourse.code}
                            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Trade Code</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={newCourse.trade_code}
                            onChange={(e) => setNewCourse({ ...newCourse, trade_code: e.target.value })}
                          >
                            <option value="">Select Trade</option>
                            <option value="AUT">AUT</option>
                            <option value="BDC">BDC</option>
                            <option value="SOD">SOD</option>
                          </select>
                        </div>
                        <div>
                          <Label>Level Number</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={newCourse.level_number}
                            onChange={(e) => setNewCourse({ ...newCourse, level_number: e.target.value })}
                          >
                            <option value="">Select Level</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                            <option value="5">Level 5</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <Label>Description</Label>
                          <Input
                            value={newCourse.description}
                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Button type="submit" disabled={loading} className="w-full">
                            <Plus size={18} className="mr-2" />
                            Add Course
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>All Courses ({courses.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map((course) => (
                          <div key={course.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <BookOpen className="text-purple-600" size={24} />
                              </div>
                              <Badge>{course.code}</Badge>
                            </div>
                            <h4 className="font-semibold mb-1">{course.name}</h4>
                            <p className="text-sm text-gray-600">{course.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'subjects' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Subject Management</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Add New Subject</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={addNewSubject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Subject Name</Label>
                          <Input
                            value={newSubject.name}
                            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Subject Code</Label>
                          <Input
                            value={newSubject.code}
                            onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Input
                            value={newSubject.category}
                            onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={newSubject.description}
                            onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Button type="submit" disabled={loading} className="w-full">
                            <Plus size={18} className="mr-2" />
                            Add Subject
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>All Subjects ({subjects.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.map((subject) => (
                          <div key={subject.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Layers className="text-green-600" size={24} />
                              </div>
                              <Badge>{subject.code}</Badge>
                            </div>
                            <h4 className="font-semibold mb-1">{subject.name}</h4>
                            <p className="text-sm text-gray-600">{subject.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Generate Reports</h2>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Report Generation with Auto-Grading & Ranking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Trade Code</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={reportParams.trade_code}
                            onChange={(e) => setReportParams({ ...reportParams, trade_code: e.target.value })}
                            required
                          >
                            <option value="">Select Trade</option>
                            <option value="AUT">AUT</option>
                            <option value="BDC">BDC</option>
                            <option value="SOD">SOD</option>
                          </select>
                        </div>
                        <div>
                          <Label>Level Number</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={reportParams.level_number}
                            onChange={(e) => setReportParams({ ...reportParams, level_number: e.target.value })}
                            required
                          >
                            <option value="">Select Level</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                            <option value="5">Level 5</option>
                          </select>
                        </div>
                        <div>
                          <Label>Level Suffix</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={reportParams.level_suffix}
                            onChange={(e) => setReportParams({ ...reportParams, level_suffix: e.target.value })}
                          >
                            <option value="">No Suffix</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                          </select>
                        </div>
                        <div>
                          <Label>Term</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={reportParams.term}
                            onChange={(e) => setReportParams({ ...reportParams, term: parseInt(e.target.value) })}
                          >
                            <option value="1">Term 1</option>
                            <option value="2">Term 2</option>
                            <option value="3">Term 3</option>
                          </select>
                        </div>
                        <div>
                          <Label>Academic Year</Label>
                          <Input
                            type="number"
                            value={reportParams.academic_year}
                            onChange={(e) => setReportParams({ ...reportParams, academic_year: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Report Type</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={reportParams.report_type}
                            onChange={(e) => setReportParams({ ...reportParams, report_type: e.target.value })}
                          >
                            <option value="term_report">Term Report</option>
                            <option value="progress_report">Progress Report</option>
                            <option value="final_report">Final Report</option>
                          </select>
                        </div>
                      </div>
                      <Button onClick={generateReport} disabled={loading} className="w-full">
                        <FileText size={18} className="mr-2" />
                        Generate Report with Auto-Grading & Ranking
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'timetable' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Generate Timetable</h2>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Auto-Generate Timetable (12 Hours x 40 Minutes)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Trade Code</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={timetableParams.trade_code}
                            onChange={(e) => setTimetableParams({ ...timetableParams, trade_code: e.target.value })}
                            required
                          >
                            <option value="">Select Trade</option>
                            <option value="AUT">AUT</option>
                            <option value="BDC">BDC</option>
                            <option value="SOD">SOD</option>
                          </select>
                        </div>
                        <div>
                          <Label>Level Number</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={timetableParams.level_number}
                            onChange={(e) => setTimetableParams({ ...timetableParams, level_number: e.target.value })}
                            required
                          >
                            <option value="">Select Level</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                            <option value="5">Level 5</option>
                          </select>
                        </div>
                        <div>
                          <Label>Level Suffix</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={timetableParams.level_suffix}
                            onChange={(e) => setTimetableParams({ ...timetableParams, level_suffix: e.target.value })}
                          >
                            <option value="">No Suffix</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                          </select>
                        </div>
                        <div>
                          <Label>Academic Year</Label>
                          <Input
                            type="number"
                            value={timetableParams.academic_year}
                            onChange={(e) => setTimetableParams({ ...timetableParams, academic_year: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      <Button onClick={generateTimetable} disabled={loading} className="w-full">
                        <Calendar size={18} className="mr-2" />
                        Auto-Generate Timetable
                      </Button>
                      <p className="text-sm text-gray-600 mt-4">
                        Generates a timetable with 12-hour school day (7:00 AM - 7:00 PM) with 40-minute periods,
                        automatically scheduling subjects based on teacher assignments and avoiding conflicts.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'analytics' && dashboardData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Analytics & Insights</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Trade Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {dashboardData.trade_stats?.map((trade: any) => (
                            <div key={trade.trade_code} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{trade.trade_name}</h4>
                                <Badge>{trade.student_count} students</Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>Avg GPA: {trade.avg_gpa?.toFixed(2)}</p>
                                <p>Avg Attendance: {trade.avg_attendance?.toFixed(1)}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Level Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {dashboardData.level_stats?.map((level: any) => (
                            <div key={`${level.level_number}-${level.level_suffix}`} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">Level {level.level_number}{level.level_suffix}</h4>
                                <Badge variant="secondary">{level.student_count}</Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>Avg GPA: {level.avg_gpa?.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">Expected Revenue</p>
                            <p className="text-2xl font-bold text-green-800">
                              ${dashboardData.financial_summary?.expected_revenue?.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">Collected</p>
                            <p className="text-2xl font-bold text-blue-800">
                              ${dashboardData.financial_summary?.collected_revenue?.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-700">Outstanding</p>
                            <p className="text-2xl font-bold text-orange-800">
                              ${dashboardData.financial_summary?.outstanding_balance?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {dashboardData.recent_activities?.slice(0, 10).map((activity: any, index: number) => (
                            <div key={index} className="p-2 border-l-4 border-indigo-500 pl-3 bg-gray-50">
                              <p className="text-sm">{activity.description}</p>
                              <p className="text-xs text-gray-500">{new Date(activity.activity_time).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DOSUltraAdvancedDashboard;

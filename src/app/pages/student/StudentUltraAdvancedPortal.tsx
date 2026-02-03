import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  User, BookOpen, Award, TrendingUp, Calendar, FileText,
  DollarSign, CheckCircle, Clock, Target, Activity, BarChart3,
  GraduationCap, Bell, Download, Eye, ChevronRight, Star,
  School, Users, AlertCircle, Info
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/app/config/apiBase';

const API_BASE = `${API_BASE_URL}/student-ultra-advanced`;

interface EnrollmentData {
  enrolled: boolean;
  enrollment?: any;
}

interface PerformanceData {
  student_info: any;
  marks_by_subject: any[];
  attendance_summary: any;
  assignments_summary: any;
  class_ranking: any;
}

interface GradesData {
  grades: any[];
  gpa: number;
  total_marks: number;
  total_max_marks: number;
  overall_percentage: number;
  academic_year: number;
}

const StudentUltraAdvancedPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [availableTrades, setAvailableTrades] = useState<any[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [grades, setGrades] = useState<GradesData | null>(null);
  const [ranking, setRanking] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [enrollmentForm, setEnrollmentForm] = useState({
    trade_code: '',
    level_number: '',
    level_suffix: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    previous_school: '',
    academic_year: new Date().getFullYear()
  });

  const [attendanceFilters, setAttendanceFilters] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    checkEnrollmentStatus();
    fetchPerformanceOverview();
    fetchGrades();
    fetchPaymentStatus();
  }, []);

  const checkEnrollmentStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/enrollment/status`, config);
      setEnrollment(response.data);
      if (!response.data.enrolled) {
        fetchAvailableTrades();
      }
    } catch (error: any) {
      console.error('Error checking enrollment:', error);
    }
  };

  const fetchAvailableTrades = async () => {
    try {
      const response = await axios.get(`${API_BASE}/enrollment/available-trades`, config);
      if (response.data.success) {
        setAvailableTrades(response.data.trades);
      }
    } catch (error: any) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchPerformanceOverview = async () => {
    try {
      const response = await axios.get(`${API_BASE}/performance/overview`, config);
      if (response.data.success) {
        setPerformance(response.data.performance);
      }
    } catch (error: any) {
      console.error('Error fetching performance:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`${API_BASE}/performance/grades`, config);
      if (response.data.success) {
        setGrades(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchRanking = async () => {
    try {
      const response = await axios.get(`${API_BASE}/performance/ranking`, config);
      if (response.data.success) {
        setRanking(response.data.ranking);
      }
    } catch (error: any) {
      console.error('Error fetching ranking:', error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(attendanceFilters).toString();
      const response = await axios.get(`${API_BASE}/attendance?${queryString}`, config);
      if (response.data.success) {
        setAttendance(response.data.attendance);
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      const response = await axios.get(`${API_BASE}/timetable`, config);
      if (response.data.success) {
        setTimetable(response.data.timetable);
      }
    } catch (error: any) {
      console.error('Error fetching timetable:', error);
    }
  };

  const fetchPaymentStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/payment/status`, config);
      if (response.data.success) {
        setPaymentStatus(response.data.payment);
      }
    } catch (error: any) {
      console.error('Error fetching payment status:', error);
    }
  };

  const submitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/enrollment/apply`, enrollmentForm, config);
      if (response.data.success) {
        showMessage('success', 'Enrollment application submitted successfully');
        checkEnrollmentStatus();
        setEnrollmentForm({
          trade_code: '',
          level_number: '',
          level_suffix: '',
          guardian_name: '',
          guardian_phone: '',
          guardian_email: '',
          previous_school: '',
          academic_year: new Date().getFullYear()
        });
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to submit enrollment');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return 'text-green-600 bg-green-100';
    if (['A-', 'B+', 'B'].includes(grade)) return 'text-blue-600 bg-blue-100';
    if (['B-', 'C+', 'C'].includes(grade)) return 'text-yellow-600 bg-yellow-100';
    if (['C-', 'D+', 'D'].includes(grade)) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={20} /> },
    { id: 'enrollment', label: 'Enrollment', icon: <School size={20} /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp size={20} /> },
    { id: 'grades', label: 'Grades', icon: <Award size={20} /> },
    { id: 'ranking', label: 'Ranking', icon: <Target size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar size={20} /> },
    { id: 'timetable', label: 'Timetable', icon: <Clock size={20} /> },
    { id: 'payment', label: 'Payment', icon: <DollarSign size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <GraduationCap className="text-white" size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Student Portal
                </h1>
                <p className="text-gray-600 mt-1">Your Academic Journey Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={enrollment?.enrolled ? 'default' : 'secondary'}>
                {enrollment?.enrolled ? 'Enrolled' : 'Not Enrolled'}
              </Badge>
              {performance && (
                <Badge variant="outline">
                  GPA: {grades?.gpa?.toFixed(2) || 'N/A'}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {message.text && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {performance && activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Award size={32} />
                <Badge className="bg-white/20">{grades?.gpa?.toFixed(2) || '0.00'}</Badge>
              </div>
              <h3 className="text-2xl font-bold">Overall GPA</h3>
              <p className="text-blue-100">Academic Performance</p>
              <div className="mt-2 text-sm">Percentage: {grades?.overall_percentage?.toFixed(1)}%</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={32} />
                <Badge className="bg-white/20">{performance.attendance_summary?.present_days || 0}</Badge>
              </div>
              <h3 className="text-2xl font-bold">{performance.attendance_summary?.attendance_percentage?.toFixed(1) || 0}%</h3>
              <p className="text-green-100">Attendance Rate</p>
              <div className="mt-2 text-sm">Days: {performance.attendance_summary?.total_days || 0}</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <FileText size={32} />
                <Badge className="bg-white/20">{performance.assignments_summary?.submitted_assignments || 0}</Badge>
              </div>
              <h3 className="text-2xl font-bold">{performance.assignments_summary?.total_assignments || 0}</h3>
              <p className="text-purple-100">Total Assignments</p>
              <div className="mt-2 text-sm">Graded: {performance.assignments_summary?.graded_assignments || 0}</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Target size={32} />
                <Badge className="bg-white/20">Rank</Badge>
              </div>
              <h3 className="text-2xl font-bold">#{performance.class_ranking?.position || 'N/A'}</h3>
              <p className="text-orange-100">Class Ranking</p>
              <div className="mt-2 text-sm">of {performance.class_ranking?.total_students || 0} students</div>
            </motion.div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'ranking') fetchRanking();
                  if (tab.id === 'attendance') fetchAttendance();
                  if (tab.id === 'timetable') fetchTimetable();
                }}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && performance && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Academic Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Name:</strong> {performance.student_info?.first_name} {performance.student_info?.last_name}</p>
                          <p><strong>Student Code:</strong> {performance.student_info?.student_code}</p>
                          <p><strong>Trade:</strong> {performance.student_info?.trade_code}</p>
                          <p><strong>Level:</strong> {performance.student_info?.level_number}{performance.student_info?.level_suffix}</p>
                          <p><strong>Status:</strong> <Badge>{performance.student_info?.status}</Badge></p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {performance.marks_by_subject?.slice(0, 5).map((subject: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 border-l-4 border-purple-500 pl-3 bg-purple-50">
                              <div>
                                <h4 className="font-semibold">{subject.subject_name}</h4>
                                <p className="text-sm text-gray-600">{subject.total_marks}/{subject.total_max_marks}</p>
                              </div>
                              <Badge className={getGradeColor(subject.grade || 'F')}>
                                {subject.average_percentage?.toFixed(1)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'enrollment' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Enrollment Management</h2>
                  
                  {enrollment?.enrolled ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="text-green-600" size={24} />
                          Enrollment Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Alert className="bg-green-50 border-green-200 mb-4">
                          <AlertDescription className="text-green-800">
                            You are successfully enrolled in {enrollment.enrollment?.trade_name} - Level {enrollment.enrollment?.level_number}{enrollment.enrollment?.level_suffix}
                          </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Student Code</p>
                            <p className="font-semibold">{enrollment.enrollment?.student_code}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Trade</p>
                            <p className="font-semibold">{enrollment.enrollment?.trade_code}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Level</p>
                            <p className="font-semibold">Level {enrollment.enrollment?.level_number}{enrollment.enrollment?.level_suffix}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <Badge>{enrollment.enrollment?.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Apply for Enrollment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={submitEnrollment} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Trade</Label>
                                <select
                                  className="w-full px-3 py-2 border rounded-lg"
                                  value={enrollmentForm.trade_code}
                                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, trade_code: e.target.value })}
                                  required
                                >
                                  <option value="">Select Trade</option>
                                  {availableTrades.map((trade: any) => (
                                    <option key={trade.id} value={trade.trade_code}>
                                      {trade.trade_code} - Level {trade.level_number}{trade.level_suffix} ({trade.available_slots} slots)
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <Label>Level Number</Label>
                                <select
                                  className="w-full px-3 py-2 border rounded-lg"
                                  value={enrollmentForm.level_number}
                                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, level_number: e.target.value })}
                                  required
                                >
                                  <option value="">Select Level</option>
                                  <option value="3">Level 3</option>
                                  <option value="4">Level 4</option>
                                  <option value="5">Level 5</option>
                                </select>
                              </div>
                              <div>
                                <Label>Guardian Name</Label>
                                <Input
                                  value={enrollmentForm.guardian_name}
                                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, guardian_name: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label>Guardian Phone</Label>
                                <Input
                                  value={enrollmentForm.guardian_phone}
                                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, guardian_phone: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label>Guardian Email</Label>
                                <Input
                                  type="email"
                                  value={enrollmentForm.guardian_email}
                                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, guardian_email: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Previous School</Label>
                                <Input
                                  value={enrollmentForm.previous_school}
                                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, previous_school: e.target.value })}
                                />
                              </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                              <School size={18} className="mr-2" />
                              Submit Enrollment Application
                            </Button>
                          </form>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Available Trades & Levels</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableTrades.map((trade: any) => (
                              <div key={trade.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="p-2 bg-purple-100 rounded-lg">
                                    <School className="text-purple-600" size={24} />
                                  </div>
                                  <Badge>{trade.available_slots} slots</Badge>
                                </div>
                                <h4 className="font-semibold mb-1">{trade.trade_code}</h4>
                                <p className="text-sm text-gray-600">Level {trade.level_number}{trade.level_suffix}</p>
                                <p className="text-sm text-gray-500 mt-2">Fee: ${trade.fee_amount}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 'grades' && grades && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Academic Grades</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Overall Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                          <p className="text-sm text-blue-700">GPA</p>
                          <p className="text-3xl font-bold text-blue-800">{grades.gpa.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                          <p className="text-sm text-green-700">Percentage</p>
                          <p className="text-3xl font-bold text-green-800">{grades.overall_percentage.toFixed(1)}%</p>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                          <p className="text-sm text-purple-700">Total Marks</p>
                          <p className="text-3xl font-bold text-purple-800">{grades.total_marks}</p>
                        </div>
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                          <p className="text-sm text-orange-700">Max Marks</p>
                          <p className="text-3xl font-bold text-orange-800">{grades.total_max_marks}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Subject-wise Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {grades.grades.map((grade: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{grade.subject_name}</h4>
                              <Badge className={getGradeColor(grade.grade)}>{grade.grade}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Marks</p>
                                <p className="font-semibold">{grade.total_marks}/{grade.total_max_marks}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Percentage</p>
                                <p className="font-semibold">{grade.percentage}%</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Assessments</p>
                                <p className="font-semibold">{grade.assessment_count}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'ranking' && ranking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Class Ranking</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target size={24} />
                        Your Position
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-8">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                          <span className="text-5xl font-bold text-white">#{ranking.your_position}</span>
                        </div>
                        <p className="text-xl font-semibold mb-2">out of {ranking.total_students} students</p>
                        <p className="text-gray-600">{ranking.trade_code} - Level {ranking.level_number}{ranking.level_suffix}</p>
                        <p className="text-sm text-gray-500 mt-2">GPA: {ranking.your_gpa?.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {ranking.top_performers?.map((student: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-300 text-gray-700' :
                                index === 2 ? 'bg-orange-400 text-orange-900' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold">{student.student_name}</h4>
                                <p className="text-sm text-gray-600">{student.student_code}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{student.gpa.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">GPA</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'attendance' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Attendance Records</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Filter Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={attendanceFilters.start_date}
                            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, start_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={attendanceFilters.end_date}
                            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, end_date: e.target.value })}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={fetchAttendance} disabled={loading} className="w-full">
                            <Calendar size={18} className="mr-2" />
                            View Attendance
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {attendance.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Attendance Records</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {attendance.map((record: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-semibold">{new Date(record.attendance_date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600">{record.remarks || 'No remarks'}</p>
                              </div>
                              <Badge className={
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {record.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {activeTab === 'timetable' && timetable && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">My Timetable</h2>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {timetable.days && Object.keys(timetable.days).map((day: string) => (
                        <div key={day} className="mb-6">
                          <h4 className="font-semibold text-lg mb-3 text-purple-600">{day}</h4>
                          <div className="space-y-2">
                            {timetable.days[day].map((period: any, index: number) => (
                              <div key={index} className="flex items-center gap-4 p-3 border-l-4 border-purple-500 bg-purple-50 rounded-lg">
                                <div className="text-sm font-semibold text-gray-700 min-w-[100px]">
                                  {period.start_time} - {period.end_time}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold">{period.subject_name}</h5>
                                  <p className="text-sm text-gray-600">{period.teacher_name}</p>
                                </div>
                                <Badge>{period.room_number}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'payment' && paymentStatus && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Payment Status</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Fee Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700">Total Fees</p>
                          <p className="text-2xl font-bold text-blue-800">${paymentStatus.total_fees}</p>
                        </div>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700">Paid Amount</p>
                          <p className="text-2xl font-bold text-green-800">${paymentStatus.paid_amount}</p>
                        </div>
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-700">Balance</p>
                          <p className="text-2xl font-bold text-orange-800">${paymentStatus.balance}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Badge className={
                          paymentStatus.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          paymentStatus.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {paymentStatus.payment_status}
                        </Badge>
                        {paymentStatus.overdue && (
                          <Badge className="ml-2 bg-red-100 text-red-800">Overdue</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {paymentStatus.payment_history && paymentStatus.payment_history.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {paymentStatus.payment_history.map((payment: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-semibold">{new Date(payment.payment_date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600">{payment.payment_method}</p>
                              </div>
                              <p className="font-bold text-green-600">${payment.amount}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentUltraAdvancedPortal;

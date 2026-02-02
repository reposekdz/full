import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, GraduationCap, TrendingUp, Calendar, DollarSign, MessageCircle, 
  Bell, BookOpen, Award, Clock, AlertCircle, CheckCircle, Phone, Mail,
  Download, Eye, BarChart3, PieChart, Activity, Target, Star, Heart,
  FileText, Send, LogOut, Settings, Menu, X, ChevronRight, Sparkles,
  Users, ClipboardList, AlertTriangle, BookMarked, Video, Printer, Home,
  ChevronDown, Search, Filter, Plus, Edit, Trash2, ExternalLink, 
  TrendingDown, Shield, Camera, Upload, Wifi, WifiOff, RefreshCw, Share2,
  MessageSquare, ThumbsUp, Flag, ChartLine, BookCheck, Briefcase, MapPin,
  Globe, CreditCard, Receipt, FileCheck, Coins, Wallet, BellRing, Archive
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface PowerfulParentDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function PowerfulParentDashboard({ onNavigate, onLogout }: PowerfulParentDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  
  // Data states
  const [student, setStudent] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [fees, setFees] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [behavior, setBehavior] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);
  const [transport, setTransport] = useState<any>(null);
  const [canteen, setCanteen] = useState<any>(null);

  // Modal states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showLinkStudentModal, setShowLinkStudentModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const parent = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedChild]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const { data: studentData } = await axios.get(`${API_URL}/parent-dashboard/student`, { headers });
      if (studentData.success && studentData.student) {
        setStudent(studentData.student);
        setSelectedChild(studentData.student);
        const sid = studentData.student.id;
        
        await Promise.all([
          axios.get(`${API_URL}/parent-dashboard/student/${sid}/grades`, { headers }).then(r => r.data.success && setGrades(r.data.grades || [])),
          axios.get(`${API_URL}/parent-dashboard/student/${sid}/attendance`, { headers }).then(r => r.data.success && setAttendance(r.data.attendance)),
          axios.get(`${API_URL}/parent-dashboard/student/${sid}/fees`, { headers }).then(r => r.data.success && setFees(r.data.fees)),
          axios.get(`${API_URL}/parent-dashboard/student/${sid}/assignments`, { headers }).then(r => r.data.success && setAssignments(r.data.assignments || [])),
          axios.get(`${API_URL}/parent-dashboard/student/${sid}/timetable`, { headers }).then(r => r.data.success && setTimetable(r.data.timetable || [])),
          axios.get(`${API_URL}/parent-dashboard/student/${sid}/teachers`, { headers }).then(r => r.data.success && setTeachers(r.data.teachers || [])),
          axios.get(`${API_URL}/parent-dashboard/student/${sid}/exams`, { headers }).then(r => r.data.success && setExams(r.data.exams || [])),
          axios.get(`${API_URL}/parent-dashboard/student/${sid}/behavior`, { headers }).then(r => r.data.success && setBehavior(r.data.behavior || [])),
        ]);
      }

      await Promise.all([
        axios.get(`${API_URL}/parent-dashboard/messages/all`, { headers }).then(r => r.data.success && setMessages(r.data.messages || [])),
        axios.get(`${API_URL}/parent-dashboard/notifications`, { headers }).then(r => r.data.success && setNotifications(r.data.notifications || [])),
      ]);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedTeacher) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/parent-dashboard/message/send`, 
        { recipientId: selectedTeacher.id, message: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Message sent successfully!');
      setShowMessageModal(false);
      setMessageText('');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const uploadPaymentProof = async () => {
    if (!paymentProofFile) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('proof', paymentProofFile);
      formData.append('student_id', selectedChild?.id || student?.id);
      
      await axios.post(`${API_URL}/parent-dashboard/payment-proof`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Payment proof uploaded successfully!');
      setShowPaymentModal(false);
      setPaymentProofFile(null);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to upload payment proof');
    }
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/parent-dashboard/feedback`, 
        { feedback: feedbackText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedbackText('');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const calculateGPA = () => {
    if (!grades.length) return 0;
    const total = grades.reduce((sum, g) => sum + (g.score || 0), 0);
    return (total / grades.length).toFixed(1);
  };

  const getAttendanceRate = () => {
    if (!attendance) return 0;
    const total = (attendance.present || 0) + (attendance.absent || 0);
    return total > 0 ? ((attendance.present / total) * 100).toFixed(0) : 0;
  };

  const getPerformanceTrend = () => {
    if (grades.length < 2) return 'stable';
    const recent = grades.slice(-3);
    const avg1 = recent.slice(0, 1).reduce((sum, g) => sum + g.score, 0);
    const avg2 = recent.slice(-2).reduce((sum, g) => sum + g.score, 0) / 2;
    return avg2 > avg1 ? 'improving' : avg2 < avg1 ? 'declining' : 'stable';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-12 h-12 text-green-600" />
        </motion.div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, trend, color }: any) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-green-400">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-800">{value}</h3>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : null}
                <span className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                  {trend === 'up' ? 'Improving' : trend === 'down' ? 'Needs attention' : 'Stable'}
                </span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-full ${color}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const NavigationItem = ({ icon: Icon, label, section, count }: any) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
        activeSection === section
          ? 'bg-gradient-to-r from-yellow-400 to-green-400 text-white shadow-lg'
          : 'hover:bg-yellow-100 text-gray-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      {count > 0 && (
        <Badge className={activeSection === section ? 'bg-white text-green-600' : 'bg-green-500 text-white'}>
          {count}
        </Badge>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed lg:sticky left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto"
          >
            <div className="p-6 bg-gradient-to-r from-yellow-500 via-green-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  <h1 className="text-2xl font-bold">Parent Portal</h1>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/20 rounded">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-2xl font-bold">
                    {parent.first_name?.[0]}{parent.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{parent.first_name} {parent.last_name}</h3>
                    <p className="text-sm text-yellow-100">{parent.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-2">
              <NavigationItem icon={Home} label="Overview" section="overview" count={0} />
              <NavigationItem icon={GraduationCap} label="Academic Performance" section="academics" count={grades.length} />
              <NavigationItem icon={Calendar} label="Attendance" section="attendance" count={0} />
              <NavigationItem icon={DollarSign} label="Fees & Payments" section="fees" count={fees?.pending || 0} />
              <NavigationItem icon={ClipboardList} label="Assignments" section="assignments" count={assignments.filter((a: any) => !a.completed).length} />
              <NavigationItem icon={BookOpen} label="Timetable" section="timetable" count={0} />
              <NavigationItem icon={Users} label="Teachers" section="teachers" count={teachers.length} />
              <NavigationItem icon={MessageCircle} label="Messages" section="messages" count={messages.filter((m: any) => !m.read).length} />
              <NavigationItem icon={Bell} label="Notifications" section="notifications" count={notifications.filter((n: any) => !n.read).length} />
              <NavigationItem icon={Shield} label="Behavior & Discipline" section="behavior" count={behavior.length} />
              <NavigationItem icon={Award} label="Achievements" section="achievements" count={achievements.length} />
              <NavigationItem icon={FileText} label="Reports" section="reports" count={0} />
              <NavigationItem icon={Settings} label="Settings" section="settings" count={0} />
            </nav>

            <div className="p-4 border-t">
              <Button 
                onClick={onLogout} 
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded">
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </h2>
                {student && (
                  <p className="text-sm text-gray-600">
                    Monitoring: {student.first_name} {student.last_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={() => setShowLinkStudentModal(true)} className="bg-gradient-to-r from-green-500 to-yellow-500">
                <Plus className="w-4 h-4 mr-2" />
                Link Student
              </Button>
              <Button onClick={() => fetchDashboardData()} variant="outline">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={GraduationCap}
                  title="Overall GPA"
                  value={calculateGPA()}
                  trend={getPerformanceTrend() === 'improving' ? 'up' : getPerformanceTrend() === 'declining' ? 'down' : null}
                  color="bg-gradient-to-br from-blue-500 to-purple-600"
                />
                <StatCard
                  icon={Calendar}
                  title="Attendance Rate"
                  value={`${getAttendanceRate()}%`}
                  trend={parseInt(getAttendanceRate()) > 85 ? 'up' : 'down'}
                  color="bg-gradient-to-br from-green-500 to-teal-600"
                />
                <StatCard
                  icon={ClipboardList}
                  title="Pending Assignments"
                  value={assignments.filter((a: any) => !a.completed).length}
                  color="bg-gradient-to-br from-yellow-500 to-orange-600"
                />
                <StatCard
                  icon={DollarSign}
                  title="Fee Balance"
                  value={`RWF ${fees?.balance?.toLocaleString() || 0}`}
                  trend={fees?.balance === 0 ? 'up' : 'down'}
                  color="bg-gradient-to-br from-pink-500 to-red-600"
                />
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button onClick={() => setActiveSection('messages')} className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-purple-600">
                      <MessageCircle className="w-6 h-6" />
                      Send Message
                    </Button>
                    <Button onClick={() => setShowPaymentModal(true)} className="h-20 flex flex-col gap-2 bg-gradient-to-br from-green-500 to-teal-600">
                      <Upload className="w-6 h-6" />
                      Upload Payment
                    </Button>
                    <Button onClick={() => setActiveSection('reports')} className="h-20 flex flex-col gap-2 bg-gradient-to-br from-yellow-500 to-orange-600">
                      <Download className="w-6 h-6" />
                      Download Report
                    </Button>
                    <Button onClick={() => setShowFeedbackModal(true)} className="h-20 flex flex-col gap-2 bg-gradient-to-br from-pink-500 to-red-600">
                      <MessageSquare className="w-6 h-6" />
                      Give Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Grades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {grades.slice(0, 5).map((grade: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{grade.subject}</p>
                            <p className="text-sm text-gray-600">{grade.exam_type}</p>
                          </div>
                          <Badge className={grade.score >= 70 ? 'bg-green-500' : grade.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}>
                            {grade.score}%
                          </Badge>
                        </div>
                      ))}
                      {grades.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No grades available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Exams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {exams.slice(0, 5).map((exam: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{exam.subject}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(exam.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{exam.type}</Badge>
                        </div>
                      ))}
                      {exams.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No upcoming exams</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'academics' && (
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>Detailed view of your child's academic progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {grades.map((grade: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-lg">{grade.subject}</h4>
                          <p className="text-sm text-gray-600">{grade.exam_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600">{grade.score}%</p>
                          <p className="text-sm text-gray-600">{grade.grade}</p>
                        </div>
                      </div>
                      <Progress value={grade.score} className="h-2" />
                      {grade.teacher_comment && (
                        <p className="mt-3 text-sm text-gray-700 italic">
                          <strong>Teacher's Comment:</strong> {grade.teacher_comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'fees' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Total Fees</p>
                      <p className="text-3xl font-bold text-blue-600">RWF {fees?.total?.toLocaleString() || 0}</p>
                    </div>
                    <div className="p-6 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Paid Amount</p>
                      <p className="text-3xl font-bold text-green-600">RWF {fees?.paid?.toLocaleString() || 0}</p>
                    </div>
                    <div className="p-6 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Balance</p>
                      <p className="text-3xl font-bold text-red-600">RWF {fees?.balance?.toLocaleString() || 0}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button onClick={() => setShowPaymentModal(true)} className="w-full bg-gradient-to-r from-green-500 to-blue-600">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Payment Proof
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'messages' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Messages</CardTitle>
                  <Button onClick={() => setShowMessageModal(true)} className="bg-gradient-to-r from-green-500 to-blue-600">
                    <Send className="w-4 h-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((msg: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-lg ${msg.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                            {msg.sender_name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold">{msg.sender_name}</p>
                            <p className="text-xs text-gray-600">{new Date(msg.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        {!msg.read && <Badge className="bg-green-500">New</Badge>}
                      </div>
                      <p className="text-gray-700 ml-13">{msg.message}</p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No messages yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Modals */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Message to Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Teacher</Label>
              <Select onValueChange={(value) => setSelectedTeacher(teachers.find(t => t.id === parseInt(value)))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher: any) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name} - {teacher.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>
            <Button onClick={sendMessage} className="w-full bg-gradient-to-r from-green-500 to-blue-600">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Receipt/Proof</Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
              />
            </div>
            {paymentProofFile && (
              <Alert>
                <FileCheck className="w-4 h-4" />
                <AlertDescription>
                  File selected: {paymentProofFile.name}
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={uploadPaymentProof} className="w-full bg-gradient-to-r from-green-500 to-blue-600">
              <Upload className="w-4 h-4 mr-2" />
              Upload Proof
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              Share your thoughts and suggestions with us
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Write your feedback here..."
              rows={6}
            />
            <Button onClick={submitFeedback} className="w-full bg-gradient-to-r from-green-500 to-blue-600">
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkStudentModal} onOpenChange={setShowLinkStudentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Additional Student</DialogTitle>
            <DialogDescription>
              Request to link another child to your parent account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student Name</Label>
              <Input placeholder="Enter student's full name" />
            </div>
            <div>
              <Label>Student ID (if known)</Label>
              <Input placeholder="Optional" />
            </div>
            <div>
              <Label>Additional Information</Label>
              <Textarea placeholder="Any additional details..." rows={4} />
            </div>
            <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600">
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, GraduationCap, TrendingUp, Calendar, DollarSign, MessageCircle, 
  Bell, BookOpen, Award, Clock, AlertCircle, CheckCircle, Phone, Mail,
  Download, Eye, BarChart3, PieChart, Activity, Target, Star, Heart,
  FileText, Send, LogOut, Settings, Menu, X, ChevronRight, Sparkles,
  Users, ClipboardList, AlertTriangle, BookMarked, Video, Printer
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { API_BASE_URL } from '@/app/config/apiBase';

const API_URL = API_BASE_URL;

interface ModernParentDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function ModernParentDashboard({ onNavigate, onLogout }: ModernParentDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
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
  const [activeTab, setActiveTab] = useState('overview');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLinkStudentModal, setShowLinkStudentModal] = useState(false);
  const [linkFormData, setLinkFormData] = useState({
    student_name: '',
    message: '',
    preferred_contact: 'email'
  });
  const [linkFormStatus, setLinkFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [linkFormLoading, setLinkFormLoading] = useState(false);

  const parent = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const { data: studentData } = await axios.get(`${API_URL}/parent-dashboard/student`, { headers });
      if (studentData.success && studentData.student) {
        setStudent(studentData.student);
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
      toast.error('Failed to load data');
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
      toast.success('Ubutumwa bwoherejwe!');
      setShowMessageModal(false);
      setMessageText('');
      fetchDashboardData();
    } catch (error) {
      toast.error('Byanze kohereza ubutumwa');
    }
  };

  const handleLinkStudentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkFormData.student_name.trim() || !linkFormData.message.trim()) {
      setLinkFormStatus('error');
      toast.error('Uzuza ibibazwa byose');
      return;
    }

    try {
      setLinkFormLoading(true);
      setLinkFormStatus('idle');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/parent-dashboard/request-linking`,
        linkFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setLinkFormStatus('success');
        toast.success('Byakozwe neza! Ubutumwa bwawe bwoherejwe.');
        setLinkFormData({
          student_name: '',
          message: '',
          preferred_contact: 'email'
        });
        setTimeout(() => {
          setShowLinkStudentModal(false);
          setLinkFormStatus('idle');
        }, 2000);
      } else {
        setLinkFormStatus('error');
        toast.error(response.data.message || 'Byanze kohereza');
      }
    } catch (err: any) {
      setLinkFormStatus('error');
      toast.error(err.response?.data?.message || 'Byanze kohereza');
    } finally {
      setLinkFormLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-12 h-12 text-purple-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 flex">
      {/* Left Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-yellow-400 via-green-400 to-yellow-500 shadow-2xl z-40 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-yellow-300"
          >
        <div className="p-6 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-b-4 border-yellow-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-bold">Urubuga rw'Ababyeyi</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden hover:bg-white/20 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center font-bold text-lg">
              {parent.first_name?.[0]}{parent.last_name?.[0]}
            </div>
            <div>
              <p className="font-bold">{parent.first_name} {parent.last_name}</p>
              <p className="text-xs opacity-90">{parent.email}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'bg-white text-green-700 shadow-lg scale-105' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
            <BarChart3 className="w-5 h-5" />
            <span>Incamake</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
          <button onClick={() => setActiveTab('grades')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'grades' ? 'bg-white text-green-700 shadow-lg scale-105' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
            <Award className="w-5 h-5" />
            <span>Amanota</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
          <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'attendance' ? 'bg-white text-green-700 shadow-lg scale-105' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
            <CheckCircle className="w-5 h-5" />
            <span>Kwitabira</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
          <button onClick={() => setActiveTab('assignments')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'assignments' ? 'bg-white text-green-700 shadow-lg scale-105' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
            <ClipboardList className="w-5 h-5" />
            <span>Ibikorwa</span>
            <Badge className="ml-auto bg-white text-green-700">{assignments.length}</Badge>
          </button>
          <button onClick={() => setActiveTab('timetable')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'timetable' ? 'bg-white text-green-700 shadow-lg scale-105' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
            <Calendar className="w-5 h-5" />
            <span>Gahunda y'Amasomo</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
          <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'exams' ? 'bg-white text-green-700 shadow-lg scale-105' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
            <BookMarked className="w-5 h-5" />
            <span>Ibizamini</span>
            <Badge className="ml-auto bg-white text-green-700">{exams.length}</Badge>
          </button>
          <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'messages' ? 'bg-white text-green-700 shadow-lg scale-105' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
            <MessageCircle className="w-5 h-5" />
            <span>Ubutumwa</span>
            {messages.length > 0 && <Badge className="ml-auto bg-red-500 text-white animate-pulse">{messages.length}</Badge>}
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'notifications' ? 'bg-white text-green-700 shadow-lg scale-105' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
            <Bell className="w-5 h-5" />
            <span>Amakuru</span>
            {notifications.filter(n => !n.is_read).length > 0 && <Badge className="ml-auto bg-red-500 text-white animate-pulse">{notifications.filter(n => !n.is_read).length}</Badge>}
          </button>
        </nav>

        <div className="p-4 space-y-2">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <p className="font-bold">Imibare Yihuse</p>
            </div>
            <div className="space-y-1 text-sm">
              <p>GPA: <span className="font-bold">{calculateGPA()}</span></p>
              <p>Kwitabira: <span className="font-bold">{getAttendanceRate()}%</span></p>
              <p>Ibikorwa: <span className="font-bold">{assignments.length}</span></p>
            </div>
          </div>
          <Button onClick={onLogout} className="w-full bg-white text-green-700 hover:bg-yellow-100 font-bold shadow-lg">
            <LogOut className="w-4 h-4 mr-2" />Gusohoka
          </Button>
        </div>
      </motion.aside>
      )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1">
        <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="bg-white shadow-lg border-b-4 border-yellow-400 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-yellow-100 rounded-lg transition-all">
                  {sidebarOpen ? <X className="w-6 h-6 text-green-700" /> : <Menu className="w-6 h-6 text-green-700" />}
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-600 bg-clip-text text-transparent">Urubuga rw'Ababyeyi</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Kugenzura iterambere ry'umwana wawe</p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="p-4 sm:p-6">
          {!student ? (
            <Card className="p-8 sm:p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Nta Mwana Uhujwe</h2>
              <p className="text-gray-600 mb-6">Ukeneye guhuza konti y'umwana wawe kugirango ubone amakuru yabo.</p>
              <Button onClick={() => setShowLinkStudentModal(true)} className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:shadow-xl">
                <Users className="w-4 h-4 mr-2" />
                Huza Konti y'Umwana
              </Button>
            </Card>
          ) : (
            <>
              <Card className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 text-white p-6 shadow-xl mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">{student.first_name} {student.last_name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {student.student_id}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {student.trade_name || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Target className="w-4 h-4" /> Level {student.level || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Card>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-green-500 rounded-lg"><Award className="w-6 h-6 text-white" /></div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-green-700 mb-1">{calculateGPA()}</h3>
                <p className="text-sm text-green-600 font-medium">GPA Rusange</p>
                <Progress value={parseFloat(calculateGPA()) * 10} className="mt-3 h-2" />
              </Card>
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg"><CheckCircle className="w-6 h-6 text-white" /></div>
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-green-700 mb-1">{getAttendanceRate()}%</h3>
                <p className="text-sm text-green-600 font-medium">Kwitabira</p>
                <Progress value={parseFloat(getAttendanceRate())} className="mt-3 h-2" />
              </Card>
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-green-50 border-yellow-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-green-500 rounded-lg"><DollarSign className="w-6 h-6 text-white" /></div>
                </div>
                <h3 className="text-3xl font-bold text-green-700 mb-1">{fees?.balance || 0} RWF</h3>
                <p className="text-sm text-green-600 font-medium">Amafaranga Asigaye</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-green-50 to-yellow-100 border-green-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg"><ClipboardList className="w-6 h-6 text-white" /></div>
                </div>
                <h3 className="text-3xl font-bold text-green-700 mb-1">{assignments.length}</h3>
                <p className="text-sm text-green-600 font-medium">Ibikorwa</p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Imikorere mu Masomo</h3>
            <div className="space-y-3">
              {grades.map((g, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold">{g.score || 'N/A'}</div>
                    <div>
                      <p className="font-semibold">{g.subject}</p>
                      <p className="text-xs text-gray-500">{g.exam_type}</p>
                    </div>
                  </div>
                  <Badge className={g.score >= 70 ? 'bg-green-100 text-green-700' : g.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                    {g.score >= 70 ? 'Byiza Cyane' : g.score >= 50 ? 'Byiza' : 'Birakeneye Iterambere'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'assignments' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Ibikorwa</h3>
            <div className="space-y-3">
              {assignments.map((a, i) => (
                <div key={i} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{a.title}</h4>
                    <Badge className={a.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>{a.status === 'submitted' ? 'Byatanzwe' : 'Ntibikitanze'}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{a.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Itariki: {new Date(a.due_date).toLocaleDateString()}</span>
                    {a.score && <span>Amanota: {a.score}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'timetable' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Gahunda y'Amasomo</h3>
            <div className="space-y-2">
              {timetable.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{t.subject_name}</p>
                    <p className="text-xs text-gray-500">{t.teacher}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{t.day_of_week}</p>
                    <p className="text-xs text-gray-500">{t.start_time} - {t.end_time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Ubutumwa</h3>
                <Button onClick={() => setShowMessageModal(true)} className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:shadow-xl">
                  <Send className="w-4 h-4 mr-2" />Ubutumwa Bushya
                </Button>
              </div>
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{m.sender_name?.[0]}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{m.sender_name}</p>
                        <p className="text-sm text-gray-600">{m.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Amakuru</h3>
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-2 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${n.is_read ? 'bg-gray-300' : 'bg-orange-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400">{new Date(n.time).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'exams' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Ibizamini Bizaza</h3>
            <div className="space-y-3">
              {exams.map((e, i) => (
                <div key={i} className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-bold">{e.exam_name}</h4>
                  <p className="text-sm text-gray-600">{e.subject_name}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-2">
                    <span>{new Date(e.exam_date).toLocaleDateString()}</span>
                    <span>{e.start_time} - {e.end_time}</span>
                    <span>Icyumba: {e.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'attendance' && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Amakuru y'Ubutabire</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{attendance?.present || 0}</p>
                <p className="text-xs text-green-600">Yaritabiriye</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{attendance?.absent || 0}</p>
                <p className="text-xs text-red-600">Ntiyitabiriye</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">{attendance?.late || 0}</p>
                <p className="text-xs text-yellow-600">Yatinze</p>
              </div>
            </div>
          </Card>
        )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMessageModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Kohereza Ubutumwa ku Mwarimu</h3>
              <select onChange={(e) => setSelectedTeacher(teachers.find(t => t.id === parseInt(e.target.value)))} className="w-full p-2 border rounded-lg mb-4">
                <option value="">Hitamo Umwarimu</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name} - {t.subject_name}</option>)}
              </select>
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Andika ubutumwa bwawe..." className="w-full p-3 border rounded-lg mb-4" rows={4} />
              <div className="flex gap-2">
                <Button onClick={sendMessage} className="flex-1 bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:shadow-xl">Kohereza</Button>
                <Button onClick={() => setShowMessageModal(false)} variant="outline" className="flex-1">Guhagarika</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLinkStudentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">Huza Konti y'Umwana</h3>
                <button onClick={() => setShowLinkStudentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Card className="border-2 border-yellow-200 shadow-lg">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Send className="w-6 h-6 text-yellow-600" />
                        <h4 className="font-bold text-lg">Kohereza Ubutumwa</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Andika amazina y'umwana n'ubutumwa bwawe. Admin, Headmaster, cyangwa DOS bazagusubiza vuba.</p>
                      
                      <form onSubmit={handleLinkStudentRequest} className="space-y-4">
                        <div>
                          <Label htmlFor="student_name" className="flex items-center gap-2">
                            <User className="w-4 h-4 text-yellow-600" />
                            Amazina y'Umwana
                          </Label>
                          <Input
                            id="student_name"
                            placeholder="Andika amazina y'umwana wawe..."
                            value={linkFormData.student_name}
                            onChange={(e) => setLinkFormData({ ...linkFormData, student_name: e.target.value })}
                            className="mt-1 border-2 border-yellow-100 focus:border-yellow-500"
                            disabled={linkFormLoading}
                          />
                        </div>

                        <div>
                          <Label htmlFor="message" className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-yellow-600" />
                            Ubutumwa
                          </Label>
                          <Textarea
                            id="message"
                            placeholder="Andika ubutumwa bwawe hano... Sobanura neza icyo usaba..."
                            value={linkFormData.message}
                            onChange={(e) => setLinkFormData({ ...linkFormData, message: e.target.value })}
                            className="mt-1 border-2 border-yellow-100 focus:border-yellow-500 min-h-[120px]"
                            disabled={linkFormLoading}
                          />
                        </div>

                        <div>
                          <Label htmlFor="preferred_contact">Uburyo Wakwishyuriweho</Label>
                          <Select 
                            value={linkFormData.preferred_contact} 
                            onValueChange={(value) => setLinkFormData({ ...linkFormData, preferred_contact: value })}
                            disabled={linkFormLoading}
                          >
                            <SelectTrigger className="mt-1 border-2 border-yellow-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  Email
                                </div>
                              </SelectItem>
                              <SelectItem value="phone">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  Telefoni
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {linkFormStatus === 'success' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border-2 border-green-200"
                          >
                            <CheckCircle className="w-5 h-5" />
                            <div>
                              <p className="font-semibold text-sm">Byakozwe neza!</p>
                              <p className="text-xs">Ubutumwa bwawe bwoherejwe. Uzasubizwa vuba.</p>
                            </div>
                          </motion.div>
                        )}

                        {linkFormStatus === 'error' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border-2 border-red-200"
                          >
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-semibold">Byanze! Gerageza ukundi.</p>
                          </motion.div>
                        )}

                        <Button
                          type="submit"
                          disabled={linkFormLoading}
                          className="w-full bg-gradient-to-r from-yellow-600 to-green-600 text-white hover:shadow-xl"
                        >
                          {linkFormLoading ? 'Gukohereza...' : 'Kohereza Ubutumwa'}
                        </Button>
                      </form>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="border-2 border-green-200 shadow-lg">
                    <div className="p-6">
                      <h4 className="font-bold text-lg text-green-900 mb-4">Uburyo Ibizakubera</h4>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold">1</div>
                          <div>
                            <h5 className="font-semibold text-gray-900">Kohereza Ubutumwa</h5>
                            <p className="text-sm text-gray-600">Uzuza ifishi hejuru ukagisha button yo kohereza</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">2</div>
                          <div>
                            <h5 className="font-semibold text-gray-900">Admin Azabona</h5>
                            <p className="text-sm text-gray-600">Admin, Headmaster, cyangwa DOS bazabona ubutumwa bwawe ako kanya</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
                          <div>
                            <h5 className="font-semibold text-gray-900">Uzasubizwa</h5>
                            <p className="text-sm text-gray-600">Bazagusubiza kuri telefoni cyangwa email bahe kode yo guhuza</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-2 border-orange-200 shadow-lg bg-orange-50">
                    <div className="p-6">
                      <div className="flex gap-3">
                        <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-orange-900 mb-2">Icyitonderwa</h5>
                          <p className="text-sm text-orange-800">
                            Kode yo guhuza n'umwana wawe itangwa n'abayobozi b'ishuri gusa. 
                            Nta wundi uyishobora kuguha. Ubundi, reba ko amazina y'umwana wawe ari yo ukandika neza.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

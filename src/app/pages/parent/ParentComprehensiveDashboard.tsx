import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, AlertTriangle, MessageSquare, TrendingUp, User,
  BookOpen, Clock, Award, Phone, Mail, MapPin, LogOut, UserPlus,
  CreditCard, FileText, Send, Bell, Download, Eye, Star, Target,
  Users, GraduationCap, School, Activity, BarChart3, PieChart,
  Wallet, Receipt, DollarSign, CheckCircle, XCircle, AlertCircle,
  Search, Plus, Zap, Shield, Heart, Sparkles, Camera, Video,
  Calendar as CalendarIcon, Clock as ClockIcon, BookOpen as BookIcon,
  TrendingUp as TrendIcon, MessageCircle, Settings, HelpCircle,
  RefreshCw, Filter, SortAsc, ExternalLink, Share2, Bookmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/app/config/apiBase';
import ParentLinkingCenter from './ParentLinkingCenter';

interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_name: string;
  trade_code: string;
  level_number: number;
  gender: string;
  status: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface AttendanceRecord {
  id: number;
  date: string;
  status: string;
  remarks: string;
  time_in?: string;
  time_out?: string;
}

interface ConductRecord {
  id: number;
  incident_type: string;
  severity: string;
  description: string;
  action_taken: string;
  conduct_points_deducted: number;
  new_conduct_score: number;
  removed_by_name: string;
  created_at: string;
}

interface Comment {
  id: number;
  teacher_name: string;
  subject: string;
  comment: string;
  created_at: string;
  type: 'positive' | 'negative' | 'neutral';
}

interface Performance {
  subject: string;
  marks: number;
  grade: string;
  term: string;
  max_marks: number;
  percentage: number;
}

interface FeeRecord {
  id: number;
  amount: number;
  paid_amount: number;
  balance: number;
  due_date: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  description: string;
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  teacher_name: string;
}

interface Message {
  id: number;
  from_name: string;
  from_role: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function ParentComprehensiveDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLinkChild, setShowLinkChild] = useState(false);
  const [showManualLinkForm, setShowManualLinkForm] = useState(false);
  const [autoLinkAttempted, setAutoLinkAttempted] = useState(false);
  const [manualLinkForm, setManualLinkForm] = useState({
    student_name: '',
    student_code: '',
    trade: '',
    level: '',
    phone: '',
    reason: '',
    additional_info: ''
  });
  
  // Data states
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [conduct, setConduct] = useState<ConductRecord[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState({ to: '', subject: '', message: '' });
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    conductScore: 40,
    averageGrade: 0,
    totalComments: 0,
    totalFees: 0,
    paidFees: 0,
    pendingAssignments: 0,
    unreadMessages: 0
  });

  const parentInfo = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchLinkedStudents();
    attemptAutoLink();
  }, []);

  const attemptAutoLink = async () => {
    if (autoLinkAttempted) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/parent-links/auto-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parent_phone: parentInfo.phone,
          parent_name: `${parentInfo.first_name} ${parentInfo.last_name}`
        })
      });
      
      const data = await response.json();
      if (data.success && data.linked_students > 0) {
        toast.success(`Twabashije guhuza abana ${data.linked_students}!`);
        fetchLinkedStudents();
      }
    } catch (error) {
      console.log('Auto-link attempt failed, will show manual options');
    } finally {
      setAutoLinkAttempted(true);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchLinkedStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/parent-links/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.students.length > 0) {
        setStudents(data.students);
        setSelectedStudent(data.students[0]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Ikibazo cyo gushaka abana');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async (studentId: number) => {
    setLoading(true);
    try {
      // Fetch all data in parallel for better performance
      const [attRes, condRes, gradeRes, commRes, feeRes, assignRes, msgRes] = await Promise.all([
        fetch(`${API_BASE_URL}/parent-portal/student/${studentId}/attendance`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/parent-portal/student/${studentId}/conduct`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/parent-portal/student/${studentId}/grades`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/parent-portal/student/${studentId}/comments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/parent-portal/student/${studentId}/fees`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/parent-portal/student/${studentId}/assignments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/parent-portal/messages`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      // Process attendance
      const attData = await attRes.json();
      if (attData.success) {
        setAttendance(attData.attendance || []);
        const present = attData.attendance?.filter((a: AttendanceRecord) => a.status === 'present').length || 0;
        const total = attData.attendance?.length || 1;
        setStats(prev => ({ ...prev, attendanceRate: Math.round((present / total) * 100) }));
      }

      // Process conduct
      const condData = await condRes.json();
      if (condData.success) {
        setConduct(condData.conduct || []);
        if (condData.conduct && condData.conduct.length > 0) {
          setStats(prev => ({ ...prev, conductScore: condData.conduct[0].new_conduct_score || 40 }));
        }
      }

      // Process grades
      const gradeData = await gradeRes.json();
      if (gradeData.success) {
        setPerformance(gradeData.grades || []);
        const avg = gradeData.grades?.reduce((sum: number, g: Performance) => sum + g.percentage, 0) / (gradeData.grades?.length || 1);
        setStats(prev => ({ ...prev, averageGrade: Math.round(avg) }));
      }

      // Process comments
      const commData = await commRes.json();
      if (commData.success) {
        setComments(commData.comments || []);
        setStats(prev => ({ ...prev, totalComments: commData.comments?.length || 0 }));
      }

      // Process fees
      const feeData = await feeRes.json();
      if (feeData.success) {
        setFees(feeData.fees || []);
        const totalFees = feeData.fees?.reduce((sum: number, f: FeeRecord) => sum + f.amount, 0) || 0;
        const paidFees = feeData.fees?.reduce((sum: number, f: FeeRecord) => sum + f.paid_amount, 0) || 0;
        setStats(prev => ({ ...prev, totalFees, paidFees }));
      }

      // Process assignments
      const assignData = await assignRes.json();
      if (assignData.success) {
        setAssignments(assignData.assignments || []);
        const pending = assignData.assignments?.filter((a: Assignment) => a.status === 'pending').length || 0;
        setStats(prev => ({ ...prev, pendingAssignments: pending }));
      }

      // Process messages
      const msgData = await msgRes.json();
      if (msgData.success) {
        setMessages(msgData.messages || []);
        const unread = msgData.messages?.filter((m: Message) => !m.is_read).length || 0;
        setStats(prev => ({ ...prev, unreadMessages: unread }));
      }
    } catch (error) {
      console.error('Ikibazo cyo gushaka amakuru:', error);
      toast.error('Ikibazo cyo gushaka amakuru y\'umwana');
    } finally {
      setLoading(false);
    }
  };

  const submitManualLinkRequest = async () => {
    if (!manualLinkForm.student_name || !manualLinkForm.reason) {
      toast.error('Uzuza amazina y\'umwana n\'impamvu');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/parent-links/manual-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...manualLinkForm,
          parent_name: `${parentInfo.first_name} ${parentInfo.last_name}`,
          parent_phone: parentInfo.phone,
          parent_email: parentInfo.email
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Ubusabe bwawe bwoherejwe ku buyobozi!');
        setShowManualLinkForm(false);
        setManualLinkForm({
          student_name: '',
          student_code: '',
          trade: '',
          level: '',
          phone: '',
          reason: '',
          additional_info: ''
        });
      } else {
        toast.error(data.message || 'Ikibazo cyo kohereza ubusabe');
      }
    } catch (error) {
      toast.error('Ikibazo cya interineti');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.message) {
      toast.error('Uzuza amakuru yose');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/parent-portal/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          to: newMessage.to,
          subject: newMessage.subject,
          message: newMessage.message,
          student_id: selectedStudent?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Ubutumwa bwoherejwe neza!');
        setNewMessage({ to: '', subject: '', message: '' });
        setShowMessageForm(false);
        // Refresh messages
        if (selectedStudent) fetchStudentData(selectedStudent.id);
      } else {
        toast.error(data.message || 'Ikibazo cyo kohereza ubutumwa');
      }
    } catch (error) {
      toast.error('Ikibazo cya interineti');
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      await fetch(`${API_BASE_URL}/parent-portal/message/${messageId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      // Update local state
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
      setStats(prev => ({ ...prev, unreadMessages: prev.unreadMessages - 1 }));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    onNavigate('login');
    toast.success('Mwasuye neza!');
  };

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Turashakisha amakuru y'umwana...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0 && !showLinkChild && !showManualLinkForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <UserPlus className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Murakaza Neza, {parentInfo.first_name}!</h1>
            <p className="text-xl text-gray-600">Dufite uburyo butandukanye bwo guhuza umwana wawe</p>
          </div>

          {/* Auto Link Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Smart Auto Link */}
            <Card className="border-2 border-green-200 shadow-2xl hover:shadow-3xl transition-all cursor-pointer" onClick={() => setShowLinkChild(true)}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Guhuza Byihuse</h3>
                <p className="text-gray-600 mb-4">Sisitemu yacu izashakisha umwana wawe mu makuru dufite</p>
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                  <Shield className="w-5 h-5" />
                  <span>Byihuse & Byizewe</span>
                </div>
              </CardContent>
            </Card>

            {/* Manual Staff Assistance */}
            <Card className="border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all cursor-pointer" onClick={() => setShowManualLinkForm(true)}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Gufashwa n'Abakozi</h3>
                <p className="text-gray-600 mb-4">Niba udashobora kubona umwana wawe, abakozi bazagufasha</p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  <Heart className="w-5 h-5" />
                  <span>Ubufasha Bwuzuye</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Preview */}
          <Card className="shadow-2xl border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8" />
                Ibyo Uzabona Nyuma yo Guhuza Umwana
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">Imitsindire</h4>
                  <p className="text-gray-600 text-sm">Reba niba umwana wawe yaje ku ishuri buri munsi</p>
                </div>
                <div className="text-center">
                  <TrendIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">Amanota</h4>
                  <p className="text-gray-600 text-sm">Koresha amanota y'umwana wawe mu byiga byose</p>
                </div>
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">Ubutumwa</h4>
                  <p className="text-gray-600 text-sm">Vugana n'abarimu n'abayobozi b'ishuri</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <div className="text-center mt-8">
            <Button onClick={handleLogout} variant="outline" className="h-12 px-8 border-2">
              <LogOut className="w-5 h-5 mr-2" />
              Gusohoka
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showManualLinkForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Users className="w-8 h-8" />
                Gusaba Ubufasha bwo Guhuza Umwana
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800 font-semibold">📋 Uzuza amakuru hano, abakozi b'ishuri bazagufasha guhuza umwana wawe</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Amazina y'Umwana *</label>
                  <Input
                    value={manualLinkForm.student_name}
                    onChange={(e) => setManualLinkForm({...manualLinkForm, student_name: e.target.value})}
                    placeholder="Jean Claude Munyaneza"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nimero y'Umunyeshuri</label>
                  <Input
                    value={manualLinkForm.student_code}
                    onChange={(e) => setManualLinkForm({...manualLinkForm, student_code: e.target.value})}
                    placeholder="SOD/2024/001"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ishami</label>
                  <select
                    value={manualLinkForm.trade}
                    onChange={(e) => setManualLinkForm({...manualLinkForm, trade: e.target.value})}
                    className="w-full h-12 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Hitamo Ishami</option>
                    <option value="SOD">Software Development (SOD)</option>
                    <option value="BDC">Building & Construction (BDC)</option>
                    <option value="AUT">Automobile Technology (AUT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Umwaka</label>
                  <select
                    value={manualLinkForm.level}
                    onChange={(e) => setManualLinkForm({...manualLinkForm, level: e.target.value})}
                    className="w-full h-12 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Hitamo Umwaka</option>
                    <option value="1">Umwaka wa 1</option>
                    <option value="2">Umwaka wa 2</option>
                    <option value="3">Umwaka wa 3</option>
                    <option value="4">Umwaka wa 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Telefone y'Umwana</label>
                <Input
                  value={manualLinkForm.phone}
                  onChange={(e) => setManualLinkForm({...manualLinkForm, phone: e.target.value})}
                  placeholder="+250 788 000 000"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Impamvu yo Gusaba Ubufasha *</label>
                <Textarea
                  value={manualLinkForm.reason}
                  onChange={(e) => setManualLinkForm({...manualLinkForm, reason: e.target.value})}
                  placeholder="Sobanura impamvu utashobora guhuza umwana wawe wenyine..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Andi Makuru</label>
                <Textarea
                  value={manualLinkForm.additional_info}
                  onChange={(e) => setManualLinkForm({...manualLinkForm, additional_info: e.target.value})}
                  placeholder="Andi makuru yafasha abakozi guhuza umwana wawe..."
                  rows={2}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setShowManualLinkForm(false)} variant="outline" className="flex-1 h-12">
                  Kuraguza
                </Button>
                <Button onClick={submitManualLinkRequest} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  Kohereza Ubusabe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showLinkChild) {
    return <ParentLinkingCenter onSuccess={() => { setShowLinkChild(false); fetchLinkedStudents(); }} />;
  }

  const studentName = selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : '';
  const dashboardTitle = `${studentName} - Raporo`;

  const tabs = [
    { id: 'dashboard', label: 'Ibanze', icon: Home },
    { id: 'attendance', label: 'Imitsindire', icon: Calendar },
    { id: 'conduct', label: 'Imyitwarire', icon: AlertTriangle },
    { id: 'performance', label: 'Amanota', icon: TrendingUp },
    { id: 'fees', label: 'Amafaranga', icon: CreditCard },
    { id: 'assignments', label: 'Amakazi', icon: BookOpen },
    { id: 'messages', label: 'Ubutumwa', icon: MessageSquare },
    { id: 'comments', label: 'Ibitekerezo', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black">{dashboardTitle}</h1>
              <p className="text-blue-100 mt-1">Murakaza neza, {parentInfo.first_name}</p>
            </div>
            <div className="flex items-center gap-4">
              {students.length > 1 && (
                <select
                  value={selectedStudent?.id}
                  onChange={(e) => {
                    const student = students.find(s => s.id === parseInt(e.target.value));
                    if (student) setSelectedStudent(student);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30 font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="text-gray-900">
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              )}
              <Button onClick={() => setShowLinkChild(true)} variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <UserPlus className="w-4 h-4 mr-2" />
                Ongeraho
              </Button>
              <Button onClick={handleLogout} variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <LogOut className="w-4 h-4 mr-2" />
                Gusohoka
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold border-b-4 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer" onClick={() => setActiveTab('attendance')}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-semibold">Imitsindire</p>
                        <p className="text-4xl font-black mt-2">{stats.attendanceRate}%</p>
                        <p className="text-green-200 text-xs mt-1">Kanda urebe byinshi</p>
                      </div>
                      <Calendar className="w-12 h-12 text-white/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer" onClick={() => setActiveTab('conduct')}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-semibold">Imyitwarire</p>
                        <p className="text-4xl font-black mt-2">{stats.conductScore}/40</p>
                        <p className="text-blue-200 text-xs mt-1">Kanda urebe byinshi</p>
                      </div>
                      <AlertTriangle className="w-12 h-12 text-white/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer" onClick={() => setActiveTab('performance')}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-semibold">Amanota</p>
                        <p className="text-4xl font-black mt-2">{stats.averageGrade}%</p>
                        <p className="text-purple-200 text-xs mt-1">Kanda urebe byinshi</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-white/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer" onClick={() => setActiveTab('fees')}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-semibold">Amafaranga</p>
                        <p className="text-2xl font-black mt-2">{((stats.paidFees / stats.totalFees) * 100 || 0).toFixed(0)}%</p>
                        <p className="text-orange-200 text-xs mt-1">Kanda urebe byinshi</p>
                      </div>
                      <CreditCard className="w-12 h-12 text-white/30" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Button onClick={() => setActiveTab('messages')} className="h-16 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-sm font-bold">Ubutumwa</span>
                  {stats.unreadMessages > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">{stats.unreadMessages}</Badge>
                  )}
                </Button>
                <Button onClick={() => setActiveTab('assignments')} className="h-16 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm font-bold">Amakazi</span>
                  {stats.pendingAssignments > 0 && (
                    <Badge className="bg-orange-500 text-white text-xs">{stats.pendingAssignments}</Badge>
                  )}
                </Button>
                <Button onClick={() => setShowMessageForm(true)} className="h-16 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-2">
                  <Send className="w-6 h-6" />
                  <span className="text-sm font-bold">Kohereza</span>
                </Button>
                <Button onClick={() => window.print()} className="h-16 bg-gray-600 hover:bg-gray-700 flex flex-col items-center justify-center gap-2">
                  <Download className="w-6 h-6" />
                  <span className="text-sm font-bold">Gucapa</span>
                </Button>
              </div>

              {/* Student Info */}
              {selectedStudent && (
                <Card className="shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <CardTitle className="flex items-center gap-3">
                      <User className="w-6 h-6" />
                      Amakuru y'Umwana
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Amazina Yombi</p>
                        <p className="text-lg font-bold text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Nimero y'Umunyeshuri</p>
                        <p className="text-lg font-bold text-gray-900">{selectedStudent.student_code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Ishami</p>
                        <p className="text-lg font-bold text-gray-900">{selectedStudent.trade_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Umwaka w'Amashuri</p>
                        <p className="text-lg font-bold text-gray-900">Umwaka wa {selectedStudent.level_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Igitsina</p>
                        <p className="text-lg font-bold text-gray-900">{selectedStudent.gender === 'Male' ? 'Gabo' : 'Gore'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Uko Bimeze</p>
                        <Badge className={selectedStudent.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                          {selectedStudent.status === 'active' ? 'Arakora' : 'Ntarakora'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Other tabs content would go here - attendance, conduct, performance, etc. */}
        </AnimatePresence>
      </div>
    </div>
  );
}
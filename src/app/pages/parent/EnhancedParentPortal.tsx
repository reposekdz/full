import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, GraduationCap, Calendar, DollarSign, MessageSquare, Bell, User,
  School, Mail, Award, BookOpen, TrendingUp, Clock, CheckCircle, XCircle,
  AlertCircle, BarChart3, FileText, Download, Phone, MapPin, Activity,
  Target, Trophy, Medal, Heart, Eye, Edit, RefreshCw, ChevronRight, Wallet,
  CreditCard, Receipt, AlertTriangle, UserCheck, ClipboardList, Home, Settings,
  Send, MessageCircle, PhoneCall, Video, File, Image, Link as LinkIcon,
  Check, Plus, Minus, Filter, Search, MoreVertical, LogOut, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import { API_BASE_URL } from '@/app/config/apiBase';
import ParentLinkingCenter from './ParentLinkingCenter';

// ==================== TYPES ====================

interface ChildInfo {
  student: {
    id: string;
    code: string;
    name: string;
    trade: string;
    level: number;
    profile_image?: string;
  };
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    rate: string;
  };
  academics: {
    average_grade: number;
    gpa: number;
    overall_grade: string;
  };
  finance: {
    total_fees: number;
    paid_amount: number;
    balance: number;
    status: string;
  };
  discipline: {
    incidents_this_month: number;
    conduct_score: number;
  };
  achievements: any[];
  permissions: {
    view_grades: boolean;
    view_attendance: boolean;
    view_discipline: boolean;
    view_fees: boolean;
  };
}

interface ParentNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

// ==================== COMPONENT ====================

const EnhancedParentPortal: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Data States
  const [parentInfo, setParentInfo] = useState<any>(null);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildInfo | null>(null);
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal States
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  // Form States
  const [messageForm, setMessageForm] = useState({
    recipient_type: 'admin',
    subject: '',
    message: '',
    message_type: 'inquiry',
    priority: 'normal'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    sms_enabled: true,
    whatsapp_enabled: false,
    email_enabled: true,
    attendance_alerts: true,
    marks_alerts: true,
    fee_reminders: true
  });

  const [notificationSettings, setNotificationSettings] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchParentData();
    fetchActivityLogs();
    fetchNotificationSettings();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/enhanced-parent-portal/activity?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/enhanced-parent-portal/settings/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setNotificationSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/enhanced-parent-portal/settings/notifications`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationSettings)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Igenamiterere ryabitswe neza!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Gubika igenamiterere ntibishobotse.');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchParentData().finally(() => setRefreshing(false));
  };

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/enhanced-parent-portal/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...messageForm,
          student_id: selectedChild?.student.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowMessageModal(false);
        setMessageForm({
          recipient_type: 'admin',
          subject: '',
          message: '',
          message_type: 'inquiry',
          priority: 'normal'
        });
        alert('Ubutumwa bwayoherejwe neza!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Gohereza ubutumwa ntibishobotse.');
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedChild) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/enhanced-parent-portal/children/${selectedChild.student.id}/submit-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowPaymentModal(false);
        setPaymentForm({
          amount: '',
          payment_method: 'bank_transfer',
          reference_number: '',
          payment_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        alert('Ikimenyetso cyo kwishyura cyakiriwe!');
        fetchParentData();
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Kwakira ikimenyetso cyo kwishyura ntibishobotse.');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800'
    };

    const kinyarwandaStatus: Record<string, string> = {
      present: 'Yitabiriye',
      absent: 'Ntiyabonetse',
      late: 'Yatinze',
      paid: 'Byishyuwe',
      pending: 'Bitegerejwe',
      overdue: 'Byataye igihe',
      active: 'Arakora'
    };

    return <Badge className={colors[status] || 'bg-gray-100'}>{kinyarwandaStatus[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Turi gufungura imbuga y'ababyeyi...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-6">
        <ParentLinkingCenter onSuccess={fetchParentData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Imbuga y'Ababyeyi</h1>
              <p className="text-green-100">Kurikirana imitsindire n'ibikorwa by'umwana wawe ku ishuri</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Vugurura
              </Button>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm relative group">
                <Bell className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Integuza
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Child Selection */}
          <div className="flex flex-wrap gap-3">
            {children.map((child) => (
              <Button
                key={child.student.id}
                onClick={() => setSelectedChild(child)}
                className={`${selectedChild?.student.id === child.student.id
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
              >
                <User className="w-4 h-4 mr-2" />
                {child.student.name}
              </Button>
            ))}
            <Button
              onClick={() => setShowAddChildModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ongera Umwana
            </Button>
          </div>

          {/* Parent Info */}
          {parentInfo && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-green-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {parentInfo.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {parentInfo.email}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedChild && (
        <div className="max-w-7xl mx-auto p-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kwitabira</p>
                    <h3 className="text-3xl font-bold text-green-700">{selectedChild.attendance.rate}%</h3>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Impuzandengo</p>
                    <h3 className="text-3xl font-bold text-yellow-700">{selectedChild.academics.average_grade}%</h3>
                  </div>
                  <Award className="w-12 h-12 text-yellow-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Umwenda w'Ishuri</p>
                    <h3 className="text-2xl font-bold text-emerald-700">RWF {selectedChild.finance.balance.toLocaleString()}</h3>
                  </div>
                  <Wallet className="w-12 h-12 text-emerald-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Imyitwarire</p>
                    <h3 className="text-3xl font-bold text-purple-700">{selectedChild.discipline.conduct_score}</h3>
                  </div>
                  <Shield className="w-12 h-12 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white shadow-sm border">
              <TabsTrigger value="overview">Incamake</TabsTrigger>
              <TabsTrigger value="academics">Amasomo</TabsTrigger>
              <TabsTrigger value="attendance">Kwitabira</TabsTrigger>
              <TabsTrigger value="finance">Imari</TabsTrigger>
              <TabsTrigger value="discipline">Imyitwarire</TabsTrigger>
              <TabsTrigger value="messages">Ubutumwa</TabsTrigger>
              <TabsTrigger value="settings">Igenamiterere</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Amakuru y'Umunyeshuri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amazina Yose:</span>
                      <span className="font-semibold">{selectedChild.student.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nimero y'Umunyeshuri:</span>
                      <span className="font-semibold">{selectedChild.student.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ishami:</span>
                      <span className="font-semibold">{selectedChild.student.trade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Umwaka:</span>
                      <span className="font-semibold">{selectedChild.student.level}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Imitsindire ya Vuba
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">GPA</span>
                        <span className="font-semibold">{selectedChild.academics.gpa}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Icyiciro (Grade)</span>
                        <span className="font-semibold">{selectedChild.academics.overall_grade}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Igipimo cyo kwitabira</span>
                        <span className="font-semibold">{selectedChild.attendance.rate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Ibikorwa bya Vuba (Live Activity)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {activities.length > 0 ? activities.map((activity, idx) => (
                        <div key={idx} className="flex gap-4 p-3 border-b last:border-0 hover:bg-gray-50 transition-colors rounded-lg">
                          <div className={`p-2 rounded-full h-fit ${activity.activity_type === 'login' ? 'bg-blue-100 text-blue-600' :
                            activity.activity_type === 'view_grades' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                            {activity.activity_type === 'login' ? <User className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{activity.activity_type.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                          </div>
                          <Badge variant="outline" className="h-fit">Success</Badge>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-gray-400">
                          <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p>Nta bikorwa bihari ubu.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle>Ibikorwa bya Vuba</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => setShowMessageModal(true)} className="bg-gradient-to-r from-green-600 to-emerald-600">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Yohereza Ubutumwa
                    </Button>
                    <Button onClick={() => setShowPaymentModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Kwishyura
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('academics')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Reba Indangamanota
                    </Button>
                    <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Igenamiterere ry'Integuza
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academics Tab */}
            <TabsContent value="academics" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Imitsindire mu Masomo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">GPA</h4>
                        <span className="text-2xl font-bold text-green-600">{selectedChild.academics.gpa}</span>
                      </div>
                      <Progress value={selectedChild.academics.gpa} className="h-3" />
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Icyiciro (Grade)</h4>
                        <Badge className="text-lg px-3 py-1">{selectedChild.academics.overall_grade}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedChild.achievements.length > 0 && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Ibyagezweho Vuba
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {selectedChild.achievements.slice(0, 5).map((achievement, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                            <Award className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{achievement.title || achievement.achievement_type}</h4>
                            <p className="text-sm text-gray-500">{achievement.description}</p>
                          </div>
                          {achievement.points && (
                            <Badge className="bg-green-100 text-green-800">+{achievement.points} pts</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Incamake yo Kwitabira
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{selectedChild.attendance.present_days}</p>
                      <p className="text-sm text-gray-600">Iminsi Yitabiriye</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-3xl font-bold text-red-600">{selectedChild.attendance.absent_days}</p>
                      <p className="text-sm text-gray-600">Iminsi Atabonetse</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{selectedChild.attendance.total_days}</p>
                      <p className="text-sm text-gray-600">Iminsi Yose</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">{selectedChild.attendance.rate}%</p>
                      <p className="text-sm text-gray-600">Igipimo cyo kwitabira</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={parseFloat(selectedChild.attendance.rate)} className="h-4" />
                    <p className="text-center text-sm text-gray-600">
                      Igipimo cyo kwitabira muri uku kwezi ni {selectedChild.attendance.rate}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Finance Tab */}
            <TabsContent value="finance" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Incamake y'Amafaranga y'Ishuri
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">RWF {selectedChild.finance.total_fees.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Amafaranga Yose</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">RWF {selectedChild.finance.paid_amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Ayishyuwe</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">RWF {selectedChild.finance.balance.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Isigaye</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{getStatusBadge(selectedChild.finance.status)}</p>
                      <p className="text-sm text-gray-600">Imiterere</p>
                    </div>
                  </div>

                  <Button onClick={() => setShowPaymentModal(true)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Yohereza Ikimenyetso cyo Kwishyura
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Discipline Tab */}
            <TabsContent value="discipline" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Imyitwarire n'Uburere
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-4xl font-bold text-purple-600">{selectedChild.discipline.conduct_score}</p>
                      <p className="text-sm text-gray-600">Amanota y'Imyitwarire</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-4xl font-bold text-yellow-600">{selectedChild.discipline.incidents_this_month}</p>
                      <p className="text-sm text-gray-600">Ibyaha byakozwe muri uku kwezi</p>
                    </div>
                  </div>

                  {selectedChild.discipline.incidents_this_month > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">Witonde / Isuzume</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Umwana wawe afite ibyaha {selectedChild.discipline.incidents_this_month} by'imyitwarire muri uku kwezi.
                        Wavugana n'ubuyobozi ku bindi bisobanuro.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Yohereza Ubutumwa ku Ishuri
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Yohereza Kuri</Label>
                      <Select
                        value={messageForm.recipient_type}
                        onValueChange={(value) => setMessageForm({ ...messageForm, recipient_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Ubuyobozi (Admin)</SelectItem>
                          <SelectItem value="dod">Umuyobozi w'Amasomo (DOS)</SelectItem>
                          <SelectItem value="teacher">Umwarimu w'Ishuri</SelectItem>
                          <SelectItem value="accountant">Umucungamari</SelectItem>
                          <SelectItem value="matron">Matron</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Ubwoko bw'Ubutumwa</Label>
                      <Select
                        value={messageForm.message_type}
                        onValueChange={(value) => setMessageForm({ ...messageForm, message_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inquiry">Ikibazo Rusange</SelectItem>
                          <SelectItem value="feedback">Igitekerezo</SelectItem>
                          <SelectItem value="complaint">Kurega / Icyifuzo</SelectItem>
                          <SelectItem value="request">Ubusabe</SelectItem>
                          <SelectItem value="emergency">Ikibazo Cyihutirwa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Intego (Subject)</Label>
                      <Input
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                        placeholder="Andika intego y'ubutumwa"
                      />
                    </div>
                    <div>
                      <Label>Ubutumwa</Label>
                      <Textarea
                        value={messageForm.message}
                        onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                        placeholder="Andika ubutumwa bwawe hano"
                        rows={5}
                      />
                    </div>
                    <Button onClick={handleSendMessage} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                      <Send className="w-4 h-4 mr-2" />
                      Yohereza Ubutumwa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="border-2 border-emerald-100 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        Igenamiterere ry'Integuza
                      </CardTitle>
                      <CardDescription className="text-emerald-100">Hitamo uko ushaka kubona amakuru y'umwana wawe.</CardDescription>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/20">Advanced</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-800 border-b pb-2">
                        <MessageSquare className="w-5 h-5" /> Inzira z'Ubutumwa
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                              <Phone className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-bold">Ubutumwa kuri SMS</h4>
                              <p className="text-xs text-muted-foreground">Bona integuza kuri telefone yawe</p>
                            </div>
                          </div>
                          <Button
                            variant={notificationSettings.sms_enabled ? 'default' : 'outline'}
                            onClick={() => setNotificationSettings({ ...notificationSettings, sms_enabled: !notificationSettings.sms_enabled })}
                            className={notificationSettings.sms_enabled ? 'bg-emerald-600' : ''}
                          >
                            {notificationSettings.sms_enabled ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                              <MessageCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-bold">Ubutumwa kuri WhatsApp</h4>
                              <p className="text-xs text-muted-foreground">Bona amakuru arambuye kuri WhatsApp</p>
                            </div>
                          </div>
                          <Button
                            variant={notificationSettings.whatsapp_enabled ? 'default' : 'outline'}
                            onClick={() => setNotificationSettings({ ...notificationSettings, whatsapp_enabled: !notificationSettings.whatsapp_enabled })}
                            className={notificationSettings.whatsapp_enabled ? 'bg-green-600' : ''}
                          >
                            {notificationSettings.whatsapp_enabled ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-blue-800 border-b pb-2">
                        <Bell className="w-5 h-5" /> Ibyo ubatseho
                      </h3>
                      <div className="space-y-4">
                        {[
                          { key: 'attendance_alerts', label: 'Integuza yo Kwitabira', icon: <Calendar className="w-5 h-5" /> },
                          { key: 'marks_alerts', label: 'Integuza y\'Amanota', icon: <GraduationCap className="w-5 h-5" /> },
                          { key: 'fee_reminders', label: 'Integuza yo Kwishyura', icon: <DollarSign className="w-5 h-5" /> }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">{item.icon}</div>
                              <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            </div>
                            <Button
                              size="sm"
                              variant={(notificationSettings as any)[item.key] ? 'default' : 'outline'}
                              onClick={() => setNotificationSettings({ ...notificationSettings, [item.key]: !(notificationSettings as any)[item.key] })}
                              className={(notificationSettings as any)[item.key] ? 'bg-blue-600' : ''}
                            >
                              {(notificationSettings as any)[item.key] ? 'Birakora' : 'Bifunze'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="bg-emerald-900/5 p-6 border-t border-emerald-100 flex justify-end gap-3">
                  <Button variant="ghost" className="text-emerald-700">Cancel</Button>
                  <Button
                    onClick={handleSaveSettings}
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8 shadow-lg shadow-emerald-200"
                  >
                    Bika Igenamiterere
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yohereza Ubutumwa ku Ishuri</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Uwakira (Recipient)</Label>
              <Select
                value={messageForm.recipient_type}
                onValueChange={(value) => setMessageForm({ ...messageForm, recipient_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Ubuyobozi</SelectItem>
                  <SelectItem value="dod">Umuyobozi w'Amasomo</SelectItem>
                  <SelectItem value="teacher">Umwarimu w'Ishuri</SelectItem>
                  <SelectItem value="accountant">Umucungamari</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ubwoko bw'Ubutumwa</Label>
              <Select
                value={messageForm.message_type}
                onValueChange={(value) => setMessageForm({ ...messageForm, message_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inquiry">Ikibazo Rusange</SelectItem>
                  <SelectItem value="feedback">Igitekerezo</SelectItem>
                  <SelectItem value="complaint">Kurega / Icyifuzo</SelectItem>
                  <SelectItem value="request">Ubusabe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Intego</Label>
              <Input
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Ubutumwa</Label>
              <Textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageModal(false)}>Hagarika</Button>
            <Button onClick={handleSendMessage}>Yohereza Ubutumwa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yohereza Ikimenyetso cyo Kwishyura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amafaranga (RWF)</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Uburyo bwo Kwishyura</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Kwishyura kuri Banki</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cash">Cash (Amafaranga mu Ntoki)</SelectItem>
                  <SelectItem value="cheque">Sheki (Cheque)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nimero y'Icyemezo (Reference)</Label>
              <Input
                value={paymentForm.reference_number}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                placeholder="Enter reference number"
              />
            </div>
            <div>
              <Label>Itariki yo Kwishyura</Label>
              <Input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Ibindi / Ibisobanuro</Label>
              <Textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Hagarika</Button>
            <Button onClick={handleSubmitPayment}>Yohereza Icyemezo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Child Modal */}
      <Dialog open={showAddChildModal} onOpenChange={setShowAddChildModal}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-0 shadow-3xl">
          <ParentLinkingCenter onSuccess={() => {
            setShowAddChildModal(false);
            fetchParentData();
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedParentPortal;

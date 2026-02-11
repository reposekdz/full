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

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const [dashboardRes, notificationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/enhanced-parent-portal/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/enhanced-parent-portal/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const dashboardData = await dashboardRes.json();
      const notificationsData = await notificationsRes.json();

      if (dashboardData.success) {
        setParentInfo(dashboardData.parent);
        setChildren(dashboardData.children || []);
        if (dashboardData.children?.length > 0) {
          setSelectedChild(dashboardData.children[0]);
        }
        setUnreadCount(dashboardData.summary?.unread_notifications || 0);
      }

      if (notificationsData.success) {
        setNotifications(notificationsData.notifications || []);
      }

    } catch (error) {
      console.error('Error fetching parent data:', error);
    }
    setLoading(false);
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
        alert('Message sent successfully!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
        alert('Payment proof submitted successfully!');
        fetchParentData();
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
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
    return <Badge className={colors[status] || 'bg-gray-100'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading parent portal...</p>
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
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact School
            </Button>
          </CardContent>
        </Card>
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
              <h1 className="text-3xl font-bold mb-2">Parent Portal</h1>
              <p className="text-green-100">Monitor your child's academic progress and school activities</p>
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
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm relative">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
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
                className={`${
                  selectedChild?.student.id === child.student.id
                    ? 'bg-white text-green-700 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                {child.student.name}
              </Button>
            ))}
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
                    <p className="text-sm text-gray-600 mb-1">Attendance</p>
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
                    <p className="text-sm text-gray-600 mb-1">Average Grade</p>
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
                    <p className="text-sm text-gray-600 mb-1">Pending Fees</p>
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
                    <p className="text-sm text-gray-600 mb-1">Conduct Score</p>
                    <h3 className="text-3xl font-bold text-purple-700">{selectedChild.discipline.conduct_score}</h3>
                  </div>
                  <Shield className="w-12 h-12 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white shadow-sm border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="discipline">Discipline</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
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
                      <span className="font-semibold">{selectedChild.student.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student ID:</span>
                      <span className="font-semibold">{selectedChild.student.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trade:</span>
                      <span className="font-semibold">{selectedChild.student.trade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-semibold">{selectedChild.student.level}</span>
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
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">GPA</span>
                        <span className="font-semibold">{selectedChild.academics.gpa}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Overall Grade</span>
                        <span className="font-semibold">{selectedChild.academics.overall_grade}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Attendance Rate</span>
                        <span className="font-semibold">{selectedChild.attendance.rate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => setShowMessageModal(true)} className="bg-gradient-to-r from-green-600 to-emerald-600">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button onClick={() => setShowPaymentModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Submit Payment
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('academics')}>
                      <FileText className="w-4 h-4 mr-2" />
                      View Report Card
                    </Button>
                    <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Notification Settings
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
                    Academic Performance
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
                        <h4 className="font-semibold">Overall Grade</h4>
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
                      Recent Achievements
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
                    Attendance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{selectedChild.attendance.present_days}</p>
                      <p className="text-sm text-gray-600">Days Present</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-3xl font-bold text-red-600">{selectedChild.attendance.absent_days}</p>
                      <p className="text-sm text-gray-600">Days Absent</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{selectedChild.attendance.total_days}</p>
                      <p className="text-sm text-gray-600">Total Days</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">{selectedChild.attendance.rate}%</p>
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={parseFloat(selectedChild.attendance.rate)} className="h-4" />
                    <p className="text-center text-sm text-gray-600">
                      {selectedChild.attendance.rate}% attendance rate this month
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
                    Fee Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">RWF {selectedChild.finance.total_fees.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Fees</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">RWF {selectedChild.finance.paid_amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Paid</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">RWF {selectedChild.finance.balance.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Balance</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{getStatusBadge(selectedChild.finance.status)}</p>
                      <p className="text-sm text-gray-600">Status</p>
                    </div>
                  </div>

                  <Button onClick={() => setShowPaymentModal(true)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Submit Payment Proof
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
                    Conduct & Discipline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-4xl font-bold text-purple-600">{selectedChild.discipline.conduct_score}</p>
                      <p className="text-sm text-gray-600">Conduct Score</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-4xl font-bold text-yellow-600">{selectedChild.discipline.incidents_this_month}</p>
                      <p className="text-sm text-gray-600">Incidents This Month</p>
                    </div>
                  </div>

                  {selectedChild.discipline.incidents_this_month > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">Attention Required</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Your child has {selectedChild.discipline.incidents_this_month} discipline incident(s) this month.
                        Please contact the school for more details.
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
                    Send Message to School
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Send To</Label>
                      <Select
                        value={messageForm.recipient_type}
                        onValueChange={(value) => setMessageForm({ ...messageForm, recipient_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administration</SelectItem>
                          <SelectItem value="dod">Director of Studies</SelectItem>
                          <SelectItem value="teacher">Class Teacher</SelectItem>
                          <SelectItem value="accountant">Accountant</SelectItem>
                          <SelectItem value="matron">Matron</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Message Type</Label>
                      <Select
                        value={messageForm.message_type}
                        onValueChange={(value) => setMessageForm({ ...messageForm, message_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inquiry">General Inquiry</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="request">Request</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                        placeholder="Enter subject"
                      />
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea
                        value={messageForm.message}
                        onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                        placeholder="Enter your message"
                        rows={5}
                      />
                    </div>
                    <Button onClick={handleSendMessage} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Grade Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications when new grades are posted</p>
                      </div>
                      <Button variant={true ? 'default' : 'outline'}>
                        <Check className="w-4 h-4 mr-2" />
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Attendance Alerts</h4>
                        <p className="text-sm text-gray-500">Receive alerts when child is absent or late</p>
                      </div>
                      <Button variant={true ? 'default' : 'outline'}>
                        <Check className="w-4 h-4 mr-2" />
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Fee Reminders</h4>
                        <p className="text-sm text-gray-500">Receive fee payment reminders</p>
                      </div>
                      <Button variant={true ? 'default' : 'outline'}>
                        <Check className="w-4 h-4 mr-2" />
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">SMS Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <Button variant={true ? 'default' : 'outline'}>
                        <Check className="w-4 h-4 mr-2" />
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via Email</p>
                      </div>
                      <Button variant={true ? 'default' : 'outline'}>
                        <Check className="w-4 h-4 mr-2" />
                        Enabled
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to School</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipient</Label>
              <Select
                value={messageForm.recipient_type}
                onValueChange={(value) => setMessageForm({ ...messageForm, recipient_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administration</SelectItem>
                  <SelectItem value="dod">Director of Studies</SelectItem>
                  <SelectItem value="teacher">Class Teacher</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message Type</Label>
              <Select
                value={messageForm.message_type}
                onValueChange={(value) => setMessageForm({ ...messageForm, message_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="request">Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageModal(false)}>Cancel</Button>
            <Button onClick={handleSendMessage}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount (RWF)</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference Number</Label>
              <Input
                value={paymentForm.reference_number}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                placeholder="Enter reference number"
              />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitPayment}>Submit Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedParentPortal;

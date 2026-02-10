import { API_BASE_URL } from '@/app/config/apiBase';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageSquare, Bell, FileText, DollarSign, Calendar, 
  BookOpen, Award, AlertCircle, CheckCircle, Clock, Search,
  ChevronRight, ChevronDown, User, Phone, Mail, MapPin,
  TrendingUp, TrendingDown, MinusCircle, PlusCircle, Send,
  Settings, LogOut, Eye, EyeOff, Download, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

// Types
interface ParentChild {
  connection: {
    id: number;
    connection_id: string;
    relationship: string;
    permissions: {
      view_marks: boolean;
      view_attendance: boolean;
      view_discipline: boolean;
      view_report_cards: boolean;
      view_fees: boolean;
      receive_notifications: boolean;
    };
  };
  student: {
    sheet_id: number;
    student_number: string;
    student_code: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    full_name: string;
    trade: string;
    level: number;
    profile_image?: string;
    gender: string;
    date_of_birth: string;
  };
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
  };
  recent_marks: any[];
  discipline: {
    total_incidents: number;
    critical_incidents: number;
  };
  payments: {
    total_paid: number;
    payment_count: number;
  };
}

interface ParentData {
  id: number;
  name: string;
  phone: string;
  email: string;
  children_count: number;
}

interface Message {
  id: number;
  subject: string;
  message_body: string;
  sent_at: string;
  urgency: string;
  category: string;
  status: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  urgency: string;
}

// Utility functions
const formatCurrency = (amount: number) => new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);
const formatDate = (date: string) => new Date(date).toLocaleDateString('rw-RW');
const formatDateTime = (date: string) => new Date(date).toLocaleString('rw-RW');

const ParentPortalUltraAdvanced: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [parentPhone, setParentPhone] = useState('');
  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // UI State
  const [showLogin, setShowLogin] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [expandedChild, setExpandedChild] = useState<number | null>(null);
  
  // Forms
  const [linkingRequest, setLinkingRequest] = useState({
    student_name: '',
    student_trade: '',
    student_level: '',
    relationship: 'father',
    message: ''
  });
  const [newMessage, setNewMessage] = useState({
    subject: '',
    body: '',
    category: 'general',
    urgency: 'normal'
  });
  
  // Login
  const [loginPhone, setLoginPhone] = useState('');

  useEffect(() => {
    // Check for saved session
    const savedPhone = localStorage.getItem('parentPhone');
    if (savedPhone) {
      setParentPhone(savedPhone);
      setShowLogin(false);
      loadParentData(savedPhone);
    }
  }, []);

  const loadParentData = async (phone: string) => {
    setLoading(true);
    try {
      // Load parent dashboard
      const dashboardRes = await fetch(`${API_BASE_URL}/parent-linking/parent-dashboard/${phone}`);
      const dashboardData = await dashboardRes.json();
      
      if (dashboardData.success) {
        setParentData(dashboardData.parent);
        setChildren(dashboardData.children);
        if (dashboardData.children.length > 0) {
          setSelectedChild(dashboardData.children[0]);
        }
      }
      
      // Load messages
      const messagesRes = await fetch(`${API_BASE_URL}/parent-linking/messages/${phone}`);
      const messagesData = await messagesRes.json();
      if (messagesData.success) setMessages(messagesData.messages);
      
      // Load notifications
      const notifRes = await fetch(`${API_BASE_URL}/parent-linking/notifications/${phone}`);
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.notifications);
        setUnreadCount(notifData.unread_count);
      }
    } catch (error) {
      console.error('Error loading parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginPhone) return;
    localStorage.setItem('parentPhone', loginPhone);
    setParentPhone(loginPhone);
    setShowLogin(false);
    loadParentData(loginPhone);
  };

  const handleLogout = () => {
    localStorage.removeItem('parentPhone');
    setParentPhone('');
    setShowLogin(true);
    setParentData(null);
    setChildren([]);
    setSelectedChild(null);
  };

  const submitLinkingRequest = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/parent-linking/request-linking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_name: parentData?.name,
          parent_phone: parentPhone,
          parent_email: parentData?.email,
          parent_id: parentData?.id,
          student_first_name: linkingRequest.student_name.split(' ')[0],
          student_last_name: linkingRequest.student_name.split(' ').slice(1).join(' ') || '',
          student_trade: linkingRequest.student_trade,
          student_level: linkingRequest.student_level,
          relationship: linkingRequest.relationship,
          message: linkingRequest.message
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowRequestModal(false);
        setLinkingRequest({ student_name: '', student_trade: '', student_level: '', relationship: 'father', message: '' });
        alert('Linking request submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const sendMessage = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/parent-linking/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_phone: parentPhone,
          subject: newMessage.subject,
          message_body: newMessage.body,
          category: newMessage.category,
          urgency: newMessage.urgency
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowMessageModal(false);
        setNewMessage({ subject: '', body: '', category: 'general', urgency: 'normal' });
        loadParentData(parentPhone);
        alert('Message sent successfully!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/parent-linking/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const calculateAttendancePercentage = (present: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  // Login Screen
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="border-2 border-purple-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Users className="w-8 h-8" />
                Parent Portal
              </CardTitle>
              <CardDescription className="text-white/90">
                Enter your phone number to access your children's information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="+250788000000" 
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Access Portal
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-bold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Parent Portal</h1>
              <p className="text-sm text-white/80">{parentData?.name} ({parentData?.children_count} children)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/20 relative" onClick={() => setActiveTab('notifications')}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {children.map((child, idx) => {
            const attendancePercent = calculateAttendancePercentage(child.attendance.present_days, child.attendance.total_days);
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedChild?.student.sheet_id === child.student.sheet_id ? 'border-purple-500 bg-white shadow-lg' : 'border-purple-200 bg-white/80 hover:shadow-md'}`}
                onClick={() => { setSelectedChild(child); setExpandedChild(expandedChild === child.student.sheet_id ? null : child.student.sheet_id); }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={child.student.profile_image} />
                    <AvatarFallback className="bg-purple-100 text-purple-600">{child.student.first_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 truncate">{child.student.full_name}</p>
                    <p className="text-xs text-gray-500">{child.student.trade} - Level {child.student.level}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Attendance</span>
                    <span className={attendancePercent >= 90 ? 'text-green-600' : attendancePercent >= 70 ? 'text-yellow-600' : 'text-red-600'}>{attendancePercent}%</span>
                  </div>
                  <Progress value={attendancePercent} className="h-2" />
                </div>
              </motion.div>
            );
          })}
          
          {/* Add Child Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: children.length * 0.1 }}
            className="p-4 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 cursor-pointer hover:bg-purple-100 flex flex-col items-center justify-center gap-2"
            onClick={() => setShowRequestModal(true)}
          >
            <PlusCircle className="w-8 h-8 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">Add Child</span>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selected Child Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedChild ? (
              <AnimatePresence mode="wait">
                <motion.div key={selectedChild.student.sheet_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="border-2 border-purple-200 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={selectedChild.student.profile_image} />
                            <AvatarFallback className="bg-purple-200 text-purple-700 text-xl">{selectedChild.student.first_name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl">{selectedChild.student.full_name}</CardTitle>
                            <CardDescription>{selectedChild.student.student_code}</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-purple-500">{selectedChild.connection.relationship}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-4 bg-purple-100">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="attendance">Attendance</TabsTrigger>
                          <TabsTrigger value="marks">Marks</TabsTrigger>
                          <TabsTrigger value="fees">Fees</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                              <p className="text-sm text-green-600">Present Days</p>
                              <p className="text-2xl font-bold text-green-700">{selectedChild.attendance.present_days}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                              <p className="text-sm text-red-600">Absent Days</p>
                              <p className="text-2xl font-bold text-red-700">{selectedChild.attendance.absent_days}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                              <p className="text-sm text-orange-600">Late Days</p>
                              <p className="text-2xl font-bold text-orange-700">{selectedChild.attendance.late_days}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                              <p className="text-sm text-purple-600">Incidents</p>
                              <p className="text-2xl font-bold text-purple-700">{selectedChild.discipline.total_incidents}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="font-bold text-gray-900">Recent Marks</h3>
                            {selectedChild.recent_marks.length > 0 ? (
                              <div className="space-y-2">
                                {selectedChild.recent_marks.slice(0, 5).map((mark: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                    <div>
                                      <p className="font-medium">{mark.subject || 'Subject'}</p>
                                      <p className="text-xs text-gray-500">{new Date(mark.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <Badge className={mark.marks >= 70 ? 'bg-green-100 text-green-700' : mark.marks >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                                      {mark.marks}%
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">No marks available</p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="attendance" className="mt-4">
                          <Card className="border-0 bg-gray-50">
                            <CardContent className="p-6">
                              <div className="text-center mb-6">
                                <div className="relative w-40 h-40 mx-auto">
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="#10b981" strokeWidth="20"
                                      strokeDasharray={`${calculateAttendancePercentage(selectedChild.attendance.present_days, selectedChild.attendance.total_days) * 4.4} 440`}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div>
                                      <p className="text-3xl font-bold text-gray-900">{calculateAttendancePercentage(selectedChild.attendance.present_days, selectedChild.attendance.total_days)}%</p>
                                      <p className="text-sm text-gray-500">Present</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-600">{selectedChild.attendance.present_days}</p>
                                  <p className="text-sm text-gray-500">Present</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-red-600">{selectedChild.attendance.absent_days}</p>
                                  <p className="text-sm text-gray-500">Absent</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-orange-600">{selectedChild.attendance.late_days}</p>
                                  <p className="text-sm text-gray-500">Late</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="marks" className="mt-4">
                          {selectedChild.recent_marks.length > 0 ? (
                            <div className="space-y-3">
                              {selectedChild.recent_marks.map((mark: any, idx: number) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                  className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 shadow-sm"
                                >
                                  <div>
                                    <p className="font-medium text-gray-900">{mark.subject || 'Subject'}</p>
                                    <p className="text-sm text-gray-500">{mark.class_name || 'Class'} • {new Date(mark.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold">{mark.marks}%</p>
                                    <Progress value={mark.marks} className="w-24 h-2 mt-1" />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No marks available yet</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="fees" className="mt-4">
                          <Card className="border-0 bg-gray-50">
                            <CardContent className="p-6">
                              <div className="text-center mb-6">
                                <p className="text-sm text-gray-500">Total Paid</p>
                                <p className="text-4xl font-bold text-green-600">{formatCurrency(selectedChild.payments.total_paid || 0)}</p>
                                <p className="text-sm text-gray-500">{selectedChild.payments.payment_count} payments</p>
                              </div>
                              <Button className="w-full bg-green-600 hover:bg-green-700">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Make Payment
                              </Button>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            ) : (
              <Card className="border-2 border-gray-200">
                <CardContent className="p-12 text-center text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl">Select a child to view details</p>
                  <Button onClick={() => setShowRequestModal(true)} className="mt-4 bg-purple-600">
                    Request to Link New Child
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Messages & Notifications */}
          <div className="space-y-6">
            {/* Messages */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Messages
                  </CardTitle>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowMessageModal(true)}>
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  {messages.length > 0 ? (
                    <div className="divide-y">
                      {messages.slice(0, 10).map((msg, idx) => (
                        <div key={idx} className="p-4 hover:bg-blue-50 cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{msg.subject}</p>
                              <p className="text-sm text-gray-500 line-clamp-2">{msg.message_body}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatDateTime(msg.sent_at)}</p>
                            </div>
                            {msg.urgency === 'urgent' && <Badge className="bg-red-500 ml-2">Urgent</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No messages</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  {notifications.length > 0 ? (
                    <div className="divide-y">
                      {notifications.slice(0, 10).map((notif, idx) => (
                        <div key={idx} className={`p-4 cursor-pointer ${notif.is_read ? 'bg-white' : 'bg-orange-50'}`} onClick={() => markNotificationRead(notif.id)}>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notif.is_read ? 'bg-gray-300' : 'bg-orange-500'}`} />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{notif.title}</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(notif.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowMessageModal(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message to School
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowRequestModal(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Link New Student
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Report Card
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Request Linking Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request to Link New Student</DialogTitle>
            <DialogDescription>Submit a request to connect with a student's account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student Full Name</Label>
              <Input value={linkingRequest.student_name} onChange={(e) => setLinkingRequest({...linkingRequest, student_name: e.target.value})} placeholder="Enter student's name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Trade/Program</Label>
                <Select value={linkingRequest.student_trade} onValueChange={(v) => setLinkingRequest({...linkingRequest, student_trade: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Education">General Education</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value=" carpentry">Carpentry</SelectItem>
                    <SelectItem value="Masonry">Masonry</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Hotel Management">Hotel Management</SelectItem>
                    <SelectItem value="Food Production">Food Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select value={linkingRequest.student_level} onValueChange={(v) => setLinkingRequest({...linkingRequest, student_level: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Your Relationship</Label>
              <Select value={linkingRequest.relationship} onValueChange={(v) => setLinkingRequest({...linkingRequest, relationship: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Additional Message (Optional)</Label>
              <Textarea value={linkingRequest.message} onChange={(e) => setLinkingRequest({...linkingRequest, message: e.target.value})} placeholder="Any additional information..." />
            </div>
            <Button onClick={submitLinkingRequest} className="w-full bg-purple-600">Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to School</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={newMessage.category} onValueChange={(v) => setNewMessage({...newMessage, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="fees">Fees</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="discipline">Discipline</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Urgency</Label>
              <Select value={newMessage.urgency} onValueChange={(v) => setNewMessage({...newMessage, urgency: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={newMessage.subject} onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})} placeholder="Message subject" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={newMessage.body} onChange={(e) => setNewMessage({...newMessage, body: e.target.value})} placeholder="Your message..." rows={4} />
            </div>
            <Button onClick={sendMessage} className="w-full bg-blue-600">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentPortalUltraAdvanced;

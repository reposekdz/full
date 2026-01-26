import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, GraduationCap, DollarSign, Settings, MessageSquare, Bell, BarChart3,
  FileText, Calendar, Award, BookOpen, TrendingUp, Activity, Target, Shield,
  Database, Zap, Clock, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2,
  Save, X, Eye, Download, Upload, RefreshCw, Send, Mail, Phone, Search, Filter,
  Home, School, UserCheck, Clipboard, PieChart, LineChart, Package, Truck,
  Briefcase, Heart, Star, ThumbsUp, MessageCircle, Share2, Printer, Lock,
  Unlock, AlertTriangle, Info, ChevronRight, ChevronLeft, MoreVertical, Copy,
  Archive, Power, PlayCircle, StopCircle, Wifi, WifiOff, Globe, MapPin
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
import { Switch } from '@/app/components/ui/switch';

const API_BASE = 'http://localhost:5000/api';

interface DashboardStats {
  total_students: number;
  total_staff: number;
  total_parents: number;
  total_classes: number;
  active_assignments: number;
  pending_fees: number;
  attendance_rate: number;
  system_health: number;
  messages_sent_today: number;
  notifications_sent_today: number;
}

interface SystemUser {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
}

interface NotificationTemplate {
  id: number;
  event_type: string;
  category: string;
  title_template: string;
  message_template: string;
  sms_template?: string;
  target_audience: string;
  priority: string;
  send_sms: boolean;
  send_email: boolean;
  is_active: boolean;
}

const ComprehensiveAdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_students: 0,
    total_staff: 0,
    total_parents: 0,
    total_classes: 0,
    active_assignments: 0,
    pending_fees: 0,
    attendance_rate: 0,
    system_health: 100,
    messages_sent_today: 0,
    notifications_sent_today: 0
  });

  const [users, setUsers] = useState<SystemUser[]>([]);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [messagingStats, setMessagingStats] = useState<any>({});
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student',
    is_active: true
  });

  const [templateForm, setTemplateForm] = useState({
    event_type: '',
    category: '',
    title_template: '',
    message_template: '',
    sms_template: '',
    target_audience: 'parent',
    priority: 'normal',
    send_sms: false,
    send_email: false
  });

  const [messageForm, setMessageForm] = useState({
    recipient_type: 'all_parents',
    class_id: '',
    subject: '',
    message: '',
    priority: 'normal',
    send_sms: false
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [statsRes, usersRes, templatesRes, messagingRes, logsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/admin/dashboard-stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/users?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/automated-notifications/templates`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/comprehensive-messaging/staff/message-stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/automated-notifications/logs?limit=50`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/activity-logs?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [stats, usersData, templates, messaging, logs, activity] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        templatesRes.json(),
        messagingRes.json(),
        logsRes.json(),
        activityRes.json()
      ]);

      if (stats.success) {
        setDashboardStats(stats.data || {
          total_students: 0,
          total_staff: 0,
          total_parents: 0,
          total_classes: 0,
          active_assignments: 0,
          pending_fees: 0,
          attendance_rate: 0,
          system_health: 100,
          messages_sent_today: 0,
          notifications_sent_today: 0
        });
      }

      if (usersData.success) {
        setUsers(usersData.data || usersData.users || []);
      }

      if (templates.success) {
        setNotificationTemplates(templates.data || []);
      }

      if (messaging.success) {
        setMessagingStats(messaging.data || {});
      }

      if (logs.success) {
        setNotificationLogs(logs.data || []);
      }

      if (activity.success) {
        setActivityLogs(activity.data || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      });

      const data = await response.json();

      if (data.success) {
        setShowUserDialog(false);
        setUserForm({
          username: '',
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'student',
          is_active: true
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleCreateTemplate = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE}/automated-notifications/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(templateForm)
      });

      const data = await response.json();

      if (data.success) {
        setShowTemplateDialog(false);
        setTemplateForm({
          event_type: '',
          category: '',
          title_template: '',
          message_template: '',
          sms_template: '',
          target_audience: 'parent',
          priority: 'normal',
          send_sms: false,
          send_email: false
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleSendMessage = async () => {
    const token = localStorage.getItem('token');
    let endpoint = '';

    if (messageForm.recipient_type === 'all_parents') {
      endpoint = `${API_BASE}/comprehensive-messaging/staff/send-to-all-parents`;
    } else if (messageForm.recipient_type === 'class') {
      endpoint = `${API_BASE}/comprehensive-messaging/staff/send-to-class`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...messageForm,
          category: 'admin_communication'
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowMessageDialog(false);
        setMessageForm({
          recipient_type: 'all_parents',
          class_id: '',
          subject: '',
          message: '',
          priority: 'normal',
          send_sms: false
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin portal...</p>
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
              <h1 className="text-3xl font-bold mb-2">Admin Management Portal</h1>
              <p className="text-green-100">Complete system control and monitoring</p>
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
              <Button
                onClick={() => setShowMessageDialog(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Badge className="bg-white/20 px-4 py-2">
                <Activity className="w-4 h-4 mr-2" />
                System Health: {dashboardStats.system_health}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Students</p>
                  <h3 className="text-3xl font-bold text-green-700">{dashboardStats.total_students}</h3>
                </div>
                <Users className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Staff</p>
                  <h3 className="text-3xl font-bold text-yellow-700">{dashboardStats.total_staff}</h3>
                </div>
                <UserCheck className="w-12 h-12 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Parents</p>
                  <h3 className="text-3xl font-bold text-emerald-700">{dashboardStats.total_parents}</h3>
                </div>
                <Heart className="w-12 h-12 text-emerald-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Classes</p>
                  <h3 className="text-3xl font-bold text-green-700">{dashboardStats.total_classes}</h3>
                </div>
                <School className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Attendance</p>
                  <h3 className="text-3xl font-bold text-yellow-700">{dashboardStats.attendance_rate}%</h3>
                </div>
                <CheckCircle className="w-12 h-12 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="messaging">Messaging System</TabsTrigger>
            <TabsTrigger value="notifications">Auto Notifications</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Today's Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Messages Sent</p>
                        <h4 className="text-2xl font-bold text-green-700">{dashboardStats.messages_sent_today}</h4>
                      </div>
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Notifications Sent</p>
                        <h4 className="text-2xl font-bold text-yellow-700">{dashboardStats.notifications_sent_today}</h4>
                      </div>
                      <Bell className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Pending Fees</p>
                        <h4 className="text-2xl font-bold text-yellow-700">RWF {dashboardStats.pending_fees?.toLocaleString()}</h4>
                      </div>
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Active Assignments</p>
                        <h4 className="text-2xl font-bold text-green-700">{dashboardStats.active_assignments}</h4>
                      </div>
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setShowUserDialog(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 h-auto py-4"
                  >
                    <div className="flex flex-col items-center">
                      <Plus className="w-6 h-6 mb-2" />
                      <span>Add User</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setShowMessageDialog(true)}
                    className="bg-gradient-to-r from-yellow-600 to-amber-600 h-auto py-4"
                  >
                    <div className="flex flex-col items-center">
                      <Send className="w-6 h-6 mb-2" />
                      <span>Send Message</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setShowTemplateDialog(true)}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 h-auto py-4"
                  >
                    <div className="flex flex-col items-center">
                      <FileText className="w-6 h-6 mb-2" />
                      <span>Add Template</span>
                    </div>
                  </Button>
                  <Button
                    onClick={handleRefresh}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 h-auto py-4"
                  >
                    <div className="flex flex-col items-center">
                      <RefreshCw className="w-6 h-6 mb-2" />
                      <span>Refresh Data</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">System Users ({users.length})</h3>
              <Button
                onClick={() => {
                  setEditingUser(null);
                  setShowUserDialog(true);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      <tr>
                        <th className="text-left p-3">Username</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-center p-3">Role</th>
                        <th className="text-center p-3">Status</th>
                        <th className="text-center p-3">Last Login</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="p-3 font-semibold">{user.username}</td>
                          <td className="p-3">{user.first_name} {user.last_name}</td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3 text-center">
                            <Badge className="bg-green-100 text-green-800 capitalize">{user.role}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center text-sm">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                              >
                                {user.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messaging" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Messaging Statistics
                  </span>
                  <Button
                    onClick={() => setShowMessageDialog(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Total Sent</p>
                    <h4 className="text-3xl font-bold text-green-700">{messagingStats.total_sent || 0}</h4>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Urgent Messages</p>
                    <h4 className="text-3xl font-bold text-yellow-700">{messagingStats.urgent_messages || 0}</h4>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Replies Received</p>
                    <h4 className="text-3xl font-bold text-emerald-700">{messagingStats.replies_received || 0}</h4>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Automated Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {notificationLogs.slice(0, 10).map((log, idx) => (
                    <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold capitalize">{log.event_type?.replace(/_/g, ' ')}</h4>
                        <Badge className="bg-green-100 text-green-800">
                          {log.recipients_count} recipients
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {log.sms_sent} SMS sent
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Notification Templates ({notificationTemplates.length})</h3>
              <Button
                onClick={() => {
                  setEditingTemplate(null);
                  setShowTemplateDialog(true);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notificationTemplates.map(template => (
                <Card key={template.id}>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base capitalize">
                        {template.event_type.replace(/_/g, ' ')}
                      </CardTitle>
                      <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Title Template:</p>
                        <p className="text-sm">{template.title_template}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Message Template:</p>
                        <p className="text-sm line-clamp-2">{template.message_template}</p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800 capitalize">
                            {template.target_audience}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800">
                            {template.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {template.send_sms && <Phone className="w-4 h-4 text-green-600" />}
                          {template.send_email && <Mail className="w-4 h-4 text-blue-600" />}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  System Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
                    <h4 className="text-2xl font-bold text-green-700">+12.5%</h4>
                    <p className="text-xs text-gray-500 mt-1">vs last month</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
                    <Activity className="w-8 h-8 text-yellow-600 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Daily Active Users</p>
                    <h4 className="text-2xl font-bold text-yellow-700">1,234</h4>
                    <p className="text-xs text-gray-500 mt-1">avg this week</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                    <Target className="w-8 h-8 text-emerald-600 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">System Uptime</p>
                    <h4 className="text-2xl font-bold text-emerald-700">99.9%</h4>
                    <p className="text-xs text-gray-500 mt-1">last 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Send SMS for important updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send email notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Automated Reminders</p>
                      <p className="text-sm text-gray-600">Automatic fee and assignment reminders</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Restrict access for maintenance</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {activityLogs.slice(0, 20).map((log, idx) => (
                    <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold capitalize">{log.action?.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-gray-600">{log.entity_type} - {log.details}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={userForm.first_name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={userForm.last_name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={userForm.username}
                onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={userForm.role}
                onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Notification Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Type</Label>
                <Input
                  value={templateForm.event_type}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, event_type: e.target.value }))}
                  placeholder="e.g., student_absent"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., attendance"
                />
              </div>
            </div>
            <div>
              <Label>Title Template</Label>
              <Input
                value={templateForm.title_template}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, title_template: e.target.value }))}
                placeholder="Use {{variable}} for placeholders"
              />
            </div>
            <div>
              <Label>Message Template</Label>
              <Textarea
                value={templateForm.message_template}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, message_template: e.target.value }))}
                placeholder="Use {{variable}} for placeholders"
                rows={4}
              />
            </div>
            <div>
              <Label>SMS Template (Optional)</Label>
              <Textarea
                value={templateForm.sms_template}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, sms_template: e.target.value }))}
                placeholder="Short version for SMS (max 160 chars)"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Target Audience</Label>
                <Select
                  value={templateForm.target_audience}
                  onValueChange={(value) => setTemplateForm(prev => ({ ...prev, target_audience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parents</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={templateForm.priority}
                  onValueChange={(value) => setTemplateForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={templateForm.send_sms}
                    onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, send_sms: checked }))}
                  />
                  <Label>Send SMS</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={templateForm.send_email}
                    onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, send_email: checked }))}
                  />
                  <Label>Send Email</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTemplate}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipients</Label>
              <Select
                value={messageForm.recipient_type}
                onValueChange={(value) => setMessageForm(prev => ({ ...prev, recipient_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_parents">All Parents</SelectItem>
                  <SelectItem value="class">Specific Class</SelectItem>
                  <SelectItem value="all_students">All Students</SelectItem>
                  <SelectItem value="all_staff">All Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {messageForm.recipient_type === 'class' && (
              <div>
                <Label>Class</Label>
                <Input
                  value={messageForm.class_id}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, class_id: e.target.value }))}
                  placeholder="Class ID"
                />
              </div>
            )}
            <div>
              <Label>Subject</Label>
              <Input
                value={messageForm.subject}
                onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={messageForm.priority}
                  onValueChange={(value) => setMessageForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  checked={messageForm.send_sms}
                  onCheckedChange={(checked) => setMessageForm(prev => ({ ...prev, send_sms: checked }))}
                />
                <Label>Also send via SMS</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveAdminPortal;

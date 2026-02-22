import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, CreditCard, MessageSquare, Calendar, BookOpen, Award, Bell,
  TrendingUp, DollarSign, Phone, Mail, Eye, RefreshCw, Plus, Search,
  Filter, Download, Settings, Heart, Star, Target, Activity, BarChart3,
  Clock, CheckCircle, AlertTriangle, Zap, Globe, Smartphone, Send,
  FileText, PieChart, LineChart, TrendingDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import productionAPIService from '@/app/services/productionAPIService';
import smsIntegrationHooks from '@/utils/advancedSMSIntegration';
import { smsService } from '@/app/services/advancedSMSService';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface ParentDashboardProps {
  onNavigate: (page: string) => void;
}

interface LinkedChild {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_name: string;
  level_number: number;
  conduct_score: number;
  attendance_percentage: number;
  balance: number;
  total_fees: number;
  paid_fees: number;
  profile_image?: string;
  status: string;
  recent_grades: Grade[];
  recent_payments: Payment[];
  last_login: string;
  gpa: number;
  rank_in_class: number;
  total_students_in_class: number;
  upcoming_exams: Exam[];
  assignments_pending: Assignment[];
}

interface Grade {
  id: number;
  subject: string;
  marks: number;
  max_marks: number;
  percentage: number;
  grade: string;
  term: string;
  date: string;
}

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  reference: string;
  status: string;
  created_at: string;
  description: string;
}

interface Exam {
  id: number;
  subject: string;
  date: string;
  time: string;
  venue: string;
  type: string;
}

interface Assignment {
  id: number;
  subject: string;
  title: string;
  due_date: string;
  status: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  created_at: string;
  read: boolean;
  student_id?: number;
}

const EnhancedParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'mobile_money',
    phone_number: '',
    description: ''
  });
  
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  
  // Real-time updates
  useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await productionAPIService.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const [stats, setStats] = useState({
    totalChildren: 0,
    totalBalance: 0,
    avgAttendance: 0,
    avgConduct: 0,
    unreadNotifications: 0,
    totalPaidThisMonth: 0,
    avgGPA: 0,
    upcomingExams: 0,
    pendingAssignments: 0,
    monthlyTrend: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [childrenRes, notificationsRes, statsRes, analyticsRes, realTimeRes] = await Promise.all([
        productionAPIService.getLinkedChildren(),
        productionAPIService.getNotifications(1, 50),
        productionAPIService.getDashboardStats(),
        productionAPIService.getParentAnalytics(),
        productionAPIService.request('/parent/real-time-data')
      ]);

      if (childrenRes.success) {
        const enrichedChildren = await Promise.all(
          (childrenRes.data || []).map(async (child: any) => {
            const [gradesRes, paymentsRes, examsRes, assignmentsRes] = await Promise.all([
              productionAPIService.getChildGrades(child.id),
              productionAPIService.getChildPayments(child.id),
              productionAPIService.request(`/students/${child.id}/upcoming-exams`),
              productionAPIService.request(`/students/${child.id}/pending-assignments`)
            ]);
            
            return {
              ...child,
              recent_grades: gradesRes.data || [],
              recent_payments: paymentsRes.data || [],
              upcoming_exams: examsRes.data || [],
              assignments_pending: assignmentsRes.data || []
            };
          })
        );
        setLinkedChildren(enrichedChildren);
      }
      
      if (notificationsRes.success) setNotifications(notificationsRes.data || []);
      if (statsRes.success) setStats({...stats, ...statsRes.data});
      if (analyticsRes.success) {
        console.log('Advanced analytics:', analyticsRes.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedChild) return;

    try {
      const response = await productionAPIService.initiatePayment({
        student_id: selectedChild.id,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method,
        phone_number: paymentData.phone_number,
        description: paymentData.description,
        auto_sms_notification: true,
        real_time_tracking: true,
        callback_url: `${window.location.origin}/payment-callback`,
        metadata: {
          parent_dashboard: true,
          child_name: `${selectedChild.first_name} ${selectedChild.last_name}`,
          timestamp: new Date().toISOString()
        }
      });

      if (response.success) {
        // Send immediate SMS confirmation
        await smsIntegrationHooks.onPaymentReceived({
          student_id: selectedChild.id,
          student_name: `${selectedChild.first_name} ${selectedChild.last_name}`,
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          reference: response.data.reference,
          remaining_balance: response.data.remaining_balance,
          receipt_url: response.data.receipt_url
        });
        
        toast.success('Payment initiated with SMS confirmation');
        setShowPaymentDialog(false);
        setSelectedChild(null);
        await fetchDashboardData();
      } else {
        toast.error(response.message || 'Payment failed');
      }
    } catch (error) {
      toast.error('Payment processing error');
    }
  };

  const handleSendMessage = async (studentId: number) => {
    try {
      const student = linkedChildren.find(c => c.id === studentId);
      if (!student) return;
      
      await smsIntegrationHooks.sendCustomMessage({
        recipients: 'parent_phone',
        message: `Mwiriwe! Ubutumwa bwihuse bujyanye n'umwana wanyu ${student.first_name} ${student.last_name}.`,
        message_type: 'individual',
        priority: 'normal',
        category: 'communication',
        tags: ['parent_message', 'dashboard'],
        student_id: studentId,
        delivery_tracking: true,
        read_receipts: true
      });
      
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleBulkPayment = async () => {
    try {
      const response = await productionAPIService.bulkInitiatePayments({
        student_ids: selectedStudents,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method,
        phone_number: paymentData.phone_number,
        auto_sms_confirmation: true,
        real_time_tracking: true,
        batch_processing: true,
        callback_url: `${window.location.origin}/bulk-payment-callback`
      });
      
      if (response.success) {
        // Send bulk SMS confirmations with individual details
        for (const payment of response.data.payments) {
          await smsIntegrationHooks.onPaymentReceived({
            student_id: payment.student_id,
            student_name: payment.student_name,
            amount: payment.amount,
            payment_method: payment.payment_method,
            reference: payment.reference,
            remaining_balance: payment.remaining_balance,
            receipt_url: payment.receipt_url
          });
        }
        
        toast.success(`Bulk payment initiated for ${selectedStudents.length} students with SMS confirmations`);
        setSelectedStudents([]);
        await fetchDashboardData();
      }
    } catch (error) {
      toast.error('Bulk payment failed');
    }
  };

  const exportReports = async () => {
    try {
      const response = await productionAPIService.generateReport({
        type: 'parent_comprehensive',
        student_ids: linkedChildren.map(c => c.id),
        report_sections: [
          'academic_performance',
          'attendance_analysis', 
          'payment_history',
          'conduct_tracking',
          'sms_communications',
          'performance_analytics',
          'trend_analysis'
        ],
        format: 'pdf',
        include_charts: true,
        real_time_data: true,
        custom_branding: true
      });
      
      if (response.success) {
        // Send SMS with download link
        await smsIntegrationHooks.sendCustomMessage({
          recipients: 'current_parent_phone',
          message: `Mwiriwe! Raporo y'abana banyu yateguwe neza. Mukurura: ${response.data.download_url}. Ifite amakuru yose y'amashuri. Murakoze! - Garden TVET School`,
          message_type: 'automated',
          priority: 'normal',
          category: 'reports',
          tags: ['comprehensive_report', 'download_ready'],
          delivery_tracking: true
        });
        
        // Auto-download
        const link = document.createElement('a');
        link.href = response.data.download_url;
        link.download = `Comprehensive_Parent_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        
        toast.success('Comprehensive report generated and SMS notification sent');
      }
    } catch (error) {
      toast.error('Report generation failed');
    }
  };

  const getConductGrade = (score: number) => {
    if (score >= 36) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 32) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 28) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 24) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Award className="w-5 h-5 text-green-600" />;
      case 'warning': return <Bell className="w-5 h-5 text-yellow-600" />;
      case 'error': return <TrendingUp className="w-5 h-5 text-red-600" />;
      default: return <MessageSquare className="w-5 h-5 text-blue-600" />;
    }
  };

  const filteredChildren = linkedChildren.filter(child =>
    `${child.first_name} ${child.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.student_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Parent Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Monitor your children's academic progress and school activities</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={fetchDashboardData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={() => onNavigate('parent-register')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Link Child
            </Button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Linked Children</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalChildren}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Active: {linkedChildren.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalBalance.toLocaleString()} RWF</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Paid: {stats.totalPaidThisMonth.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold text-green-600">{stats.avgAttendance}%</p>
                  <p className="text-xs text-gray-600 flex items-center mt-1">
                    {stats.monthlyTrend > 0 ? <ArrowUp className="w-3 h-3 mr-1 text-green-600" /> : <ArrowDown className="w-3 h-3 mr-1 text-red-600" />}
                    {Math.abs(stats.monthlyTrend)}% this month
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average GPA</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgGPA.toFixed(1)}</p>
                  <p className="text-xs text-gray-600 flex items-center mt-1">
                    <Star className="w-3 h-3 mr-1" />
                    Out of 4.0
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unreadNotifications}</p>
                  <p className="text-xs text-gray-600 flex items-center mt-1">
                    <Bell className="w-3 h-3 mr-1" />
                    {stats.upcomingExams} exams soon
                  </p>
                </div>
                <Bell className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search children by name or student code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={exportReports} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Reports
                </Button>
                <Button onClick={() => setShowBulkActions(!showBulkActions)} variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
                <Button 
                  onClick={() => setRealTimeUpdates(!realTimeUpdates)} 
                  variant={realTimeUpdates ? "default" : "outline"} 
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {realTimeUpdates ? 'Live' : 'Manual'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Children Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">My Children ({filteredChildren.length})</h2>
            
            {filteredChildren.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Children Linked</h3>
                  <p className="text-gray-500 mb-4">Link your children to monitor their academic progress</p>
                  <Button onClick={() => onNavigate('parent-register')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Link Child
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredChildren.map((child) => {
                  const conductGrade = getConductGrade(child.conduct_score);
                  return (
                    <Card key={child.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          {/* Enhanced Child Info */}
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="w-16 h-16 ring-2 ring-blue-200">
                              <AvatarImage src={child.profile_image} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold">
                                {child.first_name[0]}{child.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{child.first_name} {child.last_name}</h3>
                              <p className="text-gray-600">{child.trade_name} - Level {child.level_number}</p>
                              <p className="text-sm text-gray-500">Code: {child.student_code}</p>
                              
                              <div className="flex items-center gap-4 mt-2">
                                <Badge className={`${conductGrade.bg} ${conductGrade.color}`}>
                                  Conduct: {child.conduct_score}/40
                                </Badge>
                                <Badge variant="secondary">
                                  {child.status}
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-800">
                                  Rank: {child.rank_in_class}/{child.total_students_in_class}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 text-center">
                            <div>
                              <p className={`text-lg font-bold ${getAttendanceColor(child.attendance_percentage)}`}>
                                {child.attendance_percentage}%
                              </p>
                              <p className="text-xs text-gray-500">Attendance</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-purple-600">
                                {child.gpa.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-500">GPA</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-orange-600">
                                {child.balance.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">Balance (RWF)</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-red-600">
                                {child.assignments_pending.length}
                              </p>
                              <p className="text-xs text-gray-500">Pending</p>
                            </div>
                          </div>

                          {/* Enhanced Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => onNavigate(`parent-child/${child.id}`)}
                              size="sm"
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            
                            <Button
                              onClick={() => {
                                setSelectedChild(child);
                                setShowPaymentDialog(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="w-full border-green-500 text-green-600 hover:bg-green-50"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay Fees
                            </Button>
                            
                            <Button
                              onClick={() => handleSendMessage(child.id)}
                              variant="outline"
                              size="sm"
                              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </div>

                        {/* Enhanced Fee Progress */}
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Fee Payment Progress</span>
                            <span>{((child.paid_fees / child.total_fees) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(child.paid_fees / child.total_fees) * 100} className="h-3" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Paid: {child.paid_fees.toLocaleString()} RWF</span>
                            <span>Total: {child.total_fees.toLocaleString()} RWF</span>
                          </div>
                          
                          {/* Quick Info */}
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <p className="text-xs text-blue-600 font-medium">{child.upcoming_exams.length}</p>
                              <p className="text-xs text-gray-500">Upcoming Exams</p>
                            </div>
                            <div className="text-center p-2 bg-orange-50 rounded">
                              <p className="text-xs text-orange-600 font-medium">{child.assignments_pending.length}</p>
                              <p className="text-xs text-gray-500">Assignments</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <p className="text-xs text-green-600 font-medium">{child.recent_grades.length}</p>
                              <p className="text-xs text-gray-500">Recent Grades</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Sidebar */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Notifications</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Updates & Alerts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                            !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Conduct</span>
                    <span className="font-bold">{stats.avgConduct}/40</span>
                  </div>
                  <Progress value={(stats.avgConduct / 40) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Attendance</span>
                    <span className="font-bold">{stats.avgAttendance}%</span>
                  </div>
                  <Progress value={stats.avgAttendance} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Make Payment for {selectedChild?.first_name} {selectedChild?.last_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Outstanding Balance:</span>
                  <span className="font-bold">{selectedChild?.balance.toLocaleString()} RWF</span>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount (RWF)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={paymentData.payment_method} onValueChange={(value) => setPaymentData({...paymentData, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  placeholder="Enter phone number"
                  value={paymentData.phone_number}
                  onChange={(e) => setPaymentData({...paymentData, phone_number: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Payment description"
                  value={paymentData.description}
                  onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePayment}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EnhancedParentDashboard;
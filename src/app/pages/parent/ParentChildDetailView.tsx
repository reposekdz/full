import React, { useState, useEffect } from 'react';
import {
  User, GraduationCap, Calendar, DollarSign, BookOpen, Award, Phone,
  Mail, MapPin, Clock, TrendingUp, AlertTriangle, CheckCircle, CreditCard,
  Download, Eye, MessageSquare, Bell, Activity, BarChart3, PieChart,
  FileText, Star, Target, Zap, RefreshCw, Send, Heart, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

interface ParentChildDetailProps {
  childId: string;
  onNavigate: (page: string) => void;
}

interface ChildData {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  trade_code: string;
  trade_name: string;
  level_number: number;
  conduct_score: number;
  attendance_percentage: number;
  total_fees: number;
  paid_fees: number;
  balance: number;
  profile_image?: string;
  enrollment_date: string;
  status: string;
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

interface Attendance {
  date: string;
  status: 'present' | 'absent' | 'late';
  reason?: string;
}

const ParentChildDetailView: React.FC<ParentChildDetailProps> = ({ childId, onNavigate }) => {
  const [child, setChild] = useState<ChildData | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'mobile_money',
    phone_number: '',
    description: 'School fees payment'
  });

  const [messageData, setMessageData] = useState({
    recipient_type: 'teacher',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const fetchChildData = async () => {
    setLoading(true);
    try {
      const [childRes, gradesRes, paymentsRes, attendanceRes] = await Promise.all([
        apiService.request(`/parent/children/${childId}`),
        apiService.request(`/parent/children/${childId}/grades`),
        apiService.request(`/parent/children/${childId}/payments`),
        apiService.request(`/parent/children/${childId}/attendance`)
      ]);

      if (childRes.success) setChild(childRes.child);
      if (gradesRes.success) setGrades(gradesRes.grades || []);
      if (paymentsRes.success) setPayments(paymentsRes.payments || []);
      if (attendanceRes.success) setAttendance(attendanceRes.attendance || []);
    } catch (error) {
      console.error('Error fetching child data:', error);
      toast.error('Failed to load child information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await apiService.request('/parent/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({
          student_id: childId,
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          phone_number: paymentData.phone_number,
          description: paymentData.description
        })
      });

      if (response.success) {
        toast.success('Payment initiated successfully');
        setShowPaymentDialog(false);
        setPaymentData({
          amount: '',
          payment_method: 'mobile_money',
          phone_number: '',
          description: 'School fees payment'
        });
        await fetchChildData();
      } else {
        toast.error(response.message || 'Payment failed');
      }
    } catch (error) {
      toast.error('Payment processing error');
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await apiService.request('/parent/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          student_id: childId,
          recipient_type: messageData.recipient_type,
          subject: messageData.subject,
          message: messageData.message
        })
      });

      if (response.success) {
        toast.success('Message sent successfully');
        setShowMessageDialog(false);
        setMessageData({
          recipient_type: 'teacher',
          subject: '',
          message: ''
        });
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Error sending message');
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

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading child information...</span>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Child Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load child information</p>
          <Button onClick={() => onNavigate('dashboard-parent')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const conductGrade = getConductGrade(child.conduct_score);
  const averageGrade = grades.length > 0 ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => onNavigate('dashboard-parent')}>
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {child.first_name} {child.last_name}
              </h1>
              <p className="text-gray-600">{child.trade_name} - Level {child.level_number}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make Payment
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Student Profile Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={child.profile_image} />
                <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                  {child.first_name[0]}{child.last_name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">{child.first_name} {child.last_name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Code: {child.student_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>{child.trade_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Level {child.level_number}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge className={`${conductGrade.bg} ${conductGrade.color} px-3 py-1`}>
                  Conduct: {child.conduct_score}/40 ({conductGrade.grade})
                </Badge>
                <Badge className="bg-white text-blue-600 px-3 py-1">
                  {child.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Academic Average</p>
                  <p className="text-2xl font-bold text-blue-600">{averageGrade.toFixed(1)}%</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attendance</p>
                  <p className={`text-2xl font-bold ${getAttendanceColor(child.attendance_percentage)}`}>
                    {child.attendance_percentage}%
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fees Balance</p>
                  <p className="text-2xl font-bold text-orange-600">{child.balance.toLocaleString()} RWF</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conduct Score</p>
                  <p className={`text-2xl font-bold ${conductGrade.color}`}>{child.conduct_score}/40</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="conduct">Conduct</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Academic Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Academic Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {grades.slice(0, 5).map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{grade.subject}</p>
                          <p className="text-sm text-gray-500">{grade.term}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{grade.percentage}%</p>
                          <Badge variant="secondary">{grade.grade}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Recent Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{payment.amount.toLocaleString()} RWF</p>
                          <Badge className={getPaymentStatusBadge(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fee Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{child.total_fees.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Fees</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{child.paid_fees.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Paid Amount</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">{child.balance.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Outstanding Balance</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={(child.paid_fees / child.total_fees) * 100} className="h-3" />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {((child.paid_fees / child.total_fees) * 100).toFixed(1)}% paid
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academics Tab */}
          <TabsContent value="academics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">Subject</th>
                        <th className="px-4 py-3 text-left">Marks</th>
                        <th className="px-4 py-3 text-left">Percentage</th>
                        <th className="px-4 py-3 text-left">Grade</th>
                        <th className="px-4 py-3 text-left">Term</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {grades.map((grade) => (
                        <tr key={grade.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{grade.subject}</td>
                          <td className="px-4 py-3">{grade.marks}/{grade.max_marks}</td>
                          <td className="px-4 py-3">{grade.percentage}%</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">{grade.grade}</Badge>
                          </td>
                          <td className="px-4 py-3">{grade.term}</td>
                          <td className="px-4 py-3">{new Date(grade.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {attendance.slice(0, 35).map((record, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        record.status === 'present' ? 'bg-green-500 text-white' :
                        record.status === 'late' ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}
                      title={`${record.date}: ${record.status}`}
                    >
                      {record.status === 'present' ? '✓' : record.status === 'late' ? 'L' : '✗'}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {attendance.filter(a => a.status === 'present').length}
                    </p>
                    <p className="text-sm text-gray-500">Present</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {attendance.filter(a => a.status === 'late').length}
                    </p>
                    <p className="text-sm text-gray-500">Late</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {attendance.filter(a => a.status === 'absent').length}
                    </p>
                    <p className="text-sm text-gray-500">Absent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Payment History
                  <Button onClick={() => setShowPaymentDialog(true)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Make Payment
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Method</th>
                        <th className="px-4 py-3 text-left">Reference</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{payment.description}</td>
                          <td className="px-4 py-3 font-bold">{payment.amount.toLocaleString()} RWF</td>
                          <td className="px-4 py-3">{payment.payment_method}</td>
                          <td className="px-4 py-3 font-mono text-sm">{payment.reference}</td>
                          <td className="px-4 py-3">
                            <Badge className={getPaymentStatusBadge(payment.status)}>
                              {payment.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conduct Tab */}
          <TabsContent value="conduct" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conduct & Discipline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${conductGrade.bg} ${conductGrade.color}`}>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{child.conduct_score}</p>
                      <p className="text-sm">out of 40</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Grade {conductGrade.grade}</h3>
                    <p className="text-gray-600">
                      {conductGrade.grade === 'A' && 'Excellent conduct'}
                      {conductGrade.grade === 'B' && 'Good conduct'}
                      {conductGrade.grade === 'C' && 'Satisfactory conduct'}
                      {conductGrade.grade === 'D' && 'Needs improvement'}
                      {conductGrade.grade === 'F' && 'Poor conduct - requires attention'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Download Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    Academic Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Calendar className="w-8 h-8 mb-2" />
                    Attendance Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <DollarSign className="w-8 h-8 mb-2" />
                    Payment Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Shield className="w-8 h-8 mb-2" />
                    Conduct Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient_type">Send To</Label>
                <Select value={messageData.recipient_type} onValueChange={(value) => setMessageData({...messageData, recipient_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Class Teacher</SelectItem>
                    <SelectItem value="dos">Director of Studies</SelectItem>
                    <SelectItem value="dod">Director of Discipline</SelectItem>
                    <SelectItem value="headmaster">Headmaster</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Message subject"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({...messageData, subject: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message..."
                  value={messageData.message}
                  onChange={(e) => setMessageData({...messageData, message: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ParentChildDetailView;
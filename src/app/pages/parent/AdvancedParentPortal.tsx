import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  GraduationCap,
  BarChart,
  CheckCircle,
  DollarSign,
  FileText,
  MessageSquare,
  Heart,
  AlertTriangle,
  BookOpen,
  Trophy,
  Bell,
  Loader2,
  CreditCard,
  Send,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';

interface LinkedStudent {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_name: string;
  trade_code: string;
  level_number: number;
  gender: string;
  gpa?: number;
  attendance_percentage?: number;
  balance?: number;
}

interface Grade {
  subject: string;
  score: number;
  grade: string;
  exam_type: string;
  exam_date: string;
}

interface DisciplineRecord {
  id: number;
  incident_type: string;
  description: string;
  action_taken: string;
  date: string;
  status: string;
}

interface DODMessage {
  id: number;
  message: string;
  type: 'leave' | 'conduct' | 'sick' | 'general';
  created_at: string;
  is_read: boolean;
}

interface Payment {
  amount: number;
  description: string;
  payment_method: string;
}

export default function AdvancedParentPortal() {
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [disciplineRecords, setDisciplineRecords] = useState<DisciplineRecord[]>([]);
  const [dodMessages, setDodMessages] = useState<DODMessage[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<Payment>({
    amount: 0,
    description: 'School Fees Payment',
    payment_method: 'momo'
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadParentData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentDetails(selectedStudent.id);
    }
  }, [selectedStudent]);

  const loadParentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:3000/api/parent-dashboard/children', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success && result.children) {
        setLinkedStudents(result.children);
        if (result.children.length > 0) {
          setSelectedStudent(result.children[0]);
        }
      }

      if (user.phone) {
        setPhoneNumber(user.phone);
      }

      loadDODMessages();
    } catch (error) {
      console.error('Error loading parent data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentDetails = async (studentId: number) => {
    try {
      const token = localStorage.getItem('token');

      const [gradesRes, disciplineRes] = await Promise.all([
        fetch(`http://localhost:3000/api/parent-dashboard/student/${studentId}/grades`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:3000/api/parent-dashboard/student/${studentId}/discipline`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const gradesData = await gradesRes.json();
      const disciplineData = await disciplineRes.json();

      if (gradesData.success) setGrades(gradesData.grades || []);
      if (disciplineData.success) setDisciplineRecords(disciplineData.records || []);
    } catch (error) {
      console.error('Error loading student details:', error);
    }
  };

  const loadDODMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/parent-dashboard/dod-messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setDodMessages(result.messages || []);
      }
    } catch (error) {
      console.error('Error loading DOD messages:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    if (!phoneNumber || paymentData.amount <= 0) {
      toast.error('Please enter valid payment details');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          phone_number: phoneNumber,
          description: paymentData.description
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Payment initiated successfully! Check your phone for confirmation.');
        setShowPaymentModal(false);
        loadParentData();
        sendPaymentSMS();
      } else {
        toast.error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const sendPaymentSMS = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/sms/send-payment-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: phoneNumber,
          amount: paymentData.amount,
          student_name: `${selectedStudent?.first_name} ${selectedStudent?.last_name}`
        })
      });
    } catch (error) {
      console.error('SMS error:', error);
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/parent-dashboard/dod-messages/${messageId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadDODMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-400 to-green-500 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-green-500 via-yellow-500 to-green-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Parent Portal
          </h1>
          <div className="flex items-center gap-4">
            <Phone className="w-5 h-5" />
            <span>{phoneNumber}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Student Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-green-600">My Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {linkedStudents.map((student) => (
                <motion.div
                  key={student.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    selectedStudent?.id === student.id
                      ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-8 h-8" />
                    <div>
                      <p className="font-bold">{student.first_name} {student.last_name}</p>
                      <p className="text-sm opacity-90">{student.trade_name} Level {student.level_number}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedStudent && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-green-600">{selectedStudent.gpa || 'N/A'}</p>
                    <p className="text-sm text-gray-600">GPA</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-blue-600">{selectedStudent.attendance_percentage || 0}%</p>
                    <p className="text-sm text-gray-600">Attendance</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-red-600">{selectedStudent.balance || 0} RWF</p>
                    <p className="text-sm text-gray-600">Balance</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Button
                      onClick={() => {
                        setPaymentData({ ...paymentData, amount: selectedStudent.balance || 0 });
                        setShowPaymentModal(true);
                      }}
                      className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Fees
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="grades" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="grades">Grades</TabsTrigger>
                <TabsTrigger value="discipline">Discipline</TabsTrigger>
                <TabsTrigger value="messages">DOD Messages</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
              </TabsList>

              <TabsContent value="grades">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {grades.length > 0 ? (
                        grades.map((grade, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold">{grade.subject}</p>
                              <p className="text-sm text-gray-600">{grade.exam_type} - {grade.exam_date}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={`text-lg ${
                                grade.score >= 70 ? 'bg-green-500' :
                                grade.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}>
                                {grade.score}% - {grade.grade}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500">No grades available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discipline">
                <Card>
                  <CardHeader>
                    <CardTitle>Discipline Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {disciplineRecords.length > 0 ? (
                        disciplineRecords.map((record) => (
                          <div key={record.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                              <div className="flex-1">
                                <p className="font-semibold text-red-800">{record.incident_type}</p>
                                <p className="text-sm text-gray-700 mt-1">{record.description}</p>
                                <p className="text-sm text-gray-600 mt-2">Action: {record.action_taken}</p>
                                <p className="text-xs text-gray-500 mt-1">{record.date}</p>
                              </div>
                              <Badge className={
                                record.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'
                              }>
                                {record.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                          <p className="text-gray-600">No discipline issues - Excellent behavior!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages from DOD (Director of Discipline)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dodMessages.length > 0 ? (
                        dodMessages.map((msg) => (
                          <div
                            key={msg.id}
                            onClick={() => markMessageAsRead(msg.id)}
                            className={`p-4 rounded-lg cursor-pointer ${
                              msg.is_read ? 'bg-gray-50' : 'bg-yellow-50 border-l-4 border-yellow-500'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Bell className={`w-5 h-5 mt-1 ${msg.is_read ? 'text-gray-400' : 'text-yellow-600'}`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={
                                    msg.type === 'leave' ? 'bg-blue-500' :
                                    msg.type === 'conduct' ? 'bg-red-500' :
                                    msg.type === 'sick' ? 'bg-orange-500' : 'bg-gray-500'
                                  }>
                                    {msg.type.toUpperCase()}
                                  </Badge>
                                  {!msg.is_read && <Badge className="bg-green-500">NEW</Badge>}
                                </div>
                                <p className="text-gray-800">{msg.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500">No messages</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-6xl font-bold text-green-600 mb-4">
                        {selectedStudent.attendance_percentage || 0}%
                      </div>
                      <p className="text-gray-600">Overall Attendance Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Pay School Fees</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Input
                value={`${selectedStudent?.first_name} ${selectedStudent?.last_name}`}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label>Amount (RWF)</Label>
              <Input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Phone Number (MTN/Airtel Money)</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="078XXXXXXX"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentData.payment_method} onValueChange={(val) => setPaymentData({ ...paymentData, payment_method: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="momo">MTN Mobile Money</SelectItem>
                  <SelectItem value="airtel">Airtel Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="bg-gradient-to-r from-green-500 to-yellow-500"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {processing ? 'Processing...' : 'Pay Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

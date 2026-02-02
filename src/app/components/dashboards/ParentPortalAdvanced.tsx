import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Award, 
  Calendar,
  DollarSign,
  MessageSquare,
  TrendingUp,
  FileText,
  AlertCircle,
  Upload,
  Download,
  Bell,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import apiService from '../../services/apiService';

export default function ParentPortalAdvanced() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [childAcademic, setChildAcademic] = useState<any>(null);
  const [childAttendance, setChildAttendance] = useState<any[]>([]);
  const [childDiscipline, setChildDiscipline] = useState<any[]>([]);
  const [childFees, setChildFees] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const [paymentProofForm, setPaymentProofForm] = useState({
    student_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    reference_number: '',
    notes: ''
  });

  const [messageForm, setMessageForm] = useState({
    recipient_type: 'teacher',
    recipient_id: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildDetails(selectedChild.student_id);
    }
  }, [selectedChild]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dashboardData = await apiService.getParentDashboard();

      if (dashboardData.success) {
        setDashboard(dashboardData.dashboard);
        if (dashboardData.dashboard.children && dashboardData.dashboard.children.length > 0) {
          setSelectedChild(dashboardData.dashboard.children[0].student);
        }
      }
    } catch (error) {
      console.error('Error fetching parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetails = async (studentId: string) => {
    try {
      const [academicData, attendanceData, disciplineData, feesData] = await Promise.all([
        apiService.getChildAcademicPerformance(studentId, {}),
        apiService.getChildAttendance(studentId, {}),
        apiService.getChildDiscipline(studentId),
        apiService.getChildFees(studentId)
      ]);

      if (academicData.success) setChildAcademic(academicData.performance);
      if (attendanceData.success) setChildAttendance(attendanceData.attendance || []);
      if (disciplineData.success) setChildDiscipline(disciplineData.records || []);
      if (feesData.success) setChildFees(feesData.fees);
    } catch (error) {
      console.error('Error fetching child details:', error);
    }
  };

  const handleSubmitPaymentProof = async () => {
    try {
      const result = await apiService.submitPaymentProof({
        ...paymentProofForm,
        amount: parseFloat(paymentProofForm.amount)
      });

      if (result.success) {
        setShowPaymentProof(false);
        setPaymentProofForm({
          student_id: '',
          amount: '',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: '',
          reference_number: '',
          notes: ''
        });
        if (selectedChild) {
          fetchChildDetails(selectedChild.student_id);
        }
        alert('Payment proof submitted successfully!');
      }
    } catch (error: any) {
      alert('Failed to submit payment proof: ' + error.message);
    }
  };

  const handleSendMessage = async () => {
    try {
      const result = await apiService.sendParentMessage(messageForm);

      if (result.success) {
        setShowMessage(false);
        setMessageForm({
          recipient_type: 'teacher',
          recipient_id: '',
          subject: '',
          message: ''
        });
        alert('Message sent successfully!');
      }
    } catch (error: any) {
      alert('Failed to send message: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const children = dashboard?.children || [];
  const totalFeeBalance = dashboard?.totalFeeBalance || 0;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Portal</h1>
          <p className="text-gray-600">Monitor your children's progress</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPaymentProof(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Submit Payment Proof
          </Button>
          <Button onClick={() => setShowMessage(true)} variant="secondary">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4" />
              Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{children.length}</div>
            <p className="text-xs opacity-90">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Award className="w-4 h-4" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {children.length > 0
                ? Math.round(children.reduce((sum: number, c: any) => 
                    sum + (c.academicStats?.average_marks || 0), 0) / children.length)
                : 0}%
            </div>
            <p className="text-xs opacity-90">Average across all children</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {children.length > 0
                ? Math.round(children.reduce((sum: number, c: any) => 
                    sum + (c.attendanceStats?.attendance_rate || 0), 0) / children.length)
                : 0}%
            </div>
            <p className="text-xs opacity-90">Average attendance</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${totalFeeBalance > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} text-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              Total Fee Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFeeBalance.toLocaleString()} RWF</div>
            <p className="text-xs opacity-90">{totalFeeBalance > 0 ? 'Outstanding' : 'All Paid'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {children.map((child: any) => (
                <div
                  key={child.student.student_id}
                  className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                    selectedChild?.student_id === child.student.student_id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => setSelectedChild(child.student)}
                >
                  <div className="font-medium">
                    {child.student.first_name} {child.student.last_name}
                  </div>
                  <div className="text-sm text-gray-600">{child.student.student_id}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{child.student.trade_name}</Badge>
                    <Badge variant="outline">Level {child.student.level_number}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div>
                      <span className="text-gray-600">Avg:</span> 
                      <span className="font-medium ml-1">{child.academicStats?.average_marks || 0}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Attendance:</span> 
                      <span className="font-medium ml-1">{child.attendanceStats?.attendance_rate || 0}%</span>
                    </div>
                  </div>
                  {child.feeBalance > 0 && (
                    <div className="mt-2 text-xs text-red-600 font-medium">
                      Balance: {child.feeBalance.toLocaleString()} RWF
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedChild ? `${selectedChild.first_name} ${selectedChild.last_name} - Details` : 'Select a child'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedChild ? (
              <Tabs defaultValue="academic" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="fees">Fees</TabsTrigger>
                  <TabsTrigger value="discipline">Discipline</TabsTrigger>
                </TabsList>

                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Average Marks</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {childAcademic?.average_marks || 0}%
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">Passing Subjects</div>
                      <div className="text-2xl font-bold text-green-600">
                        {childAcademic?.passing_subjects || 0} / {childAcademic?.total_subjects || 0}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Subject</th>
                          <th className="text-left p-2">Marks</th>
                          <th className="text-left p-2">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {childAcademic?.marks?.map((mark: any, index: number) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{mark.subject}</td>
                            <td className="p-2 font-medium">{mark.final_marks}%</td>
                            <td className="p-2">
                              <Badge variant={mark.final_marks >= 50 ? 'default' : 'destructive'}>
                                {mark.grade}
                              </Badge>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-gray-500">
                              No academic records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg mb-4">
                    <div className="text-sm text-gray-600 mb-2">Attendance Rate</div>
                    <Progress 
                      value={childAcademic?.attendance_rate || 0} 
                      className="h-3 mb-2"
                    />
                    <div className="text-sm font-medium">
                      {childAcademic?.present_days || 0} / {childAcademic?.total_days || 0} days
                      ({childAcademic?.attendance_rate || 0}%)
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {childAttendance.map((record: any, index: number) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{new Date(record.attendance_date).toLocaleDateString()}</td>
                            <td className="p-2">
                              <Badge 
                                variant={
                                  record.status === 'present' ? 'default' :
                                  record.status === 'late' ? 'secondary' :
                                  'destructive'
                                }
                              >
                                {record.status}
                              </Badge>
                            </td>
                            <td className="p-2 text-sm text-gray-600">{record.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="fees" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-sm text-gray-600">Outstanding Balance</div>
                      <div className="text-2xl font-bold text-red-600">
                        {childFees?.balance || 0} RWF
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">Paid Amount</div>
                      <div className="text-2xl font-bold text-green-600">
                        {childFees?.paid_amount || 0} RWF
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Fee Type</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {childFees?.fees?.map((fee: any, index: number) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{fee.fee_type}</td>
                            <td className="p-2 font-medium">{fee.amount} RWF</td>
                            <td className="p-2">
                              <Badge variant={fee.status === 'paid' ? 'default' : 'destructive'}>
                                {fee.status}
                              </Badge>
                            </td>
                            <td className="p-2">{new Date(fee.due_date).toLocaleDateString()}</td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-gray-500">
                              No fee records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="discipline" className="space-y-4">
                  <div className="space-y-3">
                    {childDiscipline.length > 0 ? (
                      childDiscipline.map((record: any) => (
                        <div key={record.id} className="p-4 border rounded-lg bg-orange-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{record.incident_type}</div>
                              <div className="text-sm text-gray-600 mt-1">{record.description}</div>
                              <div className="text-xs text-gray-500 mt-2">
                                {new Date(record.incident_date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="outline">{record.severity}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No discipline records</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Select a child to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPaymentProof} onOpenChange={setShowPaymentProof}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Child</Label>
              <Select 
                value={paymentProofForm.student_id}
                onValueChange={(value) => setPaymentProofForm({...paymentProofForm, student_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child: any) => (
                    <SelectItem key={child.student.student_id} value={child.student.student_id}>
                      {child.student.first_name} {child.student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount Paid</Label>
              <Input 
                type="number"
                value={paymentProofForm.amount}
                onChange={(e) => setPaymentProofForm({...paymentProofForm, amount: e.target.value})}
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Input 
                value={paymentProofForm.payment_method}
                onChange={(e) => setPaymentProofForm({...paymentProofForm, payment_method: e.target.value})}
              />
            </div>
            <div>
              <Label>Reference Number</Label>
              <Input 
                value={paymentProofForm.reference_number}
                onChange={(e) => setPaymentProofForm({...paymentProofForm, reference_number: e.target.value})}
              />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input 
                type="date"
                value={paymentProofForm.payment_date}
                onChange={(e) => setPaymentProofForm({...paymentProofForm, payment_date: e.target.value})}
              />
            </div>
            <div>
              <Label>Upload Proof</Label>
              <Input type="file" accept="image/*,application/pdf" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                value={paymentProofForm.notes}
                onChange={(e) => setPaymentProofForm({...paymentProofForm, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentProof(false)}>Cancel</Button>
            <Button onClick={handleSubmitPaymentProof}>Submit Proof</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMessage} onOpenChange={setShowMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipient Type</Label>
              <Select 
                value={messageForm.recipient_type}
                onValueChange={(value) => setMessageForm({...messageForm, recipient_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="headmaster">Headmaster</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input 
                value={messageForm.subject}
                onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea 
                rows={6}
                value={messageForm.message}
                onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessage(false)}>Cancel</Button>
            <Button onClick={handleSendMessage}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

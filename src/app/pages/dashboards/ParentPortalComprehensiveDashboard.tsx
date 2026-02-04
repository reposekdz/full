import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Users
} from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import { API_BASE_URL } from '@/app/config/apiBase';

type ChildDashboard = {
  student: {
    id: number;
    name: string;
    admission_number?: string;
    class?: string;
    profile_image?: string;
  };
  attendance?: any;
  recentGrades?: any[];
  unreadNotifications?: number;
  feeBalance?: number;
  recentIncidents?: number;
};

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export default function ParentPortalComprehensiveDashboard({
  onNavigate,
  onLogout
}: {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [children, setChildren] = useState<ChildDashboard[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const selectedChild = useMemo(
    () => children.find((c) => String(c.student.id) === String(selectedStudentId)) || null,
    [children, selectedStudentId]
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'attendance' | 'discipline' | 'fees' | 'activities' | 'notifications' | 'communications'>(
    'overview'
  );

  const [academics, setAcademics] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [discipline, setDiscipline] = useState<any[]>([]);
  const [fees, setFees] = useState<any>(null);
  const [activities, setActivities] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);

  const [commForm, setCommForm] = useState({
    recipient_type: 'Teacher',
    recipient_id: '',
    subject: '',
    message: '',
    priority: 'Normal'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    phone: '',
    payment_method: 'Mobile Money',
    fee_type: 'School Fees',
    description: 'School fees payment'
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/parent-portal-comprehensive/dashboard`, { headers: authHeaders() });
      const data = await res.json();
      if (data?.success) {
        setChildren(data.children || []);
        const first = (data.children || [])[0];
        if (first?.student?.id) setSelectedStudentId(String(first.student.id));
      } else {
        setChildren([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSelected = async () => {
    if (!selectedStudentId) return;
    const sid = selectedStudentId;
    try {
      const [aRes, atRes, dRes, fRes, actRes, nRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/parent-portal-comprehensive/students/${sid}/academics`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/parent-portal-comprehensive/students/${sid}/attendance`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/parent-portal-comprehensive/students/${sid}/discipline`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/parent-portal-comprehensive/students/${sid}/fees`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/parent-portal-comprehensive/students/${sid}/activities`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/parent-portal-comprehensive/notifications?student_id=${sid}&limit=50`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/parent-portal-comprehensive/communications?student_id=${sid}`, { headers: authHeaders() })
      ]);

      const [a, at, d, f, act, n, c] = await Promise.all([aRes.json(), atRes.json(), dRes.json(), fRes.json(), actRes.json(), nRes.json(), cRes.json()]);

      setAcademics(a?.success ? a : null);
      setAttendance(at?.success ? at : null);
      setDiscipline(d?.success ? d.records || [] : []);
      setFees(f?.success ? f : null);
      setActivities(act?.success ? act : null);
      setNotifications(n?.success ? n.notifications || [] : []);
      setCommunications(c?.success ? c.communications || [] : []);
    } catch (e) {
      console.error('Parent portal fetch error:', e);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedStudentId) fetchSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId]);

  const refreshAll = async () => {
    setRefreshing(true);
    await fetchDashboard();
    await fetchSelected();
    setRefreshing(false);
  };

  const sendCommunication = async () => {
    if (!selectedStudentId) return;
    if (!commForm.subject.trim() || !commForm.message.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/parent-portal-comprehensive/communications`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: Number(selectedStudentId),
          recipient_type: commForm.recipient_type,
          recipient_id: commForm.recipient_id ? Number(commForm.recipient_id) : null,
          subject: commForm.subject,
          message: commForm.message,
          priority: commForm.priority
        })
      });
      const data = await res.json();
      if (data?.success) {
        setCommForm({ recipient_type: 'Teacher', recipient_id: '', subject: '', message: '', priority: 'Normal' });
        await fetchSelected();
        setActiveTab('communications');
      } else {
        alert(data?.message || 'Failed to send message');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to send message');
    }
  };

  const initiatePayment = async () => {
    if (!selectedStudentId) return;
    if (!paymentForm.amount) return;
    try {
      const res = await fetch(`${API_BASE_URL}/parent-portal-comprehensive/payments/initiate`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: Number(selectedStudentId),
          amount: Number(paymentForm.amount),
          phone: paymentForm.phone,
          payment_method: paymentForm.payment_method,
          fee_type: paymentForm.fee_type,
          description: paymentForm.description
        })
      });
      const data = await res.json();
      if (data?.success) {
        alert('Payment request created');
        setPaymentForm((p) => ({ ...p, amount: '' }));
        await fetchSelected();
        setActiveTab('fees');
      } else {
        alert(data?.message || 'Failed to initiate payment');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to initiate payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50">
        <RefreshCw className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              Parent Portal (Comprehensive)
            </h1>
            <p className="text-gray-600 font-semibold">Real-time academics, attendance, fees, discipline, communication</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshAll} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => onNavigate('profile')}>
              Profile
            </Button>
            <Button onClick={onLogout} className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              Logout
            </Button>
          </div>
        </div>

        <Card className="border-2 border-yellow-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-600" />
              My Children
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <Label>Select Child</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.student.id} value={String(c.student.id)}>
                      {c.student.name} {c.student.class ? `- ${c.student.class}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedChild && (
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-700">Fees: {Number(selectedChild.feeBalance || 0).toLocaleString()}</Badge>
                <Badge className="bg-blue-100 text-blue-700">Unread: {selectedChild.unreadNotifications || 0}</Badge>
                <Badge className="bg-red-100 text-red-700">Incidents: {selectedChild.recentIncidents || 0}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedChild && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full bg-white border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="discipline">Discipline</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="communications">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Recent Grades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(selectedChild.recentGrades || []).slice(0, 5).map((g: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                        <span className="font-semibold">{g.subject_name}</span>
                        <Badge className="bg-blue-600 text-white">{g.grade}</Badge>
                      </div>
                    ))}
                    {(selectedChild.recentGrades || []).length === 0 && <p className="text-gray-500">No grades yet.</p>}
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      Attendance (30 days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Present</span><b>{selectedChild.attendance?.present_days || 0}</b></div>
                    <div className="flex justify-between"><span>Absent</span><b>{selectedChild.attendance?.absent_days || 0}</b></div>
                    <div className="flex justify-between"><span>Late</span><b>{selectedChild.attendance?.late_days || 0}</b></div>
                    <div className="flex justify-between"><span>Total</span><b>{selectedChild.attendance?.total_days || 0}</b></div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                      Fees
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Balance</span><b>{Number(selectedChild.feeBalance || 0).toLocaleString()}</b></div>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white" onClick={() => setActiveTab('fees')}>
                      Manage Fees
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="academics">
              <Card className="border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Academic Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-700">Avg %: {academics?.summary?.averagePercentage || 0}</Badge>
                    <Badge className="bg-green-100 text-green-700">Avg points: {academics?.summary?.averagePoints || 0}</Badge>
                    <Badge className="bg-gray-100 text-gray-700">Subjects: {academics?.summary?.totalSubjects || 0}</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Subject</th>
                          <th className="text-left p-2">Grade</th>
                          <th className="text-left p-2">%</th>
                          <th className="text-left p-2">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(academics?.records || []).map((r: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{r.subject_name}</td>
                            <td className="p-2"><Badge className="bg-blue-600 text-white">{r.grade}</Badge></td>
                            <td className="p-2">{r.percentage}</td>
                            <td className="p-2">{r.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!academics?.records || academics.records.length === 0) && <p className="text-gray-500 mt-4">No academic records.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <Card className="border-2 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Attendance Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-green-100 text-green-700">Present: {attendance?.statistics?.present || 0}</Badge>
                    <Badge className="bg-red-100 text-red-700">Absent: {attendance?.statistics?.absent || 0}</Badge>
                    <Badge className="bg-yellow-100 text-yellow-700">Late: {attendance?.statistics?.late || 0}</Badge>
                    <Badge className="bg-gray-100 text-gray-700">Rate: {attendance?.statistics?.attendanceRate || 0}%</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Subject</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(attendance?.attendance || []).slice(0, 100).map((r: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{String(r.date || '').slice(0, 10)}</td>
                            <td className="p-2">
                              <Badge className="bg-gray-900 text-white">{r.status}</Badge>
                            </td>
                            <td className="p-2">{r.subject_name || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!attendance?.attendance || attendance.attendance.length === 0) && <p className="text-gray-500 mt-4">No attendance records.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discipline">
              <Card className="border-2 border-red-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    Discipline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(discipline || []).map((r: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-red-50 border border-red-100">
                      <div className="flex justify-between">
                        <b>{r.incident_type || 'Incident'}</b>
                        <span className="text-sm text-gray-600">{String(r.incident_date || '').slice(0, 10)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{r.description || '-'}</p>
                    </div>
                  ))}
                  {discipline.length === 0 && <p className="text-gray-500">No discipline records.</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                      Fee Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Balance</span><b>{Number(fees?.fee_balance || 0).toLocaleString()}</b></div>
                    <div className="flex justify-between"><span>Total paid</span><b>{Number(fees?.total_paid || 0).toLocaleString()}</b></div>
                    <div className="flex justify-between"><span>Total fees</span><b>{Number(fees?.total_fees || 0).toLocaleString()}</b></div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Initiate Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Amount</Label>
                      <Input value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                    </div>
                    <div>
                      <Label>Phone (Mobile Money)</Label>
                      <Input value={paymentForm.phone} onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })} />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white" onClick={initiatePayment}>
                      Request Payment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activities">
              <Card className="border-2 border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Activities & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">Activities</h3>
                    {(activities?.activities || []).map((a: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-purple-50 border border-purple-100 mb-2">
                        <div className="flex justify-between">
                          <b>{a.activity_name || a.title || 'Activity'}</b>
                          <span className="text-sm text-gray-600">{String(a.start_date || '').slice(0, 10)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{a.description || '-'}</p>
                      </div>
                    ))}
                    {(!activities?.activities || activities.activities.length === 0) && <p className="text-gray-500">No activities.</p>}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Achievements</h3>
                    {(activities?.achievements || []).map((a: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-green-50 border border-green-100 mb-2">
                        <div className="flex justify-between">
                          <b>{a.achievement_name || a.title || 'Achievement'}</b>
                          <span className="text-sm text-gray-600">{String(a.awarded_date || '').slice(0, 10)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{a.description || '-'}</p>
                      </div>
                    ))}
                    {(!activities?.achievements || activities.achievements.length === 0) && <p className="text-gray-500">No achievements.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(notifications || []).map((n: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="flex justify-between items-center">
                        <b>{n.title || n.notification_type || 'Notification'}</b>
                        <Badge className={n.is_read ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white'}>
                          {n.is_read ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{n.message || '-'}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-gray-500">No notifications.</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communications">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-indigo-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      Send Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Recipient Type</Label>
                      <Select value={commForm.recipient_type} onValueChange={(v) => setCommForm({ ...commForm, recipient_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Teacher">Teacher</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Recipient ID (optional)</Label>
                      <Input value={commForm.recipient_id} onChange={(e) => setCommForm({ ...commForm, recipient_id: e.target.value })} />
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input value={commForm.subject} onChange={(e) => setCommForm({ ...commForm, subject: e.target.value })} />
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea value={commForm.message} onChange={(e) => setCommForm({ ...commForm, message: e.target.value })} />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white" onClick={sendCommunication}>
                      Send
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-700" />
                      History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(communications || []).map((c: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex justify-between">
                          <b className="truncate">{c.subject || 'Message'}</b>
                          <span className="text-xs text-gray-500">{String(c.created_at || '').slice(0, 10)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 line-clamp-3">{c.message || '-'}</p>
                      </div>
                    ))}
                    {communications.length === 0 && <p className="text-gray-500">No messages yet.</p>}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}


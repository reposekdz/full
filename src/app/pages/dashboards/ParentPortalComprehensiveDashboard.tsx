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
  Users,
  UserPlus,
  Loader2
} from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/app/config/apiBase';
import parentPaymentApi from '@/app/services/parentPaymentApi';

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

// Kinyarwanda – Parent dashboard (full, parent only)
const RW = {
  title: "Poritari y'Umubyeyi",
  subtitle: "Amajyambere, amafaranga, imyitwarire n'ubutumwa",
  refresh: "Ongera usuzuma",
  profile: "Porofili",
  logout: "Sohoka",
  linkChild: "Huza Umwana Wawe",
  linkChildDesc: "Gusaba guhuza umwana wawe na konti. Nyuma y'icyemezo cy'ishuri uza kubona amafaranga, amanota, kujya n'ibindi.",
  requestSubmitted: "Gusaba byoherejwe.",
  waitConfirm: "Tegereza ishuri kugira ngo riemeze. Uzabona umwana wawe hano.",
  studentCode: "Kode cyangwa nimero y'umwana *",
  relationship: "Isano",
  parent: "Umubyeyi",
  guardian: "Umurezi",
  other: "Ikindi",
  applyToLink: "Saba guhuza umwana",
  submitting: "Ohereza...",
  myChildren: "Abana Banjye",
  selectChild: "Hitamo umwana",
  linkAnother: "Huza undi mwana",
  fees: "Amafaranga",
  unread: "Ntibasomwe",
  incidents: "Ibihe",
  overview: "Incamake",
  academics: "Amasomo",
  attendance: "Kujya",
  discipline: "Imyitwarire",
  activities: "Ibikorwa",
  notifications: "Amatangazo",
  messages: "Ubutumwa",
  recentGrades: "Amanota vuba",
  noGrades: "Nta manota.",
  present: "Yabaye",
  absent: "Ntayabaye",
  late: "Yaje nyuma",
  total: "Igiteranyo",
  balance: "Gusigara",
  manageFees: "Gira neza amafaranga",
  academicPerformance: "Amajyambere mu masomo",
  subject: "Isomo",
  grade: "Icyiciro",
  points: "Amapointe",
  noAcademicRecords: "Nta makuru y'amasomo.",
  attendanceRecords: "Amakuru yo kujya",
  rate: "Igipimo",
  date: "Itariki",
  status: "Imiterere",
  noAttendance: "Nta makuru yo kujya.",
  noDiscipline: "Nta makuru y'imytwarire.",
  incident: "Icyabaye",
  feeStatus: "Imiterere y'amafaranga",
  totalPaid: "Yishyuwe",
  totalFees: "Igiteranyo cy'amafaranga",
  initiatePayment: "Tangira kwishyura",
  amount: "Amafaranga",
  phoneMobile: "Telefoni (Mobile Money)",
  requestPayment: "Saba kwishyura",
  activitiesAchievements: "Ibikorwa n'icyubahiro",
  noActivities: "Nta bikorwa.",
  noAchievements: "Nta cyubahiro.",
  read: "Yasomwe",
  unreadBadge: "Ntibasomwe",
  noNotifications: "Nta matangazo.",
  sendMessage: "Ohereza ubutumwa",
  recipientType: "Uwo uohereza",
  teacher: "Umwarimu",
  admin: "Admin",
  recipientId: "ID (bihitamo)",
  subjectLabel: "Intego",
  messageLabel: "Ubutumwa",
  send: "Ohereza",
  history: "Amakuru",
  noMessages: "Nta butumwa.",
  requestLinkAnother: "Saba guhuza undi mwana",
  submitRequest: "Ohereza gusaba",
  getReceipt: "Fata risiti",
  viewReceipt: "Reba risiti",
  downloadReceipt: "Kuramo risiti",
  receiptNumber: "Nimero y'irisiti",
  receiptNotFound: "Risiti ntiboneka.",
  paymentHistory: "Amakuru yo kwishyura",
  viewReceiptFor: "Reba risiti",
};

export interface ParentPortalComprehensiveDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function ParentPortalComprehensiveDashboard({
  onNavigate,
  onLogout
}: ParentPortalComprehensiveDashboardProps) {
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

  const [linkRequest, setLinkRequest] = useState({ student_code: '', relationship: 'Parent' });
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [linkRequestSent, setLinkRequestSent] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

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
  const [receiptNumberInput, setReceiptNumberInput] = useState('');
  const [receiptData, setReceiptData] = useState<any>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [paymentHistoryList, setPaymentHistoryList] = useState<any[]>([]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [portalRes, linkedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/parent-portal-comprehensive/dashboard`, { headers: authHeaders() }).then(r => r.json()).catch(() => ({ success: false })),
        parentPaymentApi.fetchLinkedChildren().then((list) => ({ success: true, linked: list })).catch(() => ({ success: false, linked: [] }))
      ]);

      const portalChildren: ChildDashboard[] = portalRes?.success ? (portalRes.children || []) : [];
      const linked = linkedRes?.success && Array.isArray(linkedRes.linked) ? linkedRes.linked : [];

      if (linked.length > 0) {
        const merged: ChildDashboard[] = linked.map((s: any) => ({
          student: {
            id: Number(s.student_id) || s.sheet_id || 0,
            name: [s.first_name, s.last_name].filter(Boolean).join(' ') || s.student_code,
            admission_number: s.student_code,
            class: s.current_class || (s.trade_name && s.level_number ? `${s.trade_name} L${s.level_number}` : undefined)
          },
          feeBalance: s.balance,
          unreadNotifications: 0,
          recentIncidents: 0,
          recentGrades: []
        }));
        if (portalChildren.length > 0) {
          const byId = new Map(portalChildren.map(c => [String(c.student.id), c]));
          merged.forEach(m => {
            const existing = byId.get(String(m.student.id));
            if (existing) {
              m.attendance = existing.attendance;
              m.recentGrades = existing.recentGrades;
              m.unreadNotifications = existing.unreadNotifications;
              m.recentIncidents = existing.recentIncidents;
            }
          });
        }
        setChildren(merged);
        if (merged[0]?.student?.id) setSelectedStudentId(String(merged[0].student.id));
      } else if (portalChildren.length > 0) {
        setChildren(portalChildren);
        if (portalChildren[0]?.student?.id) setSelectedStudentId(String(portalChildren[0].student.id));
      } else {
        setChildren([]);
        setSelectedStudentId('');
      }
    } catch (e) {
      console.error(e);
      setChildren([]);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const submitLinkRequest = async () => {
    if (!linkRequest.student_code?.trim()) {
      toast.error('Enter your child\'s student code');
      return;
    }
    setLinkSubmitting(true);
    try {
      const result = await parentPaymentApi.requestLinkChild(linkRequest.student_code.trim(), linkRequest.relationship);
      if (result.success) {
        setLinkRequestSent(true);
        setLinkRequest({ student_code: '', relationship: 'Parent' });
        setShowLinkDialog(false);
        toast.success('Request sent. You will see your child here once the school confirms the link.');
      } else {
        toast.error(result.message || 'Request failed');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit request');
    } finally {
      setLinkSubmitting(false);
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

      try {
        const history = await parentPaymentApi.fetchPaymentHistory(sid);
        setPaymentHistoryList(Array.isArray(history) ? history : []);
      } catch {
        setPaymentHistoryList([]);
      }
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
        toast.error(data?.message || 'Failed to send message');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send message');
    }
  };

  const viewOrDownloadReceipt = async (receiptNum?: string) => {
    const num = (receiptNum ?? receiptNumberInput)?.trim();
    if (!num) {
      toast.error(RW.receiptNumber + ' - Ongera usuzuma');
      return;
    }
    setReceiptLoading(true);
    setReceiptData(null);
    setReceiptDialogOpen(true);
    try {
      const receipt = await parentPaymentApi.getReceipt(num);
      setReceiptData(receipt);
    } catch (e: any) {
      toast.error(e?.message || RW.receiptNotFound);
      setReceiptData(null);
    } finally {
      setReceiptLoading(false);
    }
  };

  const printReceipt = () => {
    const printEl = document.getElementById('receipt-print-area');
    if (!printEl) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(printEl.innerHTML);
    win.document.close();
    win.print();
    win.close();
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
        toast.success('Payment request created');
        setPaymentForm((p) => ({ ...p, amount: '' }));
        await fetchSelected();
        setActiveTab('fees');
      } else {
        toast.error(data?.message || 'Failed to initiate payment');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to initiate payment');
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
              {RW.title}
            </h1>
            <p className="text-gray-600 font-semibold">{RW.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshAll} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {RW.refresh}
            </Button>
            <Button variant="outline" onClick={() => onNavigate('profile')}>
              {RW.profile}
            </Button>
            <Button onClick={onLogout} className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              {RW.logout}
            </Button>
          </div>
        </div>

        {children.length === 0 ? (
          <Card className="border-2 border-amber-200 shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                {RW.linkChild}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {RW.linkChildDesc}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              {linkRequestSent ? (
                <div className="p-4 rounded-xl bg-green-100 border border-green-200 text-green-800">
                  <p className="font-medium">{RW.requestSubmitted}</p>
                  <p className="text-sm mt-1">{RW.waitConfirm}</p>
                </div>
              ) : null}
              <div>
                <Label>{RW.studentCode}</Label>
                <Input
                  placeholder="e.g. STD12025001"
                  value={linkRequest.student_code}
                  onChange={(e) => setLinkRequest({ ...linkRequest, student_code: e.target.value })}
                  className="border-2 mt-1"
                />
              </div>
              <div>
                <Label>{RW.relationship}</Label>
                <Select value={linkRequest.relationship} onValueChange={(v) => setLinkRequest({ ...linkRequest, relationship: v })}>
                  <SelectTrigger className="border-2 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parent">{RW.parent}</SelectItem>
                    <SelectItem value="Guardian">{RW.guardian}</SelectItem>
                    <SelectItem value="Other">{RW.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
                onClick={submitLinkRequest}
                disabled={linkSubmitting || !linkRequest.student_code.trim()}
              >
                {linkSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {RW.submitting}</> : <><UserPlus className="h-4 w-4 mr-2" /> {RW.applyToLink}</>}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
        <Card className="border-2 border-yellow-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-600" />
              {RW.myChildren}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <Label>{RW.selectChild}</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="border-2">
                  <SelectValue placeholder={RW.selectChild} />
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowLinkDialog(true)} title={RW.requestLinkAnother}>
                <UserPlus className="h-4 w-4 mr-1" /> {RW.linkAnother}
              </Button>
            </div>
            {selectedChild && (
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-700">{RW.fees}: {Number(selectedChild.feeBalance || 0).toLocaleString()} RWF</Badge>
                <Badge className="bg-blue-100 text-blue-700">{RW.unread}: {selectedChild.unreadNotifications || 0}</Badge>
                <Badge className="bg-red-100 text-red-700">{RW.incidents}: {selectedChild.recentIncidents || 0}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedChild && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full bg-white border">
              <TabsTrigger value="overview">{RW.overview}</TabsTrigger>
              <TabsTrigger value="academics">{RW.academics}</TabsTrigger>
              <TabsTrigger value="attendance">{RW.attendance}</TabsTrigger>
              <TabsTrigger value="discipline">{RW.discipline}</TabsTrigger>
              <TabsTrigger value="fees">{RW.fees}</TabsTrigger>
              <TabsTrigger value="activities">{RW.activities}</TabsTrigger>
              <TabsTrigger value="notifications">{RW.notifications}</TabsTrigger>
              <TabsTrigger value="communications">{RW.messages}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      {RW.recentGrades}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(selectedChild.recentGrades || []).slice(0, 5).map((g: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                        <span className="font-semibold">{g.subject_name}</span>
                        <Badge className="bg-blue-600 text-white">{g.grade}</Badge>
                      </div>
                    ))}
                    {(selectedChild.recentGrades || []).length === 0 && <p className="text-gray-500">{RW.noGrades}</p>}
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      {RW.attendance} (iminsi 30)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>{RW.present}</span><b>{selectedChild.attendance?.present_days || 0}</b></div>
                    <div className="flex justify-between"><span>{RW.absent}</span><b>{selectedChild.attendance?.absent_days || 0}</b></div>
                    <div className="flex justify-between"><span>{RW.late}</span><b>{selectedChild.attendance?.late_days || 0}</b></div>
                    <div className="flex justify-between"><span>{RW.total}</span><b>{selectedChild.attendance?.total_days || 0}</b></div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                      {RW.fees}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>{RW.balance}</span><b>{Number(selectedChild.feeBalance || 0).toLocaleString()}</b></div>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white" onClick={() => setActiveTab('fees')}>
                      {RW.manageFees}
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
                      {RW.feeStatus}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>{RW.balance}</span><b>{Number(fees?.fee_balance || 0).toLocaleString()}</b></div>
                    <div className="flex justify-between"><span>{RW.totalPaid}</span><b>{Number(fees?.total_paid || 0).toLocaleString()}</b></div>
                    <div className="flex justify-between"><span>{RW.totalFees}</span><b>{Number(fees?.total_fees || 0).toLocaleString()}</b></div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      {RW.initiatePayment}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>{RW.amount}</Label>
                      <Input value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="RWF" />
                    </div>
                    <div>
                      <Label>{RW.phoneMobile}</Label>
                      <Input value={paymentForm.phone} onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })} placeholder="078..." />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white" onClick={initiatePayment}>
                      {RW.requestPayment}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-blue-200 mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {RW.getReceipt} / {RW.viewReceipt}
                  </CardTitle>
                  <CardDescription>Injiza nimero y'irisiti hanyuma ukande Reba cyangwa Kuramo (print).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="flex-1 min-w-[200px]">
                      <Label>{RW.receiptNumber}</Label>
                      <Input
                        value={receiptNumberInput}
                        onChange={(e) => setReceiptNumberInput(e.target.value)}
                        placeholder="RCP-..."
                        onKeyDown={(e) => e.key === 'Enter' && viewOrDownloadReceipt()}
                      />
                    </div>
                    <Button onClick={() => viewOrDownloadReceipt()} disabled={receiptLoading}>
                      {receiptLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                      {RW.viewReceipt}
                    </Button>
                    {receiptData && (
                      <Button variant="outline" onClick={printReceipt}>
                        {RW.downloadReceipt}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {paymentHistoryList.length > 0 && (
                <Card className="border-2 border-gray-200 mt-4">
                  <CardHeader>
                    <CardTitle>{RW.paymentHistory}</CardTitle>
                    <CardDescription>Hitamo kwishyura hanyuma ukande &quot;{RW.viewReceipt}&quot; kugira ngo urebe risiti.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Itariki</th>
                            <th className="text-left p-2">Amafaranga</th>
                            <th className="text-left p-2">Uburyo</th>
                            <th className="text-left p-2">Risiti</th>
                            <th className="text-left p-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistoryList.map((p: any) => (
                            <tr key={p.id} className="border-b">
                              <td className="p-2">{p.payment_date ? String(p.payment_date).slice(0, 10) : '-'}</td>
                              <td className="p-2">{Number(p.amount || 0).toLocaleString()} RWF</td>
                              <td className="p-2">{p.bank_name || p.payment_method || '-'}</td>
                              <td className="p-2 font-mono">{p.receipt_number || '-'}</td>
                              <td className="p-2">
                                {p.receipt_number && (
                                  <Button variant="outline" size="sm" onClick={() => { setReceiptNumberInput(p.receipt_number); viewOrDownloadReceipt(p.receipt_number); }}>
                                    {RW.viewReceipt}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{RW.viewReceipt}</DialogTitle>
                  </DialogHeader>
                  <div id="receipt-print-area" className="bg-white text-black p-6 rounded-lg border">
                    {receiptLoading && <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {!receiptLoading && receiptData && (
                      <div className="space-y-2 text-sm">
                        <p className="font-bold text-lg border-b pb-2">Risiti yo Kwishyura</p>
                        <p><span className="font-medium">Nimero y'irisiti:</span> {receiptData.receipt_number}</p>
                        <p><span className="font-medium">Umwana:</span> {receiptData.first_name} {receiptData.last_name} ({receiptData.student_code})</p>
                        <p><span className="font-medium">Amafaranga:</span> {Number(receiptData.amount || 0).toLocaleString()} RWF</p>
                        {receiptData.fee_amount != null && <p><span className="font-medium">Igiciro:</span> {Number(receiptData.fee_amount).toLocaleString()} RWF</p>}
                        <p><span className="font-medium">Itariki:</span> {receiptData.payment_date ? String(receiptData.payment_date).slice(0, 10) : '-'}</p>
                        <p><span className="font-medium">Uburyo:</span> {receiptData.payment_method || '-'}</p>
                        <p><span className="font-medium">Imiterere:</span> {receiptData.status || 'completed'}</p>
                      </div>
                    )}
                    {!receiptLoading && !receiptData && !receiptNumberInput && <p className="text-gray-500">{RW.receiptNumber} - Injiza nimero.</p>}
                    {!receiptLoading && !receiptData && receiptNumberInput && <p className="text-gray-500">{RW.receiptNotFound}</p>}
                  </div>
                  {receiptData && (
                    <Button className="w-full mt-4" onClick={printReceipt}>{RW.downloadReceipt}</Button>
                  )}
                </DialogContent>
              </Dialog>
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
          </>
        )}

        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{RW.requestLinkAnother}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>{RW.studentCode}</Label>
                <Input placeholder="STD12025001" value={linkRequest.student_code} onChange={(e) => setLinkRequest({ ...linkRequest, student_code: e.target.value })} className="border-2 mt-1" />
              </div>
              <div>
                <Label>{RW.relationship}</Label>
                <Select value={linkRequest.relationship} onValueChange={(v) => setLinkRequest({ ...linkRequest, relationship: v })}>
                  <SelectTrigger className="border-2 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parent">{RW.parent}</SelectItem>
                    <SelectItem value="Guardian">{RW.guardian}</SelectItem>
                    <SelectItem value="Other">{RW.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white" onClick={submitLinkRequest} disabled={linkSubmitting || !linkRequest.student_code.trim()}>
                {linkSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {RW.submitting}</> : RW.submitRequest}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


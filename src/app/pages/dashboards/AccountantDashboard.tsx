import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Users, AlertCircle, Plus, Search, Download, CreditCard, Wallet, PieChart, Upload, Columns, Phone, Bell, Filter, FileText, Send, MessageSquare, RefreshCw, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import apiService from '@/app/services/apiService';
import { toast } from 'sonner';
import AccountantPaymentProofs from '@/app/components/AccountantPaymentProofs';
import AccountantDynamicColumns from '@/app/components/AccountantDynamicColumns';
import { GLOBAL_TRADES, GLOBAL_LEVELS, getLevelsForTrade } from '@/app/constants/tradesAndLevels';
import { UnifiedMessaging } from '@/app/components/messaging/UnifiedMessaging';
import { API_BASE_URL } from '@/app/config/apiBase';

interface AccountantDashboardProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export default function AccountantDashboard({ onNavigate, onLogout }: AccountantDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTrade, setFilterTrade] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [newPayment, setNewPayment] = useState({
    student_id: '',
    amount: '',
    payment_method: 'cash',
    transaction_ref: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [reminderSettings, setReminderSettings] = useState<{ remind_after_days?: string; enabled?: string; frequency?: string; minBalance?: string; time?: string }>({});
  const [reminderForm, setReminderForm] = useState({ remind_after_days: 7, enabled: true, frequency: 'daily', minBalance: 0, time: '09:00' });
  const [reminderSaving, setReminderSaving] = useState(false);

  useEffect(() => {
    fetchData();
    setTrades(GLOBAL_TRADES);
    setLevels(GLOBAL_LEVELS);
    apiService.getFeeReminderSettings().then((r: any) => {
      if (r?.settings) setReminderSettings(r.settings);
      if (r?.settings?.fee_reminder_remind_after_days != null) setReminderForm(f => ({ ...f, remind_after_days: parseInt(r.settings.fee_reminder_remind_after_days, 10) || 7 }));
      if (r?.settings?.fee_reminder_enabled != null) setReminderForm(f => ({ ...f, enabled: r.settings.fee_reminder_enabled === 'true' }));
      if (r?.settings?.fee_reminder_frequency) setReminderForm(f => ({ ...f, frequency: r.settings.fee_reminder_frequency }));
      if (r?.settings?.fee_reminder_min_balance != null) setReminderForm(f => ({ ...f, minBalance: parseInt(r.settings.fee_reminder_min_balance, 10) || 0 }));
      if (r?.settings?.fee_reminder_time) setReminderForm(f => ({ ...f, time: r.settings.fee_reminder_time }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (filterTrade !== 'all' || filterLevel !== 'all') {
      fetchData();
    }
  }, [filterTrade, filterLevel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      const [overviewData, studentsData, accountantRes] = await Promise.all([
        apiService.getAccountantOverview().catch(() => null),
        apiService.getAccountantStudentsFinancial({
          trade: filterTrade !== 'all' ? filterTrade : undefined,
          trade_code: filterTrade !== 'all' ? filterTrade : undefined,
          level: filterLevel !== 'all' ? filterLevel : undefined
        }).catch(() => ({ students: [] })),
        fetch(`${API_BASE_URL}/accountant/dashboard`, { headers: authHeaders }).then(r => r.json()).catch(() => null)
      ]);
      const ov = overviewData?.data ?? overviewData?.dashboard ?? overviewData?.stats ?? null;
      if (ov && (ov.total_expected != null || ov.total_collected != null || ov.totalIncome != null)) {
        setOverview(ov.total_expected != null ? ov : {
          total_expected: Number(ov.totalIncome ?? 0) + Math.max(0, Number(ov.netBalance ?? 0)),
          total_collected: Number(ov.totalIncome ?? 0),
          outstanding_balance: Math.abs(Math.min(0, Number(ov.netBalance ?? 0)))
        });
      } else if (accountantRes?.success && accountantRes?.stats) {
        const s = accountantRes.stats;
        setOverview({
          total_expected: Number(s.totalIncome ?? 0) + Math.max(0, Number(s.netBalance ?? 0)),
          total_collected: Number(s.totalIncome ?? 0),
          outstanding_balance: Math.abs(Math.min(0, Number(s.netBalance ?? 0)))
        });
      }
      setStudents(Array.isArray(studentsData?.students) ? studentsData.students : []);
    } catch (error) {
      console.error('Failed to fetch accountant data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    try {
      await apiService.recordPayment({
        ...newPayment,
        amount: parseFloat(newPayment.amount)
      });
      toast.success('Payment recorded successfully!');
      setNewPayment({
        student_id: '',
        amount: '',
        payment_method: 'cash',
        transaction_ref: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchData();
    } catch (error: any) {
      toast.error('Failed to record payment: ' + (error?.message || 'Unknown error'));
    }
  };

  const exportData = () => {
    const csvContent = 'Student ID,Name,Total,Paid,Balance,Status\n' +
      students.map(s => `${s.student_id},${s.first_name} ${s.last_name},${s.total_amount},${s.paid_amount},${s.balance},${s.payment_status}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.payment_status === filterStatus;
    const matchesTrade = filterTrade === 'all' || s.trade === filterTrade;
    const matchesLevel = filterLevel === 'all' || s.level === filterLevel;
    return matchesSearch && matchesStatus && matchesTrade && matchesLevel;
  });

  const handleContactParent = async (studentId: number) => {
    try {
      await apiService.contactParent(studentId, { message: 'Muraho! Mwaramutse. Turabamenyesha ko umwana wanyu afite ideni ry\'amafaranga y\'ishuri. Mwakwishyura vuba bishoboka. Murakoze!' });
      toast.success('Ubutumwa bwoherejwe ku mubyeyi!');
    } catch (error: any) {
      toast.error('Byanze kohereza ubutumwa: ' + (error?.message || ''));
    }
  };

  const handleAutoRemind = async () => {
    try {
      const unpaidStudents = students.filter(s => s.payment_status === 'unpaid' || s.payment_status === 'partial');
      await apiService.bulkRemindParents(unpaidStudents.map(s => s.id));
      toast.success(`Ibutumwa byoherejwe ku babyeyi ${unpaidStudents.length}!`);
    } catch (error: any) {
      toast.error('Byanze kohereza ibutumwa: ' + (error?.message || ''));
    }
  };

  const handleSaveReminderSettings = async () => {
    try {
      setReminderSaving(true);
      await apiService.saveFeeReminderSettings({
        enabled: reminderForm.enabled,
        frequency: reminderForm.frequency,
        minBalance: reminderForm.minBalance,
        time: reminderForm.time,
        remind_after_days: reminderForm.remind_after_days
      });
      toast.success('Igenamiterere cy\'ibutsa byarahinduwe!');
    } catch (error: any) {
      toast.error('Byanze gukiza: ' + (error?.message || ''));
    } finally {
      setReminderSaving(false);
    }
  };

  const collectionRate = overview && Number(overview.total_expected) > 0
    ? ((Number(overview.total_collected) / Number(overview.total_expected)) * 100).toFixed(1)
    : '0';

  const availableLevels = filterTrade === 'all' ? GLOBAL_LEVELS : getLevelsForTrade(filterTrade);

  const paidCount = students.filter(s => s.payment_status === 'paid').length;
  const unpaidCount = students.filter(s => s.payment_status === 'unpaid').length;
  const partialCount = students.filter(s => s.payment_status === 'partial').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Dashbord y'Umubare
            </h1>
            <p className="text-gray-600 mt-2">Gucunga amafaranga n'amafaranga y'ishuri</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => fetchData()} disabled={loading} className="shrink-0" title="Refresh">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {onNavigate && (
              <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 shrink-0" onClick={() => onNavigate('student-sheets')}>
                <LayoutGrid className="w-4 h-4 mr-2" />
                Student Sheets (SOD, BDC, AUT)
              </Button>
            )}
            <Button onClick={handleAutoRemind} className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <Bell className="w-4 h-4 mr-2" />
              Ibutsa Ababyeyi ({unpaidCount + partialCount})
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Andika Kwishyura
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Andika Kwishyura</DialogTitle>
                  <DialogDescription>Andika kwishyura gushya kw'umwana</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Umwana</Label>
                    <Select value={newPayment.student_id} onValueChange={(v) => setNewPayment({ ...newPayment, student_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Hitamo umwana" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.first_name} {s.last_name} ({s.student_id}) - Ideni: {s.balance?.toLocaleString()} RWF
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Amafaranga (RWF)</Label>
                    <Input
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                      placeholder="Andika amafaranga"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Uburyo bwo Kwishyura</Label>
                    <Select value={newPayment.payment_method} onValueChange={(v) => setNewPayment({ ...newPayment, payment_method: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Amafaranga</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="bank_transfer">Banki</SelectItem>
                        <SelectItem value="card">Karita</SelectItem>
                        <SelectItem value="check">Sheki</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Nimero y'Icyemezo</Label>
                    <Input
                      value={newPayment.transaction_ref}
                      onChange={(e) => setNewPayment({ ...newPayment, transaction_ref: e.target.value })}
                      placeholder="Nimero y'icyemezo"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Itariki</Label>
                    <Input
                      type="date"
                      value={newPayment.payment_date}
                      onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Inyongera</Label>
                    <Input
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                      placeholder="Inyongera"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleRecordPayment} className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                    Bika Kwishyura
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={exportData} variant="outline" className="border-2">
              <Download className="w-4 h-4 mr-2" />
              Pakurura CSV
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border-2 border-green-200 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Incamake
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Imbonerahamwe Rusange
            </TabsTrigger>
            <TabsTrigger value="reminders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Ibutsa Ababyeyi
            </TabsTrigger>
            <TabsTrigger value="columns" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Columns className="w-4 h-4 mr-2" />
              Inkingi
            </TabsTrigger>
            <TabsTrigger value="payment-proofs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Ibyemezo
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Raporo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 mx-auto text-green-600 mb-2" />
                  <p className="text-4xl font-black text-green-900">
                    {(overview?.total_expected || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Expected (RWF)</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <Wallet className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                  <p className="text-4xl font-black text-blue-900">
                    {(overview?.total_collected || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Collected (RWF)</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-100 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-600 mb-2" />
                  <p className="text-4xl font-black text-red-900">
                    {(overview?.outstanding_balance || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Outstanding (RWF)</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto text-purple-600 mb-2" />
                  <p className="text-4xl font-black text-purple-900">{collectionRate}%</p>
                  <p className="text-sm text-gray-600">Collection Rate</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto text-orange-600 mb-2" />
                  <p className="text-2xl font-black text-green-700">{paidCount}</p>
                  <p className="text-2xl font-black text-yellow-700">{partialCount}</p>
                  <p className="text-2xl font-black text-red-700">{unpaidCount}</p>
                  <p className="text-xs text-gray-600">Paid/Partial/Unpaid</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-green-100 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-green-600" />
                    Imbonerahamwe Rusange y'Abanyeshuri - Global Student Sheet
                  </CardTitle>
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Shakisha abanyeshuri..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-2 w-64"
                      />
                    </div>
                    <Select value={filterTrade} onValueChange={setFilterTrade}>
                      <SelectTrigger className="w-40 border-2">
                        <SelectValue placeholder="Umwuga" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Imyuga Yose</SelectItem>
                        {trades.filter(t => t.id).map(trade => (
                          <SelectItem key={trade.id} value={trade.code}>{trade.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterLevel} onValueChange={(v) => { setFilterLevel(v); }}>
                      <SelectTrigger className="w-40 border-2">
                        <SelectValue placeholder="Urwego" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Inzego Zose</SelectItem>
                        {availableLevels.map(level => (
                          <SelectItem key={level.id} value={level.display}>
                            {level.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40 border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Byose</SelectItem>
                        <SelectItem value="paid">Yishyuye</SelectItem>
                        <SelectItem value="partial">Yishyuye Igice</SelectItem>
                        <SelectItem value="unpaid">Ntiyishyura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 bg-gradient-to-r from-green-50 to-teal-50">
                        <th className="text-left py-3 px-4 font-bold">Umwana</th>
                        <th className="text-left py-3 px-4 font-bold">Umwuga</th>
                        <th className="text-left py-3 px-4 font-bold">Urwego</th>
                        <th className="text-right py-3 px-4 font-bold">Yishyuwe</th>
                        <th className="text-right py-3 px-4 font-bold">Yasabwe</th>
                        <th className="text-right py-3 px-4 font-bold">Ideni</th>
                        <th className="text-center py-3 px-4 font-bold">Uko Bimeze</th>
                        <th className="text-center py-3 px-4 font-bold">Ibikorwa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <motion.tr
                          key={student.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b hover:bg-green-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-900">{student.first_name} {student.last_name}</p>
                              <p className="text-xs text-gray-500">{student.student_code || student.student_id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium">{student.trade || student.trade_name || 'N/A'}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">Urwego {student.level || student.level_number || 'N/A'}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-green-600">
                            {(student.total_paid || student.paid_amount || 0).toLocaleString()} RWF
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-700">
                            {(student.total_invoiced || student.total_amount || 0).toLocaleString()} RWF
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-red-600">
                            {(student.balance || 0).toLocaleString()} RWF
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={
                              student.payment_status === 'paid' ? 'bg-green-100 text-green-700 font-semibold' :
                              student.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700 font-semibold' :
                              'bg-red-100 text-red-700 font-semibold'
                            }>
                              {student.payment_status === 'paid' ? 'Yishyuye' : 
                               student.payment_status === 'partial' ? 'Igice' : 'Ntiyishyura'}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">{student.percentage_paid || 0}%</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-600 text-green-600 hover:bg-green-50"
                                onClick={() => {
                                  setNewPayment({ ...newPayment, student_id: student.id.toString() });
                                }}
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                Ishyura
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                onClick={() => handleContactParent(student.id)}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Hamagara
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <Card className="border-2 border-orange-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-orange-600" />
                  Igenamiterere cy'ibutsa ababyeyi (Auto-remind timing)
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Hindura igihe ababyeyi bafite ideni bakoresheje ibutsa (remind parent after X days). Bikwa mu database.</p>
              </CardHeader>
              <CardContent className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reminder-enabled"
                    checked={reminderForm.enabled}
                    onChange={(e) => setReminderForm(f => ({ ...f, enabled: e.target.checked }))}
                    className="rounded border-2"
                  />
                  <Label htmlFor="reminder-enabled">Gukoresha ibutsa by\'amafaranga (Auto-reminder enabled)</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Igihe cyo gukora ibutsa nyuma y\'iminsi (Remind after days)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={90}
                      value={reminderForm.remind_after_days}
                      onChange={(e) => setReminderForm(f => ({ ...f, remind_after_days: parseInt(e.target.value, 10) || 7 }))}
                      placeholder="7"
                    />
                    <p className="text-xs text-gray-500 mt-1">Iminsi nyuma y\'itariki y\'ideni (e.g. 7 = ibutsa nyuma y\'icyumweru)</p>
                  </div>
                  <div>
                    <Label>Igihe cy\'umunsi (Time of day)</Label>
                    <Input
                      type="time"
                      value={reminderForm.time}
                      onChange={(e) => setReminderForm(f => ({ ...f, time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Igipimo cyo gukora (Frequency)</Label>
                    <Select value={reminderForm.frequency} onValueChange={(v) => setReminderForm(f => ({ ...f, frequency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Buri munsi</SelectItem>
                        <SelectItem value="weekly">Buri cyumweru</SelectItem>
                        <SelectItem value="biweekly">Kabiri mu cyumweru</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ideni rikiri hasi (Min balance RWF)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={reminderForm.minBalance}
                      onChange={(e) => setReminderForm(f => ({ ...f, minBalance: parseInt(e.target.value, 10) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveReminderSettings}
                  disabled={reminderSaving}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                >
                  {reminderSaving ? 'Bika...' : 'Bika Igenamiterere'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card className="border-2 border-green-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Ibikorwa Biheruka - Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview?.recent_transactions?.slice(0, 10).map((transaction: any, index: number) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <CreditCard className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-semibold">
                            {transaction.first_name} {transaction.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.student_id}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.payment_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {transaction.amount?.toLocaleString()} RWF
                        </p>
                        <p className="text-xs text-gray-500">{transaction.payment_method}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-2 border-blue-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Raporo z'Amafaranga - Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2 border-green-200">
                    <CardContent className="p-6 text-center">
                      <p className="text-3xl font-black text-green-600">{paidCount}</p>
                      <p className="text-sm text-gray-600 mt-2">Abanyeshuri Bishyuye</p>
                      <p className="text-xs text-gray-500">Students Who Paid</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-yellow-200">
                    <CardContent className="p-6 text-center">
                      <p className="text-3xl font-black text-yellow-600">{partialCount}</p>
                      <p className="text-sm text-gray-600 mt-2">Bishyuye Igice</p>
                      <p className="text-xs text-gray-500">Partial Payment</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-red-200">
                    <CardContent className="p-6 text-center">
                      <p className="text-3xl font-black text-red-600">{unpaidCount}</p>
                      <p className="text-sm text-gray-600 mt-2">Ntibashyura</p>
                      <p className="text-xs text-gray-500">Not Paid</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-6">
                  <Button onClick={exportData} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Pakurura Raporo Yuzuye (CSV)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="columns" className="space-y-6">
            <AccountantDynamicColumns />
          </TabsContent>

          <TabsContent value="payment-proofs" className="space-y-6">
            <AccountantPaymentProofs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

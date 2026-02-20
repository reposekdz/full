import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, TrendingUp, AlertCircle, Plus, Search, Download, Eye, CreditCard, CheckCircle, XCircle, Clock, Edit2, Save, X, RefreshCw, BarChart3, FileText, Calendar, Shield, Bell, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:3000/api';

interface Student {
  student_id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
  gender: string;
  phone: string;
  trade_name: string;
  trade_code: string;
  level_number: number;
  conduct_score: number;
  attendance_percentage: number;
  total_fees: number;
  total_paid: number;
  balance: number;
  payment_status: string;
  conduct_incidents: number;
  linked_parents_count: number;
}

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

const StatCard = ({ label, value, icon, gradient, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
    whileHover={{ y: -4, scale: 1.02 }}
  >
    <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient} text-white`}>
      <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-white/80 font-medium">{label}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AccountantDashboard({ onNavigate, onLogout }: any) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('1');
  const [paymentReference, setPaymentReference] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    checkPasswordChange();
    fetchStudents();
    fetchStatistics();
  }, [selectedTrade, selectedLevel, searchTerm, paymentFilter]);

  const checkPasswordChange = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/check-password-change`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.force_password_change) {
        setShowPasswordModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ newPassword })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTrade !== 'all') params.append('trade', selectedTrade);
      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (searchTerm) params.append('search', searchTerm);
      if (paymentFilter !== 'all') params.append('payment_status', paymentFilter);
      
      const response = await fetch(`${API_BASE}/accountant/global-students?${params}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
        if (data.trades) setTrades(data.trades);
        if (data.levels) setLevels(data.levels);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE}/accountant/statistics`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const recordPayment = async () => {
    if (!selectedStudent || !paymentAmount) return;
    
    try {
      const response = await fetch(`${API_BASE}/accountant/payments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          amount: parseFloat(paymentAmount),
          payment_method_id: parseInt(paymentMethod),
          reference_number: paymentReference,
          payment_date: new Date().toISOString().split('T')[0],
          notes: ''
        })
      });
      const data = await response.json();
      if (data.force_password_change) {
        setShowPasswordModal(true);
        return;
      }
      if (data.success) {
        toast.success('Payment recorded! Parents notified via SMS');
        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentReference('');
        fetchStudents();
        fetchStatistics();
      }
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-500/15 text-green-700 border-green-200';
      case 'Partial': return 'bg-yellow-500/15 text-yellow-700 border-yellow-200';
      case 'Unpaid': return 'bg-red-500/15 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConductColor = (score: number) => {
    if (score >= 36) return 'text-green-600';
    if (score >= 28) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                <DollarSign className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Garden TVET</h1>
                <p className="text-xs text-slate-500">Accountant Office</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-[18px] text-muted-foreground" />
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {statistics?.unpaid_count || 0}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unpaid Students</TooltipContent>
              </Tooltip>
              {onLogout && (
                <Button variant="outline" size="sm" onClick={onLogout} className="text-red-600 border-red-200 hover:bg-red-50">
                  <LogOut className="size-[18px] mr-1" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
              <Progress value={65} className="h-1" />
            </motion.div>
          )}

          {/* Brand Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-r from-[#1565C0] via-[#1976D2] to-[#0D47A1] text-white shadow-xl">
              <CardContent className="py-5 px-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Garden TVET School</h2>
                    <p className="text-sm text-white/80">Financial Management System - Global Students Sheet</p>
                    <p className="text-xs text-white/50 italic">Gucunga Amafaranga y'Ishuri</p>
                  </div>
                  <Button
                    onClick={() => { fetchStudents(); fetchStatistics(); }}
                    className="bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
                  >
                    <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard index={0} label="Total Students" value={statistics?.total_students || 0}
              icon={<Users className="size-6" />}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
            <StatCard index={1} label="Total Collected" value={formatCurrency(statistics?.total_collected || 0)}
              icon={<CheckCircle className="size-6" />}
              gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
            <StatCard index={2} label="Outstanding" value={formatCurrency(statistics?.total_outstanding || 0)}
              icon={<AlertCircle className="size-6" />}
              gradient="bg-gradient-to-br from-red-500 to-rose-600" />
            <StatCard index={3} label="Total Fees" value={formatCurrency(statistics?.total_fees || 0)}
              icon={<TrendingUp className="size-6" />}
              gradient="bg-gradient-to-br from-purple-500 to-pink-600" />
          </div>

          {/* Payment Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{statistics?.fully_paid_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Fully Paid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Clock className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{statistics?.partial_paid_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Partial Payment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <XCircle className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{statistics?.unpaid_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Unpaid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="shadow-sm mb-6">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trades</SelectItem>
                    {trades.map(t => (
                      <SelectItem key={t.trade_code} value={t.trade_code}>{t.trade_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map(l => (
                      <SelectItem key={l.level_number} value={l.level_number.toString()}>Level {l.level_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Global Students Sheet */}
          <Card className="shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3 className="text-xl font-bold">Global Students Sheet - {students.length} Students</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] hover:from-[#1565C0] hover:to-[#1976D2]">
                  <TableHead className="text-white font-semibold">Admission #</TableHead>
                  <TableHead className="text-white font-semibold">Name</TableHead>
                  <TableHead className="text-white font-semibold">Trade</TableHead>
                  <TableHead className="text-white font-semibold">Level</TableHead>
                  <TableHead className="text-white font-semibold">Phone</TableHead>
                  <TableHead className="text-white font-semibold">Conduct</TableHead>
                  <TableHead className="text-white font-semibold">Attendance</TableHead>
                  <TableHead className="text-white font-semibold">Total Fees</TableHead>
                  <TableHead className="text-white font-semibold">Paid</TableHead>
                  <TableHead className="text-white font-semibold">Balance</TableHead>
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-white font-semibold">Parents</TableHead>
                  <TableHead className="text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, i) => (
                  <motion.tr
                    key={student.student_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b hover:bg-muted/50"
                  >
                    <TableCell className="font-semibold text-blue-600">{student.admission_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xs">
                            {student.first_name[0]}{student.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.first_name} {student.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{student.trade_code}</Badge>
                    </TableCell>
                    <TableCell>L{student.level_number}</TableCell>
                    <TableCell className="font-mono text-sm">{student.phone}</TableCell>
                    <TableCell>
                      <span className={`text-lg font-bold ${getConductColor(student.conduct_score)}`}>
                        {student.conduct_score}/40
                      </span>
                    </TableCell>
                    <TableCell>{student.attendance_percentage}%</TableCell>
                    <TableCell className="font-medium">{formatCurrency(student.total_fees)}</TableCell>
                    <TableCell className="font-medium text-green-600">{formatCurrency(student.total_paid)}</TableCell>
                    <TableCell className="font-bold text-red-600">{formatCurrency(student.balance)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.payment_status)}>
                        {student.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.linked_parents_count > 0 ? 'default' : 'outline'}>
                        {student.linked_parents_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowPaymentModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CreditCard className="size-3 mr-1" />
                        Pay
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CreditCard className="size-5" />
              Record Payment
            </DialogTitle>
            <DialogDescription>
              Student: {selectedStudent?.first_name} {selectedStudent?.last_name}<br/>
              Balance: {formatCurrency(selectedStudent?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount *</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Cash</SelectItem>
                  <SelectItem value="2">Bank Transfer</SelectItem>
                  <SelectItem value="3">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Transaction reference"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={recordPayment} className="bg-green-600 hover:bg-green-700">
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="size-5" />
              Password Change Required
            </DialogTitle>
            <DialogDescription>
              You must change your password before continuing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Password *</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordChange} className="w-full bg-red-600 hover:bg-red-700">
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

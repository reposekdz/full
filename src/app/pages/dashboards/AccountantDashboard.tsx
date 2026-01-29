import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Users, AlertCircle, Plus, Search, Download, CreditCard, Wallet, PieChart, Upload, Columns } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import apiService from '@/app/services/apiService';
import AccountantPaymentProofs from '@/app/components/AccountantPaymentProofs';
import AccountantDynamicColumns from '@/app/components/AccountantDynamicColumns';

export default function AccountantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newPayment, setNewPayment] = useState({
    student_id: '',
    amount: '',
    payment_method: 'cash',
    transaction_ref: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, studentsData] = await Promise.all([
        apiService.getAccountantOverview(),
        apiService.getAccountantStudents()
      ]);
      setOverview(overviewData.data);
      setStudents(studentsData.students || []);
    } catch (error) {
      console.error('Failed to fetch accountant data:', error);
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
      alert('Payment recorded successfully!');
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
      alert('Failed to record payment: ' + error.message);
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
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.payment_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const collectionRate = overview ? ((overview.total_collected / overview.total_expected) * 100).toFixed(1) : 0;

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
          <div className="flex gap-3">
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
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-green-200 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Incamake
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Abanyeshuri
            </TabsTrigger>
            <TabsTrigger value="columns" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Columns className="w-4 h-4 mr-2" />
              Inkingi
            </TabsTrigger>
            <TabsTrigger value="payment-proofs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Ibyemezo by'Kwishyura
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>

            <Card className="border-2 border-green-100 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Student Fee Records</CardTitle>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-2"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40 border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left py-3 px-4">Student</th>
                        <th className="text-left py-3 px-4">Class</th>
                        <th className="text-right py-3 px-4">Total Amount</th>
                        <th className="text-right py-3 px-4">Paid</th>
                        <th className="text-right py-3 px-4">Balance</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-right py-3 px-4">Actions</th>
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
                              <p className="font-semibold">{student.first_name} {student.last_name}</p>
                              <p className="text-xs text-gray-500">{student.student_id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{student.trade_name}</p>
                            <p className="text-xs text-gray-500">Level {student.level_number}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {(student.total_amount || 0).toLocaleString()} RWF
                          </td>
                          <td className="py-3 px-4 text-right text-green-600 font-semibold">
                            {(student.paid_amount || 0).toLocaleString()} RWF
                          </td>
                          <td className="py-3 px-4 text-right text-red-600 font-semibold">
                            {(student.balance || 0).toLocaleString()} RWF
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              student.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                              student.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {student.payment_status || 'unpaid'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setNewPayment({ ...newPayment, student_id: student.id.toString() });
                              }}
                            >
                              <CreditCard className="w-3 h-3 mr-1" />
                              Pay
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card className="border-2 border-green-100 shadow-xl">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
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

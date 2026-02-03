import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  DollarSign, TrendingUp, TrendingDown, Users, Calendar,
  Bell, Send, FileText, BarChart3, PieChart, ArrowUpRight,
  ArrowDownRight, CreditCard, AlertCircle, CheckCircle,
  Clock, Download, Filter, Search, Plus, Eye, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '@/app/config/apiBase';

const API_BASE = `${API_BASE_URL}/accountant-ultra-advanced`;

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface DashboardData {
  income_summary: any;
  expense_summary: any;
  student_fees_summary: any;
  recent_payments: any[];
  overdue_payments: any[];
  monthly_trends: any[];
  category_breakdown: any[];
}

const AccountantUltraAdvancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [overduePayments, setOverduePayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [dateFilters, setDateFilters] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const [newPayment, setNewPayment] = useState({
    student_id: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [reminderForm, setReminderForm] = useState({
    student_id: '',
    message: 'Dear Parent, this is a reminder about your child\'s pending school fees. Please make payment at your earliest convenience.',
    reminder_type: 'overdue'
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchDashboard();
    fetchAnalytics();
  }, []);

  const fetchDashboard = async () => {
    try {
      const queryString = new URLSearchParams(dateFilters).toString();
      const response = await axios.get(`${API_BASE}/dashboard?${queryString}`, config);
      if (response.data.success) {
        setDashboardData(response.data.dashboard);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_BASE}/analytics?period=month`, config);
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(dateFilters).toString();
      const response = await axios.get(`${API_BASE}/payments/history?${queryString}`, config);
      if (response.data.success) {
        setPayments(response.data.payments);
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/payments/record`, newPayment, config);
      if (response.data.success) {
        showMessage('success', 'Payment recorded successfully');
        fetchDashboard();
        fetchPayments();
        setNewPayment({
          student_id: '',
          amount: '',
          payment_method: 'cash',
          reference_number: '',
          payment_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/reminders/send`, reminderForm, config);
      if (response.data.success) {
        showMessage('success', 'Payment reminder sent successfully');
        setReminderForm({
          student_id: '',
          message: 'Dear Parent, this is a reminder about your child\'s pending school fees. Please make payment at your earliest convenience.',
          reminder_type: 'overdue'
        });
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to send reminder');
    } finally {
      setLoading(false);
    }
  };

  const sendBulkReminders = async (type: string) => {
    if (!confirm(`Are you sure you want to send ${type} payment reminders to all applicable parents?`)) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/reminders/bulk-send`, { reminder_type: type }, config);
      if (response.data.success) {
        showMessage('success', `Bulk reminders sent: ${response.data.sent_count} messages`);
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to send bulk reminders');
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialReport = async () => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(dateFilters).toString();
      const response = await axios.post(`${API_BASE}/reports/generate?${queryString}`, {}, config);
      if (response.data.success) {
        showMessage('success', 'Financial report generated successfully');
        const blob = new Blob([JSON.stringify(response.data.report, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${dateFilters.start_date}-${dateFilters.end_date}.json`;
        a.click();
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign size={20} /> },
    { id: 'reminders', label: 'Reminders', icon: <Bell size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                <DollarSign className="text-white" size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Accountant Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Financial Management & Analytics</p>
              </div>
            </div>
            <Button onClick={fetchDashboard} variant="outline">
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {message.text && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {dashboardData && activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <ArrowUpRight size={32} />
                <Badge className="bg-white/20">Income</Badge>
              </div>
              <h3 className="text-2xl font-bold">${dashboardData.income_summary.total_income?.toLocaleString() || 0}</h3>
              <p className="text-green-100">Total Income</p>
              <div className="mt-2 text-sm">{dashboardData.income_summary.transaction_count} transactions</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <ArrowDownRight size={32} />
                <Badge className="bg-white/20">Expense</Badge>
              </div>
              <h3 className="text-2xl font-bold">${dashboardData.expense_summary.total_expenses?.toLocaleString() || 0}</h3>
              <p className="text-red-100">Total Expenses</p>
              <div className="mt-2 text-sm">{dashboardData.expense_summary.transaction_count} transactions</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle size={32} />
                <Badge className="bg-white/20">{dashboardData.student_fees_summary.fully_paid}</Badge>
              </div>
              <h3 className="text-2xl font-bold">${dashboardData.student_fees_summary.collected_fees?.toLocaleString() || 0}</h3>
              <p className="text-blue-100">Collected Fees</p>
              <div className="mt-2 text-sm">of ${dashboardData.student_fees_summary.expected_fees?.toLocaleString()}</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle size={32} />
                <Badge className="bg-white/20">{dashboardData.overdue_payments?.length || 0}</Badge>
              </div>
              <h3 className="text-2xl font-bold">${dashboardData.student_fees_summary.outstanding_fees?.toLocaleString() || 0}</h3>
              <p className="text-orange-100">Outstanding Fees</p>
              <div className="mt-2 text-sm">{dashboardData.student_fees_summary.unpaid + dashboardData.student_fees_summary.partial_paid} students</div>
            </motion.div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'payments') fetchPayments();
                }}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && dashboardData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Financial Overview</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Income vs Expense Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={dashboardData.monthly_trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Expense Category Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RePieChart>
                            <Pie
                              data={dashboardData.category_breakdown}
                              dataKey="total_amount"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label
                            >
                              {dashboardData.category_breakdown.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </RePieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {dashboardData.recent_payments?.slice(0, 10).map((payment: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                              <div>
                                <h4 className="font-semibold">{payment.first_name} {payment.last_name}</h4>
                                <p className="text-sm text-gray-600">{payment.student_code} - {new Date(payment.payment_date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">${payment.amount}</p>
                                <Badge variant="outline">{payment.payment_method}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="text-red-600" size={24} />
                          Overdue Payments ({dashboardData.overdue_payments?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {dashboardData.overdue_payments?.slice(0, 10).map((payment: any, index: number) => (
                            <div key={index} className="p-3 border-l-4 border-red-500 bg-red-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold">{payment.student_name}</h4>
                                <Badge className="bg-red-100 text-red-800">{payment.days_overdue} days</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{payment.student_code}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-sm">Balance: <strong>${payment.balance}</strong></p>
                                <p className="text-xs text-gray-500">{payment.guardian_phone}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Payment Management</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Record New Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={recordPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Student ID</Label>
                          <Input
                            type="number"
                            value={newPayment.student_id}
                            onChange={(e) => setNewPayment({ ...newPayment, student_id: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={newPayment.amount}
                            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Payment Method</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={newPayment.payment_method}
                            onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
                          >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="mobile_money">Mobile Money</option>
                            <option value="card">Card</option>
                            <option value="check">Check</option>
                          </select>
                        </div>
                        <div>
                          <Label>Reference Number</Label>
                          <Input
                            value={newPayment.reference_number}
                            onChange={(e) => setNewPayment({ ...newPayment, reference_number: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Payment Date</Label>
                          <Input
                            type="date"
                            value={newPayment.payment_date}
                            onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Input
                            value={newPayment.notes}
                            onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Button type="submit" disabled={loading} className="w-full">
                            <Plus size={18} className="mr-2" />
                            Record Payment
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Payment History</span>
                        <Button onClick={fetchPayments} variant="outline" size="sm">
                          <RefreshCw size={16} className="mr-2" />
                          Refresh
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {payments.map((payment: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CreditCard className="text-green-600" size={24} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{payment.first_name} {payment.last_name}</h4>
                                <p className="text-sm text-gray-600">{payment.student_code} - {new Date(payment.payment_date).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">{payment.payment_method}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-lg">${payment.amount}</p>
                              {payment.reference_number && (
                                <p className="text-xs text-gray-500">Ref: {payment.reference_number}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'reminders' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Payment Reminders</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Send Individual Reminder</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={sendReminder} className="space-y-4">
                          <div>
                            <Label>Student ID</Label>
                            <Input
                              type="number"
                              value={reminderForm.student_id}
                              onChange={(e) => setReminderForm({ ...reminderForm, student_id: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Reminder Type</Label>
                            <select
                              className="w-full px-3 py-2 border rounded-lg"
                              value={reminderForm.reminder_type}
                              onChange={(e) => setReminderForm({ ...reminderForm, reminder_type: e.target.value })}
                            >
                              <option value="overdue">Overdue Payment</option>
                              <option value="outstanding">Outstanding Balance</option>
                              <option value="reminder">General Reminder</option>
                            </select>
                          </div>
                          <div>
                            <Label>Message</Label>
                            <textarea
                              className="w-full px-3 py-2 border rounded-lg"
                              rows={4}
                              value={reminderForm.message}
                              onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                              required
                            />
                          </div>
                          <Button type="submit" disabled={loading} className="w-full">
                            <Send size={18} className="mr-2" />
                            Send Reminder
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Bulk Reminder Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Alert className="bg-blue-50 border-blue-200">
                          <AlertDescription className="text-blue-800">
                            Send automated SMS reminders to multiple parents at once based on payment status.
                          </AlertDescription>
                        </Alert>
                        
                        <Button
                          onClick={() => sendBulkReminders('overdue')}
                          disabled={loading}
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          <Bell size={18} className="mr-2" />
                          Send Overdue Payment Reminders
                        </Button>
                        
                        <Button
                          onClick={() => sendBulkReminders('outstanding')}
                          disabled={loading}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          <Bell size={18} className="mr-2" />
                          Send Outstanding Balance Reminders
                        </Button>
                        
                        <Button
                          onClick={() => sendBulkReminders('upcoming')}
                          disabled={loading}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Bell size={18} className="mr-2" />
                          Send Upcoming Deadline Reminders
                        </Button>
                        
                        <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
                          <h4 className="font-semibold mb-2">Reminder Statistics</h4>
                          <div className="space-y-1 text-sm">
                            <p>Overdue: {dashboardData?.overdue_payments?.length || 0} students</p>
                            <p>Outstanding: {dashboardData?.student_fees_summary?.partial_paid || 0} students</p>
                            <p>Unpaid: {dashboardData?.student_fees_summary?.unpaid || 0} students</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && analytics && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Financial Analytics</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Income by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.income_by_category}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total_amount" fill="#10B981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Financial Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analytics.daily_trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Financial Reports</h2>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Generate Financial Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={dateFilters.start_date}
                              onChange={(e) => setDateFilters({ ...dateFilters, start_date: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={dateFilters.end_date}
                              onChange={(e) => setDateFilters({ ...dateFilters, end_date: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <Alert className="bg-blue-50 border-blue-200">
                          <AlertDescription className="text-blue-800">
                            Generate comprehensive financial reports including income, expenses, student fees collection, and transaction details.
                          </AlertDescription>
                        </Alert>
                        
                        <Button onClick={generateFinancialReport} disabled={loading} className="w-full">
                          <Download size={18} className="mr-2" />
                          Generate & Download Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantUltraAdvancedDashboard;

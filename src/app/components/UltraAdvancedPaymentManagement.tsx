import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Send, Download, Plus, Search, Filter, Calendar, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Phone, Mail, MessageSquare, FileText, BarChart3, PieChart, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import * as XLSX from 'xlsx';

interface PaymentRecord {
  id: number;
  student_id: number;
  student_name: string;
  student_code: string;
  trade: string;
  level: number;
  total_fees: number;
  paid_amount: number;
  balance: number;
  payment_method: string;
  last_payment_date: string;
  term: string;
  academic_year: string;
  status: 'paid' | 'partial' | 'overdue' | 'pending';
  parent_phone: string;
  parent_email: string;
  payment_history: Payment[];
}

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  reference: string;
  date: string;
  term: string;
}

interface PaymentColumn {
  id: string;
  name: string;
  amount: number;
  term: string;
  academic_year: string;
  due_date: string;
  is_active: boolean;
}

const UltraAdvancedPaymentManagement: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [columns, setColumns] = useState<PaymentColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PaymentRecord | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    term: 'all',
    trade: 'all',
    minBalance: 0,
    maxBalance: 1000000
  });

  const [newColumn, setNewColumn] = useState({
    name: '',
    amount: 0,
    term: 'Term 1',
    academic_year: '2024',
    due_date: ''
  });

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_method: 'cash',
    reference: '',
    term: 'Term 1'
  });

  const canAddColumn = ['accountant', 'teacher', 'admin', 'headmaster'].includes(userRole);

  useEffect(() => {
    fetchPaymentData();
  }, [filters]);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, columnsRes] = await Promise.all([
        apiService.request('/payments/students'),
        apiService.request('/payments/columns')
      ]);

      if (paymentsRes.success) setPayments(paymentsRes.payments || []);
      if (columnsRes.success) setColumns(columnsRes.columns || []);
    } catch (error) {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async () => {
    try {
      const response = await apiService.request('/payments/columns/add', {
        method: 'POST',
        body: JSON.stringify(newColumn)
      });

      if (response.success) {
        toast.success('Payment column added successfully');
        setShowAddColumn(false);
        fetchPaymentData();
      }
    } catch (error) {
      toast.error('Failed to add column');
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedStudent) return;

    try {
      const response = await apiService.request('/payments/record', {
        method: 'POST',
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          ...paymentData
        })
      });

      if (response.success) {
        toast.success('Payment recorded successfully');
        setShowPaymentModal(false);
        fetchPaymentData();
      }
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleSendReminder = async (studentId: number) => {
    try {
      const response = await apiService.request('/payments/send-reminder', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId })
      });

      if (response.success) {
        toast.success('Payment reminder sent via SMS');
      }
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const handleBulkReminder = async () => {
    try {
      const response = await apiService.request('/payments/bulk-reminder', {
        method: 'POST',
        body: JSON.stringify({ student_ids: selectedPayments })
      });

      if (response.success) {
        toast.success(`Reminders sent to ${selectedPayments.length} parents`);
      }
    } catch (error) {
      toast.error('Failed to send bulk reminders');
    }
  };

  const exportToExcel = () => {
    const data = payments.map(p => ({
      'Student Code': p.student_code,
      'Student Name': p.student_name,
      'Trade': p.trade,
      'Level': p.level,
      'Total Fees': p.total_fees,
      'Paid': p.paid_amount,
      'Balance': p.balance,
      'Status': p.status,
      'Last Payment': p.last_payment_date,
      'Payment Method': p.payment_method
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `Payment_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Report exported successfully');
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.student_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filters.status === 'all' || p.status === filters.status;
    const matchesTrade = filters.trade === 'all' || p.trade === filters.trade;
    const matchesBalance = p.balance >= filters.minBalance && p.balance <= filters.maxBalance;
    
    return matchesSearch && matchesStatus && matchesTrade && matchesBalance;
  });

  const stats = {
    totalExpected: payments.reduce((sum, p) => sum + p.total_fees, 0),
    totalCollected: payments.reduce((sum, p) => sum + p.paid_amount, 0),
    totalBalance: payments.reduce((sum, p) => sum + p.balance, 0),
    paidCount: payments.filter(p => p.status === 'paid').length,
    overdueCount: payments.filter(p => p.status === 'overdue').length
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="w-8 h-8" />
              Payment Management System
            </h1>
            <p className="text-green-100 mt-1">Track fees, record payments, send reminders</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchPaymentData} variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            {canAddColumn && (
              <Button onClick={() => setShowAddColumn(true)} className="bg-white text-green-600 hover:bg-green-50">
                <Plus className="w-4 h-4 mr-2" /> Add Fee Column
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 p-6">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expected</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalExpected.toLocaleString()} RWF</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalCollected.toLocaleString()} RWF</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalBalance.toLocaleString()} RWF</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fully Paid</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.paidCount}</p>
            </div>
            <Users className="w-10 h-10 text-emerald-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-orange-600">{stats.overdueCount}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={filters.trade}
            onChange={(e) => setFilters({...filters, trade: e.target.value})}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Trades</option>
            <option value="SOD">SOD</option>
            <option value="BDC">BDC</option>
            <option value="AUTO">AUTO</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {selectedPayments.length > 0 && (
            <Button onClick={handleBulkReminder} className="bg-orange-600 hover:bg-orange-700">
              <Send className="w-4 h-4 mr-2" /> Send Reminders ({selectedPayments.length})
            </Button>
          )}
          <Button onClick={exportToExcel} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Payment Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPayments(filteredPayments.map(p => p.student_id));
                      } else {
                        setSelectedPayments([]);
                      }
                    }}
                    className="w-4 h-4"
                  />
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Student</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Trade/Level</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Total Fees</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Paid</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Balance</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Payment Method</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.student_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayments([...selectedPayments, payment.student_id]);
                        } else {
                          setSelectedPayments(selectedPayments.filter(id => id !== payment.student_id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-gray-900">{payment.student_name}</p>
                      <p className="text-sm text-gray-500">{payment.student_code}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium">{payment.trade} - L{payment.level}</span>
                  </td>
                  <td className="p-3 text-right font-semibold">{payment.total_fees.toLocaleString()} RWF</td>
                  <td className="p-3 text-right text-green-600 font-semibold">{payment.paid_amount.toLocaleString()} RWF</td>
                  <td className="p-3 text-right text-red-600 font-semibold">{payment.balance.toLocaleString()} RWF</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {payment.payment_method}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedStudent(payment);
                          setShowPaymentModal(true);
                        }}
                        className="p-1.5 hover:bg-green-100 rounded transition-colors"
                        title="Record Payment"
                      >
                        <CreditCard className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleSendReminder(payment.student_id)}
                        className="p-1.5 hover:bg-orange-100 rounded transition-colors"
                        title="Send SMS Reminder"
                      >
                        <Send className="w-4 h-4 text-orange-600" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                        title="View History"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Column Modal */}
      {showAddColumn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add Fee Column</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Column Name</label>
                <Input
                  value={newColumn.name}
                  onChange={(e) => setNewColumn({...newColumn, name: e.target.value})}
                  placeholder="e.g., Tuition Fee, Lab Fee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (RWF)</label>
                <Input
                  type="number"
                  value={newColumn.amount}
                  onChange={(e) => setNewColumn({...newColumn, amount: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Term</label>
                <select
                  value={newColumn.term}
                  onChange={(e) => setNewColumn({...newColumn, term: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <Input
                  type="date"
                  value={newColumn.due_date}
                  onChange={(e) => setNewColumn({...newColumn, due_date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowAddColumn(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddColumn} className="flex-1 bg-green-600 hover:bg-green-700">
                Add Column
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Record Payment</h2>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="font-medium">{selectedStudent.student_name}</p>
              <p className="text-sm text-gray-600">Balance: {selectedStudent.balance.toLocaleString()} RWF</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (RWF)</label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reference Number</label>
                <Input
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                  placeholder="Transaction reference"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowPaymentModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleRecordPayment} className="flex-1 bg-green-600 hover:bg-green-700">
                Record Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraAdvancedPaymentManagement;

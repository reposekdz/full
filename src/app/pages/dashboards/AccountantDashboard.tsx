import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Users, TrendingUp, AlertCircle, Plus, Search, Filter, Download, Edit, Trash2, Eye, CreditCard, FileText, BarChart3, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

interface Student {
  student_id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
  gender: string;
  phone: string;
  email: string;
  trade_name: string;
  trade_code: string;
  level_number: number;
  level_name: string;
  total_fees: number;
  total_paid: number;
  balance: number;
  payment_status: 'Paid' | 'Partial' | 'Unpaid';
  enrollment_date: string;
  status: string;
}

interface Fee {
  fee_id: number;
  student_id: number;
  fee_type_id: number;
  fee_type_name: string;
  amount: number;
  due_date: string;
  term: string;
  academic_year: number;
  description: string;
  status: string;
}

interface Payment {
  payment_id: number;
  student_id: number;
  amount: number;
  payment_method_id: number;
  method_name: string;
  reference_number: string;
  payment_date: string;
  notes: string;
  recorded_by_name: string;
}

interface Statistics {
  total_students: number;
  total_fees: number;
  total_collected: number;
  total_outstanding: number;
  fully_paid_count: number;
  partial_paid_count: number;
  unpaid_count: number;
}

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export default function AccountantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddFee, setShowAddFee] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFees, setStudentFees] = useState<Fee[]>([]);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  
  // Forms
  const [newStudent, setNewStudent] = useState({
    first_name: '', last_name: '', gender: 'Male', date_of_birth: '',
    phone: '', email: '', address: '', trade_code: 'SOD', level_number: '4'
  });
  
  const [newFee, setNewFee] = useState({
    student_id: 0, fee_type_id: 1, amount: 0, due_date: '',
    term: 'Term 1', academic_year: new Date().getFullYear(), description: ''
  });
  
  const [newPayment, setNewPayment] = useState({
    student_id: 0, amount: 0, payment_method_id: 1,
    reference_number: '', payment_date: new Date().toISOString().split('T')[0], notes: ''
  });

  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    fetchStatistics();
    fetchStudents();
    fetchFeeTypes();
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedTrade, selectedLevel, searchTerm, paymentFilter]);

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE}/accountant/statistics`, {
        headers: authHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
        setRecentPayments(data.recentPayments || []);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Set default statistics to prevent blank page
      setStatistics({
        total_students: 0,
        total_fees: 0,
        total_collected: 0,
        total_outstanding: 0,
        fully_paid_count: 0,
        partial_paid_count: 0,
        unpaid_count: 0
      });
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
      params.append('limit', '200');
      
      const response = await fetch(`${API_BASE}/accountant/global-students?${params}`, {
        headers: authHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Keep existing students or set empty array
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/accountant/fee-types`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setFeeTypes(data.feeTypes || []);
      }
    } catch (error) {
      console.error('Error fetching fee types:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`${API_BASE}/accountant/payment-methods`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setPaymentMethods(data.methods || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleAddStudent = async () => {
    try {
      const response = await fetch(`${API_BASE}/accountant/students`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newStudent)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Student added successfully!');
        setShowAddStudent(false);
        fetchStudents();
        fetchStatistics();
        setNewStudent({
          first_name: '', last_name: '', gender: 'Male', date_of_birth: '',
          phone: '', email: '', address: '', trade_code: 'SOD', level_number: '4'
        });
      } else {
        toast.error(data.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  const handleAddFee = async () => {
    try {
      const response = await fetch(`${API_BASE}/accountant/fees`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newFee)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Fee added successfully!');
        setShowAddFee(false);
        fetchStudents();
        fetchStatistics();
      } else {
        toast.error(data.error || 'Failed to add fee');
      }
    } catch (error) {
      console.error('Error adding fee:', error);
      toast.error('Failed to add fee');
    }
  };

  const handleRecordPayment = async () => {
    try {
      const response = await fetch(`${API_BASE}/accountant/payments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newPayment)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Payment recorded successfully!');
        setShowRecordPayment(false);
        fetchStudents();
        fetchStatistics();
        setNewPayment({
          student_id: 0, amount: 0, payment_method_id: 1,
          reference_number: '', payment_date: new Date().toISOString().split('T')[0], notes: ''
        });
      } else {
        toast.error(data.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const viewStudentDetails = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const [feesRes, paymentsRes] = await Promise.all([
        fetch(`${API_BASE}/accountant/students/${student.student_id}/fees`, { headers: authHeaders() }),
        fetch(`${API_BASE}/accountant/students/${student.student_id}/payments`, { headers: authHeaders() })
      ]);
      const feesData = await feesRes.json();
      const paymentsData = await paymentsRes.json();
      
      if (feesData.success) setStudentFees(feesData.fees || []);
      if (paymentsData.success) setStudentPayments(paymentsData.payments || []);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const exportToCSV = async (type: string) => {
    try {
      const response = await fetch(`${API_BASE}/accountant/export-csv?type=${type}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success && data.data) {
        const csv = convertToCSV(data.data);
        downloadCSV(csv, `${type}_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="w-8 h-8" />
            Accountant Dashboard - Global Students & Financial Management
          </h1>
          <p className="text-blue-100 mt-2">Complete financial control for all students across all trades and levels</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'students', label: 'Global Students Sheet', icon: Users },
            { id: 'payments', label: 'Record Payment', icon: CreditCard },
            { id: 'fees', label: 'Manage Fees', icon: FileText },
            { id: 'reports', label: 'Reports', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/50 text-gray-600 hover:bg-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-gray-800">{statistics?.total_students || 0}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Collected</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(statistics?.total_collected || 0)}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(statistics?.total_outstanding || 0)}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Fees</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(statistics?.total_fees || 0)}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Payment Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Fully Paid</p>
                    <p className="text-3xl font-bold text-green-600">{statistics?.fully_paid_count || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Partial Payment</p>
                    <p className="text-3xl font-bold text-yellow-600">{statistics?.partial_paid_count || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Unpaid</p>
                    <p className="text-3xl font-bold text-red-600">{statistics?.unpaid_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Recent Payments
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Student</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentPayments.map(payment => (
                      <tr key={payment.payment_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm font-medium">{payment.first_name} {payment.last_name}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-3 text-sm">{payment.method_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.reference_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={selectedTrade}
                    onChange={(e) => setSelectedTrade(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Trades</option>
                    <option value="SOD">SOD</option>
                    <option value="BDC">BDC</option>
                    <option value="AUT">AUT</option>
                    <option value="ELC">ELC</option>
                    <option value="PLB">PLB</option>
                  </select>

                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                  </select>

                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Student
                  </button>
                  <button
                    onClick={() => exportToCSV('students')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Global Students Sheet - Excel-like */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Global Students Sheet - {students.length} Students
                </h3>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading students...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Admission #</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Gender</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Trade</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Level</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Phone</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Total Fees</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Paid</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Balance</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map(student => (
                        <tr key={student.student_id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">{student.admission_number}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.first_name} {student.last_name}</td>
                          <td className="px-4 py-3 text-sm">{student.gender}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {student.trade_code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">Level {student.level_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{student.phone}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(student.total_fees)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{formatCurrency(student.total_paid)}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-red-600">{formatCurrency(student.balance)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusColor(student.payment_status)}`}>
                              {student.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => viewStudentDetails(student)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setNewPayment({ ...newPayment, student_id: student.student_id });
                                  setShowRecordPayment(true);
                                }}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Record Payment"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setNewFee({ ...newFee, student_id: student.student_id });
                                  setShowAddFee(true);
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Add Fee"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-green-600" />
              Record Payment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                <select
                  value={newPayment.student_id}
                  onChange={(e) => setNewPayment({ ...newPayment, student_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value={0}>Select student...</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.admission_number} - {s.first_name} {s.last_name} (Balance: {formatCurrency(s.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={newPayment.payment_method_id}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_method_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {paymentMethods.map(method => (
                    <option key={method.payment_method_id} value={method.payment_method_id}>
                      {method.method_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                <input
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                <input
                  type="text"
                  value={newPayment.reference_number}
                  onChange={(e) => setNewPayment({ ...newPayment, reference_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Transaction reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Additional notes"
                />
              </div>
            </div>

            <button
              onClick={handleRecordPayment}
              disabled={!newPayment.student_id || !newPayment.amount}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Record Payment
            </button>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-7 h-7 text-purple-600" />
              Manage Fees
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                <select
                  value={newFee.student_id}
                  onChange={(e) => setNewFee({ ...newFee, student_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value={0}>Select student...</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.admission_number} - {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
                <select
                  value={newFee.fee_type_id}
                  onChange={(e) => setNewFee({ ...newFee, fee_type_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {feeTypes.map(type => (
                    <option key={type.fee_type_id} value={type.fee_type_id}>
                      {type.fee_type_name} ({formatCurrency(type.default_amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={newFee.amount}
                  onChange={(e) => setNewFee({ ...newFee, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={newFee.due_date}
                  onChange={(e) => setNewFee({ ...newFee, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                <select
                  value={newFee.term}
                  onChange={(e) => setNewFee({ ...newFee, term: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <input
                  type="number"
                  value={newFee.academic_year}
                  onChange={(e) => setNewFee({ ...newFee, academic_year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newFee.description}
                  onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Additional details"
                />
              </div>
            </div>

            <button
              onClick={handleAddFee}
              disabled={!newFee.student_id || !newFee.amount}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Add Fee
            </button>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Add New Student</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trade</label>
                  <select
                    value={newStudent.trade_code}
                    onChange={(e) => setNewStudent({ ...newStudent, trade_code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SOD">SOD</option>
                    <option value="BDC">BDC</option>
                    <option value="AUT">AUT</option>
                    <option value="ELC">ELC</option>
                    <option value="PLB">PLB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={newStudent.level_number}
                    onChange={(e) => setNewStudent({ ...newStudent, level_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddStudent(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

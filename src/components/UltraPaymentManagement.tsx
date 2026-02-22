import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Users, AlertCircle, CheckCircle, Clock, Send, Plus, Download,
  Search, Filter, MessageSquare, TrendingUp, Calendar, Phone, BarChart3,
  PieChart, Receipt, FileText, Wallet, Target, Award, RefreshCw, Eye
} from 'lucide-react';

const UltraPaymentManagement = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '', payment_method: 'cash', reference: '', term: 'Term 1'
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      const [studentsRes, statsRes, analyticsRes, dashboardRes] = await Promise.all([
        fetch('/api/payments/students', { headers }),
        fetch('/api/payments/stats', { headers }),
        fetch('/api/payments-advanced/analytics', { headers }),
        fetch('/api/payments-advanced/dashboard', { headers })
      ]);

      const [studentsData, statsData, analyticsData, dashboardData] = await Promise.all([
        studentsRes.json(), statsRes.json(), analyticsRes.json(), dashboardRes.json()
      ]);

      if (studentsData.success) setStudents(studentsData.payments);
      if (statsData.success) setStats(statsData.stats);
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
      if (dashboardData.success) setDashboard(dashboardData.dashboard);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async () => {
    if (!selectedStudent) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/record', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: selectedStudent.student_id, ...paymentForm })
      });
      const data = await response.json();
      if (data.success) {
        setShowRecordPayment(false);
        setPaymentForm({ amount: '', payment_method: 'cash', reference: '', term: 'Term 1' });
        setSelectedStudent(null);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendBulkReminders = async () => {
    if (selectedStudents.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/bulk-reminder', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_ids: selectedStudents })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setSelectedStudents([]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const exportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments-advanced/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const csv = [
          ['Code', 'Name', 'Trade', 'Level', 'Total Fees', 'Paid', 'Balance', 'Status'],
          ...data.data.map(s => [s.student_code, `${s.first_name} ${s.last_name}`, s.trade_code, s.level_number, s.total_fees, s.paid_amount, s.balance, s.status])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      paid: 'text-green-600 bg-green-100',
      partial: 'text-yellow-600 bg-yellow-100',
      overdue: 'text-red-600 bg-red-100',
      pending: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ultra Payment Management
            </h1>
            <p className="text-gray-600 mt-1">Advanced financial management system</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={fetchAllData} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button onClick={exportData} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            {selectedStudents.length > 0 && (
              <button onClick={sendBulkReminders} className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all shadow-lg">
                <Send className="w-4 h-4 mr-2" />
                Send Reminders ({selectedStudents.length})
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          {['overview', 'students', 'analytics', 'reports'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboard && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-8 h-8 opacity-80" />
                <span className="text-sm opacity-80">Today</span>
              </div>
              <p className="text-3xl font-bold">{dashboard.today?.total?.toLocaleString() || 0} RWF</p>
              <p className="text-sm opacity-80 mt-1">{dashboard.today?.count || 0} payments</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-sm opacity-80">This Week</span>
              </div>
              <p className="text-3xl font-bold">{dashboard.week?.total?.toLocaleString() || 0} RWF</p>
              <p className="text-sm opacity-80 mt-1">{dashboard.week?.count || 0} payments</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 opacity-80" />
                <span className="text-sm opacity-80">This Month</span>
              </div>
              <p className="text-3xl font-bold">{dashboard.month?.total?.toLocaleString() || 0} RWF</p>
              <p className="text-sm opacity-80 mt-1">{dashboard.month?.count || 0} payments</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 opacity-80" />
                <span className="text-sm opacity-80">Collection Rate</span>
              </div>
              <p className="text-3xl font-bold">{analytics?.collection_rate || 0}%</p>
              <p className="text-sm opacity-80 mt-1">Overall performance</p>
            </div>
          </div>

          {/* Main Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.total_students}</span>
                </div>
                <p className="text-gray-600 font-medium">Total Students</p>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <span className="text-green-600">✓ {stats.paid_count} Paid</span>
                  <span className="text-red-600">⚠ {stats.overdue_count} Overdue</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{stats.total_collected?.toLocaleString()} RWF</span>
                </div>
                <p className="text-gray-600 font-medium">Total Collected</p>
                <div className="mt-4 text-sm text-gray-500">
                  Expected: {stats.total_expected?.toLocaleString()} RWF
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">{stats.total_balance?.toLocaleString()} RWF</span>
                </div>
                <p className="text-gray-600 font-medium">Outstanding Balance</p>
                <div className="mt-4 text-sm text-gray-500">
                  Needs collection
                </div>
              </div>
            </div>
          )}

          {/* Recent Payments */}
          {analytics?.recent_payments && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Payments</h3>
              <div className="space-y-3">
                {analytics.recent_payments.slice(0, 5).map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.first_name} {payment.last_name}</p>
                        <p className="text-sm text-gray-500">{payment.student_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{payment.amount?.toLocaleString()} RWF</p>
                      <p className="text-sm text-gray-500">{payment.payment_method}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(filteredStudents.map(s => s.student_id));
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Trade/Level</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Fees</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Paid</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.student_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.student_id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.student_id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{student.first_name} {student.last_name}</div>
                          <div className="text-sm text-gray-500">{student.student_code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{student.trade}</div>
                        <div className="text-sm text-gray-500">Level {student.level}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.total_fees?.toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">{student.paid_amount?.toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600">{student.balance?.toLocaleString()} RWF</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(student.status)}`}>
                          {student.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowRecordPayment(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {student.parent_phone && (
                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Call Parent">
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Record Payment - {selectedStudent.first_name} {selectedStudent.last_name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (RWF)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reference</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Transaction ID"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowRecordPayment(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={recordPayment}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-bold shadow-lg transition-all"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraPaymentManagement;

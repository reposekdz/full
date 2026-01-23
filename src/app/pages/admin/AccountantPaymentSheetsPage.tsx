import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, Download, Plus, Eye, Filter } from 'lucide-react';

interface PaymentSheet {
  id: number;
  student_code: string;
  student_name: string;
  trade: string;
  level: string;
  total_fees: number;
  paid_amount: number;
  balance: number;
  payment_status: string;
  last_payment_date: string;
}

const AccountantPaymentSheetsPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [payments, setPayments] = useState<PaymentSheet[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [filters, setFilters] = useState({ trade: '', level: '', status: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_method: 'cash', reference: '' });

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  useEffect(() => {
    if (selectedClass) fetchPayments();
  }, [selectedClass]);

  const fetchClasses = async () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (filters.trade) params.append('trade', filters.trade);
    if (filters.level) params.append('level', filters.level);
    
    const res = await fetch(`http://localhost:5000/api/class-sheets/sheets?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setClasses(data.sheets);
  };

  const fetchPayments = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/class-sheets/sheets/${selectedClass}/payments?${filters.status ? `payment_status=${filters.status}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setPayments(data.students || []);
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const token = localStorage.getItem('token');
    const newPaid = parseFloat(selectedStudent.paid_amount || 0) + parseFloat(paymentForm.amount);
    
    const res = await fetch(`http://localhost:5000/api/class-sheets/sheets/${selectedClass}/payments/${selectedStudent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        total_fees: selectedStudent.total_fees,
        paid_amount: newPaid
      })
    });
    
    const data = await res.json();
    if (data.success) {
      alert('Payment recorded successfully!');
      setShowModal(false);
      fetchPayments();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);
  };

  const getStatusColor = (status: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-700 border-green-300';
    if (status === 'partial') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const totalExpected = payments.reduce((sum, p) => sum + (p.total_fees || 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const totalOutstanding = totalExpected - totalCollected;
  const paidCount = payments.filter(p => p.payment_status === 'paid').length;
  const unpaidCount = payments.filter(p => p.payment_status === 'unpaid').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-emerald-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment Sheets Management</h1>
                <p className="text-gray-600">Track student fee payments by class</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition">
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={filters.trade}
              onChange={(e) => setFilters({ ...filters, trade: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Trades</option>
              <option value="SOD">SOD</option>
              <option value="AUT">AUT</option>
              <option value="BDC">BDC</option>
            </select>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Levels</option>
              <option value="Level 3">Level 3</option>
              <option value="Level 4">Level 4</option>
              <option value="Level 5">Level 5</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {selectedClass && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Expected</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalExpected)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Collected</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
                </div>
                <CreditCard className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Payment Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{payments.length > 0 ? ((paidCount / payments.length) * 100).toFixed(0) : 0}%</p>
                </div>
                <Users className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Classes</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    selectedClass === cls.id
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">{cls.class_name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className={selectedClass === cls.id ? 'text-white/80' : 'text-gray-600'}>Paid</p>
                      <p className="font-bold">{cls.paid_students || 0}</p>
                    </div>
                    <div>
                      <p className={selectedClass === cls.id ? 'text-white/80' : 'text-gray-600'}>Unpaid</p>
                      <p className="font-bold">{cls.unpaid_students || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">
            {!selectedClass ? (
              <div className="p-12 text-center text-gray-500">
                <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Select a class to view payment details</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Total Fees</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Paid</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Balance</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No payment records</td></tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-semibold text-emerald-600">{payment.student_code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{payment.student_name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-gray-900">{formatCurrency(payment.total_fees || 0)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-green-600">{formatCurrency(payment.paid_amount || 0)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${payment.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(payment.balance || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(payment.payment_status || 'unpaid')}`}>
                              {payment.payment_status || 'unpaid'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedStudent(payment);
                                setShowModal(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              Record Payment
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {showModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Payment</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Student:</strong> {selectedStudent.student_name} ({selectedStudent.student_code})
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Total Fees:</strong> {formatCurrency(selectedStudent.total_fees || 0)}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Already Paid:</strong> {formatCurrency(selectedStudent.paid_amount || 0)}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Balance:</strong> <span className="text-red-600 font-bold">{formatCurrency(selectedStudent.balance || 0)}</span>
                </p>
              </div>

              <form onSubmit={recordPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Payment Amount (RWF)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Payment Method</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Reference Number</label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Transaction reference"
                  />
                </div>

                {paymentForm.amount && (
                  <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-green-800">
                      New Balance: {formatCurrency(Math.max(0, (selectedStudent.balance || 0) - parseFloat(paymentForm.amount)))}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                  >
                    Record Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantPaymentSheetsPage;

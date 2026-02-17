import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, CheckCircle, Clock, XCircle, Upload, DollarSign } from 'lucide-react';
import axios from 'axios';

const ParentTicketPayment = () => {
  const [children, setChildren] = useState([]);
  const [menus, setMenus] = useState([]);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'momo',
    transaction_reference: '',
    notes: '',
    payment_proof: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [menusRes, paymentsRes, summaryRes] = await Promise.all([
        axios.get('/api/tickets/parent/menus', config),
        axios.get('/api/tickets/parent/payments', config),
        axios.get('/api/tickets/parent/summary', config)
      ]);

      setChildren(menusRes.data.children);
      setMenus(menusRes.data.menus);
      setPayments(paymentsRes.data.payments);
      setSummary(summaryRes.data.summary);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('menu_id', selectedMenu.id);
    formData.append('student_id', selectedStudent);
    formData.append('amount', selectedMenu.amount);
    formData.append('payment_method', paymentForm.payment_method);
    formData.append('transaction_reference', paymentForm.transaction_reference);
    formData.append('notes', paymentForm.notes);
    if (paymentForm.payment_proof) {
      formData.append('payment_proof', paymentForm.payment_proof);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/tickets/parent/pay', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Payment submitted successfully!');
      setSelectedMenu(null);
      setSelectedStudent(null);
      setPaymentForm({ payment_method: 'momo', transaction_reference: '', notes: '', payment_proof: null });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Payment submission failed');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Children</p>
              <p className="text-2xl font-bold text-blue-900">{summary.total_children || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Paid Tickets</p>
              <p className="text-2xl font-bold text-green-900">{summary.paid_tickets || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{summary.pending_tickets || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Total Paid</p>
              <p className="text-2xl font-bold text-purple-900">{summary.total_paid?.toLocaleString() || 0} RWF</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Available Tickets */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-600" />
          Available Tickets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <div key={menu.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{menu.title}</h3>
                {menu.is_mandatory ? (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Mandatory</span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Optional</span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{menu.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-green-600">{menu.amount.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="capitalize">{menu.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Due Date:</span>
                  <span>{new Date(menu.due_date).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMenu(menu)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Pay Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Pay Ticket: {selectedMenu.title}</h2>
            
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Student</label>
                <select
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Choose a student</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.full_name} ({child.student_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="momo">Mobile Money (MTN/Airtel)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash Payment</option>
                  <option value="card">Card Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Transaction Reference</label>
                <input
                  type="text"
                  value={paymentForm.transaction_reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter transaction ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Payment Proof</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_proof: e.target.files[0] })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Any additional information"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">{selectedMenu.amount.toLocaleString()} RWF</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMenu(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Ticket</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">{payment.title}</td>
                  <td className="px-4 py-3 text-sm">{payment.student_name}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{payment.amount.toLocaleString()} RWF</td>
                  <td className="px-4 py-3 text-sm capitalize">{payment.payment_method.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentTicketPayment;

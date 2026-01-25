import React, { useState, useEffect } from 'react';
import { Search, Filter, Send, CheckCircle, XCircle, Clock, DollarSign, Users, AlertCircle, Download, Upload, Bell, Eye, Edit, Trash2, Plus, RefreshCw } from 'lucide-react';
import AccountantSidebar from '@/app/components/AccountantSidebar';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  serial_code: string;
  trade_code: string;
  level_number: number;
  level_suffix: string;
  class_name: string;
  total_fees: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
  last_payment_date: string;
  parent_phone: string;
  parent_email: string;
}

interface PaymentRecord {
  id: number;
  student_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  recorded_by: string;
}

const StudentPaymentsManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [trades, setTrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidStudents: 0,
    partialStudents: 0,
    unpaidStudents: 0,
    totalCollected: 0,
    totalRemaining: 0
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    filterStudents();
    calculateStats();
  }, [students, searchTerm, selectedClass, selectedTrade, selectedStatus]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/accountant/student-payments');
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      const uniqueClasses = [...new Set(data.map((c: any) => c.class_name))];
      const uniqueTrades = [...new Set(data.map((c: any) => c.trade_code))];
      setClasses(uniqueClasses);
      setTrades(uniqueTrades);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.serial_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.class_name === selectedClass);
    }

    if (selectedTrade !== 'all') {
      filtered = filtered.filter(s => s.trade_code === selectedTrade);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.payment_status === selectedStatus);
    }

    setFilteredStudents(filtered);
  };

  const calculateStats = () => {
    const totalStudents = filteredStudents.length;
    const paidStudents = filteredStudents.filter(s => s.payment_status === 'paid').length;
    const partialStudents = filteredStudents.filter(s => s.payment_status === 'partial').length;
    const unpaidStudents = filteredStudents.filter(s => s.payment_status === 'unpaid').length;
    const totalCollected = filteredStudents.reduce((sum, s) => sum + s.paid_amount, 0);
    const totalRemaining = filteredStudents.reduce((sum, s) => sum + s.remaining_amount, 0);

    setStats({
      totalStudents,
      paidStudents,
      partialStudents,
      unpaidStudents,
      totalCollected,
      totalRemaining
    });
  };

  const handleRecordPayment = async () => {
    if (!selectedStudent || !paymentAmount) return;

    try {
      const response = await fetch('/api/accountant/record-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          reference_number: referenceNumber
        })
      });

      if (response.ok) {
        alert('Kwishyura byanditswe neza!');
        setShowPaymentModal(false);
        setPaymentAmount('');
        setReferenceNumber('');
        fetchStudents();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Ikosa ryabaye!');
    }
  };

  const handleSendNotification = async () => {
    if (!selectedStudent || !notificationMessage) return;

    try {
      const response = await fetch('/api/accountant/notify-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          message: notificationMessage,
          parent_phone: selectedStudent.parent_phone,
          parent_email: selectedStudent.parent_email
        })
      });

      if (response.ok) {
        alert('Ubutumwa bwoherejwe!');
        setShowNotifyModal(false);
        setNotificationMessage('');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Ikosa ryabaye!');
    }
  };

  const handleBulkNotify = async (status: string) => {
    const studentsToNotify = filteredStudents.filter(s => s.payment_status === status);
    
    if (studentsToNotify.length === 0) {
      alert('Nta banyeshuri babonetse!');
      return;
    }

    if (!confirm(`Ohereza ubutumwa ku banyeshuri ${studentsToNotify.length}?`)) return;

    try {
      const response = await fetch('/api/accountant/bulk-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_ids: studentsToNotify.map(s => s.id),
          status: status
        })
      });

      if (response.ok) {
        alert('Ubutumwa bwoherejwe!');
      }
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      alert('Ikosa ryabaye!');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> Yishyuye</span>;
      case 'partial':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1"><Clock size={14} /> Yishyuye Igice</span>;
      case 'unpaid':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1"><XCircle size={14} /> Ntiyishyura</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AccountantSidebar />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="animate-spin text-emerald-600" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gucunga Kwishyura kw'Abanyeshuri</h1>
            <p className="text-gray-600">Kugenzura no kwemeza kwishyura kw'abanyeshuri hakurikijwe amaklasi</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Abanyeshuri Bose</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <Users className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bishyuye</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paidStudents}</p>
                </div>
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bishyuye Igice</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.partialStudents}</p>
                </div>
                <Clock className="text-yellow-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ntibashyura</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unpaidStudents}</p>
                </div>
                <XCircle className="text-red-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Byakusanyijwe</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalCollected.toLocaleString()} RWF</p>
                </div>
                <DollarSign className="text-emerald-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bisigaye</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalRemaining.toLocaleString()} RWF</p>
                </div>
                <AlertCircle className="text-orange-500" size={32} />
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Shakisha umunyeshuri..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Amaklasi Yose</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Amahugurwa Yose</option>
                {trades.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Imiterere Yose</option>
                <option value="paid">Bishyuye</option>
                <option value="partial">Bishyuye Igice</option>
                <option value="unpaid">Ntibashyura</option>
              </select>

              <button
                onClick={() => fetchStudents()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Kuvugurura
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleBulkNotify('unpaid')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Bell size={18} />
                Menyesha Abatishyura
              </button>
              <button
                onClick={() => handleBulkNotify('partial')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                <Bell size={18} />
                Menyesha Bashyuye Igice
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Download size={18} />
                Gukuramo Raporo
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nimero</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Amazina</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ikirangantego</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ishuri</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Urwego</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Amafaranga Yose</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Byishyuwe</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Bisigaye</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Imiterere</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Ibikorwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{student.first_name} {student.last_name}</div>
                        <div className="text-xs text-gray-500">{student.serial_code}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.trade_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.class_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">S{student.level_number}{student.level_suffix}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{student.total_fees.toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">{student.paid_amount.toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">{student.remaining_amount.toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(student.payment_status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                            title="Kwandika Kwishyura"
                          >
                            <Plus size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowNotifyModal(true);
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Menyesha Umubyeyi"
                          >
                            <Bell size={18} />
                          </button>
                          <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Reba Amateka">
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Nta banyeshuri babonetse</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kwandika Kwishyura</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Umunyeshuri</label>
                <p className="text-gray-900 font-semibold">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                <p className="text-sm text-gray-500">{selectedStudent.serial_code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amafaranga Asigaye</label>
                <p className="text-2xl font-bold text-red-600">{selectedStudent.remaining_amount.toLocaleString()} RWF</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amafaranga Yishyuwe</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Andika amafaranga..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uburyo bwo Kwishyura</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="cash">Amafaranga</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Banki</option>
                  <option value="cheque">Sheke</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nimero y'Icyemezo</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Andika nimero..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRecordPayment}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Kwandika
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentAmount('');
                    setReferenceNumber('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Guhagarika
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotifyModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Menyesha Umubyeyi</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Umunyeshuri</label>
                <p className="text-gray-900 font-semibold">{selectedStudent.first_name} {selectedStudent.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefoni y'Umubyeyi</label>
                <p className="text-gray-600">{selectedStudent.parent_phone || 'Ntabwo yaranditswe'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubutumwa</label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Andika ubutumwa..."
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Amafaranga Asigaye:</strong> {selectedStudent.remaining_amount.toLocaleString()} RWF
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendNotification}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Kohereza
                </button>
                <button
                  onClick={() => {
                    setShowNotifyModal(false);
                    setNotificationMessage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Guhagarika
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentsManagement;

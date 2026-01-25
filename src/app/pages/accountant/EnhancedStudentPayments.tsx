import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, CheckCircle, XCircle, Clock, DollarSign, Users, AlertCircle, Download, Bell, Eye, Plus, RefreshCw, BarChart3, PieChart, Award, TrendingDown } from 'lucide-react';
import AccountantSidebar from '@/app/components/AccountantSidebar';

const EnhancedStudentPayments: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [feesAmount, setFeesAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedClass, selectedTrade, selectedStatus]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const [studentsRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5000/api/accountant/student-payments', { headers }),
        fetch('http://localhost:5000/api/accountant/analytics', { headers })
      ]);
      
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      }
      
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics || null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setStudents([]);
      setAnalytics(null);
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.serial_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedClass !== 'all') filtered = filtered.filter(s => s.class_name === selectedClass);
    if (selectedTrade !== 'all') filtered = filtered.filter(s => s.trade_code === selectedTrade);
    if (selectedStatus !== 'all') filtered = filtered.filter(s => s.payment_status === selectedStatus);
    setFilteredStudents(filtered);
  };

  const handleRecordPayment = async () => {
    if (!selectedStudent || !paymentAmount) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/accountant/record-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          reference_number: referenceNumber
        })
      });
      if (res.ok) {
        alert('Kwishyura byanditswe neza!');
        setShowPaymentModal(false);
        setPaymentAmount('');
        setReferenceNumber('');
        fetchData();
      }
    } catch (error) {
      alert('Ikosa ryabaye!');
    }
  };

  const handleUpdateFees = async () => {
    if (!selectedStudent || !feesAmount) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/accountant/update-fees', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          total_fees: parseFloat(feesAmount),
          academic_year: '2024-2025'
        })
      });
      if (res.ok) {
        alert('Amafaranga yavuguruwe!');
        setShowFeesModal(false);
        setFeesAmount('');
        fetchData();
      }
    } catch (error) {
      alert('Ikosa ryabaye!');
    }
  };

  const stats = {
    totalStudents: filteredStudents.length,
    paidStudents: filteredStudents.filter(s => s.payment_status === 'paid').length,
    partialStudents: filteredStudents.filter(s => s.payment_status === 'partial').length,
    unpaidStudents: filteredStudents.filter(s => s.payment_status === 'unpaid').length,
    totalCollected: filteredStudents.reduce((sum, s) => sum + (s.paid_amount || 0), 0),
    totalRemaining: filteredStudents.reduce((sum, s) => sum + (s.remaining_amount || 0), 0)
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="student-payments-management" onNavigate={onNavigate} />
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="animate-spin text-emerald-600" size={48} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="student-payments-management" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gucunga Kwishyura kw'Abanyeshuri</h1>
            <p className="text-gray-600">Isesengura ry'amakuru n'imibare y'amafaranga</p>
          </div>

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

          <div className="flex gap-4 mb-6">
            <button onClick={() => setShowAnalytics(!showAnalytics)} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
              <BarChart3 size={20} />
              {showAnalytics ? 'Hisha' : 'Reba'} Isesengura
            </button>
          </div>

          {showAnalytics && analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award className="text-yellow-500" size={24} />
                  Abanyeshuri Bishyura Neza (Top 10)
                </h3>
                <div className="space-y-3">
                  {analytics.topPayers?.map((student: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.first_name} {student.last_name}</p>
                          <p className="text-xs text-gray-500">{student.serial_code} - {student.trade_code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{student.total_paid.toLocaleString()} RWF</p>
                        <p className="text-xs text-gray-500">{student.payment_count} kwishyura</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PieChart className="text-blue-500" size={24} />
                  Kwishyura ku Mahugurwa
                </h3>
                <div className="space-y-3">
                  {analytics.paymentsByTrade?.map((trade: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900">{trade.trade_code}</span>
                        <span className="text-sm text-gray-600">{trade.total_students} abanyeshuri</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: `${(trade.total_collected / trade.total_expected) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-semibold">{trade.total_collected.toLocaleString()} RWF</span>
                        <span className="text-gray-500">/ {trade.total_expected.toLocaleString()} RWF</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingDown className="text-red-500" size={24} />
                  Abanyeshuri Batishyura (Top 20)
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analytics.defaulters?.map((student: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-gray-500">{student.serial_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{student.amount_due.toLocaleString()} RWF</p>
                        <p className="text-xs text-gray-500">{student.days_since_payment || 0} iminsi</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-purple-500" size={24} />
                  Uburyo bwo Kwishyura
                </h3>
                <div className="space-y-3">
                  {analytics.paymentMethods?.map((method: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{method.payment_method.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600">{method.count} kwishyura</p>
                      </div>
                      <p className="font-bold text-purple-600">{method.total.toLocaleString()} RWF</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Shakisha..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="all">Amahugurwa Yose</option>
                {[...new Set(students.map(s => s.trade_code))].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="all">Imiterere Yose</option>
                <option value="paid">Bishyuye</option>
                <option value="partial">Bishyuye Igice</option>
                <option value="unpaid">Ntibashyura</option>
              </select>
              <button onClick={fetchData} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2">
                <RefreshCw size={18} />
                Kuvugurura
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Amazina</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ishuri</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Amafaranga Yose</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Byishyuwe</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Bisigaye</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Imiterere</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Ibikorwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{student.first_name} {student.last_name}</div>
                        <div className="text-xs text-gray-500">{student.serial_code}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.trade_code}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{student.total_fees?.toLocaleString() || 0} RWF</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">{student.paid_amount?.toLocaleString() || 0} RWF</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">{student.remaining_amount?.toLocaleString() || 0} RWF</td>
                      <td className="px-6 py-4 text-center">
                        {student.payment_status === 'paid' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1 justify-center"><CheckCircle size={14} /> Yishyuye</span>}
                        {student.payment_status === 'partial' && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1 justify-center"><Clock size={14} /> Igice</span>}
                        {student.payment_status === 'unpaid' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1 justify-center"><XCircle size={14} /> Ntiyishyura</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setSelectedStudent(student); setShowPaymentModal(true); }} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200" title="Kwandika Kwishyura">
                            <Plus size={18} />
                          </button>
                          <button onClick={() => { setSelectedStudent(student); setFeesAmount(student.total_fees?.toString() || ''); setShowFeesModal(true); }} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Guhindura Amafaranga">
                            <DollarSign size={18} />
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
      </div>

      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kwandika Kwishyura</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Umunyeshuri</label>
                <p className="text-gray-900 font-semibold">{selectedStudent.first_name} {selectedStudent.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amafaranga Asigaye</label>
                <p className="text-2xl font-bold text-red-600">{selectedStudent.remaining_amount?.toLocaleString() || 0} RWF</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amafaranga Yishyuwe</label>
                <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Andika amafaranga..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uburyo</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                  <option value="cash">Amafaranga</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Banki</option>
                  <option value="cheque">Sheke</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nimero</label>
                <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Nimero..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleRecordPayment} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Kwandika</button>
                <button onClick={() => { setShowPaymentModal(false); setPaymentAmount(''); setReferenceNumber(''); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Guhagarika</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFeesModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Guhindura Amafaranga</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Umunyeshuri</label>
                <p className="text-gray-900 font-semibold">{selectedStudent.first_name} {selectedStudent.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amafaranga Yose</label>
                <input type="number" value={feesAmount} onChange={(e) => setFeesAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Andika amafaranga..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleUpdateFees} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guhindura</button>
                <button onClick={() => { setShowFeesModal(false); setFeesAmount(''); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Guhagarika</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedStudentPayments;

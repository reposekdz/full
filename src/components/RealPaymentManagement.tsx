import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Users, TrendingUp, Download, RefreshCw, Plus, Send, Eye, Edit, Save, X, Check, Search, Filter } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const RealPaymentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{studentId: number, columnId: number} | null>(null);
  const [cellValue, setCellValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ trade: 'all', level: 'all', status: 'all' });
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', amount: '', term: 'Term 1', due_date: '' });

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, columnsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/payments/students`, { headers: getHeaders() }),
        fetch(`${API_BASE}/payments/columns`, { headers: getHeaders() }),
        fetch(`${API_BASE}/payments/stats`, { headers: getHeaders() })
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || data.payments || []);
      }
      if (columnsRes.ok) {
        const data = await columnsRes.json();
        setColumns(data.columns || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCellEdit = async (studentId: number, columnId: number, value: string) => {
    try {
      const response = await fetch(`${API_BASE}/payments/update-cell`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ student_id: studentId, column_id: columnId, amount: parseFloat(value) || 0 })
      });

      if (response.ok) {
        loadData();
        setEditingCell(null);
      }
    } catch (error) {
      console.error('Error updating cell:', error);
    }
  };

  const addPaymentColumn = async () => {
    try {
      const response = await fetch(`${API_BASE}/payments/columns/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newColumn)
      });

      if (response.ok) {
        setShowAddColumn(false);
        setNewColumn({ name: '', amount: '', term: 'Term 1', due_date: '' });
        loadData();
      }
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const sendBulkReminders = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      const response = await fetch(`${API_BASE}/payments/bulk-reminder`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ student_ids: selectedStudents })
      });

      if (response.ok) {
        alert('Reminders sent successfully!');
        setSelectedStudents([]);
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch(`${API_BASE}/payments/export?format=excel`, {
        headers: getHeaders()
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${Date.now()}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const calculateTotal = (student: any) => {
    return columns.reduce((sum, col) => sum + (student.payments?.[col.id] || 0), 0);
  };

  const calculateBalance = (student: any) => {
    const total = columns.reduce((sum, col) => sum + (col.amount || 0), 0);
    const paid = calculateTotal(student);
    return total - paid;
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       s.student_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTrade = filters.trade === 'all' || s.trade_code === filters.trade;
    const matchLevel = filters.level === 'all' || s.level_number === parseInt(filters.level);
    const matchStatus = filters.status === 'all' || s.payment_status === filters.status;
    return matchSearch && matchTrade && matchLevel && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <style>{`
        .excel-cell { border: 1px solid #d1d5db; padding: 8px; min-width: 120px; background: white; }
        .excel-cell:hover { background: #f3f4f6; }
        .excel-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; padding: 12px; border: 1px solid #5a67d8; position: sticky; top: 0; z-index: 10; }
        .excel-row:hover { background: #eff6ff; }
        .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
      `}</style>

      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">💰 Payment Management</h1>
            <p className="text-gray-600 mt-2">Excel-like Payment Tracking System</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={loadData} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-2">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button onClick={() => setShowAddColumn(true)} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Column</span>
            </button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-2xl font-bold">{stats.total_students || 0}</p>
              <p className="text-sm opacity-90">Total Students</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4">
              <DollarSign className="w-8 h-8 mb-2" />
              <p className="text-2xl font-bold">{(stats.total_collected || 0).toLocaleString()} RWF</p>
              <p className="text-sm opacity-90">Collected</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4">
              <TrendingUp className="w-8 h-8 mb-2" />
              <p className="text-2xl font-bold">{(stats.total_balance || 0).toLocaleString()} RWF</p>
              <p className="text-sm opacity-90">Balance</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4">
              <TrendingUp className="w-8 h-8 mb-2" />
              <p className="text-2xl font-bold">{stats.collection_rate || 0}%</p>
              <p className="text-sm opacity-90">Collection Rate</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6 shadow-lg">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <select onChange={(e) => setFilters({...filters, trade: e.target.value})} className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500">
            <option value="all">All Trades</option>
            <option value="SOD">SOD</option>
            <option value="BDC">BDC</option>
            <option value="AUTO">AUTO</option>
          </select>
          <select onChange={(e) => setFilters({...filters, level: e.target.value})} className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500">
            <option value="all">All Levels</option>
            {[1,2,3,4,5].map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
          <select onChange={(e) => setFilters({...filters, status: e.target.value})} className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <div className="glass rounded-xl p-4 mb-6 shadow-lg flex items-center justify-between">
          <span className="font-semibold text-blue-900">{selectedStudents.length} students selected</span>
          <div className="flex space-x-2">
            <button onClick={sendBulkReminders} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Send Reminders</span>
            </button>
            <button onClick={() => setSelectedStudents([])} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Excel-like Table */}
      <div className="glass rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="excel-header"><input type="checkbox" className="w-5 h-5" onChange={(e) => setSelectedStudents(e.target.checked ? filteredStudents.map(s => s.student_id) : [])} /></th>
                <th className="excel-header">Student Code</th>
                <th className="excel-header">Name</th>
                <th className="excel-header">Trade</th>
                <th className="excel-header">Level</th>
                {columns.map(col => (
                  <th key={col.id} className="excel-header">{col.name}<br/><span className="text-xs opacity-80">{col.amount?.toLocaleString()} RWF</span></th>
                ))}
                <th className="excel-header">Total Paid</th>
                <th className="excel-header">Balance</th>
                <th className="excel-header">Status</th>
                <th className="excel-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.student_id} className="excel-row">
                  <td className="excel-cell text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5"
                      checked={selectedStudents.includes(student.student_id)}
                      onChange={(e) => setSelectedStudents(e.target.checked ? [...selectedStudents, student.student_id] : selectedStudents.filter(id => id !== student.student_id))}
                    />
                  </td>
                  <td className="excel-cell font-mono font-semibold">{student.student_code}</td>
                  <td className="excel-cell font-semibold">{student.first_name} {student.last_name}</td>
                  <td className="excel-cell"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{student.trade_code}</span></td>
                  <td className="excel-cell text-center">{student.level_number}</td>
                  {columns.map(col => (
                    <td key={col.id} className="excel-cell" onClick={() => { setEditingCell({studentId: student.student_id, columnId: col.id}); setCellValue(student.payments?.[col.id] || '0'); }}>
                      {editingCell?.studentId === student.student_id && editingCell?.columnId === col.id ? (
                        <input
                          type="number"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => handleCellEdit(student.student_id, col.id, cellValue)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCellEdit(student.student_id, col.id, cellValue)}
                          className="w-full px-2 py-1 border-2 border-blue-500 rounded"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded">{(student.payments?.[col.id] || 0).toLocaleString()} RWF</span>
                      )}
                    </td>
                  ))}
                  <td className="excel-cell font-bold text-green-600">{calculateTotal(student).toLocaleString()} RWF</td>
                  <td className="excel-cell font-bold text-orange-600">{calculateBalance(student).toLocaleString()} RWF</td>
                  <td className="excel-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      student.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      student.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.payment_status || 'unpaid'}
                    </span>
                  </td>
                  <td className="excel-cell">
                    <div className="flex space-x-1">
                      <button className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"><Eye className="w-4 h-4" /></button>
                      <button className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"><Edit className="w-4 h-4" /></button>
                      <button className="p-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"><Send className="w-4 h-4" /></button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Add Payment Column</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Column Name (e.g., Term 1 Fees)" value={newColumn.name} onChange={(e) => setNewColumn({...newColumn, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500" />
              <input type="number" placeholder="Amount (RWF)" value={newColumn.amount} onChange={(e) => setNewColumn({...newColumn, amount: e.target.value})} className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500" />
              <select value={newColumn.term} onChange={(e) => setNewColumn({...newColumn, term: e.target.value})} className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500">
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
              </select>
              <input type="date" value={newColumn.due_date} onChange={(e) => setNewColumn({...newColumn, due_date: e.target.value})} className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500" />
              <div className="flex space-x-3">
                <button onClick={addPaymentColumn} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>Add Column</span>
                </button>
                <button onClick={() => setShowAddColumn(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealPaymentManagement;

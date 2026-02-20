import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Users, FileSpreadsheet, Plus, Trash2, 
  Save, Calculator, Download, RefreshCw, X, Search, Edit2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

interface Student {
  student_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_code: string;
  level_number: number;
  level_suffix?: string;
  email?: string;
  phone?: string;
  gender?: string;
}

interface Column {
  id: number;
  column_name: string;
  assessment_type: string;
  max_marks: number;
  weight: number;
  trade_code?: string;
  level_number?: number;
  academic_year?: number;
  term?: number;
}

interface Mark {
  student_id: number;
  column_id: number;
  marks: number;
}

const UltraTeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumn, setNewColumn] = useState({
    column_name: '',
    assessment_type: 'test',
    max_marks: 100,
    weight: 100
  });
  const [currentYear] = useState(new Date().getFullYear());
  const [currentTerm] = useState(1);
  const [editingCell, setEditingCell] = useState<{studentId: number, columnId: number} | null>(null);

  const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchData();
  }, [selectedTrade, selectedLevel]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStudents(), fetchColumns(), fetchMarks()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/teacher-global-sheets/students?trade=${selectedTrade}&level=${selectedLevel}`,
        { headers: authHeaders() }
      );
      const data = await response.json();
      if (data.success) setStudents(data.students || []);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const fetchColumns = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/teacher-global-sheets/columns?trade=${selectedTrade}&level=${selectedLevel}&year=${currentYear}&term=${currentTerm}`,
        { headers: authHeaders() }
      );
      const data = await response.json();
      if (data.success) setColumns(data.columns || []);
    } catch (error) {
      toast.error('Failed to load columns');
    }
  };

  const fetchMarks = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/teacher-global-sheets/marks?trade=${selectedTrade}&level=${selectedLevel}&year=${currentYear}&term=${currentTerm}`,
        { headers: authHeaders() }
      );
      const data = await response.json();
      if (data.success) setMarks(data.marks || []);
    } catch (error) {
      toast.error('Failed to load marks');
    }
  };

  const addColumn = async () => {
    if (!newColumn.column_name.trim()) return toast.error('Column name required');
    try {
      const response = await fetch(`${API_BASE}/teacher-global-sheets/columns/add`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...newColumn,
          trade_code: selectedTrade,
          level_number: selectedLevel,
          academic_year: currentYear,
          term: currentTerm
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Column added');
        setShowAddColumn(false);
        setNewColumn({ column_name: '', assessment_type: 'test', max_marks: 100, weight: 100 });
        fetchColumns();
      }
    } catch (error) {
      toast.error('Failed to add column');
    }
  };

  const deleteColumn = async (columnId: number) => {
    if (columns.length <= 1) return toast.error('Must have at least one column');
    try {
      const response = await fetch(`${API_BASE}/teacher-global-sheets/columns/${columnId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (response.ok) {
        toast.success('Column deleted');
        fetchColumns();
      }
    } catch (error) {
      toast.error('Failed to delete column');
    }
  };

  const getMark = (studentId: number, columnId: number): number => {
    const mark = marks.find(m => m.student_id === studentId && m.column_id === columnId);
    return mark?.marks || 0;
  };

  const updateMark = (studentId: number, columnId: number, value: number) => {
    setMarks(prev => {
      const existing = prev.find(m => m.student_id === studentId && m.column_id === columnId);
      if (existing) {
        return prev.map(m => 
          m.student_id === studentId && m.column_id === columnId 
            ? { ...m, marks: value } 
            : m
        );
      }
      return [...prev, { student_id: studentId, column_id: columnId, marks: value }];
    });
  };

  const calculateTotal = (studentId: number): number => {
    return columns.reduce((total, col) => {
      const mark = getMark(studentId, col.id);
      return total + (mark / col.max_marks) * col.weight;
    }, 0);
  };

  const calculatePercentage = (studentId: number): number => {
    const total = calculateTotal(studentId);
    const maxTotal = columns.reduce((sum, col) => sum + col.weight, 0);
    return maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  };

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    if (percentage >= 50) return 'E';
    return 'F';
  };

  const saveMarks = async () => {
    try {
      const response = await fetch(`${API_BASE}/teacher-global-sheets/marks/save`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ marks, year: currentYear, term: currentTerm })
      });
      if (response.ok) toast.success('Marks saved successfully');
      else toast.error('Failed to save marks');
    } catch (error) {
      toast.error('Error saving marks');
    }
  };

  const exportToCSV = () => {
    const headers = ['Code', 'Name', 'Trade', 'Level', ...columns.map(c => c.column_name), 'Total', '%', 'Grade'];
    const rows = students.map(student => {
      const total = calculateTotal(student.student_id);
      const percentage = calculatePercentage(student.student_id);
      const grade = getGrade(percentage);
      return [
        student.student_code,
        `${student.first_name} ${student.last_name}`,
        student.trade_code,
        `L${student.level_number}${student.level_suffix || ''}`,
        ...columns.map(c => getMark(student.student_id, c.id)),
        total.toFixed(2),
        percentage.toFixed(2),
        grade
      ];
    });
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marks_${selectedTrade}_L${selectedLevel}_${Date.now()}.csv`;
    a.click();
    toast.success('Exported to CSV');
  };

  const filteredStudents = students.filter(s => {
    const query = searchQuery.toLowerCase();
    return s.first_name?.toLowerCase().includes(query) ||
           s.last_name?.toLowerCase().includes(query) ||
           s.student_code?.toLowerCase().includes(query);
  });

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', color: 'from-blue-500 to-indigo-500' },
    { id: 'students', icon: Users, label: 'Global Students', color: 'from-green-500 to-emerald-500' },
    { id: 'marks', icon: FileSpreadsheet, label: 'Marks Sheet', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Teacher Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">Ultra Global Sheets</p>
        </div>
        <nav className="p-4 space-y-2">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="ml-64 p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-800 mb-2">
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'students' && 'Global Students Sheet'}
            {activeTab === 'marks' && 'Dynamic Marks Sheet'}
          </h2>
          <p className="text-slate-600">
            {activeTab === 'students' && `${filteredStudents.length} students`}
            {activeTab === 'marks' && `${columns.length} assessment columns`}
          </p>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Students</p>
                  <h3 className="text-4xl font-bold mt-2">{students.length}</h3>
                </div>
                <Users size={48} className="opacity-30" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Assessments</p>
                  <h3 className="text-4xl font-bold mt-2">{columns.length}</h3>
                </div>
                <FileSpreadsheet size={48} className="opacity-30" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Class Average</p>
                  <h3 className="text-4xl font-bold mt-2">
                    {students.length > 0 ? (students.reduce((sum, s) => sum + calculatePercentage(s.student_id), 0) / students.length).toFixed(1) : '0.0'}%
                  </h3>
                </div>
                <Calculator size={48} className="opacity-30" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pass Rate</p>
                  <h3 className="text-4xl font-bold mt-2">
                    {students.length > 0 ? ((students.filter(s => calculatePercentage(s.student_id) >= 50).length / students.length) * 100).toFixed(1) : '0.0'}%
                  </h3>
                </div>
                <Calculator size={48} className="opacity-30" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex gap-4 mb-6 flex-wrap">
              <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="ALL">All Trades</option>
                <option value="SOD">SOD</option>
                <option value="BDC">BDC</option>
                <option value="AUT">AUT</option>
              </select>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="ALL">All Levels</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
              </select>
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <button onClick={fetchData} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
                <RefreshCw size={16} />Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Trade</th>
                    <th className="px-4 py-3 text-left">Level</th>
                    <th className="px-4 py-3 text-left">Gender</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.student_id} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="px-4 py-3 font-mono text-sm">{student.student_code}</td>
                      <td className="px-4 py-3 font-medium">{student.first_name} {student.last_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          student.trade_code === 'SOD' ? 'bg-purple-100 text-purple-800' :
                          student.trade_code === 'BDC' ? 'bg-orange-100 text-orange-800' :
                          'bg-pink-100 text-pink-800'
                        }`}>{student.trade_code}</span>
                      </td>
                      <td className="px-4 py-3">L{student.level_number}{student.level_suffix || ''}</td>
                      <td className="px-4 py-3">{student.gender || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{student.phone || student.email || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'marks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-wrap gap-4">
                <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="ALL">All Trades</option>
                  <option value="SOD">SOD</option>
                  <option value="BDC">BDC</option>
                  <option value="AUT">AUT</option>
                </select>
                <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="ALL">All Levels</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                  <option value="5">Level 5</option>
                </select>
                <button onClick={() => setShowAddColumn(true)} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                  <Plus size={16} />Add Column
                </button>
                <button onClick={saveMarks} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                  <Save size={16} />Save Marks
                </button>
                <button onClick={exportToCSV} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                  <Download size={16} />Export CSV
                </button>
              </div>
            </div>

            {showAddColumn && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Add Assessment Column</h3>
                    <button onClick={() => setShowAddColumn(false)}><X size={20} /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Column Name</label>
                      <input type="text" value={newColumn.column_name} onChange={(e) => setNewColumn({...newColumn, column_name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Midterm Exam" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Assessment Type</label>
                      <select value={newColumn.assessment_type} onChange={(e) => setNewColumn({...newColumn, assessment_type: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="test">Test</option>
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Marks</label>
                      <input type="number" value={newColumn.max_marks} onChange={(e) => setNewColumn({...newColumn, max_marks: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Weight (%)</label>
                      <input type="number" value={newColumn.weight} onChange={(e) => setNewColumn({...newColumn, weight: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={addColumn} className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg">Add Column</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                      <th className="px-4 py-3 text-left border border-slate-600 sticky left-0 bg-slate-800 z-10">Code</th>
                      <th className="px-4 py-3 text-left border border-slate-600 sticky left-20 bg-slate-800 z-10">Student</th>
                      {columns.map(col => (
                        <th key={col.id} className="px-4 py-3 text-center border border-slate-600 min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            <span>{col.column_name}</span>
                            <span className="text-xs text-slate-300">/{col.max_marks} ({col.weight}%)</span>
                            <button onClick={() => deleteColumn(col.id)} className="text-red-400 hover:text-red-300 mt-1"><Trash2 size={14} /></button>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center border border-slate-600 bg-blue-900">Total</th>
                      <th className="px-4 py-3 text-center border border-slate-600 bg-green-900">%</th>
                      <th className="px-4 py-3 text-center border border-slate-600 bg-purple-900">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, idx) => {
                      const total = calculateTotal(student.student_id);
                      const percentage = calculatePercentage(student.student_id);
                      const grade = getGrade(percentage);
                      return (
                        <tr key={student.student_id} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="px-4 py-3 border border-slate-200 font-mono text-sm sticky left-0 bg-inherit z-10">{student.student_code}</td>
                          <td className="px-4 py-3 border border-slate-200 font-medium sticky left-20 bg-inherit z-10">{student.first_name} {student.last_name}</td>
                          {columns.map(col => {
                            const value = getMark(student.student_id, col.id);
                            const isEditing = editingCell?.studentId === student.student_id && editingCell?.columnId === col.id;
                            return (
                              <td key={col.id} className="px-2 py-2 border border-slate-200 text-center" onClick={() => setEditingCell({ studentId: student.student_id, columnId: col.id })}>
                                {isEditing ? (
                                  <input type="number" value={value} onChange={(e) => updateMark(student.student_id, col.id, Number(e.target.value))} onBlur={() => setEditingCell(null)} className="w-full px-2 py-1 border border-blue-500 rounded text-center focus:ring-2 focus:ring-blue-500" autoFocus max={col.max_marks} />
                                ) : (
                                  <span className={`cursor-pointer hover:bg-blue-100 px-2 py-1 rounded ${Number(value) > col.max_marks ? 'text-red-600 font-bold' : ''}`}>{value}</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 border border-slate-200 text-center font-bold bg-blue-50">{total.toFixed(2)}</td>
                          <td className="px-4 py-3 border border-slate-200 text-center font-bold bg-green-50">{percentage.toFixed(2)}%</td>
                          <td className="px-4 py-3 border border-slate-200 text-center font-bold">
                            <span className={`px-3 py-1 rounded-full text-white ${
                              grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-blue-500' : grade === 'C' ? 'bg-yellow-500' : grade === 'D' ? 'bg-orange-500' : grade === 'E' ? 'bg-red-400' : 'bg-red-600'
                            }`}>{grade}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UltraTeacherDashboard;

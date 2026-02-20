import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Users, FileSpreadsheet, Plus, Trash2, 
  Save, Calculator, Download, RefreshCw, X, Search, ClipboardCheck,
  TrendingUp, Award, Target, BookOpen, Filter, Upload
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

interface SubjectColumn {
  id: string;
  name: string;
  maxMarks: number;
  weight: number;
}

interface StudentMark {
  student_id: number;
  [key: string]: number | string;
}

const ModernTeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [columns, setColumns] = useState<SubjectColumn[]>([
    { id: 'col1', name: 'Test 1', maxMarks: 20, weight: 20 },
    { id: 'col2', name: 'Test 2', maxMarks: 20, weight: 20 },
    { id: 'col3', name: 'Exam', maxMarks: 60, weight: 60 }
  ]);
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnMax, setNewColumnMax] = useState(100);
  const [newColumnWeight, setNewColumnWeight] = useState(100);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableLevels, setAvailableLevels] = useState<{level_number: number, level_suffix: string, level_name: string}[]>([]);
  const [savedMarks, setSavedMarks] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [term, setTerm] = useState('Term 1');
  const [showImport, setShowImport] = useState(false);

  const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchTradesAndLevels();
    loadSavedMarks();
  }, []);

  useEffect(() => {
    loadSavedMarks();
  }, [selectedTrade, selectedLevel, term]);

  useEffect(() => {
    if (selectedTrade !== 'ALL' && selectedLevel !== 'ALL') {
      fetchStudentsByTradeLevel();
    }
  }, [selectedTrade, selectedLevel]);

  const fetchTradesAndLevels = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/teachers/trades-levels`, { headers: authHeaders() });
      const data = await response.json();
      if (data.success) {
        // Extract all unique levels from trades
        const allLevels = new Set<number>();
        data.trades.forEach((trade: any) => {
          trade.levels.forEach((level: number) => allLevels.add(level));
        });
        const levelsArray = Array.from(allLevels).sort().map(level => ({
          level_number: level,
          level_suffix: '',
          level_name: `Level ${level}`
        }));
        setAvailableLevels(levelsArray);
      }
    } catch (error) {
      toast.error('Failed to load trades and levels');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByTradeLevel = async () => {
    if (selectedTrade === 'ALL' || selectedLevel === 'ALL') return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/teachers/students-by-trade-level?trade_code=${selectedTrade}&level_number=${selectedLevel}`,
        { headers: authHeaders() }
      );
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
        setAllStudents(data.students || []);
        initializeMarks(data.students || []);
        toast.success(`Loaded ${data.count} students`);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedMarks = async () => {
    if (selectedTrade === 'ALL' || selectedLevel === 'ALL') return;
    setLoadingSaved(true);
    try {
      const response = await fetch(
        `${API_BASE}/teachers/marks/load?trade_code=${selectedTrade}&level_number=${selectedLevel}`,
        { headers: authHeaders() }
      );
      const data = await response.json();
      if (data.success && data.marks.length > 0) {
        setSavedMarks(data.marks);
        toast.success(`Loaded ${data.marks.length} saved marks`);
      }
    } catch (error) {
      console.error('Failed to load saved marks:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const filterStudents = () => {
    let filtered = allStudents;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.first_name?.toLowerCase().includes(query) ||
        s.last_name?.toLowerCase().includes(query) ||
        s.student_code?.toLowerCase().includes(query)
      );
    }
    setStudents(filtered);
  };

  const initializeMarks = (studentList: Student[]) => {
    const initialMarks = studentList.map(student => ({
      student_id: student.student_id,
      ...columns.reduce((acc, col) => ({ ...acc, [col.id]: 0 }), {})
    }));
    setMarks(initialMarks);
  };

  const updateMark = (studentId: number, columnId: string, value: number) => {
    setMarks(prev => prev.map(m => 
      m.student_id === studentId ? { ...m, [columnId]: value } : m
    ));
  };

  const calculateTotal = (studentId: number): number => {
    const studentMarks = marks.find(m => m.student_id === studentId);
    if (!studentMarks) return 0;
    return columns.reduce((total, col) => {
      const mark = Number(studentMarks[col.id]) || 0;
      return total + (mark / col.maxMarks) * col.weight;
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

  const addColumn = () => {
    if (!newColumnName.trim()) return toast.error('Column name required');
    const newCol: SubjectColumn = {
      id: `col${Date.now()}`,
      name: newColumnName,
      maxMarks: newColumnMax,
      weight: newColumnWeight
    };
    setColumns([...columns, newCol]);
    setMarks(prev => prev.map(m => ({ ...m, [newCol.id]: 0 })));
    setNewColumnName('');
    setNewColumnMax(100);
    setNewColumnWeight(100);
    setShowAddColumn(false);
    toast.success('Column added');
  };

  const deleteColumn = (columnId: string) => {
    if (columns.length <= 1) return toast.error('Must have at least one column');
    setColumns(prev => prev.filter(c => c.id !== columnId));
    setMarks(prev => prev.map(m => {
      const { [columnId]: _, ...rest } = m;
      return rest;
    }));
    toast.success('Column deleted');
  };

  const saveMarks = async () => {
    if (selectedTrade === 'ALL' || selectedLevel === 'ALL') {
      return toast.error('Please select specific trade and level');
    }
    try {
      // Prepare marks data for saving
      const marksData = [];
      for (const studentMark of marks) {
        for (const col of columns) {
          marksData.push({
            student_id: studentMark.student_id,
            assessment_name: col.name,
            marks: studentMark[col.id] || 0,
            max_marks: col.maxMarks,
            weight: col.weight
          });
        }
      }

      const response = await fetch(`${API_BASE}/teachers/marks/save`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ 
          trade_code: selectedTrade, 
          level_number: selectedLevel,
          marks_data: marksData
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        loadSavedMarks();
      } else {
        toast.error(data.message || 'Failed to save marks');
      }
    } catch (error) {
      toast.error('Error saving marks');
    }
  };

  const exportToCSV = () => {
    const headers = ['Student Code', 'Name', ...columns.map(c => c.name), 'Total', '%', 'Grade'];
    const rows = students.map(student => {
      const studentMarks = marks.find(m => m.student_id === student.student_id);
      const total = calculateTotal(student.student_id);
      const percentage = calculatePercentage(student.student_id);
      const grade = getGrade(percentage);
      return [
        student.student_code,
        `${student.first_name} ${student.last_name}`,
        ...columns.map(c => studentMarks?.[c.id] || 0),
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

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', color: 'from-blue-500 to-indigo-500' },
    { id: 'students', icon: Users, label: 'All Students', color: 'from-green-500 to-emerald-500' },
    { id: 'marks', icon: FileSpreadsheet, label: 'Marks Sheet', color: 'from-purple-500 to-pink-500' },
    { id: 'amanota', icon: Calculator, label: 'Amanota', color: 'from-orange-500 to-red-500' },
    { id: 'attendance', icon: ClipboardCheck, label: 'Attendance', color: 'from-teal-500 to-cyan-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Teacher Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">Global Sheets</p>
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
            {activeTab === 'students' && 'All Students - Global Sheets'}
            {activeTab === 'marks' && 'Marks Sheet'}
            {activeTab === 'amanota' && 'Amanota - Competency Assessment'}
            {activeTab === 'attendance' && 'Attendance Management'}
          </h2>
          <p className="text-slate-600">
            {activeTab === 'students' && `Showing ${students.length} of ${allStudents.length} students`}
            {activeTab === 'amanota' && 'Competent (≥70) / Not Yet Competent (<70)'}
            {activeTab === 'attendance' && 'Track daily attendance by trade and level'}
            {activeTab !== 'students' && activeTab !== 'amanota' && activeTab !== 'attendance' && 'Manage student marks and performance'}
          </p>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Students</p>
                  <h3 className="text-4xl font-bold mt-2">{allStudents.length}</h3>
                </div>
                <Users size={48} className="opacity-30" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Subjects</p>
                  <h3 className="text-4xl font-bold mt-2">{columns.length}</h3>
                </div>
                <FileSpreadsheet size={48} className="opacity-30" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Filtered</p>
                  <h3 className="text-4xl font-bold mt-2">{students.length}</h3>
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
                {availableLevels.map(level => (
                  <option key={`${level.level_number}${level.level_suffix}`} value={level.level_number}>
                    {level.level_name}
                  </option>
                ))}
              </select>
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <button onClick={fetchStudentsByTradeLevel} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2" disabled={selectedTrade === 'ALL' || selectedLevel === 'ALL'}>
                <RefreshCw size={16} />
                Load Students
              </button>
            </div>
            <div className="mb-4 flex gap-4 text-sm flex-wrap">
              <div className="px-4 py-2 bg-blue-100 rounded-lg"><span className="font-semibold">Total:</span> {allStudents.length}</div>
              <div className="px-4 py-2 bg-green-100 rounded-lg"><span className="font-semibold">Filtered:</span> {students.length}</div>
              <div className="px-4 py-2 bg-purple-100 rounded-lg"><span className="font-semibold">SOD:</span> {allStudents.filter(s => s.trade_code === 'SOD').length}</div>
              <div className="px-4 py-2 bg-orange-100 rounded-lg"><span className="font-semibold">BDC:</span> {allStudents.filter(s => s.trade_code === 'BDC').length}</div>
              <div className="px-4 py-2 bg-pink-100 rounded-lg"><span className="font-semibold">AUT:</span> {allStudents.filter(s => s.trade_code === 'AUT').length}</div>
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
                  {students.map((student, idx) => (
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
                  {students.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No students found</td></tr>
                  )}
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
                  <option value="SOD">SOD - Software Development</option>
                  <option value="BDC">BDC - Building Construction</option>
                  <option value="AUT">AUT - Automotive</option>
                </select>
                <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="ALL">All Levels</option>
                  {availableLevels.map(level => (
                    <option key={`${level.level_number}${level.level_suffix}`} value={level.level_number}>
                      {level.level_name}
                    </option>
                  ))}
                </select>
                <select value={term} onChange={(e) => setTerm(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
                <button onClick={loadSavedMarks} disabled={loadingSaved} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                  <RefreshCw size={16} className={loadingSaved ? 'animate-spin' : ''} />Load Saved
                </button>
                <button onClick={() => setShowAddColumn(true)} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                  <Plus size={16} />Add Column
                </button>
                <button onClick={saveMarks} disabled={selectedTrade === 'ALL' || selectedLevel === 'ALL'} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50">
                  <Save size={16} />Save Marks
                </button>
                <button onClick={exportToCSV} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                  <Download size={16} />Export CSV
                </button>
              </div>
              {savedMarks.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ <strong>{savedMarks.length}</strong> saved records loaded for <strong>{selectedTrade} Level {selectedLevel}</strong> - {term}
                  </p>
                </div>
              )}
            </div>

            {showAddColumn && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Add New Column</h3>
                    <button onClick={() => setShowAddColumn(false)}><X size={20} /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Column Name</label>
                      <input type="text" value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Midterm Exam" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Marks</label>
                      <input type="number" value={newColumnMax} onChange={(e) => setNewColumnMax(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Weight (%)</label>
                      <input type="number" value={newColumnWeight} onChange={(e) => setNewColumnWeight(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
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
                      <th className="px-4 py-3 text-left border border-slate-600 sticky left-20 bg-slate-800 z-10">Student Name</th>
                      {columns.map(col => (
                        <th key={col.id} className="px-4 py-3 text-center border border-slate-600 min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            <span>{col.name}</span>
                            <span className="text-xs text-slate-300">/{col.maxMarks} ({col.weight}%)</span>
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
                    {students.map((student, idx) => {
                      const total = calculateTotal(student.student_id);
                      const percentage = calculatePercentage(student.student_id);
                      const grade = getGrade(percentage);
                      return (
                        <tr key={student.student_id} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="px-4 py-3 border border-slate-200 font-mono text-sm sticky left-0 bg-inherit z-10">{student.student_code}</td>
                          <td className="px-4 py-3 border border-slate-200 font-medium sticky left-20 bg-inherit z-10">{student.first_name} {student.last_name}</td>
                          {columns.map(col => {
                            const studentMarks = marks.find(m => m.student_id === student.student_id);
                            const value = studentMarks?.[col.id] || 0;
                            const isEditing = editingCell?.row === idx && editingCell?.col === col.id;
                            return (
                              <td key={col.id} className="px-2 py-2 border border-slate-200 text-center" onClick={() => setEditingCell({ row: idx, col: col.id })}>
                                {isEditing ? (
                                  <input type="number" value={value} onChange={(e) => updateMark(student.student_id, col.id, Number(e.target.value))} onBlur={() => setEditingCell(null)} className="w-full px-2 py-1 border border-blue-500 rounded text-center focus:ring-2 focus:ring-blue-500" autoFocus max={col.maxMarks} />
                                ) : (
                                  <span className={`cursor-pointer hover:bg-blue-100 px-2 py-1 rounded ${Number(value) > col.maxMarks ? 'text-red-600 font-bold' : ''}`}>{value}</span>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90">Class Average</p>
                <p className="text-2xl font-bold mt-1">{students.length > 0 ? (students.reduce((sum, s) => sum + calculatePercentage(s.student_id), 0) / students.length).toFixed(1) : '0.0'}%</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90">Pass Rate</p>
                <p className="text-2xl font-bold mt-1">{students.length > 0 ? ((students.filter(s => calculatePercentage(s.student_id) >= 50).length / students.length) * 100).toFixed(1) : '0.0'}%</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90">Highest Score</p>
                <p className="text-2xl font-bold mt-1">{students.length > 0 ? Math.max(...students.map(s => calculatePercentage(s.student_id))).toFixed(1) : '0.0'}%</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90">Lowest Score</p>
                <p className="text-2xl font-bold mt-1">{students.length > 0 ? Math.min(...students.map(s => calculatePercentage(s.student_id))).toFixed(1) : '0.0'}%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'amanota' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-wrap gap-4 mb-4">
                <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="ALL">All Trades</option>
                  <option value="SOD">SOD</option>
                  <option value="BDC">BDC</option>
                  <option value="AUT">AUT</option>
                </select>
                <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="ALL">All Levels</option>
                  {availableLevels.map(level => (
                    <option key={`${level.level_number}${level.level_suffix}`} value={level.level_number}>
                      {level.level_name}
                    </option>
                  ))}
                </select>
                <button onClick={saveMarks} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                  <Save size={16} />Save Marks
                </button>
                <button onClick={exportToCSV} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                  <Download size={16} />Export CSV
                </button>
              </div>
              <div className="text-sm text-slate-600 bg-orange-50 p-3 rounded-lg">
                <strong>Competency Logic:</strong> Marks ≥70 = <span className="text-green-600 font-bold">Competent</span> | Marks &lt;70 = <span className="text-red-600 font-bold">Not Yet Competent</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                      <th className="px-4 py-3 text-left border border-orange-500">Code</th>
                      <th className="px-4 py-3 text-left border border-orange-500">Student Name</th>
                      <th className="px-4 py-3 text-center border border-orange-500">Marks (/100)</th>
                      <th className="px-4 py-3 text-center border border-orange-500">Competency Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => {
                      const studentMarks = marks.find(m => m.student_id === student.student_id);
                      const mark = Number(studentMarks?.['amanota_mark']) || 0;
                      const isCompetent = mark >= 70;
                      const isEditing = editingCell?.row === idx && editingCell?.col === 'amanota_mark';
                      
                      return (
                        <tr key={student.student_id} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="px-4 py-3 border border-slate-200 font-mono text-sm">{student.student_code}</td>
                          <td className="px-4 py-3 border border-slate-200 font-medium">{student.first_name} {student.last_name}</td>
                          <td className="px-4 py-3 border border-slate-200 text-center" onClick={() => setEditingCell({ row: idx, col: 'amanota_mark' })}>
                            {isEditing ? (
                              <input 
                                type="number" 
                                value={mark} 
                                onChange={(e) => {
                                  const newMarks = marks.map(m => 
                                    m.student_id === student.student_id 
                                      ? { ...m, amanota_mark: Number(e.target.value) } 
                                      : m
                                  );
                                  if (newMarks.length === 0) {
                                    setMarks([{ student_id: student.student_id, amanota_mark: Number(e.target.value) }]);
                                  } else {
                                    setMarks(newMarks);
                                  }
                                }}
                                onBlur={() => setEditingCell(null)}
                                className="w-24 px-2 py-1 border border-orange-500 rounded text-center focus:ring-2 focus:ring-orange-500"
                                autoFocus
                                min={0}
                                max={100}
                              />
                            ) : (
                              <span className={`cursor-pointer hover:bg-orange-100 px-3 py-1 rounded font-bold ${mark > 100 ? 'text-red-600' : mark >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                                {mark}/100
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 border border-slate-200 text-center">
                            <span className={`px-4 py-2 rounded-full font-bold text-white ${isCompetent ? 'bg-green-500' : 'bg-red-500'}`}>
                              {isCompetent ? 'Competent' : 'Not Yet Competent'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {students.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No students found. Select a trade and level.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90">Total Students</p>
                <p className="text-2xl font-bold mt-1">{students.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90">Competent</p>
                <p className="text-2xl font-bold mt-1">
                  {students.filter(s => {
                    const studentMarks = marks.find(m => m.student_id === s.student_id);
                    return Number(studentMarks?.['amanota_mark']) >= 70;
                  }).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90">Not Yet Competent</p>
                <p className="text-2xl font-bold mt-1">
                  {students.filter(s => {
                    const studentMarks = marks.find(m => m.student_id === s.student_id);
                    return Number(studentMarks?.['amanota_mark']) < 70;
                  }).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90">Average Mark</p>
                <p className="text-2xl font-bold mt-1">
                  {students.length > 0 ? (
                    students.reduce((sum, s) => {
                      const studentMarks = marks.find(m => m.student_id === s.student_id);
                      return sum + (Number(studentMarks?.['amanota_mark']) || 0);
                    }, 0) / students.length
                  ).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-wrap gap-4">
                <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                  <option value="ALL">All Trades</option>
                  <option value="SOD">SOD</option>
                  <option value="BDC">BDC</option>
                  <option value="AUT">AUT</option>
                </select>
                <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                  <option value="ALL">All Levels</option>
                  {availableLevels.map(level => (
                    <option key={`${level.level_number}${level.level_suffix}`} value={level.level_number}>
                      {level.level_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                      <th className="px-4 py-3 text-left border border-teal-500">Code</th>
                      <th className="px-4 py-3 text-left border border-teal-500">Student Name</th>
                      <th className="px-4 py-3 text-left border border-teal-500">Trade</th>
                      <th className="px-4 py-3 text-left border border-teal-500">Level</th>
                      <th className="px-4 py-3 text-center border border-teal-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => (
                      <tr key={student.student_id} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="px-4 py-3 border border-slate-200 font-mono text-sm">{student.student_code}</td>
                        <td className="px-4 py-3 border border-slate-200 font-medium">{student.first_name} {student.last_name}</td>
                        <td className="px-4 py-3 border border-slate-200">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            student.trade_code === 'SOD' ? 'bg-purple-100 text-purple-800' :
                            student.trade_code === 'BDC' ? 'bg-orange-100 text-orange-800' :
                            'bg-pink-100 text-pink-800'
                          }`}>{student.trade_code}</span>
                        </td>
                        <td className="px-4 py-3 border border-slate-200">L{student.level_number}{student.level_suffix || ''}</td>
                        <td className="px-4 py-3 border border-slate-200 text-center">
                          <select className="px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No students found. Select a trade and level.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90">Present</p>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90">Absent</p>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90">Total Students</p>
                <p className="text-3xl font-bold mt-2">{students.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTeacherDashboard;

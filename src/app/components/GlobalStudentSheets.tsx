import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, Plus, Edit, Save, Calculator, DollarSign, BookOpen, Shield,
  Star, FileText, TrendingUp, Award, Target, BarChart3, RefreshCw,
  Search, Filter, Download, Upload, Eye, Trash2, CheckCircle, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';

import { toast } from 'sonner';
import { API_BASE_URL } from '@/app/config/apiBase';
import apiService from '@/app/services/apiService';
import { GLOBAL_TRADES, getLevelsForTrade } from '@/app/constants/tradesAndLevels';

const API_BASE = API_BASE_URL;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface GlobalStudentSheetsProps {
  userRole: string;
  userId: number;
  onNavigate?: (page: string) => void;
}

const GlobalStudentSheets: React.FC<GlobalStudentSheetsProps> = ({ userRole, userId, onNavigate }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [newColumn, setNewColumn] = useState({
    column_name: '',
    column_label: '',
    column_type: 'text',
    select_options: [],
    visible_to_roles: [userRole],
    editable_by_roles: [userRole]
  });
  const [filterTrade, setFilterTrade] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterLevelSuffix, setFilterLevelSuffix] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [markColumns, setMarkColumns] = useState<{ id: string; label: string; max_marks: number; course_id?: number; course_name?: string }[]>([]);
  const [savingMark, setSavingMark] = useState<string | null>(null);
  const [showAddMarkColumnDialog, setShowAddMarkColumnDialog] = useState(false);
  const [addMarkColumnForm, setAddMarkColumnForm] = useState({ course_id: '', course_name: '', max_marks: 100 });
  const isTeacher = userRole === 'teacher';

  useEffect(() => {
    fetchColumns();
    if (!isTeacher) fetchStudents();
  }, [userRole]);

  useEffect(() => {
    if (isTeacher && filterTrade && filterLevel !== '') {
      fetchStudentsByTradeLevel();
      fetchCoursesForLevel();
      fetchMarkColumnsForLevel();
    }
  }, [isTeacher, filterTrade, filterLevel, filterLevelSuffix]);

  const normalizedRole = userRole === 'director_study' ? 'dos' : userRole;

  const fetchColumns = async () => {
    try {
      const response = await fetch(`${API_BASE}/global-sheets/columns/${normalizedRole}`, { headers: authHeaders() });
      const data = await response.json();
      if (data.success) {
        setColumns(data.columns || []);
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
      toast.error('Failed to load columns');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/global-sheets/sheets/${normalizedRole}`, { headers: authHeaders() });
      const data = await response.json();
      if (data.success) {
        setStudents(data.sheets || []);
      } else {
        toast.error(data.message || 'Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student sheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByTradeLevel = async () => {
    if (!filterTrade || filterLevel === '') return;
    setLoading(true);
    try {
      const levelNum = parseInt(filterLevel, 10);
      const res = await apiService.getGlobalStudentSheets(filterTrade, levelNum, filterLevelSuffix);
      const sheets = (res as any)?.sheets ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setStudents(sheets);
    } catch (e) {
      const fallback = await fetch(`${API_BASE}/global-sheets/sheets/${filterTrade}/${filterLevel}?level_suffix=${encodeURIComponent(filterLevelSuffix)}`, { headers: authHeaders() }).then(r => r.json());
      if (fallback.success) setStudents(fallback.sheets || []);
      else toast.error('Failed to load students for this level');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesForLevel = async () => {
    if (!filterTrade) return;
    try {
      const levelNum = filterLevel === '' ? undefined : parseInt(filterLevel, 10);
      const res = await apiService.getCoursesByTradeLevel(filterTrade, levelNum, filterLevelSuffix || undefined);
      const list = (res as any)?.courses ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setCourses(list);
    } catch {
      const r = await fetch(`${API_BASE}/academics/courses?trade_code=${encodeURIComponent(filterTrade)}`, { headers: authHeaders() }).then(x => x.json());
      setCourses(r.courses ?? r.data ?? []);
    }
  };

  const fetchMarkColumnsForLevel = async () => {
    try {
      const response = await fetch(`${API_BASE}/global-sheets/columns/marks?trade_code=${encodeURIComponent(filterTrade)}&level_number=${filterLevel}&level_suffix=${encodeURIComponent(filterLevelSuffix)}&role=teacher`, { headers: authHeaders() });
      const data = await response.json();
      if (data.success && Array.isArray(data.columns)) {
        setMarkColumns(data.columns.map((c: any) => ({ id: String(c.id), label: c.column_label || c.label, max_marks: c.max_marks ?? 100, course_id: c.course_id, course_name: c.course_name })));
      }
    } catch {
      const fromRole = columns.filter((c: any) => (c.column_type === 'number' && (c.column_name || '').startsWith('mark_')) || c.column_type === 'mark');
      setMarkColumns(fromRole.map((c: any) => ({ id: String(c.id), label: c.column_label, max_marks: (c.metadata && JSON.parse(c.metadata || '{}').max_marks) || 100 })));
    }
  };

  const handleUpdateStudent = async () => {
    try {
      const response = await fetch(`${API_BASE}/global-sheets/sheets/${selectedStudent.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          column_values: editData,
          user_role: normalizedRole
        })
      });
      const result = await response.json();
      if (result.success) {
        if (isTeacher && filterTrade && filterLevel !== '') fetchStudentsByTradeLevel();
        else fetchStudents();
        setShowEditDialog(false);
        toast.success('Student data updated successfully!');
      } else {
        toast.error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  const handleAddColumn = async () => {
    try {
      const response = await fetch(`${API_BASE}/global-sheets/columns`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...newColumn,
          created_by_role: normalizedRole,
          scope: 'global'
        })
      });
      const result = await response.json();
      if (result.success) {
        fetchColumns();
        setShowAddColumnDialog(false);
        setNewColumn({
          column_name: '',
          column_label: '',
          column_type: 'text',
          select_options: [],
          visible_to_roles: [normalizedRole],
          editable_by_roles: [normalizedRole]
        });
        toast.success('Column added successfully!');
      } else {
        toast.error(result.message || 'Failed to add column');
      }
    } catch (error) {
      console.error('Error adding column:', error);
      toast.error('Failed to add column');
    }
  };

  const handleRecalculate = async (studentId: number) => {
    try {
      const response = await fetch(`${API_BASE}/global-sheets/recalculate/${studentId}`, {
        method: 'POST',
        headers: authHeaders()
      });
      const result = await response.json();
      if (result.success) {
        if (isTeacher && filterTrade && filterLevel !== '') fetchStudentsByTradeLevel();
        else fetchStudents();
        toast.success('Calculations updated successfully!');
      } else {
        toast.error(result.message || 'Recalculate failed');
      }
    } catch (error) {
      console.error('Error recalculating:', error);
      toast.error('Failed to recalculate');
    }
  };

  const handleExportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Student Code', 'Class', 'Total Marks', 'Average', 'Attendance %', 'Conduct'];
    const rows = filteredStudents.map((s) => [
      s.first_name || '',
      s.last_name || '',
      s.student_code || '',
      s.class_name || '',
      s.total_marks ?? '',
      s.average_marks ?? '',
      s.attendance_percentage ?? '',
      s.conduct_score ?? ''
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-sheets-${normalizedRole}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded');
  };

  const openEditDialog = (student: any) => {
    setSelectedStudent(student);
    const customValues: Record<string, string | number> = {};
    if (student.custom_values) {
      student.custom_values.split('|').forEach((item: string) => {
        const [columnId, textValue, numberValue] = item.split(':');
        customValues[columnId] = textValue || numberValue || '';
      });
    }
    markColumns.forEach(mc => {
      if (student.marks && student.marks[mc.id] != null) customValues[mc.id] = student.marks[mc.id];
      else if (student[`mark_${mc.id}`] != null) customValues[mc.id] = student[`mark_${mc.id}`];
    });
    setEditData(customValues);
    setShowEditDialog(true);
  };

  const getStudentMark = (student: any, columnId: string) => {
    const m = student.marks && student.marks[columnId];
    if (m != null && m !== '') return Number(m);
    const v = student[`mark_${columnId}`];
    if (v != null && v !== '') return Number(v);
    const cv = student.custom_values && student.custom_values.split('|').find((p: string) => p.startsWith(columnId + ':'));
    if (cv) return Number(cv.split(':')[2] || cv.split(':')[1]) || 0;
    return null;
  };

  const handleSaveMarkCell = async (student: any, columnId: string, value: string, maxMarks: number) => {
    const num = value === '' ? null : parseFloat(value);
    if (num !== null && (num < 0 || num > maxMarks)) {
      toast.error(`Mark must be between 0 and ${maxMarks}`);
      return;
    }
    const key = `${student.id}-${columnId}`;
    setSavingMark(key);
    try {
      const res = await apiService.saveGlobalSheetMark(student.id, columnId, num ?? 0, maxMarks);
      if ((res as any)?.success) {
        if (isTeacher && filterTrade && filterLevel !== '') fetchStudentsByTradeLevel();
        else fetchStudents();
        toast.success('Mark saved');
      } else {
        const putRes = await fetch(`${API_BASE}/global-sheets/sheets/${student.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            column_values: { [columnId]: num ?? '' },
            user_role: normalizedRole
          })
        });
        const putData = await putRes.json();
        if (putData.success) {
          if (isTeacher && filterTrade && filterLevel !== '') fetchStudentsByTradeLevel();
          else fetchStudents();
          toast.success('Mark saved');
        } else toast.error(putData.message || 'Failed to save mark');
      }
    } catch (e) {
      toast.error('Failed to save mark');
    } finally {
      setSavingMark(null);
    }
  };

  const handleAddMarkColumn = async (courseId: number, courseName: string, maxMarks: number) => {
    const columnName = `mark_${courseId}_${maxMarks}`;
    const columnLabel = `${courseName} (Max: ${maxMarks})`;
    try {
      const response = await fetch(`${API_BASE}/global-sheets/columns`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          column_name: columnName,
          column_label: columnLabel,
          column_type: 'number',
          visible_to_roles: [normalizedRole],
          editable_by_roles: [normalizedRole],
          created_by_role: normalizedRole,
          scope: 'global',
          metadata: JSON.stringify({ max_marks: maxMarks, course_id: courseId, course_name: courseName, trade_code: filterTrade, level_number: filterLevel, level_suffix: filterLevelSuffix })
        })
      });
      const result = await response.json();
      if (result.success && result.column) {
        setMarkColumns(prev => [...prev, { id: String(result.column.id), label: columnLabel, max_marks: maxMarks, course_id: courseId, course_name: courseName }]);
        fetchColumns();
        setShowAddMarkColumnDialog(false);
        setAddMarkColumnForm({ course_id: '', course_name: '', max_marks: 100 });
        toast.success('Mark column added');
      } else {
        setMarkColumns(prev => [...prev, { id: columnName, label: columnLabel, max_marks: maxMarks, course_id: courseId, course_name: courseName }]);
        setShowAddMarkColumnDialog(false);
        setAddMarkColumnForm({ course_id: '', course_name: '', max_marks: 100 });
        toast.success('Mark column added (local)');
      }
    } catch (e) {
      toast.error('Failed to add mark column');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'accountant': return DollarSign;
      case 'teacher': return BookOpen;
      case 'dos': case 'director_study': return Award;
      case 'dod': case 'director_discipline': return Shield;
      case 'headmaster': return Star;
      case 'advisor': return Target;
      case 'stock_manager': return Package;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'accountant': return 'from-green-500 to-emerald-500';
      case 'teacher': return 'from-blue-500 to-indigo-500';
      case 'dos': case 'director_study': return 'from-yellow-500 to-orange-500';
      case 'dod': case 'director_discipline': return 'from-red-500 to-pink-500';
      case 'headmaster': return 'from-purple-500 to-violet-500';
      case 'advisor': return 'from-indigo-500 to-purple-500';
      case 'stock_manager': return 'from-teal-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getRoleColumns = () => {
    const roleColumnTemplates: Record<string, { name: string; label: string; type: string; options?: string[] }[]> = {
      accountant: [
        { name: 'paid_amount', label: 'Paid Amount', type: 'number' },
        { name: 'unpaid_amount', label: 'Unpaid Amount', type: 'number' },
        { name: 'payment_status', label: 'Payment Status', type: 'select', options: ['Paid', 'Partial', 'Unpaid', 'Overdue'] },
        { name: 'payment_date', label: 'Last Payment Date', type: 'date' },
        { name: 'fee_category', label: 'Fee Category', type: 'select', options: ['Tuition', 'Exam', 'Uniform', 'Transport', 'Hostel'] }
      ],
      teacher: [
        { name: 'quiz_marks', label: 'Quiz Marks', type: 'number' },
        { name: 'midterm_marks', label: 'Midterm Marks', type: 'number' },
        { name: 'final_marks', label: 'Final Marks', type: 'number' },
        { name: 'subject_name', label: 'Subject Name', type: 'text' },
        { name: 'course_code', label: 'Course Code', type: 'text' }
      ],
      dos: [
        { name: 'academic_performance', label: 'Academic Performance', type: 'number' },
        { name: 'class_rank', label: 'Class Rank', type: 'number' },
        { name: 'study_plan', label: 'Study Plan', type: 'textarea' },
        { name: 'academic_status', label: 'Academic Status', type: 'select', options: ['Excellent', 'Good', 'Average', 'Poor'] }
      ],
      dod: [
        { name: 'behavior_score', label: 'Behavior Score', type: 'number' },
        { name: 'discipline_incidents', label: 'Discipline Incidents', type: 'number' },
        { name: 'conduct_grade', label: 'Conduct Grade', type: 'select', options: ['A', 'B', 'C', 'D', 'F'] }
      ],
      headmaster: [
        { name: 'recommendation', label: 'Principal Recommendation', type: 'textarea' },
        { name: 'awards', label: 'Awards & Recognition', type: 'text' },
        { name: 'leadership_potential', label: 'Leadership Potential', type: 'select', options: ['High', 'Medium', 'Low'] }
      ],
      advisor: [
        { name: 'counseling_notes', label: 'Counseling Notes', type: 'textarea' },
        { name: 'risk_level', label: 'Risk Level', type: 'select', options: ['Low', 'Medium', 'High'] },
        { name: 'next_meeting', label: 'Next Meeting', type: 'date' },
        { name: 'advisor_status', label: 'Status', type: 'select', options: ['Active', 'Resolved', 'Follow-up'] }
      ],
      stock_manager: [
        { name: 'uniform_size', label: 'Uniform Size', type: 'text' },
        { name: 'items_issued', label: 'Items Issued', type: 'text' },
        { name: 'last_issue_date', label: 'Last Issue Date', type: 'date' }
      ]
    };
    return roleColumnTemplates[normalizedRole] || roleColumnTemplates[userRole] || [];
  };

  const filteredStudents = students.filter(student =>
    student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const RoleIcon = getRoleIcon(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${getRoleColor(userRole)}`}>
              <RoleIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Management - {userRole.toUpperCase()}
              </h1>
              <p className="text-gray-600 mt-2">Manage student data with role-based access and auto-calculations</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                fetchColumns();
                if (isTeacher && filterTrade && filterLevel !== '') fetchStudentsByTradeLevel();
                else fetchStudents();
              }}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {isTeacher && (
              <Button onClick={() => setShowAddMarkColumnDialog(true)} className="bg-gradient-to-r from-amber-500 to-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Mark Column
              </Button>
            )}
            <Button
              onClick={() => setShowAddColumnDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            {onNavigate && (
              <Button variant="ghost" onClick={() => {
                const dash = userRole === 'director_study' ? 'dashboard-director-study' : userRole === 'stock_manager' ? 'dashboard-stock' : userRole === 'admin' || userRole === 'super_admin' ? 'dashboard' : `dashboard-${userRole}`;
                onNavigate(dash);
              }}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        {isTeacher && (
          <Card className="border-none shadow-lg mb-6">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Select level to insert marks (SOD, BDC, AUT)
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Trade</Label>
                  <Select value={filterTrade} onValueChange={(v) => { setFilterTrade(v); setFilterLevel(''); setFilterLevelSuffix(''); }}>
                    <SelectTrigger className="w-48 mt-1">
                      <SelectValue placeholder="Trade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GLOBAL_TRADES.map((t) => (
                        <SelectItem key={t.code} value={t.code}>{t.name} ({t.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Level</Label>
                  <Select value={filterLevel + (filterLevelSuffix || '')} onValueChange={(v) => {
                    const lev = getLevelsForTrade(filterTrade).find(l => (String(l.level_number) + (l.level_suffix || '')) === v);
                    if (lev) { setFilterLevel(String(lev.level_number)); setFilterLevelSuffix(lev.level_suffix || ''); }
                  }}>
                    <SelectTrigger className="w-40 mt-1">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {getLevelsForTrade(filterTrade).map((l) => (
                        <SelectItem key={l.id} value={String(l.level_number) + (l.level_suffix || '')}>{l.display}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!filterTrade && <p className="text-gray-500 text-sm">Select a trade and level to load students and insert marks.</p>}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{filteredStudents.length}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Columns</p>
                  <p className="text-3xl font-bold text-green-600">{columns.length}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Role Access</p>
                  <p className="text-3xl font-bold text-purple-600">{userRole.toUpperCase()}</p>
                </div>
                <RoleIcon className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Auto-Calculations</p>
                  <p className="text-3xl font-bold text-orange-600">ACTIVE</p>
                </div>
                <Calculator className="w-12 h-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Card className="border-none shadow-xl mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 font-black">
              <Users className="w-6 h-6 text-blue-600" />
              Student Data Management
            </CardTitle>
            <div className="flex gap-3">
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{isTeacher && !filterTrade ? 'Select trade and level above to load students and insert marks.' : isTeacher && filterTrade && filterLevel === '' ? 'Select level to load students.' : 'No students found'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden border-2 border-gray-100"
                >
                  <div className={`h-2 bg-gradient-to-r ${getRoleColor(userRole)}`} />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRoleColor(userRole)} flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-800">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: {student.student_code} • {student.trade_name} Level {student.level_number}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{student.class_name}</Badge>
                            <Badge variant={student.status === 'active' ? 'default' : 'destructive'}>
                              {student.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openEditDialog(student)}
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRecalculate(student.id)}
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-green-700"
                        >
                          <Calculator className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {isTeacher && markColumns.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-blue-700 mb-2">Marks (editable — auto-calculated below)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {markColumns.map((mc) => {
                            const val = getStudentMark(student, mc.id);
                            const key = `${student.id}-${mc.id}`;
                            return (
                              <div key={mc.id} className="flex flex-col">
                                <Label className="text-xs text-gray-600 truncate">{mc.label.split(' (Max')[0]}</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={mc.max_marks}
                                  step={0.5}
                                  value={val ?? ''}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, marks: { ...(s.marks || {}), [mc.id]: v === '' ? null : parseFloat(v) } } : s));
                                  }}
                                  onBlur={(e) => {
                                    const v = e.target.value;
                                    if (v !== '' && (parseFloat(v) < 0 || parseFloat(v) > mc.max_marks)) return;
                                    handleSaveMarkCell(student, mc.id, v, mc.max_marks);
                                  }}
                                  disabled={savingMark === key}
                                  className="h-9 text-sm"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">TOTAL MARKS</p>
                        <p className="text-lg font-black text-blue-600">
                          {isTeacher && markColumns.length > 0
                            ? markColumns.reduce((acc, mc) => acc + (getStudentMark(student, mc.id) ?? 0), 0)
                            : (student.total_marks ?? 0)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">AVERAGE</p>
                        <p className="text-lg font-black text-green-600">
                          {isTeacher && markColumns.length > 0
                            ? (() => {
                                const totalMax = markColumns.reduce((a, mc) => a + mc.max_marks, 0);
                                const totalObtained = markColumns.reduce((a, mc) => a + (getStudentMark(student, mc.id) ?? 0), 0);
                                return totalMax ? ((totalObtained / totalMax) * 100).toFixed(1) + '%' : '0%';
                              })()
                            : (student.average_marks ?? 0) + (typeof student.average_marks === 'number' ? '%' : '')}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">ATTENDANCE</p>
                        <p className="text-lg font-black text-purple-600">{student.attendance_percentage ?? 100}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">CONDUCT</p>
                        <p className="text-lg font-black text-orange-600">{student.conduct_score ?? 100}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Student Data - {userRole.toUpperCase()}
            </DialogTitle>
            {selectedStudent && (
              <p className="text-gray-600">
                {selectedStudent.first_name} {selectedStudent.last_name} ({selectedStudent.student_code})
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {columns.filter(col => col.column_type !== 'calculated').map((column, index) => (
              <div key={index}>
                <Label>{column.column_label}</Label>
                {column.column_type === 'select' ? (
                  <Select
                    value={editData[column.id] || ''}
                    onValueChange={(value) => setEditData({ ...editData, [column.id]: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${column.column_label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(column.select_options ? JSON.parse(column.select_options) : []).map((option: string) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : column.column_type === 'textarea' ? (
                  <Textarea
                    value={editData[column.id] || ''}
                    onChange={(e) => setEditData({ ...editData, [column.id]: e.target.value })}
                    placeholder={`Enter ${column.column_label}`}
                  />
                ) : (
                  <Input
                    type={column.column_type === 'number' ? 'number' : column.column_type === 'date' ? 'date' : 'text'}
                    value={editData[column.id] || ''}
                    onChange={(e) => setEditData({ ...editData, [column.id]: e.target.value })}
                    placeholder={`Enter ${column.column_label}`}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdateStudent}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={() => setShowEditDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Column Dialog */}
      <Dialog open={showAddColumnDialog} onOpenChange={setShowAddColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add Custom Column - {userRole.toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Column Name</Label>
              <Input
                value={newColumn.column_name}
                onChange={(e) => setNewColumn({ ...newColumn, column_name: e.target.value })}
                placeholder="e.g., custom_field"
              />
            </div>
            <div>
              <Label>Column Label</Label>
              <Input
                value={newColumn.column_label}
                onChange={(e) => setNewColumn({ ...newColumn, column_label: e.target.value })}
                placeholder="e.g., Custom Field"
              />
            </div>
            <div>
              <Label>Column Type</Label>
              <Select
                value={newColumn.column_type}
                onValueChange={(value) => setNewColumn({ ...newColumn, column_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newColumn.column_type === 'select' && (
              <div>
                <Label>Options (comma-separated)</Label>
                <Input
                  placeholder="Option1, Option2, Option3"
                  onChange={(e) => setNewColumn({ 
                    ...newColumn, 
                    select_options: e.target.value.split(',').map(s => s.trim()) 
                  })}
                />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddColumn}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
              <Button
                onClick={() => setShowAddColumnDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Mark Column Dialog (Teacher) */}
      <Dialog open={showAddMarkColumnDialog} onOpenChange={setShowAddMarkColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Mark Column</DialogTitle>
            <p className="text-sm text-gray-600">Add a subject/course column with max marks. Marks are auto-calculated (obtained / max × 100).</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Course / Subject</Label>
              <Select
                value={addMarkColumnForm.course_id}
                onValueChange={(v) => {
                  const c = courses.find((x: any) => String(x.id) === v || String(x.course_id) === v);
                  setAddMarkColumnForm(prev => ({ ...prev, course_id: v, course_name: c ? (c.name || c.course_name || c.subject_name) : '' }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c: any) => (
                    <SelectItem key={c.id || c.course_id} value={String(c.id ?? c.course_id)}>{c.name || c.course_name || c.subject_name || c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courses.length === 0 && <p className="text-xs text-amber-600 mt-1">Load a trade/level first to see courses from database.</p>}
            </div>
            <div>
              <Label>Max marks (denominator for %)</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={addMarkColumnForm.max_marks}
                onChange={(e) => setAddMarkColumnForm(prev => ({ ...prev, max_marks: parseInt(e.target.value, 10) || 100 }))}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleAddMarkColumn(parseInt(addMarkColumnForm.course_id, 10) || 0, addMarkColumnForm.course_name || 'Subject', addMarkColumnForm.max_marks)}
                disabled={!addMarkColumnForm.course_id && courses.length > 0}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Mark Column
              </Button>
              <Button variant="outline" onClick={() => setShowAddMarkColumnDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalStudentSheets;
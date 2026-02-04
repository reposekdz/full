import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, Filter, Plus, Search, Settings, Users } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { GLOBAL_LEVELS, GLOBAL_TRADES, getLevelsForTrade } from '@/app/constants/tradesAndLevels';
import apiService from '@/app/services/apiService';

type LevelDef = (typeof GLOBAL_LEVELS)[number];

const canAddStudentRole = (role?: string) =>
  !!role && ['dos', 'director_study', 'headmaster', 'admin', 'super_admin'].includes(role);

export default function GlobalStudentSheets() {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const selectedLevel: LevelDef | null = selectedLevelId ? (GLOBAL_LEVELS.find((l) => l.id === selectedLevelId) || null) : null;

  const [students, setStudents] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<any>(null);
  const [columnForm, setColumnForm] = useState({
    column_name: '',
    column_type: 'text',
    is_required: false,
    default_value: '',
    display_order: 0
  });

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [createdSerial, setCreatedSerial] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'male',
    date_of_birth: ''
  });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const availableLevels = useMemo(
    () => (selectedTrade ? getLevelsForTrade(selectedTrade) : GLOBAL_LEVELS),
    [selectedTrade]
  );

  const fetchSheet = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({ level_suffix: selectedLevel.level_suffix || '' }).toString();
      const res = await apiService.request(`/student-management/sheets/${selectedTrade}/${selectedLevel.level_number}?${qs}`);
      if (res?.success) {
        setStudents(res.students || []);
        setColumns(res.columns || []);
      } else {
        setStudents([]);
        setColumns([]);
      }
    } catch (e) {
      console.error('Failed to fetch sheet:', e);
      setStudents([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTrade && selectedLevelId) fetchSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrade, selectedLevelId]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return (students || []).filter((s) => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const code = String(s.student_id || s.username || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [students, searchQuery]);

  const exportToCSV = () => {
    if (!selectedTrade || !selectedLevel) return;
    const baseHeaders = ['Student ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Trade', 'Level'];
    const customHeaders = (columns || []).map((c) => c.column_name);
    const headers = [...baseHeaders, ...customHeaders];

    const rows = (filteredStudents || []).map((s) => {
      const base = [
        s.student_id || s.username || '',
        s.first_name || '',
        s.last_name || '',
        s.email || '',
        s.phone || '',
        selectedTrade,
        `${selectedLevel.level_number}${selectedLevel.level_suffix || ''}`
      ];
      const custom = (columns || []).map((c) => (s.custom_values?.[c.id] ?? c.default_value ?? ''));
      return [...base, ...custom];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTrade}_L${selectedLevel.level_number}${selectedLevel.level_suffix || ''}_students.csv`;
    a.click();
  };

  const handleUpdateValue = async (studentDbId: number, columnId: number, value: string) => {
    try {
      await apiService.request(`/student-management/students/${studentDbId}/columns/${columnId}`, {
        method: 'PUT',
        body: JSON.stringify({ column_value: value })
      });
    } catch (e) {
      console.error('Failed to update value:', e);
    }
  };

  const resetColumnForm = () => {
    setColumnForm({
      column_name: '',
      column_type: 'text',
      is_required: false,
      default_value: '',
      display_order: 0
    });
  };

  const openCreateColumn = () => {
    setEditingColumn(null);
    resetColumnForm();
    setShowColumnModal(true);
  };

  const openEditColumn = (col: any) => {
    setEditingColumn(col);
    setColumnForm({
      column_name: col.column_name,
      column_type: col.column_type,
      is_required: !!col.is_required,
      default_value: col.default_value || '',
      display_order: Number(col.display_order || 0)
    });
    setShowColumnModal(true);
  };

  const saveColumn = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    try {
      if (editingColumn?.id) {
        await apiService.request(`/student-management/columns/${editingColumn.id}`, {
          method: 'PUT',
          body: JSON.stringify(columnForm)
        });
      } else {
        await apiService.request('/student-management/columns', {
          method: 'POST',
          body: JSON.stringify({
            ...columnForm,
            trade_code: selectedTrade,
            level_number: selectedLevel.level_number,
            level_suffix: selectedLevel.level_suffix || ''
          })
        });
      }
      setShowColumnModal(false);
      setEditingColumn(null);
      resetColumnForm();
      await fetchSheet();
    } catch (e: any) {
      alert(e?.message || 'Byanze kubika inkingi');
    } finally {
      setLoading(false);
    }
  };

  const addTemplateColumns = async (template: 'finance' | 'marks') => {
    if (!selectedTrade || !selectedLevel) return;
    const templates =
      template === 'finance'
        ? [
            { column_name: 'Paid', column_type: 'number', default_value: '0', is_required: false },
            { column_name: 'Unpaid', column_type: 'number', default_value: '0', is_required: false },
            { column_name: 'Balance', column_type: 'number', default_value: '0', is_required: false }
          ]
        : [
            { column_name: 'Quiz', column_type: 'number', default_value: '0', is_required: false },
            { column_name: 'Midterm', column_type: 'number', default_value: '0', is_required: false },
            { column_name: 'Final', column_type: 'number', default_value: '0', is_required: false }
          ];

    const existing = new Set((columns || []).map((c) => String(c.column_name || '').toLowerCase().trim()));
    setLoading(true);
    try {
      for (const c of templates) {
        if (existing.has(c.column_name.toLowerCase())) continue;
        await apiService.request('/student-management/columns', {
          method: 'POST',
          body: JSON.stringify({
            trade_code: selectedTrade,
            level_number: selectedLevel.level_number,
            level_suffix: selectedLevel.level_suffix || '',
            column_name: c.column_name,
            column_type: c.column_type,
            is_required: c.is_required,
            default_value: c.default_value,
            display_order: (columns?.length || 0) + 1
          })
        });
      }
      await fetchSheet();
    } catch (e: any) {
      alert(e?.message || 'Byanze kongeramo templates');
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    setCreatedSerial(null);
    try {
      const res = await apiService.request('/student-management/students', {
        method: 'POST',
        body: JSON.stringify({
          ...studentForm,
          trade_code: selectedTrade,
          level_number: selectedLevel.level_number,
          level_suffix: selectedLevel.level_suffix || ''
        })
      });
      if (res?.success) {
        setCreatedSerial(res.serial_code || null);
        setStudentForm({
          student_id: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          gender: 'male',
          date_of_birth: ''
        });
        await fetchSheet();
      } else {
        alert(res?.error || 'Byanze kongeramo umunyeshuri');
      }
    } catch (e: any) {
      alert(e?.message || 'Byanze kongeramo umunyeshuri');
    } finally {
      setLoading(false);
    }
  };

  const sheetTitle = selectedTrade && selectedLevel ? `${selectedTrade} - Level ${selectedLevel.level_number}${selectedLevel.level_suffix || ''}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Imbonerahamwe Rusange y'Abanyeshuri
            </h1>
            <p className="text-gray-600 mt-2">Global Student Sheets (Trade/Level independent)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTrade && selectedLevel && (
              <Button onClick={exportToCSV} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
            {selectedTrade && selectedLevel && canAddStudentRole(user?.role) && (
              <Button onClick={() => setShowAddStudent(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            )}
          </div>
        </div>

        <Card className="border-2 border-blue-100 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-6 h-6 text-blue-600" />
              Hitamo Umwuga n'Urwego
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Umwuga / Trade</label>
                <Select
                  value={selectedTrade}
                  onValueChange={(v) => {
                    setSelectedTrade(v);
                    setSelectedLevelId('');
                    setStudents([]);
                    setColumns([]);
                  }}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Hitamo umwuga..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GLOBAL_TRADES.map((trade) => (
                      <SelectItem key={trade.code} value={trade.code}>
                        {trade.code} - {trade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Urwego / Level</label>
                <Select value={selectedLevelId} onValueChange={setSelectedLevelId} disabled={!selectedTrade}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Hitamo urwego..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedTrade && selectedLevel && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Shakisha..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={openCreateColumn}>
                    <Settings className="w-4 h-4 mr-2" />
                    Add Column
                  </Button>
                  <Button variant="outline" onClick={() => addTemplateColumns('finance')}>
                    Add Finance Columns
                  </Button>
                  <Button variant="outline" onClick={() => addTemplateColumns('marks')}>
                    Add Marks Columns
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!selectedTrade || !selectedLevel ? (
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardContent className="p-12 text-center">
              <FileText className="w-20 h-20 mx-auto text-blue-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Hitamo Umwuga n'Urwego</h3>
              <p className="text-gray-600">Select a trade and a level to view the sheet</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-xl bg-white border">
              <TabsTrigger value="all">All ({filteredStudents.length})</TabsTrigger>
              <TabsTrigger value="active">Bakora ({filteredStudents.filter((s) => s.status === 'active').length})</TabsTrigger>
              <TabsTrigger value="inactive">Ntibakora ({filteredStudents.filter((s) => s.status !== 'active').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card className="border-2 border-blue-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    {sheetTitle} Student Sheet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Nta banyeshuri babonetse / No students found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <th className="text-left py-3 px-4 font-bold">#</th>
                            <th className="text-left py-3 px-4 font-bold">Student ID</th>
                            <th className="text-left py-3 px-4 font-bold">Amazina</th>
                            <th className="text-left py-3 px-4 font-bold">Email</th>
                            <th className="text-left py-3 px-4 font-bold">Phone</th>
                            {(columns || []).map((c) => (
                              <th key={c.id} className="text-left py-3 px-4 font-bold">
                                {c.column_name}
                              </th>
                            ))}
                            <th className="text-center py-3 px-4 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student, index) => (
                            <motion.tr
                              key={student.id || `${student.student_id}-${index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.01 }}
                              className="border-b hover:bg-blue-50"
                            >
                              <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                              <td className="py-3 px-4 font-mono font-semibold">{student.student_id || student.username}</td>
                              <td className="py-3 px-4">
                                <p className="font-semibold">
                                  {student.first_name} {student.last_name}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{student.email || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{student.phone || 'N/A'}</td>
                              {(columns || []).map((c) => (
                                <td key={c.id} className="py-2 px-4">
                                  <Input
                                    type={c.column_type === 'number' ? 'number' : c.column_type === 'date' ? 'date' : 'text'}
                                    defaultValue={student.custom_values?.[c.id] ?? c.default_value ?? ''}
                                    onBlur={(e) => handleUpdateValue(student.id, c.id, e.target.value)}
                                    className="h-9"
                                  />
                                </td>
                              ))}
                              <td className="py-3 px-4 text-center">
                                <Badge className={student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                  {student.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active">
              <Card className="border-2 border-green-100 shadow-xl">
                <CardHeader>
                  <CardTitle>Active Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {filteredStudents.filter((s) => s.status === 'active').length} active students in {sheetTitle}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inactive">
              <Card className="border-2 border-gray-100 shadow-xl">
                <CardHeader>
                  <CardTitle>Inactive Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {filteredStudents.filter((s) => s.status !== 'active').length} inactive students in {sheetTitle}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={showColumnModal} onOpenChange={setShowColumnModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingColumn ? 'Edit Column' : 'Add Column'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Column Name</Label>
              <Input value={columnForm.column_name} onChange={(e) => setColumnForm({ ...columnForm, column_name: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={columnForm.column_type} onValueChange={(v) => setColumnForm({ ...columnForm, column_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Value</Label>
              <Input value={columnForm.default_value} onChange={(e) => setColumnForm({ ...columnForm, default_value: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowColumnModal(false)}>
                Cancel
              </Button>
              <Button onClick={saveColumn} disabled={loading || !columnForm.column_name.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Student ({sheetTitle})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {createdSerial && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 font-semibold">
                Serial Code: <span className="font-mono">{createdSerial}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Student ID (optional)</Label>
                <Input value={studentForm.student_id} onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={studentForm.gender} onValueChange={(v) => setStudentForm({ ...studentForm, gender: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>First Name</Label>
                <Input value={studentForm.first_name} onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={studentForm.last_name} onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" value={studentForm.date_of_birth} onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                Close
              </Button>
              <Button
                onClick={addStudent}
                disabled={loading || !studentForm.first_name.trim() || !studentForm.last_name.trim()}
              >
                Add Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


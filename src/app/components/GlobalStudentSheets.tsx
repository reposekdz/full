import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Download, Upload, Eye, Edit, Trash2, Search, Filter, Plus, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import apiService from '../services/apiService';

export default function GlobalStudentSheets() {
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');

  const [newStudent, setNewStudent] = useState({
    student_id: '', first_name: '', last_name: '', email: '', phone: '',
    date_of_birth: '', gender: 'male', trade_id: '', level_id: '',
    guardian_name: '', guardian_phone: '', guardian_email: ''
  });

  const [newColumn, setNewColumn] = useState({
    column_name: '', column_type: 'text', is_required: false, default_value: '', display_order: 0
  });

  const [editForm, setEditForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    date_of_birth: '', gender: 'male', trade_id: '', level_id: '',
    guardian_name: '', guardian_phone: '', guardian_email: ''
  });

  useEffect(() => {
    loadTrades();
    loadLevels();
    loadAllStudents();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
  }, []);

  useEffect(() => {
    if (selectedTrade && selectedLevel) {
      loadSheetData();
    }
  }, [selectedTrade, selectedLevel]);

  const loadTrades = async () => {
    try {
      const data = await apiService.getTrades();
      setTrades(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadLevels = async () => {
    try {
      const data = await apiService.getLevels();
      setLevels(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadAllStudents = async () => {
    try {
      const data = await apiService.getStudents({});
      setAllStudents(data.users || data.students || data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadSheetData = async () => {
    setLoading(true);
    try {
      const [studentsData, columnsData] = await Promise.all([
        apiService.getStudentsByTradeLevel(parseInt(selectedTrade), parseInt(selectedLevel)),
        apiService.getLevelSheetColumns(parseInt(selectedTrade), parseInt(selectedLevel))
      ]);
      const fetchedStudents = studentsData.students || [];
      setStudents(fetchedStudents);
      setAllStudents(prev => {
        const filtered = prev.filter(s => s.trade_id?.toString() !== selectedTrade || s.level_id?.toString() !== selectedLevel);
        return [...filtered, ...fetchedStudents];
      });
      setColumns(columnsData || []);
      calculateStats(fetchedStudents);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    setStats({
      total: data.length,
      male: data.filter(s => s.gender === 'male').length,
      female: data.filter(s => s.gender === 'female').length,
      active: data.filter(s => s.status === 'active' || !s.status).length
    });
  };

  const handleViewDetails = async (student: any) => {
    setLoading(true);
    try {
      const details = await apiService.getStudentFullDetails(student.id);
      setSelectedStudent(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      alert(error.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setEditForm({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      email: student.email || '',
      phone: student.phone || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || 'male',
      trade_id: student.trade_id?.toString() || '',
      level_id: student.level_id?.toString() || '',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      guardian_email: student.guardian_email || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    setLoading(true);
    try {
      await apiService.updateStudentInfo(editingStudent.id, editForm);
      setShowEditModal(false);
      setEditingStudent(null);
      loadSheetData();
      loadAllStudents();
    } catch (error: any) {
      alert(error.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Urashaka gusiba uyu munyeshuri? Ntabwo bizasubizwa!')) return;
    setLoading(true);
    try {
      await apiService.dosDeleteStudent(studentId);
      loadSheetData();
      loadAllStudents();
    } catch (error: any) {
      alert(error.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name) {
      alert('Uzuza amazina yose!');
      return;
    }
    setLoading(true);
    try {
      await apiService.addStudent({
        ...newStudent,
        trade_id: parseInt(newStudent.trade_id || selectedTrade),
        level_id: parseInt(newStudent.level_id || selectedLevel)
      });
      setShowAddModal(false);
      setNewStudent({
        student_id: '', first_name: '', last_name: '', email: '', phone: '',
        date_of_birth: '', gender: 'male', trade_id: '', level_id: '',
        guardian_name: '', guardian_phone: '', guardian_email: ''
      });
      loadSheetData();
      loadAllStudents();
    } catch (error: any) {
      alert(error.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumn.column_name || !selectedTrade || !selectedLevel) {
      alert('Uzuza izina ry\'inkingi!');
      return;
    }
    setLoading(true);
    try {
      await apiService.createLevelSheetColumn({
        ...newColumn,
        trade_id: parseInt(selectedTrade),
        level_id: parseInt(selectedLevel)
      });
      setShowColumnModal(false);
      setNewColumn({ column_name: '', column_type: 'text', is_required: false, default_value: '', display_order: 0 });
      loadSheetData();
    } catch (error: any) {
      alert(error.message || 'Failed to add column');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateValue = async (studentId: number, columnId: number, value: string) => {
    try {
      await apiService.updateStudentColumnValue(studentId, columnId, value);
    } catch (error: any) {
      alert(error.message || 'Failed to update');
    }
  };

  const handleExport = () => {
    const tradeName = trades.find(t => t.id.toString() === selectedTrade)?.name || 'trade';
    const levelNum = levels.find(l => l.id.toString() === selectedLevel)?.level_number || 'level';
    const headers = ['ID', 'Name', 'Email', 'Phone', ...columns.map(c => c.column_name)];
    const rows = students.map(s => [
      s.student_id, `${s.first_name} ${s.last_name}`, s.email, s.phone,
      ...columns.map(c => s.custom_values?.[c.id] || '')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tradeName}-Level${levelNum}-${Date.now()}.csv`;
    a.click();
  };

  const filteredStudents = students.filter(s =>
    !searchQuery || s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Imbonerahamwe Rusange y'Abanyeshuri
            </h1>
            <p className="text-gray-600 mt-1">Gucunga abanyeshuri bose ku rwego n'umwuga</p>
          </div>
        </div>

        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Hitamo Urwego n'Umwuga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Umwuga</Label>
                <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hitamo umwuga..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trades.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urwego</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hitamo urwego..." />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(l => (
                      <SelectItem key={l.id} value={l.id.toString()}>Urwego {l.level_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedTrade && selectedLevel && (
          <>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Abanyeshuri Bose', value: stats.total, color: 'blue', icon: Users },
                { label: 'Abagabo', value: stats.male, color: 'green', icon: Users },
                { label: 'Abagore', value: stats.female, color: 'pink', icon: Users },
                { label: 'Bakora', value: stats.active, color: 'purple', icon: TrendingUp }
              ].map((stat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card className={`border-2 border-${stat.color}-200`}>
                    <CardContent className="p-4 text-center">
                      <stat.icon className={`w-8 h-8 mx-auto text-${stat.color}-600 mb-2`} />
                      <p className={`text-3xl font-black text-${stat.color}-900`}>{stat.value || 0}</p>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-2 border-purple-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                    Imbonerahamwe ({filteredStudents.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Shakisha..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64" />
                    {(userRole === 'dos' || userRole === 'headmaster' || userRole === 'admin') && (
                      <Button onClick={() => setShowAddModal(true)} className="bg-green-600">
                        <Plus className="w-4 h-4 mr-1" />Ongeraho
                      </Button>
                    )}
                    <Button onClick={() => setShowColumnModal(true)} variant="outline">
                      <Plus className="w-4 h-4 mr-1" />Inkingi
                    </Button>
                    <Button onClick={handleExport} variant="outline" disabled={!students.length}>
                      <Download className="w-4 h-4 mr-1" />Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 bg-gray-50">
                        <th className="p-3 text-left">Amazina</th>
                        <th className="p-3 text-left">Kode</th>
                        <th className="p-3 text-left">Imeri</th>
                        <th className="p-3 text-left">Telefone</th>
                        {columns.map(col => (
                          <th key={col.id} className="p-3 text-left">{col.column_name}</th>
                        ))}
                        <th className="p-3 text-right">Ibikorwa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, idx) => (
                        <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="border-b hover:bg-purple-50">
                          <td className="p-3">
                            <div>
                              <p className="font-semibold">{student.first_name} {student.last_name}</p>
                              <Badge className={student.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}>
                                {student.gender === 'male' ? 'Gabo' : 'Gore'}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3 text-sm">{student.student_id}</td>
                          <td className="p-3 text-sm">{student.email || '-'}</td>
                          <td className="p-3 text-sm">{student.phone || '-'}</td>
                          {columns.map(col => (
                            <td key={col.id} className="p-3">
                              <Input
                                type={col.column_type === 'number' ? 'number' : col.column_type === 'date' ? 'date' : 'text'}
                                defaultValue={student.custom_values?.[col.id] || col.default_value || ''}
                                onBlur={(e) => handleUpdateValue(student.id, col.id, e.target.value)}
                                className="w-full min-w-[120px]"
                                placeholder="-"
                              />
                            </td>
                          ))}
                          <td className="p-3 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="outline" onClick={() => handleViewDetails(student)}>
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditStudent(student)}>
                                <Edit className="w-3 h-3 text-blue-600" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteStudent(student.id)}>
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Nta banyeshuri bari kuri uyu mwuga n'urwego</p>
                      <p className="text-sm mt-2">DOS/Headmaster bashobora kongeraho abanyeshuri</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Hindura Amakuru y'Umunyeshuri</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Izina *</Label><Input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} /></div>
                <div><Label>Irindi zina *</Label><Input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} /></div>
                <div><Label>Imeri</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                <div><Label>Telefone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                <div><Label>Itariki y'Amavuko</Label><Input type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })} /></div>
                <div>
                  <Label>Igitsina *</Label>
                  <Select value={editForm.gender} onValueChange={(v) => setEditForm({ ...editForm, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Gabo</SelectItem>
                      <SelectItem value="female">Gore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Umwuga</Label>
                  <Select value={editForm.trade_id} onValueChange={(v) => setEditForm({ ...editForm, trade_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Hitamo umwuga..." /></SelectTrigger>
                    <SelectContent>
                      {trades.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Urwego</Label>
                  <Select value={editForm.level_id} onValueChange={(v) => setEditForm({ ...editForm, level_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Hitamo urwego..." /></SelectTrigger>
                    <SelectContent>
                      {levels.map(l => <SelectItem key={l.id} value={l.id.toString()}>Urwego {l.level_number}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Amakuru y'Umurerezi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Amazina</Label><Input value={editForm.guardian_name} onChange={(e) => setEditForm({ ...editForm, guardian_name: e.target.value })} /></div>
                  <div><Label>Telefone</Label><Input value={editForm.guardian_phone} onChange={(e) => setEditForm({ ...editForm, guardian_phone: e.target.value })} /></div>
                  <div><Label>Imeri</Label><Input type="email" value={editForm.guardian_email} onChange={(e) => setEditForm({ ...editForm, guardian_email: e.target.value })} /></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateStudent} disabled={loading} className="flex-1 bg-blue-600">
                  {loading ? 'Birimo kubikwa...' : 'Bika Impinduka'}
                </Button>
                <Button onClick={() => { setShowEditModal(false); setEditingStudent(null); }} variant="outline">Bika</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Amakuru Yuzuye</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Amakuru</TabsTrigger>
                  <TabsTrigger value="financial">Amafaranga</TabsTrigger>
                  <TabsTrigger value="custom">Inyongera</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold">Amazina:</span> {selectedStudent.first_name} {selectedStudent.last_name}</div>
                    <div><span className="font-semibold">Kode:</span> {selectedStudent.student_id}</div>
                    <div><span className="font-semibold">Imeri:</span> {selectedStudent.email || '-'}</div>
                    <div><span className="font-semibold">Telefone:</span> {selectedStudent.phone || '-'}</div>
                    <div><span className="font-semibold">Igitsina:</span> {selectedStudent.gender === 'male' ? 'Gabo' : 'Gore'}</div>
                    <div><span className="font-semibold">Umwuga:</span> {selectedStudent.trade_name || '-'}</div>
                    <div><span className="font-semibold">Urwego:</span> {selectedStudent.level_number ? `Urwego ${selectedStudent.level_number}` : '-'}</div>
                  </div>
                </TabsContent>
                <TabsContent value="financial">
                  {selectedStudent.financial && (
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="bg-green-50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{selectedStudent.financial.total_paid?.toLocaleString()} RWF</p><p className="text-xs">Yishyuye</p></CardContent></Card>
                      <Card className="bg-blue-50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{selectedStudent.financial.total_invoiced?.toLocaleString()} RWF</p><p className="text-xs">Yemejwe</p></CardContent></Card>
                      <Card className="bg-red-50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{selectedStudent.financial.balance?.toLocaleString()} RWF</p><p className="text-xs">Asigaye</p></CardContent></Card>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="custom">
                  {selectedStudent.custom_values?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStudent.custom_values.map((cv: any) => (
                        <div key={cv.id} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="font-semibold">{cv.column_name}:</span>
                          <span>{cv.column_value || '-'}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center text-gray-500 py-8">Nta makuru yinyongera</p>}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ongeraho Umunyeshuri Mushya</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Izina *</Label><Input value={newStudent.first_name} onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })} placeholder="Izina rya mbere" /></div>
                <div><Label>Irindi zina *</Label><Input value={newStudent.last_name} onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })} placeholder="Irindi zina" /></div>
                <div><Label>Kode y'Umunyeshuri</Label><Input value={newStudent.student_id} onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })} placeholder="STD001" /></div>
                <div>
                  <Label>Igitsina *</Label>
                  <Select value={newStudent.gender} onValueChange={(v) => setNewStudent({ ...newStudent, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Gabo</SelectItem>
                      <SelectItem value="female">Gore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Imeri</Label><Input type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} placeholder="email@example.com" /></div>
                <div><Label>Telefone</Label><Input value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} placeholder="+250788000000" /></div>
                <div><Label>Itariki y'Amavuko</Label><Input type="date" value={newStudent.date_of_birth} onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })} /></div>
                <div></div>
                <div>
                  <Label>Umwuga *</Label>
                  <Select value={newStudent.trade_id || selectedTrade} onValueChange={(v) => setNewStudent({ ...newStudent, trade_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Hitamo umwuga..." /></SelectTrigger>
                    <SelectContent>
                      {trades.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Urwego *</Label>
                  <Select value={newStudent.level_id || selectedLevel} onValueChange={(v) => setNewStudent({ ...newStudent, level_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Hitamo urwego..." /></SelectTrigger>
                    <SelectContent>
                      {levels.map(l => <SelectItem key={l.id} value={l.id.toString()}>Urwego {l.level_number}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Amakuru y'Umurerezi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Amazina</Label><Input value={newStudent.guardian_name} onChange={(e) => setNewStudent({ ...newStudent, guardian_name: e.target.value })} placeholder="Amazina y'umurerezi" /></div>
                  <div><Label>Telefone</Label><Input value={newStudent.guardian_phone} onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })} placeholder="+250788000000" /></div>
                  <div><Label>Imeri</Label><Input type="email" value={newStudent.guardian_email} onChange={(e) => setNewStudent({ ...newStudent, guardian_email: e.target.value })} placeholder="email@example.com" /></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddStudent} disabled={loading} className="flex-1 bg-green-600">
                  {loading ? 'Birimo kwandikwa...' : 'Andika Umunyeshuri'}
                </Button>
                <Button onClick={() => setShowAddModal(false)} variant="outline">Hagarika</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showColumnModal} onOpenChange={setShowColumnModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ongeraho Inkingi Nshya</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Izina ry'Inkingi *</Label><Input value={newColumn.column_name} onChange={(e) => setNewColumn({ ...newColumn, column_name: e.target.value })} placeholder="Urugero: Amanota, Imyitwarire" /></div>
              <div>
                <Label>Ubwoko *</Label>
                <Select value={newColumn.column_type} onValueChange={(v) => setNewColumn({ ...newColumn, column_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Inyandiko</SelectItem>
                    <SelectItem value="number">Umubare</SelectItem>
                    <SelectItem value="date">Itariki</SelectItem>
                    <SelectItem value="select">Guhitamo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Agaciro ka Mburabuzi</Label><Input value={newColumn.default_value} onChange={(e) => setNewColumn({ ...newColumn, default_value: e.target.value })} placeholder="Agaciro ka mburabuzi" /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newColumn.is_required} onChange={(e) => setNewColumn({ ...newColumn, is_required: e.target.checked })} className="w-4 h-4" />
                <Label>Ni ngombwa</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddColumn} disabled={loading || !selectedTrade || !selectedLevel} className="flex-1 bg-purple-600">
                  {loading ? 'Birimo kwandikwa...' : 'Andika Inkingi'}
                </Button>
                <Button onClick={() => setShowColumnModal(false)} variant="outline">Hagarika</Button>
              </div>
              {(!selectedTrade || !selectedLevel) && (
                <p className="text-sm text-red-600">Hitamo umwuga n'urwego mbere!</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Edit, Trash2, Eye, Search, Filter, X, Save, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { PowerfulStudentSelector } from '../components/PowerfulStudentSelector';
import apiService from '../services/apiService';

export default function DOSStudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [filterTrade, setFilterTrade] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    trade_code: '',
    level_number: '',
    level_suffix: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    guardian_name: '',
    guardian_phone: '',
    guardian_email: ''
  });

  useEffect(() => {
    loadTrades();
    loadStudents();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [filterTrade, filterLevel, searchQuery]);

  const loadTrades = async () => {
    try {
      const data = await apiService.request('/management/trades');
      setTrades(data || []);
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const params: any = {};
      if (filterTrade && filterTrade !== 'all') params.trade_code = filterTrade;
      if (filterLevel && filterLevel !== 'all') params.level_number = filterLevel;
      if (searchQuery) params.search = searchQuery;
      
      const data = await apiService.getStudents(params);
      setStudents(data.users || data.students || data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleAddStudent = async () => {
    setLoading(true);
    try {
      const result = await apiService.request('/management/students', {
        method: 'POST',
        body: JSON.stringify(studentForm)
      });
      if (result.success) {
        alert(`Student added successfully! Serial Code: ${result.serial_code}`);
        setShowAddModal(false);
        resetForm();
        loadStudents();
        
        // Broadcast update event for global sheets
        window.dispatchEvent(new CustomEvent('studentAdded', { detail: result.student }));
      } else {
        alert(result.error || 'Failed to add student');
      }
    } catch (error: any) {
      alert(error.message || 'Byanze kwandika umunyeshuri');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (student: any) => {
    setLoading(true);
    try {
      const details = await apiService.getStudentFullDetails(student.id);
      setSelectedStudent(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      alert(error.message || 'Byanze gufata amakuru');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Urashaka gusiba uyu munyeshuri?')) return;
    try {
      await apiService.dosDeleteStudent(studentId);
      loadStudents();
    } catch (error: any) {
      alert(error.message || 'Byanze gusiba umunyeshuri');
    }
  };

  const resetForm = () => {
    setStudentForm({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: 'male',
      trade_code: '',
      level_number: '',
      level_suffix: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      guardian_name: '',
      guardian_phone: '',
      guardian_email: ''
    });
    setSelectedTrade(null);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchQuery || 
      s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Gucunga Abanyeshuri
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Ongeraho Umunyeshuri
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Shakisha amazina cyangwa kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTrade} onValueChange={setFilterTrade}>
              <SelectTrigger>
                <SelectValue placeholder="Umwuga wose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Umwuga wose</SelectItem>
                {trades.map(trade => (
                  <SelectItem key={trade.code} value={trade.code}>
                    {trade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Urwego rwose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Urwego rwose</SelectItem>
                {selectedTrade?.levels?.map((level: any) => (
                  <SelectItem key={`${level.level_number}${level.level_suffix || ''}`} value={level.level_number.toString()}>
                    Level {level.level_number}{level.level_suffix || ''}
                  </SelectItem>
                )) || trades.find(t => t.code === filterTrade)?.levels?.map((level: any) => (
                  <SelectItem key={`${level.level_number}${level.level_suffix || ''}`} value={level.level_number.toString()}>
                    Level {level.level_number}{level.level_suffix || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-3">Amazina</th>
                  <th className="text-left p-3">Kode</th>
                  <th className="text-left p-3">Umwuga</th>
                  <th className="text-left p-3">Urwego</th>
                  <th className="text-left p-3">Telefone</th>
                  <th className="text-right p-3">Ibikorwa</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b hover:bg-blue-50"
                  >
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{student.student_id}</td>
                    <td className="p-3 text-sm">{student.trade_code || student.trade_name || '-'}</td>
                    <td className="p-3 text-sm">
                      {student.level_number ? `Level ${student.level_number}${student.level_suffix || ''}` : '-'}
                    </td>
                    <td className="p-3 text-sm">{student.phone || '-'}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(student)}>
                          <Eye className="w-3 h-3" />
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
          </div>
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ongeraho Umunyeshuri Mushya</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kode y'Umunyeshuri *</Label>
                <Input
                  value={studentForm.student_id}
                  onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
                  placeholder="STD001"
                />
              </div>
              <div>
                <Label>Izina *</Label>
                <Input
                  value={studentForm.first_name}
                  onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Irindi zina *</Label>
                <Input
                  value={studentForm.last_name}
                  onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Imeri</Label>
                <Input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Itariki y'Amavuko</Label>
                <Input
                  type="date"
                  value={studentForm.date_of_birth}
                  onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label>Igitsina *</Label>
                <Select value={studentForm.gender} onValueChange={(v) => setStudentForm({ ...studentForm, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Gabo</SelectItem>
                    <SelectItem value="female">Gore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Umwuga *</Label>
                <Select 
                  value={studentForm.trade_code} 
                  onValueChange={(v) => {
                    const trade = trades.find(t => t.code === v);
                    setSelectedTrade(trade);
                    setStudentForm({ ...studentForm, trade_code: v, level_number: '', level_suffix: '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hitamo umwuga..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trades.map(trade => (
                      <SelectItem key={trade.code} value={trade.code}>
                        {trade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urwego *</Label>
                <Select 
                  value={studentForm.level_number ? `${studentForm.level_number}${studentForm.level_suffix || ''}` : ''} 
                  onValueChange={(v) => {
                    const level = selectedTrade?.levels?.find((l: any) => `${l.level_number}${l.level_suffix || ''}` === v);
                    if (level) {
                      setStudentForm({ 
                        ...studentForm, 
                        level_number: level.level_number.toString(), 
                        level_suffix: level.level_suffix || '' 
                      });
                    }
                  }}
                  disabled={!studentForm.trade_code}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hitamo urwego..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTrade?.levels?.map((level: any) => (
                      <SelectItem key={`${level.level_number}${level.level_suffix || ''}`} value={`${level.level_number}${level.level_suffix || ''}`}>
                        Level {level.level_number}{level.level_suffix || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Itariki yo Kwiyandikisha</Label>
                <Input
                  type="date"
                  value={studentForm.enrollment_date}
                  onChange={(e) => setStudentForm({ ...studentForm, enrollment_date: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Quick Student Reference</h3>
              <PowerfulStudentSelector
                value=""
                onChange={(id, data) => {
                  if (data) {
                    setStudentForm({
                      ...studentForm,
                      trade_code: data.trade_code || '',
                      level_number: data.level_number?.toString() || '',
                      level_suffix: data.level_suffix || ''
                    });
                    const trade = trades.find(t => t.code === data.trade_code);
                    setSelectedTrade(trade);
                  }
                }}
                label="Hitamo Umunyeshuri"
                placeholder="Andika izina, kode, umwuga cyangwa urwego..."
                showAdvancedFilters={true}
                showStudentStats={true}
                enableVoiceSearch={true}
                showFavorites={true}
                required={false}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddStudent} disabled={loading} className="flex-1 bg-blue-600">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Birimo kubikwa...' : 'Bika Umunyeshuri'}
              </Button>
              <Button onClick={() => { setShowAddModal(false); resetForm(); }} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Bika
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Amakuru Yuzuye y'Umunyeshuri</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Amakuru Rusange</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="font-semibold">Amazina:</span> {selectedStudent.first_name} {selectedStudent.last_name}</div>
                  <div><span className="font-semibold">Kode:</span> {selectedStudent.student_id}</div>
                  <div><span className="font-semibold">Imeri:</span> {selectedStudent.email || '-'}</div>
                  <div><span className="font-semibold">Telefone:</span> {selectedStudent.phone || '-'}</div>
                  <div><span className="font-semibold">Igitsina:</span> {selectedStudent.gender === 'male' ? 'Gabo' : 'Gore'}</div>
                  <div><span className="font-semibold">Itariki y'Amavuko:</span> {selectedStudent.date_of_birth || '-'}</div>
                  <div><span className="font-semibold">Umwuga:</span> {selectedStudent.trade_code || selectedStudent.trade_name || '-'}</div>
                  <div><span className="font-semibold">Urwego:</span> {selectedStudent.level_number ? `Level ${selectedStudent.level_number}${selectedStudent.level_suffix || ''}` : '-'}</div>
                </CardContent>
              </Card>

              {selectedStudent.financial && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Amakuru y'Amafaranga</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">
                        {selectedStudent.financial.total_paid?.toLocaleString()} RWF
                      </p>
                      <p className="text-xs text-gray-600">Yishyuye</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedStudent.financial.total_invoiced?.toLocaleString()} RWF
                      </p>
                      <p className="text-xs text-gray-600">Yemejwe</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <p className="text-2xl font-bold text-red-600">
                        {selectedStudent.financial.balance?.toLocaleString()} RWF
                      </p>
                      <p className="text-xs text-gray-600">Asigaye</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedStudent.custom_values && selectedStudent.custom_values.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Amakuru Yinyongera</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedStudent.custom_values.map((cv: any) => (
                      <div key={cv.id} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-semibold">{cv.column_name}:</span>
                        <span>{cv.column_value || '-'}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {selectedStudent.recent_payments && selectedStudent.recent_payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kwishyura Kwa Vuba</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedStudent.recent_payments.map((payment: any) => (
                        <div key={payment.id} className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                          <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                          <span className="font-semibold text-green-600">{payment.amount?.toLocaleString()} RWF</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

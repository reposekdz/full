import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Edit, Trash2, Eye, Search, Filter, X, Save, Users, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import apiService from '../../services/apiService';

const TRADES = [
  { code: 'SOD', name: 'SOD', levels: [
    { level_number: 3, level_suffix: '', name: 'Level 3' },
    { level_number: 4, level_suffix: '', name: 'Level 4' },
    { level_number: 5, level_suffix: '', name: 'Level 5' }
  ]},
  { code: 'BDC', name: 'BDC', levels: [
    { level_number: 3, level_suffix: '', name: 'Level 3' },
    { level_number: 4, level_suffix: '', name: 'Level 4' },
    { level_number: 5, level_suffix: '', name: 'Level 5' }
  ]},
  { code: 'AUT', name: 'AUT', levels: [
    { level_number: 3, level_suffix: '', name: 'Level 3' },
    { level_number: 4, level_suffix: 'A', name: 'Level 4 A' },
    { level_number: 4, level_suffix: 'B', name: 'Level 4 B' },
    { level_number: 5, level_suffix: 'A', name: 'Level 5 A' },
    { level_number: 5, level_suffix: 'B', name: 'Level 5 B' }
  ]}
];

export default function HeadmasterStudentManagement({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [filterTrade, setFilterTrade] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
    loadStudents();
  }, [filterTrade, filterLevel, searchQuery]);

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
      alert(error.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      await apiService.updateStudent(selectedStudent.id, studentForm);
      setShowEditModal(false);
      resetForm();
      loadStudents();
    } catch (error: any) {
      alert(error.message || 'Failed to update student');
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
      alert(error.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setStudentForm({
      student_id: student.student_id || '',
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      email: student.email || '',
      phone: student.phone || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || 'male',
      trade_code: student.trade_code || '',
      level_number: student.level_number?.toString() || '',
      level_suffix: student.level_suffix || '',
      enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      guardian_email: student.guardian_email || ''
    });
    const trade = TRADES.find(t => t.code === student.trade_code);
    setSelectedTrade(trade || null);
    setShowEditModal(true);
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await apiService.dosDeleteStudent(studentId);
      loadStudents();
    } catch (error: any) {
      alert(error.message || 'Failed to delete student');
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
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchQuery || 
      s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: filteredStudents.length,
    sod: filteredStudents.filter(s => s.trade_code === 'SOD').length,
    bdc: filteredStudents.filter(s => s.trade_code === 'BDC').length,
    aut: filteredStudents.filter(s => s.trade_code === 'AUT').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-1">Manage all students across trades and levels</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-blue-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Student
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600 mt-1">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.sod}</p>
              <p className="text-sm text-gray-600 mt-1">SOD Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.bdc}</p>
              <p className="text-sm text-gray-600 mt-1">BDC Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.aut}</p>
              <p className="text-sm text-gray-600 mt-1">AUT Students</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Students
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTrade} onValueChange={setFilterTrade}>
              <SelectTrigger>
                <SelectValue placeholder="All Trades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {TRADES.map(trade => (
                  <SelectItem key={trade.code} value={trade.code}>
                    {trade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {TRADES.find(t => t.code === filterTrade)?.levels?.map((level: any) => (
                  <SelectItem key={`${level.level_number}${level.level_suffix || ''}`} value={level.level_number.toString()}>
                    Level {level.level_number}{level.level_suffix || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Students List ({filteredStudents.length})
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-3">Student ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Trade</th>
                  <th className="text-left p-3">Level</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Guardian</th>
                  <th className="text-right p-3">Actions</th>
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
                    <td className="p-3 text-sm font-mono">{student.student_id}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{student.trade_code || '-'}</td>
                    <td className="p-3 text-sm">
                      {student.level_number ? `Level ${student.level_number}${student.level_suffix || ''}` : '-'}
                    </td>
                    <td className="p-3 text-sm">{student.phone || '-'}</td>
                    <td className="p-3 text-sm">{student.guardian_name || '-'}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(student)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditStudent(student)}>
                          <Edit className="w-3 h-3" />
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

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Student ID *</Label>
                <Input
                  value={studentForm.student_id}
                  onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
                  placeholder="STD001"
                />
              </div>
              <div>
                <Label>First Name *</Label>
                <Input
                  value={studentForm.first_name}
                  onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={studentForm.last_name}
                  onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={studentForm.date_of_birth}
                  onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label>Gender *</Label>
                <Select value={studentForm.gender} onValueChange={(v) => setStudentForm({ ...studentForm, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trade *</Label>
                <Select 
                  value={studentForm.trade_code} 
                  onValueChange={(v) => {
                    const trade = TRADES.find(t => t.code === v);
                    setSelectedTrade(trade);
                    setStudentForm({ ...studentForm, trade_code: v, level_number: '', level_suffix: '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADES.map(trade => (
                      <SelectItem key={trade.code} value={trade.code}>
                        {trade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level *</Label>
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
                    <SelectValue placeholder="Select level..." />
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
                <Label>Enrollment Date</Label>
                <Input
                  type="date"
                  value={studentForm.enrollment_date}
                  onChange={(e) => setStudentForm({ ...studentForm, enrollment_date: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Guardian Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Guardian Name</Label>
                  <Input
                    value={studentForm.guardian_name}
                    onChange={(e) => setStudentForm({ ...studentForm, guardian_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Guardian Phone</Label>
                  <Input
                    value={studentForm.guardian_phone}
                    onChange={(e) => setStudentForm({ ...studentForm, guardian_phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Guardian Email</Label>
                  <Input
                    type="email"
                    value={studentForm.guardian_email}
                    onChange={(e) => setStudentForm({ ...studentForm, guardian_email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddStudent} disabled={loading} className="flex-1 bg-blue-600">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Student'}
              </Button>
              <Button onClick={() => { setShowAddModal(false); resetForm(); }} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="font-semibold">Name:</span> {selectedStudent.first_name} {selectedStudent.last_name}</div>
                  <div><span className="font-semibold">Student ID:</span> {selectedStudent.student_id}</div>
                  <div><span className="font-semibold">Email:</span> {selectedStudent.email || '-'}</div>
                  <div><span className="font-semibold">Phone:</span> {selectedStudent.phone || '-'}</div>
                  <div><span className="font-semibold">Gender:</span> {selectedStudent.gender === 'male' ? 'Male' : 'Female'}</div>
                  <div><span className="font-semibold">Date of Birth:</span> {selectedStudent.date_of_birth || '-'}</div>
                  <div><span className="font-semibold">Trade:</span> {selectedStudent.trade_code || '-'}</div>
                  <div><span className="font-semibold">Level:</span> {selectedStudent.level_number ? `Level ${selectedStudent.level_number}${selectedStudent.level_suffix || ''}` : '-'}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

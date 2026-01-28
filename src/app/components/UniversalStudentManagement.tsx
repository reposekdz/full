import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Download, Eye, Edit, Trash2, UserPlus, X, Phone, Mail, MapPin, User, Send, MessageSquare, Bell, BookOpen, Calendar, Award, Activity, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Textarea } from '@/app/components/ui/textarea';
import { useAuth } from '@/app/contexts/AuthContext';

interface UniversalStudentManagementProps {
  allowedRoles?: string[];
}

const UniversalStudentManagement: React.FC<UniversalStudentManagementProps> = ({ 
  allowedRoles = ['admin', 'super_admin', 'headmaster', 'dos', 'dod', 'accountant', 'patron', 'teacher'] 
}) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentProfileDialog, setShowStudentProfileDialog] = useState(false);
  const [studentProfileData, setStudentProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    trade: '',
    level: '',
    class: '',
    status: 'active'
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    trade_code: '',
    level_number: '',
    level_suffix: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: ''
  });

  const API_BASE = 'http://localhost:5000/api';
  const canManage = allowedRoles.includes(user?.role || '');

  useEffect(() => {
    fetchStudents();
    fetchTrades();
  }, [filters, pagination.page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status })
      });

      const response = await fetch(`${API_BASE}/students/list?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrades = async () => {
    try {
      const response = await fetch(`${API_BASE}/levels/trades-with-levels`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setTrades(data.trades);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/students/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newStudent,
          admission_number: `STD${Date.now()}` // Auto-generated serial code
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Student added successfully!\nSerial Code: ${data.student.username}\nPassword: student123\n\nStudent can login with this serial code.`);
        setIsAddDialogOpen(false);
        setNewStudent({
          first_name: '', last_name: '', email: '', phone: '', trade_code: '', level_number: '', level_suffix: '',
          date_of_birth: '', gender: '', blood_group: '', address: '', guardian_name: '', guardian_phone: '', guardian_email: ''
        });
        fetchStudents();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = async (studentId: number) => {
    try {
      const response = await fetch(`${API_BASE}/students/details/${studentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedStudent(data.student);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const response = await fetch(`${API_BASE}/students/delete/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Student deleted successfully');
        fetchStudents();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStudentProfile = async (studentId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/students/${studentId}/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudentProfileData(data.data);
        setShowStudentProfileDialog(true);
        setActiveTab('profile');
      } else {
        alert('Failed to fetch student profile');
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      alert('Failed to fetch student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }
    try {
      setSendingMessage(true);
      const response = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sender_id: user?.id,
          sender_role: user?.role,
          recipient_type: 'student',
          recipient_id: studentProfileData?.student?.id || studentProfileData?.id,
          message: messageText,
          subject: `Message from ${user?.role || 'Staff'}`
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Message sent successfully!');
        setMessageText('');
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/list?limit=10000`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        const csv = [
          ['Serial Code', 'Name', 'Email', 'Phone', 'Trade', 'Level', 'Status', 'Guardian', 'Guardian Phone'].join(','),
          ...data.students.map((s: any) => [
            s.username, `${s.first_name} ${s.last_name}`, s.email, s.phone || '', s.classes || '', '', 
            s.is_active ? 'Active' : 'Inactive', s.guardian_name || '', s.guardian_phone || ''
          ].join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${Date.now()}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchTrade = !filters.trade || s.classes?.includes(filters.trade);
    const matchLevel = !filters.level || s.classes?.includes(filters.level);
    const matchClass = !filters.class || s.classes?.includes(filters.class);
    return matchTrade && matchLevel && matchClass;
  });

  const availableLevels = filters.trade 
    ? trades.find(t => t.trade_code === filters.trade)?.levels?.map(l => `${l.level_number}${l.level_suffix || ''}`) || []
    : [];
  const uniqueTrades = [...new Set(trades.map(t => t.trade_code))];

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-green-600" />
              Gucunga Abanyeshuri
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Reba, ongeraho, hindura abanyeshuri bose</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Pakurura
            </Button>
            {canManage && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-to-r from-green-600 to-lime-600 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Ongeraho Umunyeshuri
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Shakisha (izina, email, code)..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select value={filters.trade || "all"} onValueChange={(v) => setFilters({ ...filters, trade: v === "all" ? "" : v, level: '', class: '' })}>
            <SelectTrigger><SelectValue placeholder="Umwuga" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Byose</SelectItem>
              {uniqueTrades.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.level || "all"} onValueChange={(v) => setFilters({ ...filters, level: v === "all" ? "" : v })} disabled={!filters.trade}>
            <SelectTrigger><SelectValue placeholder="Urwego" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Byose</SelectItem>
              {availableLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.class || "all"} onValueChange={(v) => setFilters({ ...filters, class: v === "all" ? "" : v })}>
            <SelectTrigger><SelectValue placeholder="Ikilas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Byose</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? "" : v })}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Byose</SelectItem>
              <SelectItem value="active">Bakora</SelectItem>
              <SelectItem value="inactive">Ntibakora</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Code</TableHead>
                <TableHead>Izina</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefoni</TableHead>
                <TableHead>Amaklasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ibikorwa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Gukuramo...</TableCell></TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Nta munyeshuri wabonetse</TableCell></TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-green-600 to-lime-600 text-white">{student.username}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-100 text-green-600">{student.first_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.first_name} {student.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone || '-'}</TableCell>
                    <TableCell>{student.classes || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={student.is_active ? 'default' : 'secondary'}>
                        {student.is_active ? 'Akora' : 'Ntakora'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => fetchStudentProfile(student.id)} title="View Full Profile">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canManage && (
                          <>
                            <Button size="sm" variant="outline" title="Edit Student">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteStudent(student.id)} title="Delete Student">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Kwerekana {filteredStudents.length} kuri {pagination.total} abanyeshuri
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
              Ibanze
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
              Ikurikira
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ongeraho Umunyeshuri Mushya</DialogTitle>
            <DialogDescription>Uzuza amakuru y'umunyeshuri. Sisitemu izatanga serial code yihariye.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Izina rya Mbere *</Label>
              <Input value={newStudent.first_name} onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })} />
            </div>
            <div>
              <Label>Izina rya Kabiri *</Label>
              <Input value={newStudent.last_name} onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefoni</Label>
              <Input value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} />
            </div>
            <div>
              <Label>Umwuga *</Label>
              <Select value={newStudent.trade_code} onValueChange={(v) => setNewStudent({ ...newStudent, trade_code: v, level_number: '', level_suffix: '' })}>
                <SelectTrigger><SelectValue placeholder="Hitamo umwuga" /></SelectTrigger>
                <SelectContent>
                  {uniqueTrades.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Urwego *</Label>
              <Select value={`${newStudent.level_number}${newStudent.level_suffix}`} onValueChange={(v) => {
                const selectedTrade = trades.find(t => t.trade_code === newStudent.trade_code);
                const level = selectedTrade?.levels?.find(l => `${l.level_number}${l.level_suffix || ''}` === v);
                if (level) setNewStudent({ ...newStudent, level_number: level.level_number.toString(), level_suffix: level.level_suffix || '' });
              }} disabled={!newStudent.trade_code}>
                <SelectTrigger><SelectValue placeholder="Hitamo urwego" /></SelectTrigger>
                <SelectContent>
                  {trades.find(t => t.trade_code === newStudent.trade_code)?.levels?.map((l: any) => (
                    <SelectItem key={`${l.level_number}${l.level_suffix || ''}`} value={`${l.level_number}${l.level_suffix || ''}`}>
                      Level {l.level_number}{l.level_suffix || ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Itariki y'Amavuko</Label>
              <Input type="date" value={newStudent.date_of_birth} onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })} />
            </div>
            <div>
              <Label>Igitsina</Label>
              <Select value={newStudent.gender} onValueChange={(v) => setNewStudent({ ...newStudent, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Hitamo igitsina" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Gabo</SelectItem>
                  <SelectItem value="female">Gore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Aderesi</Label>
              <Input value={newStudent.address} onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })} />
            </div>
            <div>
              <Label>Izina ry'Umubyeyi</Label>
              <Input value={newStudent.guardian_name} onChange={(e) => setNewStudent({ ...newStudent, guardian_name: e.target.value })} />
            </div>
            <div>
              <Label>Telefoni y'Umubyeyi</Label>
              <Input value={newStudent.guardian_phone} onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Email y'Umubyeyi</Label>
              <Input type="email" value={newStudent.guardian_email} onChange={(e) => setNewStudent({ ...newStudent, guardian_email: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hagarika</Button>
            <Button onClick={handleAddStudent} disabled={loading || !newStudent.first_name || !newStudent.last_name || !newStudent.email || !newStudent.trade_code} className="bg-gradient-to-r from-green-600 to-lime-600 text-white">
              {loading ? 'Bika...' : 'Bika Umunyeshuri'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Amakuru ya {selectedStudent?.first_name} {selectedStudent?.last_name}</DialogTitle>
            <DialogDescription>Serial Code: {selectedStudent?.username}</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Email</Label>
                <p className="font-medium">{selectedStudent.email}</p>
              </div>
              <div>
                <Label className="text-gray-600">Telefoni</Label>
                <p className="font-medium">{selectedStudent.phone || '-'}</p>
              </div>
              <div>
                <Label className="text-gray-600">Itariki y'Amavuko</Label>
                <p className="font-medium">{selectedStudent.date_of_birth || '-'}</p>
              </div>
              <div>
                <Label className="text-gray-600">Igitsina</Label>
                <p className="font-medium">{selectedStudent.gender || '-'}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-600">Aderesi</Label>
                <p className="font-medium">{selectedStudent.address || '-'}</p>
              </div>
              <div>
                <Label className="text-gray-600">Umubyeyi</Label>
                <p className="font-medium">{selectedStudent.guardian_name || '-'}</p>
              </div>
              <div>
                <Label className="text-gray-600">Telefoni y'Umubyeyi</Label>
                <p className="font-medium">{selectedStudent.guardian_phone || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Advanced Student Profile Dialog */}
      <Dialog open={showStudentProfileDialog} onOpenChange={setShowStudentProfileDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <User className="w-6 h-6 text-green-600" />
                  {studentProfileData?.student?.first_name} {studentProfileData?.student?.last_name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge className="bg-gradient-to-r from-green-600 to-lime-600 text-white">
                    {studentProfileData?.student?.username || studentProfileData?.student?.admission_number}
                  </Badge>
                  <Badge variant={studentProfileData?.student?.is_active ? 'default' : 'secondary'}>
                    {studentProfileData?.student?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </DialogDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowStudentProfileDialog(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4">
            <Button
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'profile' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'academic' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('academic')}
            >
              <BookOpen className="w-4 h-4" />
              Academic
            </Button>
            <Button
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'attendance' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('attendance')}
            >
              <Calendar className="w-4 h-4" />
              Attendance
            </Button>
            <Button
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'performance' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('performance')}
            >
              <Award className="w-4 h-4" />
              Performance
            </Button>
            <Button
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'message' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('message')}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && studentProfileData && (
            <div className="space-y-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-600 flex items-center gap-1">
                        <User className="w-3 h-3" /> First Name
                      </Label>
                      <p className="font-medium">{studentProfileData.student?.first_name || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600 flex items-center gap-1">
                        <User className="w-3 h-3" /> Last Name
                      </Label>
                      <p className="font-medium">{studentProfileData.student?.last_name || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </Label>
                      <p className="font-medium text-sm">{studentProfileData.student?.email || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </Label>
                      <p className="font-medium">{studentProfileData.student?.phone || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Date of Birth
                      </Label>
                      <p className="font-medium">{studentProfileData.student?.date_of_birth || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Gender</Label>
                      <p className="font-medium">{studentProfileData.student?.gender || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Blood Group</Label>
                      <p className="font-medium">{studentProfileData.student?.blood_group || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Address
                      </Label>
                      <p className="font-medium">{studentProfileData.student?.address || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-600">Guardian Name</Label>
                      <p className="font-medium">{studentProfileData.student?.guardian_name || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Guardian Phone
                      </Label>
                      <p className="font-medium">{studentProfileData.student?.guardian_phone || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Guardian Email
                      </Label>
                      <p className="font-medium text-sm">{studentProfileData.student?.guardian_email || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === 'academic' && studentProfileData && (
            <div className="space-y-4">
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Enrollments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentProfileData.enrollments?.length > 0 ? (
                    <div className="space-y-3">
                      {studentProfileData.enrollments.map((enrollment: any, idx: number) => (
                        <Card key={idx} className="border-l-4 border-l-purple-500">
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <Label className="text-gray-600">Class</Label>
                                <p className="font-medium">{enrollment.class_name || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-gray-600">Level</Label>
                                <p className="font-medium">{enrollment.level || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-gray-600">Enrollment Date</Label>
                                <p className="font-medium text-sm">{enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : '-'}</p>
                              </div>
                              <div>
                                <Label className="text-gray-600">Status</Label>
                                <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                                  {enrollment.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No enrollments found</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Recent Grades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentProfileData.grades?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Subject</th>
                            <th className="text-left p-2">Score</th>
                            <th className="text-left p-2">Max</th>
                            <th className="text-left p-2">Percentage</th>
                            <th className="text-left p-2">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentProfileData.grades.slice(0, 5).map((grade: any, idx: number) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2">{grade.subject_name || '-'}</td>
                              <td className="p-2 font-medium">{grade.obtained_marks}</td>
                              <td className="p-2">{grade.max_marks}</td>
                              <td className="p-2">
                                <Badge className={
                                  (grade.obtained_marks / grade.max_marks * 100) >= 70 ? 'bg-green-500' :
                                  (grade.obtained_marks / grade.max_marks * 100) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }>
                                  {((grade.obtained_marks / grade.max_marks) * 100).toFixed(1)}%
                                </Badge>
                              </td>
                              <td className="p-2 text-sm">{grade.assessment_date ? new Date(grade.assessment_date).toLocaleDateString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No grades recorded yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && studentProfileData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-green-200">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{studentProfileData.attendance?.present || 0}</p>
                    <p className="text-sm text-gray-600">Present</p>
                  </CardContent>
                </Card>
                <Card className="border-red-200">
                  <CardContent className="pt-6 text-center">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">{studentProfileData.attendance?.absent || 0}</p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </CardContent>
                </Card>
                <Card className="border-yellow-200">
                  <CardContent className="pt-6 text-center">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{studentProfileData.attendance?.late || 0}</p>
                    <p className="text-sm text-gray-600">Late</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200">
                  <CardContent className="pt-6 text-center">
                    <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{studentProfileData.attendance?.total || 0}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance Rate</span>
                      <span className="font-bold">
                        {studentProfileData.attendance?.total > 0 
                          ? ((studentProfileData.attendance?.present / studentProfileData.attendance?.total) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-green-600 to-lime-600 h-4 rounded-full transition-all"
                        style={{ 
                          width: `${studentProfileData.attendance?.total > 0 
                            ? ((studentProfileData.attendance?.present / studentProfileData.attendance?.total) * 100)
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && studentProfileData && (
            <div className="space-y-4">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Academic Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {studentProfileData.average_grade ? studentProfileData.average_grade.toFixed(1) : '0.0'}%
                      </p>
                      <p className="text-sm text-gray-600">Average Grade</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {studentProfileData.grades?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Assessments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {studentProfileData.enrollments?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Active Classes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">
                        {studentProfileData.attendance?.total > 0 
                          ? ((studentProfileData.attendance?.present / studentProfileData.attendance?.total) * 100).toFixed(0)
                          : 0}%
                      </p>
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Message Tab */}
          {activeTab === 'message' && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Send Message to Student
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Recipient</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-1">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">
                        {studentProfileData?.student?.first_name} {studentProfileData?.student?.last_name}
                      </span>
                      <Badge className="ml-auto">{studentProfileData?.student?.username}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      className="mt-1 min-h-[150px]"
                      placeholder="Type your message here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={sendingMessage || !messageText.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-lime-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudentProfileDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UniversalStudentManagement;

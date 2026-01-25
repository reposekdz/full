import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Download, Eye, Edit, Trash2, UserPlus, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
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
      const response = await fetch(`${API_BASE}/dos/trades`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setTrades(data.data);
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

  const availableLevels = filters.trade ? trades.filter(t => t.trade_code === filters.trade).map(t => `${t.level_number}${t.level_suffix || ''}`) : [];
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
          <Select value={filters.trade} onValueChange={(v) => setFilters({ ...filters, trade: v, level: '', class: '' })}>
            <SelectTrigger><SelectValue placeholder="Umwuga" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Byose</SelectItem>
              {uniqueTrades.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.level} onValueChange={(v) => setFilters({ ...filters, level: v })} disabled={!filters.trade}>
            <SelectTrigger><SelectValue placeholder="Urwego" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Byose</SelectItem>
              {availableLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.class} onValueChange={(v) => setFilters({ ...filters, class: v })}>
            <SelectTrigger><SelectValue placeholder="Ikilas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Byose</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Byose</SelectItem>
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
                        <Button size="sm" variant="outline" onClick={() => handleViewStudent(student.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canManage && (
                          <>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteStudent(student.id)}>
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
                const trade = trades.find(t => `${t.level_number}${t.level_suffix || ''}` === v && t.trade_code === newStudent.trade_code);
                if (trade) setNewStudent({ ...newStudent, level_number: trade.level_number.toString(), level_suffix: trade.level_suffix || '' });
              }} disabled={!newStudent.trade_code}>
                <SelectTrigger><SelectValue placeholder="Hitamo urwego" /></SelectTrigger>
                <SelectContent>
                  {trades.filter(t => t.trade_code === newStudent.trade_code).map(t => (
                    <SelectItem key={t.id} value={`${t.level_number}${t.level_suffix || ''}`}>
                      Level {t.level_number}{t.level_suffix || ''}
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
    </Card>
  );
};

export default UniversalStudentManagement;

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Plus, Search, Download, Edit, Trash2, Eye, 
  CheckCircle, RefreshCw, BarChart3
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  trade_code: string;
  trade_name: string;
  level_number: number;
  class_name: string;
  avg_grade: number;
  present_count: number;
  total_attendance: number;
  is_active: boolean;
}

const AdminStudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    trade_code: 'SOD',
    level_number: 4,
    level_suffix: 'A'
  });

  useEffect(() => {
    loadStudents();
  }, [searchTerm, selectedTrade]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/students?search=${searchTerm}&trade_code=${selectedTrade !== 'all' ? selectedTrade : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Student added successfully');
        setShowAddDialog(false);
        loadStudents();
      }
    } catch (error) {
      toast.error('Failed to add student');
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Student ID', 'Name', 'Email', 'Phone', 'Trade', 'Status'],
      ...students.map(s => [
        s.student_id,
        `${s.first_name} ${s.last_name}`,
        s.email,
        s.phone,
        s.trade_code,
        s.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Student Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all student records</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.is_active).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  <SelectItem value="SOD">Software Development</SelectItem>
                  <SelectItem value="BDC">Building Construction</SelectItem>
                  <SelectItem value="AUT">Automobile Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {student.first_name[0]}{student.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.student_id}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{student.trade_code}</Badge>
                      </TableCell>
                      <TableCell>{student.class_name || 'Not Assigned'}</TableCell>
                      <TableCell>
                        {student.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <Label>Trade</Label>
              <Select value={formData.trade_code} onValueChange={(value) => setFormData({ ...formData, trade_code: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOD">Software Development</SelectItem>
                  <SelectItem value="BDC">Building Construction</SelectItem>
                  <SelectItem value="AUT">Automobile Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddStudent}>Add Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudentManagement;

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Download, Edit, Trash2, Eye, Mail, Phone, BookOpen } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';

const AdminTeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    specialization: ''
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTeachers(data.teachers);
      }
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Teacher added successfully');
        setShowAddDialog(false);
        loadTeachers();
      }
    } catch (error) {
      toast.error('Failed to add teacher');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              Teacher Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all teacher records</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold">{teachers.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Teachers List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {teacher.first_name[0]}{teacher.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{teacher.first_name} {teacher.last_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
                    <TableCell>
                      <Badge>{teacher.class_count || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.student_count || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTeacher}>Add Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeacherManagement;

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Users, GraduationCap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';

const AdminClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    trade_level_id: '',
    academic_year_id: '',
    class_name: '',
    capacity: 30,
    teacher_id: ''
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const handleAddClass = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Class created successfully');
        setShowAddDialog(false);
        loadClasses();
      }
    } catch (error) {
      toast.error('Failed to create class');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-green-600" />
              Class Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all classes and enrollments</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold">{classes.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Classes List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.class_name}</TableCell>
                    <TableCell>
                      <Badge>{cls.trade_code}</Badge>
                    </TableCell>
                    <TableCell>Level {cls.level_number}</TableCell>
                    <TableCell>{cls.teacher_name || 'Not Assigned'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cls.enrollment_count || 0}</Badge>
                    </TableCell>
                    <TableCell>{cls.capacity}</TableCell>
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
            <DialogTitle>Add New Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Class Name</Label>
              <Input
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                placeholder="e.g., Class A"
              />
            </div>
            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddClass}>Create Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClassManagement;

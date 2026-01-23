import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';

const AdminAttendanceManagement: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    class_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'present',
    remarks: ''
  });

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAttendance(data.attendance);
      }
    } catch (error) {
      toast.error('Failed to load attendance');
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Attendance marked successfully');
        setShowMarkDialog(false);
        loadAttendance();
      }
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      case 'late':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-600" />
              Attendance Management
            </h1>
            <p className="text-gray-600 mt-1">Track and manage student attendance</p>
          </div>
          <Button onClick={() => setShowMarkDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">
                    {attendance.filter(a => a.status === 'present').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {attendance.filter(a => a.status === 'absent').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {attendance.filter(a => a.status === 'late').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.student_name}</p>
                        <p className="text-sm text-gray-500">{record.student_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{record.subject_name}</TableCell>
                    <TableCell>{record.class_name}</TableCell>
                    <TableCell>{new Date(record.attendance_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(record.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{record.remarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.attendance_date}
                onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Remarks (Optional)</Label>
              <Input
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Add any notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkDialog(false)}>Cancel</Button>
            <Button onClick={handleMarkAttendance}>Mark Attendance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAttendanceManagement;

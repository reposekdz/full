import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Plus, Edit, Trash2, Key, Users, Search, Download, Upload, RefreshCw, Eye, EyeOff } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/student-management/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setClasses(data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.target);
    const studentData = {
      class_id: formData.get('class_id'),
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      parent_phone: formData.get('parent_phone'),
      location: formData.get('location'),
      date_of_birth: formData.get('date_of_birth') || null,
      gender: formData.get('gender') || null,
      default_password: formData.get('default_password') || null
    };

    try {
      const response = await fetch(`${API_BASE}/student-management/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Student added! Serial Code: ${data.student.serial_code} | Password: ${data.student.default_password}` 
        });
        setShowAddForm(false);
        fetchStudents();
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add student' });
    }
    setLoading(false);
  };

  const handleResetPassword = async (studentId) => {
    if (!confirm('Reset password to serial code?')) return;

    try {
      const response = await fetch(`${API_BASE}/student-management/students/${studentId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      if (data.success) {
        alert(`Password reset! New password: ${data.new_password}`);
      }
    } catch (error) {
      alert('Failed to reset password');
    }
  };

  const handleToggleActive = async (studentId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/student-management/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchStudents();
        setMessage({ type: 'success', text: 'Student status updated' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const exportStudents = () => {
    const csv = [
      ['Serial Code', 'Class', 'Course', 'Parent Phone', 'Location', 'Status', 'Date Added'],
      ...filteredStudents.map(s => [
        s.serial_code,
        s.class_name || 'N/A',
        s.course_name || 'N/A',
        s.parent_phone,
        s.address,
        s.is_active ? 'Active' : 'Inactive',
        new Date(s.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.serial_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parent_phone?.includes(searchTerm) ||
                         student.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.class_name === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8" />
                Student Management
              </CardTitle>
              <p className="text-gray-600 mt-2">Add and manage students with auto-generated serial codes</p>
            </div>
            <Badge className="text-lg px-4 py-2">{students.length} Students</Badge>
          </div>
        </CardHeader>

        <CardContent>
          {message.text && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
            <Button variant="outline" onClick={exportStudents} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={fetchStudents} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Add Student Form */}
          {showAddForm && (
            <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="class_id">Select Class *</Label>
                      <select
                        id="class_id"
                        name="class_id"
                        required
                        className="w-full p-2 border rounded mt-1"
                      >
                        <option value="">Choose a class...</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} - {cls.course_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        placeholder="John"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        placeholder="Doe"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="parent_phone">Parent Phone *</Label>
                      <Input
                        id="parent_phone"
                        name="parent_phone"
                        type="tel"
                        placeholder="+250 XXX XXX XXX"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="Kigali, Gasabo"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        className="w-full p-2 border rounded mt-1"
                      >
                        <option value="">Select gender...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="default_password">Default Password (Optional)</Label>
                      <Input
                        id="default_password"
                        name="default_password"
                        type="text"
                        placeholder="Leave empty to use serial code"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Student'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>

                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertDescription className="text-yellow-800 text-sm">
                      <strong>Note:</strong> Serial code will be auto-generated based on trade code, year, class ID, and random number.
                      Format: {'{TRADE_CODE}{YEAR}{CLASS_ID}{RANDOM}'}
                    </AlertDescription>
                  </Alert>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by serial code, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All Classes</option>
              {[...new Set(students.map(s => s.class_name).filter(Boolean))].map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2">
                  <th className="p-3 text-left">Serial Code</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Course</th>
                  <th className="p-3 text-left">Parent Phone</th>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <code className="font-mono font-bold text-blue-600">{student.serial_code}</code>
                    </td>
                    <td className="p-3">{student.class_name || 'N/A'}</td>
                    <td className="p-3">{student.course_name || 'N/A'}</td>
                    <td className="p-3">{student.parent_phone}</td>
                    <td className="p-3">{student.address}</td>
                    <td className="p-3">
                      {student.is_active ? (
                        <Badge className="bg-green-500">
                          <Eye className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500">
                          <EyeOff className="w-3 h-3 mr-1" /> Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(student.id)}
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(student.id, student.is_active)}
                          title="Toggle Status"
                        >
                          {student.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No students found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;

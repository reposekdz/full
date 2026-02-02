import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Search, Filter, Edit2, Trash2, Eye, ArrowRightLeft, CheckCircle2, XCircle, GraduationCap, DollarSign, AlertCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Checkbox } from '@/app/components/ui/checkbox';
import { PowerfulStudentSelector } from '@/app/components/PowerfulStudentSelector';
import apiService from '@/app/services/apiService';

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  is_active: boolean;
  class_name: string;
  trade_name: string;
  level_number: number;
  average_marks: number;
  grade: string;
  rank: number;
  total_fees: number;
  fees_paid: number;
  fees_balance: number;
  discipline_count: number;
  enrollment_status: string;
}

export default function StudentManagementPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    trade_class_id: 0,
    enrollment_status: 'active'
  });
  const [transferData, setTransferData] = useState({
    student_id: 0,
    new_class_id: 0,
    transfer_reason: ''
  });
  const [bulkAction, setBulkAction] = useState({
    action: 'activate',
    target_class_id: 0
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [searchQuery, filterClass, sortBy]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filterClass !== 'all') params.class_id = filterClass;
      if (sortBy) params.sort = sortBy;
      
      const response = await apiService.getStudents(params);
      setStudents(response.students || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await apiService.getClasses();
      setClasses(response.classes || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStudentDetails = async (studentId: number) => {
    try {
      setLoading(true);
      const response = await apiService.getStudentDetails(studentId);
      setStudentDetails(response.student);
      setShowDetails(true);
    } catch (error: any) {
      alert('Failed to fetch student details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    try {
      if (!newStudent.first_name || !newStudent.last_name || !newStudent.email || !newStudent.trade_class_id) {
        alert('Please fill in all required fields');
        return;
      }
      
      await apiService.createStudent(newStudent);
      alert('Student created successfully!');
      setShowCreateDialog(false);
      setNewStudent({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'male',
        address: '',
        guardian_name: '',
        guardian_phone: '',
        trade_class_id: 0,
        enrollment_status: 'active'
      });
      fetchStudents();
    } catch (error: any) {
      alert('Failed to create student: ' + error.message);
    }
  };

  const handleTransferStudent = async () => {
    try {
      if (!transferData.new_class_id || !transferData.transfer_reason) {
        alert('Please fill in all fields');
        return;
      }
      
      await apiService.transferStudent(transferData.student_id, {
        new_class_id: transferData.new_class_id,
        reason: transferData.transfer_reason
      });
      alert('Student transferred successfully!');
      setShowTransferDialog(false);
      setTransferData({
        student_id: 0,
        new_class_id: 0,
        transfer_reason: ''
      });
      fetchStudents();
    } catch (error: any) {
      alert('Failed to transfer student: ' + error.message);
    }
  };

  const handleBulkAction = async () => {
    try {
      if (selectedStudents.length === 0) {
        alert('Please select students first');
        return;
      }

      const actionData: any = {
        student_ids: selectedStudents,
        action: bulkAction.action
      };

      if (bulkAction.action === 'transfer' && bulkAction.target_class_id) {
        actionData.target_class_id = bulkAction.target_class_id;
      }

      await apiService.bulkStudentAction(actionData);
      alert(`Bulk ${bulkAction.action} completed successfully!`);
      setShowBulkDialog(false);
      setSelectedStudents([]);
      fetchStudents();
    } catch (error: any) {
      alert('Failed to perform bulk action: ' + error.message);
    }
  };

  const toggleSelectStudent = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Student Management</h2>
          <p className="text-gray-600 mt-1">Manage students, enrollments, and transfers</p>
        </div>
        <div className="flex gap-2">
          {selectedStudents.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkDialog(true)}
              className="border-blue-500 text-blue-600"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedStudents.length})
            </Button>
          )}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Student</DialogTitle>
                <DialogDescription>Add a new student to the system</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@school.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
                <div>
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Gender *</Label>
                  <Select value={newStudent.gender} onValueChange={(value) => setNewStudent({ ...newStudent, gender: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <Label>Guardian Name</Label>
                  <Input
                    value={newStudent.guardian_name}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian_name: e.target.value })}
                    placeholder="Enter guardian name"
                  />
                </div>
                <div>
                  <Label>Guardian Phone</Label>
                  <Input
                    value={newStudent.guardian_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })}
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
                <div className="col-span-2">
                  <PowerfulStudentSelector
                    value=""
                    onChange={(id, data) => {
                      if (data) {
                        setNewStudent({ 
                          ...newStudent, 
                          trade_class_id: parseInt(id) 
                        });
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateStudent}>Create Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students by name, email, or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="date">Date Enrolled</SelectItem>
                <SelectItem value="fees">Fees Balance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {students.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                checked={selectedStudents.length === students.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All ({students.length} students)</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleSelectStudent(student.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{student.student_id} • {student.email}</p>
                        </div>
                        <Badge variant={student.is_active ? "default" : "secondary"}>
                          {student.enrollment_status || (student.is_active ? 'Active' : 'Inactive')}
                        </Badge>
                        {student.discipline_count > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {student.discipline_count} Issues
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-5 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-600">Class</p>
                          <p className="font-semibold text-sm">
                            {student.trade_name} L{student.level_number}
                          </p>
                          <p className="text-xs text-gray-500">{student.class_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Performance</p>
                            <p className="font-semibold">{student.average_marks ? student.average_marks.toFixed(1) : 'N/A'}%</p>
                            <p className="text-xs text-gray-500">Grade: {student.grade || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Class Rank</p>
                          <p className="font-semibold">#{student.rank || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Fees Status</p>
                            <p className="font-semibold">{student.fees_paid || 0} RWF</p>
                            <p className="text-xs text-red-500">Balance: {student.fees_balance || 0} RWF</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Total Fees</p>
                            <p className="font-semibold">{student.total_fees || 0} RWF</p>
                            <p className="text-xs text-gray-500">
                              {student.total_fees && student.fees_paid
                                ? `${((student.fees_paid / student.total_fees) * 100).toFixed(0)}% Paid`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchStudentDetails(student.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTransferData({ ...transferData, student_id: student.id });
                          setShowTransferDialog(true);
                        }}
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {students.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No students found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {studentDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-600">Student ID</Label>
                  <p className="font-semibold">{studentDetails.student_id}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Full Name</Label>
                  <p className="font-semibold">{studentDetails.first_name} {studentDetails.last_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-semibold">{studentDetails.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Gender</Label>
                  <p className="font-semibold capitalize">{studentDetails.gender}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Date of Birth</Label>
                  <p className="font-semibold">{new Date(studentDetails.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-semibold">{studentDetails.phone || 'N/A'}</p>
                </div>
              </div>

              {studentDetails.subjects && studentDetails.subjects.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Subject Performance</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {studentDetails.subjects.map((subject: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <p className="font-semibold">{subject.subject_name}</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className="font-semibold">{subject.percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Grade:</span>
                          <Badge>{subject.grade}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {studentDetails.discipline_records && studentDetails.discipline_records.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Recent Discipline Records</h3>
                  <div className="space-y-2">
                    {studentDetails.discipline_records.map((record: any, index: number) => (
                      <div key={index} className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
                        <p className="font-semibold">{record.incident_type}</p>
                        <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(record.incident_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {studentDetails.attendance && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Attendance Summary</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="border rounded-lg p-3">
                      <p className="text-sm text-gray-600">Total Days</p>
                      <p className="text-2xl font-bold">{studentDetails.attendance.total_days || 0}</p>
                    </div>
                    <div className="border rounded-lg p-3 bg-green-50">
                      <p className="text-sm text-gray-600">Present</p>
                      <p className="text-2xl font-bold text-green-600">{studentDetails.attendance.present || 0}</p>
                    </div>
                    <div className="border rounded-lg p-3 bg-red-50">
                      <p className="text-sm text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-red-600">{studentDetails.attendance.absent || 0}</p>
                    </div>
                    <div className="border rounded-lg p-3 bg-yellow-50">
                      <p className="text-sm text-gray-600">Late</p>
                      <p className="text-2xl font-bold text-yellow-600">{studentDetails.attendance.late || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Student Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Student</DialogTitle>
            <DialogDescription>Move student to a different class</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Class *</Label>
              <Select
                value={transferData.new_class_id.toString()}
                onValueChange={(value) => setTransferData({ ...transferData, new_class_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transfer Reason *</Label>
              <Input
                value={transferData.transfer_reason}
                onChange={(e) => setTransferData({ ...transferData, transfer_reason: e.target.value })}
                placeholder="Reason for transfer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Cancel</Button>
            <Button onClick={handleTransferStudent}>Transfer Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform action on {selectedStudents.length} selected student(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Action *</Label>
              <Select
                value={bulkAction.action}
                onValueChange={(value) => setBulkAction({ ...bulkAction, action: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Students</SelectItem>
                  <SelectItem value="deactivate">Deactivate Students</SelectItem>
                  <SelectItem value="transfer">Transfer to Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkAction.action === 'transfer' && (
              <div>
                <Label>Target Class *</Label>
                <Select
                  value={bulkAction.target_class_id.toString()}
                  onValueChange={(value) => setBulkAction({ ...bulkAction, target_class_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkAction}>Execute Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

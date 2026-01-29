import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Search, Filter, Edit2, Trash2, UserPlus, BookOpen, Award, TrendingUp, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import apiService from '@/app/services/apiService';

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  is_active: boolean;
  subjects_taught: number;
  classes_taught: number;
  total_periods: number;
  subject_names: string;
  avg_student_performance: number;
}

interface Assignment {
  id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  trade_class_id: number;
  class_name: string;
  trade_name: string;
  level_number: number;
  weekly_periods: number;
}

export default function TeacherManagementPanel() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newTeacher, setNewTeacher] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: 'Teacher@123',
    date_of_birth: '',
    gender: 'male',
    address: '',
    qualification: '',
    specialization: '',
    experience_years: 0,
    salary: 0
  });
  const [newAssignment, setNewAssignment] = useState({
    teacher_id: 0,
    subject_id: 0,
    trade_class_id: 0,
    weekly_periods: 0
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchTeachers();
    fetchClassesAndSubjects();
  }, [searchQuery, filterStatus, sortBy]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (sortBy) params.sort = sortBy;
      
      const response = await apiService.getTeachers(params);
      setTeachers(response.teachers || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSubjects = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        apiService.getClasses(),
        apiService.getSubjects()
      ]);
      setClasses(classesRes.classes || []);
      setSubjects(subjectsRes.subjects || []);
    } catch (error) {
      console.error('Failed to fetch classes and subjects:', error);
    }
  };

  const fetchTeacherDetails = async (teacher: Teacher) => {
    try {
      setLoading(true);
      const response = await apiService.getTeacherDetails(teacher.id);
      setTeacherDetails(response.teacher);
      setAssignments(response.assignments || []);
      setSelectedTeacher(teacher);
      setShowDetails(true);
    } catch (error: any) {
      alert('Failed to fetch teacher details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async () => {
    try {
      if (!newTeacher.first_name || !newTeacher.last_name || !newTeacher.email) {
        alert('Please fill in all required fields');
        return;
      }
      
      await apiService.createTeacher(newTeacher);
      alert('Teacher created successfully!');
      setShowCreateDialog(false);
      setNewTeacher({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: 'Teacher@123',
        date_of_birth: '',
        gender: 'male',
        address: '',
        qualification: '',
        specialization: '',
        experience_years: 0,
        salary: 0
      });
      fetchTeachers();
    } catch (error: any) {
      alert('Failed to create teacher: ' + error.message);
    }
  };

  const handleAssignTeacher = async () => {
    try {
      if (!newAssignment.subject_id || !newAssignment.trade_class_id || !newAssignment.weekly_periods) {
        alert('Please fill in all fields');
        return;
      }
      
      await apiService.assignTeacherToSubject(newAssignment);
      alert('Teacher assigned successfully!');
      setShowAssignDialog(false);
      setNewAssignment({
        teacher_id: 0,
        subject_id: 0,
        trade_class_id: 0,
        weekly_periods: 0
      });
      fetchTeachers();
    } catch (error: any) {
      alert('Failed to assign teacher: ' + error.message);
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (!confirm('Are you sure you want to deactivate this teacher? This will remove all their assignments.')) {
      return;
    }
    
    try {
      await apiService.deleteTeacher(teacherId);
      alert('Teacher deactivated successfully');
      fetchTeachers();
    } catch (error: any) {
      alert('Failed to deactivate teacher: ' + error.message);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to remove this assignment?')) {
      return;
    }
    
    try {
      await apiService.removeTeacherAssignment(assignmentId);
      alert('Assignment removed successfully');
      if (selectedTeacher) {
        fetchTeacherDetails(selectedTeacher);
      }
    } catch (error: any) {
      alert('Failed to remove assignment: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Teacher Management</h2>
          <p className="text-gray-600 mt-1">Manage teachers, assignments, and workload</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Teacher</DialogTitle>
              <DialogDescription>Add a new teacher to the system</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={newTeacher.first_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={newTeacher.last_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  placeholder="teacher@school.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={newTeacher.date_of_birth}
                  onChange={(e) => setNewTeacher({ ...newTeacher, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={newTeacher.gender} onValueChange={(value) => setNewTeacher({ ...newTeacher, gender: value })}>
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
                  value={newTeacher.address}
                  onChange={(e) => setNewTeacher({ ...newTeacher, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label>Qualification</Label>
                <Input
                  value={newTeacher.qualification}
                  onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
                  placeholder="e.g. Bachelor's in Education"
                />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input
                  value={newTeacher.specialization}
                  onChange={(e) => setNewTeacher({ ...newTeacher, specialization: e.target.value })}
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <Label>Experience (Years)</Label>
                <Input
                  type="number"
                  value={newTeacher.experience_years}
                  onChange={(e) => setNewTeacher({ ...newTeacher, experience_years: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Salary (RWF)</Label>
                <Input
                  type="number"
                  value={newTeacher.salary}
                  onChange={(e) => setNewTeacher({ ...newTeacher, salary: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateTeacher}>Create Teacher</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search teachers by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="workload">Workload</SelectItem>
                <SelectItem value="date">Date Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {teachers.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                          {teacher.first_name[0]}{teacher.last_name[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {teacher.first_name} {teacher.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{teacher.email}</p>
                        </div>
                        <Badge variant={teacher.is_active ? "default" : "secondary"}>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Subjects</p>
                            <p className="font-semibold">{teacher.subjects_taught || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Classes</p>
                            <p className="font-semibold">{teacher.classes_taught || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Weekly Periods</p>
                            <p className="font-semibold">{teacher.total_periods || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-600">Avg Performance</p>
                            <p className="font-semibold">{teacher.avg_student_performance ? teacher.avg_student_performance.toFixed(1) : 'N/A'}%</p>
                          </div>
                        </div>
                      </div>
                      {teacher.subject_names && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Subjects:</span> {teacher.subject_names}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchTeacherDetails(teacher)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewAssignment({ ...newAssignment, teacher_id: teacher.id });
                          setShowAssignDialog(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {teachers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No teachers found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
          </DialogHeader>
          {teacherDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Full Name</Label>
                  <p className="font-semibold">{teacherDetails.first_name} {teacherDetails.last_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-semibold">{teacherDetails.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-semibold">{teacherDetails.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Gender</Label>
                  <p className="font-semibold capitalize">{teacherDetails.gender}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Subject Assignments ({assignments.length})</h3>
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{assignment.subject_name} ({assignment.subject_code})</p>
                        <p className="text-sm text-gray-600">
                          {assignment.trade_name} Level {assignment.level_number} - {assignment.class_name}
                        </p>
                        <p className="text-xs text-gray-500">{assignment.weekly_periods} periods/week</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {assignments.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No assignments found</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Teacher Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Teacher to Subject</DialogTitle>
            <DialogDescription>Assign the teacher to a subject and class</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Subject *</Label>
              <Select
                value={newAssignment.subject_id.toString()}
                onValueChange={(value) => setNewAssignment({ ...newAssignment, subject_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class *</Label>
              <Select
                value={newAssignment.trade_class_id.toString()}
                onValueChange={(value) => setNewAssignment({ ...newAssignment, trade_class_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
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
              <Label>Weekly Periods *</Label>
              <Input
                type="number"
                value={newAssignment.weekly_periods}
                onChange={(e) => setNewAssignment({ ...newAssignment, weekly_periods: parseInt(e.target.value) || 0 })}
                placeholder="Enter number of periods per week"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignTeacher}>Assign Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

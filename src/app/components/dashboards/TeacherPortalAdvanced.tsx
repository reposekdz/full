import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  Calendar,
  Award,
  FileText,
  Plus,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import apiService from '../../services/apiService';

export default function TeacherPortalAdvanced() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showGrade, setShowGrade] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);

  const [attendanceData, setAttendanceData] = useState<any>({});
  const [gradeForm, setGradeForm] = useState({
    student_id: '',
    subject: '',
    marks: '',
    exam_type: '',
    term: ''
  });
  const [assignmentForm, setAssignmentForm] = useState({
    class_id: '',
    title: '',
    description: '',
    due_date: '',
    max_marks: '',
    instructions: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassDetails(selectedClass.id);
    }
  }, [selectedClass]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardData, classesData] = await Promise.all([
        apiService.getTeacherDashboard(),
        apiService.getTeacherClasses({})
      ]);

      if (dashboardData.success) setDashboard(dashboardData.dashboard);
      if (classesData.success) {
        setClasses(classesData.classes || []);
        if (classesData.classes && classesData.classes.length > 0) {
          setSelectedClass(classesData.classes[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId: number) => {
    try {
      const [studentsData, assignmentsData] = await Promise.all([
        apiService.getClassStudents(classId),
        apiService.getStudentAssignments({ classId })
      ]);

      if (studentsData.success) setClassStudents(studentsData.students || []);
      if (assignmentsData.success) setAssignments(assignmentsData.assignments || []);
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: studentId,
        status: status,
        class_id: selectedClass.id,
        attendance_date: new Date().toISOString().split('T')[0]
      }));

      const result = await apiService.bulkMarkAttendance({ attendance: attendanceRecords });
      
      if (result.success) {
        setShowAttendance(false);
        setAttendanceData({});
        alert('Attendance marked successfully!');
      }
    } catch (error: any) {
      alert('Failed to mark attendance: ' + error.message);
    }
  };

  const handleRecordGrade = async () => {
    try {
      const result = await apiService.recordGrades({
        ...gradeForm,
        marks: parseFloat(gradeForm.marks)
      });

      if (result.success) {
        setShowGrade(false);
        setGradeForm({
          student_id: '',
          subject: '',
          marks: '',
          exam_type: '',
          term: ''
        });
        alert('Grade recorded successfully!');
      }
    } catch (error: any) {
      alert('Failed to record grade: ' + error.message);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const result = await apiService.createAssignment({
        ...assignmentForm,
        max_marks: parseFloat(assignmentForm.max_marks)
      });

      if (result.success) {
        setShowAssignment(false);
        setAssignmentForm({
          class_id: '',
          title: '',
          description: '',
          due_date: '',
          max_marks: '',
          instructions: ''
        });
        fetchClassDetails(selectedClass.id);
      }
    } catch (error: any) {
      alert('Failed to create assignment: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Portal</h1>
          <p className="text-gray-600">Manage your classes and students</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAttendance(true)}>
            <UserCheck className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
          <Button onClick={() => setShowGrade(true)} variant="secondary">
            <Award className="w-4 h-4 mr-2" />
            Record Grade
          </Button>
          <Button onClick={() => setShowAssignment(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="w-4 h-4" />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classes.length}</div>
            <p className="text-xs opacity-90">Active classes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboard?.classes?.reduce((sum: number, c: any) => sum + (c.student_count || 0), 0) || 0}
            </div>
            <p className="text-xs opacity-90">Across all classes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ClipboardList className="w-4 h-4" />
              Pending Grading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.pendingGrading || 0}</div>
            <p className="text-xs opacity-90">Submissions to grade</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboard?.attendanceStats?.attendance_rate || 0}%
            </div>
            <p className="text-xs opacity-90">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem: any) => (
              <Card 
                key={classItem.id} 
                className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedClass?.id === classItem.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedClass(classItem)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{classItem.class_name}</CardTitle>
                  <p className="text-sm text-gray-600">{classItem.class_code}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Students:</span>
                      <Badge>{classItem.student_count || 0}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Academic Year:</span>
                      <span className="font-medium">{classItem.academic_year}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Term:</span>
                      <span className="font-medium">{classItem.term}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedClass ? `${selectedClass.class_name} - Students` : 'Select a class'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Student ID</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Trade</th>
                        <th className="text-left p-2">Level</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student: any) => (
                        <tr key={student.student_id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono text-sm">{student.student_id}</td>
                          <td className="p-2">{student.first_name} {student.last_name}</td>
                          <td className="p-2">{student.trade_name}</td>
                          <td className="p-2">Level {student.level_number}</td>
                          <td className="p-2">
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                              {student.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No students found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.map((assignment: any) => (
                  <div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-lg">{assignment.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{assignment.description}</div>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          <span>Max Marks: {assignment.max_marks}</span>
                        </div>
                      </div>
                      <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.todaySchedule?.map((schedule: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">{schedule.subject_name}</div>
                      <div className="text-sm text-gray-600">{schedule.class_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {schedule.start_time} - {schedule.end_time}
                      </div>
                      <div className="text-xs text-gray-500">{schedule.room}</div>
                    </div>
                  </div>
                )) || <p className="text-center text-gray-500">No classes scheduled for today</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAttendance} onOpenChange={setShowAttendance}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mark Attendance - {selectedClass?.class_name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {classStudents.map((student: any) => (
              <div key={student.student_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{student.first_name} {student.last_name}</div>
                  <div className="text-sm text-gray-600">{student.student_id}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={attendanceData[student.student_id] === 'present' ? 'default' : 'outline'}
                    onClick={() => setAttendanceData({...attendanceData, [student.student_id]: 'present'})}
                  >
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant={attendanceData[student.student_id] === 'absent' ? 'destructive' : 'outline'}
                    onClick={() => setAttendanceData({...attendanceData, [student.student_id]: 'absent'})}
                  >
                    Absent
                  </Button>
                  <Button
                    size="sm"
                    variant={attendanceData[student.student_id] === 'late' ? 'secondary' : 'outline'}
                    onClick={() => setAttendanceData({...attendanceData, [student.student_id]: 'late'})}
                  >
                    Late
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttendance(false)}>Cancel</Button>
            <Button onClick={handleMarkAttendance}>Submit Attendance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGrade} onOpenChange={setShowGrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Grade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select 
                value={gradeForm.student_id}
                onValueChange={(value) => setGradeForm({...gradeForm, student_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {classStudents.map(student => (
                    <SelectItem key={student.student_id} value={student.student_id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input 
                value={gradeForm.subject}
                onChange={(e) => setGradeForm({...gradeForm, subject: e.target.value})}
              />
            </div>
            <div>
              <Label>Marks</Label>
              <Input 
                type="number"
                value={gradeForm.marks}
                onChange={(e) => setGradeForm({...gradeForm, marks: e.target.value})}
              />
            </div>
            <div>
              <Label>Exam Type</Label>
              <Select 
                value={gradeForm.exam_type}
                onValueChange={(value) => setGradeForm({...gradeForm, exam_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrade(false)}>Cancel</Button>
            <Button onClick={handleRecordGrade}>Record Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignment} onOpenChange={setShowAssignment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Class</Label>
              <Select 
                value={assignmentForm.class_id}
                onValueChange={(value) => setAssignmentForm({...assignmentForm, class_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(classItem => (
                    <SelectItem key={classItem.id} value={classItem.id.toString()}>
                      {classItem.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input 
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input 
                  type="date"
                  value={assignmentForm.due_date}
                  onChange={(e) => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
                />
              </div>
              <div>
                <Label>Max Marks</Label>
                <Input 
                  type="number"
                  value={assignmentForm.max_marks}
                  onChange={(e) => setAssignmentForm({...assignmentForm, max_marks: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea 
                value={assignmentForm.instructions}
                onChange={(e) => setAssignmentForm({...assignmentForm, instructions: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignment(false)}>Cancel</Button>
            <Button onClick={handleCreateAssignment}>Create Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

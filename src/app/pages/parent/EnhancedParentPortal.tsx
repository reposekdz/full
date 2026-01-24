import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, TrendingUp, MessageSquare, Bell, DollarSign, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const EnhancedParentPortal = () => {
  const [studentData, setStudentData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [fees, setFees] = useState(null);

  useEffect(() => {
    fetchStudentData();
    fetchNotifications();
    fetchAttendance();
    fetchGrades();
    fetchAssignments();
    fetchFees();
    
    // Setup WebSocket for real-time updates
    setupWebSocket();
  }, []);

  const fetchStudentData = async () => {
    try {
      const studentId = localStorage.getItem('linked_student_id');
      const response = await fetch(`http://localhost:5000/api/students/${studentId}`);
      const data = await response.json();
      if (data.success) setStudentData(data.student);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch(`http://localhost:5000/api/realtime-notifications/${userId}?limit=10`);
      const data = await response.json();
      if (data.success) setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const studentId = localStorage.getItem('linked_student_id');
      const response = await fetch(`http://localhost:5000/api/attendance/student/${studentId}?limit=30`);
      const data = await response.json();
      if (data.success) setAttendance(data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const studentId = localStorage.getItem('linked_student_id');
      const response = await fetch(`http://localhost:5000/api/grades/student/${studentId}`);
      const data = await response.json();
      if (data.success) setGrades(data.grades);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const studentId = localStorage.getItem('linked_student_id');
      const response = await fetch(`http://localhost:5000/api/assignments/student/${studentId}`);
      const data = await response.json();
      if (data.success) setAssignments(data.assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchFees = async () => {
    try {
      const studentId = localStorage.getItem('linked_student_id');
      const response = await fetch(`http://localhost:5000/api/finance/student/${studentId}/fees`);
      const data = await response.json();
      if (data.success) setFees(data.fees);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const setupWebSocket = () => {
    // WebSocket connection for real-time updates
    const userId = localStorage.getItem('user_id');
    if (window.io) {
      const socket = window.io('http://localhost:5000');
      socket.emit('join', `user_${userId}`);
      
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });
    }
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return ((present / attendance.length) * 100).toFixed(1);
  };

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + parseFloat(g.score), 0);
    return (sum / grades.length).toFixed(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Parent Portal</h1>
          {studentData && (
            <p className="text-gray-600">Monitoring: {studentData.first_name} {studentData.last_name}</p>
          )}
        </div>
        <Button>
          <MessageSquare className="w-4 h-4 mr-2" /> Contact Teacher
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{calculateAverageGrade()}</div>
                <div className="text-sm text-gray-600">Average Grade</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{calculateAttendanceRate()}%</div>
                <div className="text-sm text-gray-600">Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{assignments.filter(a => a.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Pending Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{fees?.balance || 0}</div>
                <div className="text-sm text-gray-600">Fee Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 5).map(notif => (
                <div key={notif.id} className="p-3 bg-gray-50 rounded-lg flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notif.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{notif.title}</div>
                    <div className="text-sm text-gray-600">{notif.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="grades">
        <TabsList>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {grades.map(grade => (
                  <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{grade.subject_name}</div>
                      <div className="text-sm text-gray-600">{grade.exam_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{grade.score}%</div>
                      <Badge variant={grade.score >= 70 ? 'default' : grade.score >= 50 ? 'secondary' : 'destructive'}>
                        {grade.score >= 70 ? 'Excellent' : grade.score >= 50 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {attendance.slice(0, 30).map(record => (
                  <div
                    key={record.id}
                    className={`p-3 rounded-lg text-center ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <div className="text-xs">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className="text-lg font-bold">{record.status[0].toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignments & Homework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{assignment.title}</div>
                        <div className="text-sm text-gray-600">{assignment.subject_name}</div>
                      </div>
                      <Badge variant={assignment.status === 'submitted' ? 'default' : 'secondary'}>
                        {assignment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                    {assignment.score && (
                      <div className="mt-2 flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">Score: {assignment.score}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fee Information</CardTitle>
            </CardHeader>
            <CardContent>
              {fees && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Fees</div>
                      <div className="text-2xl font-bold">${fees.total}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">Paid</div>
                      <div className="text-2xl font-bold">${fees.paid}</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-sm text-gray-600">Balance</div>
                      <div className="text-2xl font-bold">${fees.balance}</div>
                    </div>
                  </div>
                  <Button className="w-full">Make Payment</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedParentPortal;

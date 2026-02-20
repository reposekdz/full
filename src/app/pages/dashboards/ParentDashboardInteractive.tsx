import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, AlertCircle, Calendar, BookOpen, DollarSign,
  Bell, MessageSquare, FileText, Clock, CheckCircle, XCircle,
  Award, Target, Activity, Phone, Mail, Download, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

const API_BASE = 'http://localhost:5000/api';

const ParentDashboardInteractive = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [conductRecords, setConductRecords] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [fees, setFees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState({});

  const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchChildren();
    fetchDashboardSummary();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild.student_id);
    }
  }, [selectedChild, activeTab]);

  const fetchChildren = async () => {
    try {
      const response = await fetch(`${API_BASE}/parent-portal-interactive/my-children`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setChildren(data.children);
        if (data.children.length > 0) {
          setSelectedChild(data.children[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/parent-portal-interactive/dashboard-summary`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/parent-portal-interactive/notifications`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchChildData = async (studentId) => {
    switch (activeTab) {
      case 'conduct':
        fetchConduct(studentId);
        break;
      case 'attendance':
        fetchAttendance(studentId);
        break;
      case 'grades':
        fetchGrades(studentId);
        break;
      case 'fees':
        fetchFees(studentId);
        break;
      case 'assignments':
        fetchAssignments(studentId);
        break;
    }
  };

  const fetchConduct = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE}/parent-portal-interactive/conduct/${studentId}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setConductRecords(data.records);
      }
    } catch (error) {
      console.error('Error fetching conduct:', error);
    }
  };

  const fetchAttendance = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE}/parent-portal-interactive/attendance/${studentId}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAttendance(data.records);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchGrades = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE}/parent-portal-interactive/grades/${studentId}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setGrades(data.grades);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchFees = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE}/parent-portal-interactive/fees/${studentId}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setFees(data);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const fetchAssignments = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE}/parent-portal-interactive/assignments/${studentId}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      minor: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      major: 'bg-red-100 text-red-800',
      severe: 'bg-purple-100 text-purple-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getAttendanceColor = (status) => {
    const colors = {
      present: 'text-green-600',
      absent: 'text-red-600',
      late: 'text-orange-600',
      excused: 'text-blue-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Parent Portal</h1>
          <p className="text-gray-600">Monitor your child's progress and activities</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Children</p>
                  <p className="text-3xl font-bold">{summary.total_children || 0}</p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Notifications</p>
                  <p className="text-3xl font-bold">{summary.unread_notifications || 0}</p>
                </div>
                <Bell className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Recent Incidents</p>
                  <p className="text-3xl font-bold">{summary.recent_incidents || 0}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Pending Requests</p>
                  <p className="text-3xl font-bold">{summary.pending_leave_requests || 0}</p>
                </div>
                <Clock className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Children Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Child</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {children.map((child) => (
                <motion.div
                  key={child.student_id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedChild(child)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedChild?.student_id === child.student_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                      {child.first_name[0]}{child.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{child.first_name} {child.last_name}</h3>
                      <p className="text-sm text-gray-600">{child.trade_name} - Level {child.level_number}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Conduct: {child.conduct_score || 100}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Attendance: {child.avg_attendance || 0}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        {selectedChild && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="conduct">Conduct</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Conduct Score</span>
                        <span className="font-bold text-lg">{selectedChild.conduct_score || 100}/100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Attendance Rate</span>
                        <span className="font-bold text-lg">{selectedChild.avg_attendance || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Incidents</span>
                        <span className="font-bold text-lg">{selectedChild.active_incidents || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Fee Balance</span>
                        <span className="font-bold text-lg">
                          {((selectedChild.total_fees || 0) - (selectedChild.total_paid || 0)).toLocaleString()} RWF
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {notifications.slice(0, 5).map((notif) => (
                        <div key={notif.notification_id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-gray-600">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="conduct" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conduct Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conductRecords.map((record) => (
                      <div key={record.record_id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold">{record.incident_type}</h4>
                            <p className="text-sm text-gray-600">{record.description}</p>
                          </div>
                          <Badge className={getSeverityColor(record.severity)}>
                            {record.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Recorded by: {record.recorded_by_name}</span>
                          <span>{new Date(record.incident_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attendance.map((record) => (
                      <div key={record.attendance_id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{record.course_name}</p>
                          <p className="text-sm text-gray-600">{record.teacher_name}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getAttendanceColor(record.status)}`}>
                            {record.status.toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {grades.map((grade) => (
                      <div key={grade.grade_id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{grade.course_name}</p>
                          <p className="text-sm text-gray-600">{grade.teacher_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{grade.marks}%</p>
                          <p className="text-sm text-gray-600">{grade.grade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Fees</p>
                        <p className="text-xl font-bold">{(fees.summary?.total_fees || 0).toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Paid</p>
                        <p className="text-xl font-bold text-green-600">{(fees.summary?.total_paid || 0).toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Balance</p>
                        <p className="text-xl font-bold text-red-600">{(fees.summary?.balance || 0).toLocaleString()} RWF</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Make Payment
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <div key={assignment.assignment_id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold">{assignment.title}</h4>
                            <p className="text-sm text-gray-600">{assignment.course_name}</p>
                          </div>
                          <Badge variant={assignment.submission_status === 'submitted' ? 'default' : 'destructive'}>
                            {assignment.submission_status || 'Not Submitted'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          {assignment.marks_obtained && (
                            <span className="font-bold">Score: {assignment.marks_obtained}/{assignment.total_marks}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ParentDashboardInteractive;

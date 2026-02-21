import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, XCircle, Heart, Calendar, BookOpen, DollarSign, MessageSquare, FileText, TrendingUp, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const ParentDashboardInteractive = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState({ conduct: [], leaves: [], health: [], attendance: [] });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    unread_notifications: 0,
    conduct_incidents: 0,
    pending_leaves: 0,
    health_alerts: 0
  });

  useEffect(() => {
    loadChildren();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadStudentEvents(selectedChild.id);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/parent-child-linking-advanced/parent-details/${JSON.parse(localStorage.getItem('user')).id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.children) {
        setChildren(response.data.children);
        if (response.data.children.length > 0) {
          setSelectedChild(response.data.children[0]);
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
      toast.error('Failed to load children');
    }
  };

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/student-events/parent/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setStats(prev => ({
          ...prev,
          unread_notifications: response.data.notifications.filter(n => !n.read_at).length
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadStudentEvents = async (studentId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/student-events/parent/student-events/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEvents(response.data.events);
        setStats(prev => ({
          ...prev,
          conduct_incidents: response.data.events.conduct.length,
          pending_leaves: response.data.events.leaves.filter(l => l.status === 'pending').length,
          health_alerts: response.data.events.health.length
        }));
      }
    } catch (error) {
      console.error('Error loading student events:', error);
      toast.error('Failed to load student events');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      conduct_removal: <AlertCircle className="w-5 h-5 text-red-500" />,
      leave_approval: <CheckCircle className="w-5 h-5 text-green-500" />,
      sick: <Heart className="w-5 h-5 text-orange-500" />,
      absent: <XCircle className="w-5 h-5 text-yellow-500" />,
      grade_update: <Award className="w-5 h-5 text-blue-500" />,
      fee_reminder: <DollarSign className="w-5 h-5 text-purple-500" />
    };
    return icons[eventType] || <Bell className="w-5 h-5 text-gray-500" />;
  };

  const getConductGrade = (score) => {
    if (score >= 36) return { grade: 'A', color: 'bg-green-500' };
    if (score >= 32) return { grade: 'B', color: 'bg-blue-500' };
    if (score >= 28) return { grade: 'C', color: 'bg-yellow-500' };
    if (score >= 24) return { grade: 'D', color: 'bg-orange-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Parent Dashboard
        </h1>
        <p className="text-gray-600">Monitor your child's progress in real-time</p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
          {children.map((child) => (
            <Card
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`cursor-pointer transition-all min-w-[250px] ${
                selectedChild?.id === child.id
                  ? 'border-2 border-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {child.first_name[0]}{child.last_name[0]}
                  </div>
                  <div>
                    <p className="font-bold">{child.first_name} {child.last_name}</p>
                    <p className="text-sm text-gray-600">{child.student_code}</p>
                    <p className="text-xs text-gray-500">{child.trade_code} - Level {child.level_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Conduct Incidents</p>
                <p className="text-3xl font-bold">{stats.conduct_incidents}</p>
              </div>
              <AlertCircle className="w-12 h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending Leaves</p>
                <p className="text-3xl font-bold">{stats.pending_leaves}</p>
              </div>
              <Calendar className="w-12 h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Health Alerts</p>
                <p className="text-3xl font-bold">{stats.health_alerts}</p>
              </div>
              <Heart className="w-12 h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Notifications</p>
                <p className="text-3xl font-bold">{stats.unread_notifications}</p>
              </div>
              <Bell className="w-12 h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="conduct">Conduct</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                All Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No notifications yet</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        {getEventIcon(notif.event_type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={notif.event_type === 'conduct_removal' ? 'bg-red-500' : 'bg-blue-500'}>
                              {notif.event_type?.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(notif.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-line">{notif.message}</p>
                          {notif.student_first_name && (
                            <p className="text-xs text-gray-600 mt-2">
                              Student: {notif.student_first_name} {notif.student_last_name} ({notif.student_code})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conduct Tab */}
        <TabsContent value="conduct">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Conduct Records (40-Point System)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChild && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Conduct Score</p>
                      <p className="text-4xl font-bold">{selectedChild.conduct_score || 40}/40</p>
                    </div>
                    <div className={`w-20 h-20 rounded-full ${getConductGrade(selectedChild.conduct_score || 40).color} flex items-center justify-center text-white text-3xl font-bold`}>
                      {getConductGrade(selectedChild.conduct_score || 40).grade}
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {events.conduct.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No conduct incidents</p>
                ) : (
                  events.conduct.map((record) => (
                    <div key={record.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-red-500">{record.severity?.toUpperCase()}</Badge>
                        <span className="text-xs text-gray-600">
                          {new Date(record.recorded_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-semibold text-red-900">{record.incident_type}</p>
                      <p className="text-sm text-gray-700 mt-1">{record.description}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                        <span>Points deducted: -{record.points_deducted}</span>
                        <span>Recorded by: {record.recorded_by_name}</span>
                      </div>
                      <div className="mt-2 text-sm font-semibold">
                        Score after: {record.current_score}/40
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaves Tab */}
        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.leaves.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No leave requests</p>
                ) : (
                  events.leaves.map((leave) => (
                    <div key={leave.id} className={`p-4 border-l-4 rounded ${
                      leave.status === 'approved' ? 'border-green-500 bg-green-50' :
                      leave.status === 'rejected' ? 'border-red-500 bg-red-50' :
                      'border-yellow-500 bg-yellow-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={
                          leave.status === 'approved' ? 'bg-green-500' :
                          leave.status === 'rejected' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }>
                          {leave.status?.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {new Date(leave.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-semibold">{leave.reason}</p>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>From: {new Date(leave.start_date).toLocaleDateString()}</p>
                        <p>To: {new Date(leave.end_date).toLocaleDateString()}</p>
                      </div>
                      {leave.approved_by_name && (
                        <p className="mt-2 text-xs text-gray-600">
                          {leave.status === 'approved' ? 'Approved' : 'Rejected'} by: {leave.approved_by_name}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Health Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.health.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No health records</p>
                ) : (
                  events.health.map((record) => (
                    <div key={record.id} className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-orange-500">{record.severity?.toUpperCase()}</Badge>
                        <span className="text-xs text-gray-600">
                          {new Date(record.recorded_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-semibold text-orange-900">{record.incident_type}</p>
                      <p className="text-sm text-gray-700 mt-1">{record.description}</p>
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Action taken:</strong> {record.action_taken}
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        Recorded by: {record.recorded_by_name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.attendance.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No absence records</p>
                ) : (
                  events.attendance.map((record) => (
                    <div key={record.id} className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-yellow-500">ABSENT</Badge>
                        <span className="text-xs text-gray-600">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{record.reason || 'No reason provided'}</p>
                      <p className="mt-2 text-xs text-gray-600">
                        Recorded by: {record.recorded_by_name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentDashboardInteractive;

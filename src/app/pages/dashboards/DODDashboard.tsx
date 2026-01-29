import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, TrendingDown, Users, BarChart3, Plus, Search, Filter, Shield, 
  FileText, Calendar, XCircle, Mail, Plane, UserCircle, Clock, CheckCircle, 
  Bell, Send, Trash2, Eye, Edit, MessageSquare, UserX, Ban, Home, Activity,
  TrendingUp, Award, AlertCircleIcon, Loader2, Download, MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import apiService from '@/app/services/apiService';

interface DODDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function DODDashboard({ onNavigate, onLogout }: DODDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [disciplineRecords, setDisciplineRecords] = useState<any[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [showConductModal, setShowConductModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newConduct, setNewConduct] = useState({
    student_id: '',
    conduct_type: 'warning',
    severity: 'medium',
    description: '',
    action_taken: '',
    lesson_missed: ''
  });

  const [newLeave, setNewLeave] = useState({
    student_id: '',
    leave_type: 'sick',
    reason: '',
    lesson_missed: '',
    start_time: '',
    end_time: ''
  });

  const [newIncident, setNewIncident] = useState({
    student_id: '',
    case_type: '',
    description: '',
    severity: 'medium',
    reported_by: ''
  });

  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        overviewData, 
        studentsData, 
        statsData, 
        recordsData, 
        leavesData,
        activitiesData,
        notificationsData
      ] = await Promise.all([
        apiService.getDODStats(),
        apiService.getDisciplineStudents(),
        apiService.getDisciplineAnalytics(),
        apiService.getDisciplineRecords(),
        apiService.getDisciplineLeaves({ status: 'ongoing' }),
        apiService.getDODRecentActivities(),
        apiService.getDODNotifications({ is_read: 'false' })
      ]);
      
      setOverview(overviewData.stats || {});
      setStudents(studentsData.students || []);
      setStatistics(statsData.analytics || {});
      setDisciplineRecords(recordsData.records || []);
      setLeaveRecords(leavesData.leaves || []);
      setRecentActivities(activitiesData.activities || []);
      setNotifications(notificationsData.notifications || []);
    } catch (error) {
      console.error('Failed to fetch DOD data:', error);
      setOverview({});
      setStatistics({});
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConduct = async () => {
    if (!newConduct.student_id || !newConduct.description) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setProcessing(true);
      await apiService.removeConductRecord(newConduct);
      showSuccessMsg('Conduct removed and parent notified successfully!');
      setShowConductModal(false);
      setNewConduct({
        student_id: '',
        conduct_type: 'warning',
        severity: 'medium',
        description: '',
        action_taken: '',
        lesson_missed: ''
      });
      fetchData();
    } catch (error: any) {
      alert('Failed to remove conduct: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleAddLeave = async () => {
    if (!newLeave.student_id || !newLeave.reason || !newLeave.start_time || !newLeave.end_time) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setProcessing(true);
      await apiService.addStudentLeave(newLeave);
      showSuccessMsg('Leave granted and parent notified successfully!');
      setShowLeaveModal(false);
      setNewLeave({
        student_id: '',
        leave_type: 'sick',
        reason: '',
        lesson_missed: '',
        start_time: '',
        end_time: ''
      });
      fetchData();
    } catch (error: any) {
      alert('Failed to add leave: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateIncident = async () => {
    if (!newIncident.student_id || !newIncident.description) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setProcessing(true);
      await apiService.createIncident(newIncident);
      showSuccessMsg('Incident recorded successfully!');
      setShowIncidentModal(false);
      setNewIncident({
        student_id: '',
        case_type: '',
        description: '',
        severity: 'medium',
        reported_by: ''
      });
      fetchData();
    } catch (error: any) {
      alert('Failed to create incident: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await apiService.deleteDisciplineRecord(id);
      showSuccessMsg('Record deleted successfully!');
      fetchData();
    } catch (error: any) {
      alert('Failed to delete record: ' + (error.message || 'Unknown error'));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedStudents.length === 0) {
      alert('Please select records first');
      return;
    }

    try {
      await apiService.bulkUpdateDisciplineRecords(selectedStudents, status);
      showSuccessMsg(`${selectedStudents.length} records updated successfully!`);
      setSelectedStudents([]);
      fetchData();
    } catch (error: any) {
      alert('Failed to update records: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.subject || !messageForm.message) {
      alert('Please fill in subject and message');
      return;
    }

    try {
      setProcessing(true);
      if (selectedStudents.length > 0) {
        await apiService.sendBulkParentMessage({
          student_ids: selectedStudents,
          subject: messageForm.subject,
          message: messageForm.message,
          priority: messageForm.priority
        });
        showSuccessMsg(`Message sent to ${selectedStudents.length} parent(s) successfully!`);
      } else {
        await apiService.sendBulkParentMessage({
          subject: messageForm.subject,
          message: messageForm.message,
          priority: messageForm.priority
        });
        showSuccessMsg('Message sent to all parents successfully!');
      }
      setShowMessageModal(false);
      setMessageForm({ subject: '', message: '', priority: 'normal' });
      setSelectedStudents([]);
    } catch (error: any) {
      alert('Failed to send message: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleExportRecords = async () => {
    try {
      const csvContent = [
        ['Student Code', 'Student Name', 'Trade', 'Conduct Type', 'Severity', 'Description', 'Action Taken', 'Date', 'Removed By'].join(','),
        ...disciplineRecords.map(r => [
          r.student_code,
          r.student_name,
          r.trade,
          r.conduct_type,
          r.severity,
          `"${r.description?.replace(/"/g, '""')}"`,
          `"${r.action_taken?.replace(/"/g, '""')}"`,
          new Date(r.created_at).toLocaleDateString(),
          r.removed_by_name
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `discipline_records_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      showSuccessMsg('Records exported successfully!');
    } catch (error: any) {
      alert('Failed to export records: ' + (error.message || 'Unknown error'));
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await apiService.markDODNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      showSuccessMsg('Notification marked as read');
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const showSuccessMsg = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const toggleStudentSelection = (id: number) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const filteredStudents = students.filter(s =>
    `${s.name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecords = disciplineRecords.filter(r =>
    r.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <Loader2 className="w-16 h-16 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 font-bold"
            >
              <CheckCircle className="w-6 h-6" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
              Director of Discipline Dashboard
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Comprehensive student discipline & behavior management</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setShowConductModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl"
            >
              <Ban className="w-4 h-4 mr-2" />
              Remove Conduct
            </Button>
            <Button 
              onClick={() => setShowLeaveModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
            >
              <Plane className="w-4 h-4 mr-2" />
              Grant Leave
            </Button>
            <Button 
              onClick={() => setShowIncidentModal(true)}
              className="bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Incident
            </Button>
            <Button 
              onClick={() => setShowMessageModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Parents
            </Button>
            <Button 
              onClick={handleExportRecords}
              variant="outline"
              className="border-2 shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline"
              className="relative border-2 shadow-lg hover:shadow-xl"
              onClick={() => onNavigate('notifications')}
            >
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card 
            className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
            onClick={() => onNavigate('dod-parent-management')}
          >
            <CardContent className="p-6 text-center">
              <Mail className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <p className="text-lg font-bold text-blue-900">Parent Management</p>
              <p className="text-xs text-gray-600 mt-1">View & message parents</p>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
            onClick={() => onNavigate('dod-leave-management')}
          >
            <CardContent className="p-6 text-center">
              <Plane className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <p className="text-lg font-bold text-purple-900">Leave Management</p>
              <p className="text-xs text-gray-600 mt-1">Manage student leaves</p>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
            onClick={() => onNavigate('profile')}
          >
            <CardContent className="p-6 text-center">
              <UserCircle className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <p className="text-lg font-bold text-green-900">My Profile</p>
              <p className="text-xs text-gray-600 mt-1">Update account settings</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-red-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-red-600 mb-2" />
              <p className="text-4xl font-black text-red-900">{overview?.total_incidents_30days || 0}</p>
              <p className="text-sm text-gray-600">Incidents (30 days)</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto text-yellow-600 mb-2" />
              <p className="text-4xl font-black text-yellow-900">{overview?.active_warnings || 0}</p>
              <p className="text-sm text-gray-600">Active Warnings</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 mx-auto text-orange-600 mb-2" />
              <p className="text-4xl font-black text-orange-900">{overview?.recent_suspensions || 0}</p>
              <p className="text-sm text-gray-600">Suspensions (30 days)</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <p className="text-4xl font-black text-blue-900">{students.length}</p>
              <p className="text-sm text-gray-600">Students with Records</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 border-b-2 border-gray-200">
          {['overview', 'students', 'statistics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'border-b-4 border-red-600 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-red-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Recent Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {overview?.recent_incidents?.slice(0, 10).map((incident: any, index: number) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-lg">
                            {incident.first_name} {incident.last_name}
                          </p>
                          <Badge className="bg-blue-100 text-blue-700">{incident.student_id}</Badge>
                          <Badge className={
                            incident.severity === 'severe' ? 'bg-red-100 text-red-700' :
                            incident.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                            incident.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {incident.severity}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-red-700 mb-1">{incident.incident_type}</p>
                        <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>📅 {new Date(incident.incident_date).toLocaleDateString()}</span>
                          <span>👤 Reported by: {incident.reported_by}</span>
                          <span>⚡ Action: {incident.action_taken}</span>
                        </div>
                        {incident.class_name && (
                          <p className="text-xs text-gray-500 mt-1">Class: {incident.class_name}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-2 border-purple-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    Notifications
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <Badge className="bg-red-600 text-white">{notifications.filter(n => !n.is_read).length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[270px] overflow-y-auto">
                    {notifications.slice(0, 8).map((notif: any, idx: number) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${
                          notif.is_read 
                            ? 'bg-gray-50 border-gray-300' 
                            : 'bg-purple-50 border-purple-500'
                        }`}
                        onClick={() => !notif.is_read && handleMarkNotificationRead(notif.id)}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${notif.is_read ? 'text-gray-700' : 'text-purple-900'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Today's Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentActivities.slice(0, 5).map((activity: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-2 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">
                            {activity.module} • {new Date(activity.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <Card className="border-2 border-red-100 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <CardTitle>Students with Discipline Records</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-2"
                    />
                  </div>
                </div>
                {selectedStudents.length > 0 && (
                  <div className="flex gap-2 items-center bg-blue-50 p-3 rounded-lg">
                    <span className="font-bold text-blue-900">{selectedStudents.length} selected</span>
                    <Button 
                      size="sm"
                      onClick={() => setShowMessageModal(true)}
                      className="bg-purple-600 text-white"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message Parents
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedStudents([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-center py-3 px-2 w-12">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(filteredStudents.map(s => s.id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Class</th>
                      <th className="text-center py-3 px-4">Total Incidents</th>
                      <th className="text-center py-3 px-4">Recent (30d)</th>
                      <th className="text-left py-3 px-4">Last Incident</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b hover:bg-red-50 ${selectedStudents.includes(student.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="py-3 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-gray-500">{student.student_id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{student.trade_name}</p>
                          <p className="text-xs text-gray-500">Level {student.level_number}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-red-100 text-red-700">
                            {student.total_incidents}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={
                            (student.recent_incidents || 0) > 3 ? 'bg-red-100 text-red-700' :
                            (student.recent_incidents || 0) > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {student.recent_incidents || 0}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-xs text-gray-600">
                            {student.last_incident_date 
                              ? new Date(student.last_incident_date).toLocaleDateString() 
                              : 'No incidents'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onNavigate('dod-students')}
                            className="hover:bg-red-50"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'statistics' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-red-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-red-600" />
                  Incidents by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Critical', count: statistics?.overall?.critical_severity || 0, color: 'bg-red-600' },
                    { label: 'High', count: statistics?.overall?.high_severity || 0, color: 'bg-orange-500' },
                    { label: 'Medium', count: statistics?.overall?.medium_severity || 0, color: 'bg-yellow-500' },
                    { label: 'Low', count: statistics?.overall?.low_severity || 0, color: 'bg-blue-500' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-semibold">{item.label}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div 
                          className={`${item.color} h-full flex items-center justify-end px-3 text-white font-bold text-sm`}
                          style={{ width: `${(item.count / (statistics?.overall?.total_incidents || 1)) * 100}%` }}
                        >
                          {item.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  By Trade Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics?.byTrade?.slice(0, 5).map((trade: any) => (
                    <div key={trade.trade} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-bold">{trade.trade}</p>
                        <p className="text-xs text-gray-500">{trade.total_incidents} total incidents</p>
                      </div>
                      <Badge className={
                        trade.critical_incidents > 5 ? 'bg-red-100 text-red-700' :
                        trade.critical_incidents > 2 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }>
                        {trade.critical_incidents} critical
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Leave Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-3xl font-black text-blue-600">
                      {statistics?.leaveStats?.total_leaves || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Leaves</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-3xl font-black text-red-600">
                      {statistics?.leaveStats?.sick_leaves || 0}
                    </p>
                    <p className="text-sm text-gray-600">Sick Leaves</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-3xl font-black text-purple-600">
                      {statistics?.leaveStats?.home_leaves || 0}
                    </p>
                    <p className="text-sm text-gray-600">Home Leaves</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-3xl font-black text-orange-600">
                      {statistics?.leaveStats?.ongoing_leaves || 0}
                    </p>
                    <p className="text-sm text-gray-600">Currently Away</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {activity.module} • {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conduct Removal Modal */}
        <AnimatePresence>
          {showConductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Ban className="w-6 h-6" />
                    Remove Student Conduct
                  </h2>
                  <p className="text-red-100 mt-1">Record misconduct and notify parents automatically</p>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <Label className="font-bold">Select Student *</Label>
                    <select
                      value={newConduct.student_id}
                      onChange={(e) => setNewConduct({ ...newConduct, student_id: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value="">Choose a student...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.student_code}) - {s.trade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Conduct Type *</Label>
                    <select
                      value={newConduct.conduct_type}
                      onChange={(e) => setNewConduct({ ...newConduct, conduct_type: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value="warning">Warning</option>
                      <option value="suspension">Suspension</option>
                      <option value="absence">Unauthorized Absence</option>
                      <option value="late_arrival">Late Arrival</option>
                      <option value="fighting">Fighting</option>
                      <option value="disrespect">Disrespect</option>
                      <option value="cheating">Cheating</option>
                      <option value="vandalism">Vandalism</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Severity *</Label>
                    <select
                      value={newConduct.severity}
                      onChange={(e) => setNewConduct({ ...newConduct, severity: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Description *</Label>
                    <Textarea
                      value={newConduct.description}
                      onChange={(e) => setNewConduct({ ...newConduct, description: e.target.value })}
                      placeholder="Detailed description of the misconduct..."
                      rows={4}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <Label className="font-bold">Action Taken</Label>
                    <Input
                      value={newConduct.action_taken}
                      onChange={(e) => setNewConduct({ ...newConduct, action_taken: e.target.value })}
                      placeholder="e.g., Verbal warning, Detention, Parent meeting"
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <Label className="font-bold">Lesson/Period Missed</Label>
                    <Input
                      value={newConduct.lesson_missed}
                      onChange={(e) => setNewConduct({ ...newConduct, lesson_missed: e.target.value })}
                      placeholder="e.g., Mathematics Period 3"
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm text-yellow-800 font-semibold flex items-center gap-2">
                      <AlertCircleIcon className="w-4 h-4" />
                      Parents will be automatically notified via SMS/WhatsApp about this conduct removal.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowConductModal(false)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRemoveConduct}
                    disabled={processing}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Remove Conduct & Notify
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Leave Modal */}
        <AnimatePresence>
          {showLeaveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Plane className="w-6 h-6" />
                    Grant Student Leave
                  </h2>
                  <p className="text-blue-100 mt-1">Approve student leave and notify parents</p>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <Label className="font-bold">Select Student *</Label>
                    <select
                      value={newLeave.student_id}
                      onChange={(e) => setNewLeave({ ...newLeave, student_id: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Choose a student...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.student_code}) - {s.trade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Leave Type *</Label>
                    <select
                      value={newLeave.leave_type}
                      onChange={(e) => setNewLeave({ ...newLeave, leave_type: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="sick">Sick Leave</option>
                      <option value="home">Home Visit</option>
                      <option value="emergency">Emergency</option>
                      <option value="family">Family Matter</option>
                      <option value="medical">Medical Appointment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Reason *</Label>
                    <Textarea
                      value={newLeave.reason}
                      onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                      placeholder="Reason for leave..."
                      rows={3}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Start Time *</Label>
                      <Input
                        type="datetime-local"
                        value={newLeave.start_time}
                        onChange={(e) => setNewLeave({ ...newLeave, start_time: e.target.value })}
                        className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label className="font-bold">End Time *</Label>
                      <Input
                        type="datetime-local"
                        value={newLeave.end_time}
                        onChange={(e) => setNewLeave({ ...newLeave, end_time: e.target.value })}
                        className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold">Lesson/Period to Miss</Label>
                    <Input
                      value={newLeave.lesson_missed}
                      onChange={(e) => setNewLeave({ ...newLeave, lesson_missed: e.target.value })}
                      placeholder="e.g., All afternoon classes"
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800 font-semibold flex items-center gap-2">
                      <AlertCircleIcon className="w-4 h-4" />
                      Parents will be automatically notified via SMS/WhatsApp about this approved leave.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaveModal(false)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddLeave}
                    disabled={processing}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Grant Leave & Notify
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Incident Modal */}
        <AnimatePresence>
          {showIncidentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    Record Discipline Incident
                  </h2>
                  <p className="text-orange-100 mt-1">Document incident for tracking and analysis</p>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <Label className="font-bold">Select Student *</Label>
                    <select
                      value={newIncident.student_id}
                      onChange={(e) => setNewIncident({ ...newIncident, student_id: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="">Choose a student...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.student_code}) - {s.trade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Case Type *</Label>
                    <Input
                      value={newIncident.case_type}
                      onChange={(e) => setNewIncident({ ...newIncident, case_type: e.target.value })}
                      placeholder="e.g., Bullying, Theft, Vandalism"
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <Label className="font-bold">Severity *</Label>
                    <select
                      value={newIncident.severity}
                      onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Description *</Label>
                    <Textarea
                      value={newIncident.description}
                      onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                      placeholder="Detailed description of the incident..."
                      rows={5}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <Label className="font-bold">Reported By</Label>
                    <Input
                      value={newIncident.reported_by}
                      onChange={(e) => setNewIncident({ ...newIncident, reported_by: e.target.value })}
                      placeholder="Staff member name"
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowIncidentModal(false)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateIncident}
                    disabled={processing}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 text-white"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Record Incident
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="font-bold">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Parent Modal */}
        <AnimatePresence>
          {showMessageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    Message Parents
                  </h2>
                  <p className="text-purple-100 mt-1">
                    {selectedStudents.length > 0 
                      ? `Send message to ${selectedStudents.length} selected student parent(s)` 
                      : 'Send message to all parents'}
                  </p>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <Label className="font-bold">Subject *</Label>
                    <Input
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                      placeholder="Message subject..."
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <Label className="font-bold">Message *</Label>
                    <Textarea
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                      placeholder="Type your message here..."
                      rows={6}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <Label className="font-bold">Priority</Label>
                    <select
                      value={messageForm.priority}
                      onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <p className="text-sm text-purple-800 font-semibold flex items-center gap-2">
                      <AlertCircleIcon className="w-4 h-4" />
                      Messages will be sent via SMS/WhatsApp to parents' registered phone numbers.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMessageModal(false);
                      setSelectedStudents([]);
                    }}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={processing}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

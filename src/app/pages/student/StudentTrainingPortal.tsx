import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Video, FileText, CheckCircle, Clock, AlertCircle,
  Award, TrendingUp, Calendar, Users, MessageSquare, Bell, Settings, LogOut,
  ChevronRight, ChevronDown, Play, Download, Upload, Eye, Edit, Trash2,
  Target, Trophy, Star, Activity, PieChart, BarChart3, RefreshCw, Search,
  Plus, Minus, Phone, Mail, MapPin, Home, Shield, Heart, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { API_BASE_URL } from '@/app/config/apiBase';

// ==================== TYPES ====================

interface ParentInfo {
  parent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    whatsapp?: string;
  };
  relationship: string;
  is_primary: boolean;
  is_emergency_contact: boolean;
  linked_at: string;
}

interface TrainingProgram {
  enrollment_id: number;
  program_name: string;
  program_code: string;
  trade_code: string;
  status: string;
  progress_percentage: number;
  overall_grade: number;
  enrollment_date: string;
  expected_completion_date: string;
}

interface TrainingModule {
  id: number;
  module_name: string;
  module_code: string;
  sequence_order: number;
  duration_hours: number;
  status: string;
  score?: number;
  total_sessions: number;
  completed_sessions: number;
}

interface TrainingSession {
  id: number;
  session_title: string;
  session_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location: string;
  instructor_name?: string;
  status: string;
}

// ==================== COMPONENT ====================

const StudentTrainingPortal: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Data States
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [linkedParents, setLinkedParents] = useState<ParentInfo[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingProgram[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<TrainingProgram | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TrainingSession[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);

  // Stats
  const [stats, setStats] = useState({
    total_programs: 0,
    active_enrollments: 0,
    completed_enrollments: 0,
    overall_progress: 0,
    average_grade: 0,
    upcoming_sessions_count: 0
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');

      // Fetch all data in parallel
      const [infoRes, parentsRes, enrollmentsRes, sessionsRes, assessmentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/student-portal-ultra/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/student-parent-linking/student/${studentId}/parents`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/student-training/enrollments?student_id=${studentId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/student-portal-ultra/timetable`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/student-portal-ultra/achievements`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const infoData = await infoRes.json();
      const parentsData = await parentsRes.json();
      const enrollmentsData = await enrollmentsRes.json();
      const sessionsData = await sessionsRes.json();
      const assessmentsData = await assessmentsRes.json();

      if (infoData.success) {
        setStudentInfo(infoData.student);
      }

      if (parentsData.success) {
        setLinkedParents(parentsData.parents || []);
      }

      if (enrollmentsData.success) {
        setEnrollments(enrollmentsData.enrollments || []);
        if (enrollmentsData.enrollments?.length > 0) {
          setSelectedEnrollment(enrollmentsData.enrollments[0]);
          fetchModules(enrollmentsData.enrollments[0].enrollment_id);
        }
      }

      if (sessionsData.success) {
        setUpcomingSessions((sessionsData.today_schedule || []).slice(0, 5));
      }

      if (assessmentsData.success) {
        setRecentAssessments(assessmentsData.achievements || []);
      }

      // Calculate stats
      const enrollmentList = enrollmentsData.enrollments || [];
      setStats({
        total_programs: enrollmentList.length,
        active_enrollments: enrollmentList.filter((e: TrainingProgram) => ['enrolled', 'in_progress'].includes(e.status)).length,
        completed_enrollments: enrollmentList.filter((e: TrainingProgram) => e.status === 'completed').length,
        overall_progress: enrollmentList.length > 0
          ? Math.round(enrollmentList.reduce((sum: number, e: TrainingProgram) => sum + (e.progress_percentage || 0), 0) / enrollmentList.length)
          : 0,
        average_grade: enrollmentList.length > 0
          ? Math.round(enrollmentList.reduce((sum: number, e: TrainingProgram) => sum + (e.overall_grade || 0), 0) / enrollmentList.length)
          : 0,
        upcoming_sessions_count: (sessionsData.today_schedule || []).length
      });

    } catch (error) {
      console.error('Error fetching student data:', error);
    }
    setLoading(false);
  };

  const fetchModules = async (enrollmentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/student-training/enrollments/${enrollmentId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setModules(data.progress || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudentData().finally(() => setRefreshing(false));
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      enrolled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      not_started: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100'}>{status}</Badge>;
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'theory': return <BookOpen className="w-4 h-4" />;
      case 'practical': return <Activity className="w-4 h-4" />;
      case 'assessment': return <Target className="w-4 h-4" />;
      case 'field_work': return <MapPin className="w-4 h-4" />;
      case 'workshop': return <Users className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading training portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Training Portal</h1>
              <p className="text-blue-100">View your training programs, progress, and linked parents</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Student Info */}
          {studentInfo && (
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
                <User className="w-5 h-5" />
                <span className="font-semibold">{studentInfo.name}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
                <GraduationCap className="w-5 h-5" />
                <span>{studentInfo.trade} - Level {studentInfo.level}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
                <Award className="w-5 h-5" />
                <span>Code: {studentInfo.code}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Programs</p>
                  <h3 className="text-3xl font-bold text-blue-700">{stats.active_enrollments}</h3>
                </div>
                <BookOpen className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
                  <h3 className="text-3xl font-bold text-green-700">{stats.overall_progress}%</h3>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Grade</p>
                  <h3 className="text-3xl font-bold text-yellow-700">{stats.average_grade}%</h3>
                </div>
                <Award className="w-12 h-12 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming Sessions</p>
                  <h3 className="text-3xl font-bold text-purple-700">{stats.upcoming_sessions_count}</h3>
                </div>
                <Calendar className="w-12 h-12 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">My Training</TabsTrigger>
            <TabsTrigger value="parents">Linked Parents</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Training Programs */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Active Training Programs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {enrollments.length > 0 ? (
                    <div className="space-y-4">
                      {enrollments.slice(0, 3).map((enrollment) => (
                        <div key={enrollment.enrollment_id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{enrollment.program_name}</h4>
                              <p className="text-sm text-gray-500">{enrollment.program_code}</p>
                            </div>
                            {getStatusBadge(enrollment.status)}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-semibold">{enrollment.progress_percentage}%</span>
                            </div>
                            <Progress value={enrollment.progress_percentage} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No training programs enrolled</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Linked Parents */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Linked Parents/Guardians
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {linkedParents.length > 0 ? (
                    <div className="space-y-4">
                      {linkedParents.map((parent, idx) => (
                        <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                {parent.parent.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{parent.parent.name}</h4>
                                <p className="text-sm text-gray-500 capitalize">{parent.relationship}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {parent.is_primary && <Badge className="bg-blue-100 text-blue-800">Primary</Badge>}
                              {parent.is_emergency_contact && <Badge className="bg-red-100 text-red-800">Emergency</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {parent.parent.phone}
                            </div>
                            {parent.parent.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {parent.parent.email}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No parents linked to your account</p>
                      <p className="text-sm mt-2">Contact the school administration to link your parents</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Training Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                            {getSessionTypeIcon(session.session_type)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{session.session_title}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(session.scheduled_date).toLocaleDateString()} at {session.scheduled_time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {session.location && (
                            <span className="text-sm text-gray-600">{session.location}</span>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming sessions scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Program Selection */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle>My Training Programs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {enrollments.length > 0 ? (
                      <div className="space-y-2">
                        {enrollments.map((enrollment) => (
                          <Button
                            key={enrollment.enrollment_id}
                            variant={selectedEnrollment?.enrollment_id === enrollment.enrollment_id ? 'default' : 'outline'}
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              fetchModules(enrollment.enrollment_id);
                            }}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="font-semibold">{enrollment.program_name}</p>
                                <p className="text-xs text-gray-500">{enrollment.program_code}</p>
                              </div>
                              <Progress value={enrollment.progress_percentage} className="w-16 h-2" />
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No training programs</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Program Details */}
              <div className="lg:col-span-2">
                {selectedEnrollment && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                      <CardTitle>{selectedEnrollment.program_name}</CardTitle>
                      <CardDescription>{selectedEnrollment.program_code}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold">{getStatusBadge(selectedEnrollment.status)}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="font-semibold text-lg">{selectedEnrollment.progress_percentage}%</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Grade</p>
                          <p className="font-semibold text-lg">{selectedEnrollment.overall_grade || 'N/A'}%</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Expected End</p>
                          <p className="font-semibold text-sm">
                            {selectedEnrollment.expected_completion_date 
                              ? new Date(selectedEnrollment.expected_completion_date).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Modules Progress */}
                      <h4 className="font-semibold mb-4">Modules Progress</h4>
                      <div className="space-y-3">
                        {modules.map((module) => (
                          <div key={module.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                  {module.sequence_order}
                                </div>
                                <div>
                                  <h5 className="font-semibold">{module.module_name}</h5>
                                  <p className="text-sm text-gray-500">{module.module_code}</p>
                                </div>
                              </div>
                              {getStatusBadge(module.status)}
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{module.completed_sessions}/{module.total_sessions} sessions</span>
                              {module.score && <span>Score: {module.score}%</span>}
                            </div>
                          </div>
                        ))}
                        {modules.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p>No modules available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Parents Tab */}
          <TabsContent value="parents" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  My Linked Parents/Guardians
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {linkedParents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {linkedParents.map((parent, idx) => (
                      <div key={idx} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl font-bold">
                              {parent.parent.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{parent.parent.name}</h3>
                              <p className="text-gray-500 capitalize">{parent.relationship}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {parent.is_primary && <Badge className="bg-blue-100 text-blue-800">Primary</Badge>}
                            {parent.is_emergency_contact && <Badge className="bg-red-100 text-red-800">Emergency Contact</Badge>}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-600">
                            <Phone className="w-5 h-5" />
                            <span>{parent.parent.phone}</span>
                          </div>
                          {parent.parent.email && (
                            <div className="flex items-center gap-3 text-gray-600">
                              <Mail className="w-5 h-5" />
                              <span>{parent.parent.email}</span>
                            </div>
                          )}
                          {parent.parent.whatsapp && (
                            <div className="flex items-center gap-3 text-gray-600">
                              <MessageSquare className="w-5 h-5" />
                              <span>WhatsApp: {parent.parent.whatsapp}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                          <p>Linked on: {new Date(parent.linked_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Parents Linked</h3>
                    <p className="text-gray-500 mb-4">
                      There are no parents or guardians linked to your account yet.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg inline-block">
                      <p className="text-sm text-blue-700">
                        <strong>How to link parents:</strong> Contact the school administration with your parent's
                        details (name, phone, relationship). They will verify and link the account.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Training Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                            {getSessionTypeIcon(session.session_type)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{session.session_title}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(session.scheduled_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                              })} at {session.scheduled_time}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{session.duration_minutes} minutes</span>
                              {session.location && (
                                <>
                                  <MapPin className="w-4 h-4 ml-2" />
                                  <span>{session.location}</span>
                                </>
                              )}
                              {session.instructor_name && (
                                <>
                                  <Users className="w-4 h-4 ml-2" />
                                  <span>{session.instructor_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className="capitalize">{session.session_type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Sessions</h3>
                    <p className="text-gray-500">Your training schedule will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Progress */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="relative w-40 h-40 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${(stats.overall_progress / 100) * 440} 440`}
                            className="text-blue-600"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-gray-800">{stats.overall_progress}%</span>
                        </div>
                      </div>
                      <p className="mt-4 text-gray-600">Overall Training Completion</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{stats.completed_enrollments}</p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{stats.active_enrollments}</p>
                        <p className="text-sm text-gray-600">In Progress</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{stats.total_programs}</p>
                        <p className="text-sm text-gray-600">Total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {recentAssessments.length > 0 ? (
                    <div className="space-y-4">
                      {recentAssessments.slice(0, 5).map((achievement, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                            <Award className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{achievement.title || achievement.achievement_type}</h4>
                            <p className="text-sm text-gray-500">{achievement.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(achievement.date_awarded || achievement.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {achievement.points && (
                            <Badge className="bg-green-100 text-green-800">+{achievement.points} pts</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No achievements yet</p>
                      <p className="text-sm">Complete training modules to earn achievements!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentTrainingPortal;

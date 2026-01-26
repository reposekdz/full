import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, FileText, Video, Download, Upload, Check, X, Clock, Star,
  Award, Trophy, Target, TrendingUp, Calendar, MessageSquare, Users,
  PlayCircle, PauseCircle, Headphones, Eye, ChevronRight, ChevronLeft,
  Search, Filter, Bell, Settings, User, Home, GraduationCap, CheckCircle,
  XCircle, AlertCircle, BarChart3, PieChart, Activity, Zap, Medal, Heart,
  Share2, Bookmark, ThumbsUp, MessageCircle, Send, Paperclip, Image as ImageIcon,
  FileDown, FolderOpen, Lock, Unlock, RefreshCw, Edit, Save, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Progress } from '@/app/components/ui/progress';

const API_BASE = 'http://localhost:5000/api';

interface Course {
  id: number;
  name: string;
  subject: string;
  teacher_name: string;
  description: string;
  progress: number;
  grade: string;
  total_modules: number;
  completed_modules: number;
  next_class?: string;
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  description: string;
  due_date: string;
  total_marks: number;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  score?: number;
  feedback?: string;
  attachments?: string[];
  submission_date?: string;
}

interface Material {
  id: number;
  title: string;
  type: 'video' | 'pdf' | 'document' | 'link' | 'audio';
  subject: string;
  topic: string;
  url: string;
  size?: string;
  duration?: string;
  uploaded_at: string;
  downloads: number;
}

interface Quiz {
  id: number;
  title: string;
  subject: string;
  questions_count: number;
  duration: number;
  total_marks: number;
  passing_marks: number;
  attempts: number;
  best_score?: number;
  status: 'available' | 'completed' | 'locked';
  deadline?: string;
}

interface Discussion {
  id: number;
  title: string;
  subject: string;
  author: string;
  content: string;
  replies: number;
  likes: number;
  created_at: string;
  is_pinned: boolean;
  is_resolved: boolean;
}

const StudentLearningPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);

  const [stats, setStats] = useState({
    total_courses: 0,
    average_grade: 0,
    pending_assignments: 0,
    completed_assignments: 0,
    upcoming_quizzes: 0,
    total_materials: 0,
    discussion_participation: 0,
    attendance_rate: 0
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [coursesRes, assignmentsRes, materialsRes, quizzesRes, discussionsRes, announcementsRes, classesRes] = 
        await Promise.all([
          fetch(`${API_BASE}/courses/student`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/assignments/student`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/academic-system/materials`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/academic-system/quizzes/student`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/forums?category=academic`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/announcements?target_audience=students&status=published`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/timetable/upcoming`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

      const [coursesData, assignmentsData, materialsData, quizzesData, discussionsData, announcementsData, classesData] = 
        await Promise.all([
          coursesRes.json(),
          assignmentsRes.json(),
          materialsRes.json(),
          quizzesRes.json(),
          discussionsRes.json(),
          announcementsRes.json(),
          classesRes.json()
        ]);

      if (coursesData.success) {
        setCourses(coursesData.data || coursesData.courses || []);
        setStats(prev => ({ ...prev, total_courses: (coursesData.data || []).length }));
      }

      if (assignmentsData.success) {
        const assignmentsList = assignmentsData.data || assignmentsData.assignments || [];
        setAssignments(assignmentsList);
        const pending = assignmentsList.filter((a: Assignment) => a.status === 'pending').length;
        const completed = assignmentsList.filter((a: Assignment) => a.status === 'submitted' || a.status === 'graded').length;
        setStats(prev => ({ ...prev, pending_assignments: pending, completed_assignments: completed }));
      }

      if (materialsData.success) {
        setMaterials(materialsData.data || materialsData.materials || []);
        setStats(prev => ({ ...prev, total_materials: (materialsData.data || []).length }));
      }

      if (quizzesData.success) {
        const quizzesList = quizzesData.data || quizzesData.quizzes || [];
        setQuizzes(quizzesList);
        const upcoming = quizzesList.filter((q: Quiz) => q.status === 'available').length;
        setStats(prev => ({ ...prev, upcoming_quizzes: upcoming }));
      }

      if (discussionsData.success) {
        setDiscussions(discussionsData.data || discussionsData.topics || []);
      }

      if (announcementsData.success) {
        setAnnouncements(announcementsData.data || []);
      }

      if (classesData.success) {
        setUpcomingClasses(classesData.data || classesData.classes || []);
      }

      const avgGrade = courses.reduce((sum, c) => sum + parseFloat(c.grade || '0'), 0) / (courses.length || 1);
      setStats(prev => ({ ...prev, average_grade: Math.round(avgGrade) }));

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('assignment_id', selectedAssignment.id.toString());
    formData.append('submission_text', submissionText);
    if (submissionFile) {
      formData.append('file', submissionFile);
    }

    try {
      const response = await fetch(`${API_BASE}/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setShowSubmissionDialog(false);
        setSelectedAssignment(null);
        setSubmissionFile(null);
        setSubmissionText('');
        fetchStudentData();
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudentData().finally(() => setRefreshing(false));
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Headphones className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <FolderOpen className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'locked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading learning portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Student Learning Portal</h1>
              <p className="text-green-100">Access your courses, assignments, and learning materials</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Courses</p>
                  <h3 className="text-3xl font-bold text-green-700">{stats.total_courses}</h3>
                </div>
                <BookOpen className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Assignments</p>
                  <h3 className="text-3xl font-bold text-yellow-700">{stats.pending_assignments}</h3>
                </div>
                <FileText className="w-12 h-12 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Grade</p>
                  <h3 className="text-3xl font-bold text-emerald-700">{stats.average_grade}%</h3>
                </div>
                <Award className="w-12 h-12 text-emerald-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Learning Materials</p>
                  <h3 className="text-3xl font-bold text-green-700">{stats.total_materials}</h3>
                </div>
                <FolderOpen className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {assignments
                      .filter(a => a.status === 'pending')
                      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                      .slice(0, 5)
                      .map(assignment => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{assignment.title}</p>
                            <p className="text-sm text-gray-600">{assignment.subject}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-red-600">
                              {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    {assignments.filter(a => a.status === 'pending').length === 0 && (
                      <p className="text-center text-gray-500 py-4">No pending deadlines</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {announcements.slice(0, 5).map((announcement, idx) => (
                      <div key={idx} className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                        <p className="font-semibold">{announcement.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(announcement.published_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Course Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {courses.map(course => (
                    <div key={course.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-bold">{course.name}</h4>
                          <p className="text-sm text-gray-600">{course.teacher_name}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">{course.grade}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress: {course.completed_modules}/{course.total_modules} modules</span>
                          <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle>{course.name}</CardTitle>
                    <CardDescription>{course.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Instructor</span>
                        <span className="font-semibold">{course.teacher_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Grade</span>
                        <Badge className="bg-green-100 text-green-800">{course.grade}</Badge>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  All Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-lg">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">{assignment.subject}</p>
                        </div>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{assignment.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {assignment.total_marks} marks
                          </span>
                        </div>
                        {assignment.status === 'pending' && (
                          <Button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmissionDialog(true);
                            }}
                            className="bg-gradient-to-r from-green-600 to-emerald-600"
                          >
                            Submit Assignment
                          </Button>
                        )}
                        {assignment.status === 'graded' && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{assignment.score}/{assignment.total_marks}</p>
                            <p className="text-xs text-gray-500">Graded</p>
                          </div>
                        )}
                      </div>
                      {assignment.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900">Feedback:</p>
                          <p className="text-sm text-blue-800">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Learning Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map(material => (
                    <div key={material.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                          {getMaterialIcon(material.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold line-clamp-2">{material.title}</h4>
                          <p className="text-sm text-gray-600">{material.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{material.topic}</span>
                        {material.duration && <span>{material.duration}</span>}
                        {material.size && <span>{material.size}</span>}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quizzes & Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map(quiz => (
                    <div key={quiz.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold">{quiz.title}</h4>
                        <Badge className={getStatusColor(quiz.status)}>
                          {quiz.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{quiz.subject}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Questions</p>
                          <p className="font-semibold">{quiz.questions_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-semibold">{quiz.duration} min</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Marks</p>
                          <p className="font-semibold">{quiz.total_marks}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Passing</p>
                          <p className="font-semibold">{quiz.passing_marks}</p>
                        </div>
                      </div>
                      {quiz.best_score !== undefined && (
                        <div className="p-3 bg-green-50 rounded-lg mb-3">
                          <p className="text-sm text-gray-600">Best Score</p>
                          <p className="text-2xl font-bold text-green-600">{quiz.best_score}%</p>
                        </div>
                      )}
                      <Button
                        disabled={quiz.status === 'locked'}
                        className="w-full bg-gradient-to-r from-yellow-600 to-amber-600"
                      >
                        {quiz.status === 'locked' ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                        {quiz.status === 'available' ? 'Start Quiz' : quiz.status === 'completed' ? 'Retake Quiz' : 'Locked'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Class Discussions
                  </span>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    New Topic
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {discussions.map(discussion => (
                    <div key={discussion.id} className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                      discussion.is_pinned ? 'bg-yellow-50 border-yellow-300' : ''
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {discussion.is_pinned && <Award className="w-4 h-4 text-yellow-600" />}
                            <h4 className="font-bold">{discussion.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{discussion.subject}</p>
                        </div>
                        {discussion.is_resolved && (
                          <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{discussion.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {discussion.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {discussion.replies} replies
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {discussion.likes}
                          </span>
                        </div>
                        <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingClasses.map((cls, idx) => (
                    <div key={idx} className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{cls.subject || cls.name}</h4>
                          <p className="text-sm text-gray-600">{cls.teacher || cls.instructor}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{cls.time}</p>
                          <p className="text-sm text-gray-600">{cls.room || cls.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment: {selectedAssignment?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Submission Text</label>
              <Textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter your submission text or comments..."
                rows={6}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Attach File (Optional)</label>
              <Input
                type="file"
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                className="w-full"
              />
              {submissionFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {submissionFile.name}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSubmissionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAssignment}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentLearningPortal;

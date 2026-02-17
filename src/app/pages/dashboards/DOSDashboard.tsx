import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Users, BookOpen, TrendingUp, Plus, Search, UserPlus, BarChart2, Award, Target, MessageSquare, Grid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import apiService from '@/app/services/apiService';
import { UnifiedMessaging } from '@/app/components/messaging/UnifiedMessaging';
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
import { useAuth } from '@/app/contexts/AuthContext';

interface DOSDashboardProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export default function DOSDashboard({ onNavigate, onLogout }: DOSDashboardProps = {}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newAssignment, setNewAssignment] = useState({
    teacher_id: '',
    subject_id: '',
    trade_class_id: '',
    academic_year_id: '1',
    weekly_periods: '4'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, subjectsData, teachersData] = await Promise.all([
        apiService.getDOSOverview(),
        apiService.getSubjectPerformance(),
        apiService.getDOSTeachers()
      ]);
      setOverview(overviewData.data);
      setSubjects(subjectsData.subjects || []);
      setTeachers(teachersData.teachers || []);
    } catch (error) {
      console.error('Failed to fetch DOS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    try {
      await apiService.assignTeacher({
        ...newAssignment,
        teacher_id: parseInt(newAssignment.teacher_id),
        subject_id: parseInt(newAssignment.subject_id),
        trade_class_id: parseInt(newAssignment.trade_class_id),
        academic_year_id: parseInt(newAssignment.academic_year_id),
        weekly_periods: parseInt(newAssignment.weekly_periods)
      });
      alert('Teacher assigned successfully!');
      setNewAssignment({
        teacher_id: '',
        subject_id: '',
        trade_class_id: '',
        academic_year_id: '1',
        weekly_periods: '4'
      });
      fetchData();
    } catch (error: any) {
      alert('Failed to assign teacher: ' + error.message);
    }
  };

  const filteredTeachers = teachers.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Director of Studies Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Academic oversight and performance management</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Teacher to Subject</DialogTitle>
                <DialogDescription>Assign a teacher to teach a subject for a specific class</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Teacher</Label>
                  <Select value={newAssignment.teacher_id} onValueChange={(v) => setNewAssignment({ ...newAssignment, teacher_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.first_name} {t.last_name} - {t.subjects_taught || 0} subjects
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Select value={newAssignment.subject_id} onValueChange={(v) => setNewAssignment({ ...newAssignment, subject_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Class ID</Label>
                  <Input
                    type="number"
                    value={newAssignment.trade_class_id}
                    onChange={(e) => setNewAssignment({ ...newAssignment, trade_class_id: e.target.value })}
                    placeholder="Enter class ID"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Weekly Periods</Label>
                  <Input
                    type="number"
                    value={newAssignment.weekly_periods}
                    onChange={(e) => setNewAssignment({ ...newAssignment, weekly_periods: e.target.value })}
                    min="1"
                    max="20"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAssignTeacher} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  Assign Teacher
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-indigo-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto text-indigo-600 mb-2" />
              <p className="text-4xl font-black text-indigo-900">{overview?.total_students || 0}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <p className="text-4xl font-black text-purple-900">{overview?.total_teachers || 0}</p>
              <p className="text-sm text-gray-600">Total Teachers</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Award className="w-12 h-12 mx-auto text-pink-600 mb-2" />
              <p className="text-4xl font-black text-pink-900">
                {overview?.average_performance ? overview.average_performance.toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-600">Average Performance</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <p className="text-4xl font-black text-blue-900">{subjects.length}</p>
              <p className="text-sm text-gray-600">Active Subjects</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 border-b-2 border-gray-200">
          {['overview', 'subjects', 'teachers', 'performance', 'global-sheets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-all ${activeTab === tab
                  ? 'border-b-4 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab === 'global-sheets' ? (
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4" /> Global Sheets
                </div>
              ) : tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-indigo-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Class Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overview?.class_performance?.slice(0, 10).map((cls: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{cls.class_name}</p>
                        <p className="text-xs text-gray-500">
                          {cls.trade_name} - Level {cls.level_number}
                        </p>
                        <p className="text-xs text-gray-400">{cls.student_count} students</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">
                          {cls.avg_marks ? cls.avg_marks.toFixed(1) : 0}%
                        </p>
                        <Badge className={
                          cls.avg_marks >= 80 ? 'bg-green-100 text-green-700' :
                            cls.avg_marks >= 60 ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                        }>
                          {cls.avg_marks >= 80 ? 'Excellent' :
                            cls.avg_marks >= 60 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Top Performing Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.slice(0, 10).sort((a, b) => (b.avg_percentage || 0) - (a.avg_percentage || 0)).map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{subject.name}</p>
                        <p className="text-xs text-gray-500">{subject.code}</p>
                        <p className="text-xs text-gray-400">
                          {subject.student_count} students • {subject.teacher_count} teachers
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {subject.avg_percentage ? subject.avg_percentage.toFixed(1) : 0}%
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'subjects' && (
          <Card className="border-2 border-indigo-100 shadow-xl">
            <CardHeader>
              <CardTitle>Subject Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-3 px-4">Subject</th>
                      <th className="text-center py-3 px-4">Code</th>
                      <th className="text-center py-3 px-4">Students</th>
                      <th className="text-center py-3 px-4">Teachers</th>
                      <th className="text-center py-3 px-4">Avg Performance</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject, index) => (
                      <motion.tr
                        key={subject.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-indigo-50"
                      >
                        <td className="py-3 px-4 font-semibold">{subject.name}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-indigo-100 text-indigo-700">{subject.code}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">{subject.student_count || 0}</td>
                        <td className="py-3 px-4 text-center">{subject.teacher_count || 0}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-lg font-bold text-indigo-600">
                            {subject.avg_percentage ? subject.avg_percentage.toFixed(1) : 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            subject.avg_percentage >= 80 ? 'bg-green-100 text-green-700' :
                              subject.avg_percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                                subject.avg_percentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                          }>
                            {subject.avg_percentage >= 80 ? 'Excellent' :
                              subject.avg_percentage >= 60 ? 'Good' :
                                subject.avg_percentage >= 40 ? 'Fair' : 'Poor'}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'teachers' && (
          <Card className="border-2 border-indigo-100 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Teacher Workload & Assignments</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-3 px-4">Teacher</th>
                      <th className="text-center py-3 px-4">Subjects</th>
                      <th className="text-center py-3 px-4">Classes</th>
                      <th className="text-center py-3 px-4">Weekly Periods</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((teacher, index) => (
                      <motion.tr
                        key={teacher.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-indigo-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{teacher.first_name} {teacher.last_name}</p>
                            <p className="text-xs text-gray-500">{teacher.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-purple-100 text-purple-700">
                            {teacher.subjects_taught || 0}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-blue-100 text-blue-700">
                            {teacher.classes_taught || 0}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold">{teacher.total_periods || 0}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            teacher.total_periods > 20 ? 'bg-red-100 text-red-700' :
                              teacher.total_periods > 15 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                          }>
                            {teacher.total_periods > 20 ? 'Overloaded' :
                              teacher.total_periods > 15 ? 'Full' : 'Available'}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'performance' && (
          <Card className="border-2 border-indigo-100 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Subject Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.sort((a, b) => (b.avg_percentage || 0) - (a.avg_percentage || 0)).map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{subject.name}</p>
                        <p className="text-xs text-gray-500">{subject.student_count} students enrolled</p>
                      </div>
                      <span className="text-xl font-bold text-indigo-600">
                        {subject.avg_percentage ? subject.avg_percentage.toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.avg_percentage || 0}%` }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.8 }}
                        className={`h-full flex items-center justify-end pr-2 ${subject.avg_percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            subject.avg_percentage >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                              subject.avg_percentage >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-red-500 to-rose-500'
                          }`}
                      >
                        <span className="text-white text-xs font-bold">
                          {subject.avg_percentage ? subject.avg_percentage.toFixed(0) : 0}%
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'global-sheets' && (
          <div className="h-[calc(100vh-250px)]">
            <GlobalStudentSheets
              userRole={user?.role || 'dos'}
              userId={user?.id || 0}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

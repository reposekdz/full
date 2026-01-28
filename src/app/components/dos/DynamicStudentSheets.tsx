import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Plus, Download, Upload, Filter, Search, RefreshCw, TrendingUp,
  Award, BarChart3, Eye, Edit, Trash2, Save, X, FileText, Printer,
  UserPlus, ChevronDown, ChevronUp, Star, Medal, Trophy, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const API_BASE = 'http://localhost:5000/api';

interface DynamicStudentSheetsProps {
  userRole: 'headmaster' | 'director_study' | 'teacher' | 'accountant';
}

const DynamicStudentSheets: React.FC<DynamicStudentSheetsProps> = ({ userRole }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());
  const [classStats, setClassStats] = useState<any>(null);
  
  const canEdit = ['headmaster', 'director_study'].includes(userRole);
  const canViewFinances = ['headmaster', 'accountant'].includes(userRole);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentSheet(selectedClass.id);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/classes`);
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudentSheet = async (classId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/dynamic-sheets/sheets/${classId}`);
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students || []);
        setSubjects(data.subjects || []);
        setClassStats(data.class_statistics || null);
      }
    } catch (error) {
      console.error('Error fetching student sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (formData: any) => {
    try {
      const response = await fetch(`${API_BASE}/dynamic-sheets/sheets/${selectedClass.id}/add-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchStudentSheet(selectedClass.id);
        setShowAddStudent(false);
        alert(`Student added successfully! Serial Code: ${data.serial_code}\nDefault Password: ${data.default_password}`);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student');
    }
  };

  const generateReportCards = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/dynamic-sheets/generate-report-cards/${selectedClass.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academic_year: new Date().getFullYear(),
          term: 'Term 1'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Generated ${data.report_cards.length} report cards successfully!`);
        window.open(`/report-cards/${selectedClass.id}`, '_blank');
      }
    } catch (error) {
      console.error('Error generating report cards:', error);
      alert('Failed to generate report cards');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentExpand = (studentId: number) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="text-gray-500">#{rank}</span>;
  };

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Dynamic Student Sheets
            </h1>
            <p className="text-gray-600 mt-2">Advanced student performance management system</p>
          </div>
          
          <div className="flex gap-3">
            {canEdit && (
              <>
                <Button
                  onClick={() => setShowAddStudent(true)}
                  className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
                <Button
                  onClick={generateReportCards}
                  disabled={!selectedClass || loading}
                  className="bg-gradient-to-r from-yellow-600 to-green-600"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Class Selection & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedClass?.id?.toString()} onValueChange={(val) => {
            const cls = classes.find(c => c.id === parseInt(val));
            setSelectedClass(cls);
          }}>
            <SelectTrigger className="border-2 border-yellow-200 focus:border-green-400">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.class_name} - {cls.trade_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-yellow-200 focus:border-green-400"
            />
          </div>

          <Button
            onClick={() => selectedClass && fetchStudentSheet(selectedClass.id)}
            variant="outline"
            className="border-2 border-green-200 hover:bg-green-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button
            variant="outline"
            className="border-2 border-yellow-200 hover:bg-yellow-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </motion.div>

      {/* Class Statistics */}
      {classStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="border-l-4 border-l-green-500 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-green-600">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Class Average</p>
                  <p className="text-2xl font-bold text-yellow-600">{classStats.average_percentage}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Highest Score</p>
                  <p className="text-2xl font-bold text-blue-600">{classStats.highest_percentage}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold text-orange-600">{classStats.average_attendance}%</p>
                </div>
                <Award className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student Table */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-yellow-600 text-white">
                <tr>
                  <th className="p-4 text-left">Rank</th>
                  <th className="p-4 text-left">Serial Code</th>
                  <th className="p-4 text-left">Student Name</th>
                  <th className="p-4 text-center">Total %</th>
                  <th className="p-4 text-center">Avg Grade</th>
                  <th className="p-4 text-center">Attendance</th>
                  <th className="p-4 text-center">Performance</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50 transition-all ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getRankBadge(student.rank)}
                          <span className="font-semibold">{student.position_suffix}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-gradient-to-r from-green-100 to-yellow-100 text-green-800">
                          {student.student_id}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold ${getPerformanceColor(student.statistics.percentage)}`}>
                          {student.statistics.percentage.toFixed(2)}%
                        </div>
                      </td>
                      <td className="p-4 text-center font-semibold">{student.statistics.average_grade}</td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold">{student.statistics.attendance_rate}%</span>
                          <span className="text-xs text-gray-500">
                            {student.statistics.present_days}/{student.statistics.total_days} days
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(student.statistics.percentage / 20)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleStudentExpand(student.id)}
                          >
                            {expandedStudents.has(student.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canEdit && (
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedStudents.has(student.id) && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={8} className="bg-gradient-to-r from-green-50 to-yellow-50 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Subject Grades</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {Object.entries(student.grades).map(([code, grade]: [string, any]) => (
                                      <div key={code} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{code}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">{grade.value}/{grade.max_score}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {grade.percentage}%
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Attendance Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Present:</span>
                                      <Badge className="bg-green-100 text-green-800">
                                        {student.statistics.present_days} days
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Absent:</span>
                                      <Badge className="bg-red-100 text-red-800">
                                        {student.statistics.absent_days} days
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Late:</span>
                                      <Badge className="bg-yellow-100 text-yellow-800">
                                        {student.statistics.late_days} days
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Overall Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <div className="text-sm">
                                      <span className="text-gray-600">Total Marks:</span>
                                      <span className="ml-2 font-bold">{student.statistics.total_marks}/{student.statistics.max_total_marks}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-gray-600">Class Rank:</span>
                                      <span className="ml-2 font-bold text-green-600">#{student.rank}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-gray-600">Status:</span>
                                      <Badge className="ml-2 bg-gradient-to-r from-green-500 to-yellow-500">
                                        Active
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Add Student Dialog */}
      <AddStudentDialog
        open={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        onSubmit={handleAddStudent}
      />
    </div>
  );
};

const AddStudentDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    parent_phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            Add New Student
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <Input
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="mt-1 border-2 border-yellow-200 focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <Input
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="mt-1 border-2 border-yellow-200 focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 border-2 border-yellow-200 focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 border-2 border-yellow-200 focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <Input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="mt-1 border-2 border-yellow-200 focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                <SelectTrigger className="mt-1 border-2 border-yellow-200 focus:border-green-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Parent Phone (Optional)</label>
              <Input
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                className="mt-1 border-2 border-yellow-200 focus:border-green-400"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-green-600 to-yellow-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicStudentSheets;

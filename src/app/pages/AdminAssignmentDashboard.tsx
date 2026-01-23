import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, Users, FileText, CheckCircle, BarChart3, Download, Eye, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';

interface AdminAssignmentDashboardProps {
  role: 'admin' | 'headmaster';
}

const AdminAssignmentDashboard: React.FC<AdminAssignmentDashboardProps> = ({ role }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classPerformance, setClassPerformance] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchAllAssignments();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dos/classes');
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dos/teachers');
      const teachers = await response.json();
      
      let allAssignmentsData: any[] = [];
      for (const teacher of teachers) {
        const assignmentsRes = await fetch(`http://localhost:5000/api/assignments/assignments/teacher/${teacher.id}`);
        const assignments = await assignmentsRes.json();
        allAssignmentsData = [...allAssignmentsData, ...assignments];
      }
      
      setAllAssignments(allAssignmentsData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchClassPerformance = async (classId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/assignments/analytics/class/${classId}`);
      const data = await response.json();
      setClassPerformance(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching class performance:', error);
      setClassPerformance([]);
    }
  };

  const handleClassSelect = (cls: any) => {
    setSelectedClass(cls);
    fetchClassPerformance(cls.id);
  };

  const exportClassReport = () => {
    if (!classPerformance.length) return;

    const csvContent = [
      ['Student Name', 'Total Assignments', 'Completed', 'Average %', 'Total Marks', 'Rank'].join(','),
      ...classPerformance.map(p => [
        p.student_name,
        p.total_assignments,
        p.completed_assignments,
        p.average_percentage?.toFixed(2),
        p.total_marks_obtained?.toFixed(2),
        p.rank_in_class || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-${selectedClass.name}-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overallStats = {
    totalAssignments: allAssignments.length,
    totalSubmissions: allAssignments.reduce((sum, a) => sum + (a.submission_count || 0), 0),
    totalGraded: allAssignments.reduce((sum, a) => sum + (a.graded_count || 0), 0),
    totalClasses: classes.length
  };

  const stats = [
    { label: 'Amashuri', value: overallStats.totalClasses, icon: Users, color: 'from-blue-600 to-indigo-600' },
    { label: 'Ibikorwa Byose', value: overallStats.totalAssignments, icon: FileText, color: 'from-green-600 to-emerald-600' },
    { label: 'Byoherejwe', value: overallStats.totalSubmissions, icon: TrendingUp, color: 'from-purple-600 to-pink-600' },
    { label: 'Byakosorejwe', value: overallStats.totalGraded, icon: CheckCircle, color: 'from-yellow-600 to-orange-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {role === 'admin' ? 'Admin Dashboard' : 'Headmaster Dashboard'}
          </h1>
          <p className="text-lg text-gray-600 font-semibold">Academic Performance Management</p>
        </motion.div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
              <Card className="border-2 border-gray-100 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1 text-center">{stat.value}</p>
                  <p className="text-sm font-bold text-gray-600 text-center">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {!selectedClass ? (
          <>
            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <Card className="border-2 border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Filter className="w-6 h-6 text-indigo-600" />
                    <Input
                      placeholder="Shakisha ishuri..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 h-12 text-lg border-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls, index) => (
                <motion.div key={cls.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="border-2 border-gray-200 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => handleClassSelect(cls)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Badge className="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">{cls.trade_name}</Badge>
                          <h3 className="text-xl font-black text-gray-900 mb-2">{cls.name}</h3>
                          <p className="text-sm text-gray-600">Code: {cls.code}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-black text-blue-600">{cls.current_students || 0}</p>
                          <p className="text-xs text-gray-600 font-semibold">Abanyeshuri</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-black text-green-600">{cls.assignment_count || 0}</p>
                          <p className="text-xs text-gray-600 font-semibold">Ibikorwa</p>
                        </div>
                      </div>

                      <Button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold">
                        <Eye className="w-4 h-4 mr-2" />
                        Reba Imikorere
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <Button onClick={() => setSelectedClass(null)} variant="outline" className="font-bold">
                ← Subira
              </Button>
              <Button onClick={exportClassReport} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Class Header */}
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 mb-8">
              <CardContent className="p-8">
                <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedClass.name}</h2>
                <p className="text-lg text-gray-600 font-semibold">{selectedClass.trade_name} - Level {selectedClass.level}</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-4xl font-black text-indigo-600">{selectedClass.current_students || 0}</p>
                    <p className="text-sm text-gray-600 font-semibold">Abanyeshuri</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-green-600">{selectedClass.capacity || 0}</p>
                    <p className="text-sm text-gray-600 font-semibold">Ubushobozi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-purple-600">{selectedClass.assignment_count || 0}</p>
                    <p className="text-sm text-gray-600 font-semibold">Ibikorwa</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Performance */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Imikorere y'Abanyeshuri</h2>
                {classPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {classPerformance.map((student, index) => (
                      <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                        <div className={`p-6 rounded-xl border-2 ${student.average_percentage >= 70 ? 'bg-green-50 border-green-200' : student.average_percentage >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {student.rank_in_class && student.rank_in_class <= 3 && (
                                  <div className={`w-8 h-8 rounded-full ${student.rank_in_class === 1 ? 'bg-yellow-500' : student.rank_in_class === 2 ? 'bg-gray-400' : 'bg-orange-600'} flex items-center justify-center`}>
                                    <span className="text-white font-black text-sm">{student.rank_in_class}</span>
                                  </div>
                                )}
                                <h3 className="text-xl font-black text-gray-900">{student.student_name}</h3>
                              </div>
                              <div className="grid grid-cols-4 gap-4 mt-3">
                                <div>
                                  <p className="text-sm text-gray-600">Ibikorwa</p>
                                  <p className="text-lg font-bold text-gray-900">{student.completed_assignments}/{student.total_assignments}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Ikigereranyo</p>
                                  <p className="text-lg font-bold text-gray-900">{student.average_percentage?.toFixed(1)}%</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Amanota</p>
                                  <p className="text-lg font-bold text-gray-900">{student.total_marks_obtained?.toFixed(0)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Umwanya</p>
                                  <p className="text-lg font-bold text-gray-900">#{student.rank_in_class || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className={`w-24 h-24 rounded-full ${student.average_percentage >= 70 ? 'bg-green-600' : student.average_percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'} flex items-center justify-center shadow-xl`}>
                                <span className="text-3xl font-black text-white">{student.average_percentage?.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold">Nta makuru ahari</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAssignmentDashboard;

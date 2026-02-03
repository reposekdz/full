import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Save, 
  ArrowLeft,
  Search,
  Check,
  RefreshCw,
  Loader2,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface TeacherAttendancePageProps {
  onNavigate: (page: string) => void;
}

const TeacherAttendancePage: React.FC<TeacherAttendancePageProps> = ({ onNavigate }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTeacherClasses();
      if (res.success) {
        setClasses(res.classes);
      }
    } catch (err) {
      toast.error('Gufata amaklasi byanze');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: number) => {
    try {
      setLoadingStudents(true);
      const res = await apiService.getClassStudents(classId);
      if (res.success) {
        setStudents(res.students);
        // Initialize attendance data
        const initialData: Record<string, { status: string; remarks: string }> = {};
        res.students.forEach((student: any) => {
          const studentKey = String(student.student_id ?? student.student_code ?? student.id);
          initialData[studentKey] = { status: 'present', remarks: '' };
        });
        setAttendanceData(initialData);
      }
    } catch (err) {
      toast.error('Gufata abanyeshuri byanze');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClassId) return;

    try {
      setSubmitting(true);
      const attendance_records = Object.entries(attendanceData).map(([studentId, data]) => ({
        student_id: studentId,
        status: data.status,
        notes: data.remarks || null
      }));

      const res = await apiService.markAttendance({
        class_id: selectedClassId,
        attendance_date: attendanceDate,
        attendance_records
      });

      if (res.success) {
        toast.success('Kwitabira kwabitswe neza');
        onNavigate('teacher-dashboard');
      }
    } catch (err) {
      toast.error('Kubika kwitabira byanze');
    } finally {
      setSubmitting(false);
    }
  };

  const markAll = (status: string) => {
    const updatedData = { ...attendanceData };
    students.forEach(student => {
      const studentKey = String(student.student_id ?? student.student_code ?? student.id);
      updatedData[studentKey] = { ...(updatedData[studentKey] || { status: 'present', remarks: '' }), status };
    });
    setAttendanceData(updatedData);
  };

  const filteredStudents = students.filter(s => 
    `${s.full_name || `${s.first_name || ''} ${s.last_name || ''}`}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    present: Object.values(attendanceData).filter((d) => d.status === 'present').length,
    absent: Object.values(attendanceData).filter((d) => d.status === 'absent').length,
    late: Object.values(attendanceData).filter((d) => d.status === 'late').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onNavigate('teacher-dashboard')}
              className="rounded-full border-2 border-green-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Gukurikirana Kwitabira</h1>
              <p className="text-gray-600 font-semibold">Mark daily attendance for your students</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                type="date" 
                value={attendanceDate} 
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="pl-10 h-12 border-2 border-green-100 focus:border-green-500 rounded-xl w-full sm:w-48"
              />
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !selectedClassId}
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-200"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Bika Kwitabira
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Class Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 border-white shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Amaklasi Yanjye
                </CardTitle>
                <CardDescription className="text-green-50">Hitamo ikilasi ushaka gukorera</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {classes.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${
                        selectedClassId === cls.id 
                        ? 'bg-green-50 border-green-500 shadow-md' 
                        : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-black text-gray-900">{cls.class_name}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{cls.subject_name || cls.course_name || '-'}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedClassId && (
              <Card className="border-2 border-white shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gray-50 p-6 border-b">
                  <CardTitle className="text-lg font-bold">Incamake y\'Uyumunsi</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-bold">Bari Aho:</span>
                    <Badge className="bg-green-100 text-green-700 text-lg px-3">{stats.present}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-bold">Batari Aho:</span>
                    <Badge className="bg-red-100 text-red-700 text-lg px-3">{stats.absent}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-bold">Batinze:</span>
                    <Badge className="bg-yellow-100 text-yellow-700 text-lg px-3">{stats.late}</Badge>
                  </div>
                  <div className="pt-4 border-t space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start font-bold" onClick={() => markAll('present')}>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start font-bold" onClick={() => markAll('absent')}>
                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - Student List */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedClassId ? (
              <Card className="border-2 border-dashed border-green-200 bg-green-50/50 h-96 flex flex-col items-center justify-center rounded-3xl text-center p-8">
                <Users className="h-20 w-20 text-green-200 mb-6" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">Nta kilasi yatoranijwe</h3>
                <p className="text-gray-600 font-medium max-w-sm">
                  Hitamo imwe mu maklasi yawe iburyo kugira ngo utangire gukurikirana kwitabira.
                </p>
              </Card>
            ) : (
              <Card className="border-2 border-white shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-6 border-b bg-gray-50/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-black text-gray-900">Urutonde rw\'Abanyeshuri</CardTitle>
                      <CardDescription className="font-bold">{students.length} Bose hamwe</CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input 
                        placeholder="Shakisha umunyeshuri..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 w-full md:w-64 border-2 border-gray-100 focus:border-green-500 rounded-xl"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingStudents ? (
                    <div className="h-64 flex items-center justify-center">
                      <RefreshCw className="h-10 w-10 animate-spin text-green-500" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50/50 text-left border-b">
                            <th className="p-4 font-bold text-gray-600">Umunyeshuri</th>
                            <th className="p-4 font-bold text-gray-600 text-center">Uko bimeze</th>
                            <th className="p-4 font-bold text-gray-600">Icyitonderwa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredStudents.map((student) => {
                            const studentKey = String(student.student_id ?? student.student_code ?? student.id);
                            const firstInitial = (student.first_name || student.full_name || '?')[0];
                            const lastInitial = (student.last_name || '')[0] || '';
                            return (
                            <motion.tr 
                              key={studentKey}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-green-50/30 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 border-2 border-green-100">
                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-black">
                                      {firstInitial}{lastInitial}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-black text-gray-900">{student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim()}</p>
                                    <p className="text-xs text-gray-500 font-bold">{student.student_id || student.student_number || 'STU'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleStatusChange(studentKey, 'present')}
                                    className={`p-2 rounded-xl transition-all ${
                                      attendanceData[studentKey]?.status === 'present'
                                      ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                      : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                                    }`}
                                    title="Present"
                                  >
                                    <Check className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(studentKey, 'absent')}
                                    className={`p-2 rounded-xl transition-all ${
                                      attendanceData[studentKey]?.status === 'absent'
                                      ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                                      : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                                    }`}
                                    title="Absent"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(studentKey, 'late')}
                                    className={`p-2 rounded-xl transition-all ${
                                      attendanceData[studentKey]?.status === 'late'
                                      ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200'
                                      : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
                                    }`}
                                    title="Late"
                                  >
                                    <Clock className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                <Input 
                                  placeholder="Icyitonderwa..."
                                  value={attendanceData[studentKey]?.remarks || ''}
                                  onChange={(e) => handleRemarksChange(studentKey, e.target.value)}
                                  className="h-10 border-2 border-gray-100 focus:border-green-500 rounded-xl text-sm"
                                />
                              </td>
                            </motion.tr>
                          );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendancePage;

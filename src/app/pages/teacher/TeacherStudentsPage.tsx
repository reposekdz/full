import React, { useEffect, useState } from 'react';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import { API_BASE_URL } from '@/app/config/apiBase';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { RefreshCw, Users } from 'lucide-react';

interface TeacherStudentsPageProps {
  onNavigate: (page: string) => void;
}

const TeacherStudentsPage: React.FC<TeacherStudentsPageProps> = ({ onNavigate }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teacher-portal-advanced/classes`, { headers });
      const data = await res.json();
      if (data?.success) {
        setClasses(data.classes || []);
        const saved = localStorage.getItem('teacher_selected_class_id');
        const firstId = (data.classes || [])[0]?.id;
        const initial = saved || (firstId ? String(firstId) : '');
        setSelectedClassId(initial);
      } else {
        setClasses([]);
        setSelectedClassId('');
      }
    } catch (e) {
      console.error('Failed to load classes', e);
      setClasses([]);
      setSelectedClassId('');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (classId: string) => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teacher-portal-advanced/classes/${classId}/students`, { headers });
      const data = await res.json();
      if (data?.success) {
        setStudents(data.students || []);
      } else {
        setStudents([]);
      }
    } catch (e) {
      console.error('Failed to load students', e);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      localStorage.setItem('teacher_selected_class_id', selectedClassId);
      loadStudents(selectedClassId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      String(s.full_name || '').toLowerCase().includes(q) ||
      String(s.student_id || s.student_code || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="students" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              Abanyeshuri b'Ibyiciro byanjye
            </h1>
            <p className="text-gray-600 font-semibold">Real data from your assigned classes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadClasses} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => onNavigate('attendance')} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              Attendance
            </Button>
            <Button onClick={() => onNavigate('gradebook')} variant="outline">
              Gradebook
            </Button>
          </div>
        </div>

        <Card className="border-2 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-600" />
              Select Class
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="Hitamo ikilasi..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.class_name || c.class_code} {c.subject_name ? `- ${c.subject_name}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-72">
              <Input placeholder="Shakisha..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-2" />
            </div>
            <div className="flex gap-2">
              <Badge className="bg-blue-100 text-blue-700">{filtered.length} students</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500">No students found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-green-50">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Student ID</th>
                      <th className="text-left p-3">Avg Marks</th>
                      <th className="text-left p-3">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => (
                      <tr key={idx} className="border-b hover:bg-green-50/40">
                        <td className="p-3 font-semibold">{s.full_name || `${s.first_name || ''} ${s.last_name || ''}`.trim()}</td>
                        <td className="p-3 font-mono text-sm">{s.student_id || s.student_code}</td>
                        <td className="p-3">{s.average_marks ?? '-'}</td>
                        <td className="p-3">
                          <Badge className="bg-green-100 text-green-700">{s.attendance_rate ?? 0}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherStudentsPage;

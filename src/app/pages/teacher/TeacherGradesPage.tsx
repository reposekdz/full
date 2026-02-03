import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Eye, Edit, Filter, RefreshCw, Download } from 'lucide-react';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import apiService from '@/app/services/apiService';

interface TeacherGradesPageProps {
  onNavigate: (page: string) => void;
}

const TeacherGradesPage: React.FC<TeacherGradesPageProps> = ({ onNavigate }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) fetchGrades(selectedClassId);
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTeacherClasses();
      if (res.success) {
        setClasses(res.classes || []);
        if ((res.classes || []).length > 0) {
          setSelectedClassId((res.classes || [])[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async (classId: number) => {
    try {
      setLoading(true);
      const res = await apiService.request(`/teacher-portal-advanced/grades/class/${classId}`);
      if (res.success) {
        setGrades(res.marks || []);
        setStats(res.statistics || null);
      }
    } catch (err) {
      console.error('Failed to fetch grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = grades.filter((g) => {
    const q = searchQuery.toLowerCase();
    return (
      (g.student_name || '').toLowerCase().includes(q) ||
      (g.student_code || '').toLowerCase().includes(q) ||
      (g.subject_code || '').toLowerCase().includes(q) ||
      (g.subject_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="gradebook" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
            Gutanga Amanota
          </h1>
          <div className="flex space-x-2">
            <Button onClick={() => selectedClassId && fetchGrades(selectedClassId)} variant="outline" disabled={loading || !selectedClassId}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Kuvugurura
            </Button>
            <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
              <Download className="h-4 w-4 mr-2" />
              Raporo
            </Button>
          </div>
        </div>

        <Card className="border-2 border-yellow-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Amanota (Class)</CardTitle>
              <div className="flex space-x-2">
                <select
                  value={selectedClassId ?? ''}
                  onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
                  className="h-10 px-3 border-2 border-yellow-200 rounded-md bg-white text-sm font-bold"
                >
                  <option value="">Hitamo ikilasi</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.class_name || c.class_code || `Class ${c.id}`}{c.subject_name ? ` - ${c.subject_name}` : ''}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Shakisha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Mugaragaza
                </Button>
              </div>
            </div>
            {stats && (
              <div className="mt-3 text-sm text-gray-600 font-semibold">
                Abanyeshuri: {stats.total_students || 0} • Average: {stats.average_marks || 0} • Pass rate: {stats.pass_rate || 0}%
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-yellow-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-yellow-200">
                      <th className="text-left p-3 font-bold text-gray-700">Umunyeshuri</th>
                      <th className="text-left p-3 font-bold text-gray-700">Code</th>
                      <th className="text-left p-3 font-bold text-gray-700">Isomo</th>
                      <th className="text-left p-3 font-bold text-gray-700">Quiz</th>
                      <th className="text-left p-3 font-bold text-gray-700">Mid</th>
                      <th className="text-left p-3 font-bold text-gray-700">Final</th>
                      <th className="text-left p-3 font-bold text-gray-700">Ibikorwa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.map((grade, index) => (
                      <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50">
                        <td className="p-3 font-medium">{grade.student_name}</td>
                        <td className="p-3"><Badge variant="outline">{grade.student_code}</Badge></td>
                        <td className="p-3 text-sm">{grade.subject_name || grade.subject_code}</td>
                        <td className="p-3 font-bold">{grade.quiz_marks ?? '-'}</td>
                        <td className="p-3 font-bold">{grade.midterm_marks ?? '-'}</td>
                        <td className="p-3 font-bold">
                          <span className={`text-lg ${
                            (grade.final_marks ?? 0) >= 85 ? 'text-green-600' :
                            (grade.final_marks ?? 0) >= 70 ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {grade.final_marks ?? '-'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
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

export default TeacherGradesPage;

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
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTeacherRecentGrades();
      if (res.success) {
        setGrades(res.grades || []);
      }
    } catch (err) {
      console.error('Failed to fetch grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = grades.filter(g =>
    g.student?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.class?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="gradebook" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
            Gutanga Amanota
          </h1>
          <div className="flex space-x-2">
            <Button onClick={fetchGrades} variant="outline" disabled={loading}>
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
              <CardTitle>Amanota Yatanzwe</CardTitle>
              <div className="flex space-x-2">
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
                      <th className="text-left p-3 font-bold text-gray-700">Icyiciro</th>
                      <th className="text-left p-3 font-bold text-gray-700">Ikibazo</th>
                      <th className="text-left p-3 font-bold text-gray-700">Amanota</th>
                      <th className="text-left p-3 font-bold text-gray-700">Itariki</th>
                      <th className="text-left p-3 font-bold text-gray-700">Uko bimeze</th>
                      <th className="text-left p-3 font-bold text-gray-700">Ibikorwa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.map((grade, index) => (
                      <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50">
                        <td className="p-3 font-medium">{grade.student}</td>
                        <td className="p-3">
                          <Badge variant="outline">{grade.class}</Badge>
                        </td>
                        <td className="p-3 text-sm">{grade.assignment}</td>
                        <td className="p-3">
                          <span className={`font-bold text-lg ${
                            grade.grade >= 85 ? 'text-green-600' :
                            grade.grade >= 70 ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {grade.grade}%
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{grade.date}</td>
                        <td className="p-3">
                          <Badge className={
                            grade.status === 'excellent' ? 'bg-green-100 text-green-700' :
                            grade.status === 'good' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }>
                            {grade.status === 'excellent' ? 'Byiza Cyane' :
                             grade.status === 'good' ? 'Byiza' : 'Birakenewe'}
                          </Badge>
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

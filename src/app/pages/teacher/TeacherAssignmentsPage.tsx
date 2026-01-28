import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Plus, Eye, Edit, Award, Calendar, Users, CheckCircle2, RefreshCw, ClipboardList } from 'lucide-react';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import apiService from '@/app/services/apiService';
import { useAuth } from '@/app/contexts/AuthContext';

interface TeacherAssignmentsPageProps {
  onNavigate: (page: string) => void;
}

const TeacherAssignmentsPage: React.FC<TeacherAssignmentsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const res = await apiService.getAssignmentsByTeacher(user.id);
        if (Array.isArray(res)) {
          setAssignments(res);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="assignments" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
            Ibizamini Byanjye
          </h1>
          <div className="flex space-x-2">
            <Button onClick={fetchAssignments} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Kuvugurura
            </Button>
            <Button 
              className="bg-gradient-to-r from-yellow-500 to-green-500 text-white"
              onClick={() => onNavigate('teacher-create-assignment')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ikizamini Rishya
            </Button>
          </div>
        </div>

        <Card className="border-2 border-yellow-200">
          <CardHeader>
            <CardTitle>Gucunga no gutanga ibizamini bishya</CardTitle>
            <CardDescription>Reba no gucunga ibizamini byose watanze</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-yellow-600" />
              </div>
            ) : assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment, index) => (
                  <Card key={index} className="border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                              {assignment.class_name}
                            </Badge>
                            <Badge variant="outline">{assignment.course_name}</Badge>
                            <Badge className={assignment.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {assignment.is_published ? 'Byashyizwe hanze' : 'Draft'}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">{assignment.title}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Amanota yose</p>
                          <p className="text-xl font-black text-yellow-600">{assignment.total_marks}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Itariki ntarengwa: {new Date(assignment.due_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{assignment.submission_count} Batanze</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{assignment.graded_count} Byakosowe</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-2" />
                          Reba
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-2" />
                          Kosora
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-green-600 hover:text-green-700"
                          onClick={() => onNavigate('teacher-grading')}
                        >
                          <Award className="h-3 w-3 mr-2" />
                          Tanga Amanota
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-yellow-200 rounded-xl">
                <ClipboardList className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                <p className="text-gray-500">Nta bizamini urashyiraho</p>
                <Button 
                  className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => onNavigate('teacher-create-assignment')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tanga Ikizamini cya Mbere
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherAssignmentsPage;

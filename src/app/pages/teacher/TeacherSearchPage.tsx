import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Search, Users, BookOpen, Award, Eye } from 'lucide-react';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import apiService from '@/app/services/apiService';

interface TeacherSearchPageProps {
  onNavigate: (page: string) => void;
}

const TeacherSearchPage: React.FC<TeacherSearchPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>({ students: [], classes: [], assignments: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults({ students: [], classes: [], assignments: [] });
    }
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const [classesRes, assignmentsRes] = await Promise.all([
        apiService.getTeacherClasses(),
        apiService.getAssignmentsByTeacher(JSON.parse(localStorage.getItem('user') || '{}').id)
      ]);

      const classes = classesRes.success ? classesRes.classes.filter((c: any) => 
        c.class_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.course_name?.toLowerCase().includes(searchQuery.toLowerCase())
      ) : [];

      const assignments = Array.isArray(assignmentsRes) ? assignmentsRes.filter((a: any) =>
        a.title?.toLowerCase().includes(searchQuery.toLowerCase())
      ) : [];

      setSearchResults({ students: [], classes, assignments });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="search" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-6">
          Shakisha
        </h1>
        <Card className="border-2 border-yellow-200 mb-6">
          <CardHeader>
            <CardTitle>Shakisha Abanyeshuri, Amaklasi, n'Ibizamini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Andika hano..."  
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {searchQuery.length > 2 && (
          <div className="space-y-6">
            {searchResults.classes.length > 0 && (
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-yellow-600" />
                    Amaklasi ({searchResults.classes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchResults.classes.map((cls: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900">{cls.class_name} - {cls.course_name}</h4>
                            <p className="text-sm text-gray-600">{cls.student_count} Abanyeshuri</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Reba
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchResults.assignments.length > 0 && (
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-600" />
                    Ibizamini ({searchResults.assignments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchResults.assignments.map((assignment: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900">{assignment.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                                {assignment.class_name}
                              </Badge>
                              <span className="text-sm text-gray-600">{assignment.submission_count} Batanze</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Reba
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchResults.classes.length === 0 && searchResults.assignments.length === 0 && !loading && (
              <Card className="border-2 border-yellow-200">
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nta bisubizo byabonetse</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {searchQuery.length <= 2 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Andika byibuze inyuguti 3 kugira ngo ushakishe</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSearchPage;

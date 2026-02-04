import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { BookOpen, Users, Eye, Edit } from 'lucide-react';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import apiService from '@/app/services/apiService';

interface TeacherClassesPageProps {
  onNavigate: (page: string) => void;
}

const TeacherClassesPage: React.FC<TeacherClassesPageProps> = ({ onNavigate }) => {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    apiService.getTeacherClasses().then(res => {
      if (res.success) setClasses(res.classes);
    });
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="classes" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-6">
          Amaklasi Yanjye
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, index) => (
            <Card key={index} className="border-2 border-yellow-200 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-green-500 mb-4">
                  <h3 className="text-lg font-black text-white">{cls.class_name || cls.class_code} - {cls.subject_name || cls.course_name}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Abanyeshuri:</span>
                    <Badge variant="outline">{cls.student_count || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Kwitabira:</span>
                    <Badge className="bg-green-100 text-green-700">{Math.round(cls.avg_attendance || cls.attendance_rate || 0)}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Impera:</span>
                    <Badge className="bg-blue-100 text-blue-700">{Math.round(cls.average_marks || cls.average_grade || 0)}%</Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-yellow-200 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      localStorage.setItem('teacher_selected_class_id', String(cls.id));
                      onNavigate('students');
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Reba
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      localStorage.setItem('teacher_selected_class_id', String(cls.id));
                      onNavigate('attendance');
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherClassesPage;

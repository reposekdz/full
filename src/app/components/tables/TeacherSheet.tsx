import React from 'react';
import { GlobalStudentSheet } from './GlobalStudentSheet';
import { GraduationCap, Users, BookOpen, TrendingUp } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

interface TeacherSheetProps {
  students: any[];
}

export const TeacherSheet: React.FC<TeacherSheetProps> = ({ students }) => {
  const totalStudents = students.length;
  const avgPerformance = (students.reduce((sum, s) => sum + s.academicPerformance, 0) / students.length).toFixed(1);
  const avgAttendance = (students.reduce((sum, s) => sum + s.attendance, 0) / students.length).toFixed(1);
  const activeStudents = students.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-green-700">{activeStudents}</p>
            </div>
            <GraduationCap className="w-10 h-10 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-700">{avgPerformance}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-orange-700">{avgAttendance}%</p>
            </div>
            <BookOpen className="w-10 h-10 text-orange-600" />
          </div>
        </Card>
      </div>
      
      <GlobalStudentSheet role="teacher" students={students} />
    </div>
  );
};

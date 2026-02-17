import React from 'react';
import { GlobalStudentSheet } from './GlobalStudentSheet';
import { BookOpen, TrendingUp, Award, Target } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

interface DOSSheetProps {
  students: any[];
}

export const DOSSheet: React.FC<DOSSheetProps> = ({ students }) => {
  const avgPerformance = (students.reduce((sum, s) => sum + s.academicPerformance, 0) / students.length).toFixed(1);
  const topPerformers = students.filter(s => s.academicPerformance >= 80).length;
  const needsSupport = students.filter(s => s.academicPerformance < 50).length;
  const avgAttendance = (students.reduce((sum, s) => sum + s.attendance, 0) / students.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-700">{avgPerformance}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Performers</p>
              <p className="text-2xl font-bold text-green-700">{topPerformers}</p>
            </div>
            <Award className="w-10 h-10 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Needs Support</p>
              <p className="text-2xl font-bold text-red-700">{needsSupport}</p>
            </div>
            <Target className="w-10 h-10 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-blue-700">{avgAttendance}%</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
        </Card>
      </div>
      
      <GlobalStudentSheet role="dos" students={students} />
    </div>
  );
};

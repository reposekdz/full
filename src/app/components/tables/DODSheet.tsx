import React from 'react';
import { GlobalStudentSheet } from './GlobalStudentSheet';
import { Shield, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

interface DODSheetProps {
  students: any[];
}

export const DODSheet: React.FC<DODSheetProps> = ({ students }) => {
  const excellentBehavior = students.filter(s => s.behavior === 'excellent').length;
  const goodBehavior = students.filter(s => s.behavior === 'good').length;
  const poorBehavior = students.filter(s => s.behavior === 'poor').length;
  const avgAttendance = (students.reduce((sum, s) => sum + s.attendance, 0) / students.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Excellent Behavior</p>
              <p className="text-2xl font-bold text-green-700">{excellentBehavior}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Good Behavior</p>
              <p className="text-2xl font-bold text-yellow-700">{goodBehavior}</p>
            </div>
            <Shield className="w-10 h-10 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Poor Behavior</p>
              <p className="text-2xl font-bold text-red-700">{poorBehavior}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-blue-700">{avgAttendance}%</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </Card>
      </div>
      
      <GlobalStudentSheet role="dod" students={students} />
    </div>
  );
};

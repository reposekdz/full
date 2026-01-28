import React from 'react';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import ClassLevelSheetsDashboard from '@/app/components/admin/ClassLevelSheetsDashboard';
import { useAuth } from '@/app/contexts/AuthContext';

interface TeacherStudentsPageProps {
  onNavigate: (page: string) => void;
}

const TeacherStudentsPage: React.FC<TeacherStudentsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="students" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto">
        <ClassLevelSheetsDashboard userRole="teacher" userId={user?.id || 1} />
      </div>
    </div>
  );
};

export default TeacherStudentsPage;

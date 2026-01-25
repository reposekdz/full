import React from 'react';
import LeftSidebar from '@/app/components/LeftSidebar';
import UniversalStudentManagement from '@/app/components/UniversalStudentManagement';

interface StudentsManagementPageProps {
  onNavigate: (page: string) => void;
}

const StudentsManagementPage: React.FC<StudentsManagementPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
      <LeftSidebar currentPage="students-management" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <UniversalStudentManagement />
      </div>
    </div>
  );
};

export default StudentsManagementPage;

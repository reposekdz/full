import React from 'react';
import LeftSidebar from '@/app/components/LeftSidebar';
import AdminArticleManagement from '@/app/components/AdminArticleManagement';

interface AdminArticleManagementPageProps {
  onNavigate: (page: string) => void;
}

const AdminArticleManagementPage: React.FC<AdminArticleManagementPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <LeftSidebar currentPage="admin-articles" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto">
        <AdminArticleManagement />
      </div>
    </div>
  );
};

export default AdminArticleManagementPage;

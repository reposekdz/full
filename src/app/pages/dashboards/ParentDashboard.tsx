import React, { useState } from 'react';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import ParentDashboardPage from '../parent/ParentDashboardPage';

interface ParentDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');

  const handleNavigation = (page: string) => {
    setCurrentView(page);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      <AdvancedLeftSidebar currentPage={currentView} onNavigate={handleNavigation} onLogout={onLogout} />
      <div className="flex-1 overflow-auto">
        <ParentDashboardPage />
      </div>
    </div>
  );
};

export default ParentDashboard;

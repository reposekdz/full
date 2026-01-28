import React, { useState } from 'react';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import ParentDashboardPage from '../parent/ParentDashboardPage';
import ParentProfile from '../parent/ParentProfile';
import ParentChildren from '../parent/ParentChildren';
import ParentGrades from '../parent/ParentGrades';
import ParentAttendance from '../parent/ParentAttendance';
import ParentFinance from '../parent/ParentFinance';
import ParentMessages from '../parent/ParentMessages';
import ParentEvents from '../parent/ParentEvents';
import ParentReports from '../parent/ParentReports';
import ContactAdminForm from '../parent/ContactAdminForm';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';

interface ParentDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');

  const handleNavigation = (page: string) => {
    setCurrentView(page);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <ParentDashboardPage />;
      case 'profile':
        return <ParentProfile />;
      case 'children':
        return <ParentChildren />;
      case 'grades':
        return <ParentGrades />;
      case 'attendance':
        return <ParentAttendance />;
      case 'fees':
        return <ParentFinance />;
      case 'communication':
        return <ParentMessages />;
      case 'events':
        return <ParentEvents />;
      case 'reports':
        return <ParentReports />;
      case 'contact-admin':
        return <ContactAdminForm />;
      default:
        return <ParentDashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      <UniversalMessagingWidget />
      <AdvancedLeftSidebar currentPage={currentView} onNavigate={handleNavigation} onLogout={onLogout} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ParentDashboard;

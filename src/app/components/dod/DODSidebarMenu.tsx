import React, { useState } from 'react';
import { Home, User, FileText, Calendar, Users, BarChart3, Scale, Mail, FileSpreadsheet, Menu, X } from 'lucide-react';

interface DODSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const DODSidebar: React.FC<DODSidebarProps> = ({ activePage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home },
    { id: 'dod-profile', label: 'Profil', Icon: User },
    { id: 'dod-discipline', label: 'Amakosa', Icon: FileText },
    { id: 'dod-exams', label: 'Ibizamini', Icon: Calendar },
    { id: 'dod-students', label: 'Abanyeshuri', Icon: Users },
    { id: 'dod-reports', label: 'Raporo', Icon: BarChart3 },
    { id: 'dod-punishments', label: 'Ibihano', Icon: Scale },
    { id: 'dod-parent-notifications', label: 'Ababyeyi', Icon: Mail },
    { id: 'dod-student-sheets', label: 'Imbonerahamwe', Icon: FileSpreadsheet }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mt-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out mt-16`}>
        <div className="h-full bg-gradient-to-b from-green-600 via-yellow-500 to-green-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activePage === item.id
                    ? 'bg-white text-green-700 shadow-lg scale-105 font-bold'
                    : 'text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default DODSidebar;

import React from 'react';
import { Home, FileText, Calendar, Users, TrendingUp, Shield, Bell, User, Menu, X } from 'lucide-react';

interface DODSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const DODSidebar: React.FC<DODSidebarProps> = ({ currentPage, onNavigate, isOpen, onToggle }) => {
  const menuItems = [
    { id: 'director-discipline-dashboard', label: 'Dashboard', icon: Home, gradient: 'from-green-400 to-yellow-400' },
    { id: 'dod-profile', label: 'Profil', icon: User, gradient: 'from-green-500 to-yellow-500' },
    { id: 'dod-discipline', label: 'Amakosa', icon: FileText, gradient: 'from-red-500 to-orange-500' },
    { id: 'dod-exams', label: 'Ibizamini', icon: Calendar, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'dod-students', label: 'Abanyeshuri', icon: Users, gradient: 'from-green-500 to-teal-500' },
    { id: 'dod-reports', label: 'Raporo', icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' },
    { id: 'dod-punishments', label: 'Ibihano', icon: Shield, gradient: 'from-orange-500 to-red-500' },
    { id: 'dod-parent-notifications', label: 'Ababyeyi', icon: Bell, gradient: 'from-teal-500 to-green-500' }
  ];

  return (
    <>
      <button onClick={onToggle} className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-gradient-to-br from-green-500 to-yellow-500 text-white rounded-xl shadow-lg">
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-green-50 via-yellow-50 to-green-50 shadow-2xl transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 overflow-y-auto`}>
        <div className="p-4">
          <div className="mb-6 p-4 bg-gradient-to-br from-green-500 to-yellow-500 rounded-xl text-white">
            <h2 className="text-xl font-bold">Ubuyobozi</h2>
            <p className="text-sm text-green-100">Umuyobozi w'Indero</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                      : 'bg-white hover:bg-gradient-to-r hover:from-green-100 hover:to-yellow-100 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 p-4 bg-gradient-to-br from-yellow-100 to-green-100 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-2">Amakuru</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Amakosa:</span>
                <span className="font-bold text-red-600">12</span>
              </div>
              <div className="flex justify-between">
                <span>Ibizamini:</span>
                <span className="font-bold text-blue-600">5</span>
              </div>
              <div className="flex justify-between">
                <span>Abanyeshuri:</span>
                <span className="font-bold text-green-600">450</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onToggle} />}
    </>
  );
};

export default DODSidebar;

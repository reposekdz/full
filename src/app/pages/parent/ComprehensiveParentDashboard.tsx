import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, User, Search, Menu as MenuIcon, Users, GraduationCap, Calendar, DollarSign, MessageSquare, PartyPopper, FileText, Bell, LogOut, X, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import ParentDashboardHome from './ParentDashboardHome';
import ParentProfile from './ParentProfile';
import ParentSearch from './ParentSearch';
import ParentChildren from './ParentChildren';
import ParentGrades from './ParentGrades';
import ParentAttendance from './ParentAttendance';
import ParentFinance from './ParentFinance';
import ParentCommunication from './ParentCommunication';
import ParentEvents from './ParentEvents';
import ParentReports from './ParentReports';

const ComprehensiveParentDashboard: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [parentData, setParentData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchParentData();
    fetchNotifications();
  }, []);

  const fetchParentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        const user = JSON.parse(userStr);
        setParentData(user);
      }
      
      if (token) {
        const response = await fetch('http://localhost:5000/api/parent-dashboard/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setParentData(prev => ({ ...prev, ...data.parent }));
      }
    } catch (error) {
      console.error('Error fetching parent data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, label_rw: 'Dashboard' },
    { id: 'profile', label: 'Profile', icon: User, label_rw: 'Profil' },
    { id: 'search', label: 'Search', icon: Search, label_rw: 'Shakisha' },
    { id: 'menu', label: 'Menu', icon: MenuIcon, label_rw: 'Amamenyo' },
    { id: 'children', label: 'Children', icon: Users, label_rw: 'Abana' },
    { id: 'grades', label: 'Grades', icon: GraduationCap, label_rw: 'Amanota' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, label_rw: 'Kwitabira' },
    { id: 'finance', label: 'Finance', icon: DollarSign, label_rw: 'Amafaranga' },
    { id: 'communication', label: 'Communication', icon: MessageSquare, label_rw: 'Itumanaho' },
    { id: 'events', label: 'Events', icon: PartyPopper, label_rw: 'Ibirori' },
    { id: 'reports', label: 'Reports', icon: FileText, label_rw: 'Raporo' }
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <ParentDashboardHome />;
      case 'profile': return <ParentProfile />;
      case 'search': return <ParentSearch />;
      case 'menu': return <ParentDashboardHome />;
      case 'children': return <ParentChildren />;
      case 'grades': return <ParentGrades />;
      case 'attendance': return <ParentAttendance />;
      case 'finance': return <ParentFinance />;
      case 'communication': return <ParentCommunication />;
      case 'events': return <ParentEvents />;
      case 'reports': return <ParentReports />;
      default: return <ParentDashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="w-72 bg-gradient-to-b from-yellow-600 to-green-600 text-white shadow-2xl fixed h-full z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black">Ubuyobozi</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  activePage === item.id
                    ? 'bg-white text-yellow-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-semibold">{item.label_rw}</span>
                {activePage === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur">
            <h3 className="font-bold mb-2">Ibikorwa Byihuse</h3>
            <p className="text-sm text-white/80">Ibikorwa Bya Vuba</p>
          </div>

          <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur">
            <h3 className="font-bold mb-2">Uko Sisiteme Imeze</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-sm">Byose birakora neza</p>
            </div>
            <p className="text-xs text-white/70 mt-1">Birakora</p>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-0'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                  <MenuIcon className="w-5 h-5" />
                </Button>
              )}
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(m => m.id === activePage)?.label_rw || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {parentData?.first_name && parentData?.last_name 
                      ? `${parentData.first_name} ${parentData.last_name}`
                      : parentData?.username || 'Parent'}
                  </p>
                  <p className="text-xs text-gray-500">Umubyeyi</p>
                </div>
                {parentData?.profile_image ? (
                  <img 
                    src={`http://localhost:5000${parentData.profile_image}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold">
                    {parentData?.first_name?.charAt(0) || parentData?.username?.charAt(0) || 'P'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default ComprehensiveParentDashboard;

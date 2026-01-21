import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Trophy, 
  Users, 
  Bell, 
  Clock, 
  FileText,
  TrendingUp,
  Target,
  Activity,
  ChevronRight,
  ChevronDown,
  Briefcase,
  DollarSign,
  BarChart3,
  ClipboardList,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { useAuth } from '@/app/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface LeftSidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ currentPage, onNavigate, onLogout }) => {
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['quick-links']);

  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const quickLinks = [
    { key: 'home', icon: Home, label: 'Ahabanza', color: 'from-yellow-500 to-amber-500' },
    { key: 'academics', icon: BookOpen, label: 'Amasomo', color: 'from-green-500 to-teal-500' },
    { key: 'sports', icon: Trophy, label: 'Siporo', color: 'from-orange-500 to-red-500' },
    { key: 'teams', icon: Users, label: 'Amatsinda', color: 'from-blue-500 to-indigo-500' },
  ];

  const recentActivities = [
    { title: 'Ikiganiro gishya', time: '2 amasaha ashize', icon: Bell, color: 'text-yellow-600' },
    { title: 'Ikizamini cyavuye', time: '5 amasaha ashize', icon: FileText, color: 'text-green-600' },
    { title: 'Ibirori bya siporo', time: 'Ejo', icon: Trophy, color: 'text-orange-600' },
    { title: 'Inyandiko nshya', time: 'Iminsi 2 ishize', icon: BookOpen, color: 'text-blue-600' },
  ];

  const upcomingEvents = [
    { title: 'Ikizamini cya Math', date: 'Jan 25', color: 'bg-yellow-500' },
    { title: 'Umukino wa Basketball', date: 'Jan 26', color: 'bg-green-500' },
    { title: 'Inama y\'Ababyeyi', date: 'Jan 28', color: 'bg-orange-500' },
  ];

  const quickStats = user ? [
    { label: 'Amanota', value: '85%', icon: TrendingUp, color: 'from-green-500 to-teal-500' },
    { label: 'Kwitabira', value: '95%', icon: Target, color: 'from-yellow-500 to-orange-500' },
    { label: 'Ibikorwa', value: '12', icon: Activity, color: 'from-blue-500 to-indigo-500' },
  ] : [];

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:block w-80 bg-gradient-to-b from-white to-yellow-50/30 border-r-2 border-yellow-200 h-full overflow-hidden"
    >
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* User Profile Card */}
          {user && (
            <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-50 to-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-14 w-14 border-2 border-yellow-400">
                    <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-xl font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
                    <Badge className="mt-1 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          {user && quickStats.length > 0 && (
            <Card className="border-2 border-yellow-200 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-gray-700">Imibare Yihuse</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('stats')}
                    className="h-6 w-6 p-0"
                  >
                    {expandedSections.includes('stats') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes('stats') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent className="space-y-2 pb-4">
                      {quickStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white`}
                          >
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{stat.label}</span>
                            </div>
                            <span className="text-lg font-bold">{stat.value}</span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* Quick Links */}
          <Card className="border-2 border-yellow-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-700">Amahuza Yihuse</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('quick-links')}
                  className="h-6 w-6 p-0"
                >
                  {expandedSections.includes('quick-links') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedSections.includes('quick-links') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-2 pb-4">
                    {quickLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Button
                          key={link.key}
                          variant="ghost"
                          onClick={() => onNavigate && onNavigate(link.key)}
                          className={`w-full justify-start h-11 ${
                            currentPage === link.key
                              ? 'bg-gradient-to-r from-yellow-100 to-green-100 text-yellow-700 border-l-4 border-yellow-500'
                              : 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50'
                          }`}
                        >
                          <div className={`p-2 rounded-md bg-gradient-to-br ${link.color} mr-3`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium">{link.label}</span>
                        </Button>
                      );
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-2 border-yellow-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-700">Ibirori Bizaza</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('events')}
                  className="h-6 w-6 p-0"
                >
                  {expandedSections.includes('events') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedSections.includes('events') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-3 pb-4">
                    {upcomingEvents.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-yellow-50 cursor-pointer transition-colors"
                      >
                        <div className={`w-12 h-12 ${event.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.date}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Recent Activities */}
          <Card className="border-2 border-yellow-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-700">Ibikorwa Bya Vuba</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('activities')}
                  className="h-6 w-6 p-0"
                >
                  {expandedSections.includes('activities') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedSections.includes('activities') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-3 pb-4">
                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <Icon className={`h-4 w-4 mt-0.5 ${activity.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500 flex items-center mt-0.5">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Quick Actions */}
          {user && (
            <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-500 to-green-500">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-white mb-3">Ibikorwa Byihuse</h3>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/30"
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Kora Raporo
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/30"
                    size="sm"
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Reba Amanota
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logout Button */}
          {user && (
            <Button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-2 border-red-200 shadow-lg"
              size="lg"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sohoka
            </Button>
          )}
        </div>
      </ScrollArea>
    </motion.aside>
  );
};

export default LeftSidebar;

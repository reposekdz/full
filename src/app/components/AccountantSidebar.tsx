import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, DollarSign, Receipt, CreditCard, TrendingUp, FileText, Users, Package, BarChart3, Calendar, ChevronRight, ChevronDown, LogOut, Wallet, PieChart, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useAuth } from '@/app/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface AccountantSidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const AccountantSidebar: React.FC<AccountantSidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['financial-links']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const financialLinks = [
    { key: 'dashboard-accountant', icon: Home, label: 'Dashboard', color: 'from-emerald-500 to-teal-500' },
    { key: 'student-payments-management', icon: Users, label: 'Kwishyura kw\'Abanyeshuri', color: 'from-blue-500 to-indigo-500' },
    { key: 'payments-management', icon: DollarSign, label: 'Kwishyura', color: 'from-green-500 to-emerald-500' },
    { key: 'invoices-management', icon: Receipt, label: 'Inyemezabuguzi', color: 'from-blue-500 to-cyan-500' },
    { key: 'expenses-management', icon: CreditCard, label: 'Amafaranga Yakoreshejwe', color: 'from-orange-500 to-amber-500' },
    { key: 'budgets-management', icon: Wallet, label: 'Ingengo y\'Imari', color: 'from-purple-500 to-pink-500' },
    { key: 'salaries-management', icon: Users, label: 'Imishahara', color: 'from-indigo-500 to-blue-500' },
    { key: 'transactions-management', icon: ArrowUpDown, label: 'Ibyavuye n\'Ibyinjiye', color: 'from-red-500 to-orange-500' },
    { key: 'financial-reports', icon: BarChart3, label: 'Raporo z\'Imari', color: 'from-teal-500 to-green-500' },
    { key: 'timetable-view', icon: Calendar, label: 'Gahunda y\'Amasomo', color: 'from-cyan-500 to-blue-500' },
    { key: 'students-management', icon: Package, label: 'Gucunga Abanyeshuri', color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <motion.aside initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="hidden lg:block w-80 bg-gradient-to-b from-white to-emerald-50/30 border-r-2 border-emerald-200 h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {user && (
            <Card className="border-2 border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-14 w-14 border-2 border-emerald-400">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xl font-bold">
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{user?.name || 'Accountant'}</p>
                    <p className="text-xs text-gray-600">Umubare w'Imari</p>
                    <Badge className="mt-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xs">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-emerald-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-700">Imicungire y'Imari</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => toggleSection('financial-links')} className="h-6 w-6 p-0">
                  {expandedSections.includes('financial-links') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedSections.includes('financial-links') && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <CardContent className="space-y-2 pb-4">
                    {financialLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Button key={link.key} variant="ghost" onClick={() => onNavigate && onNavigate(link.key)}
                          className={`w-full justify-start h-11 ${currentPage === link.key ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-l-4 border-emerald-500' : 'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50'}`}>
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

          <Button onClick={logout} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white" size="lg">
            <LogOut className="h-5 w-5 mr-2" />
            Sohoka
          </Button>
        </div>
      </ScrollArea>
    </motion.aside>
  );
};

export default AccountantSidebar;

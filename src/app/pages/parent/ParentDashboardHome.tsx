import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

const ParentDashboardHome: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parent-dashboard/overview', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setChildren(data.children || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const statCards = [
    { label: 'Abana', value: children.length, icon: Users, color: 'blue' },
    { label: 'Ikigereranyo', value: stats?.average_grade || 'N/A', icon: GraduationCap, color: 'green' },
    { label: 'Kwitabira', value: `${stats?.attendance_rate || 0}%`, icon: Calendar, color: 'yellow' },
    { label: 'Amafaranga', value: `${stats?.pending_fees || 0} RWF`, icon: DollarSign, color: 'red' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abana Bawe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {children.map((child, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold">
                    {child.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{child.name}</p>
                    <p className="text-sm text-gray-600">{child.class_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{child.average_grade || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Ikigereranyo</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentDashboardHome;

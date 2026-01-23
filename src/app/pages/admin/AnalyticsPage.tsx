import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Users, BookOpen, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState({ students: 0, teachers: 0, parents: 0, courses: 0 });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const stats = [
    { title: 'Abanyeshuri / Students', value: analytics.students, icon: Users, color: 'from-blue-500 to-blue-600', change: '+12%' },
    { title: 'Abarimu / Teachers', value: analytics.teachers, icon: Users, color: 'from-green-500 to-green-600', change: '+5%' },
    { title: 'Ababyeyi / Parents', value: analytics.parents, icon: Users, color: 'from-purple-500 to-purple-600', change: '+8%' },
    { title: 'Amasomo / Courses', value: analytics.courses, icon: BookOpen, color: 'from-yellow-500 to-yellow-600', change: '+3%' }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <BarChart className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-3xl font-black">Imibare / Analytics</h1>
          <p className="text-gray-600">Reba imibare n'ibarurisho / View statistics and insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl font-black">{stat.value}</p>
                  </div>
                  <stat.icon className="w-10 h-10 opacity-80" />
                </div>
                <div className="text-sm text-white/80">{stat.change} vs last month</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['SOD', 'BDC', 'AUT', 'ELE'].map((trade, idx) => (
              <div key={trade}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{trade}</span>
                  <span className="text-gray-600">{(idx + 1) * 150} students</span>
                </div>
                <Progress value={(idx + 1) * 20} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['Attendance Rate', 'Pass Rate', 'Satisfaction', 'Completion'].map((metric, idx) => (
              <div key={metric}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{metric}</span>
                  <span className="text-gray-600">{88 + idx * 2}%</span>
                </div>
                <Progress value={88 + idx * 2} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;

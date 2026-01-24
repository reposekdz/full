import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, BookOpen, DollarSign, TrendingUp, Calendar, Award, Bell, FileText } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/comprehensive-db';

export default function ComprehensiveDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const [analyticsRes, kpisRes, notifRes, eventsRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/dashboard`, { headers }),
        axios.get(`${API_URL}/analytics/kpis`, { headers }),
        axios.get(`${API_URL}/notifications?limit=5`, { headers }),
        axios.get(`${API_URL}/academic-calendar?upcoming=true&limit=5`, { headers })
      ]);
      
      setAnalytics(analyticsRes.data.dashboard);
      setKpis(kpisRes.data.kpis);
      setNotifications(notifRes.data.notifications || []);
      setEvents(eventsRes.data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-xl">Loading...</div></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Comprehensive Dashboard</h1>
        <Button onClick={fetchAllData}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.students?.total_students || 0}</div>
            <p className="text-sm text-green-600">+{analytics?.students?.active_students || 0} Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4" />
              Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.teachers?.total_teachers || 0}</div>
            <p className="text-sm text-blue-600">{analytics?.teachers?.active_teachers || 0} Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.attendance?.attendance_rate?.toFixed(1) || 0}%</div>
            <p className="text-sm text-gray-600">{analytics?.attendance?.total_records || 0} Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(analytics?.finance?.total_revenue || 0).toLocaleString()}</div>
            <p className="text-sm text-green-600">{analytics?.finance?.payment_count || 0} Payments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-gray-600">{new Date(event.event_date).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{event.event_type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif: any) => (
                <div key={notif.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm">{notif.title}</h4>
                  <p className="text-xs text-gray-600">{notif.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Student Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.student_retention_rate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Teacher-Student Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1:{kpis?.teacher_student_ratio?.toFixed(0) || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.academic?.average_grade?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.fee_collection_rate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

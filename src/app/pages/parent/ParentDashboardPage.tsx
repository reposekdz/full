import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Award, Calendar, DollarSign, Trophy, Shield, Gem, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [academics, setAcademics] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [discipline, setDiscipline] = useState<any>(null);
  const [fees, setFees] = useState<any>(null);
  const [competitions, setCompetitions] = useState<any>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) fetchChildData();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const res = await axios.get(`${API_URL}/parent-dashboard/my-children`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChildren(res.data);
      if (res.data.length > 0) setSelectedChild(res.data[0]);
    } catch (err) { console.error(err); }
  };

  const fetchChildData = async () => {
    try {
      const [dashRes, acadRes, attRes, discRes, feeRes, compRes] = await Promise.all([
        axios.get(`${API_URL}/parent-dashboard/child/${selectedChild.user_id}/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/parent-dashboard/child/${selectedChild.user_id}/academics`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/parent-dashboard/child/${selectedChild.user_id}/attendance`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/parent-dashboard/child/${selectedChild.user_id}/discipline`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/parent-dashboard/child/${selectedChild.user_id}/fees`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/parent-dashboard/child/${selectedChild.user_id}/competitions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setDashboard(dashRes.data);
      setAcademics(acadRes.data);
      setAttendance(attRes.data);
      setDiscipline(discRes.data);
      setFees(feeRes.data);
      setCompetitions(compRes.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Parent Dashboard</h1>
        <div className="flex gap-2">
          {children.map(child => (
            <Button key={child.user_id} variant={selectedChild?.user_id === child.user_id ? 'default' : 'outline'} onClick={() => setSelectedChild(child)}>
              {child.name}
            </Button>
          ))}
        </div>
      </div>

      {dashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Average Marks', value: `${dashboard.average_marks?.toFixed(1)}%`, icon: Award, color: 'from-blue-500 to-blue-600' },
              { title: 'Attendance', value: `${dashboard.attendance_percentage}%`, icon: Calendar, color: 'from-green-500 to-green-600' },
              { title: 'Conduct Score', value: dashboard.conduct_score, icon: Shield, color: 'from-purple-500 to-purple-600' },
              { title: 'Fee Balance', value: `FRw ${dashboard.fee_balance?.toLocaleString()}`, icon: DollarSign, color: 'from-red-500 to-red-600' }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white/80 text-sm">{stat.title}</p>
                          <p className="text-3xl font-black mt-1">{stat.value}</p>
                        </div>
                        <stat.icon className="w-10 h-10 opacity-80" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Medals & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { type: 'Diamond', count: dashboard.medals?.diamond || 0, icon: Gem, color: 'text-cyan-500' },
                  { type: 'Gold', count: dashboard.medals?.gold || 0, icon: Medal, color: 'text-yellow-500' },
                  { type: 'Silver', count: dashboard.medals?.silver || 0, icon: Medal, color: 'text-gray-400' },
                  { type: 'Bronze', count: dashboard.medals?.bronze || 0, icon: Medal, color: 'text-orange-600' }
                ].map((medal, i) => (
                  <div key={i} className="text-center p-4 border rounded-lg">
                    <medal.icon className={`w-12 h-12 mx-auto mb-2 ${medal.color}`} />
                    <p className="text-2xl font-black">{medal.count}</p>
                    <p className="text-sm text-gray-600">{medal.type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="academics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="discipline">Discipline</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="competitions">Competitions</TabsTrigger>
            </TabsList>

            <TabsContent value="academics">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {academics?.summary && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Average Marks</p>
                        <p className="text-3xl font-black text-blue-600">{academics.summary.average_marks?.toFixed(1)}%</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Subjects</p>
                        <p className="text-3xl font-black text-green-600">{academics.summary.total_subjects}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">GPA</p>
                        <p className="text-3xl font-black text-purple-600">{academics.summary.gpa?.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    {academics?.performance?.map((perf: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{perf.subject_name}</p>
                          <p className="text-sm text-gray-600">Term {perf.term}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-lg font-bold">{(perf.quiz_marks + perf.midterm_marks + perf.final_marks).toFixed(1)}/100</p>
                          </div>
                          <Progress value={perf.quiz_marks + perf.midterm_marks + perf.final_marks} className="w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Record</CardTitle>
                </CardHeader>
                <CardContent>
                  {attendance?.summary && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Total Days', value: attendance.summary.total_days, color: 'blue' },
                        { label: 'Present', value: attendance.summary.present_days, color: 'green' },
                        { label: 'Absent', value: attendance.summary.absent_days, color: 'red' },
                        { label: 'Late', value: attendance.summary.late_days, color: 'yellow' }
                      ].map((item, i) => (
                        <div key={i} className={`text-center p-4 bg-${item.color}-50 rounded-lg`}>
                          <p className="text-sm text-gray-600">{item.label}</p>
                          <p className={`text-2xl font-black text-${item.color}-600`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    {attendance?.attendance?.slice(0, 20).map((att: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{new Date(att.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{att.subject_name || 'General'}</p>
                        </div>
                        <Badge className={att.status === 'present' ? 'bg-green-500' : att.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'}>
                          {att.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discipline">
              <Card>
                <CardHeader>
                  <CardTitle>Discipline & Conduct</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Current Conduct Score</p>
                      <p className="text-5xl font-black text-purple-600">{discipline?.conduct_score || 100}</p>
                      <Progress value={discipline?.conduct_score || 100} className="mt-4" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {discipline?.records?.map((rec: any, i: number) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{rec.incident_type}</p>
                            <p className="text-sm text-gray-600">{new Date(rec.incident_date).toLocaleDateString()}</p>
                          </div>
                          <Badge className={rec.severity === 'critical' ? 'bg-red-500' : rec.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}>
                            {rec.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  {fees?.summary && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-6 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="text-3xl font-black text-green-600">FRw {fees.summary.total_paid?.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-6 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600">Balance</p>
                        <p className="text-3xl font-black text-red-600">FRw {fees.summary.total_balance?.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    {fees?.payments?.map((payment: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{payment.fee_type}</p>
                          <p className="text-sm text-gray-600">{new Date(payment.payment_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">FRw {payment.amount_paid?.toLocaleString()}</p>
                          {payment.balance > 0 && <p className="text-sm text-red-600">Balance: FRw {payment.balance?.toLocaleString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitions">
              <Card>
                <CardHeader>
                  <CardTitle>Competitions & Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {competitions?.competitions?.map((comp: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{comp.title}</p>
                          <p className="text-sm text-gray-600">{comp.category_name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {comp.rank && <Badge className="bg-purple-500">Rank #{comp.rank}</Badge>}
                          {comp.medal_earned !== 'none' && (
                            <Badge className={
                              comp.medal_earned === 'diamond' ? 'bg-cyan-500' :
                              comp.medal_earned === 'gold' ? 'bg-yellow-500' :
                              comp.medal_earned === 'silver' ? 'bg-gray-400' : 'bg-orange-600'
                            }>
                              {comp.medal_earned}
                            </Badge>
                          )}
                          <Badge className="bg-green-500">+{comp.points_earned} pts</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

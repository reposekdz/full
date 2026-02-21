import React, { useState, useEffect } from 'react';
import { Users, Phone, MessageSquare, DollarSign, Award, Calendar, Bell, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import ParentLinkingForm from './ParentLinkingForm';

const API_BASE = 'http://localhost:5000/api';

const ModernParentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [stats, setStats] = useState({
    total_children: 0,
    average_grade: 0,
    attendance_rate: 0,
    pending_fees: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Forms
  const [messageForm, setMessageForm] = useState({ recipient_role: 'dos', subject: '', message: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_method: 'momo', phone_number: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch data with error handling
      const responses = await Promise.allSettled([
        fetch(`${API_BASE}/parent-dashboard/profile`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/parent-dashboard/overview`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/parent-dashboard/children`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/parent-dashboard/activity/notifications`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/parent-dashboard/activity/feed?limit=10`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/parent-dashboard/messages`, { headers }).then(r => r.json())
      ]);

      // Extract data safely
      const [profileData, overviewData, childrenData, notifData, activityData, messagesData] = responses.map(
        r => r.status === 'fulfilled' ? r.value : { success: false }
      );

      if (profileData.success) setProfile(profileData.profile);
      if (overviewData.success) {
        setStats(overviewData.overview?.stats || {});
      }
      if (childrenData.success) {
        const childrenList = childrenData.children || [];
        setChildren(childrenList.map(c => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`,
          student_code: c.student_code,
          class_name: `${c.trade_name} - Level ${c.level_number}`,
          trade: c.trade_name,
          level: c.level_number,
          gender: c.gender || 'M',
          average_grade: c.gpa || 0,
          attendance: c.attendance_percentage || 0,
          link_status: 'approved'
        })));
        if (childrenList.length > 0 && !selectedChild) {
          const firstChild = childrenList[0];
          setSelectedChild({
            id: firstChild.id,
            name: `${firstChild.first_name} ${firstChild.last_name}`,
            student_code: firstChild.student_code,
            class_name: `${firstChild.trade_name} - Level ${firstChild.level_number}`,
            trade: firstChild.trade_name,
            level: firstChild.level_number,
            gender: firstChild.gender || 'M',
            average_grade: firstChild.gpa || 0,
            attendance: firstChild.attendance_percentage || 0,
            link_status: 'approved'
          });
          fetchChildDetails(firstChild.id);
        }
      }
      if (notifData.success) setNotifications(notifData.notifications || []);
      if (activityData.success) setActivities(activityData.activities || []);
      if (messagesData.success) setMessages(messagesData.messages || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetails = async (childId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const responses = await Promise.allSettled([
        fetch(`${API_BASE}/parent-dashboard/student/${childId}/conduct`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/parent-dashboard/student/${childId}/fees`, { headers }).then(r => r.json())
      ]);

      const [conductData, feesData] = responses.map(
        r => r.status === 'fulfilled' ? r.value : { success: false }
      );

      setSelectedChild(prev => ({
        ...prev,
        conduct: conductData.success ? conductData.conduct : null,
        conductRecords: conductData.success ? conductData.records : [],
        fees: feesData.success ? feesData.fees : null
      }));
    } catch (error) {
      console.error('Error fetching child details:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-dashboard/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...messageForm, student_id: selectedChild?.id })
      });
      const data = await response.json();
      if (data.success) {
        alert('Message sent successfully!');
        setShowMessageDialog(false);
        setMessageForm({ recipient_role: 'dos', subject: '', message: '' });
        fetchDashboardData();
      }
    } catch (error) {
      alert('Error sending message');
    }
  };

  const handleInitiatePayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-dashboard/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...paymentForm, student_id: selectedChild?.id })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Payment initiated!\n${data.instructions}`);
        setShowPaymentDialog(false);
        fetchDashboardData();
      }
    } catch (error) {
      alert('Error initiating payment');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p>Gukurura amakuru...</p></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ikibanza cy'Umubyeyi
            </h1>
            <p className="text-gray-600 mt-1">Kugenzura abana bawe mu ishuri</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowLinkDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Guhuza Umwana
            </Button>
            <Button variant="outline" className="relative">
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.read_at).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read_at).length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Abana</p>
                  <p className="text-3xl font-bold">{stats.total_children || 0}</p>
                </div>
                <Users className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Amanota</p>
                  <p className="text-3xl font-bold">{stats.average_grade || 0}%</p>
                </div>
                <Award className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Kwitabira</p>
                  <p className="text-3xl font-bold">{stats.attendance_rate || 0}%</p>
                </div>
                <Calendar className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Ideni</p>
                  <p className="text-3xl font-bold">{(stats.pending_fees || 0).toLocaleString()} RWF</p>
                </div>
                <DollarSign className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Children List */}
          <Card className="lg:col-span-1 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Abana Bawe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {children.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nta bana bahuye</p>
                  <Button onClick={() => setShowLinkDialog(true)} className="mt-4" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Guhuza Umwana
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {children.map(child => (
                    <div
                      key={child.id}
                      onClick={() => { setSelectedChild(child); fetchChildDetails(child.id); }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedChild?.id === child.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold">{child.name}</h4>
                          <p className="text-sm text-gray-600">{child.student_code}</p>
                        </div>
                        <Badge variant={child.link_status === 'approved' ? 'default' : 'secondary'}>
                          {child.link_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{child.class_name}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">GPA: {child.average_grade}</Badge>
                        <Badge variant="outline" className="text-xs">{child.attendance}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Child Details */}
          <Card className="lg:col-span-2 shadow-xl">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="overview">Muri Rusange</TabsTrigger>
                <TabsTrigger value="conduct">Imyitwarire</TabsTrigger>
                <TabsTrigger value="fees">Amafaranga</TabsTrigger>
                <TabsTrigger value="messages">Ubutumwa</TabsTrigger>
                <TabsTrigger value="activity">Ibikorwa</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6">
                {selectedChild ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">{selectedChild.name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Ikode</p>
                          <p className="font-semibold">{selectedChild.student_code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Umwuga</p>
                          <p className="font-semibold">{selectedChild.trade}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Urwego</p>
                          <p className="font-semibold">Level {selectedChild.level}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Igitsina</p>
                          <p className="font-semibold">{selectedChild.gender === 'M' ? 'Gabo' : 'Gore'}</p>
                        </div>
                      </div>
                    </div>

                    {selectedChild.conduct && (
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">Imyitwarire</p>
                              <p className="text-3xl font-bold">{selectedChild.conduct.score}/40</p>
                              <p className="text-sm">Grade: {selectedChild.conduct.grade}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">{selectedChild.conduct.percentage}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={() => setShowMessageDialog(true)} className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Tumira Umwarimu
                      </Button>
                      <Button onClick={() => setShowPaymentDialog(true)} variant="outline" className="flex-1">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Kwishyura
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Hitamo umwana kugirango ubone amakuru</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="conduct" className="p-6">
                {selectedChild?.conductRecords ? (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Amateka y'Imyitwarire</h3>
                    {selectedChild.conductRecords.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">Nta makosa</p>
                    ) : (
                      selectedChild.conductRecords.map((record, idx) => (
                        <Card key={idx} className="border-l-4 border-l-red-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{record.incident_type}</h4>
                              <Badge variant="destructive">{record.severity}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Amanota yakuweho: {record.points_deducted}</span>
                              <span>{record.incident_date}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Yakuweho na: {record.removed_by}</p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">Gukurura amakuru...</p>
                )}
              </TabsContent>

              <TabsContent value="fees" className="p-6">
                {selectedChild?.fees ? (
                  <div className="space-y-6">
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Amafaranga Yose</p>
                            <p className="text-2xl font-bold">{selectedChild.fees.total_fees.toLocaleString()} RWF</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Yishyuwe</p>
                            <p className="text-2xl font-bold text-green-600">{selectedChild.fees.paid.toLocaleString()} RWF</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Ideni</p>
                            <p className="text-2xl font-bold text-red-600">{selectedChild.fees.balance.toLocaleString()} RWF</p>
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <Badge className={
                            selectedChild.fees.payment_status === 'Paid' ? 'bg-green-500' :
                            selectedChild.fees.payment_status === 'Partial' ? 'bg-yellow-500' : 'bg-red-500'
                          }>
                            {selectedChild.fees.payment_status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Button onClick={() => setShowPaymentDialog(true)} className="w-full" size="lg">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Kwishyura Ubu
                    </Button>
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">Gukurura amakuru...</p>
                )}
              </TabsContent>

              <TabsContent value="messages" className="p-6">
                <div className="space-y-4">
                  <Button onClick={() => setShowMessageDialog(true)} className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ohereza Ubutumwa Bushya
                  </Button>
                  {messages.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">Nta butumwa</p>
                  ) : (
                    messages.map(msg => (
                      <Card key={msg.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{msg.subject}</h4>
                            <Badge>{msg.recipient_role}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{msg.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="p-6">
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">Nta bikorwa</p>
                  ) : (
                    activities.map(activity => (
                      <Card key={activity.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{activity.title}</h4>
                            <Badge variant="outline">{activity.activity_type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(activity.created_at).toLocaleString()}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Link Child Dialog - New Form */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ParentLinkingForm />
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ohereza Ubutumwa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Uwakiriye</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={messageForm.recipient_role}
                  onChange={(e) => setMessageForm({...messageForm, recipient_role: e.target.value})}
                >
                  <option value="dos">DOS (Umuyobozi w'Amasomo)</option>
                  <option value="dod">DOD (Umuyobozi w'Imyitwarire)</option>
                  <option value="headmaster">Umuyobozi Mukuru</option>
                  <option value="teacher">Umwarimu</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Umutwe</label>
                <Input
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                  placeholder="Umutwe w'ubutumwa"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ubutumwa</label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[100px]"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                  placeholder="Andika ubutumwa bwawe..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Hagarika</Button>
              <Button onClick={handleSendMessage}>Ohereza</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kwishyura Amafaranga</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Amafaranga</label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Uburyo bwo Kwishyura</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                >
                  <option value="momo">Mobile Money (MTN/Airtel)</option>
                  <option value="bank">Banki</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Nimero ya Telefoni</label>
                <Input
                  value={paymentForm.phone_number}
                  onChange={(e) => setPaymentForm({...paymentForm, phone_number: e.target.value})}
                  placeholder="078XXXXXXX"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Hagarika</Button>
              <Button onClick={handleInitiatePayment}>Kwishyura</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ModernParentDashboard;

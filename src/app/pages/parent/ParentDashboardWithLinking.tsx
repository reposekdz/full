import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import ParentWaitingDashboard from './ParentWaitingDashboard';

const API_BASE = 'http://localhost:5000/api';

const ParentDashboardWithLinking = () => {
  const [children, setChildren] = useState([]);
  const [applications, setApplications] = useState([]);
  const [trades, setTrades] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLinkingForm, setShowLinkingForm] = useState(false);

  const [linkingForm, setLinkingForm] = useState({
    child_first_name: '',
    child_last_name: '',
    child_gender: '',
    child_trade_code: '',
    child_level_number: '',
    relationship: 'parent',
    notes: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast.error('Ikosa: Backend server ntiyakora. Reba niba server iratangiye.');
      }
    }, 10000); // 10 second timeout

    fetchData();

    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        toast.error('Ntabwo uri kwinjira. Injira mbere.');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const [childrenRes, applicationsRes, tradesRes] = await Promise.all([
        fetch(`${API_BASE}/parent-child-linking/my-children`, { headers }).catch(() => ({ ok: false, json: async () => ({ success: false, children: [] }) })),
        fetch(`${API_BASE}/parent-child-linking/my-applications`, { headers }).catch(() => ({ ok: false, json: async () => ({ success: false, applications: [] }) })),
        fetch(`${API_BASE}/parent-child-linking/trades`, { headers }).catch(() => ({ ok: false, json: async () => ({ success: false, trades: [] }) }))
      ]);

      const childrenData = await childrenRes.json();
      const applicationsData = await applicationsRes.json();
      const tradesData = await tradesRes.json();

      setChildren(childrenData.children || []);
      setApplications(applicationsData.applications || []);
      setTrades(tradesData.trades || []);
      
      if (!childrenRes.ok || !applicationsRes.ok || !tradesRes.ok) {
        console.warn('Some API calls failed');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setChildren([]);
      setApplications([]);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async (tradeCode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-child-linking/levels?trade_code=${tradeCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLevels(data.levels || []);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error('Ikosa mu gukurura inzego');
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    if (!linkingForm.child_first_name || !linkingForm.child_last_name || !linkingForm.child_gender || 
        !linkingForm.child_trade_code || !linkingForm.child_level_number) {
      toast.error('Uzuza amakuru yose');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-child-linking/submit-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(linkingForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Icyifuzo cyoherejwe neza! Urakurikiranwa ku rutonde rw\'abahagaritse...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(data.message || 'Ikosa mu kohereza icyifuzo');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Ikosa mu kohereza icyifuzo');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Tegereza</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Byemejwe</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Byanze</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Show waiting list if has pending applications and no approved children
  if (applications.some(a => a.status === 'pending') && children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ikibanza cy'Umubyeyi - Rutonde rw'Abahagaritse
            </h1>
            <p className="text-gray-600 mt-1">Gukurikirana ibyifuzo byawe</p>
          </div>
          
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Ibyifuzo Byawe biri ku Rutonde rw'Abahagaritse
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {applications.filter(a => a.status === 'pending').map(app => (
                  <div key={app.id} className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{app.child_first_name} {app.child_last_name}</h3>
                        <p className="text-sm text-gray-600">
                          {app.child_trade_code} - Level {app.child_level_number} - {app.child_gender === 'Male' ? 'Gabo' : 'Gore'}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500">
                        <Clock className="w-3 h-3 mr-1" />
                        Tegereza
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-blue-600">Isano</p>
                        <p className="font-medium capitalize">{app.relationship}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-green-600">Yoherejwe</p>
                        <p className="font-medium">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-xs text-purple-600">Uko bigenda</p>
                        <p className="font-medium">Gukurikirana...</p>
                      </div>
                    </div>
                    
                    {app.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>Inyongera:</strong> {app.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Icyifuzo cyawe kiri ku rutonde rw'abahagaritse. Uzabwirwa iyo umwana asanzwe mu ishuri.</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Icyo ukwiye kumenya:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Icyifuzo cyawe cyoherejwe neza kandi kiri ku rutonde rw'abahagaritse</li>
                  <li>• Uzabwirwa na SMS iyo umwana asanzwe mu ishuri</li>
                  <li>• Ushobora gukora ikindi cyifuzo niba ufite abandi bana</li>
                  <li>• Hamagara ishuri niba ufite ibibazo: +250 788 000 000</li>
                </ul>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button 
                  onClick={() => setShowLinkingForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ongeraho Ikindi Cyifuzo
                </Button>
                <Button 
                  onClick={fetchData}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Kugenzura Amakuru
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Gukurura amakuru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ikibanza cy'Umubyeyi
          </h1>
          <p className="text-gray-600 mt-1">Kugenzura abana bawe mu ishuri</p>
        </div>

        {children.length === 0 && applications.filter(a => a.status === 'pending').length === 0 && (
          <Card className="mb-6 border-2 border-dashed border-blue-300 bg-blue-50">
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Nta mwana uhuye</h2>
              <p className="text-gray-600 mb-6">
                Ntabwo ufite umwana uhuye kuri iyi konti. Kanda hano kugirango usabe guhuza umwana wawe.
              </p>
              <Button 
                onClick={() => setShowLinkingForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Guhuza Umwana
              </Button>
            </CardContent>
          </Card>
        )}

        {showLinkingForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Guhuza Umwana - Uzuza Ifishi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Izina ry'Umwana *</Label>
                    <Input
                      value={linkingForm.child_first_name}
                      onChange={(e) => setLinkingForm({...linkingForm, child_first_name: e.target.value})}
                      placeholder="Izina"
                      required
                    />
                  </div>
                  <div>
                    <Label>Irindi zina *</Label>
                    <Input
                      value={linkingForm.child_last_name}
                      onChange={(e) => setLinkingForm({...linkingForm, child_last_name: e.target.value})}
                      placeholder="Irindi zina"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Igitsina *</Label>
                    <Select
                      value={linkingForm.child_gender}
                      onValueChange={(v) => setLinkingForm({...linkingForm, child_gender: v})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hitamo igitsina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Gabo</SelectItem>
                        <SelectItem value="Female">Gore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Umwuga *</Label>
                    <Select
                      value={linkingForm.child_trade_code}
                      onValueChange={(v) => {
                        setLinkingForm({...linkingForm, child_trade_code: v});
                        fetchLevels(v);
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hitamo umwuga" />
                      </SelectTrigger>
                      <SelectContent>
                        {trades.map(trade => (
                          <SelectItem key={trade.trade_code} value={trade.trade_code}>
                            {trade.trade_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Urwego *</Label>
                    <Select
                      value={linkingForm.child_level_number}
                      onValueChange={(v) => setLinkingForm({...linkingForm, child_level_number: v})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hitamo urwego" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem key={level} value={level.toString()}>
                            Level {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Isano *</Label>
                    <Select
                      value={linkingForm.relationship}
                      onValueChange={(v) => setLinkingForm({...linkingForm, relationship: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Umubyeyi</SelectItem>
                        <SelectItem value="father">Data</SelectItem>
                        <SelectItem value="mother">Mama</SelectItem>
                        <SelectItem value="guardian">Umurezi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Inyongera (Optional)</Label>
                  <Textarea
                    value={linkingForm.notes}
                    onChange={(e) => setLinkingForm({...linkingForm, notes: e.target.value})}
                    placeholder="Andika inyongera..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ohereza Icyifuzo
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowLinkingForm(false)}>
                    Hagarika
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {applications.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ibyifuzo Byawe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold">{app.child_first_name} {app.child_last_name}</h4>
                        <p className="text-sm text-gray-600">
                          {app.child_trade_code} - Level {app.child_level_number} - {app.child_gender === 'Male' ? 'Gabo' : 'Gore'}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    {app.status === 'rejected' && app.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          {app.rejection_reason}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Yoherejwe: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {children.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Abana Bawe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map(child => (
                  <div key={child.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h4 className="font-bold text-lg">{child.first_name} {child.last_name}</h4>
                    <p className="text-sm text-gray-600">{child.student_code}</p>
                    <p className="text-sm text-gray-600">{child.trade_name} - Level {child.level_number}</p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline">Conduct: {child.conduct_score}/40</Badge>
                      <Badge variant="outline">Attendance: {child.overall_attendance_percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ParentDashboardWithLinking;

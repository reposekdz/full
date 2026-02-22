import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Send, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const ParentDashboardWithLinking = () => {
  const [children, setChildren] = useState([]);
  const [applications, setApplications] = useState([]);
  const [trades, setTrades] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const [childrenRes, applicationsRes, tradesRes] = await Promise.all([
        fetch(`${API_BASE}/parent-child-linking/my-children`, { headers }).then(res => res.json()).catch(() => ({ success: true, children: [] })),
        fetch(`${API_BASE}/parent-child-linking/my-applications`, { headers }).then(res => res.json()).catch(() => ({ success: true, applications: [] })),
        fetch(`${API_BASE}/parent-child-linking/trades`, { headers }).then(res => res.json()).catch(() => ({ success: true, trades: [] }))
      ]);

      setChildren(childrenRes.children || []);
      setApplications(applicationsRes.applications || []);
      setTrades(tradesRes.trades || []);
    } catch (error) {
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

    const existingApp = applications.find(app => 
      app.child_first_name?.toLowerCase() === linkingForm.child_first_name.toLowerCase() &&
      app.child_last_name?.toLowerCase() === linkingForm.child_last_name.toLowerCase() &&
      app.child_trade_code === linkingForm.child_trade_code &&
      String(app.child_level_number) === String(linkingForm.child_level_number) &&
      (app.status === 'pending' || app.status === 'approved')
    );

    if (existingApp) {
      toast.error('Warasabye guhuza n\'uyu mwana. Tegereza inyemezwa.');
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
        toast.success('Icyifuzo cyoherejwe neza!');
        setLinkingForm({
          child_first_name: '',
          child_last_name: '',
          child_gender: '',
          child_trade_code: '',
          child_level_number: '',
          relationship: 'parent',
          notes: ''
        });
        fetchData();
      } else {
        toast.error(data.message || 'Ikosa mu kohereza icyifuzo');
      }
    } catch (error) {
      toast.error('Ikosa mu kohereza icyifuzo');
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!confirm('Urashaka gusiba iki cyifuzo? Ntushobora kugarura.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-child-linking/delete-application/${appId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Icyifuzo cyasibwe neza');
        fetchData();
      } else {
        toast.error(data.message || 'Ikosa mu gusiba icyifuzo');
      }
    } catch (error) {
      toast.error('Ikosa mu gusiba icyifuzo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Tegereza...</p>
        </div>
      </div>
    );
  }

  // Show application form if no children and no applications
  if (children.length === 0 && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ikibanza cy'Umubyeyi
            </h1>
            <p className="text-gray-600 mt-1">Saba guhuza n'umwana wawe</p>
          </div>
          
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle>Saba Guhuza n'Umwana</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                    <Label>Irindi Zina *</Label>
                    <Input
                      value={linkingForm.child_last_name}
                      onChange={(e) => setLinkingForm({...linkingForm, child_last_name: e.target.value})}
                      placeholder="Irindi zina"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Igitsina *</Label>
                  <select
                    value={linkingForm.child_gender}
                    onChange={(e) => setLinkingForm({...linkingForm, child_gender: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Hitamo igitsina</option>
                    <option value="Male">Gabo</option>
                    <option value="Female">Gore</option>
                  </select>
                </div>

                <div>
                  <Label>Umwuga *</Label>
                  <select
                    value={linkingForm.child_trade_code}
                    onChange={(e) => {
                      setLinkingForm({...linkingForm, child_trade_code: e.target.value});
                      fetchLevels(e.target.value);
                    }}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Hitamo umwuga</option>
                    {trades.map(t => (
                      <option key={t.trade_code} value={t.trade_code}>{t.trade_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Urwego *</Label>
                  <select
                    value={linkingForm.child_level_number}
                    onChange={(e) => setLinkingForm({...linkingForm, child_level_number: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                    disabled={!linkingForm.child_trade_code}
                  >
                    <option value="">Hitamo urwego</option>
                    {levels.map(l => (
                      <option key={l} value={l}>Level {l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Isano</Label>
                  <select
                    value={linkingForm.relationship}
                    onChange={(e) => setLinkingForm({...linkingForm, relationship: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="parent">Umubyeyi</option>
                    <option value="guardian">Umurezi</option>
                    <option value="relative">Umuryango</option>
                  </select>
                </div>

                <div>
                  <Label>Inyongera</Label>
                  <textarea
                    value={linkingForm.notes}
                    onChange={(e) => setLinkingForm({...linkingForm, notes: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Andika inyongera..."
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  Ohereza Icyifuzo
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show waiting list if has pending applications
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
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Tegereza
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteApplication(app.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
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
                  <li>• Hamagara ishuri niba ufite ibibazo: +250 788 000 000</li>
                </ul>
              </div>
              
              <div className="mt-6">
                <Button onClick={fetchData} variant="outline">
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

  // Show children dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ikibanza cy'Umubyeyi
          </h1>
          <p className="text-gray-600 mt-1">Kugenzura abana bawe mu ishuri</p>
        </div>

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
      </div>
    </div>
  );
};

export default ParentDashboardWithLinking;

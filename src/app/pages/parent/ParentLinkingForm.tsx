import React, { useState, useEffect } from 'react';
import { UserPlus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';

const API_BASE = 'http://localhost:5000/api';

const ParentLinkingForm = () => {
  const [trades, setTrades] = useState([]);
  const [levels, setLevels] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    child_first_name: '',
    child_last_name: '',
    child_gender: 'Male',
    trade_code: '',
    level_number: '',
    relationship: 'parent',
    notes: ''
  });

  useEffect(() => {
    fetchTrades();
    fetchMyRequests();
  }, []);

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/parent-linking-requests/trades`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTrades(data.trades);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchLevels = async (tradeCode) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/parent-linking-requests/levels?trade_code=${tradeCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setLevels(data.levels);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/parent-linking-requests/my-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.child_first_name || !form.child_last_name || !form.trade_code || !form.level_number) {
      alert('Uzuza amakuru yose!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/parent-linking-requests/submit-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Icyifuzo cyoherejwe! Tegereza kwemezwa.');
        setForm({ child_first_name: '', child_last_name: '', child_gender: 'Male', trade_code: '', level_number: '', relationship: 'parent', notes: '' });
        fetchMyRequests();
      } else {
        alert(data.message || 'Ikibazo cyabaye');
      }
    } catch (error) {
      alert('Ikibazo cyabaye');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'pending') return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Tegereza</Badge>;
    if (status === 'approved') return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Byemejwe</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Byanze</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Guhuza Umwana</h1>

        {/* Application Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Ohereza Icyifuzo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Izina rya Mbere *</label>
                  <Input value={form.child_first_name} onChange={(e) => setForm({...form, child_first_name: e.target.value})} placeholder="Jean" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Izina rya Kabiri *</label>
                  <Input value={form.child_last_name} onChange={(e) => setForm({...form, child_last_name: e.target.value})} placeholder="Mugabo" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Igitsina *</label>
                  <select className="w-full border rounded px-3 py-2" value={form.child_gender} onChange={(e) => setForm({...form, child_gender: e.target.value})} required>
                    <option value="Male">Gabo</option>
                    <option value="Female">Gore</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Umwuga *</label>
                  <select className="w-full border rounded px-3 py-2" value={form.trade_code} onChange={(e) => { setForm({...form, trade_code: e.target.value}); fetchLevels(e.target.value); }} required>
                    <option value="">Hitamo...</option>
                    {trades.map(t => <option key={t.trade_code} value={t.trade_code}>{t.trade_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Urwego *</label>
                  <select className="w-full border rounded px-3 py-2" value={form.level_number} onChange={(e) => setForm({...form, level_number: e.target.value})} required disabled={!form.trade_code}>
                    <option value="">Hitamo...</option>
                    {levels.map(l => <option key={l} value={l}>Level {l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Isano</label>
                  <select className="w-full border rounded px-3 py-2" value={form.relationship} onChange={(e) => setForm({...form, relationship: e.target.value})}>
                    <option value="parent">Umubyeyi</option>
                    <option value="father">Data</option>
                    <option value="mother">Mama</option>
                    <option value="guardian">Umurezi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Inyongera (Optional)</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Andika inyongera..." />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Gukurura...' : 'Ohereza Icyifuzo'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Waiting Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Ibyifuzo Byawe</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nta byifuzo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <Card key={req.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold">{req.child_first_name} {req.child_last_name}</h4>
                          <p className="text-sm text-gray-600">{req.student_code || 'Tegereza...'}</p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div><span className="text-gray-600">Umwuga:</span> {req.trade_name}</div>
                        <div><span className="text-gray-600">Urwego:</span> Level {req.level_number}</div>
                        <div><span className="text-gray-600">Igitsina:</span> {req.child_gender === 'Male' ? 'Gabo' : 'Gore'}</div>
                      </div>
                      {req.status === 'rejected' && req.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          <strong>Impamvu:</strong> {req.rejection_reason}
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                          ✅ Byemejwe! Ubu ushobora kureba amakuru y'umwana wawe.
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Yoherejwe: {new Date(req.created_at).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentLinkingForm;

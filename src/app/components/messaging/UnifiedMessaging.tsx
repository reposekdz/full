import React, { useState, useEffect } from 'react';
import { Send, Users, Filter, Clock, MessageSquare, CheckCircle, XCircle, Loader, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';

export const UnifiedMessaging = ({ userRole }) => {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ trade: '', level: '', class: '', search: '' });
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('compose');
  const [pendingFees, setPendingFees] = useState([]);
  const [autoSettings, setAutoSettings] = useState({ enabled: false, frequency: 'weekly', minBalance: 10000, time: '09:00' });

  useEffect(() => {
    loadContacts();
    loadTemplates();
    loadHistory();
    loadStats();
    loadPendingFees();
    loadAutoSettings();
  }, [filters]);

  const loadContacts = async () => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`http://localhost:5000/api/messaging/contacts?${params}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
    const data = await res.json();
    if (data.success) setContacts(data.contacts);
  };

  const loadTemplates = async () => {
    const res = await fetch('http://localhost:5000/api/messaging/templates', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
    const data = await res.json();
    if (data.success) setTemplates(data.templates);
  };

  const loadHistory = async () => {
    const res = await fetch('http://localhost:5000/api/messaging/history?limit=20', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
    const data = await res.json();
    if (data.success) setHistory(data.messages);
  };

  const loadStats = async () => {
    const res = await fetch('http://localhost:5000/api/messaging/stats', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
    const data = await res.json();
    if (data.success) setStats(data.stats);
  };

  const loadPendingFees = async () => {
    const res = await fetch('http://localhost:5000/api/fee-reminders/pending-fees', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
    const data = await res.json();
    if (data.success) setPendingFees(data.students);
  };

  const loadAutoSettings = async () => {
    const res = await fetch('http://localhost:5000/api/fee-reminders/auto-reminder-settings', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
    const data = await res.json();
    if (data.success) {
      setAutoSettings({
        enabled: data.settings.fee_reminder_enabled === 'true',
        frequency: data.settings.fee_reminder_frequency || 'weekly',
        minBalance: parseInt(data.settings.fee_reminder_min_balance || 10000),
        time: data.settings.fee_reminder_time || '09:00'
      });
    }
  };

  const sendMessage = async () => {
    if (!message || selected.length === 0) return;
    setLoading(true);
    const res = await fetch('http://localhost:5000/api/messaging/send-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ recipients: selected, message })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert(`✅ Sent to ${selected.length} recipients`);
      setMessage('');
      setSelected([]);
      loadHistory();
      loadStats();
    }
  };

  const sendFeeReminder = async (studentId) => {
    const res = await fetch(`http://localhost:5000/api/fee-reminders/send-reminder/${studentId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (data.success) {
      alert('✅ Fee reminder sent');
      loadPendingFees();
    }
  };

  const sendBulkFeeReminders = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:5000/api/fee-reminders/send-bulk-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ minBalance: 0, trade: filters.trade, level: filters.level })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert(data.message);
      loadPendingFees();
    }
  };

  const saveAutoSettings = async () => {
    const res = await fetch('http://localhost:5000/api/fee-reminders/auto-reminder-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(autoSettings)
    });
    const data = await res.json();
    if (data.success) alert('✅ Auto-reminder settings saved');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.total_messages || 0}</div><div className="text-sm text-gray-500">Total Sent</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{stats.sent_count || 0}</div><div className="text-sm text-gray-500">Delivered</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-600">{stats.failed_count || 0}</div><div className="text-sm text-gray-500">Failed</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.unique_recipients || 0}</div><div className="text-sm text-gray-500">Recipients</div></CardContent></Card>
      </div>

      <div className="flex gap-2 border-b">
        <Button variant={tab === 'compose' ? 'default' : 'ghost'} onClick={() => setTab('compose')}><Send className="w-4 h-4 mr-2" />Compose</Button>
        <Button variant={tab === 'fees' ? 'default' : 'ghost'} onClick={() => setTab('fees')}><DollarSign className="w-4 h-4 mr-2" />Fee Reminders</Button>
        <Button variant={tab === 'history' ? 'default' : 'ghost'} onClick={() => setTab('history')}><MessageSquare className="w-4 h-4 mr-2" />History</Button>
        <Button variant={tab === 'templates' ? 'default' : 'ghost'} onClick={() => setTab('templates')}><Clock className="w-4 h-4 mr-2" />Templates</Button>
      </div>

      {tab === 'compose' && (
        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader><CardTitle>Recipients ({selected.length})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Search..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
              <select className="w-full p-2 border rounded" value={filters.trade} onChange={(e) => setFilters({...filters, trade: e.target.value})}>
                <option value="">All Trades</option>
                <option value="AUTO">Automotive</option>
                <option value="BDC">Construction</option>
                <option value="SOD">Software</option>
              </select>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <Button size="sm" variant="outline" className="w-full" onClick={() => setSelected(contacts.map(c => c.parent_phone))}>Select All ({contacts.length})</Button>
                {contacts.map(c => (
                  <div key={c.student_id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                    <input type="checkbox" checked={selected.includes(c.parent_phone)} onChange={(e) => {
                      if (e.target.checked) setSelected([...selected, c.parent_phone]);
                      else setSelected(selected.filter(p => p !== c.parent_phone));
                    }} />
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{c.student_name}</div>
                      <div className="text-gray-500">{c.parent_phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader><CardTitle>Compose Message</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {templates.slice(0, 5).map(t => (
                  <Button key={t.id} size="sm" variant="outline" onClick={() => setMessage(t.content)}>{t.name}</Button>
                ))}
              </div>
              <Textarea placeholder="Type your message..." rows={10} value={message} onChange={(e) => setMessage(e.target.value)} className="resize-none" />
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">{message.length} chars • {Math.ceil(message.length / 160)} SMS</div>
                <Button onClick={sendMessage} disabled={loading || !message || selected.length === 0}>
                  {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send to {selected.length}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'fees' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Pending Fees ({pendingFees.length} students)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <Button onClick={sendBulkFeeReminders} disabled={loading}>
                  {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send All Reminders
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingFees.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{s.first_name} {s.last_name}</div>
                      <div className="text-sm text-gray-600">{s.parent_name} - {s.parent_phone}</div>
                      <div className="text-xs text-gray-500">{s.trade} - Level {s.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">{s.balance} RWF</div>
                      <Button size="sm" onClick={() => sendFeeReminder(s.id)}>Send Reminder</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Auto-Reminder Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={autoSettings.enabled} onChange={(e) => setAutoSettings({...autoSettings, enabled: e.target.checked})} />
                <label>Enable automatic fee reminders</label>
              </div>
              <div>
                <label className="text-sm">Minimum Balance (RWF)</label>
                <Input type="number" value={autoSettings.minBalance} onChange={(e) => setAutoSettings({...autoSettings, minBalance: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="text-sm">Send Time</label>
                <Input type="time" value={autoSettings.time} onChange={(e) => setAutoSettings({...autoSettings, time: e.target.value})} />
              </div>
              <Button onClick={saveAutoSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'history' && (
        <Card>
          <CardHeader><CardTitle>Message History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map(h => (
                <div key={h.id} className="flex items-start gap-3 p-3 border rounded">
                  {h.status === 'sent' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                  <div className="flex-1">
                    <div className="font-medium">{h.recipient}</div>
                    <div className="text-sm text-gray-600">{h.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(h.created_at).toLocaleString()}</div>
                  </div>
                  <Badge variant={h.status === 'sent' ? 'success' : 'destructive'}>{h.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'templates' && (
        <Card>
          <CardHeader><CardTitle>Message Templates</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {templates.map(t => (
                <div key={t.id} className="p-4 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => { setMessage(t.content); setTab('compose'); }}>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{t.content.substring(0, 100)}...</div>
                  <Badge className="mt-2">{t.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

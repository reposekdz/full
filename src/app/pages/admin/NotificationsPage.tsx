import React, { useState, useEffect } from 'react';
import { Bell, Send, Trash2, Eye, Users, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', message: '', target: 'all' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleSend = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/notifications', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setMessage({ type: data.success ? 'success' : 'error', text: data.message });
      if (data.success) {
        setForm({ title: '', message: '', target: 'all' });
        fetchNotifications();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Send failed' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Bell className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-3xl font-black">Amamenyo / Notifications</h1>
          <p className="text-gray-600">Ohereza kandi ukurikirana amamenyo / Send and manage notifications</p>
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ohereza Ubutumwa / Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input placeholder="Umutwe / Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Textarea placeholder="Ubutumwa / Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} />
          </div>
          <div className="flex gap-4">
            <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v })}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Abantu Bose / Everyone</SelectItem>
                <SelectItem value="students">Abanyeshuri / Students</SelectItem>
                <SelectItem value="teachers">Abarimu / Teachers</SelectItem>
                <SelectItem value="parents">Ababyeyi / Parents</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSend}>
              <Send className="w-4 h-4 mr-2" />
              Ohereza / Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amamenyo Yoherejwe / Sent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-bold">{notif.title}</h3>
                  <p className="text-gray-600 text-sm">{notif.message}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{notif.target}</Badge>
                    <span className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(notif.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;

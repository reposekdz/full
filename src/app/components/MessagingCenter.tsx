import React, { useState, useEffect } from 'react';
import { Send, Inbox, Mail, Bell, Users, Filter, Search, Star, Trash2, Reply, Forward, MoreVertical, AlertCircle, CheckCircle, Clock, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { ScrollArea } from '@/app/components/ui/scroll-area';

interface MessagingCenterProps {
  userId: number;
  userRole: string;
}

const MessagingCenter: React.FC<MessagingCenterProps> = ({ userId, userRole }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [filter, setFilter] = useState('');
  const [composeForm, setComposeForm] = useState({
    recipient_ids: [] as number[],
    subject: '',
    message: '',
    priority: 'normal',
    attachment_url: ''
  });
  const [broadcastForm, setBroadcastForm] = useState({
    target_roles: [] as string[],
    subject: '',
    message: '',
    priority: 'normal'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [inboxRes, sentRes, notifRes, recipientsRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/messaging/inbox', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/messaging/sent', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/messaging/notifications/all', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/messaging/allowed-recipients', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/messaging/stats/overview', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const inboxData = await inboxRes.json();
      const sentData = await sentRes.json();
      const notifData = await notifRes.json();
      const recipientsData = await recipientsRes.json();
      const statsData = await statsRes.json();
      
      if (inboxData.success) setMessages(inboxData.messages);
      if (sentData.success) setSentMessages(sentData.messages);
      if (notifData.success) setNotifications(notifData.notifications);
      if (recipientsData.success) setRecipients(recipientsData.recipients);
      if (statsData.success) setStats(statsData.stats);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/messaging/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(composeForm)
    });
    const data = await res.json();
    if (data.success) {
      alert('Message sent successfully!');
      setShowComposeModal(false);
      setComposeForm({ recipient_ids: [], subject: '', message: '', priority: 'normal', attachment_url: '' });
      loadData();
    } else {
      alert(data.message || 'Failed to send message');
    }
  };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/messaging/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(broadcastForm)
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      setShowBroadcastModal(false);
      setBroadcastForm({ target_roles: [], subject: '', message: '', priority: 'normal' });
      loadData();
    } else {
      alert(data.message || 'Failed to broadcast');
    }
  };

  const markAsRead = async (messageId: number) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/messaging/${messageId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadData();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredMessages = messages.filter(m => 
    m.subject?.toLowerCase().includes(filter.toLowerCase()) || 
    m.message?.toLowerCase().includes(filter.toLowerCase()) ||
    m.sender_name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900">Messaging Center</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowComposeModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <Send className="w-4 h-4 mr-2" />
            Compose
          </Button>
          {['admin', 'headmaster'].includes(userRole) && (
            <Button onClick={() => setShowBroadcastModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Users className="w-4 h-4 mr-2" />
              Broadcast
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-black text-blue-600">{stats.unread || 0}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Received</p>
                <p className="text-2xl font-black text-green-600">{stats.total_received || 0}</p>
              </div>
              <Inbox className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-black text-purple-600">{stats.total_sent || 0}</p>
              </div>
              <Send className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-black text-red-600">{stats.urgent || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-gray-200">
          <TabsTrigger value="inbox">Inbox ({stats.unread || 0})</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inbox</CardTitle>
                <Input placeholder="Search messages..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredMessages.map((msg) => (
                    <Card key={msg.id} className={`border-2 ${msg.is_read ? 'border-gray-100' : 'border-blue-200 bg-blue-50'} hover:shadow-md transition-all cursor-pointer`} onClick={() => { setSelectedMessage(msg); markAsRead(msg.id); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">{msg.sender_name}</span>
                              <Badge className={getPriorityColor(msg.priority)}>{msg.priority}</Badge>
                              {!msg.is_read && <Badge className="bg-blue-600 text-white">New</Badge>}
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1">{msg.subject}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card className="border-2 border-gray-200">
            <CardHeader><CardTitle>Sent Messages</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {sentMessages.map((msg) => (
                    <Card key={msg.id} className="border-2 border-gray-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-600">To: {msg.recipient_name}</span>
                          <Badge className={getPriorityColor(msg.priority)}>{msg.priority}</Badge>
                        </div>
                        <h4 className="font-semibold text-gray-800">{msg.subject}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-2 border-gray-200">
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <Card key={notif.id} className={`border-2 ${notif.is_read ? 'border-gray-100' : 'border-yellow-200 bg-yellow-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Bell className="w-4 h-4 text-yellow-600" />
                          <span className="font-bold text-gray-900">{notif.title}</span>
                          {!notif.is_read && <Badge className="bg-yellow-600 text-white">New</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showComposeModal} onOpenChange={setShowComposeModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>Send a message to users</DialogDescription>
          </DialogHeader>
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <Label>Recipients</Label>
              <Select onValueChange={(v) => setComposeForm({...composeForm, recipient_ids: [parseInt(v)]})}>
                <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                <SelectContent>
                  {recipients.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.name} ({r.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={composeForm.subject} onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})} required />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={composeForm.message} onChange={(e) => setComposeForm({...composeForm, message: e.target.value})} rows={6} required />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={composeForm.priority} onValueChange={(v) => setComposeForm({...composeForm, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowComposeModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 text-white">Send</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showBroadcastModal} onOpenChange={setShowBroadcastModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Broadcast Message</DialogTitle>
            <DialogDescription>Send message to multiple roles</DialogDescription>
          </DialogHeader>
          <form onSubmit={sendBroadcast} className="space-y-4">
            <div>
              <Label>Target Roles</Label>
              <Select onValueChange={(v) => setBroadcastForm({...broadcastForm, target_roles: [v]})}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">All Teachers</SelectItem>
                  <SelectItem value="student">All Students</SelectItem>
                  <SelectItem value="parent">All Parents</SelectItem>
                  <SelectItem value="admin">All Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={broadcastForm.subject} onChange={(e) => setBroadcastForm({...broadcastForm, subject: e.target.value})} required />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={broadcastForm.message} onChange={(e) => setBroadcastForm({...broadcastForm, message: e.target.value})} rows={6} required />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={broadcastForm.priority} onValueChange={(v) => setBroadcastForm({...broadcastForm, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBroadcastModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 text-white">Broadcast</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagingCenter;

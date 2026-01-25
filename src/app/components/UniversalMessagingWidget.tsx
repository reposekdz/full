import React, { useState, useEffect } from 'react';
import { Bell, Send, X, MessageSquare, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';

const UniversalMessagingWidget: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ recipient_ids: [], subject: '', message: '', priority: 'normal' });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [notifRes, msgRes, recipRes] = await Promise.all([
        fetch('http://localhost:5000/api/messaging/notifications/all', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/messaging/inbox', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/messaging/allowed-recipients', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const notifData = await notifRes.json();
      const msgData = await msgRes.json();
      const recipData = await recipRes.json();
      if (notifData.success) { setNotifications(notifData.notifications); setUnreadCount(notifData.unreadCount); }
      if (msgData.success) setMessages(msgData.messages);
      if (recipData.success) setRecipients(recipData.recipients);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/messaging/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (data.success) {
      alert('Ubutumwa bwoherejwe!');
      setShowCompose(false);
      setForm({ recipient_ids: [], subject: '', message: '', priority: 'normal' });
      loadData();
    } else {
      alert(data.message || 'Byanze');
    }
  };

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/messaging/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadData();
  };

  return (
    <>
      <button onClick={() => setShowPanel(!showPanel)} className="relative p-2 rounded-full hover:bg-gray-100">
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowPanel(false)} />
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Imenyesha & Ubutumwa</h3>
                  <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-white/20 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex-1 py-2 px-3 rounded ${activeTab === 'notifications' ? 'bg-white text-blue-600' : 'bg-white/20'}`}
                  >
                    <Bell className="w-4 h-4 inline mr-1" />
                    Imenyesha ({unreadCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`flex-1 py-2 px-3 rounded ${activeTab === 'messages' ? 'bg-white text-blue-600' : 'bg-white/20'}`}
                  >
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Ubutumwa
                  </button>
                </div>
              </div>

              {!showCompose ? (
                <>
                  <div className="p-3 border-b">
                    <Button onClick={() => setShowCompose(true)} className="w-full bg-green-600 hover:bg-green-700">
                      <Send className="w-4 h-4 mr-2" />
                      Ohereza Ubutumwa
                    </Button>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    {activeTab === 'notifications' ? (
                      <div className="space-y-2">
                        {notifications.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Nta menyesha</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => !n.is_read && markAsRead(n.id)}
                              className={`p-3 rounded-lg border-2 cursor-pointer ${n.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-300'}`}
                            >
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 mt-1" />
                                <div className="flex-1">
                                  <h4 className="font-bold text-sm">{n.title}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {messages.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Nta butumwa</p>
                          </div>
                        ) : (
                          messages.map((m) => (
                            <div key={m.id} className={`p-3 rounded-lg border-2 ${m.is_read ? 'bg-white border-gray-200' : 'bg-green-50 border-green-300'}`}>
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-bold text-sm">{m.sender_name}</span>
                                {!m.is_read && <div className="w-2 h-2 bg-green-600 rounded-full" />}
                              </div>
                              <h4 className="font-semibold text-sm">{m.subject}</h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{m.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold mb-1 block">Kuri</label>
                      <Select onValueChange={(v) => setForm({...form, recipient_ids: [parseInt(v)]})}>
                        <SelectTrigger><SelectValue placeholder="Hitamo uwakira" /></SelectTrigger>
                        <SelectContent>
                          {recipients.map((r) => (
                            <SelectItem key={r.id} value={r.id.toString()}>{r.name} ({r.role})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1 block">Ingingo</label>
                      <Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="Andika ingingo" />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1 block">Ubutumwa</label>
                      <Textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} rows={6} placeholder="Andika ubutumwa" />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1 block">Ingenzi</label>
                      <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Bike</SelectItem>
                          <SelectItem value="normal">Bisanzwe</SelectItem>
                          <SelectItem value="high">Byinshi</SelectItem>
                          <SelectItem value="urgent">Byihutirwa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowCompose(false)} variant="outline" className="flex-1">Hagarika</Button>
                      <Button onClick={sendMessage} className="flex-1 bg-blue-600">Ohereza</Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default UniversalMessagingWidget;

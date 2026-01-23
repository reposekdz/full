import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Users, Clock, CheckCircle, Send, X, Eye, Download } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function LiveChatManagementPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminName] = useState('Admin Support');

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  const fetchActiveSessions = async () => {
    try {
      const res = await axios.get(`${API_URL}/live-chat/sessions/active`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSessions(res.data.sessions || []);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    if (!selectedSession) return;
    try {
      const res = await axios.get(`${API_URL}/live-chat/sessions/${selectedSession.session_id}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;
    try {
      await axios.post(`${API_URL}/live-chat/messages`, {
        session_id: selectedSession.session_id,
        sender_type: 'admin',
        sender_name: adminName,
        message: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  const closeSession = async (sessionId: string) => {
    try {
      await axios.put(`${API_URL}/live-chat/sessions/${sessionId}/close`);
      fetchActiveSessions();
      if (selectedSession?.session_id === sessionId) setSelectedSession(null);
    } catch (err) { console.error(err); }
  };

  const stats = [
    { title: 'Active Chats', value: sessions.length, icon: MessageCircle, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Messages', value: sessions.reduce((acc, s) => acc + (s.message_count || 0), 0), icon: Users, color: 'from-green-500 to-green-600' },
    { title: 'Avg Response Time', value: '2.5 min', icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Resolved Today', value: '24', icon: CheckCircle, color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Live Chat Management</h1>
          <p className="text-gray-600">Monitor and respond to live chat sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Active Sessions ({sessions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedSession?.id === session.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-600 text-white">
                          {session.visitor_name?.charAt(0) || 'V'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{session.visitor_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{session.visitor_email}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">{session.message_count || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(session.created_at).toLocaleTimeString()}</span>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); closeSession(session.session_id); }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active chat sessions</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedSession ? `Chat with ${selectedSession.visitor_name}` : 'Select a session'}
              </CardTitle>
              {selectedSession && (
                <Button size="sm" variant="outline" onClick={() => closeSession(selectedSession.session_id)}>
                  <X className="w-4 h-4 mr-2" /> Close Chat
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedSession ? (
              <div className="space-y-4">
                <ScrollArea className="h-[480px] border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 ${msg.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                          <p className="text-xs font-semibold mb-1">{msg.sender_name}</p>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[560px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">No session selected</p>
                  <p className="text-sm">Select a chat session from the left to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

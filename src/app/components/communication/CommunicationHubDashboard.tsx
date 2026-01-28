import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Send, Inbox, Archive, Trash2, Star, StarOff, Reply, Forward,
  Search, Filter, RefreshCw, Plus, Eye, EyeOff, Users, User, Clock,
  AlertCircle, CheckCircle, Bell, MessageSquare, Paperclip, Download,
  MoreVertical, Edit, X, ChevronLeft, ChevronRight, FileText, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Checkbox } from '@/app/components/ui/checkbox';

const API_BASE = 'http://localhost:5000/api';

interface CommunicationHubDashboardProps {
  userRole: string;
  userId: number;
}

const CommunicationHubDashboard: React.FC<CommunicationHubDashboardProps> = ({ userRole, userId }) => {
  const [inbox, setInbox] = useState<any[]>([]);
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [composeData, setComposeData] = useState({
    recipient_id: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [inboxRes, sentRes, announcementsRes] = await Promise.all([
        fetch(`${API_BASE}/communication-hub/inbox/${userId}`).then(r => r.json()),
        fetch(`${API_BASE}/communication-hub/sent/${userId}`).then(r => r.json()),
        fetch(`${API_BASE}/communication-hub/announcements`).then(r => r.json())
      ]);

      setInbox(inboxRes.messages || []);
      setSentMessages(sentRes.messages || []);
      setAnnouncements(announcementsRes.announcements || []);
    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await fetch(`${API_BASE}/communication-hub/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: userId,
          ...composeData
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchAllData();
        setShowComposeDialog(false);
        resetComposeForm();
        alert('Message sent successfully!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`${API_BASE}/communication-hub/messages/${messageId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_status: true })
      });
      const data = await response.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleToggleStar = async (messageId: number, starred: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/communication-hub/messages/${messageId}/star`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !starred })
      });
      const data = await response.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/communication-hub/messages/${messageId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        fetchAllData();
        setShowMessageDialog(false);
        alert('Message deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const viewMessage = async (messageId: number) => {
    try {
      const response = await fetch(`${API_BASE}/communication-hub/messages/${messageId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedMessage(data.message);
        setShowMessageDialog(true);
        if (!data.message.read_status && data.message.recipient_id === userId) {
          handleMarkAsRead(messageId);
        }
      }
    } catch (error) {
      console.error('Error fetching message:', error);
    }
  };

  const resetComposeForm = () => {
    setComposeData({
      recipient_id: '',
      subject: '',
      message: '',
      priority: 'normal'
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <h3 className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                {value}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
              )}
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${color}`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = inbox.filter(m => !m.read_status).length;
  const starredCount = inbox.filter(m => m.starred).length;
  const totalMessages = inbox.length + sentMessages.length;

  const stats = [
    { title: 'Total Messages', value: totalMessages, icon: Mail, color: 'from-blue-500 to-blue-600', subtitle: `${inbox.length} received, ${sentMessages.length} sent` },
    { title: 'Unread', value: unreadCount, icon: Inbox, color: 'from-green-500 to-green-600', subtitle: 'Messages to review' },
    { title: 'Starred', value: starredCount, icon: Star, color: 'from-yellow-500 to-yellow-600', subtitle: 'Important messages' },
    { title: 'Announcements', value: announcements.length, icon: Bell, color: 'from-purple-500 to-purple-600', subtitle: 'Active broadcasts' }
  ];

  const currentMessages = activeTab === 'inbox' ? inbox : sentMessages;
  const filteredMessages = currentMessages.filter(message => {
    const matchesSearch = message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (activeTab === 'inbox' && `${message.sender_first_name} ${message.sender_last_name}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (activeTab === 'sent' && `${message.recipient_first_name} ${message.recipient_last_name}`.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = selectedPriority === 'all' || message.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Communication Hub
            </h1>
            <p className="text-gray-600 mt-2">Manage messages, announcements, and communications</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchAllData}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowComposeDialog(true)}
              className="bg-gradient-to-r from-yellow-600 to-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl bg-gradient-to-r from-green-100 to-yellow-100 p-1 rounded-2xl">
          <TabsTrigger value="inbox" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Inbox className="w-4 h-4 mr-2" />
            Inbox ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="sent" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Send className="w-4 h-4 mr-2" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="announcements" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2 font-black">
                  <Inbox className="w-6 h-6 text-green-600" />
                  Inbox Messages
                </CardTitle>
                <div className="flex gap-3">
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-bold">No messages found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}
                      className={`p-4 cursor-pointer transition-colors ${!message.read_status ? 'bg-blue-50' : ''}`}
                      onClick={() => viewMessage(message.id)}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(message.id, message.starred);
                          }}
                          className="mt-1"
                        >
                          {message.starred ? (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center text-white font-black flex-shrink-0">
                          {message.sender_first_name?.[0]}{message.sender_last_name?.[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-bold text-gray-800 ${!message.read_status ? 'font-black' : ''}`}>
                              {message.sender_first_name} {message.sender_last_name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(message.priority)}>
                                {message.priority}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(message.sent_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className={`text-sm mb-1 ${!message.read_status ? 'font-bold text-gray-800' : 'text-gray-700'}`}>
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {message.message}
                          </p>
                        </div>

                        {!message.read_status && (
                          <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2 font-black">
                  <Send className="w-6 h-6 text-green-600" />
                  Sent Messages
                </CardTitle>
                <Input
                  placeholder="Search sent messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-bold">No sent messages found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}
                      className="p-4 cursor-pointer transition-colors"
                      onClick={() => viewMessage(message.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center text-white font-black flex-shrink-0">
                          {message.recipient_first_name?.[0]}{message.recipient_last_name?.[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-800">
                              To: {message.recipient_first_name} {message.recipient_last_name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {new Date(message.sent_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 font-bold mb-1">
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2 font-black">
                <Bell className="w-6 h-6 text-green-600" />
                School Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-bold">No announcements</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl p-6 border-2 border-yellow-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-r from-yellow-500 to-green-500 rounded-xl">
                          <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-black text-gray-800">
                              {announcement.title}
                            </h3>
                            <Badge className={getPriorityColor(announcement.priority)}>
                              {announcement.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-3">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{announcement.sender_name || 'Administration'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Compose Message
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipient ID</Label>
              <Input
                type="number"
                value={composeData.recipient_id}
                onChange={(e) => setComposeData({ ...composeData, recipient_id: e.target.value })}
                placeholder="Enter recipient user ID"
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                placeholder="Enter message subject"
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={composeData.priority} onValueChange={(value) => setComposeData({ ...composeData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={composeData.message}
                onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSendMessage}
                className="flex-1 bg-gradient-to-r from-green-600 to-yellow-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button
                onClick={() => setShowComposeDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              {selectedMessage?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center text-white font-black">
                    {activeTab === 'inbox' 
                      ? `${selectedMessage.sender_first_name?.[0]}${selectedMessage.sender_last_name?.[0]}`
                      : `${selectedMessage.recipient_first_name?.[0]}${selectedMessage.recipient_last_name?.[0]}`
                    }
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {activeTab === 'inbox' 
                        ? `${selectedMessage.sender_first_name} ${selectedMessage.sender_last_name}`
                        : `To: ${selectedMessage.recipient_first_name} ${selectedMessage.recipient_last_name}`
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedMessage.sent_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge className={getPriorityColor(selectedMessage.priority)}>
                  {selectedMessage.priority}
                </Badge>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex gap-3">
                {activeTab === 'inbox' && (
                  <Button
                    onClick={() => {
                      setComposeData({
                        recipient_id: selectedMessage.sender_id.toString(),
                        subject: `Re: ${selectedMessage.subject}`,
                        message: '',
                        priority: 'normal'
                      });
                      setShowMessageDialog(false);
                      setShowComposeDialog(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                )}
                <Button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  onClick={() => setShowMessageDialog(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationHubDashboard;

import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, Send, Paperclip, Mic, Video, Phone, Search, Filter, Star, Archive, Trash2, MoreVertical, Check, CheckCheck, Clock, AlertCircle, TrendingUp, Zap, Heart, ThumbsUp, Smile, X, Download, Eye, Reply, Forward, Edit, Pin, Bookmark, Flag, Users, Image, File, MapPin, Calendar, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';

const AdvancedMessagingWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [composeMode, setComposeMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [starred, setStarred] = useState<Set<number>>(new Set());
  const [archived, setArchived] = useState<Set<number>>(new Set());
  const [reactions, setReactions] = useState<Map<number, string[]>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [composeForm, setComposeForm] = useState({
    recipients: [],
    subject: '',
    message: '',
    priority: 'normal',
    scheduled: false,
    scheduledTime: '',
    attachFiles: true,
    requestReadReceipt: false,
    encrypt: false
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [notifsRes, msgsRes] = await Promise.all([
        fetch('http://localhost:5000/api/messaging/notifications/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/messaging/inbox', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const notifsData = await notifsRes.json();
      const msgsData = await msgsRes.json();

      if (notifsData.success) {
        setNotifications(notifsData.notifications);
        setUnreadCount(notifsData.unreadCount + (msgsData.unreadCount || 0));
      }
      if (msgsData.success) setMessages(msgsData.messages);
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const markAsRead = async (id: number, type: 'notification' | 'message') => {
    const token = localStorage.getItem('token');
    const endpoint = type === 'notification' 
      ? `http://localhost:5000/api/messaging/notifications/${id}/read`
      : `http://localhost:5000/api/messaging/${id}/read`;

    await fetch(endpoint, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadData();
  };

  const sendMessage = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    formData.append('recipient_ids', JSON.stringify(composeForm.recipients));
    formData.append('subject', composeForm.subject);
    formData.append('message', composeForm.message);
    formData.append('priority', composeForm.priority);
    
    attachments.forEach(file => formData.append('attachments', file));

    await fetch('http://localhost:5000/api/messaging/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    setComposeMode(false);
    setComposeForm({ recipients: [], subject: '', message: '', priority: 'normal', scheduled: false, scheduledTime: '', attachFiles: true, requestReadReceipt: false, encrypt: false });
    setAttachments([]);
    loadData();
  };

  const toggleStar = (id: number) => {
    const newStarred = new Set(starred);
    if (newStarred.has(id)) newStarred.delete(id);
    else newStarred.add(id);
    setStarred(newStarred);
  };

  const addReaction = (id: number, emoji: string) => {
    const newReactions = new Map(reactions);
    const current = newReactions.get(id) || [];
    newReactions.set(id, [...current, emoji]);
    setReactions(newReactions);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      system: Zap,
      academic: TrendingUp,
      discipline: AlertCircle,
      finance: TrendingUp,
      welfare: Heart,
      teaching: TrendingUp,
      student: TrendingUp,
      parent: Users,
      inventory: TrendingUp,
      management: TrendingUp
    };
    return icons[category] || Bell;
  };

  const filteredNotifications = notifications.filter(n => {
    const matchSearch = !searchQuery || n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'all' || n.priority === filterPriority;
    const matchCategory = filterCategory === 'all' || n.category === filterCategory;
    const notArchived = !archived.has(n.id);
    return matchSearch && matchPriority && matchCategory && notArchived;
  });

  const filteredMessages = messages.filter(m => {
    const matchSearch = !searchQuery || m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || m.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const notArchived = !archived.has(m.id);
    return matchSearch && notArchived;
  });

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-600 via-yellow-500 to-lime-500 text-white rounded-full p-3 shadow-2xl hover:shadow-green-500/50 transition-all"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[480px] bg-white shadow-2xl z-40 flex flex-col border-l-4 border-green-500"
          >
            <div className="bg-gradient-to-r from-green-600 via-yellow-500 to-lime-500 text-white p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6" />
                  <h2 className="text-xl font-black">Ubutumwa & Amakuru</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Shakisha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Filter className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-bold">Ingenzi</label>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Byose</SelectItem>
                            <SelectItem value="urgent">Byihutirwa</SelectItem>
                            <SelectItem value="high">Byinshi</SelectItem>
                            <SelectItem value="normal">Bisanzwe</SelectItem>
                            <SelectItem value="low">Bike</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-bold">Icyiciro</label>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Byose</SelectItem>
                            <SelectItem value="system">Sistema</SelectItem>
                            <SelectItem value="academic">Amasomo</SelectItem>
                            <SelectItem value="discipline">Imyitwarire</SelectItem>
                            <SelectItem value="finance">Amafaranga</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-500 data-[state=active]:text-white">
                  <Bell className="w-4 h-4 mr-2" />
                  Amakuru
                </TabsTrigger>
                <TabsTrigger value="messages" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-500 data-[state=active]:text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ubutumwa
                </TabsTrigger>
                <TabsTrigger value="compose" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-500 data-[state=active]:text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Andika
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Nta makuru ahari</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => {
                        const CategoryIcon = getCategoryIcon(notif.category);
                        return (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              notif.is_read ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-300'
                            } hover:shadow-lg`}
                            onClick={() => markAsRead(notif.id, 'notification')}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${getPriorityColor(notif.priority)}`}>
                                <CategoryIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    {notif.icon} {notif.title}
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => { e.stopPropagation(); toggleStar(notif.id); }}
                                    >
                                      <Star className={`w-4 h-4 ${starred.has(notif.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                    </Button>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-48">
                                        <div className="space-y-1">
                                          <Button variant="ghost" size="sm" className="w-full justify-start">
                                            <Archive className="w-4 h-4 mr-2" />
                                            Bika
                                          </Button>
                                          <Button variant="ghost" size="sm" className="w-full justify-start">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Siba
                                          </Button>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{notif.message}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getPriorityColor(notif.priority)}>
                                      {notif.priority === 'urgent' ? 'Byihutirwa' : notif.priority === 'high' ? 'Byinshi' : 'Bisanzwe'}
                                    </Badge>
                                    <Badge variant="outline">{notif.category}</Badge>
                                  </div>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(notif.created_at).toLocaleTimeString('rw-RW', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {reactions.get(notif.id) && (
                                  <div className="flex gap-1 mt-2">
                                    {reactions.get(notif.id)?.map((emoji, i) => (
                                      <span key={i} className="text-lg">{emoji}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="messages" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {filteredMessages.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Nta butumwa buhari</p>
                      </div>
                    ) : (
                      filteredMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            msg.is_read ? 'bg-gray-50 border-gray-200' : 'bg-yellow-50 border-yellow-300'
                          } hover:shadow-lg`}
                          onClick={() => { setSelectedMessage(msg); markAsRead(msg.id, 'message'); }}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border-2 border-green-500">
                              <AvatarFallback className="bg-gradient-to-br from-green-600 to-yellow-500 text-white font-bold">
                                {msg.sender_name?.charAt(0) || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div>
                                  <h4 className="font-bold text-gray-900">{msg.sender_name}</h4>
                                  <p className="text-sm text-gray-600">{msg.subject}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {msg.is_read ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Check className="w-4 h-4 text-gray-400" />}
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleStar(msg.id); }}>
                                    <Star className={`w-4 h-4 ${starred.has(msg.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 line-clamp-2 mb-2">{msg.message}</p>
                              <div className="flex items-center justify-between">
                                <Badge className={getPriorityColor(msg.priority)}>
                                  {msg.priority === 'urgent' ? 'Byihutirwa' : msg.priority === 'high' ? 'Byinshi' : 'Bisanzwe'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(msg.created_at).toLocaleDateString('rw-RW')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="compose" className="flex-1 overflow-hidden p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold mb-2 block">Kuri</label>
                      <Input placeholder="Hitamo uwakira..." />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-2 block">Ingingo</label>
                      <Input
                        placeholder="Ingingo y'ubutumwa..."
                        value={composeForm.subject}
                        onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-2 block">Ubutumwa</label>
                      <Textarea
                        placeholder="Andika ubutumwa bwawe..."
                        rows={8}
                        value={composeForm.message}
                        onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-2 block">Ingenzi</label>
                      <Select value={composeForm.priority} onValueChange={(v) => setComposeForm({ ...composeForm, priority: v })}>
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
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                      />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Ongeraho Dosiye
                      </Button>
                      <Button variant="outline" onClick={() => setIsRecording(!isRecording)} className={isRecording ? 'bg-red-100' : ''}>
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button onClick={sendMessage} className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white hover:from-green-700 hover:to-yellow-600">
                      <Send className="w-4 h-4 mr-2" />
                      Ohereza Ubutumwa
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-green-600 to-yellow-500 text-white">
                  {selectedMessage?.sender_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{selectedMessage?.sender_name}</p>
                <p className="text-sm text-gray-600">{new Date(selectedMessage?.created_at).toLocaleString('rw-RW')}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900">{selectedMessage?.message}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Reply className="w-4 h-4 mr-2" />
                Subiza
              </Button>
              <Button variant="outline" className="flex-1">
                <Forward className="w-4 h-4 mr-2" />
                Ohereza Abandi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdvancedMessagingWidget;

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, Inbox, Users, Search, Plus, Mail, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import apiService from '@/app/services/apiService';

export default function ParentMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    try {
      await apiService.sendMessage({
        recipient_id: selectedMessage.sender_id,
        subject: `Re: ${selectedMessage.subject}`,
        message: replyText
      });
      setReplyText('');
      alert('Ubutumwa bwoherejwe neza!');
    } catch (err) {
      alert('Byanze kohereza ubutumwa');
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Itumanaho
          </h1>
          <p className="text-gray-600">Vugana n'abarimu n'abakozi b'ishuri</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Ubutumwa Bushya
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-2 border-purple-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Inbox className="w-5 h-5" />
              Ubutumwa Bwanjye
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Shakisha ubutumwa..." 
                className="pl-10 border-2 border-purple-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="h-[600px]">
            <CardContent className="p-0">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Nta butumwa buhari</p>
                </div>
              ) : (
                <div className="divide-y-2 divide-purple-50">
                  {filteredMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedMessage?.id === message.id 
                          ? 'bg-purple-100 border-l-4 border-purple-600' 
                          : 'hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {message.sender_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{message.sender_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{message.created_at ? new Date(message.created_at).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        {!message.read && (
                          <Badge className="bg-purple-600 text-white">Gishya</Badge>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">{message.subject}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{message.message}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 border-2 border-purple-100 shadow-xl">
          {selectedMessage ? (
            <>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedMessage.sender_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{selectedMessage.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="w-3 h-3" />
                        {selectedMessage.sender_name || 'Unknown'} • {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleDateString() : 'N/A'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">{selectedMessage.sender_role || 'Staff'}</Badge>
                </div>
              </CardHeader>
              <ScrollArea className="h-[400px]">
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </CardContent>
              </ScrollArea>
              <div className="border-t-2 border-purple-100 p-6">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Subiza
                </h4>
                <Textarea
                  placeholder="Andika ubutumwa bwawe hano..."
                  className="mb-3 border-2 border-purple-100 min-h-[100px]"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Hagarika</Button>
                  <Button 
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Ohereza
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="p-12 text-center flex flex-col items-center justify-center h-full">
              <MessageSquare className="w-24 h-24 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">Hitamo Ubutumwa</h3>
              <p className="text-gray-500">Hitamo ubutumwa ku ruhande rw'ibumoso kugira ngo ubusome</p>
            </CardContent>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Inbox className="w-12 h-12 mx-auto text-blue-600 mb-2" />
            <p className="text-3xl font-black text-blue-900">{messages.length}</p>
            <p className="text-sm text-gray-600">Ubutumwa Bwose</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 mx-auto text-purple-600 mb-2" />
            <p className="text-3xl font-black text-purple-900">{messages.filter(m => !m.read).length}</p>
            <p className="text-sm text-gray-600">Ubutumwa Bushya</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto text-green-600 mb-2" />
            <p className="text-3xl font-black text-green-900">{new Set(messages.map(m => m.sender_id)).size}</p>
            <p className="text-sm text-gray-600">Abantu Bavuganye Nawe</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

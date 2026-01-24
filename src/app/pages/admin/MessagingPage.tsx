import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, Users, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

const MessagingPage = () => {
  const [stats, setStats] = useState(null);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [smsTemplates, setSmsTemplates] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchTemplates();
    fetchHistory();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messaging/stats/overview');
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const [emailRes, smsRes] = await Promise.all([
        fetch('http://localhost:5000/api/messaging/templates/email'),
        fetch('http://localhost:5000/api/messaging/templates/sms')
      ]);
      const emailData = await emailRes.json();
      const smsData = await smsRes.json();
      if (emailData.success) setEmailTemplates(emailData.templates);
      if (smsData.success) setSmsTemplates(smsData.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messaging/history/email?limit=50');
      const data = await response.json();
      if (data.success) setHistory(data.messages);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">SMS/Email Communication</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.email.total}</div>
                  <div className="text-sm text-gray-600">Total Emails</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.email.sent}</div>
                  <div className="text-sm text-gray-600">Emails Sent</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.sms.total}</div>
                  <div className="text-sm text-gray-600">Total SMS</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.sms.sent}</div>
                  <div className="text-sm text-gray-600">SMS Sent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="send">
        <TabsList>
          <TabsTrigger value="send">Send Message</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent>
              <MessageComposer templates={{ email: emailTemplates, sms: smsTemplates }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Email Templates</span>
                  <Button size="sm">Create Template</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {emailTemplates.map(template => (
                    <div key={template.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.subject}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>SMS Templates</span>
                  <Button size="sm">Create Template</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {smsTemplates.map(template => (
                    <div key={template.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{template.message}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map(msg => (
                  <div key={msg.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{msg.subject || 'SMS Message'}</div>
                        <div className="text-sm text-gray-600">To: {msg.recipient}</div>
                      </div>
                      <Badge variant={msg.status === 'sent' ? 'default' : 'secondary'}>
                        {msg.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MessageComposer = ({ templates }) => {
  const [messageType, setMessageType] = useState('email');
  const [sendMode, setSendMode] = useState('individual');
  const [formData, setFormData] = useState({
    recipients: '',
    subject: '',
    message: '',
    template_id: '',
    group_type: 'class',
    group_ids: []
  });

  const handleSend = async () => {
    try {
      let endpoint = '';
      let body = {};

      if (sendMode === 'individual') {
        endpoint = messageType === 'email' 
          ? 'http://localhost:5000/api/messaging/email/send'
          : 'http://localhost:5000/api/messaging/sms/send';
        
        body = {
          recipients: formData.recipients.split(',').map(r => r.trim()),
          ...(messageType === 'email' ? { subject: formData.subject, body: formData.message } : { message: formData.message }),
          sender_id: 1
        };
      } else {
        endpoint = 'http://localhost:5000/api/messaging/bulk/send';
        body = {
          type: messageType,
          group_type: formData.group_type,
          group_ids: formData.group_ids,
          subject: formData.subject,
          message: formData.message,
          sender_id: 1
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        alert(`Message sent successfully! Sent to ${data.sent || data.messageIds.length} recipients.`);
        setFormData({ recipients: '', subject: '', message: '', template_id: '', group_type: 'class', group_ids: [] });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Message Type</label>
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Send Mode</label>
          <select
            value={sendMode}
            onChange={(e) => setSendMode(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="individual">Individual</option>
            <option value="bulk">Bulk (Groups)</option>
          </select>
        </div>
      </div>

      {sendMode === 'individual' ? (
        <div>
          <label className="block text-sm font-medium mb-2">
            Recipients ({messageType === 'email' ? 'Emails' : 'Phone Numbers'}, comma-separated)
          </label>
          <Input
            placeholder={messageType === 'email' ? 'email1@example.com, email2@example.com' : '+250788123456, +250788654321'}
            value={formData.recipients}
            onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-2">Target Group</label>
          <select
            value={formData.group_type}
            onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="class">Class</option>
            <option value="role">Role</option>
            <option value="parents">Parents</option>
          </select>
          <Input
            placeholder="Group IDs (comma-separated)"
            value={formData.group_ids.join(',')}
            onChange={(e) => setFormData({ ...formData, group_ids: e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) })}
            className="mt-2"
          />
        </div>
      )}

      {messageType === 'email' && (
        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full h-32 px-3 py-2 border rounded-lg"
          placeholder="Type your message here..."
        />
      </div>

      <Button onClick={handleSend} className="w-full">
        <Send className="w-4 h-4 mr-2" /> Send Message
      </Button>
    </div>
  );
};

export default MessagingPage;

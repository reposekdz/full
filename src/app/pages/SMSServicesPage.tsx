import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare, Send, Users, Phone, Mail, Calendar, Clock, CheckCircle,
  AlertTriangle, RefreshCw, Search, Filter, Download, Upload, Settings,
  Eye, Edit, Trash2, Plus, BarChart3, TrendingUp, Activity, Zap,
  Globe, Smartphone, MessageCircle, Bell, Target, Layers, Database
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Checkbox } from '@/app/components/ui/checkbox';

interface SMSMessage {
  id: number;
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
  provider: string;
  cost: number;
  message_type: 'individual' | 'bulk' | 'broadcast';
  campaign_id?: number;
}

interface SMSTemplate {
  id: number;
  name: string;
  content: string;
  category: string;
  variables: string[];
  usage_count: number;
}

interface SMSCampaign {
  id: number;
  name: string;
  message: string;
  recipients_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  created_at: string;
  scheduled_at?: string;
}

const SMSServicesPage: React.FC = () => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    totalCost: 0,
    deliveryRate: 0,
    monthlyUsage: 0,
    activeTemplates: 0
  });

  const [newMessage, setNewMessage] = useState({
    recipients: '',
    message: '',
    template_id: '',
    scheduled_at: '',
    message_type: 'individual'
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'general',
    variables: []
  });

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    message: '',
    recipient_groups: [],
    scheduled_at: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [messagesRes, templatesRes, campaignsRes, statsRes] = await Promise.all([
        apiService.request('/sms/messages'),
        apiService.request('/sms/templates'),
        apiService.request('/sms/campaigns'),
        apiService.request('/sms/statistics')
      ]);

      if (messagesRes.success) setMessages(messagesRes.messages || []);
      if (templatesRes.success) setTemplates(templatesRes.templates || []);
      if (campaignsRes.success) setCampaigns(campaignsRes.campaigns || []);
      if (statsRes.success) setStats(statsRes.stats || stats);
    } catch (error) {
      console.error('Error fetching SMS data:', error);
      toast.error('Failed to load SMS data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await apiService.request('/sms/send', {
        method: 'POST',
        body: JSON.stringify(newMessage)
      });

      if (response.success) {
        toast.success('Message sent successfully');
        setShowSendDialog(false);
        setNewMessage({
          recipients: '',
          message: '',
          template_id: '',
          scheduled_at: '',
          message_type: 'individual'
        });
        await fetchData();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await apiService.request('/sms/templates', {
        method: 'POST',
        body: JSON.stringify(newTemplate)
      });

      if (response.success) {
        toast.success('Template created successfully');
        setShowTemplateDialog(false);
        setNewTemplate({
          name: '',
          content: '',
          category: 'general',
          variables: []
        });
        await fetchData();
      } else {
        toast.error('Failed to create template');
      }
    } catch (error) {
      toast.error('Error creating template');
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await apiService.request('/sms/campaigns', {
        method: 'POST',
        body: JSON.stringify(newCampaign)
      });

      if (response.success) {
        toast.success('Campaign created successfully');
        setShowCampaignDialog(false);
        setNewCampaign({
          name: '',
          message: '',
          recipient_groups: [],
          scheduled_at: ''
        });
        await fetchData();
      } else {
        toast.error('Failed to create campaign');
      }
    } catch (error) {
      toast.error('Error creating campaign');
    }
  };

  const filteredMessages = useMemo(() => {
    let filtered = messages;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.recipient.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    return filtered;
  }, [messages, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SMS Services
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive SMS management and communication platform</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Send className="w-4 h-4 mr-2" />
                  Send SMS
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSent.toLocaleString()}</p>
                </div>
                <Send className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivery Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.deliveryRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalCost.toLocaleString()} RWF</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Send */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Send
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="quick-recipients">Recipients</Label>
                    <Input
                      id="quick-recipients"
                      placeholder="Enter phone numbers (comma separated)"
                      value={newMessage.recipients}
                      onChange={(e) => setNewMessage({...newMessage, recipients: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quick-message">Message</Label>
                    <Textarea
                      id="quick-message"
                      placeholder="Type your message..."
                      value={newMessage.message}
                      onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleSendMessage} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Now
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {messages.slice(0, 5).map((message) => (
                      <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(message.status)}
                          <div>
                            <p className="font-medium text-sm">{message.recipient}</p>
                            <p className="text-xs text-gray-500 truncate max-w-40">{message.message}</p>
                          </div>
                        </div>
                        <Badge className={getStatusBadge(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Messages Sent</span>
                    <span className="text-sm text-gray-500">{stats.monthlyUsage} this month</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Delivery Rate</span>
                    <span className="text-sm text-gray-500">{stats.deliveryRate}%</span>
                  </div>
                  <Progress value={stats.deliveryRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Messages List */}
            <Card>
              <CardHeader>
                <CardTitle>Messages ({filteredMessages.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">Recipient</th>
                        <th className="px-4 py-3 text-left">Message</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Provider</th>
                        <th className="px-4 py-3 text-left">Cost</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredMessages.map((message) => (
                        <tr key={message.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{message.recipient}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm truncate max-w-xs">{message.message}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(message.status)}
                              <Badge className={getStatusBadge(message.status)}>
                                {message.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm">{message.provider}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium">{message.cost} RWF</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-500">
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Message Templates</h3>
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-category">Category</Label>
                      <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="discipline">Discipline</SelectItem>
                          <SelectItem value="fees">Fees</SelectItem>
                          <SelectItem value="events">Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="template-content">Message Content</Label>
                      <Textarea
                        id="template-content"
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleCreateTemplate} className="w-full">
                      Create Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{template.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Used {template.usage_count} times</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">SMS Campaigns</h3>
              <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{campaign.name}</CardTitle>
                      <Badge className={getStatusBadge(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{campaign.message}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Recipients:</span>
                        <span>{campaign.recipients_count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sent:</span>
                        <span>{campaign.sent_count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivered:</span>
                        <span>{campaign.delivered_count}</span>
                      </div>
                      <Progress 
                        value={(campaign.delivered_count / campaign.recipients_count) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Success Rate</span>
                      <span className="font-bold text-green-600">{stats.deliveryRate}%</span>
                    </div>
                    <Progress value={stats.deliveryRate} className="h-3" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                        <p className="text-sm text-gray-500">Delivered</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                        <p className="text-sm text-gray-500">Failed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Spent</span>
                      <span className="font-bold">{stats.totalCost.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average per SMS</span>
                      <span className="font-bold">{(stats.totalCost / stats.totalSent).toFixed(2)} RWF</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Monthly Budget</span>
                      <span className="font-bold">50,000 RWF</span>
                    </div>
                    <Progress value={(stats.totalCost / 50000) * 100} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Send Message Dialog */}
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send SMS Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipients">Recipients</Label>
                <Textarea
                  id="recipients"
                  placeholder="Enter phone numbers (one per line or comma separated)"
                  value={newMessage.recipients}
                  onChange={(e) => setNewMessage({...newMessage, recipients: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="message-type">Message Type</Label>
                <Select value={newMessage.message_type} onValueChange={(value) => setNewMessage({...newMessage, message_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="bulk">Bulk</SelectItem>
                    <SelectItem value="broadcast">Broadcast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template">Use Template (Optional)</Label>
                <Select value={newMessage.template_id} onValueChange={(value) => setNewMessage({...newMessage, template_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message..."
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newMessage.message.length}/160 characters
                </p>
              </div>

              <div>
                <Label htmlFor="scheduled">Schedule (Optional)</Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={newMessage.scheduled_at}
                  onChange={(e) => setNewMessage({...newMessage, scheduled_at: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SMSServicesPage;
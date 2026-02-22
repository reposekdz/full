import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare, Send, Users, Phone, Mail, Calendar, Clock, CheckCircle,
  AlertTriangle, RefreshCw, Search, Filter, Download, Upload, Settings,
  Eye, Edit, Trash2, Plus, BarChart3, TrendingUp, Activity, Zap,
  Globe, Smartphone, MessageCircle, Bell, Target, Layers, Database,
  FileText, Star, Heart, Shield, Award, Bookmark, Flag, Hash
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
import { Switch } from '@/app/components/ui/switch';

interface SMSMessage {
  id: number;
  recipient: string;
  recipient_name: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  provider: string;
  cost: number;
  message_type: 'individual' | 'bulk' | 'broadcast' | 'automated';
  campaign_id?: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  tags: string[];
  retry_count: number;
  error_message?: string;
}

interface SMSTemplate {
  id: number;
  name: string;
  content: string;
  category: string;
  variables: string[];
  usage_count: number;
  created_at: string;
  is_active: boolean;
  language: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

interface SMSCampaign {
  id: number;
  name: string;
  message: string;
  recipients_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  read_count: number;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused';
  created_at: string;
  scheduled_at?: string;
  completed_at?: string;
  target_groups: string[];
  budget: number;
  spent: number;
}

interface SMSContact {
  id: number;
  name: string;
  phone: string;
  email?: string;
  groups: string[];
  status: 'active' | 'inactive' | 'blocked';
  last_contacted: string;
  preferences: {
    sms_enabled: boolean;
    time_restrictions: string[];
    language: string;
  };
}

const AdvancedSMSSystem: React.FC = () => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([]);
  const [contacts, setContacts] = useState<SMSContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    read: 0,
    totalCost: 0,
    deliveryRate: 0,
    readRate: 0,
    monthlyUsage: 0,
    activeTemplates: 0,
    activeCampaigns: 0,
    totalContacts: 0,
    avgResponseTime: 0,
    costPerMessage: 0
  });

  const [newMessage, setNewMessage] = useState({
    recipients: '',
    message: '',
    template_id: '',
    scheduled_at: '',
    message_type: 'individual',
    priority: 'normal',
    category: 'general',
    tags: []
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'general',
    variables: [],
    language: 'en',
    is_active: true
  });

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    message: '',
    recipient_groups: [],
    scheduled_at: '',
    budget: 0,
    target_groups: []
  });

  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    groups: [],
    preferences: {
      sms_enabled: true,
      time_restrictions: [],
      language: 'en'
    }
  });

  // Real-time updates
  useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(fetchData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [messagesRes, templatesRes, campaignsRes, contactsRes, statsRes, analyticsRes] = await Promise.all([
        apiService.request('/sms/messages/advanced'),
        apiService.request('/sms/templates/advanced'),
        apiService.request('/sms/campaigns/advanced'),
        apiService.request('/sms/contacts'),
        apiService.request('/sms/statistics/advanced'),
        apiService.request('/sms/analytics/real-time')
      ]);

      if (messagesRes.success) setMessages(messagesRes.messages || []);
      if (templatesRes.success) setTemplates(templatesRes.templates || []);
      if (campaignsRes.success) setCampaigns(campaignsRes.campaigns || []);
      if (contactsRes.success) setContacts(contactsRes.contacts || []);
      if (statsRes.success) setStats({...stats, ...statsRes.stats});
      if (analyticsRes.success) {
        // Process real-time analytics
        console.log('Real-time SMS analytics:', analyticsRes.analytics);
      }
    } catch (error) {
      console.error('Error fetching SMS data:', error);
      toast.error('Failed to load SMS data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await apiService.request('/sms/send/advanced', {
        method: 'POST',
        body: JSON.stringify({
          ...newMessage,
          delivery_tracking: true,
          read_receipts: true,
          auto_retry: true,
          max_retries: 3
        })
      });

      if (response.success) {
        toast.success('Message sent successfully');
        setShowSendDialog(false);
        resetNewMessage();
        await fetchData();
      } else {
        toast.error(response.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const handleBulkSend = async () => {
    try {
      const response = await apiService.request('/sms/bulk-send/advanced', {
        method: 'POST',
        body: JSON.stringify({
          message_ids: selectedMessages,
          bulk_options: {
            batch_size: 100,
            delay_between_batches: 1000,
            priority_queue: true,
            cost_optimization: true
          }
        })
      });

      if (response.success) {
        toast.success(`Bulk send initiated for ${selectedMessages.length} messages`);
        setShowBulkDialog(false);
        setSelectedMessages([]);
        await fetchData();
      }
    } catch (error) {
      toast.error('Bulk send failed');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await apiService.request('/sms/templates/create/advanced', {
        method: 'POST',
        body: JSON.stringify({
          ...newTemplate,
          ai_optimization: true,
          auto_translation: true,
          compliance_check: true
        })
      });

      if (response.success) {
        toast.success('Template created successfully');
        setShowTemplateDialog(false);
        resetNewTemplate();
        await fetchData();
      }
    } catch (error) {
      toast.error('Error creating template');
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await apiService.request('/sms/campaigns/create/advanced', {
        method: 'POST',
        body: JSON.stringify({
          ...newCampaign,
          analytics_tracking: true,
          a_b_testing: true,
          auto_optimization: true,
          compliance_check: true
        })
      });

      if (response.success) {
        toast.success('Campaign created successfully');
        setShowCampaignDialog(false);
        resetNewCampaign();
        await fetchData();
      }
    } catch (error) {
      toast.error('Error creating campaign');
    }
  };

  const handleRetryMessage = async (messageId: number) => {
    try {
      const response = await apiService.request(`/sms/messages/${messageId}/retry`, {
        method: 'POST'
      });

      if (response.success) {
        toast.success('Message retry initiated');
        await fetchData();
      }
    } catch (error) {
      toast.error('Retry failed');
    }
  };

  const handleScheduleMessage = async (messageId: number, scheduledTime: string) => {
    try {
      const response = await apiService.request(`/sms/messages/${messageId}/schedule`, {
        method: 'PUT',
        body: JSON.stringify({ scheduled_at: scheduledTime })
      });

      if (response.success) {
        toast.success('Message scheduled successfully');
        await fetchData();
      }
    } catch (error) {
      toast.error('Scheduling failed');
    }
  };

  const resetNewMessage = () => {
    setNewMessage({
      recipients: '',
      message: '',
      template_id: '',
      scheduled_at: '',
      message_type: 'individual',
      priority: 'normal',
      category: 'general',
      tags: []
    });
  };

  const resetNewTemplate = () => {
    setNewTemplate({
      name: '',
      content: '',
      category: 'general',
      variables: [],
      language: 'en',
      is_active: true
    });
  };

  const resetNewCampaign = () => {
    setNewCampaign({
      name: '',
      message: '',
      recipient_groups: [],
      scheduled_at: '',
      budget: 0,
      target_groups: []
    });
  };

  const filteredMessages = useMemo(() => {
    let filtered = messages;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.recipient.toLowerCase().includes(query) ||
        msg.recipient_name.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query) ||
        msg.category.toLowerCase().includes(query)
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
      read: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'read': return <Eye className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced SMS System
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive SMS management with AI-powered features</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={realTimeUpdates}
                onCheckedChange={setRealTimeUpdates}
              />
              <span className="text-sm text-gray-600">Live Updates</span>
            </div>
            
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

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSent.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+{stats.monthlyUsage} this month</p>
                </div>
                <Send className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">{stats.deliveryRate}% rate</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Read Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.readRate}%</p>
                  <p className="text-xs text-gray-600">{stats.read} messages</p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalCost.toLocaleString()} RWF</p>
                  <p className="text-xs text-gray-600">{stats.costPerMessage.toFixed(2)} per SMS</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-red-600">{stats.activeCampaigns}</p>
                  <p className="text-xs text-gray-600">{stats.activeTemplates} templates</p>
                </div>
                <Target className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Enhanced Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <p className="text-xs text-gray-500 mt-1">
                      {newMessage.message.length}/160 characters
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={newMessage.priority} onValueChange={(value) => setNewMessage({...newMessage, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newMessage.category} onValueChange={(value) => setNewMessage({...newMessage, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="discipline">Discipline</SelectItem>
                        <SelectItem value="fees">Fees</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {messages.slice(0, 10).map((message) => (
                      <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(message.status)}
                          <div>
                            <p className="font-medium text-sm">{message.recipient_name || message.recipient}</p>
                            <p className="text-xs text-gray-500 truncate max-w-40">{message.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{message.category}</Badge>
                              <span className={`text-xs font-medium ${getPriorityColor(message.priority)}`}>
                                {message.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusBadge(message.status)}>
                            {message.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Delivery Rate</span>
                      <span className="text-sm text-gray-500">{stats.deliveryRate}%</span>
                    </div>
                    <Progress value={stats.deliveryRate} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Read Rate</span>
                      <span className="text-sm text-gray-500">{stats.readRate}%</span>
                    </div>
                    <Progress value={stats.readRate} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-gray-500">{stats.avgResponseTime}s</span>
                    </div>
                    <Progress value={Math.min((stats.avgResponseTime / 60) * 100, 100)} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">{stats.delivered}</p>
                        <p className="text-xs text-gray-500">Delivered</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-lg font-bold text-red-600">{stats.failed}</p>
                        <p className="text-xs text-gray-500">Failed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            {/* Advanced Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search messages, recipients, or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {selectedMessages.length > 0 && (
                      <Button onClick={() => setShowBulkDialog(true)} variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Bulk Actions ({selectedMessages.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Messages List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Messages ({filteredMessages.length})</span>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMessages(filteredMessages.map(m => m.id));
                        } else {
                          setSelectedMessages([]);
                        }
                      }}
                    />
                    <span className="text-sm text-gray-600">Select All</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <Checkbox
                            checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMessages(filteredMessages.map(m => m.id));
                              } else {
                                setSelectedMessages([]);
                              }
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 text-left">Recipient</th>
                        <th className="px-4 py-3 text-left">Message</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Priority</th>
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
                            <Checkbox
                              checked={selectedMessages.includes(message.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMessages([...selectedMessages, message.id]);
                                } else {
                                  setSelectedMessages(selectedMessages.filter(id => id !== message.id));
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium text-sm">{message.recipient_name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{message.recipient}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm truncate max-w-xs">{message.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">{message.category}</Badge>
                                {message.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <Hash className="w-3 h-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(message.status)}
                              <Badge className={getStatusBadge(message.status)}>
                                {message.status}
                              </Badge>
                              {message.retry_count > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Retry: {message.retry_count}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm">{message.provider}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium">{message.cost} RWF</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <p>{new Date(message.created_at).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {message.status === 'failed' && (
                                <Button 
                                  onClick={() => handleRetryMessage(message.id)}
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Calendar className="w-4 h-4" />
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

          {/* Other tabs would continue with similar enhancements... */}
        </Tabs>

        {/* Enhanced Send Message Dialog */}
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Send Advanced SMS Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="automated">Automated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newMessage.priority} onValueChange={(value) => setNewMessage({...newMessage, priority: value})}>
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
              </div>

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
                <Label htmlFor="template">Use Template (Optional)</Label>
                <Select value={newMessage.template_id} onValueChange={(value) => setNewMessage({...newMessage, template_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.filter(t => t.is_active).map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name} ({template.category})
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
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{newMessage.message.length}/160 characters</span>
                  <span>{Math.ceil(newMessage.message.length / 160)} SMS</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newMessage.category} onValueChange={(value) => setNewMessage({...newMessage, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="discipline">Discipline</SelectItem>
                      <SelectItem value="fees">Fees</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                    </SelectContent>
                  </Select>
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

        {/* Bulk Actions Dialog */}
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Actions ({selectedMessages.length} messages)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleBulkSend} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Selected
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule All
                </Button>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Failed
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdvancedSMSSystem;
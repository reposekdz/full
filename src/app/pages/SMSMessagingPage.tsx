import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Users, MessageSquare, CheckCircle, XCircle, Loader, 
  Search, Filter, Calendar, BarChart3, Phone, Smartphone,
  AlertCircle, Clock, TrendingUp, Download, RefreshCw,
  UserCheck, Mail, Bell, Settings, ChevronDown, X
} from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

interface SMSMessagingPageProps {
  staffId: number;
  staffRole: string;
  onNavigate: (page: string) => void;
}

interface Parent {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  has_smartphone: boolean;
  email?: string;
}

interface MessageStatus {
  parentId: number;
  parentName: string;
  phone: string;
  status: 'sending' | 'success' | 'failed';
  method?: 'sms-only' | 'dual' | 'app-only';
  error?: string;
  timestamp: Date;
}

const ALLOWED_ROLES = ['admin', 'director', 'dos', 'dod', 'teacher', 'class_teacher', 'accountant', 'secretary', 'advisor'];

export const SMSMessagingPage: React.FC<SMSMessagingPageProps> = ({ staffId, staffRole, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'class' | 'all' | 'history' | 'stats'>('single');
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParents, setSelectedParents] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [messageStatuses, setMessageStatuses] = useState<MessageStatus[]>([]);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSmartphone, setFilterSmartphone] = useState<'all' | 'smartphone' | 'non-smartphone'>('all');
  const [balance, setBalance] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // Check if user has permission
  const hasPermission = ALLOWED_ROLES.includes(staffRole);

  useEffect(() => {
    if (!hasPermission) return;

    fetchParents();
    fetchClasses();
    fetchBalance();
    fetchStats();
    fetchTemplates();

    // Socket.IO listeners
    socket.on('sms:sending', (data: MessageStatus) => {
      setMessageStatuses(prev => [...prev, { ...data, timestamp: new Date() }]);
    });

    socket.on('sms:sent', (data: any) => {
      setMessageStatuses(prev => 
        prev.map(s => s.parentId === data.parentId 
          ? { ...s, status: 'success', method: data.method } 
          : s
        )
      );
    });

    socket.on('sms:failed', (data: any) => {
      setMessageStatuses(prev => 
        prev.map(s => s.parentId === data.parentId 
          ? { ...s, status: 'failed', error: data.error } 
          : s
        )
      );
    });

    return () => {
      socket.off('sms:sending');
      socket.off('sms:sent');
      socket.off('sms:failed');
    };
  }, [hasPermission, staffRole]);

  const fetchParents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/parents');
      const data = await res.json();
      if (data.success) {
        setParents(data.parents || []);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/classes');
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sms/balance');
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sms/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/sms/history?senderId=${staffId}&limit=50`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sms/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/sms/permissions/${staffRole}`);
      const data = await res.json();
      if (data.success && data.permissions) {
        return data.permissions;
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
    return null;
  };

  const sendToSingleParent = async () => {
    if (!selectedParent || !message) return;

    setSending(true);
    setMessageStatuses([]);

    try {
      const res = await fetch('http://localhost:5000/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: selectedParent,
          message,
          staffId
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage('');
        setSelectedParent(null);
        fetchStats();
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
    } finally {
      setSending(false);
    }
  };

  const sendToBulkParents = async () => {
    if (selectedParents.length === 0 || !message) return;

    setSending(true);
    setMessageStatuses([]);

    try {
      const res = await fetch('http://localhost:5000/api/sms/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentIds: selectedParents,
          message,
          staffId,
          filterBySmartphone: filterSmartphone === 'smartphone' ? 'smartphone-only' : 
                             filterSmartphone === 'non-smartphone' ? 'non-smartphone-only' : null
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage('');
        setSelectedParents([]);
        fetchStats();
      }
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
    } finally {
      setSending(false);
    }
  };

  const sendToClass = async () => {
    if (!selectedClass || !message) return;

    setSending(true);
    setMessageStatuses([]);

    try {
      const res = await fetch('http://localhost:5000/api/sms/send-to-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          message,
          staffId
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage('');
        setSelectedClass(null);
        fetchStats();
      }
    } catch (error) {
      console.error('Error sending to class:', error);
    } finally {
      setSending(false);
    }
  };

  const sendToAll = async () => {
    if (!message) return;
    if (!['admin', 'director'].includes(staffRole)) {
      alert('Only admin and director can send to all parents');
      return;
    }

    if (!confirm('Are you sure you want to send this message to ALL parents?')) {
      return;
    }

    setSending(true);
    setMessageStatuses([]);

    try {
      const res = await fetch('http://localhost:5000/api/sms/send-to-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          staffId
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage('');
        fetchStats();
      }
    } catch (error) {
      console.error('Error sending to all:', error);
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.message_template);
      setSelectedTemplate(templateId);
    }
  };

  const filteredParents = parents.filter(parent => {
    const matchesSearch = 
      parent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm);

    const matchesFilter = 
      filterSmartphone === 'all' ||
      (filterSmartphone === 'smartphone' && parent.has_smartphone) ||
      (filterSmartphone === 'non-smartphone' && !parent.has_smartphone);

    return matchesSearch && matchesFilter;
  });

  const toggleParentSelection = (parentId: number) => {
    setSelectedParents(prev => 
      prev.includes(parentId) 
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };

  const selectAllParents = () => {
    setSelectedParents(filteredParents.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedParents([]);
  };

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You do not have permission to access the SMS messaging system.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Allowed roles: {ALLOWED_ROLES.join(', ')}
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SMS Messaging System</h1>
                <p className="text-sm text-gray-600">Send messages to parents via SMS and app</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-lg font-bold text-green-600">{balance || 'Loading...'}</p>
              </div>
              <button
                onClick={fetchBalance}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {[
              { id: 'single', label: 'Single Parent', icon: Phone },
              { id: 'bulk', label: 'Multiple Parents', icon: Users },
              { id: 'class', label: 'Class', icon: UserCheck },
              ...((['admin', 'director'].includes(staffRole)) ? [{ id: 'all', label: 'All Parents', icon: Bell }] : []),
              { id: 'history', label: 'History', icon: Clock },
              { id: 'stats', label: 'Statistics', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'history') fetchHistory();
                  if (tab.id === 'stats') fetchStats();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Single Parent Tab */}
            {activeTab === 'single' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Send to Single Parent
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Parent</label>
                    <select
                      value={selectedParent || ''}
                      onChange={(e) => setSelectedParent(Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a parent...</option>
                      {parents.map(parent => (
                        <option key={parent.id} value={parent.id}>
                          {parent.first_name} {parent.last_name} - {parent.phone}
                          {parent.has_smartphone ? ' 📱' : ' 📞'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedParent && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {parents.find(p => p.id === selectedParent)?.has_smartphone
                          ? '📱 This parent has a smartphone - message will be sent via app AND SMS'
                          : '📞 This parent has no smartphone - message will be sent via SMS only'}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Message Template (Optional)</label>
                    <select
                      value={selectedTemplate || ''}
                      onChange={(e) => applyTemplate(Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a template...</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message ({message.length}/160 characters)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={5}
                      maxLength={160}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={sendToSingleParent}
                    disabled={sending || !selectedParent || !message}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Bulk Parents Tab */}
            {activeTab === 'bulk' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Send to Multiple Parents
                </h2>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search parents..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={filterSmartphone}
                      onChange={(e) => setFilterSmartphone(e.target.value as any)}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Parents</option>
                      <option value="smartphone">Smartphone Only</option>
                      <option value="non-smartphone">Non-Smartphone Only</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {selectedParents.length} of {filteredParents.length} selected
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllParents}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearSelection}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    {filteredParents.map(parent => (
                      <label
                        key={parent.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedParents.includes(parent.id)}
                          onChange={() => toggleParentSelection(parent.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {parent.first_name} {parent.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{parent.phone}</p>
                        </div>
                        {parent.has_smartphone ? (
                          <Smartphone className="w-5 h-5 text-green-600" />
                        ) : (
                          <Phone className="w-5 h-5 text-gray-400" />
                        )}
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message ({message.length}/160 characters)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={5}
                      maxLength={160}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={sendToBulkParents}
                    disabled={sending || selectedParents.length === 0 || !message}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Sending to {selectedParents.length} parents...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send to {selectedParents.length} Parents
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Class Tab */}
            {activeTab === 'class' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Send to Class Parents
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Class</label>
                    <select
                      value={selectedClass || ''}
                      onChange={(e) => setSelectedClass(Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a class...</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} - {cls.level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message ({message.length}/160 characters)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={5}
                      maxLength={160}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={sendToClass}
                    disabled={sending || !selectedClass || !message}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send to Class
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* All Parents Tab */}
            {activeTab === 'all' && ['admin', 'director'].includes(staffRole) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Send to All Parents
                </h2>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Warning: This will send the message to ALL parents in the school.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message ({message.length}/160 characters)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={5}
                      maxLength={160}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={sendToAll}
                    disabled={sending || !message}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Sending to All...
                      </>
                    ) : (
                      <>
                        <Bell className="w-5 h-5" />
                        Send to All Parents
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Message History
                </h2>

                <div className="space-y-3">
                  {history.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No message history</p>
                  ) : (
                    history.map(msg => (
                      <div key={msg.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{msg.recipient}</p>
                            <p className="text-sm text-gray-600">{msg.sender_name}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            msg.status === 'sent' ? 'bg-green-100 text-green-800' :
                            msg.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{msg.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  SMS Statistics
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Total Messages</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.total_messages}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Sent Successfully</p>
                    <p className="text-3xl font-bold text-green-900">{stats.sent_count}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600 mb-1">Failed</p>
                    <p className="text-3xl font-bold text-red-900">{stats.failed_count}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Unique Recipients</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.unique_recipients}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Status Panel */}
          <div className="space-y-6">
            {messageStatuses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Sending Status</h3>
                  <button
                    onClick={() => setMessageStatuses([])}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {messageStatuses.map((status, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{status.parentName}</p>
                        <p className="text-xs text-gray-600">{status.phone}</p>
                        {status.method && (
                          <p className="text-xs text-blue-600 mt-1">
                            {status.method === 'dual' ? '📱 App + SMS' :
                             status.method === 'sms-only' ? '📞 SMS Only' :
                             '📱 App Only'}
                          </p>
                        )}
                      </div>
                      {status.status === 'sending' && (
                        <Loader className="w-5 h-5 animate-spin text-blue-600" />
                      )}
                      {status.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {status.status === 'failed' && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Info Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">How It Works</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-3">
                  <Smartphone className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p>Parents with smartphones receive messages via app AND SMS</p>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p>Parents without smartphones receive messages via SMS only</p>
                </div>
                <div className="flex gap-3">
                  <Bell className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <p>Real-time delivery status via Socket.IO</p>
                </div>
                <div className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <p>Track message history and statistics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

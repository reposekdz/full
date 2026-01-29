import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Phone, CheckCircle, XCircle, Clock, 
  RefreshCw, Send, AlertCircle, Filter, Search, Download
} from 'lucide-react';

interface SMSMessage {
  id: number;
  phone_number: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export const SMSQueueManagement: React.FC = () => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'sent' | 'failed'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [retrying, setRetrying] = useState<number | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/discipline/sms-queue?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching SMS queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsSent = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/discipline/sms-queue/${id}/mark-sent`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error marking SMS as sent:', error);
    }
  };

  const retrySMS = async (id: number) => {
    setRetrying(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/discipline/sms-queue/${id}/retry`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('SMS sent successfully!');
        fetchMessages();
      } else {
        alert(`Failed to send SMS: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error retrying SMS:', error);
      alert('Error retrying SMS');
    } finally {
      setRetrying(null);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.phone_number.includes(searchTerm) || 
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gucunga Ubutumwa bwa SMS</h1>
                <p className="text-sm text-gray-600">SMS Queue Management - Discipline System</p>
              </div>
            </div>
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Kuvugurura
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Shakisha telefoni cyangwa ubutumwa..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {(['pending', 'sent', 'failed'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'pending' && 'Bitegereje'}
                  {status === 'sent' && 'Byoherejwe'}
                  {status === 'failed' && 'Byanze'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 rounded-xl p-6 border border-yellow-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 mb-1">Bitegereje</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {messages.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-600 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-50 rounded-xl p-6 border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Byoherejwe</p>
                <p className="text-3xl font-bold text-green-900">
                  {messages.filter(m => m.status === 'sent').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-50 rounded-xl p-6 border border-red-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 mb-1">Byanze</p>
                <p className="text-3xl font-bold text-red-900">
                  {messages.filter(m => m.status === 'failed').length}
                </p>
              </div>
              <XCircle className="w-12 h-12 text-red-600 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Ubutumwa ({filteredMessages.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nta butumwa bubonetse</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(msg.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{msg.phone_number}</span>
                          {getStatusBadge(msg.status)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(msg.created_at).toLocaleString('rw-RW')}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-2 bg-gray-50 p-3 rounded-lg">
                        {msg.message}
                      </p>

                      {msg.error_message && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">{msg.error_message}</p>
                        </div>
                      )}

                      {msg.sent_at && (
                        <p className="text-xs text-green-600">
                          ✓ Yoherejwe: {new Date(msg.sent_at).toLocaleString('rw-RW')}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {msg.status === 'pending' && (
                          <button
                            onClick={() => markAsSent(msg.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Menya nk'iyoherejwe
                          </button>
                        )}

                        {(msg.status === 'failed' || msg.status === 'pending') && (
                          <button
                            onClick={() => retrySMS(msg.id)}
                            disabled={retrying === msg.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {retrying === msg.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Ongera ukohereze
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Amakuru y'ingenzi
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Bitegereje:</strong> Ubutumwa butarashyikirizwa kuri telefoni y'umubyeyi</li>
            <li>• <strong>Byoherejwe:</strong> Ubutumwa bwashyikirijwe neza</li>
            <li>• <strong>Byanze:</strong> Ubutumwa bwanze gushyikirizwa (ikosa rya telefoni cyangwa serivisi)</li>
            <li>• Kanda "Ongera ukohereze" kugira ngo ugerageze kongera kohereza ubutumwa bwanze</li>
            <li>• Kanda "Menya nk'iyoherejwe" niba wohereje ubutumwa mu buryo bw'intoki</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

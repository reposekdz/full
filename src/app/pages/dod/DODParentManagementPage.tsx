import React, { useState, useEffect } from 'react';
import { Users, Search, MessageSquare, Send, Phone, Mail, Eye, X, Home, User, FileText, Calendar, BarChart3, Scale, FileSpreadsheet, AlertCircle, CheckCircle, Filter, Loader2 } from 'lucide-react';
import { apiService } from '@/app/services/apiService';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface Parent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  children_count: number;
  children_names: string;
  student_ids: string;
  is_active: boolean;
}

interface ParentDetails {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  total_children: number;
}

interface Child {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  trade_name: string;
  trade_code: string;
  class_name: string;
  level: number;
  relationship: string;
  enrollment_status: string;
}

interface DisciplineRecord {
  id: number;
  student_id: number;
  incident_type: string;
  incident_date: string;
  severity: string;
  status: string;
  description: string;
  student_first_name: string;
  student_last_name: string;
  student_number: string;
}

const DODParentManagementPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChildrenFilter, setHasChildrenFilter] = useState<'all' | 'yes' | 'no'>('yes');
  const [selectedParent, setSelectedParent] = useState<ParentDetails | null>(null);
  const [parentChildren, setParentChildren] = useState<Child[]>([]);
  const [parentDiscipline, setParentDiscipline] = useState<DisciplineRecord[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [bulkMessageModalOpen, setBulkMessageModalOpen] = useState(false);
  const [selectedParents, setSelectedParents] = useState<number[]>([]);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    send_sms: false
  });
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadParents();
  }, []);

  useEffect(() => {
    filterParents();
  }, [searchTerm, hasChildrenFilter, parents]);

  const loadParents = async () => {
    try {
      setLoading(true);
      const hasChildren = hasChildrenFilter === 'yes' ? 'true' : hasChildrenFilter === 'no' ? 'false' : undefined;
      const data = await apiService.getAllParents({ has_children: hasChildren, limit: 200 });
      setParents(data.parents || []);
    } catch (error) {
      console.error('Error loading parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParents = () => {
    let filtered = [...parents];
    
    if (searchTerm) {
      filtered = filtered.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.children_names?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (hasChildrenFilter === 'yes') {
      filtered = filtered.filter(p => p.children_count > 0);
    } else if (hasChildrenFilter === 'no') {
      filtered = filtered.filter(p => p.children_count === 0);
    }

    setFilteredParents(filtered);
  };

  const viewParentDetails = async (parent: Parent) => {
    try {
      const data = await apiService.getParentDetailsWithChildren(parent.id);
      setSelectedParent(data.parent);
      setParentChildren(data.children || []);
      setParentDiscipline(data.recent_discipline_records || []);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error('Error loading parent details:', error);
      alert('Failed to load parent details');
    }
  };

  const openMessageModal = (parent: Parent) => {
    setSelectedParent(parent as any);
    setMessageForm({ subject: '', message: '', priority: 'normal', send_sms: false });
    setMessageModalOpen(true);
  };

  const sendMessage = async () => {
    if (!selectedParent || !messageForm.subject || !messageForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      await apiService.sendParentMessage(selectedParent.id, messageForm);
      setSuccessMessage('Message sent successfully!');
      setMessageModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendBulkMessage = async () => {
    if (selectedParents.length === 0 || !messageForm.subject || !messageForm.message) {
      alert('Please select parents and fill in all required fields');
      return;
    }

    try {
      setSending(true);
      await apiService.sendBulkParentMessage({
        parent_ids: selectedParents,
        ...messageForm
      });
      setSuccessMessage(`Message sent to ${selectedParents.length} parents!`);
      setBulkMessageModalOpen(false);
      setSelectedParents([]);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error sending bulk message:', error);
      alert('Failed to send bulk message');
    } finally {
      setSending(false);
    }
  };

  const toggleParentSelection = (parentId: number) => {
    setSelectedParents(prev =>
      prev.includes(parentId) ? prev.filter(id => id !== parentId) : [...prev, parentId]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col fixed inset-y-0 z-40 mt-16">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-purple-600 via-indigo-500 to-blue-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home },
              { id: 'dod-profile', label: 'Profile', Icon: User },
              { id: 'dod-discipline', label: 'Discipline', Icon: FileText },
              { id: 'dod-leave', label: 'Leave', Icon: Calendar },
              { id: 'dod-students', label: 'Students', Icon: Users },
              { id: 'dod-parent-management', label: 'Parents', Icon: Users, active: true },
              { id: 'dod-reports', label: 'Reports', Icon: BarChart3 },
              { id: 'dod-punishments', label: 'Punishments', Icon: Scale },
              { id: 'dod-student-sheets', label: 'Sheets', Icon: FileSpreadsheet }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  item.active
                    ? 'bg-white text-purple-700 shadow-lg scale-105 font-bold'
                    : 'text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex-1 pt-16">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <button
              onClick={() => onNavigate('director-discipline-dashboard')}
              className="mb-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                  <Users className="w-10 h-10 text-purple-600" />
                  Parent Management
                </h1>
                <p className="text-gray-600 mt-2">Manage parent communications and view student information</p>
              </div>

              <Button
                onClick={() => {
                  setMessageForm({ subject: '', message: '', priority: 'normal', send_sms: false });
                  setBulkMessageModalOpen(true);
                }}
                disabled={selectedParents.length === 0}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Message Selected ({selectedParents.length})
              </Button>
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search by name, email, phone, or children..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Has Children</Label>
                  <select
                    value={hasChildrenFilter}
                    onChange={(e) => setHasChildrenFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Parents</option>
                    <option value="yes">With Children</option>
                    <option value="no">Without Children</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button onClick={loadParents} variant="outline" className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{parents.length}</div>
                  <div className="text-sm text-gray-600">Total Parents</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {parents.filter(p => p.children_count > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">With Children</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {parents.reduce((sum, p) => sum + p.children_count, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Connections</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{filteredParents.length}</div>
                  <div className="text-sm text-gray-600">Showing</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Parents Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredParents.map((parent) => (
              <motion.div
                key={parent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedParents.includes(parent.id)}
                    onChange={() => toggleParentSelection(parent.id)}
                    className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {parent.first_name} {parent.last_name}
                          {parent.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                          )}
                        </h3>

                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          {parent.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {parent.email}
                            </div>
                          )}
                          {parent.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {parent.phone}
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <Badge className="bg-purple-100 text-purple-800">
                            {parent.children_count} Child{parent.children_count !== 1 ? 'ren' : ''}
                          </Badge>
                          {parent.children_names && (
                            <div className="mt-2 text-sm text-gray-700">
                              <strong>Children:</strong> {parent.children_names}
                            </div>
                          )}
                          {parent.student_ids && (
                            <div className="text-sm text-gray-500">
                              <strong>IDs:</strong> {parent.student_ids}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => viewParentDetails(parent)}
                          variant="outline"
                          size="sm"
                          className="w-full md:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => openMessageModal(parent)}
                          size="sm"
                          className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredParents.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No parents found matching your criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Parent Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-600">
              Parent Details
            </DialogTitle>
          </DialogHeader>

          {selectedParent && (
            <div className="space-y-6">
              {/* Parent Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Name</Label>
                      <p className="font-semibold">
                        {selectedParent.first_name} {selectedParent.last_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-semibold">{selectedParent.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-semibold">{selectedParent.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Address</Label>
                      <p className="font-semibold">{selectedParent.address || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Children */}
              <Card>
                <CardHeader>
                  <CardTitle>Linked Children ({parentChildren.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parentChildren.map((child) => (
                      <div key={child.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">
                              {child.first_name} {child.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">ID: {child.student_id}</p>
                            <p className="text-sm text-gray-600">
                              Relationship: <span className="font-semibold">{child.relationship}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="mb-1">{child.trade_name}</Badge>
                            <p className="text-sm text-gray-600">Level {child.level}</p>
                            {child.class_name && (
                              <p className="text-sm text-gray-600">{child.class_name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {parentChildren.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No children linked</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Discipline Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Discipline Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parentDiscipline.map((record) => (
                      <div key={record.id} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">
                              {record.student_first_name} {record.student_last_name}
                            </p>
                            <p className="text-sm text-gray-600">{record.student_number}</p>
                          </div>
                          <Badge className={getSeverityColor(record.severity)}>
                            {record.severity}
                          </Badge>
                        </div>
                        <p className="font-semibold text-gray-900">{record.incident_type}</p>
                        <p className="text-sm text-gray-700 mt-1">{record.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(record.incident_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}

                    {parentDiscipline.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No discipline records</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-600">
              Send Message to Parent
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Recipient</Label>
              <Input
                value={selectedParent ? `${selectedParent.first_name} ${selectedParent.last_name}` : ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label>Subject *</Label>
              <Input
                placeholder="Enter subject"
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
              />
            </div>

            <div>
              <Label>Message *</Label>
              <Textarea
                placeholder="Enter your message"
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <select
                  value={messageForm.priority}
                  onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="send_sms"
                  checked={messageForm.send_sms}
                  onChange={(e) => setMessageForm({ ...messageForm, send_sms: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <Label htmlFor="send_sms" className="ml-2 cursor-pointer">
                  Send SMS copy
                </Label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setMessageModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={sendMessage}
                disabled={sending || !messageForm.subject || !messageForm.message}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Message Modal */}
      <Dialog open={bulkMessageModalOpen} onOpenChange={setBulkMessageModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-600">
              Send Message to {selectedParents.length} Parents
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input
                placeholder="Enter subject"
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
              />
            </div>

            <div>
              <Label>Message *</Label>
              <Textarea
                placeholder="Enter your message"
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <select
                  value={messageForm.priority}
                  onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="bulk_send_sms"
                  checked={messageForm.send_sms}
                  onChange={(e) => setMessageForm({ ...messageForm, send_sms: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <Label htmlFor="bulk_send_sms" className="ml-2 cursor-pointer">
                  Send SMS copy
                </Label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setBulkMessageModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={sendBulkMessage}
                disabled={sending || !messageForm.subject || !messageForm.message}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to All
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DODParentManagementPage;

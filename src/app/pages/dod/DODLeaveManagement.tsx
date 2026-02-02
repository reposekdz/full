import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Search, Filter, Calendar, Clock, CheckCircle, XCircle, User, Phone, MapPin, FileText, TrendingUp, Users, AlertCircle, Loader2, Download, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { DirectStudentSelector } from '@/app/components/DirectStudentSelector';

interface DODLeaveManagementProps {
  onNavigate: (page: string) => void;
}

const DODLeaveManagement: React.FC<DODLeaveManagementProps> = ({ onNavigate }) => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [statistics, setStatistics] = useState<any>(null);
  
  const [newLeave, setNewLeave] = useState({
    student_id: '',
    leave_type: 'sick',
    reason: '',
    start_time: '',
    end_time: '',
    approved_by: 'dod',
    approved_by_name: ''
  });

  useEffect(() => {
    fetchLeaves();
    fetchStatistics();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/discipline-management/leave/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLeaves(data.leaves || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/discipline-management/leave/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleCreateLeave = async () => {
    if (!newLeave.student_id || !newLeave.start_time || !newLeave.reason) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/discipline-management/leave/grant', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLeave)
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccessMessage('Leave granted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowCreateModal(false);
        setNewLeave({
          student_id: '',
          leave_type: 'sick',
          reason: '',
          start_time: '',
          end_time: '',
          approved_by: 'dod',
          approved_by_name: ''
        });
        fetchLeaves();
        fetchStatistics();
      } else {
        alert(data.message || 'Failed to grant leave');
      }
    } catch (error) {
      alert('Failed to grant leave');
    } finally {
      setProcessing(false);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = searchQuery === '' ||
      leave.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;
    const matchesType = filterType === 'all' || leave.leave_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">Gucunga Uruhushya</h1>
          <p className="text-gray-600">Manage student leave requests and history</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Grant Leave
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Total Leaves</p>
                  <p className="text-4xl font-black text-blue-600">{statistics?.total_leaves || 0}</p>
                </div>
                <Plane className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="border-2 border-green-200 shadow-xl">
            <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Active Leaves</p>
                  <p className="text-4xl font-black text-green-600">{statistics?.active_leaves || 0}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="border-2 border-red-200 shadow-xl">
            <CardContent className="p-6 bg-gradient-to-br from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Sick Leaves</p>
                  <p className="text-4xl font-black text-red-600">{statistics?.sick_leaves || 0}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="border-2 border-purple-200 shadow-xl">
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">This Month</p>
                  <p className="text-4xl font-black text-purple-600">{statistics?.month_leaves || 0}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-2 border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="sick">Sick Leave</option>
              <option value="home">Home Visit</option>
              <option value="emergency">Emergency</option>
              <option value="family">Family Matter</option>
              <option value="medical">Medical</option>
              <option value="other">Other</option>
            </select>

            <Button variant="outline" className="border-2">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leave History Table */}
      <Card className="border-2 border-gray-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Leave History ({filteredLeaves.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-semibold">No leave records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Reason</th>
                    <th className="text-left py-3 px-4">Start Date</th>
                    <th className="text-left py-3 px-4">End Date</th>
                    <th className="text-left py-3 px-4">Duration</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Approved By</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave, index) => (
                    <motion.tr
                      key={leave.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-blue-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold">{leave.student_name}</p>
                          <p className="text-xs text-gray-500">{leave.student_id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          leave.leave_type === 'sick' ? 'bg-red-100 text-red-700' :
                          leave.leave_type === 'home' ? 'bg-blue-100 text-blue-700' :
                          leave.leave_type === 'emergency' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {leave.leave_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm max-w-xs truncate">{leave.reason}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{new Date(leave.start_time).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(leave.start_time).toLocaleTimeString()}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{leave.end_time ? new Date(leave.end_time).toLocaleDateString() : 'N/A'}</p>
                        <p className="text-xs text-gray-500">{leave.end_time ? new Date(leave.end_time).toLocaleTimeString() : ''}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-semibold">{leave.duration || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          leave.status === 'active' ? 'bg-green-100 text-green-700' :
                          leave.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {leave.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{leave.approved_by_name || leave.approved_by}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Leave Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Plane className="w-6 h-6" />
                  Create Leave Request
                </h2>
                <p className="text-green-100 mt-1">Grant student leave and notify parents</p>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Student Selection */}
                <div className="space-y-2">
                  <DirectStudentSelector
                    value={newLeave.student_id}
                    onChange={(studentId) => setNewLeave({ ...newLeave, student_id: studentId })}
                    label="Hitamo Umunyeshuri (Select Student)"
                    placeholder="Search by name, ID, trade, or level..."
                    required={true}
                  />
                </div>

                {/* Leave Type */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700 text-base">Ubwoko bw'Uruhushya (Leave Type) *</Label>
                  <select
                    value={newLeave.leave_type}
                    onChange={(e) => setNewLeave({ ...newLeave, leave_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-800 font-medium"
                  >
                    <option value="sick">🤒 Sick Leave (Kurwara)</option>
                    <option value="home">🏠 Home Visit (Kuja Murugo)</option>
                    <option value="emergency">🚨 Emergency (Ihutirwa)</option>
                    <option value="family">👨‍👩‍👧 Family Matter (Ikibazo cy'Umuryango)</option>
                    <option value="medical">🏥 Medical Appointment (Kujya Kwa Muganga)</option>
                    <option value="other">📋 Other (Ikindi)</option>
                  </select>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700 text-base">Impamvu (Reason) *</Label>
                  <Textarea
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    placeholder="Andika impamvu y'uruhushya... (Enter reason for leave...)"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700 text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      Itariki yo Gutangira (Start Date & Time) *
                    </Label>
                    <Input
                      type="datetime-local"
                      value={newLeave.start_time}
                      onChange={(e) => setNewLeave({ ...newLeave, start_time: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700 text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Itariki yo Kurangiza (End Date & Time)
                    </Label>
                    <Input
                      type="datetime-local"
                      value={newLeave.end_time}
                      onChange={(e) => setNewLeave({ ...newLeave, end_time: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Approved By */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700 text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    Byemejwe na (Approved By) *
                  </Label>
                  <Input
                    value={newLeave.approved_by_name}
                    onChange={(e) => setNewLeave({ ...newLeave, approved_by_name: e.target.value })}
                    placeholder="Andika amazina yawe yose (Your full name)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-800 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Parents will be automatically notified via SMS/WhatsApp about this leave.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLeave}
                  disabled={processing}
                  className="bg-gradient-to-r from-green-600 to-emerald-700 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Grant Leave
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DODLeaveManagement;

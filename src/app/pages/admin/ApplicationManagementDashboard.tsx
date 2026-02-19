import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, CheckCircle, XCircle, Clock, Eye, Download, Filter, Search,
  TrendingUp, Award, FileText, MessageSquare, Calendar, Phone, Mail,
  MapPin, GraduationCap, Star, AlertCircle, RefreshCw, ChevronDown,
  ChevronUp, Image as ImageIcon, Trash2, Edit, Send, User, BarChart3,
  PieChart, TrendingDown, Activity, Building, Briefcase, FileCheck,
  FileX, UsersRound, Send as SendIcon, Download as DownloadIcon, Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { API_BASE_URL } from '@/app/config/apiBase';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'sonner';
import { RWANDA_PROVINCES, getDistrictsForProvince, getSectorsForDistrict } from '@/app/data/rwandaLocations';

// Garden TVET School Branding
const SCHOOL_NAME = 'GARDEN TVET SCHOOL';
const SCHOOL_TAGLINE = 'Kigali, Rwanda - Excellence in Technical Education'

interface ApplicationManagementDashboardProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

interface Application {
  id: number;
  application_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  profile_photo: string;
  report_card_image: string;
  trade_code: string;
  trade_name: string;
  level_number: number;
  status: string;
  application_date: string;
  days_pending?: number;
  dos_score?: number;
  dos_recommendation?: string;
  dos_comments?: string;
}

const ApplicationManagementDashboard: React.FC<ApplicationManagementDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    trade_code: '',
    status: 'all',
    province: '',
    district: '',
    sector: ''
  });
  const [reviewData, setReviewData] = useState({
    recommendation: '',
    score: 0,
    comments: ''
  });
  const [headmasterDecision, setHeadmasterDecision] = useState({
    decision: '',
    comments: '',
    rejection_reason: ''
  });

  // Enhanced Features State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    location: '',
    notes: ''
  });
  const [activeTab, setActiveTab] = useState('all');
  const [trades, setTrades] = useState<any[]>([]);

  const isDOS = user?.role === 'director_study' || user?.role === 'director_of_study' || user?.role === 'admin';
  const isHeadmaster = user?.role === 'headmaster' || user?.role === 'admin';

  useEffect(() => {
    fetchApplications();
    fetchStatistics();
    fetchTrades();
  }, [filters]);

  // Fetch trades for filtering
  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/trades`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success || data.trades) {
        setTrades(data.trades || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isDOS
        ? '/student-applications/dos/pending'
        : isHeadmaster
        ? '/student-applications/headmaster/pending'
        : '/student-applications/all';
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.trade_code) params.append('trade_code', filters.trade_code);
      if (filters.province) params.append('province', filters.province);
      if (filters.district) params.append('district', filters.district);
      if (filters.sector) params.append('sector', filters.sector);

      let response = await fetch(`${API_BASE_URL}${endpoint}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let data = await response.json();
      if (!data.success) {
        const fallback = await fetch(`${API_BASE_URL}/student-applications-production/list?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json());
        if (fallback.success && fallback.data) {
          data = { success: true, applications: fallback.data };
        }
      }
      if (data.success) {
        setApplications(data.applications || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      let response = await fetch(`${API_BASE_URL}/student-applications/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let data = await response.json();
      if (!data.success) {
        const fallback = await fetch(`${API_BASE_URL}/student-applications-production/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json());
        if (fallback.success && fallback.data) data = { success: true, statistics: fallback.data };
      }
      if (data.success) {
        setStatistics(data.statistics || data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Enhanced helper functions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map(a => a.id));
    }
  };

  const handleSelectId = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one application');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const endpoint = bulkAction === 'approve' 
        ? '/student-applications/bulk-approve'
        : '/student-applications/bulk-reject';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_ids: selectedIds })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`${selectedIds.length} applications ${bulkAction}d successfully`);
        setShowBulkModal(false);
        setSelectedIds([]);
        fetchApplications();
        fetchStatistics();
      } else {
        toast.error(data.message || 'Bulk operation failed');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['App No', 'Name', 'Phone', 'Trade', 'Level', 'Status', 'Date'].join(','),
      ...filteredApplications.map(app => [
        app.application_number,
        `${app.first_name} ${app.last_name}`,
        app.phone,
        app.trade_name || app.trade_code,
        app.level_number,
        app.status,
        new Date(app.application_date).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garden_tvet_applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Applications exported successfully');
  };

  const handleSendSMS = async () => {
    if (!smsMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const phones = selectedIds.length > 0 
        ? filteredApplications.filter(a => selectedIds.includes(a.id)).map(a => a.phone)
        : [selectedApplication?.phone];

      const response = await fetch(`${API_BASE_URL}/sms/bulk`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones, message: smsMessage })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('SMS sent successfully');
        setShowSMSModal(false);
        setSmsMessage('');
      } else {
        toast.error(data.message || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS error:', error);
      toast.error('Failed to send SMS');
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewData.date || !interviewData.time) {
      toast.error('Please select date and time');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admissions/interviews`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: selectedApplication?.id,
          interview_date: interviewData.date,
          interview_time: interviewData.time,
          location: interviewData.location,
          notes: interviewData.notes
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Interview scheduled successfully');
        setShowInterviewModal(false);
        setInterviewData({ date: '', time: '', location: '', notes: '' });
      } else {
        toast.error(data.message || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Interview scheduling error:', error);
      toast.error('Failed to schedule interview');
    }
  };

  // Filter applications based on active tab
  const filteredApplications = applications.filter(app => {
    if (activeTab === 'pending') return app.status === 'pending';
    if (activeTab === 'approved') return app.status === 'approved';
    if (activeTab === 'rejected') return app.status === 'rejected';
    return true;
  });

  const handleDOSReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/student-applications/dos/review/${selectedApplication?.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reviewData)
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Application reviewed successfully');
        setShowReviewModal(false);
        fetchApplications();
        fetchStatistics();
      } else {
        toast.error(data.message || 'Failed to review application');
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application');
    }
  };

  const handleHeadmasterDecision = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/student-applications/headmaster/decide/${selectedApplication?.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(headmasterDecision)
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Decision recorded successfully');
        setShowReviewModal(false);
        fetchApplications();
        fetchStatistics();
      } else {
        toast.error(data.message || 'Failed to record decision');
      }
    } catch (error) {
      console.error('Error recording decision:', error);
      toast.error('Failed to record decision');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Bitegerejwe' },
      under_review_dos: { color: 'bg-blue-100 text-blue-800', label: 'DOS Arasuzuma' },
      approved_dos: { color: 'bg-green-100 text-green-800', label: 'DOS Yemeje' },
      rejected_dos: { color: 'bg-red-100 text-red-800', label: 'DOS Yanze' },
      under_review_headmaster: { color: 'bg-purple-100 text-purple-800', label: 'Umuyobozi Arasuzuma' },
      approved: { color: 'bg-green-500 text-white', label: 'Byemejwe' },
      rejected: { color: 'bg-red-500 text-white', label: 'Byanzwe' },
      enrolled: { color: 'bg-indigo-500 text-white', label: 'Yiyandikishije' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Garden TVET School Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-wide">{SCHOOL_NAME}</h1>
                <p className="text-green-100 font-medium">{SCHOOL_TAGLINE}</p>
              </div>
            </div>
            <div className="text-right text-green-100">
              <p className="font-semibold">Student Applications Management</p>
              <p className="text-sm">Powered by Real Database APIs</p>
            </div>
          </div>
        </motion.div>

        {/* Role-based Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              {isDOS ? 'DOS - Application Review' : isHeadmaster ? 'Headmaster - Final Approval' : 'Application Management'}
            </h1>
            <p className="text-gray-600">Manage and review student applications — real data from database</p>
          </div>
          <div className="flex gap-2">
            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => { setBulkAction('approve'); setShowBulkModal(true); }}
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Approve ({selectedIds.length})
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => { setBulkAction('reject'); setShowBulkModal(true); }}
                >
                  <FileX className="w-4 h-4 mr-2" />
                  Reject ({selectedIds.length})
                </Button>
              </>
            )}
            {/* Export Button */}
            <Button variant="outline" onClick={handleExportCSV}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            {/* SMS Button */}
            <Button 
              variant="outline"
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              onClick={() => setShowSMSModal(true)}
            >
              <SendIcon className="w-4 h-4 mr-2" />
              Send SMS
            </Button>
            {/* Refresh Button */}
            <Button variant="outline" onClick={() => { fetchApplications(); fetchStatistics(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {onNavigate && (
              <Button variant="outline" onClick={() => onNavigate(isHeadmaster ? 'dashboard-headmaster' : isDOS ? 'dashboard-director-study' : 'dashboard')}>
                Back to Dashboard
              </Button>
            )}
            {onLogout && (
              <Button variant="destructive" onClick={onLogout}>Logout</Button>
            )}
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                      <p className="text-3xl font-black text-blue-600">{statistics.total_applications}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                      <p className="text-3xl font-black text-yellow-600">{statistics.pending}</p>
                    </div>
                    <Clock className="w-12 h-12 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Approved</p>
                      <p className="text-3xl font-black text-green-600">{statistics.approved}</p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Enrolled</p>
                      <p className="text-3xl font-black text-purple-600">{statistics.enrolled}</p>
                    </div>
                    <GraduationCap className="w-12 h-12 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 border-2 border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name or application number..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <select
                value={filters.trade_code}
                onChange={(e) => setFilters({ ...filters, trade_code: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Trades</option>
                <option value="SOD">Software Development</option>
                <option value="BDC">Building Construction</option>
                <option value="AUT">Automotive Technology</option>
              </select>
              <select
                value={filters.province}
                onChange={(e) => setFilters({ ...filters, province: e.target.value, district: '', sector: '' })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Provinces</option>
                {RWANDA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value, sector: '' })}
                disabled={!filters.province}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">All Districts</option>
                {getDistrictsForProvince(filters.province).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                disabled={!filters.district}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">All Sectors</option>
                {getSectorsForDistrict(filters.district).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <Button onClick={fetchApplications} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border-2 border-gray-200 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" /> All ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                <Clock className="w-4 h-4 mr-2" /> Pending ({applications.filter(a => a.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <CheckCircle className="w-4 h-4 mr-2" /> Approved ({applications.filter(a => a.status === 'approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                <XCircle className="w-4 h-4 mr-2" /> Rejected ({applications.filter(a => a.status === 'rejected').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Applications List */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Applications ({filteredApplications.length})
              </div>
              {/* Select All Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredApplications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition ${selectedIds.includes(app.id) ? 'border-green-500 bg-green-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox for Bulk Selection */}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app.id)}
                      onChange={() => handleSelectId(app.id)}
                      className="w-5 h-5 rounded border-gray-300 mt-2"
                    />
                    {/* Profile Photo */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {app.profile_photo ? (
                        <img src={`${API_BASE_URL}/${app.profile_photo}`} alt={app.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full p-3 text-gray-400" />
                      )}
                    </div>

                    {/* Application Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{app.first_name} {app.last_name}</h3>
                          <p className="text-sm text-gray-600">{app.application_number}</p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {app.phone}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <GraduationCap className="w-4 h-4" />
                          {app.trade_name} - Level {app.level_number}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(app.application_date).toLocaleDateString()}
                        </div>
                        {app.days_pending && (
                          <div className="flex items-center gap-1 text-orange-600 font-semibold">
                            <Clock className="w-4 h-4" />
                            {app.days_pending} days pending
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowDetails(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>

                        {isDOS && app.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowReviewModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Star className="w-4 h-4" />
                            Review
                          </Button>
                        )}

                        {isHeadmaster && app.status === 'approved_dos' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowReviewModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Decide
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No applications found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                    {selectedApplication.profile_photo ? (
                      <img src={`${API_BASE_URL}/${selectedApplication.profile_photo}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedApplication.first_name} {selectedApplication.last_name}</h3>
                    <p className="text-gray-600">{selectedApplication.application_number}</p>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </div>

                {/* Report Card */}
                {selectedApplication.report_card_image && (
                  <div>
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Report Card
                    </h4>
                    <img 
                      src={`${API_BASE_URL}/${selectedApplication.report_card_image}`} 
                      alt="Report Card" 
                      className="w-full rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedApplication.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isDOS ? 'DOS Review' : 'Headmaster Decision'}</DialogTitle>
            </DialogHeader>
            {isDOS ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Recommendation</label>
                  <select
                    value={reviewData.recommendation}
                    onChange={(e) => setReviewData({ ...reviewData, recommendation: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select...</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                    <option value="needs_interview">Needs Interview</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Score (0-100)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewData.score}
                    onChange={(e) => setReviewData({ ...reviewData, score: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comments</label>
                  <textarea
                    value={reviewData.comments}
                    onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Decision</label>
                  <select
                    value={headmasterDecision.decision}
                    onChange={(e) => setHeadmasterDecision({ ...headmasterDecision, decision: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select...</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="needs_more_info">Needs More Info</option>
                  </select>
                </div>
                {headmasterDecision.decision === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                    <Input
                      value={headmasterDecision.rejection_reason}
                      onChange={(e) => setHeadmasterDecision({ ...headmasterDecision, rejection_reason: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Comments</label>
                  <textarea
                    value={headmasterDecision.comments}
                    onChange={(e) => setHeadmasterDecision({ ...headmasterDecision, comments: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewModal(false)}>Cancel</Button>
              <Button onClick={isDOS ? handleDOSReview : handleHeadmasterDecision} className="bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Action Modal */}
        <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Bulk {bulkAction === 'approve' ? 'Approval' : 'Rejection'}</DialogTitle>
            </DialogHeader>
            <p className="py-4">Are you sure you want to {bulkAction} {selectedIds.length} application(s)? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkModal(false)}>Cancel</Button>
              <Button variant={bulkAction === 'approve' ? 'default' : 'destructive'} onClick={handleBulkAction}>
                {bulkAction === 'approve' ? 'Approve' : 'Reject'} {selectedIds.length} Application(s)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SMS Modal */}
        <Dialog open={showSMSModal} onOpenChange={setShowSMSModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send SMS to Applicants</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your message..."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSMSModal(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSendSMS}>
                <SendIcon className="w-4 h-4 mr-2" /> Send SMS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Interview Modal */}
        <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <Input
                  type="time"
                  value={interviewData.time}
                  onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  value={interviewData.location}
                  onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
                  placeholder="Interview location"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInterviewModal(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleScheduleInterview}>
                <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Modal Dialogs for Enhanced Features
const BulkActionModal = ({ show, onClose, onConfirm, count, action }: any) => (
  <Dialog open={show} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Bulk {action === 'approve' ? 'Approval' : 'Rejection'}</DialogTitle>
      </DialogHeader>
      <p className="py-4">Are you sure you want to {action} {count} application(s)? This action cannot be undone.</p>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={action === 'approve' ? 'default' : 'destructive'} onClick={onConfirm}>
          {action === 'approve' ? 'Approve' : 'Reject'} {count} Application(s)
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const SMSModal = ({ show, onClose, onSend, message, setMessage }: any) => (
  <Dialog open={show} onOpenChange={onClose}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Send SMS to Applicants</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your message..."
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={onSend}>
          <SendIcon className="w-4 h-4 mr-2" /> Send SMS
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const InterviewModal = ({ show, onClose, onSchedule, interviewData, setInterviewData }: any) => (
  <Dialog open={show} onOpenChange={onClose}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Schedule Interview</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <Input
            type="date"
            value={interviewData.date}
            onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time</label>
          <Input
            type="time"
            value={interviewData.time}
            onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <Input
            value={interviewData.location}
            onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
            placeholder="Interview location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={interviewData.notes}
            onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Additional notes..."
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-green-600 hover:bg-green-700" onClick={onSchedule}>
          <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ApplicationManagementDashboard;

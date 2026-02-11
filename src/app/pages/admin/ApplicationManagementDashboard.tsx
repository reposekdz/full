import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, CheckCircle, XCircle, Clock, Eye, Download, Filter, Search,
  TrendingUp, Award, FileText, MessageSquare, Calendar, Phone, Mail,
  MapPin, GraduationCap, Star, AlertCircle, RefreshCw, ChevronDown,
  ChevronUp, Image as ImageIcon, Trash2, Edit, Send, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { API_BASE_URL } from '@/app/config/apiBase';
import { useAuth } from '@/app/contexts/AuthContext';

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

const ApplicationManagementDashboard: React.FC = () => {
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
    status: 'all'
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

  const isDOS = user?.role === 'director_of_study' || user?.role === 'admin';
  const isHeadmaster = user?.role === 'headmaster' || user?.role === 'admin';

  useEffect(() => {
    fetchApplications();
    fetchStatistics();
  }, [filters]);

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

      const response = await fetch(`${API_BASE_URL}${endpoint}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/student-applications/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

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
        alert('Application reviewed successfully!');
        setShowReviewModal(false);
        fetchApplications();
        fetchStatistics();
      } else {
        alert(data.message || 'Failed to review application');
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      alert('Failed to review application');
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
        alert('Decision recorded successfully!');
        setShowReviewModal(false);
        fetchApplications();
        fetchStatistics();
      } else {
        alert(data.message || 'Failed to record decision');
      }
    } catch (error) {
      console.error('Error recording decision:', error);
      alert('Failed to record decision');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {isDOS ? 'DOS - Application Review' : isHeadmaster ? 'Headmaster - Final Approval' : 'Application Management'}
          </h1>
          <p className="text-gray-600">Manage and review student applications</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="AUTO">Automobile Technology</option>
              </select>
              <Button onClick={fetchApplications} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Applications ({applications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-4">
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
      </div>
    </div>
  );
};

export default ApplicationManagementDashboard;

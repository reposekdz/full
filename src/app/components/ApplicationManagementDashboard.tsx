import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, Download, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '@/app/config/apiBase';
import { useAuth } from '@/app/contexts/AuthContext';

export const ApplicationManagementDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: '',
    trade_code: '',
    education_level: '',
    search: ''
  });
  const [reviewData, setReviewData] = useState({
    decision: '',
    comments: ''
  });

  const isDOS = user?.role === 'director_study';
  const isHeadmaster = user?.role === 'headmaster';

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filters]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`${API_BASE_URL}/student-applications/all?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setApplications(data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student-applications/stats/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchApplicationDetails = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student-applications/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSelectedApp(data);
    } catch (error) {
      console.error('Error fetching application:', error);
    }
  };

  const handleReview = async () => {
    if (!selectedApp || !reviewData.decision || !reviewData.comments) {
      alert('Please provide decision and comments');
      return;
    }

    const endpoint = isDOS ? 'dos-review' : 'headmaster-review';
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/student-applications/${selectedApp.application.id}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reviewData)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        alert('Review submitted successfully');
        setSelectedApp(null);
        setReviewData({ decision: '', comments: '' });
        fetchApplications();
        fetchStats();
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('Error submitting review');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      under_review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isDOS ? 'DOS - Application Management' : 'Headmaster - Application Management'}
        </h1>
        <p className="text-gray-600">Review and manage student applications</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-purple-600">{stats.this_week}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.education_level}
            onChange={(e) => setFilters({ ...filters, education_level: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Education Levels</option>
            <option value="senior_3_completed">Senior 3 Completed</option>
            <option value="changing_school">Changing School</option>
            <option value="other">Other</option>
          </select>

          <input
            type="text"
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={fetchApplications}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Search className="w-5 h-5 inline mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">App #</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Trade</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">DOS</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Headmaster</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.application_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.first_name} {app.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.trade_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Level {app.level_number}</td>
                  <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                  <td className="px-6 py-4">
                    {app.dos_decision === 'approved' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : app.dos_decision === 'rejected' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {app.headmaster_decision === 'approved' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : app.headmaster_decision === 'rejected' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => fetchApplicationDetails(app.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Application Details</h2>
                  <p className="text-gray-600">{selectedApp.application.application_number}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Application Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Personal Information</h3>
                  <p><strong>Name:</strong> {selectedApp.application.first_name} {selectedApp.application.last_name}</p>
                  <p><strong>DOB:</strong> {selectedApp.application.date_of_birth}</p>
                  <p><strong>Gender:</strong> {selectedApp.application.gender}</p>
                  <p><strong>Phone:</strong> {selectedApp.application.phone}</p>
                  <p><strong>Email:</strong> {selectedApp.application.email}</p>
                  <p><strong>Address:</strong> {selectedApp.application.address}</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Parent Information</h3>
                  <p><strong>Name:</strong> {selectedApp.application.parent_name}</p>
                  <p><strong>Phone:</strong> {selectedApp.application.parent_phone}</p>
                  <p><strong>Email:</strong> {selectedApp.application.parent_email}</p>
                  <p><strong>Occupation:</strong> {selectedApp.application.parent_occupation}</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Academic Information</h3>
                  <p><strong>Previous School:</strong> {selectedApp.application.previous_school}</p>
                  <p><strong>Education Level:</strong> {selectedApp.application.education_level}</p>
                  <p><strong>Trade:</strong> {selectedApp.application.trade_name}</p>
                  <p><strong>Level:</strong> Level {selectedApp.application.level_number}</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Status</h3>
                  <p><strong>Status:</strong> {getStatusBadge(selectedApp.application.status)}</p>
                  <p><strong>DOS Decision:</strong> {selectedApp.application.dos_decision}</p>
                  <p><strong>Headmaster Decision:</strong> {selectedApp.application.headmaster_decision}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-2">Reason for Applying</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedApp.application.reason_for_applying}</p>
              </div>

              {/* Review Section */}
              {((isDOS && selectedApp.application.dos_decision === 'pending') ||
                (isHeadmaster && selectedApp.application.headmaster_decision === 'pending')) && (
                <div className="border-t pt-6">
                  <h3 className="font-bold text-gray-800 mb-4">Submit Review</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                      <select
                        value={reviewData.decision}
                        onChange={(e) => setReviewData({ ...reviewData, decision: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Decision</option>
                        <option value="approved">Approve</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                      <textarea
                        value={reviewData.comments}
                        onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your comments..."
                      />
                    </div>

                    <button
                      onClick={handleReview}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagementDashboard;

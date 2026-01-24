import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Eye, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const AdmissionsPage = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [search, statusFilter]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`http://localhost:5000/api/admissions/applications?${params}`);
      const data = await response.json();
      if (data.success) setApplications(data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admissions/stats');
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      interview_scheduled: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      enrolled: 'bg-indigo-100 text-indigo-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admissions Management</h1>
        <Button onClick={() => window.open('/apply', '_blank')}>
          <Users className="w-4 h-4 mr-2" /> New Application
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.recentApplications}</div>
              <div className="text-sm text-gray-600">Last 30 Days</div>
            </CardContent>
          </Card>
          {stats.byStatus.map(item => (
            <Card key={item.status}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-sm text-gray-600 capitalize">{item.status.replace('_', ' ')}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="interview_scheduled">Interview Scheduled</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="enrolled">Enrolled</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{app.application_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{app.first_name} {app.last_name}</div>
                      <div className="text-sm text-gray-500">{app.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{app.program}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedApp && (
        <ApplicationDetails
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={fetchApplications}
        />
      )}
    </div>
  );
};

const ApplicationDetails = ({ application, onClose, onUpdate }) => {
  const [workflow, setWorkflow] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [application.id]);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admissions/applications/${application.id}`);
      const data = await response.json();
      if (data.success) {
        setWorkflow(data.workflow);
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const updateStatus = async (status, stage) => {
    try {
      await fetch(`http://localhost:5000/api/admissions/applications/${application.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, stage, reviewer_id: 1 })
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await fetch(`http://localhost:5000/api/admissions/applications/${application.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, comment: newComment })
      });
      setNewComment('');
      fetchDetails();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Application Details - {application.application_number}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg">{application.first_name} {application.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p>{application.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p>{application.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Program</label>
              <p>{application.program}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Guardian</label>
              <p>{application.guardian_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Guardian Phone</label>
              <p>{application.guardian_phone}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Workflow History</h3>
            <div className="space-y-2">
              {workflow.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium">{item.stage}</div>
                    <div className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</div>
                  </div>
                  <Badge>{item.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Comments</h3>
            <div className="space-y-2 mb-4">
              {comments.map((comment, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded">
                  <p>{comment.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={addComment}>Add</Button>
            </div>
          </div>

          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => updateStatus('under_review', 'review')}>
                Review
              </Button>
              <Button variant="outline" onClick={() => updateStatus('interview_scheduled', 'interview')}>
                <Calendar className="w-4 h-4 mr-1" /> Schedule Interview
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => updateStatus('rejected', 'final')}>
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button onClick={() => updateStatus('approved', 'final')}>
                <CheckCircle className="w-4 h-4 mr-1" /> Approve
              </Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionsPage;

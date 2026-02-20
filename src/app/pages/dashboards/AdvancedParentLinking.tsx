import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Users, Link, Unlink, Plus, Search, Phone, Mail, UserPlus, 
  FileText, CheckCircle, XCircle, Clock, Eye, Filter, Download,
  Send, MessageSquare, TrendingUp, AlertCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

interface Parent {
  parent_id: number;
  name: string;
  phone: string;
  relationship: string;
}

interface Student {
  student_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_code: string;
  level_number: number;
  email?: string;
  phone?: string;
  gender?: string;
  parents: Parent[];
}

interface Application {
  application_id: number;
  application_number: string;
  parent_name: string;
  parent_phone: string;
  student_first_name: string;
  student_last_name: string;
  desired_trade: string;
  desired_level: number;
  status: string;
  submitted_at: string;
}

const AdvancedParentLinking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [stats, setStats] = useState<any>({});
  
  // Link form state
  const [linkForm, setLinkForm] = useState({
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    relationship: 'parent',
    national_id: ''
  });

  const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchStudents();
    fetchApplications();
    fetchStats();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/parent-linking/students`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        setFilteredStudents(data.students);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/parent-linking/applications`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setApplications(data.applications);
    } catch (error) {
      toast.error('Failed to load applications');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/parent-linking/stats`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const filterStudents = () => {
    if (!searchQuery) {
      setFilteredStudents(students);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredStudents(students.filter(s => 
      s.first_name?.toLowerCase().includes(query) ||
      s.last_name?.toLowerCase().includes(query) ||
      s.student_code?.toLowerCase().includes(query) ||
      s.parents.some(p => p.name?.toLowerCase().includes(query) || p.phone?.includes(query))
    ));
  };

  const handleLinkParent = async () => {
    if (!selectedStudent || !linkForm.parent_name || !linkForm.parent_phone) {
      return toast.error('Please fill required fields');
    }

    try {
      const res = await fetch(`${API_BASE}/parent-linking/link`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          ...linkForm
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Parent linked successfully');
        setShowLinkModal(false);
        setLinkForm({ parent_name: '', parent_phone: '', parent_email: '', relationship: 'parent', national_id: '' });
        fetchStudents();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to link parent');
      }
    } catch (error) {
      toast.error('Error linking parent');
    }
  };

  const handleUnlinkParent = async (student_id: number, parent_id: number) => {
    if (!confirm('Are you sure you want to unlink this parent?')) return;

    try {
      const res = await fetch(`${API_BASE}/parent-linking/unlink/${student_id}/${parent_id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Parent unlinked successfully');
        fetchStudents();
        fetchStats();
      }
    } catch (error) {
      toast.error('Error unlinking parent');
    }
  };

  const handleUpdateApplicationStatus = async (app_id: number, status: string) => {
    const notes = prompt(`Enter review notes for ${status}:`);
    if (!notes) return;

    try {
      const res = await fetch(`${API_BASE}/parent-linking/applications/${app_id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          status,
          review_notes: notes,
          reviewed_by: 1 // Current user ID
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Application ${status}`);
        fetchApplications();
        fetchStats();
        if (status === 'approved') fetchStudents();
      }
    } catch (error) {
      toast.error('Error updating application');
    }
  };

  const exportToCSV = () => {
    const headers = ['Student Code', 'Student Name', 'Trade', 'Level', 'Parents', 'Contact'];
    const rows = filteredStudents.map(s => [
      s.student_code,
      `${s.first_name} ${s.last_name}`,
      s.trade_code,
      `L${s.level_number}`,
      s.parents.map(p => `${p.name} (${p.relationship})`).join('; '),
      s.parents.map(p => p.phone).join('; ')
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parent_links_${Date.now()}.csv`;
    a.click();
    toast.success('Exported to CSV');
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-1">{value || 0}</p>
        </div>
        <Icon size={40} className="opacity-80" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Advanced Parent Linking System
          </h1>
          <p className="text-slate-600">Global Sheets Integration • Real-time Data • Full Functionality</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} label="Total Parents" value={stats.total_parents} color="from-blue-500 to-blue-600" />
          <StatCard icon={Link} label="Parent Links" value={stats.total_links} color="from-green-500 to-green-600" />
          <StatCard icon={Clock} label="Pending Apps" value={stats.pending_applications} color="from-yellow-500 to-yellow-600" />
          <StatCard icon={CheckCircle} label="Approved Apps" value={stats.approved_applications} color="from-purple-500 to-purple-600" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'students', label: 'Student Links', icon: Users },
              { id: 'applications', label: 'Applications', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'students' && (
              <>
                {/* Search and Actions */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search students, parents, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={exportToCSV}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Download size={20} />
                    Export CSV
                  </button>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Student</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Trade/Level</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Linked Parents</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={4} className="text-center py-8 text-slate-500">Loading...</td></tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-8 text-slate-500">No students found</td></tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr key={student.student_id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-slate-800">{student.first_name} {student.last_name}</p>
                                <p className="text-sm text-slate-500">{student.student_code}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {student.trade_code} L{student.level_number}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {student.parents.length === 0 ? (
                                <span className="text-slate-400 text-sm">No parents linked</span>
                              ) : (
                                <div className="space-y-1">
                                  {student.parents.map((parent, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <span className="font-medium text-slate-700">{parent.name}</span>
                                      <span className="text-slate-400">•</span>
                                      <span className="text-slate-500">{parent.phone}</span>
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                        {parent.relationship}
                                      </span>
                                      <button
                                        onClick={() => handleUnlinkParent(student.student_id, parseInt(parent.parent_id.toString()))}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Unlink size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowLinkModal(true);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                              >
                                <UserPlus size={16} />
                                Link Parent
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No applications yet</p>
                  </div>
                ) : (
                  applications.map(app => (
                    <div key={app.application_id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">
                            {app.student_first_name} {app.student_last_name}
                          </h3>
                          <p className="text-sm text-slate-500">Application #{app.application_number}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          app.status === 'approved' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-500">Parent</p>
                          <p className="font-medium text-slate-800">{app.parent_name}</p>
                          <p className="text-sm text-slate-600">{app.parent_phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Desired Program</p>
                          <p className="font-medium text-slate-800">{app.desired_trade} - Level {app.desired_level}</p>
                          <p className="text-sm text-slate-600">{new Date(app.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.application_id, 'approved')}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.application_id, 'rejected')}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Parent Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Link Parent to {selectedStudent?.first_name} {selectedStudent?.last_name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Name *</label>
                <input
                  type="text"
                  value={linkForm.parent_name}
                  onChange={(e) => setLinkForm({...linkForm, parent_name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={linkForm.parent_phone}
                  onChange={(e) => setLinkForm({...linkForm, parent_phone: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+250788123456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={linkForm.parent_email}
                  onChange={(e) => setLinkForm({...linkForm, parent_email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                <select
                  value={linkForm.relationship}
                  onChange={(e) => setLinkForm({...linkForm, relationship: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="parent">Parent</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">National ID</label>
                <input
                  type="text"
                  value={linkForm.national_id}
                  onChange={(e) => setLinkForm({...linkForm, national_id: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1198012345678901"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkForm({ parent_name: '', parent_phone: '', parent_email: '', relationship: 'parent', national_id: '' });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkParent}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Link Parent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedParentLinking;

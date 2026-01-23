import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Users, TrendingUp, Filter, Plus, Download, Eye, CheckCircle } from 'lucide-react';

interface Student {
  id: number;
  student_code: string;
  name: string;
  trade: string;
  class_level: string;
  total_incidents: number;
  total_leaves: number;
}

interface DisciplineRecord {
  id: number;
  student_code: string;
  student_name: string;
  trade: string;
  class_level: string;
  conduct_type: string;
  severity: string;
  description: string;
  action_taken: string;
  lesson_missed: string;
  removed_by_name: string;
  status: string;
  created_at: string;
}

interface LeaveRecord {
  id: number;
  student_code: string;
  student_name: string;
  trade: string;
  class_level: string;
  leave_type: string;
  reason: string;
  lesson_missed: string;
  approved_by_name: string;
  status: string;
  start_time: string;
  end_time: string;
}

const DisciplineManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'leaves' | 'analytics'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<DisciplineRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'conduct' | 'leave'>('conduct');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [filters, setFilters] = useState({ trade: '', class_level: '', severity: '', status: '' });

  const [formData, setFormData] = useState({
    conduct_type: 'warning',
    severity: 'low',
    description: '',
    action_taken: '',
    lesson_missed: '',
    leave_type: 'sick',
    reason: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (activeTab === 'overview') {
        const [studentsRes, analyticsRes] = await Promise.all([
          fetch('http://localhost:5000/api/discipline/students', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/discipline/analytics', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const studentsData = await studentsRes.json();
        const analyticsData = await analyticsRes.json();
        if (studentsData.success) setStudents(studentsData.students);
        if (analyticsData.success) setAnalytics(analyticsData.analytics);
      } else if (activeTab === 'records') {
        const params = new URLSearchParams(filters as any);
        const res = await fetch(`http://localhost:5000/api/discipline/records?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setRecords(data.records);
      } else if (activeTab === 'leaves') {
        const params = new URLSearchParams(filters as any);
        const res = await fetch(`http://localhost:5000/api/discipline/leaves?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setLeaves(data.leaves);
      } else if (activeTab === 'analytics') {
        const res = await fetch('http://localhost:5000/api/discipline/analytics', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const token = localStorage.getItem('token');
    const endpoint = modalType === 'conduct' ? '/api/discipline/conduct/remove' : '/api/discipline/leave/add';
    const payload = modalType === 'conduct' 
      ? { student_id: selectedStudent, ...formData }
      : { student_id: selectedStudent, leave_type: formData.leave_type, reason: formData.reason, lesson_missed: formData.lesson_missed, start_time: formData.start_time, end_time: formData.end_time };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowAddModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gucunga Indero</h1>
                <p className="text-gray-600">Discipline Management System</p>
              </div>
            </div>
            <button
              onClick={() => { setShowAddModal(true); setModalType('conduct'); }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Kuraho Uburenganzira
            </button>
          </div>

          <div className="flex gap-4 border-b">
            {['overview', 'records', 'leaves', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-semibold transition ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                {tab === 'overview' ? 'Ibanze' : tab === 'records' ? 'Inyandiko' : tab === 'leaves' ? 'Gusohoka' : 'Imibare'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Incidents</p>
                    <p className="text-3xl font-bold text-red-600">{analytics.overall.total_incidents}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Critical Cases</p>
                    <p className="text-3xl font-bold text-orange-600">{analytics.overall.critical_severity}</p>
                  </div>
                  <Shield className="w-12 h-12 text-orange-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Suspensions</p>
                    <p className="text-3xl font-bold text-purple-600">{analytics.overall.suspensions}</p>
                  </div>
                  <Users className="w-12 h-12 text-purple-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Leaves</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics.leaveStats.ongoing_leaves}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Abanyeshuri - Students List</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trade</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Incidents</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Leaves</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono">{student.student_code}</td>
                        <td className="px-4 py-3 text-sm">{student.name}</td>
                        <td className="px-4 py-3 text-sm">{student.trade}</td>
                        <td className="px-4 py-3 text-sm">{student.class_level}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${student.total_incidents > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {student.total_incidents}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{student.total_leaves}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => { setSelectedStudent(student.id); setShowAddModal(true); setModalType('conduct'); }}
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                          >
                            Remove Conduct
                          </button>
                          <button
                            onClick={() => { setSelectedStudent(student.id); setShowAddModal(true); setModalType('leave'); }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Add Leave
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Discipline Records</h2>
              <div className="flex gap-3">
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {records.map(record => (
                <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{record.student_code}</span>
                        <span className="font-semibold">{record.student_name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${record.severity === 'critical' ? 'bg-red-100 text-red-700' : record.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {record.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="font-semibold">Type:</span> {record.conduct_type}</p>
                        <p><span className="font-semibold">Lesson:</span> {record.lesson_missed || 'N/A'}</p>
                        <p><span className="font-semibold">Removed by:</span> {record.removed_by_name}</p>
                        <p><span className="font-semibold">Date:</span> {new Date(record.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Student Leaves</h2>
            <div className="space-y-4">
              {leaves.map(leave => (
                <div key={leave.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{leave.student_code}</span>
                        <span className="font-semibold">{leave.student_name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${leave.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{leave.reason}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="font-semibold">Type:</span> {leave.leave_type}</p>
                        <p><span className="font-semibold">Lesson:</span> {leave.lesson_missed || 'N/A'}</p>
                        <p><span className="font-semibold">Approved by:</span> {leave.approved_by_name}</p>
                        <p><span className="font-semibold">Start:</span> {new Date(leave.start_time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Discipline by Trade</h2>
              <div className="space-y-3">
                {analytics.byTrade.map((item: any) => (
                  <div key={item.trade} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold">{item.trade}</span>
                    <div className="flex gap-4">
                      <span className="text-sm">Total: <span className="font-bold text-red-600">{item.total_incidents}</span></span>
                      <span className="text-sm">Critical: <span className="font-bold text-orange-600">{item.critical_incidents}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Discipline by Class</h2>
              <div className="space-y-3">
                {analytics.byClass.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold">{item.trade} - {item.class_level}</span>
                    <div className="flex gap-4">
                      <span className="text-sm">Total: <span className="font-bold text-red-600">{item.total_incidents}</span></span>
                      <span className="text-sm">Critical: <span className="font-bold text-orange-600">{item.critical_incidents}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">{modalType === 'conduct' ? 'Remove Conduct' : 'Add Leave'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {modalType === 'conduct' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Conduct Type</label>
                      <select
                        value={formData.conduct_type}
                        onChange={(e) => setFormData({ ...formData, conduct_type: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="warning">Warning</option>
                        <option value="suspension">Suspension</option>
                        <option value="expulsion">Expulsion</option>
                        <option value="late">Late</option>
                        <option value="absence">Absence</option>
                        <option value="misbehavior">Misbehavior</option>
                        <option value="uniform">Uniform</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Severity</label>
                      <select
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Action Taken</label>
                      <input
                        type="text"
                        value={formData.action_taken}
                        onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Lesson Missed</label>
                      <input
                        type="text"
                        value={formData.lesson_missed}
                        onChange={(e) => setFormData({ ...formData, lesson_missed: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Leave Type</label>
                      <select
                        value={formData.leave_type}
                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="sick">Sick</option>
                        <option value="home">Home</option>
                        <option value="emergency">Emergency</option>
                        <option value="family">Family</option>
                        <option value="medical">Medical</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Reason</label>
                      <textarea
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Lesson Missed</label>
                      <input
                        type="text"
                        value={formData.lesson_missed}
                        onChange={(e) => setFormData({ ...formData, lesson_missed: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Start Time</label>
                      <input
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">End Time (Optional)</label>
                      <input
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
                    Submit & Notify Parent
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisciplineManagementPage;

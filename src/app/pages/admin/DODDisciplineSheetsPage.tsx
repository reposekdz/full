import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingDown, Users, Plus, Eye } from 'lucide-react';

interface StudentSheet {
  id: number;
  student_code: string;
  student_name: string;
  trade: string;
  level: string;
  conduct_score: number;
  conduct_grade: string;
  total_incidents: number;
  critical_incidents: number;
  high_incidents: number;
  medium_incidents: number;
  low_incidents: number;
}

const DODDisciplineSheetsPage: React.FC = () => {
  const [sheets, setSheets] = useState<StudentSheet[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ trade: '', level: '', search: '' });
  
  const [incidentForm, setIncidentForm] = useState({
    conduct_type: 'warning',
    severity: 'low',
    description: '',
    action_taken: ''
  });

  useEffect(() => {
    fetchSheets();
  }, [filters]);

  const fetchSheets = async () => {
    const token = localStorage.getItem('token');
    const classSheetId = 1;
    const res = await fetch(`http://localhost:5000/api/student-sheets/class/${classSheetId}/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      let filtered = data.sheets;
      if (filters.trade) filtered = filtered.filter((s: StudentSheet) => s.trade === filters.trade);
      if (filters.level) filtered = filtered.filter((s: StudentSheet) => s.level === filters.level);
      if (filters.search) filtered = filtered.filter((s: StudentSheet) => 
        s.student_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.student_code.toLowerCase().includes(filters.search.toLowerCase())
      );
      setSheets(filtered);
    }
  };

  const submitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/student-sheets/${selectedStudent.student_id}/discipline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(incidentForm)
    });
    const data = await res.json();
    if (data.success) {
      alert('Incident recorded! Conduct score auto-updated.');
      setShowModal(false);
      fetchSheets();
    }
  };

  const getConductColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-300';
    if (score >= 75) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const getDeductionInfo = () => {
    const deductions = {
      critical: 20,
      high: 10,
      medium: 5,
      low: 2
    };
    return deductions[incidentForm.severity as keyof typeof deductions] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-red-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Discipline Sheets Management</h1>
                <p className="text-gray-600">Student conduct tracking with auto-score calculation</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search students..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <select
              value={filters.trade}
              onChange={(e) => setFilters({ ...filters, trade: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Trades</option>
              <option value="SOD">SOD</option>
              <option value="AUT">AUT</option>
              <option value="BDC">BDC</option>
            </select>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Levels</option>
              <option value="Level 3">Level 3</option>
              <option value="Level 4">Level 4</option>
              <option value="Level 5">Level 5</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Excellent Conduct</p>
                <p className="text-3xl font-bold text-green-600">
                  {sheets.filter(s => s.conduct_score >= 90).length}
                </p>
              </div>
              <Shield className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">At Risk</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {sheets.filter(s => s.conduct_score >= 60 && s.conduct_score < 75).length}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Critical Cases</p>
                <p className="text-3xl font-bold text-red-600">
                  {sheets.filter(s => s.conduct_score < 60).length}
                </p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trade/Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Conduct Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Grade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total Incidents</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Critical</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sheets.map((sheet) => (
                  <tr key={sheet.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-red-600">{sheet.student_code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{sheet.student_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{sheet.trade} {sheet.level}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${sheet.conduct_score >= 90 ? 'bg-green-500' : sheet.conduct_score >= 75 ? 'bg-blue-500' : sheet.conduct_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${sheet.conduct_score || 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-lg">{sheet.conduct_score || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getConductColor(sheet.conduct_score || 0)}`}>
                        {sheet.conduct_grade || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{sheet.total_incidents || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-bold">
                        {sheet.critical_incidents || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(sheet);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Incident
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Discipline Incident</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Student:</strong> {selectedStudent.student_name} ({selectedStudent.student_code})
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Current Conduct Score:</strong> {selectedStudent.conduct_score}/100
                </p>
              </div>

              <form onSubmit={submitIncident} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Conduct Type</label>
                    <select
                      value={incidentForm.conduct_type}
                      onChange={(e) => setIncidentForm({ ...incidentForm, conduct_type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="warning">Warning</option>
                      <option value="suspension">Suspension</option>
                      <option value="late">Late Arrival</option>
                      <option value="absence">Absence</option>
                      <option value="misbehavior">Misbehavior</option>
                      <option value="uniform">Uniform Violation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Severity</label>
                    <select
                      value={incidentForm.severity}
                      onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="low">Low (-2 points)</option>
                      <option value="medium">Medium (-5 points)</option>
                      <option value="high">High (-10 points)</option>
                      <option value="critical">Critical (-20 points)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800">
                    ⚠️ This incident will deduct <span className="text-xl font-bold">{getDeductionInfo()}</span> points from conduct score
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    New score will be: <span className="font-bold">{Math.max(0, selectedStudent.conduct_score - getDeductionInfo())}/100</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Action Taken</label>
                  <textarea
                    value={incidentForm.action_taken}
                    onChange={(e) => setIncidentForm({ ...incidentForm, action_taken: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    Submit & Auto-Update Score
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
                  >
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

export default DODDisciplineSheetsPage;

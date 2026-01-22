import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const ParentDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [children, setChildren] = useState<any[]>([]);
  const [linkRequests, setLinkRequests] = useState<any[]>([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [formData, setFormData] = useState({
    student_name: '',
    student_class: '',
    trade: '',
    year: new Date().getFullYear(),
    student_code: ''
  });

  useEffect(() => {
    fetchChildren();
    fetchLinkRequests();
  }, []);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/parent-linking/my-children`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChildren(data.children || []);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchLinkRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/parent-linking/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLinkRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_URL}/parent-linking/link-request`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`${t('success')}! Link Code: ${data.linkCode}`);
      setShowLinkForm(false);
      setFormData({ student_name: '', student_class: '', trade: '', year: new Date().getFullYear(), student_code: '' });
      fetchLinkRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || t('error'));
    }
  };

  const viewChildDetails = async (childId: number) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/parent-linking/child/${childId}/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedChild(data);
    } catch (error) {
      console.error('Error fetching child details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Ikimenyetso cy'Umubyeyi
          </h1>
          <p className="text-xl text-gray-600">Reba Ibisobanuro by'Abana Bawe</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Abana', value: children.length, icon: '👨‍👩‍👧‍👦', color: 'purple' },
            { label: 'Amasomo', value: children.reduce((acc, c) => acc + (c.averageGrade || 0), 0) / (children.length || 1), icon: '📚', color: 'blue' },
            { label: 'Kwitabira', value: children.reduce((acc, c) => acc + parseFloat(c.attendanceRate || 0), 0) / (children.length || 1), icon: '✅', color: 'green' },
            { label: 'Intsinzi', value: children.reduce((acc, c) => acc + (c.achievements?.length || 0), 0), icon: '🏆', color: 'yellow' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white rounded-2xl shadow-lg p-6 border-t-4 border-${stat.color}-500`}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-800">{typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Link New Child Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowLinkForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all text-lg font-semibold"
          >
            + Huza Umwana Mushya
          </button>
        </div>

        {/* Children Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {children.map((child) => (
            <div key={child.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {child.first_name[0]}{child.last_name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{child.first_name} {child.last_name}</h3>
                  <p className="text-sm text-gray-600">{child.student_id}</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Isomo:</span>
                  <span className="font-semibold">{child.trade_name} {child.level_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amanota:</span>
                  <span className="font-semibold text-blue-600">{child.averageGrade}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kwitabira:</span>
                  <span className="font-semibold text-green-600">{child.attendanceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intsinzi:</span>
                  <span className="font-semibold text-yellow-600">{child.achievements?.length || 0}</span>
                </div>
              </div>
              <button
                onClick={() => viewChildDetails(child.id)}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Reba Raporo Yuzuye
              </button>
            </div>
          ))}
        </div>

        {/* Link Requests */}
        {linkRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Ibisabwa byo Guhuza</h2>
            <div className="space-y-4">
              {linkRequests.map((request) => (
                <div key={request.id} className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{request.student_name}</h3>
                      <p className="text-sm text-gray-600">{request.trade} - {request.student_class}</p>
                      <p className="text-sm text-gray-600">Code: {request.student_code}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status === 'approved' ? 'Byemewe' : request.status === 'rejected' ? 'Byanze' : 'Bitegerejwe'}
                    </span>
                  </div>
                  {request.link_code && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">Link Code: </span>
                      <span className="font-bold text-blue-600">{request.link_code}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Link Form Modal */}
      {showLinkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Huza Umwana</h2>
            <form onSubmit={handleLinkRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amazina y'Umwana</label>
                <input
                  type="text"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icyiciro</label>
                  <input
                    type="text"
                    value={formData.student_class}
                    onChange={(e) => setFormData({ ...formData, student_class: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Umwaka</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Isomo (SOD/AUT/BDC)</label>
                <select
                  value={formData.trade}
                  onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">Hitamo Isomo</option>
                  <option value="SOD">SOD - Software Development</option>
                  <option value="AUT">AUT - Automobile Technology</option>
                  <option value="BDC">BDC - Building Construction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kode y'Umunyeshuri (Ex: SOD0012026, AUT0012026, BDC0012026)
                </label>
                <input
                  type="text"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value.toUpperCase() })}
                  placeholder="SOD0012026"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowLinkForm(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Ohereza Icyifuzo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Child Details Modal */}
      {selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 my-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Raporo y'Umwana</h2>
              <button
                onClick={() => setSelectedChild(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Grades */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Amanota</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedChild.grades?.map((grade: any) => (
                  <div key={grade.id} className="border-2 border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800">{grade.course_name}</h4>
                    <div className="text-3xl font-bold text-blue-600">{grade.score}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Intsinzi</h3>
              <div className="space-y-3">
                {selectedChild.achievements?.map((achievement: any) => (
                  <div key={achievement.id} className="border-2 border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <span className="text-xs text-gray-500">{new Date(achievement.achievement_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discipline */}
            {selectedChild.discipline?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Imyitwarire</h3>
                <div className="space-y-3">
                  {selectedChild.discipline.map((record: any) => (
                    <div key={record.id} className="border-2 border-red-200 rounded-xl p-4 bg-red-50">
                      <h4 className="font-bold text-gray-800">{record.incident_type}</h4>
                      <p className="text-sm text-gray-600">{record.description}</p>
                      <span className="text-xs text-gray-500">{new Date(record.incident_date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;

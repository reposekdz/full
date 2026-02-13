import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  User, Settings, Lock, Upload, BookOpen, Trophy, Users, Calendar,
  FileText, BarChart3, Plus, Edit, Trash2, Eye, Download, Search,
  Filter, ChevronDown, X, Check, AlertCircle, TrendingUp
} from 'lucide-react';
import CoursesManager from '../components/dos/CoursesManager';
import { SportsManager, TeamsManager, ExamsManager, ScheduleManager, ReportsManager, MarksManager } from '../components/dos/ManagerComponents';

const API_BASE_URL = 'http://localhost:5000/api';

interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string;
  profile_image?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
}

const DOSDashboardComprehensive: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Profile edit state
  const [editProfile, setEditProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchDashboardStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/dos-comprehensive/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.profile);
      setEditProfile({
        first_name: response.data.profile.first_name,
        last_name: response.data.profile.last_name,
        email: response.data.profile.email,
        phone: response.data.profile.phone || '',
        date_of_birth: response.data.profile.date_of_birth || '',
        gender: response.data.profile.gender || '',
        address: response.data.profile.address || ''
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/dos-comprehensive/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/dos-comprehensive/profile`, editProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
      fetchProfile();
      setShowProfileModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/dos-comprehensive/profile/change-password`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/dos-comprehensive/profile/image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Profile image updated!');
      fetchProfile();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Ahabanza', icon: <BarChart3 className="w-5 h-5" />, kiny: 'Dashboard' },
    { id: 'courses', label: 'Amasomo', icon: <BookOpen className="w-5 h-5" />, kiny: 'Courses' },
    { id: 'sports', label: 'Siporo', icon: <Trophy className="w-5 h-5" />, kiny: 'Sports' },
    { id: 'teams', label: 'Amatsinda', icon: <Users className="w-5 h-5" />, kiny: 'Teams' },
    { id: 'exams', label: 'Ibizamini', icon: <FileText className="w-5 h-5" />, kiny: 'Exams' },
    { id: 'schedule', label: 'Gahunda', icon: <Calendar className="w-5 h-5" />, kiny: 'Schedule' },
    { id: 'reports', label: 'Raporo', icon: <FileText className="w-5 h-5" />, kiny: 'Reports' },
    { id: 'marks', label: 'Amanota', icon: <BarChart3 className="w-5 h-5" />, kiny: 'Marks' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashbord y'Umuyobozi w'Amasomo</h1>
                <p className="text-sm text-gray-500">Director of Studies Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {profile?.profile_image ? (
                  <img src={profile.profile_image} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {profile?.first_name} {profile?.last_name}
                </span>
              </button>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Change Password"
              >
                <Lock className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Abanyeshuri</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.students?.total_students || 0}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.students?.active_students || 0} active
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Abarimu</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.teachers?.total_teachers || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Total teachers</p>
                </div>
                <User className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amaklasi</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.classes?.total_classes || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active classes</p>
                </div>
                <BookOpen className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ibizamini Bizaza</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.exams?.upcoming_exams || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Upcoming exams</p>
                </div>
                <FileText className="w-12 h-12 text-orange-500 opacity-20" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && <DashboardContent stats={stats} />}
                {activeTab === 'courses' && <CoursesContent />}
                {activeTab === 'sports' && <SportsContent />}
                {activeTab === 'teams' && <TeamsContent />}
                {activeTab === 'exams' && <ExamsContent />}
                {activeTab === 'schedule' && <ScheduleContent />}
                {activeTab === 'reports' && <ReportsContent />}
                {activeTab === 'marks' && <MarksContent />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Hindura Profayili</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  {profile?.profile_image ? (
                    <img
                      src={profile.profile_image}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Izina</label>
                  <input
                    type="text"
                    value={editProfile.first_name}
                    onChange={(e) => setEditProfile({ ...editProfile, first_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Izina ry'Umuryango</label>
                  <input
                    type="text"
                    value={editProfile.last_name}
                    onChange={(e) => setEditProfile({ ...editProfile, last_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editProfile.email}
                    onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefoni</label>
                  <input
                    type="tel"
                    value={editProfile.phone}
                    onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Itariki y'Amavuko</label>
                  <input
                    type="date"
                    value={editProfile.date_of_birth}
                    onChange={(e) => setEditProfile({ ...editProfile, date_of_birth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Igitsina</label>
                  <select
                    value={editProfile.gender}
                    onChange={(e) => setEditProfile({ ...editProfile, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Hitamo</option>
                    <option value="male">Gabo</option>
                    <option value="female">Gore</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aderesi</label>
                <textarea
                  value={editProfile.address}
                  onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Bika...' : 'Bika Impinduka'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Hindura Ijambo ry'Ibanga</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ijambo ry'Ibanga Rya Kera
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ijambo ry'Ibanga Rishya
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emeza Ijambo ry'Ibanga Rishya
                </label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Hindura...' : 'Hindura Ijambo ry\'Ibanga'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Incamake y'Ibikorwa</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Ibikorwa Byihuse</h3>
        <ul className="space-y-2">
          <li className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Gucunga amasomo n'abarimu</span>
          </li>
          <li className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Gukora raporo z'abanyeshuri</span>
          </li>
          <li className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Gutegura gahunda y'amasomo</span>
          </li>
          <li className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Gukurikirana ibizamini</span>
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Ibikorwa Bya Vuba</h3>
        <div className="space-y-3">
          {stats?.recent_activities?.slice(0, 5).map((activity: any, index: number) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <div className="w-2 h-2 bg-white rounded-full mt-1.5" />
              <span>{activity.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CoursesContent = () => <CoursesManager />;
const SportsContent = () => <SportsManager />;
const TeamsContent = () => <TeamsManager />;
const ExamsContent = () => <ExamsManager />;
const ScheduleContent = () => <ScheduleManager />;
const ReportsContent = () => <ReportsManager />;
const MarksContent = () => <MarksManager />;

export default DOSDashboardComprehensive;

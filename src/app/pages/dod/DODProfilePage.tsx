import React, { useState, useEffect } from 'react';
import { User, Camera, Lock, Save, Home, FileText, Calendar, Users, BarChart3, Scale, Mail, FileSpreadsheet, Menu, X, Trash2, Eye, EyeOff, Activity, Bell, Globe, Shield, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const DODProfilePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '', phone: '', bio: '', photo: '' });
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ total_actions: 0 });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [photoPreview, setPhotoPreview] = useState('');
  const [preferences, setPreferences] = useState({ theme: 'light', language: 'rw', notifications_enabled: true, email_notifications: true });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dod-profile/1`);
      setProfile(res.data.profile || { first_name: '', last_name: '', email: '', phone: '', bio: '', photo: '' });
      setActivities(res.data.activities || []);
      setStats(res.data.stats || { total_actions: 0 });
      setPhotoPreview(res.data.profile?.photo || '');
    } catch (error) {
      console.error('Ikosa:', error);
      setProfile({ first_name: 'Umuyobozi', last_name: 'w\'Indero', email: 'dod@school.rw', phone: '', bio: '', photo: '' });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/dod-profile/1`, profile);
      setEditing(false);
      loadProfile();
      alert('✅ Profil yahinduwe!');
    } catch (error) {
      console.error('Ikosa:', error);
      alert('❌ Ikosa ryabaye');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('photo', file);
      
      const res = await axios.post(`${API_BASE}/dod-profile/1/photo`, formData);
      setPhotoPreview(res.data.photo);
      loadProfile();
      alert('✅ Ifoto yashyizweho!');
    } catch (error) {
      console.error('Ikosa:', error);
      alert('❌ Ikosa mu gushyira ifoto');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!confirm('Urashaka gukuraho ifoto?')) return;
    try {
      await axios.delete(`${API_BASE}/dod-profile/1/photo`);
      setPhotoPreview('');
      loadProfile();
      alert('✅ Ifoto yakuweho!');
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('❌ Amagambo y\'ibanga ntabwo ahuje!');
      return;
    }
    if (passwordData.new_password.length < 6) {
      alert('❌ Ijambo ryibanga rigomba kuba rifite imibare 6 nibura!');
      return;
    }
    
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/dod-profile/1/password`, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      alert('✅ Ijambo ryibanga ryahinduwe!');
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.error || 'Ikosa ryabaye'));
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    try {
      await axios.put(`${API_BASE}/dod-profile/1/preferences`, preferences);
      alert('✅ Amahitamo yahinduwe!');
    } catch (error) {
      alert('❌ Ikosa ryabaye');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mt-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out mt-16`}>
        <div className="h-full bg-gradient-to-b from-green-600 via-yellow-500 to-green-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home },
              { id: 'dod-profile', label: 'Profil', Icon: User, active: true },
              { id: 'dod-discipline', label: 'Amakosa', Icon: FileText },
              { id: 'dod-exams', label: 'Ibizamini', Icon: Calendar },
              { id: 'dod-students', label: 'Abanyeshuri', Icon: Users },
              { id: 'dod-reports', label: 'Raporo', Icon: BarChart3 },
              { id: 'dod-punishments', label: 'Ibihano', Icon: Scale },
              { id: 'dod-parent-notifications', label: 'Ababyeyi', Icon: Mail },
              { id: 'dod-student-sheets', label: 'Imbonerahamwe', Icon: FileSpreadsheet }
            ].map(item => (
              <button key={item.id} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${item.active ? 'bg-white text-green-700 shadow-lg scale-105 font-bold' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="lg:pl-64 flex-1 pt-16">
        <div className="p-4 md:p-6">
          <button onClick={() => onNavigate('director-discipline-dashboard')} className="mb-4 text-green-600 hover:text-green-700 font-semibold">
            ← Gusubira
          </button>

          <div className="max-w-5xl mx-auto">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 rounded-2xl shadow-2xl p-6 mb-6 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  {photoPreview ? (
                    <img src={`http://localhost:5000${photoPreview}`} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                  ) : (
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl font-bold backdrop-blur-sm">
                      {profile.first_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-green-600" />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {photoPreview && (
                    <button onClick={handlePhotoDelete} className="absolute top-0 right-0 p-2 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{profile.first_name} {profile.last_name}</h1>
                  <p className="text-white/90 mb-1">{profile.email}</p>
                  <p className="text-white/80">{profile.phone}</p>
                  <div className="flex gap-4 mt-4 justify-center md:justify-start">
                    <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold">{stats.total_actions}</div>
                      <div className="text-sm">Ibikorwa</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="flex border-b overflow-x-auto">
                {[
                  { id: 'profile', label: 'Profil', Icon: User },
                  { id: 'security', label: 'Umutekano', Icon: Shield },
                  { id: 'preferences', label: 'Amahitamo', Icon: Globe },
                  { id: 'activity', label: 'Ibikorwa', Icon: Activity }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${activeTab === tab.id ? 'border-b-4 border-green-600 text-green-600' : 'text-gray-500 hover:text-green-600'}`}
                  >
                    <tab.Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Amakuru ya Profil</h2>
                      <button onClick={() => setEditing(!editing)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        {editing ? 'Hagarika' : 'Hindura'}
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Izina rya mbere</label>
                        <input
                          type="text"
                          value={profile.first_name || ''}
                          onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                          disabled={!editing}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Izina rya kabiri</label>
                        <input
                          type="text"
                          value={profile.last_name || ''}
                          onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                          disabled={!editing}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imeri</label>
                        <input
                          type="email"
                          value={profile.email || ''}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          disabled={!editing}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefoni</label>
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          disabled={!editing}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        disabled={!editing}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      />
                    </div>

                    {editing && (
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold"
                      >
                        <Save className="w-5 h-5" />
                        {loading ? 'Birakorwa...' : 'Bika Impinduka'}
                      </button>
                    )}
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Guhindura Ijambo ryibanga</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ijambo ryibanga rya kera</label>
                      <div className="relative">
                        <input
                          type={showPassword.old ? 'text' : 'password'}
                          value={passwordData.old_password}
                          onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({...showPassword, old: !showPassword.old})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPassword.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ijambo ryibanga rishya</label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emeza ijambo ryibanga</label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={loading}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold"
                    >
                      <Lock className="w-5 h-5" />
                      {loading ? 'Birakorwa...' : 'Hindura Ijambo ryibanga'}
                    </button>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Amahitamo</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-semibold">Amakuru</div>
                            <div className="text-sm text-gray-600">Emera amakuru ya sisitemu</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.notifications_enabled}
                            onChange={(e) => setPreferences({...preferences, notifications_enabled: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-semibold">Imeri</div>
                            <div className="text-sm text-gray-600">Emera amakuru kuri imeri</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.email_notifications}
                            onChange={(e) => setPreferences({...preferences, email_notifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ururimi</label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="rw">Ikinyarwanda</option>
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handlePreferencesSave}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold"
                    >
                      <Save className="w-5 h-5" />
                      Bika Amahitamo
                    </button>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ibikorwa byawe</h2>
                    
                    {activities.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Nta bikorwa bihari</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activities.map((activity: any, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{activity.action}</div>
                              <div className="text-sm text-gray-600">{activity.module}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(activity.created_at).toLocaleString('rw-RW')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DODProfilePage;

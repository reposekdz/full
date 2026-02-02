import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Lock, Save, Edit2, X, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/app/contexts/AuthContext';

const DODProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/dod-profile/profile?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setFormData({
          first_name: data.profile.first_name || '',
          last_name: data.profile.last_name || '',
          email: data.profile.email || '',
          phone: data.profile.phone || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setProfile({});
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/dod-profile/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setEditing(false);
        fetchProfile();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/dod-profile/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...passwordData, userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    }
    setLoading(false);
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/dod-profile/change-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emailData, userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Email changed successfully' });
        setChangingEmail(false);
        setEmailData({ newEmail: '', password: '' });
        fetchProfile();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change email' });
    }
    setLoading(false);
  };

  if (!profile) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">DOD Profile</h1>

          {message.text && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                {editing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                {editing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent>
              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{profile.phone || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Change Password</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setChangingPassword(!changingPassword)}>
                {changingPassword ? <X className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                {changingPassword ? 'Cancel' : 'Change'}
              </Button>
            </CardHeader>
            {changingPassword && (
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Change Email</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setChangingEmail(!changingEmail)}>
                {changingEmail ? <X className="w-4 h-4 mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                {changingEmail ? 'Cancel' : 'Change'}
              </Button>
            </CardHeader>
            {changingEmail && (
              <CardContent>
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div>
                    <Label>New Email</Label>
                    <Input type="email" value={emailData.newEmail} onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input type="password" value={emailData.password} onChange={(e) => setEmailData({...emailData, password: e.target.value})} required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {loading ? 'Changing...' : 'Change Email'}
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DODProfilePage;

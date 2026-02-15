import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Save, Lock, Calendar, Briefcase, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { apiService } from '@/app/services/apiService';
import RwandaLocationSelector from '@/app/components/RwandaLocationSelector';

interface UniversalProfilePageProps {
  onNavigate?: (page: string) => void;
  dashboardRoute?: string;
}

const UniversalProfilePage: React.FC<UniversalProfilePageProps> = ({ onNavigate, dashboardRoute = 'dashboard' }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyProfile();
      if (data.success) {
        setProfile(data.user);
        setFormData({
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          date_of_birth: data.user.date_of_birth ? data.user.date_of_birth.split('T')[0] : '',
          gender: data.user.gender || '',
          address: data.user.address || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showMessage('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const data = await apiService.updateMyProfile(formData);
      if (data.success) {
        setProfile(data.user);
        setEditMode(false);
        showMessage('success', 'Profile updated successfully!');
      } else {
        showMessage('error', data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showMessage('error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      const data = await apiService.changeMyPassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });

      if (data.success) {
        showMessage('success', 'Password changed successfully!');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        showMessage('error', data.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      showMessage('error', error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: any = {
      admin: 'bg-red-100 text-red-800',
      super_admin: 'bg-red-100 text-red-800',
      headmaster: 'bg-purple-100 text-purple-800',
      dos: 'bg-blue-100 text-blue-800',
      director_study: 'bg-blue-100 text-blue-800',
      dod: 'bg-orange-100 text-orange-800',
      director_discipline: 'bg-orange-100 text-orange-800',
      accountant: 'bg-green-100 text-green-800',
      advisor: 'bg-cyan-100 text-cyan-800',
      teacher: 'bg-indigo-100 text-indigo-800',
      student: 'bg-yellow-100 text-yellow-800',
      parent: 'bg-pink-100 text-pink-800',
      stock: 'bg-teal-100 text-teal-800',
      stock_manager: 'bg-teal-100 text-teal-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: any = {
      admin: 'Administrator',
      super_admin: 'Super Administrator',
      headmaster: 'Headmaster',
      dos: 'Director of Studies',
      director_study: 'Director of Studies',
      dod: 'Director of Discipline',
      director_discipline: 'Director of Discipline',
      accountant: 'Accountant',
      advisor: 'Advisor',
      teacher: 'Teacher',
      student: 'Student',
      parent: 'Parent',
      stock: 'Stock Manager',
      stock_manager: 'Stock Manager'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p className="text-gray-700">Failed to load profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        {onNavigate && (
          <button
            onClick={() => onNavigate(dashboardRoute)}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Back to Dashboard
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal information and security</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-800'
                : 'bg-red-100 border border-red-400 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}

        {/* Profile Overview Card */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {profile.first_name} {profile.last_name}
                  </CardTitle>
                  <Badge className={`${getRoleColor(profile.role)} mt-2`}>
                    {getRoleLabel(profile.role)}
                  </Badge>
                </div>
              </div>
              {profile.student_id && (
                <div className="text-right">
                  <p className="text-sm opacity-90">Student ID</p>
                  <p className="text-xl font-bold">{profile.student_id}</p>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {!editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{profile.email || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{profile.phone || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold">
                        {profile.date_of_birth
                          ? new Date(profile.date_of_birth).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-semibold capitalize">{profile.gender || 'Not set'}</p>
                    </div>
                  </div>

                  {profile.trade_name && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Trade</p>
                        <p className="font-semibold">
                          {profile.trade_name} - Level {profile.level}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile.class_name && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Class</p>
                        <p className="font-semibold">{profile.class_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {profile.address && (
                  <div className="flex items-start gap-3 pt-4 border-t">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold">{profile.address}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    onClick={() => setEditMode(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div>
                    <Label>Email * (used for login; you can change it here)</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email"
                    />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <Label className="text-lg font-semibold text-blue-700">Your Location (Rwanda)</Label>
                  <RwandaLocationSelector
                    onLocationChange={(location) => setFormData({...formData, ...location})}
                    required={true}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditMode(false);
                      loadProfile();
                    }}
                    variant="outline"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Set / Change Password
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Update your password; stored securely in the database. Use a strong password.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Password *</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, current_password: e.target.value })
                  }
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label>New Password * (min 6 characters; use letters, numbers, symbols for strength)</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, new_password: e.target.value })
                  }
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordForm.new_password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordForm.new_password.length >= 10 && /[A-Z]/.test(passwordForm.new_password) && /[0-9]/.test(passwordForm.new_password)
                          ? 'bg-green-500 w-full'
                          : passwordForm.new_password.length >= 6
                            ? 'bg-yellow-500 w-2/3'
                            : 'bg-red-400 w-1/3'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {passwordForm.new_password.length >= 10 && /[A-Z]/.test(passwordForm.new_password) && /[0-9]/.test(passwordForm.new_password)
                      ? 'Strong'
                      : passwordForm.new_password.length >= 6
                        ? 'Medium'
                        : 'Weak'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label>Confirm New Password *</Label>
              <Input
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                }
                placeholder="Confirm new password"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={
                changingPassword ||
                !passwordForm.current_password ||
                !passwordForm.new_password ||
                !passwordForm.confirm_password
              }
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Account Status</p>
                <Badge className={profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600">Member Since</p>
                <p className="font-semibold">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UniversalProfilePage;

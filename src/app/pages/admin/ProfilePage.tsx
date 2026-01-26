import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Camera, Save, Lock, Shield, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { useAuth } from '@/app/contexts/AuthContext';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', role: '', profile_image: '' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProfile({ 
          name: data.user.name, 
          email: data.user.email, 
          phone: data.user.phone || '', 
          role: data.user.role,
          profile_image: data.user.profile_image || ''
        });
        if (data.user.profile_image) {
          setImagePreview(`http://localhost:5000${data.user.profile_image}`);
        }
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      if (imageFile) formData.append('profile_image', imageFile);

      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setMessage({ type: data.success ? 'success' : 'error', text: data.message });
      if (data.success) {
        fetchProfile();
        setImageFile(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed' });
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (password.new.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: password.current, newPassword: password.new })
      });
      const data = await res.json();
      setMessage({ type: data.success ? 'success' : 'error', text: data.message });
      if (data.success) setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Password change failed' });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Profili / Profile</h1>
          <p className="text-gray-600">Hindura amakuru yawe / Manage your account settings</p>
        </div>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-32 h-32 border-4 border-blue-200">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt={profile.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl">
                    {profile.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                )}
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-blue-600 font-semibold mb-2">{profile.role?.toUpperCase()}</p>
            <p className="text-gray-500 text-sm mb-4">{profile.email}</p>
            {imageFile && (
              <div className="bg-blue-50 p-2 rounded-lg text-sm text-blue-700 mb-2">
                New image selected
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-2 border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Amakuru Yanjye / Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                Izina / Name
              </Label>
              <Input 
                value={profile.name} 
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="border-2 focus:border-blue-500"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-600" />
                Email
              </Label>
              <Input 
                value={profile.email} 
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="border-2 focus:border-blue-500"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-gray-600" />
                Telefone / Phone
              </Label>
              <Input 
                value={profile.phone} 
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+250 XXX XXX XXX"
                className="border-2 focus:border-blue-500"
              />
            </div>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Bika...' : 'Bika Impinduka / Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-orange-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-600" />
            Hindura Ijambo Ryibanga / Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Ijambo Ryibanga Rikiriho / Current Password</Label>
              <Input 
                type="password" 
                value={password.current} 
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                className="border-2 focus:border-orange-500"
              />
            </div>
            <div>
              <Label>Ijambo Ryibanga Rishya / New Password</Label>
              <Input 
                type="password" 
                value={password.new} 
                onChange={(e) => setPassword({ ...password, new: e.target.value })}
                className="border-2 focus:border-orange-500"
              />
            </div>
            <div>
              <Label>Emeza Ijambo Ryibanga / Confirm Password</Label>
              <Input 
                type="password" 
                value={password.confirm} 
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                className="border-2 focus:border-orange-500"
              />
            </div>
          </div>
          <Button 
            onClick={handleChangePassword} 
            disabled={loading}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            <Lock className="w-4 h-4 mr-2" />
            {loading ? 'Bika...' : 'Hindura Ijambo Ryibanga / Change Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;

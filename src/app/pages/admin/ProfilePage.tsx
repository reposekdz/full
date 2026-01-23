import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Camera, Save, Lock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { useAuth } from '@/app/contexts/AuthContext';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', role: '' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

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
        setProfile({ name: data.user.name, email: data.user.email, phone: data.user.phone || '', role: data.user.role });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, phone: profile.phone })
      });
      const data = await res.json();
      setMessage({ type: data.success ? 'success' : 'error', text: data.message });
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
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Shield className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-3xl font-black">Profili / Profile</h1>
          <p className="text-gray-600">Hindura amakuru yawe / Manage your account</p>
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4">
              <AvatarFallback className="bg-blue-600 text-white text-4xl">
                {profile.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-600 mb-4">{profile.role}</p>
            <Button variant="outline" className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Hindura Ifoto / Change Photo
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Amakuru Yanjye / Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Izina / Name</Label>
              <Input value={profile.name} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefone / Phone</Label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Bika...' : 'Bika Impinduka / Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Hindura Ijambo Ryibanga / Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Ijambo Ryibanga Rikiriho / Current Password</Label>
            <Input type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} />
          </div>
          <div>
            <Label>Ijambo Ryibanga Rishya / New Password</Label>
            <Input type="password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} />
          </div>
          <div>
            <Label>Emeza Ijambo Ryibanga / Confirm Password</Label>
            <Input type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
          </div>
          <Button onClick={handleChangePassword} disabled={loading}>
            <Lock className="w-4 h-4 mr-2" />
            {loading ? 'Bika...' : 'Hindura Ijambo Ryibanga / Change Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Lock, Save, Edit2, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/app/contexts/AuthContext';
import apiService from '@/app/services/apiService';

export default function ParentProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyProfile();
      if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          emergency_contact: data.emergency_contact || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await apiService.updateProfile(profileData);
      if (response.success) {
        alert('Profil yakozwe neza!');
        setIsEditing(false);
      }
    } catch (err: any) {
      alert('Byanze: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.first_name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Profil Yanjye
          </h1>
          <p className="text-gray-600">Reba no guhindura amakuru yawe</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {isEditing ? 'Hagarika' : 'Hindura'}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 border-2 border-purple-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                {profileData.first_name?.charAt(0)}{profileData.last_name?.charAt(0)}
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              {profileData.first_name} {profileData.last_name}
            </h2>
            <Badge className="mt-2 bg-purple-600">Umubyeyi / Parent</Badge>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Kwiyandikisha: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Konti Ikora Neza</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-2 border-purple-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
            <CardTitle>Amakuru y'Umuntu</CardTitle>
            <CardDescription>Amakuru yawe bwite</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Izina Ryambere
                </Label>
                <Input
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  disabled={!isEditing}
                  className="border-2 border-purple-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Izina Ryanyuma
                </Label>
                <Input
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  disabled={!isEditing}
                  className="border-2 border-purple-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className="border-2 border-purple-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="border-2 border-purple-100"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Aderesi
                </Label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                  className="border-2 border-purple-100"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone y'Igihe cy'Akaga
                </Label>
                <Input
                  value={profileData.emergency_contact}
                  onChange={(e) => setProfileData({ ...profileData, emergency_contact: e.target.value })}
                  disabled={!isEditing}
                  className="border-2 border-purple-100"
                />
              </div>
            </div>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end gap-4 pt-4 border-t-2 border-purple-100"
              >
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Hagarika
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Bika Impinduka
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-purple-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Umutekano
          </CardTitle>
          <CardDescription>Hindura ijambo ryibanga</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button variant="outline" className="border-2 border-purple-200">
            <Lock className="w-4 h-4 mr-2" />
            Hindura Ijambo Ryibanga
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

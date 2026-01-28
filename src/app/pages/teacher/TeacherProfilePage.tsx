import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import apiService from '@/app/services/apiService';
import { toast } from 'sonner';

interface TeacherProfilePageProps {
  onNavigate: (page: string) => void;
}

const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await apiService.updateUser(user?.id || 0, formData);
      if (res.success) {
        toast.success('Profil yahinduwe neza!');
        setEditing(false);
        // Update local storage
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        toast.error('Ikosa ryabaye mu guhindura profil');
      }
    } catch (err) {
      toast.error('Ikosa ryabaye');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="profile" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-6">
          Profil Yanjye
        </h1>
        <Card className="border-2 border-yellow-200">
          <CardHeader>
            <CardTitle>Amakuru Yanjye</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24 border-4 border-yellow-400">
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-2xl font-bold">
                  {formData.first_name?.[0]}{formData.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{formData.first_name} {formData.last_name}</h2>
                <p className="text-gray-600 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Izina rya Mbere</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  disabled={!editing}
                  className="border-yellow-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Izina rya Kabiri</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  disabled={!editing}
                  className="border-yellow-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="border-yellow-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Telefone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className="border-yellow-200"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Aderesi</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!editing}
                  className="border-yellow-200"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {editing ? (
                <>
                  <Button 
                    className="bg-gradient-to-r from-yellow-500 to-green-500 text-white"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Bika
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} disabled={loading}>
                    Hagarika
                  </Button>
                </>
              ) : (
                <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Hindura Profil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherProfilePage;

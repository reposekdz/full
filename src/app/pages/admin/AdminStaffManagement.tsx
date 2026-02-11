""import { API_BASE_URL } from '@/app/config/apiBase';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Upload, Edit, Save, X, Image as ImageIcon, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAuth } from '@/app/contexts/AuthContext';
import ParentLinkingManagement from '@/app/components/ParentLinkingManagement';

interface StaffMember {
  id: number;
  title: string;
  title_rw: string;
  name: string;
  image: string;
  description: string;
  description_rw: string;
  email: string;
  phone: string;
  responsibilities: string;
  responsibilities_rw: string;
}

const AdminStaffManagement: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<StaffMember>>({});
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('staff');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leadership/staff`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setStaff(data.staff);
    } catch (error) {
      console.error('Fetch staff error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setEditForm(member);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leadership/staff/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (data.success) {
        fetchStaff();
        setEditingId(null);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleImageUpload = async (staffId: number, file: File) => {
    setUploadingImage(staffId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE_URL}/leadership/staff/${staffId}/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        fetchStaff();
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadingImage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Staff Management - Admin Panel</h1>
          <p className="text-gray-600">Manage school leadership team information and images</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Staff Management
            </TabsTrigger>
            <TabsTrigger value="parent-linking" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Parent Linking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staff.map((member) => {
                const isEditing = editingId === member.id;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{member.title_rw}</CardTitle>
                          <div className="flex space-x-2">
                            {isEditing ? (
                              <>
                                <Button size="sm" variant="ghost" onClick={handleSave} className="text-white hover:bg-white/20">
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white hover:bg-white/20">
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(member)} className="text-white hover:bg-white/20">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-center relative">
                          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/150?text=' + member.name.charAt(0);
                              }}
                            />
                            {uploadingImage === member.id && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                              </div>
                            )}
                          </div>
                          <label className="absolute bottom-0 right-1/3 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                            <Upload className="h-4 w-4" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(member.id, file);
                              }}
                            />
                          </label>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-500">Title (Kinyarwanda)</Label>
                            {isEditing ? (
                              <Input
                                value={editForm.title_rw || ''}
                                onChange={(e) => setEditForm({ ...editForm, title_rw: e.target.value })}
                                className="mt-1"
                              />
                            ) : (
                              <p className="font-semibold text-gray-900">{member.title_rw}</p>
                            )}
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">Title (English)</Label>
                            {isEditing ? (
                              <Input
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="mt-1"
                              />
                            ) : (
                              <p className="text-sm text-gray-600">{member.title}</p>
                            )}
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">Full Name</Label>
                            {isEditing ? (
                              <Input
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="mt-1"
                              />
                            ) : (
                              <p className="font-bold text-lg text-gray-900">{member.name}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" /> Email
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.email || ''}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  className="mt-1 text-sm"
                                />
                              ) : (
                                <p className="text-sm text-gray-600">{member.email}</p>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" /> Phone
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.phone || ''}
                                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                  className="mt-1 text-sm"
                                />
                              ) : (
                                <p className="text-sm text-gray-600">{member.phone}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">Responsibilities (Kinyarwanda)</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.responsibilities_rw || ''}
                                onChange={(e) => setEditForm({ ...editForm, responsibilities_rw: e.target.value })}
                                rows={3}
                                className="mt-1 text-sm"
                              />
                            ) : (
                              <p className="text-sm text-gray-600 leading-relaxed">{member.responsibilities_rw}</p>
                            )}
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">Responsibilities (English)</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.responsibilities || ''}
                                onChange={(e) => setEditForm({ ...editForm, responsibilities: e.target.value })}
                                rows={3}
                                className="mt-1 text-sm"
                              />
                            ) : (
                              <p className="text-sm text-gray-600 leading-relaxed">{member.responsibilities}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="parent-linking">
            <ParentLinkingManagement
              userRole={user?.role || 'admin'}
              userId={user?.id || 1}
              userName={user?.first_name ? `${user.first_name} ${user.last_name}` : 'Admin'}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminStaffManagement;

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Mail, Phone, Award, Shield, BookOpen, TrendingUp, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { useAuth } from '@/app/contexts/AuthContext';

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

const StaffManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<StaffMember>>({});

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff', {
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
      const response = await fetch(`http://localhost:5000/api/staff/${editingId}`, {
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

  const getIcon = (title: string) => {
    if (title.includes('Head')) return Shield;
    if (title.includes('Study')) return BookOpen;
    if (title.includes('Discipline')) return Award;
    if (title.includes('Stock')) return TrendingUp;
    return Users;
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ubuyobozi bw'Ishuri</h1>
          <p className="text-gray-600">School Management Team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => {
            const Icon = getIcon(member.title);
            const isEditing = editingId === member.id;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all h-full">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-8 w-8" />
                        <div>
                          <CardTitle className="text-lg">
                            {isEditing ? (
                              <Input
                                value={editForm.title_rw || ''}
                                onChange={(e) => setEditForm({ ...editForm, title_rw: e.target.value })}
                                className="text-white bg-white/20 border-white/30"
                              />
                            ) : (
                              member.title_rw
                            )}
                          </CardTitle>
                          <p className="text-sm text-blue-100">{member.title}</p>
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => isEditing ? handleSave() : handleEdit(member)}
                          className="text-white hover:bg-white/20"
                        >
                          {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      {isEditing ? (
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="text-center font-bold"
                        />
                      ) : (
                        <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-blue-500" />
                        {isEditing ? (
                          <Input
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="text-sm"
                          />
                        ) : (
                          <span>{member.email}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-blue-500" />
                        {isEditing ? (
                          <Input
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="text-sm"
                          />
                        ) : (
                          <span>{member.phone}</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Inshingano / Responsibilities</h4>
                      {isEditing ? (
                        <Textarea
                          value={editForm.responsibilities_rw || ''}
                          onChange={(e) => setEditForm({ ...editForm, responsibilities_rw: e.target.value })}
                          rows={4}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm text-gray-600 leading-relaxed">{member.responsibilities_rw}</p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-2" /> Save
                        </Button>
                        <Button onClick={() => setEditingId(null)} variant="outline" className="flex-1">
                          <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default StaffManagementPage;

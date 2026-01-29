import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Search, UserCheck, Mail, Phone, Briefcase } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role_name: string;
  department?: string;
  specialization?: string;
  hire_date?: string;
  is_active: boolean;
  trade_id?: string;
  level?: string;
}

export default function StaffManagementPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', role_name: 'teacher',
    department: '', specialization: '', hire_date: '', trade_id: '', level: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/staff-management`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(data.staff);
    } catch (error) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingStaff) {
        await axios.put(`${API_URL}/staff-management/${editingStaff.id}`, 
          { ...formData, is_active: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Staff updated successfully');
      } else {
        await axios.post(`${API_URL}/staff-management`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Staff added successfully');
      }
      setShowModal(false);
      setEditingStaff(null);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', role_name: 'teacher', department: '', specialization: '', hire_date: '', trade_id: '', level: '' });
      fetchStaff();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const staff = filteredStaff.find(s => s.id === id);
      if (!staff) return;
      
      await axios.put(`${API_URL}/staff-management/${id}`, 
        { ...staff, is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Staff ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchStaff();
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  const filteredStaff = staff.filter(s => 
    (filterRole === 'all' || s.role_name === filterRole) &&
    (s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Staff Management
          </h1>
          <Button onClick={() => { setShowModal(true); setEditingStaff(null); }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Staff
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
              <option value="staff">Staff</option>
              <option value="accountant">Accountants</option>
              <option value="advisor">Advisors</option>
              <option value="stock_manager">Stock Managers</option>
              <option value="director_study">Director of Studies</option>
              <option value="director_discipline">Director of Discipline</option>
              <option value="headmaster">Headmaster</option>
            </select>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map(s => (
            <Card key={s.id} className={`p-6 hover:shadow-lg transition-shadow ${!s.is_active ? 'opacity-60 bg-gray-100' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {s.first_name[0]}{s.last_name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{s.first_name} {s.last_name}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {s.role_name}
                    </span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => { setEditingStaff(s); setFormData(s); setShowModal(true); }}
                  className="hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{s.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{s.phone}</span>
                </div>
                {s.department && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{s.department}</span>
                  </div>
                )}
                {s.specialization && (
                  <p className="text-sm text-gray-500">Specialization: {s.specialization}</p>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant={s.is_active ? "outline" : "default"}
                onClick={() => handleToggleStatus(s.id, s.is_active)}
                className="w-full"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {s.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </Card>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingStaff ? 'Edit' : 'Add'} Staff</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                <Input placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                <select value={formData.role_name} onChange={(e) => setFormData({...formData, role_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="accountant">Accountant</option>
                  <option value="advisor">Advisor</option>
                  <option value="stock_manager">Stock Manager</option>
                  <option value="director_study">Director of Studies</option>
                  <option value="director_discipline">Director of Discipline</option>
                  <option value="headmaster">Headmaster</option>
                </select>
                {formData.role_name === 'student' && (
                  <>
                    <Input placeholder="Trade ID" value={formData.trade_id} onChange={(e) => setFormData({...formData, trade_id: e.target.value})} required />
                    <Input placeholder="Level (3, 4, or 5)" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} required />
                  </>
                )}
                <Input placeholder="Department" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                <Input placeholder="Specialization" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
                <Input type="date" placeholder="Hire Date" value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

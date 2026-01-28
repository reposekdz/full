import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Edit, Trash2, Search, Filter, Upload, Save, X, Briefcase, Award, Phone, Mail, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import axios from 'axios';

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  trade_id?: number;
  trade_name?: string;
  level?: string;
  specialization?: string;
  qualifications?: string;
  experience_years: number;
  hire_date?: string;
  salary: number;
  status: string;
  image?: string;
  bio?: string;
  bio_rw?: string;
}

interface Trade {
  id: number;
  title: string;
  title_rw: string;
}

const ComprehensiveStaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterTrade, setFilterTrade] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [stats, setStats] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: '', trade_id: '', level: '',
    specialization: '', qualifications: '', experience_years: 0,
    hire_date: '', salary: 0, status: 'active', bio: '', bio_rw: '',
    image: null as File | null
  });

  const roles = ['Teacher', 'Instructor', 'Administrator', 'Accountant', 'Librarian', 'Security', 'Maintenance', 'Other'];
  const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];

  useEffect(() => {
    fetchData();
  }, [filterRole, filterTrade, filterLevel, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRole !== 'all') params.append('role', filterRole);
      if (filterTrade !== 'all') params.append('trade_id', filterTrade);
      if (filterLevel !== 'all') params.append('level', filterLevel);
      if (searchQuery) params.append('search', searchQuery);

      const [staffRes, tradesRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/comprehensive-staff?${params}`),
        axios.get('http://localhost:5000/api/trades'),
        axios.get('http://localhost:5000/api/comprehensive-staff/stats/overview')
      ]);

      setStaff(staffRes.data.staff || []);
      setTrades(tradesRes.data || []);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value) {
          formDataToSend.append(key, value);
        } else if (value !== null && value !== '') {
          formDataToSend.append(key, value.toString());
        }
      });

      if (editingStaff) {
        await axios.put(`http://localhost:5000/api/comprehensive-staff/${editingStaff.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('http://localhost:5000/api/comprehensive-staff', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      fetchData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Urashaka gusiba uyu mukozi? / Delete this staff member?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/comprehensive-staff/${id}`);
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openEditDialog = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      trade_id: member.trade_id?.toString() || '',
      level: member.level || '',
      specialization: member.specialization || '',
      qualifications: member.qualifications || '',
      experience_years: member.experience_years,
      hire_date: member.hire_date || '',
      salary: member.salary,
      status: member.status,
      bio: member.bio || '',
      bio_rw: member.bio_rw || '',
      image: null
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingStaff(null);
    setFormData({
      name: '', email: '', phone: '', role: '', trade_id: '', level: '',
      specialization: '', qualifications: '', experience_years: 0,
      hire_date: '', salary: 0, status: 'active', bio: '', bio_rw: '', image: null
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-lime-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-2">
          Gucunga Abakozi / Staff Management
        </h1>
        <p className="text-gray-600">Gucunga abakozi bose hamwe n'amahugurwa yabo / Manage all staff with their trades and levels</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-yellow-200">
            <CardContent className="p-4 bg-gradient-to-br from-yellow-500 to-green-600 text-white">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-2xl font-black">{stats.total}</p>
              <p className="text-sm opacity-90">Total Staff</p>
            </CardContent>
          </Card>
          {stats.byRole.slice(0, 3).map((item: any, idx: number) => (
            <Card key={idx} className="border-2 border-green-200">
              <CardContent className="p-4">
                <p className="text-2xl font-black text-green-600">{item.count}</p>
                <p className="text-sm text-gray-600">{item.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6 border-2 border-yellow-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Shakisha / Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-yellow-300"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="border-yellow-300">
                <SelectValue placeholder="Umurimo / Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose / All Roles</SelectItem>
                {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTrade} onValueChange={setFilterTrade}>
              <SelectTrigger className="border-yellow-300">
                <SelectValue placeholder="Umwuga / Trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose / All Trades</SelectItem>
                {trades.map(trade => <SelectItem key={trade.id} value={trade.id.toString()}>{trade.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="border-yellow-300">
                <SelectValue placeholder="Urwego / Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose / All Levels</SelectItem>
                {levels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => { setIsDialogOpen(true); resetForm(); }} className="bg-gradient-to-r from-yellow-500 to-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Ongeraho / Add Staff
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <motion.div key={member.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-green-600 text-white pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-white text-green-600">{member.role}</Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(member)} className="text-white hover:bg-white/20">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(member.id)} className="text-white hover:bg-white/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-yellow-200">
                      <img
                        src={member.image ? `http://localhost:5000${member.image}` : `https://ui-avatars.com/api/?name=${member.name}&background=fbbf24&color=fff`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                      {member.trade_name && (
                        <p className="text-sm text-green-600 flex items-center">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {member.trade_name}
                        </p>
                      )}
                      {member.level && (
                        <Badge className="mt-1 bg-yellow-500 text-white text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {member.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {member.email && (
                      <p className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-yellow-600" />
                        {member.email}
                      </p>
                    )}
                    {member.phone && (
                      <p className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-green-600" />
                        {member.phone}
                      </p>
                    )}
                    {member.experience_years > 0 && (
                      <p className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        {member.experience_years} years experience
                      </p>
                    )}
                    {member.specialization && (
                      <p className="text-gray-600 text-xs mt-2 italic">{member.specialization}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              {editingStaff ? 'Hindura Umukozi / Edit Staff' : 'Ongeraho Umukozi / Add Staff'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Izina / Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border-yellow-300" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="border-yellow-300" />
            </div>
            <div>
              <Label>Telefoni / Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="border-yellow-300" />
            </div>
            <div>
              <Label>Umurimo / Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="border-yellow-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Umwuga / Trade</Label>
              <Select value={formData.trade_id} onValueChange={(value) => setFormData({ ...formData, trade_id: value })}>
                <SelectTrigger className="border-yellow-300"><SelectValue placeholder="Select trade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {trades.map(trade => <SelectItem key={trade.id} value={trade.id.toString()}>{trade.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Urwego / Level</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger className="border-yellow-300"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {levels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ubumenyi / Specialization</Label>
              <Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="border-yellow-300" />
            </div>
            <div>
              <Label>Uburambe / Experience (years)</Label>
              <Input type="number" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })} className="border-yellow-300" />
            </div>
            <div>
              <Label>Itariki yo Gutangira / Hire Date</Label>
              <Input type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} className="border-yellow-300" />
            </div>
            <div>
              <Label>Umushahara / Salary</Label>
              <Input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })} className="border-yellow-300" />
            </div>
            <div>
              <Label>Imimerere / Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="border-yellow-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Impamyabumenyi / Qualifications</Label>
              <Textarea value={formData.qualifications} onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })} rows={2} className="border-yellow-300" />
            </div>
            <div className="col-span-2">
              <Label>Ishusho / Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} className="border-yellow-300" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Hagarika / Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-yellow-500 to-green-600">
              <Save className="w-4 h-4 mr-2" />
              {editingStaff ? 'Bika / Save' : 'Ongeraho / Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveStaffManagement;

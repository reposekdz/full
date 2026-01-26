import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  User,
  MapPin,
  Mail,
  AlertCircle,
  Heart,
  Users,
  UserCheck,
  Filter
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';

const API_BASE = 'http://localhost:5000/api';

interface EmergencyContact {
  id: number;
  person_id: number;
  person_type: string;
  person_name?: string;
  contact_name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
}

const EmergencyContactsManagement: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPrimary, setFilterPrimary] = useState('all');
  
  const [formData, setFormData] = useState({
    person_id: '',
    person_type: 'student',
    contact_name: '',
    relationship: '',
    phone_primary: '',
    phone_secondary: '',
    email: '',
    address: '',
    is_primary: false,
    notes: ''
  });

  const relationships = [
    'Parent',
    'Guardian',
    'Sibling',
    'Grandparent',
    'Uncle',
    'Aunt',
    'Cousin',
    'Friend',
    'Neighbor',
    'Other'
  ];

  useEffect(() => {
    fetchContacts();
    fetchStudents();
    fetchStaff();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/emergency-contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data) {
        setStaff(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const url = editingContact
      ? `${API_BASE}/emergency-contacts/${editingContact.id}`
      : `${API_BASE}/emergency-contacts`;
    
    const method = editingContact ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchContacts();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving emergency contact:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/emergency-contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      person_id: contact.person_id.toString(),
      person_type: contact.person_type,
      contact_name: contact.contact_name,
      relationship: contact.relationship,
      phone_primary: contact.phone_primary,
      phone_secondary: contact.phone_secondary || '',
      email: contact.email || '',
      address: contact.address || '',
      is_primary: contact.is_primary,
      notes: contact.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      person_id: '',
      person_type: 'student',
      contact_name: '',
      relationship: '',
      phone_primary: '',
      phone_secondary: '',
      email: '',
      address: '',
      is_primary: false,
      notes: ''
    });
    setEditingContact(null);
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'guardian': return 'bg-purple-100 text-purple-800';
      case 'sibling': return 'bg-green-100 text-green-800';
      case 'grandparent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.phone_primary?.includes(searchTerm) ||
                          contact.relationship?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contact.person_type === filterType;
    const matchesPrimary = filterPrimary === 'all' || 
                          (filterPrimary === 'primary' && contact.is_primary) ||
                          (filterPrimary === 'secondary' && !contact.is_primary);
    
    return matchesSearch && matchesType && matchesPrimary;
  });

  const stats = {
    total: contacts.length,
    students: contacts.filter(c => c.person_type === 'student').length,
    staff: contacts.filter(c => c.person_type === 'staff').length,
    primary: contacts.filter(c => c.is_primary).length
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Phone className="w-10 h-10 text-red-600" />
            Emergency Contacts Management
          </h1>
          <p className="text-gray-600">Manage emergency contact information for students and staff</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Phone className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Student Contacts</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.students}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Staff Contacts</p>
                  <p className="text-2xl font-bold text-green-600">{stats.staff}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Primary Contacts</p>
                  <p className="text-2xl font-bold text-red-600">{stats.primary}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPrimary} onValueChange={setFilterPrimary}>
                <SelectTrigger>
                  <SelectValue placeholder="Contact Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  <SelectItem value="primary">Primary Only</SelectItem>
                  <SelectItem value="secondary">Secondary Only</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          {contact.contact_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900">{contact.contact_name}</h3>
                            {contact.is_primary && (
                              <Badge className="bg-red-100 text-red-800">
                                <Heart className="w-3 h-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            <Badge className={getRelationshipColor(contact.relationship)}>
                              {contact.relationship}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            For: <span className="font-medium">{contact.person_name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {contact.person_type}
                            </Badge>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-red-500" />
                          <span className="font-medium">Primary:</span>
                          <span>{contact.phone_primary}</span>
                        </div>
                        
                        {contact.phone_secondary && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">Secondary:</span>
                            <span>{contact.phone_secondary}</span>
                          </div>
                        )}
                        
                        {contact.email && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        
                        {contact.address && (
                          <div className="flex items-center gap-2 text-gray-700 col-span-full">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <span>{contact.address}</span>
                          </div>
                        )}
                      </div>

                      {contact.notes && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <p className="text-sm text-gray-700">{contact.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(contact)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Phone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No emergency contacts found</h3>
              <p className="text-gray-500 mb-4">Add emergency contact information for students and staff</p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="person_type">Person Type *</Label>
                  <Select
                    value={formData.person_type}
                    onValueChange={(value) => setFormData({ ...formData, person_type: value, person_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="person_id">
                    {formData.person_type === 'student' ? 'Student' : 'Staff Member'} *
                  </Label>
                  <Select
                    value={formData.person_id}
                    onValueChange={(value) => setFormData({ ...formData, person_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${formData.person_type}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.person_type === 'student' 
                        ? students.map(student => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.first_name} {student.last_name} - {student.student_id}
                            </SelectItem>
                          ))
                        : staff.map(member => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.first_name} {member.last_name} - {member.employee_id}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Enter contact name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map(rel => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_primary">Primary Phone *</Label>
                  <Input
                    id="phone_primary"
                    value={formData.phone_primary}
                    onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                    placeholder="+250 XXX XXX XXX"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone_secondary">Secondary Phone</Label>
                  <Input
                    id="phone_secondary"
                    value={formData.phone_secondary}
                    onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_primary">Primary Contact</Label>
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                  <Save className="mr-2 h-4 w-4" />
                  {editingContact ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EmergencyContactsManagement;

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, Download, Upload,
  Users, Award, Calendar, Clock, CheckCircle, XCircle, Crown, Shield, UserCheck, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface Leader {
  id: number;
  name: string;
  position: string;
  position_rw: string;
  level: string;
  photo_url: string;
  phone: string;
  email: string;
  is_active: boolean;
  start_date: string;
}

const LeadershipManagementPage: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leadership', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLeaders(data.leaders || data || []);
      }
    } catch (error) {
      console.error('Error fetching leadership:', error);
      // Use mock data if API fails
      setLeaders([
        { id: 1, name: 'John Mugisha', position: 'Headmaster', position_rw: 'Umuyobozi', level: 'Level 1', photo_url: '', phone: '+250788000001', email: 'headmaster@school.rw', is_active: true, start_date: '2020-01-15' },
        { id: 2, name: 'Marie Uwase', position: 'Director of Studies', position_rw: 'Umudirizi w\'Amashuri', level: 'Level 2', photo_url: '', phone: '+250788000002', email: 'dos@school.rw', is_active: true, start_date: '2021-03-20' },
        { id: 3, name: 'Pierre Nkusi', position: 'Director of Discipline', position_rw: 'Umudirizi w\'Ibyiringitungo', level: 'Level 2', photo_url: '', phone: '+250788000003', email: 'dod@school.rw', is_active: true, start_date: '2021-03-20' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLeader = async (leader: Partial<Leader>) => {
    try {
      const token = localStorage.getItem('token');
      const method = editingLeader ? 'PUT' : 'POST';
      const url = editingLeader 
        ? `http://localhost:5000/api/leadership/${editingLeader.id}`
        : 'http://localhost:5000/api/leadership';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leader)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchLeaders();
        setShowModal(false);
        setEditingLeader(null);
      }
    } catch (error) {
      console.error('Error saving leader:', error);
    }
  };

  const handleDeleteLeader = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leader?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/leadership/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchLeaders();
      }
    } catch (error) {
      console.error('Error deleting leader:', error);
    }
  };

  const filteredLeaders = leaders.filter(leader => 
    leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    leader.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeLeaders = filteredLeaders.filter(l => l.is_active);
  const inactiveLeaders = filteredLeaders.filter(l => !l.is_active);

  const getPositionIcon = (position: string) => {
    if (position.toLowerCase().includes('headmaster') || position.toLowerCase().includes('director')) {
      return <Crown className="w-5 h-5 text-yellow-500" />;
    }
    if (position.toLowerCase().includes('discipline')) {
      return <Shield className="w-5 h-5 text-red-500" />;
    }
    return <UserCheck className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 via-white to-amber-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leadership Management</h1>
          <p className="text-gray-600">Manage school leadership and administration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchLeaders()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { setEditingLeader(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Leader
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search leaders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Leaders</p>
                <p className="text-2xl font-bold">{leaders.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeLeaders.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{inactiveLeaders.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Positions</p>
                <p className="text-2xl font-bold">{new Set(leaders.map(l => l.position)).size}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-xl shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 px-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-yellow-100">All ({filteredLeaders.length})</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-green-100">Active ({activeLeaders.length})</TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-red-100">Inactive ({inactiveLeaders.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {(activeTab === 'all' ? filteredLeaders : activeTab === 'active' ? activeLeaders : inactiveLeaders).map((leader) => (
                <Card key={leader.id} className="bg-white border-2 border-gray-100 hover:border-yellow-200 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white font-bold text-xl">
                        {leader.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getPositionIcon(leader.position)}
                          <h3 className="font-bold text-lg">{leader.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{leader.position}</p>
                        <p className="text-xs text-gray-400">{leader.position_rw}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={leader.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {leader.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{leader.level}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingLeader(leader); setShowModal(true); }}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-500" onClick={() => handleDeleteLeader(leader.id)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal for Add/Edit Leader */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingLeader ? 'Edit Leader' : 'Add New Leader'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveLeader({
                name: formData.get('name') as string,
                position: formData.get('position') as string,
                position_rw: formData.get('position_rw') as string,
                level: formData.get('level') as string,
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
                is_active: true,
                start_date: new Date().toISOString().split('T')[0]
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input name="name" defaultValue={editingLeader?.name} required placeholder="e.g., John Mugisha" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position (English)</label>
                  <Input name="position" defaultValue={editingLeader?.position} required placeholder="e.g., Headmaster" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position (Kinyarwanda)</label>
                  <Input name="position_rw" defaultValue={editingLeader?.position_rw} placeholder="e.g., Umuyobozi" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <Input name="level" defaultValue={editingLeader?.level || 'Level 2'} placeholder="e.g., Level 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input name="phone" defaultValue={editingLeader?.phone} placeholder="+250788000000" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input name="email" type="email" defaultValue={editingLeader?.email} placeholder="email@school.rw" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingLeader ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadershipManagementPage;

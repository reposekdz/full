import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/config/apiBase';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Trophy, Briefcase, Image, FileText, Settings,
  Plus, Edit, Trash2, Save, X, Upload, Eye, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';

const ComprehensiveAdminContentManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('sports');

  // Data States
  const [sports, setSports] = useState<any[]>([]);
  const [leadership, setLeadership] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [sportsRes, leadershipRes, tradesRes, servicesRes, newsRes, devsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sports`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/leadership`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/trades`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/services`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/news`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/developers`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [sportsData, leadershipData, tradesData, servicesData, newsData, devsData] = await Promise.all([
        sportsRes.json(), leadershipRes.json(), tradesRes.json(), servicesRes.json(), newsRes.json(), devsRes.json()
      ]);

      if (sportsData.success) setSports(sportsData.sports || []);
      if (leadershipData.success) setLeadership(leadershipData.leadership || []);
      if (tradesData.success) setTrades(tradesData.trades || []);
      if (servicesData.success) setServices(servicesData.services || []);
      if (newsData.success) setNews(newsData.articles || []);
      if (devsData.success) setDevelopers(devsData.developers || []);
    } catch (error) {
      showMessage('error', 'Failed to load data');
    }
    setLoading(false);
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleCreate = (type: string) => {
    setEditingItem(null);
    setFormData({});
    setImageFile(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const endpoint = getEndpoint();
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `${API_BASE_URL}${endpoint}/${editingItem.id}` : `${API_BASE_URL}${endpoint}`;

    try {
      let body: any;
      if (imageFile) {
        const formDataObj = new FormData();
        Object.keys(formData).forEach(key => formDataObj.append(key, formData[key]));
        formDataObj.append('image', imageFile);
        body = formDataObj;
      } else {
        body = JSON.stringify(formData);
      }

      const res = await fetch(url, {
        method,
        headers: imageFile ? { 'Authorization': `Bearer ${token}` } : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body
      });

      const data = await res.json();
      if (data.success) {
        showMessage('success', editingItem ? 'Updated successfully!' : 'Created successfully!');
        setShowModal(false);
        fetchAllData();
      } else {
        showMessage('error', data.message || 'Operation failed');
      }
    } catch (error) {
      showMessage('error', 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const token = localStorage.getItem('token');
    const endpoint = getEndpoint();
    
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        showMessage('success', 'Deleted successfully!');
        fetchAllData();
      } else {
        showMessage('error', data.message || 'Delete failed');
      }
    } catch (error) {
      showMessage('error', 'Delete failed');
    }
  };

  const getEndpoint = () => {
    const endpoints: any = {
      sports: '/sports',
      leadership: '/leadership',
      trades: '/trades',
      services: '/services',
      news: '/news',
      developers: '/developers'
    };
    return endpoints[activeTab] || '/sports';
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'sports':
        return (
          <>
            <div><Label>Sport Name</Label><Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
            <div><Label>Image</Label><Input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></div>
          </>
        );
      case 'leadership':
        return (
          <>
            <div><Label>Name</Label><Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><Label>Position</Label><Input value={formData.position || ''} onChange={(e) => setFormData({...formData, position: e.target.value})} /></div>
            <div><Label>Bio</Label><Textarea value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} /></div>
            <div><Label>Image</Label><Input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></div>
          </>
        );
      case 'trades':
        return (
          <>
            <div><Label>Trade Name</Label><Input value={formData.trade_name || ''} onChange={(e) => setFormData({...formData, trade_name: e.target.value})} /></div>
            <div><Label>Trade Code</Label><Input value={formData.trade_code || ''} onChange={(e) => setFormData({...formData, trade_code: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
          </>
        );
      case 'services':
        return (
          <>
            <div><Label>Service Name</Label><Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
            <div><Label>Icon</Label><Input value={formData.icon || ''} onChange={(e) => setFormData({...formData, icon: e.target.value})} /></div>
          </>
        );
      case 'news':
        return (
          <>
            <div><Label>Title</Label><Input value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
            <div><Label>Content</Label><Textarea value={formData.content || ''} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={6} /></div>
            <div><Label>Category</Label><Input value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} /></div>
            <div><Label>Image</Label><Input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></div>
          </>
        );
      case 'developers':
        return (
          <>
            <div><Label>Name</Label><Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><Label>Role</Label><Input value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} /></div>
            <div><Label>Bio</Label><Textarea value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} /></div>
            <div><Label>Image</Label><Input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></div>
          </>
        );
      default:
        return null;
    }
  };

  const renderList = () => {
    const data: any = { sports, leadership, trades, services, news, developers };
    const items = data[activeTab] || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <Card key={item.id} className="hover:shadow-lg transition">
            <CardContent className="p-4">
              {item.image_url && <img src={item.image_url} alt={item.name || item.title} className="w-full h-40 object-cover rounded mb-3" />}
              <h3 className="font-bold text-lg mb-2">{item.name || item.title || item.trade_name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description || item.bio || item.content || item.position}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {message.text && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600">Manage all dynamic content</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchAllData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => handleCreate(activeTab)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="sports"><Trophy className="w-4 h-4 mr-2" />Sports</TabsTrigger>
            <TabsTrigger value="leadership"><Users className="w-4 h-4 mr-2" />Leadership</TabsTrigger>
            <TabsTrigger value="trades"><Briefcase className="w-4 h-4 mr-2" />Trades</TabsTrigger>
            <TabsTrigger value="services"><Settings className="w-4 h-4 mr-2" />Services</TabsTrigger>
            <TabsTrigger value="news"><FileText className="w-4 h-4 mr-2" />News</TabsTrigger>
            <TabsTrigger value="developers"><BookOpen className="w-4 h-4 mr-2" />Developers</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : (
              renderList()
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Create'} {activeTab}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {renderForm()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveAdminContentManager;

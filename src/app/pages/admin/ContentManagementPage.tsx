import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Layout, Plus, Edit2, Trash2, Save, X, Upload, Users, Trophy, Briefcase, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface ContentItem {
  id: number;
  type: string;
  title: string;
  description: string;
  image_url: string;
  data: any;
  is_active: boolean;
}

const ContentManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sports');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    data: {} as any
  });

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/content/${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('type', activeTab);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('data', JSON.stringify(formData.data));
    if (imageFile) data.append('image', imageFile);

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5000/api/admin/content/${editingId}`
        : 'http://localhost:5000/api/admin/content';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      
      const result = await res.json();
      if (result.success) {
        fetchItems();
        resetForm();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setFormData({
      title: item.title,
      description: item.description,
      data: item.data || {}
    });
    setImagePreview(item.image_url ? `http://localhost:5000${item.image_url}` : '');
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/content/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchItems();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', data: {} });
    setImagePreview('');
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case 'sports':
        return (
          <>
            <div>
              <Label>Sport Name / Izina ry'Imikino</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label>Description / Ibisobanuro</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div>
              <Label>Coach Name / Umutoza</Label>
              <Input value={formData.data.coach || ''} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, coach: e.target.value } })} />
            </div>
            <div>
              <Label>Players Count / Abakinnyi</Label>
              <Input type="number" value={formData.data.players || ''} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, players: e.target.value } })} />
            </div>
          </>
        );
      case 'leadership':
        return (
          <>
            <div>
              <Label>Name / Izina</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label>Position / Umwanya</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.data.email || ''} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, email: e.target.value } })} />
            </div>
            <div>
              <Label>Phone / Telefone</Label>
              <Input value={formData.data.phone || ''} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, phone: e.target.value } })} />
            </div>
          </>
        );
      case 'trades':
        return (
          <>
            <div>
              <Label>Trade Name / Izina ry'Umwuga</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label>Description / Ibisobanuro</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div>
              <Label>Duration / Igihe</Label>
              <Input value={formData.data.duration || ''} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, duration: e.target.value } })} />
            </div>
            <div>
              <Label>Capacity / Umubare</Label>
              <Input type="number" value={formData.data.capacity || ''} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, capacity: e.target.value } })} />
            </div>
          </>
        );
      case 'developers':
        return (
          <>
            <div>
              <Label>Developer Name / Izina</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label>Role / Umwanya</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div>
              <Label>GitHub</Label>
              <Input value={formData.data.github || ''} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, github: e.target.value } })} />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input value={formData.data.linkedin || ''} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, linkedin: e.target.value } })} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'sports': return <Trophy className="w-6 h-6" />;
      case 'leadership': return <Users className="w-6 h-6" />;
      case 'trades': return <Briefcase className="w-6 h-6" />;
      case 'developers': return <Code className="w-6 h-6" />;
      default: return <Layout className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
            <Layout className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gucunga Ibikubiyemo / Content Management
            </h1>
            <p className="text-gray-600">Hindura amakuru y'urubuga / Manage website content</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-purple-600 to-pink-600">
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Funga / Close' : 'Ongeraho / Add New'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="sports" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Imikino / Sports
          </TabsTrigger>
          <TabsTrigger value="leadership" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Ubuyobozi / Leadership
          </TabsTrigger>
          <TabsTrigger value="trades" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Imyuga / Trades
          </TabsTrigger>
          <TabsTrigger value="developers" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Abateje / Developers
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {showForm && (
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle>{editingId ? 'Hindura / Edit' : 'Ongeraho / Add New'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {renderFormFields()}
                  </div>
                  <div>
                    <Label>Image / Ifoto</Label>
                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Save className="w-4 h-4 mr-2" />
                      {editingId ? 'Bika / Update' : 'Ongeraho / Create'}
                    </Button>
                    <Button type="button" onClick={resetForm} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Hagarika / Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {items.map((item) => (
              <Card key={item.id} className="border-2 border-purple-100 hover:shadow-lg transition">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {item.image_url && (
                      <img src={`http://localhost:5000${item.image_url}`} alt={item.title} className="w-24 h-24 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getIcon(item.type)}
                        <h3 className="text-xl font-bold">{item.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      {item.data && Object.keys(item.data).length > 0 && (
                        <div className="flex gap-4 text-sm text-gray-500">
                          {Object.entries(item.data).map(([key, value]) => (
                            <span key={key}>{key}: {value as string}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagementPage;

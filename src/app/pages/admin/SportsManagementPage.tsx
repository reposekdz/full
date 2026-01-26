import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Award, Target, Plus, Edit2, Trash2, Save, X, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface SportItem {
  id: number;
  name: string;
  description: string;
  image_url: string;
  data: any;
}

const SportsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const [items, setItems] = useState<SportItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/sports/${activeTab}`, {
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
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (imageFile) data.append('image', imageFile);

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5000/api/admin/sports/${activeTab}/${editingId}`
        : `http://localhost:5000/api/admin/sports/${activeTab}`;
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

  const handleEdit = (item: SportItem) => {
    setFormData(item.data || {});
    setImagePreview(item.image_url ? `http://localhost:5000${item.image_url}` : '');
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/sports/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchItems();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const resetForm = () => {
    setFormData({});
    setImagePreview('');
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'teams':
        return (
          <>
            <div>
              <Label>Team Name / Izina ry'Ikipe</Label>
              <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label>Sport Type / Ubwoko bw'Imikino</Label>
              <Input value={formData.sport_type || ''} onChange={(e) => setFormData({ ...formData, sport_type: e.target.value })} required />
            </div>
            <div>
              <Label>Coach / Umutoza</Label>
              <Input value={formData.coach || ''} onChange={(e) => setFormData({ ...formData, coach: e.target.value })} />
            </div>
            <div>
              <Label>Players Count / Abakinnyi</Label>
              <Input type="number" value={formData.players_count || ''} onChange={(e) => setFormData({ ...formData, players_count: e.target.value })} />
            </div>
          </>
        );
      case 'players':
        return (
          <>
            <div>
              <Label>Player Name / Izina ry'Umukinnyi</Label>
              <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label>Position / Umwanya</Label>
              <Input value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
            </div>
            <div>
              <Label>Jersey Number / Numero</Label>
              <Input type="number" value={formData.jersey_number || ''} onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })} />
            </div>
            <div>
              <Label>Team / Ikipe</Label>
              <Input value={formData.team || ''} onChange={(e) => setFormData({ ...formData, team: e.target.value })} />
            </div>
          </>
        );
      case 'coaches':
        return (
          <>
            <div>
              <Label>Coach Name / Izina ry'Umutoza</Label>
              <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label>Sport / Umukino</Label>
              <Input value={formData.sport || ''} onChange={(e) => setFormData({ ...formData, sport: e.target.value })} required />
            </div>
            <div>
              <Label>Experience / Uburambe</Label>
              <Input value={formData.experience || ''} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
            </div>
            <div>
              <Label>Phone / Telefone</Label>
              <Input value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </>
        );
      case 'achievements':
        return (
          <>
            <div>
              <Label>Achievement Title / Izina ry'Intsinzi</Label>
              <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label>Sport / Umukino</Label>
              <Input value={formData.sport || ''} onChange={(e) => setFormData({ ...formData, sport: e.target.value })} required />
            </div>
            <div>
              <Label>Date / Itariki</Label>
              <Input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div>
              <Label>Description / Ibisobanuro</Label>
              <Input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-yellow-500 to-green-600 p-3 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              Imikino / Sports Management
            </h1>
            <p className="text-gray-600">Gucunga imikino n'amakipe / Manage sports and teams</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-yellow-600 to-green-600">
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Funga / Close' : 'Ongeraho / Add New'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Amakipe / Teams
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Abakinnyi / Players
          </TabsTrigger>
          <TabsTrigger value="coaches" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Abatoza / Coaches
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Intsinzi / Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {showForm && (
            <Card className="border-2 border-yellow-100">
              <CardHeader>
                <CardTitle>{editingId ? 'Hindura / Edit' : 'Ongeraho / Add New'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {renderForm()}
                  </div>
                  <div>
                    <Label>Image / Ifoto</Label>
                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-gradient-to-r from-yellow-600 to-green-600">
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
              <Card key={item.id} className="border-2 border-yellow-100 hover:shadow-lg transition">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {item.image_url && (
                      <img src={`http://localhost:5000${item.image_url}`} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{item.name || item.data?.title}</h3>
                      <p className="text-gray-600">{item.description || item.data?.description}</p>
                      {item.data && (
                        <div className="flex gap-4 text-sm text-gray-500 mt-2">
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

export default SportsManagementPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

const API_BASE = 'http://localhost:5000/api/sports';

interface OverviewContent {
  id?: number;
  team_id: number;
  content_type: string;
  title: string;
  title_rw: string;
  description: string;
  description_rw: string;
  image_url?: string;
  icon: string;
  value?: string;
  color?: string;
  sort_order: number;
}

const TeamOverviewManagement: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [content, setContent] = useState<OverviewContent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OverviewContent | null>(null);
  const [formData, setFormData] = useState<OverviewContent>({
    team_id: 0,
    content_type: 'stat',
    title: '',
    title_rw: '',
    description: '',
    description_rw: '',
    icon: '',
    value: '',
    color: 'green',
    sort_order: 0
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchContent();
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sports/teams');
      const data = await res.json();
      if (data.success) setTeams(data.teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams/${selectedTeam}/overview`);
      const data = await res.json();
      if (data.success) setContent(data.content);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const openModal = (item?: OverviewContent) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        team_id: selectedTeam || 0,
        content_type: 'stat',
        title: '',
        title_rw: '',
        description: '',
        description_rw: '',
        icon: '',
        value: '',
        color: 'green',
        sort_order: content.length
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingItem
        ? `${API_BASE}/overview/${editingItem.id}`
        : `${API_BASE}/teams/${selectedTeam}/overview`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        fetchContent();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Urashaka gusiba ibi?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/overview/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchContent();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-yellow-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Gucunga Incamake y'Ikipe</h1>

          {/* Team Selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Hitamo Ikipe</label>
            <Select value={selectedTeam?.toString()} onValueChange={(v) => setSelectedTeam(parseInt(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Hitamo ikipe..." />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.icon} {team.name_rw || team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTeam && (
            <>
              <Button onClick={() => openModal()} className="mb-6 bg-gradient-to-r from-green-600 to-yellow-600">
                <Plus className="w-4 h-4 mr-2" /> Ongeraho Ibirimo
              </Button>

              {/* Content List */}
              <div className="space-y-4">
                {content.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{item.icon}</span>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{item.title_rw}</h3>
                        <p className="text-sm text-gray-600">{item.description_rw}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                            {item.content_type}
                          </span>
                          {item.value && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                              {item.value}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => openModal(item)} variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(item.id!)} variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Hindura' : 'Ongeraho'} Ibirimo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Ubwoko</label>
              <Select value={formData.content_type} onValueChange={(v) => setFormData({ ...formData, content_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stat">Imibare (Stat)</SelectItem>
                  <SelectItem value="highlight">Ibyiza (Highlight)</SelectItem>
                  <SelectItem value="milestone">Intego (Milestone)</SelectItem>
                  <SelectItem value="quote">Amagambo (Quote)</SelectItem>
                  <SelectItem value="image">Ifoto (Image)</SelectItem>
                  <SelectItem value="announcement">Itangazo (Announcement)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Umutwe (English)</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Umutwe (Kinyarwanda)</label>
                <Input value={formData.title_rw} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Ibisobanuro (English)</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Ibisobanuro (Kinyarwanda)</label>
                <Textarea value={formData.description_rw} onChange={(e) => setFormData({ ...formData, description_rw: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Icon (Emoji)</label>
                <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="🏆" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Agaciro (Value)</label>
                <Input value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="75%" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Ibara (Color)</label>
                <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Icyatsi (Green)</SelectItem>
                    <SelectItem value="blue">Ubururu (Blue)</SelectItem>
                    <SelectItem value="yellow">Umuhondo (Yellow)</SelectItem>
                    <SelectItem value="red">Umutuku (Red)</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">URL y'Ifoto</label>
              <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="/uploads/..." />
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-green-600 to-yellow-600">
                <Save className="w-4 h-4 mr-2" /> Bika
              </Button>
              <Button onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" /> Hagarika
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamOverviewManagement;

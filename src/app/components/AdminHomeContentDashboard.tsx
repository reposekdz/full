import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Image, Star, MessageSquare, Bell, BarChart3, Plus, Edit, Trash2, Eye, Save, X, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';

const API_URL = 'http://localhost:5000/api/home-content';

export const AdminHomeContentDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, trades: 0, sports: 0, achievements: 0 });
  const [heroSlides, setHeroSlides] = useState([]);
  const [features, setFeatures] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, type: '', data: null, isNew: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, slidesRes, featuresRes, testimonialsRes, announcementsRes] = await Promise.all([
        fetch(`${API_URL}/stats`, { headers }),
        fetch(`${API_URL}/hero-slides`, { headers }),
        fetch(`${API_URL}/features`, { headers }),
        fetch(`${API_URL}/testimonials`, { headers }),
        fetch(`${API_URL}/announcements`, { headers })
      ]);

      const [statsData, slidesData, featuresData, testimonialsData, announcementsData] = await Promise.all([
        statsRes.json(),
        slidesRes.json(),
        featuresRes.json(),
        testimonialsRes.json(),
        announcementsRes.json()
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (slidesData.success) setHeroSlides(slidesData.slides);
      if (featuresData.success) setFeatures(featuresData.features);
      if (testimonialsData.success) setTestimonials(testimonialsData.testimonials);
      if (announcementsData.success) setAnnouncements(announcementsData.announcements);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id ? `${API_URL}/${type}/${data.id}` : `${API_URL}/${type}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        fetchAllData();
        setEditDialog({ open: false, type: '', data: null, isNew: false });
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleToggleActive = async (type: string, item: any) => {
    await handleSave(type, { ...item, is_active: !item.is_active });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Home Page Management</h1>
          <p className="text-gray-600">Manage all homepage content and statistics</p>
        </div>
        <Button onClick={fetchAllData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { key: 'students', label: 'Students', icon: '👨‍🎓', color: 'bg-blue-500' },
          { key: 'teachers', label: 'Teachers', icon: '👨‍🏫', color: 'bg-green-500' },
          { key: 'courses', label: 'Courses', icon: '📚', color: 'bg-purple-500' },
          { key: 'trades', label: 'Trades', icon: '🔧', color: 'bg-orange-500' },
          { key: 'sports', label: 'Sports', icon: '⚽', color: 'bg-yellow-500' },
          { key: 'achievements', label: 'Achievements', icon: '🏆', color: 'bg-indigo-500' }
        ].map((stat) => (
          <Card key={stat.key}>
            <CardContent className="pt-6 text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <h3 className="text-3xl font-black text-gray-900">{stats[stat.key]}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Management Tabs */}
      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">
            <Image className="w-4 h-4 mr-2" />
            Hero Slides ({heroSlides.length})
          </TabsTrigger>
          <TabsTrigger value="features">
            <Star className="w-4 h-4 mr-2" />
            Features ({features.length})
          </TabsTrigger>
          <TabsTrigger value="testimonials">
            <MessageSquare className="w-4 h-4 mr-2" />
            Testimonials ({testimonials.length})
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <Bell className="w-4 h-4 mr-2" />
            Announcements ({announcements.length})
          </TabsTrigger>
        </TabsList>

        {/* Hero Slides Tab */}
        <TabsContent value="hero" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Hero Slides</h2>
            <Button onClick={() => setEditDialog({ open: true, type: 'hero-slides', data: {}, isNew: true })}>
              <Plus className="w-4 h-4 mr-2" /> Add Slide
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {heroSlides.map((slide: any) => (
              <Card key={slide.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{slide.title_en}</span>
                    <Badge variant={slide.is_active ? 'default' : 'secondary'}>
                      {slide.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{slide.subtitle_en}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditDialog({ open: true, type: 'hero-slides', data: slide, isNew: false })}>
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleActive('hero-slides', slide)}>
                      <Eye className="w-3 h-3 mr-1" /> {slide.is_active ? 'Hide' : 'Show'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete('hero-slides', slide.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Features</h2>
            <Button onClick={() => setEditDialog({ open: true, type: 'features', data: {}, isNew: true })}>
              <Plus className="w-4 h-4 mr-2" /> Add Feature
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature: any) => (
              <Card key={feature.id}>
                <CardHeader>
                  <CardTitle className="text-base">{feature.title_en}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{feature.description_en}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditDialog({ open: true, type: 'features', data: feature, isNew: false })}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleActive('features', feature)}>
                      {feature.is_active ? <Eye className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete('features', feature.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Testimonials</h2>
            <Button onClick={() => setEditDialog({ open: true, type: 'testimonials', data: {}, isNew: true })}>
              <Plus className="w-4 h-4 mr-2" /> Add Testimonial
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((testimonial: any) => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{testimonial.name}</span>
                    <Badge>{testimonial.rating}⭐</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">{testimonial.role}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 italic">"{testimonial.message_en}"</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditDialog({ open: true, type: 'testimonials', data: testimonial, isNew: false })}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete('testimonials', testimonial.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Announcements</h2>
            <Button onClick={() => setEditDialog({ open: true, type: 'announcements', data: {}, isNew: true })}>
              <Plus className="w-4 h-4 mr-2" /> Add Announcement
            </Button>
          </div>
          <div className="space-y-3">
            {announcements.map((announcement: any) => (
              <Card key={announcement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold">{announcement.title_en}</h3>
                        <Badge>{announcement.type}</Badge>
                        <Badge variant={announcement.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{announcement.content_en}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => setEditDialog({ open: true, type: 'announcements', data: announcement, isNew: false })}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete('announcements', announcement.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ContentEditDialog
        open={editDialog.open}
        type={editDialog.type}
        data={editDialog.data}
        isNew={editDialog.isNew}
        onClose={() => setEditDialog({ open: false, type: '', data: null, isNew: false })}
        onSave={handleSave}
      />
    </div>
  );
};

// Content Edit Dialog Component
const ContentEditDialog = ({ open, type, data, isNew, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleSubmit = () => {
    onSave(type, formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isNew ? 'Add New' : 'Edit'} {type?.replace('-', ' ').toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {type === 'hero-slides' && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title (English)</Label>
                  <Input value={formData.title_en || ''} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
                </div>
                <div>
                  <Label>Title (Kinyarwanda)</Label>
                  <Input value={formData.title_rw || ''} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Subtitle (English)</Label>
                  <Textarea value={formData.subtitle_en || ''} onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })} />
                </div>
                <div>
                  <Label>Subtitle (Kinyarwanda)</Label>
                  <Textarea value={formData.subtitle_rw || ''} onChange={(e) => setFormData({ ...formData, subtitle_rw: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>CTA Button Text</Label>
                  <Input value={formData.cta_text || ''} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })} />
                </div>
                <div>
                  <Label>CTA Link</Label>
                  <Input value={formData.cta_link || ''} onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={formData.is_active !== false} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label>Active</Label>
              </div>
            </>
          )}

          {type === 'features' && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title (English)</Label>
                  <Input value={formData.title_en || ''} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
                </div>
                <div>
                  <Label>Title (Kinyarwanda)</Label>
                  <Input value={formData.title_rw || ''} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Description (English)</Label>
                  <Textarea rows={4} value={formData.description_en || ''} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                </div>
                <div>
                  <Label>Description (Kinyarwanda)</Label>
                  <Textarea rows={4} value={formData.description_rw || ''} onChange={(e) => setFormData({ ...formData, description_rw: e.target.value })} />
                </div>
              </div>
            </>
          )}

          {type === 'testimonials' && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <Label>Role/Position</Label>
                  <Input value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Message (English)</Label>
                  <Textarea rows={4} value={formData.message_en || ''} onChange={(e) => setFormData({ ...formData, message_en: e.target.value })} />
                </div>
                <div>
                  <Label>Message (Kinyarwanda)</Label>
                  <Textarea rows={4} value={formData.message_rw || ''} onChange={(e) => setFormData({ ...formData, message_rw: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Rating (1-5)</Label>
                <Input type="number" min="1" max="5" value={formData.rating || 5} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} />
              </div>
            </>
          )}

          {type === 'announcements' && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title (English)</Label>
                  <Input value={formData.title_en || ''} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
                </div>
                <div>
                  <Label>Title (Kinyarwanda)</Label>
                  <Input value={formData.title_rw || ''} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Content (English)</Label>
                  <Textarea rows={4} value={formData.content_en || ''} onChange={(e) => setFormData({ ...formData, content_en: e.target.value })} />
                </div>
                <div>
                  <Label>Content (Kinyarwanda)</Label>
                  <Textarea rows={4} value={formData.content_rw || ''} onChange={(e) => setFormData({ ...formData, content_rw: e.target.value })} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type || 'general'} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority || 'normal'} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Expires At (Optional)</Label>
                <Input type="datetime-local" value={formData.expires_at || ''} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })} />
              </div>
            </>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-yellow-500 to-green-500">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

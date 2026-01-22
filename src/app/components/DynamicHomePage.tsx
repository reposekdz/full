import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, BookOpen, Trophy, Award, TrendingUp, Edit, Plus, Save, X, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Star, Calendar, Bell, Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const API_URL = 'http://localhost:5000/api';

export const DynamicHomePage = ({ onNavigate }: any) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, trades: 0, sports: 0, achievements: 0 });
  const [heroSlides, setHeroSlides] = useState([]);
  const [features, setFeatures] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, type: '', data: null });

  const isAdmin = user && ['admin', 'headmaster'].includes(user.role);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, slidesRes, featuresRes, testimonialsRes, announcementsRes] = await Promise.all([
        fetch(`${API_URL}/home-content/stats`),
        fetch(`${API_URL}/home-content/hero-slides`),
        fetch(`${API_URL}/home-content/features`),
        fetch(`${API_URL}/home-content/testimonials`),
        fetch(`${API_URL}/home-content/announcements`)
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
    }
  };

  const handleSave = async (type: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id 
        ? `${API_URL}/home-content/${type}/${data.id}`
        : `${API_URL}/home-content/${type}`;

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
        setEditDialog({ open: false, type: '', data: null });
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/home-content/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const statsConfig = [
    { key: 'students', icon: Users, label: 'Abanyeshuri', labelEn: 'Students', color: 'from-blue-500 to-cyan-500' },
    { key: 'teachers', icon: BookOpen, label: 'Abarimu', labelEn: 'Teachers', color: 'from-green-500 to-emerald-500' },
    { key: 'courses', icon: Award, label: 'Amasomo', labelEn: 'Courses', color: 'from-purple-500 to-pink-500' },
    { key: 'trades', icon: Trophy, label: 'Amahugurwa', labelEn: 'Trades', color: 'from-orange-500 to-red-500' },
    { key: 'sports', icon: Trophy, label: 'Siporo', labelEn: 'Sports', color: 'from-yellow-500 to-orange-500' },
    { key: 'achievements', icon: Star, label: 'Intsinzi', labelEn: 'Achievements', color: 'from-indigo-500 to-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setEditMode(!editMode)}
            className={`rounded-full shadow-2xl ${editMode ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-yellow-500 to-green-500'}`}
            size="lg"
          >
            {editMode ? <X className="w-5 h-5 mr-2" /> : <Edit className="w-5 h-5 mr-2" />}
            {editMode ? 'Exit Edit Mode' : 'Edit Page'}
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        {heroSlides.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-green-600 flex items-center justify-center"
          >
            <div className="text-center text-white px-4 max-w-4xl">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-6xl font-black mb-4"
              >
                {language === 'rw' ? heroSlides[0].title_rw : heroSlides[0].title_en}
              </motion.h1>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl mb-8"
              >
                {language === 'rw' ? heroSlides[0].subtitle_rw : heroSlides[0].subtitle_en}
              </motion.p>
              {heroSlides[0].cta_text && (
                <Button size="lg" className="bg-white text-yellow-600 hover:bg-yellow-50">
                  {heroSlides[0].cta_text}
                </Button>
              )}
            </div>
            {editMode && isAdmin && (
              <div className="absolute top-4 right-4 space-x-2">
                <Button size="sm" onClick={() => setEditDialog({ open: true, type: 'hero-slides', data: heroSlides[0] })}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-green-600 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl font-black mb-4">Garden TVET School</h1>
              <p className="text-2xl">Excellence in Technical Education</p>
              {editMode && isAdmin && (
                <Button className="mt-4" onClick={() => setEditDialog({ open: true, type: 'hero-slides', data: {} })}>
                  <Plus className="w-4 h-4 mr-2" /> Add Hero Slide
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsConfig.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.key}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="text-center hover:shadow-2xl transition-all hover:scale-105">
                    <CardContent className="pt-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-black text-gray-900 mb-2">{stats[stat.key]}</h3>
                      <p className="text-sm text-gray-600 font-semibold">
                        {language === 'rw' ? stat.label : stat.labelEn}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              {language === 'rw' ? 'Ibyo Dutanga' : 'What We Offer'}
            </h2>
            {editMode && isAdmin && (
              <Button onClick={() => setEditDialog({ open: true, type: 'features', data: {} })}>
                <Plus className="w-4 h-4 mr-2" /> Add Feature
              </Button>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-yellow-500" />
                      {language === 'rw' ? feature.title_rw : feature.title_en}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {language === 'rw' ? feature.description_rw : feature.description_en}
                    </p>
                  </CardContent>
                  {editMode && isAdmin && (
                    <div className="absolute top-2 right-2 space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditDialog({ open: true, type: 'features', data: feature })}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete('features', feature.id)}>
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-r from-yellow-50 to-green-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                {language === 'rw' ? 'Amakuru' : 'Announcements'}
              </h2>
              {editMode && isAdmin && (
                <Button onClick={() => setEditDialog({ open: true, type: 'announcements', data: {} })}>
                  <Plus className="w-4 h-4 mr-2" /> Add Announcement
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Bell className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {language === 'rw' ? announcement.title_rw : announcement.title_en}
                        </h3>
                        <p className="text-gray-600">
                          {language === 'rw' ? announcement.content_rw : announcement.content_en}
                        </p>
                        <Badge className="mt-2">{announcement.type}</Badge>
                      </div>
                    </div>
                    {editMode && isAdmin && (
                      <div className="absolute top-2 right-2 space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditDialog({ open: true, type: 'announcements', data: announcement })}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete('announcements', announcement.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                {language === 'rw' ? 'Ibyo Abantu Bavuga' : 'What People Say'}
              </h2>
              {editMode && isAdmin && (
                <Button onClick={() => setEditDialog({ open: true, type: 'testimonials', data: {} })}>
                  <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                </Button>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full relative">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4 italic">
                        "{language === 'rw' ? testimonial.message_rw : testimonial.message_en}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-green-400 flex items-center justify-center text-white font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                      </div>
                      {editMode && isAdmin && (
                        <div className="absolute top-2 right-2 space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditDialog({ open: true, type: 'testimonials', data: testimonial })}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('testimonials', testimonial.id)}>
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Edit Dialog */}
      <EditDialog
        open={editDialog.open}
        type={editDialog.type}
        data={editDialog.data}
        onClose={() => setEditDialog({ open: false, type: '', data: null })}
        onSave={handleSave}
      />
    </div>
  );
};

// Edit Dialog Component
const EditDialog = ({ open, type, data, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleSubmit = () => {
    onSave(type, formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {data?.id ? 'Edit' : 'Add'} {type}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {type === 'hero-slides' && (
            <>
              <Input placeholder="Title (English)" value={formData.title_en || ''} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
              <Input placeholder="Title (Kinyarwanda)" value={formData.title_rw || ''} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
              <Textarea placeholder="Subtitle (English)" value={formData.subtitle_en || ''} onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })} />
              <Textarea placeholder="Subtitle (Kinyarwanda)" value={formData.subtitle_rw || ''} onChange={(e) => setFormData({ ...formData, subtitle_rw: e.target.value })} />
              <Input placeholder="Image URL" value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
              <Input placeholder="CTA Text" value={formData.cta_text || ''} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })} />
              <Input placeholder="CTA Link" value={formData.cta_link || ''} onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })} />
            </>
          )}
          {type === 'features' && (
            <>
              <Input placeholder="Title (English)" value={formData.title_en || ''} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
              <Input placeholder="Title (Kinyarwanda)" value={formData.title_rw || ''} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
              <Textarea placeholder="Description (English)" value={formData.description_en || ''} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
              <Textarea placeholder="Description (Kinyarwanda)" value={formData.description_rw || ''} onChange={(e) => setFormData({ ...formData, description_rw: e.target.value })} />
            </>
          )}
          {type === 'testimonials' && (
            <>
              <Input placeholder="Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="Role" value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
              <Textarea placeholder="Message (English)" value={formData.message_en || ''} onChange={(e) => setFormData({ ...formData, message_en: e.target.value })} />
              <Textarea placeholder="Message (Kinyarwanda)" value={formData.message_rw || ''} onChange={(e) => setFormData({ ...formData, message_rw: e.target.value })} />
              <Input type="number" placeholder="Rating (1-5)" value={formData.rating || 5} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} />
            </>
          )}
          {type === 'announcements' && (
            <>
              <Input placeholder="Title (English)" value={formData.title_en || ''} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
              <Input placeholder="Title (Kinyarwanda)" value={formData.title_rw || ''} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
              <Textarea placeholder="Content (English)" value={formData.content_en || ''} onChange={(e) => setFormData({ ...formData, content_en: e.target.value })} />
              <Textarea placeholder="Content (Kinyarwanda)" value={formData.content_rw || ''} onChange={(e) => setFormData({ ...formData, content_rw: e.target.value })} />
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
            </>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

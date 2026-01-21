import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Users,
  ImageIcon,
  FileText,
  BarChart3,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Upload,
  Save,
  X,
  Eye,
  Globe,
  Shield,
  Database,
  Server,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Star,
  Target,
  Award,
  Calendar
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { useContent } from '@/app/contexts/ContentContext';

const API_BASE = 'http://localhost:5000/api';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
  sort_order: number;
}

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  image_url: string;
  author: string;
  category: string;
  publish_date: string;
  is_active: boolean;
  sort_order: number;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  year: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

interface SchoolStat {
  id: number;
  stat_key: string;
  value: string;
  label: string;
  icon: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  last_login: string;
  is_active: boolean;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [schoolStats, setSchoolStats] = useState<SchoolStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');

  const { refreshSlides } = useContent();

  // Fetch data functions
  const fetchSlides = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/admin/slides`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSlides(data.slides);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/admin/news`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNewsArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/admin/testimonials`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/admin/achievements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchSchoolStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSchoolStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching school stats:', error);
    }
  };

  useEffect(() => {
    fetchSlides();
    fetchNews();
    fetchTestimonials();
    fetchAchievements();
    fetchSchoolStats();
  }, []);

  // Modal handlers
  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setPreviewImage(item?.image_url || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({});
    setPreviewImage('');
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // CRUD Operations
  const handleSave = async () => {
    setLoading(true);
    try {
      const formDataObj = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          formDataObj.append(key, formData[key]);
        }
      });

      // Add image file if selected
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }

      const isEdit = selectedItem && selectedItem.id;
      const endpoint = getEndpoint(modalType, isEdit, selectedItem?.id);
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataObj
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh data
        switch (modalType) {
          case 'slide':
            fetchSlides();
            refreshSlides();
            break;
          case 'news':
            fetchNews();
            break;
          case 'testimonial':
            fetchTestimonials();
            break;
          case 'achievement':
            fetchAchievements();
            break;
          case 'stat':
            fetchSchoolStats();
            break;
        }
        closeModal();
      } else {
        alert(result.message || 'Error saving data');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      const endpoint = getEndpoint(type, true, id);
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh data
        switch (type) {
          case 'slide':
            fetchSlides();
            refreshSlides();
            break;
          case 'news':
            fetchNews();
            break;
          case 'testimonial':
            fetchTestimonials();
            break;
          case 'achievement':
            fetchAchievements();
            break;
        }
      } else {
        alert(result.message || 'Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting item');
    } finally {
      setLoading(false);
    }
  };

  const getEndpoint = (type: string, isEdit: boolean, id?: number) => {
    const baseEndpoints = {
      slide: `${API_BASE}/content/admin/slides`,
      news: `${API_BASE}/content/admin/news`,
      testimonial: `${API_BASE}/content/admin/testimonials`,
      achievement: `${API_BASE}/content/admin/achievements`,
      stat: `${API_BASE}/content/admin/stats`
    };

    const endpoint = baseEndpoints[type as keyof typeof baseEndpoints];
    return isEdit ? `${endpoint}/${id}` : endpoint;
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'slides', label: 'Homepage Slides', icon: ImageIcon },
    { id: 'news', label: 'News Articles', icon: FileText },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'stats', label: 'School Statistics', icon: Target },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderModal = () => {
    if (!isModalOpen) return null;

    const modalTitles = {
      slide: selectedItem ? 'Edit Slide' : 'Add New Slide',
      news: selectedItem ? 'Edit Article' : 'Add New Article',
      testimonial: selectedItem ? 'Edit Testimonial' : 'Add New Testimonial',
      achievement: selectedItem ? 'Edit Achievement' : 'Add New Achievement',
      stat: 'Edit School Statistic'
    };

    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitles[modalType as keyof typeof modalTitles]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {modalType === 'slide' && (
              <>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter slide title"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    placeholder="Enter subtitle"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text || ''}
                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                    placeholder="Enter button text"
                  />
                </div>
                <div>
                  <Label htmlFor="button_link">Button Link</Label>
                  <Input
                    id="button_link"
                    value={formData.button_link || ''}
                    onChange={(e) => setFormData({...formData, button_link: e.target.value})}
                    placeholder="Enter button link"
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {previewImage && (
                    <div className="mt-2">
                      <img src={previewImage} alt="Preview" className="w-full h-32 object-cover rounded" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active !== false}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </>
            )}

            {modalType === 'news' && (
              <>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter article title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter description"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Enter full content"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author || ''}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category || ''}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ibihembo">Ibihembo</SelectItem>
                        <SelectItem value="Siporo">Siporo</SelectItem>
                        <SelectItem value="Amakuru">Amakuru</SelectItem>
                        <SelectItem value="Ubufatanye">Ubufatanye</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="publish_date">Publish Date</Label>
                  <Input
                    id="publish_date"
                    type="date"
                    value={formData.publish_date || ''}
                    onChange={(e) => setFormData({...formData, publish_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {previewImage && (
                    <div className="mt-2">
                      <img src={previewImage} alt="Preview" className="w-full h-32 object-cover rounded" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active !== false}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </>
            )}

            {modalType === 'testimonial' && (
              <>
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Person's name"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    placeholder="Their role or title"
                  />
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar (2 letters)</Label>
                  <Input
                    id="avatar"
                    value={formData.avatar || ''}
                    onChange={(e) => setFormData({...formData, avatar: e.target.value.slice(0, 2).toUpperCase()})}
                    placeholder="JM"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="quote">Quote *</Label>
                  <Textarea
                    id="quote"
                    value={formData.quote || ''}
                    onChange={(e) => setFormData({...formData, quote: e.target.value})}
                    placeholder="Enter testimonial quote"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Select
                    value={formData.rating?.toString() || '5'}
                    onValueChange={(value) => setFormData({...formData, rating: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active !== false}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </>
            )}

            {modalType === 'achievement' && (
              <>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Achievement title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Achievement description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="2024"
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {previewImage && (
                    <div className="mt-2">
                      <img src={previewImage} alt="Preview" className="w-full h-32 object-cover rounded" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active !== false}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </>
            )}

            {modalType === 'stat' && (
              <>
                <div>
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="1,248"
                  />
                </div>
                <div>
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    value={formData.label || ''}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    placeholder="Abanyeshuri"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="Users"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color Class</Label>
                  <Input
                    id="color"
                    value={formData.color || ''}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="from-blue-500 to-indigo-500"
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ImageIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Homepage Slides</p>
                      <p className="text-2xl font-bold">{slides.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">News Articles</p>
                      <p className="text-2xl font-bold">{newsArticles.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Testimonials</p>
                      <p className="text-2xl font-bold">{testimonials.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Achievements</p>
                      <p className="text-2xl font-bold">{achievements.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                      <span className="text-sm">Content management system initialized</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                      <span className="text-sm">Database tables created successfully</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                      <span className="text-sm">File upload system configured</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Connection</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">File Upload System</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Content API</span>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'slides':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Homepage Slides</h2>
              <Button onClick={() => openModal('slide')}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Slide
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {slides.map((slide) => (
                <Card key={slide.id} className={slide.is_active ? '' : 'opacity-50'}>
                  <CardContent className="p-4">
                    <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                      <img
                        src={slide.image_url.startsWith('/uploads') ? `http://localhost:5000${slide.image_url}` : slide.image_url}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      {!slide.is_active && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <EyeOff className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{slide.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{slide.subtitle}</p>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{slide.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={slide.is_active ? 'default' : 'secondary'}>
                        {slide.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openModal('slide', slide)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete('slide', slide.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'news':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">News Articles</h2>
              <Button onClick={() => openModal('news')}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Article
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {newsArticles.map((article) => (
                <Card key={article.id} className={article.is_active ? '' : 'opacity-50'}>
                  <CardContent className="p-4">
                    {article.image_url && (
                      <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                        <img
                          src={article.image_url.startsWith('/uploads') ? `http://localhost:5000${article.image_url}` : article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{article.category}</Badge>
                      <span className="text-xs text-gray-500">{article.publish_date}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">By {article.author}</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openModal('news', article)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete('news', article.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Testimonials</h2>
              <Button onClick={() => openModal('testimonial')}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Testimonial
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className={testimonial.is_active ? '' : 'opacity-50'}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{testimonial.name}</h3>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <div className="flex gap-1 mt-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={testimonial.is_active ? 'default' : 'secondary'}>
                        {testimonial.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openModal('testimonial', testimonial)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete('testimonial', testimonial.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Achievements</h2>
              <Button onClick={() => openModal('achievement')}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Achievement
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={achievement.is_active ? '' : 'opacity-50'}>
                  <CardContent className="p-4">
                    {achievement.image_url && (
                      <div className="aspect-square relative mb-4 rounded-lg overflow-hidden">
                        <img
                          src={achievement.image_url.startsWith('/uploads') ? `http://localhost:5000${achievement.image_url}` : achievement.image_url}
                          alt={achievement.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{achievement.year}</Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={achievement.is_active ? 'default' : 'secondary'}>
                        {achievement.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openModal('achievement', achievement)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete('achievement', achievement.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">School Statistics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {schoolStats.map((stat) => (
                <Card key={stat.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                        <span className="text-2xl font-bold">{stat.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold">{stat.value}</h3>
                        <p className="text-gray-600">{stat.label}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openModal('stat', stat)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Content Management System</h2>
            <p className="text-gray-600">Select a section from the sidebar to manage content.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">Content Admin</h1>
          </div>
          <nav className="mt-6">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 ${
                  activeTab === item.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700' : 'text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default AdminPage;
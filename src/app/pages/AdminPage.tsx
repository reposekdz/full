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
  AlertCircle
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

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor';
  created_at: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSlideDialog, setShowSlideDialog] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState<LoginCredentials>({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adminSlides, setAdminSlides] = useState<Slide[]>([]);
  const [stats, setStats] = useState({ slides: 0, users: 0, trades: 0, content: 0 });
  
  const { refreshSlides } = useContent();

  // Check for existing auth token
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data.stats);
      }

      // Fetch slides for admin management
      fetchAdminSlides();
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const fetchAdminSlides = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/slides`);
      const data = await response.json();
      if (data.success) {
        setAdminSlides(data.slides);
      }
    } catch (err) {
      console.error('Failed to fetch slides:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setAuthToken(data.token);
        setIsAuthenticated(true);
        setSuccess('Login successful!');
        fetchDashboardData();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    setAdminSlides([]);
    setStats({ slides: 0, users: 0, trades: 0, content: 0 });
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const slideData = {
        title: formData.get('title') as string,
        subtitle: formData.get('subtitle') as string,
        description: formData.get('description') as string,
        image_url: formData.get('image_url') as string,
        button_text: formData.get('button_text') as string,
        button_link: formData.get('button_link') as string,
        sort_order: parseInt(formData.get('sort_order') as string) || 0,
        is_active: formData.get('is_active') === 'true'
      };

      const url = editingSlide 
        ? `${API_BASE}/content/slides/${editingSlide.id}`
        : `${API_BASE}/content/slides`;
      
      const method = editingSlide ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(slideData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingSlide ? 'Slide updated successfully!' : 'Slide created successfully!');
        setShowSlideDialog(false);
        setEditingSlide(null);
        fetchAdminSlides();
        refreshSlides(); // Update the frontend slides
        fetchDashboardData();
      } else {
        setError(data.message || 'Failed to save slide');
      }
    } catch (err) {
      setError('Failed to save slide');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlide = async (slideId: number) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/content/slides/${slideId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Slide deleted successfully!');
        fetchAdminSlides();
        refreshSlides();
        fetchDashboardData();
      } else {
        setError(data.message || 'Failed to delete slide');
      }
    } catch (err) {
      setError('Failed to delete slide');
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-md text-white">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
                <CardDescription className="text-gray-300">
                  Access the school management system
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
                  <span className="text-red-200">{error}</span>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  <span className="text-green-200">{success}</span>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                <p className="text-sm text-gray-300 text-center">
                  Default: admin / admin123
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification Messages */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
              error ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              <span>{error || success}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Database className="w-8 h-8 mr-3 text-blue-600" />
            Admin Panel
          </h1>
        </div>
        
        <nav className="mt-8">
          <div className="space-y-1 px-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'slides', label: 'Home Slides', icon: ImageIcon },
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'users', label: 'Admin Users', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                  <p className="text-gray-600">Welcome to your school management system</p>
                </div>
                <Button onClick={fetchDashboardData} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Slides', value: stats.slides, icon: ImageIcon, color: 'bg-blue-500' },
                  { label: 'Admin Users', value: stats.users, icon: Users, color: 'bg-green-500' },
                  { label: 'Trade Programs', value: stats.trades, icon: FileText, color: 'bg-purple-500' },
                  { label: 'Content Items', value: stats.content, icon: Database, color: 'bg-emerald-500' }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                          </div>
                          <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Current system status and configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Frontend Status</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Backend API</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Database</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Admin Access</span>
                      <Badge className="bg-green-100 text-green-800">Authenticated</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Slides Management */}
          {activeTab === 'slides' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Home Page Slides</h1>
                  <p className="text-gray-600">Manage the carousel slides on the home page</p>
                </div>
                <div className="flex space-x-4">
                  <Button onClick={fetchAdminSlides} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => setShowSlideDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Slide
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {adminSlides.map((slide) => (
                  <Card key={slide.id}>
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-lg font-bold">{slide.title}</h3>
                        <p className="text-sm text-gray-200">{slide.subtitle}</p>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{slide.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant={slide.is_active ? "default" : "secondary"}>
                          {slide.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm text-gray-500">Order: {slide.sort_order}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Button: {slide.button_text} → {slide.button_link}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingSlide(slide);
                              setShowSlideDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSlide(slide.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {adminSlides.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center text-gray-500">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No slides found</p>
                    <p className="text-sm">Create your first slide to get started</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Content Management */}
          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Content Management</h1>
                <p className="text-gray-600">Manage dynamic content across the website</p>
              </div>
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced content management features coming soon.</p>
                  <p className="text-sm">Currently managing slides through the Slides tab.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </div>
      </div>

      {/* Slide Dialog */}
      <Dialog open={showSlideDialog} onOpenChange={setShowSlideDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSlideSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingSlide?.title}
                  placeholder="Slide title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  defaultValue={editingSlide?.subtitle}
                  placeholder="Slide subtitle"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingSlide?.description}
                placeholder="Slide description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL *</Label>
              <Input
                id="image_url"
                name="image_url"
                defaultValue={editingSlide?.image_url}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button_text">Button Text</Label>
                <Input
                  id="button_text"
                  name="button_text"
                  defaultValue={editingSlide?.button_text}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_link">Button Link</Label>
                <Input
                  id="button_link"
                  name="button_link"
                  defaultValue={editingSlide?.button_link}
                  placeholder="/about"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={editingSlide?.sort_order || 0}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2 pt-8">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    value="true"
                    defaultChecked={editingSlide?.is_active !== false}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowSlideDialog(false);
                  setEditingSlide(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {loading ? 'Saving...' : 'Save Slide'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminPage;
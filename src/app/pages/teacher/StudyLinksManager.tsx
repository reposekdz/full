import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, Edit, Trash2, ExternalLink, Star, 
  BookOpen, Video, FileText, Globe, Tag, TrendingUp, 
  BarChart3, Users, Clock, Eye, Link as LinkIcon,
  Save, X, Upload, Download, Share2, Copy, Check
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Switch } from '@/app/components/ui/switch';
import { apiService } from '@/app/services/apiService';

interface StudyLink {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
  is_featured: boolean;
  tags: string;
  click_count: number;
  created_at: string;
  updated_at: string;
  teacher_name: string;
  class_name: string;
  subject_name: string;
}

interface StudyLinksManagerProps {
  teacherId: number;
  classId?: number;
  subjectId?: number;
}

const StudyLinksManager: React.FC<StudyLinksManagerProps> = ({ teacherId, classId, subjectId }) => {
  const [links, setLinks] = useState<StudyLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<StudyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<StudyLink | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'general',
    is_featured: false,
    tags: ''
  });

  const [bulkLinks, setBulkLinks] = useState([
    { title: '', url: '', description: '', category: 'general' }
  ]);

  const categories = [
    { value: 'general', label: 'General', icon: BookOpen, color: 'bg-gray-500' },
    { value: 'tutorial', label: 'Tutorial', icon: Video, color: 'bg-blue-500' },
    { value: 'document', label: 'Document', icon: FileText, color: 'bg-green-500' },
    { value: 'video', label: 'Video', icon: Video, color: 'bg-red-500' },
    { value: 'website', label: 'Website', icon: Globe, color: 'bg-purple-500' }
  ];

  useEffect(() => {
    loadStudyLinks();
    loadAnalytics();
  }, [teacherId, classId, subjectId]);

  useEffect(() => {
    filterLinks();
  }, [links, searchTerm, categoryFilter]);

  const loadStudyLinks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('teacher_id', teacherId.toString());
      if (classId) params.append('class_id', classId.toString());
      if (subjectId) params.append('subject_id', subjectId.toString());

      const response = await fetch(`http://localhost:5000/api/teacher-advanced/study-links?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLinks(data.links || []);
      }
    } catch (error) {
      console.error('Error loading study links:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher-advanced/study-links-analytics?teacher_id=${teacherId}`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.stats);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const filterLinks = () => {
    let filtered = [...links];
    
    if (searchTerm) {
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(link => link.category === categoryFilter);
    }
    
    setFilteredLinks(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        teacher_id: teacherId,
        class_id: classId || 1,
        subject_id: subjectId || 1
      };

      const response = await fetch('http://localhost:5000/api/teacher-advanced/add-study-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setIsAddModalOpen(false);
        resetForm();
        loadStudyLinks();
        loadAnalytics();
      }
    } catch (error) {
      console.error('Error adding study link:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLink) return;

    try {
      const response = await fetch(`http://localhost:5000/api/teacher-advanced/study-link/${selectedLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setSelectedLink(null);
        resetForm();
        loadStudyLinks();
      }
    } catch (error) {
      console.error('Error updating study link:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this study link?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/teacher-advanced/study-link/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        loadStudyLinks();
        loadAnalytics();
      }
    } catch (error) {
      console.error('Error deleting study link:', error);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        teacher_id: teacherId,
        class_id: classId || 1,
        subject_id: subjectId || 1,
        links: bulkLinks.filter(link => link.title && link.url)
      };

      const response = await fetch('http://localhost:5000/api/teacher-advanced/bulk-study-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setIsBulkModalOpen(false);
        setBulkLinks([{ title: '', url: '', description: '', category: 'general' }]);
        loadStudyLinks();
        loadAnalytics();
      }
    } catch (error) {
      console.error('Error bulk adding study links:', error);
    }
  };

  const copyToClipboard = async (url: string, id: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      category: 'general',
      is_featured: false,
      tags: ''
    });
  };

  const openEditModal = (link: StudyLink) => {
    setSelectedLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description,
      category: link.category,
      is_featured: link.is_featured,
      tags: link.tags
    });
    setIsEditModalOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : BookOpen;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'bg-gray-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Links Manager</h1>
        <p className="text-gray-600">Manage educational resources and study materials for your students</p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Links</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_links || 0}</p>
                </div>
                <LinkIcon className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.featured_links || 0}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.avg_clicks || 0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.video_links || 0}</p>
                </div>
                <Video className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search study links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
        <Button onClick={() => setIsBulkModalOpen(true)} variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Add
        </Button>
      </div>

      {/* Study Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredLinks.map((link, index) => {
            const CategoryIcon = getCategoryIcon(link.category);
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getCategoryColor(link.category)}`}>
                          <CategoryIcon className="w-4 h-4 text-white" />
                        </div>
                        {link.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(link.url, link.id)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedId === link.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(link)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(link.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">{link.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{link.description}</p>
                    
                    {link.tags && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {link.tags.split(',').slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {link.click_count} clicks
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(link.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => window.open(link.url, '_blank')}
                      className="w-full"
                      variant="outline"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Link Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Study Link</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Link Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <Input
              placeholder="URL"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              required
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                />
                <label className="text-sm">Featured</label>
              </div>
            </div>
            <Input
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
            />
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Add Link
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Link Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Study Link</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              placeholder="Link Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <Input
              placeholder="URL"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              required
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                />
                <label className="text-sm">Featured</label>
              </div>
            </div>
            <Input
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
            />
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Update Link
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Modal */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Add Study Links</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            {bulkLinks.map((link, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Link {index + 1}</h4>
                  {bulkLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBulkLinks(bulkLinks.filter((_, i) => i !== index))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Title"
                    value={link.title}
                    onChange={(e) => {
                      const newLinks = [...bulkLinks];
                      newLinks[index].title = e.target.value;
                      setBulkLinks(newLinks);
                    }}
                  />
                  <Input
                    placeholder="URL"
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...bulkLinks];
                      newLinks[index].url = e.target.value;
                      setBulkLinks(newLinks);
                    }}
                  />
                </div>
                <Textarea
                  placeholder="Description"
                  value={link.description}
                  onChange={(e) => {
                    const newLinks = [...bulkLinks];
                    newLinks[index].description = e.target.value;
                    setBulkLinks(newLinks);
                  }}
                  rows={2}
                />
                <Select
                  value={link.category}
                  onValueChange={(value) => {
                    const newLinks = [...bulkLinks];
                    newLinks[index].category = value;
                    setBulkLinks(newLinks);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkLinks([...bulkLinks, { title: '', url: '', description: '', category: 'general' }])}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Link
            </Button>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Add All Links
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyLinksManager;
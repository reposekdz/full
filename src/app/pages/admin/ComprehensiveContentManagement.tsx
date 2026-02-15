import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Layers, Image, FileText, Users, Trophy, Briefcase, Code, Newspaper, 
  GraduationCap, BookOpen, Calendar, MapPin, Award, Target, Sparkles,
  Upload, Edit, Trash2, Eye, Search, Filter, Plus, Save, X, Check,
  ChevronRight, Settings, Grid, List, BarChart, TrendingUp, Zap, RefreshCw, AlertCircle, Download
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { toast } from 'sonner';
import axios from 'axios';
import { API_BASE_URL } from '@/app/config/apiBase';

const API_BASE = API_BASE_URL;
const IMAGE_ORIGIN = API_BASE.replace(/\/api\/?$/, '') || 'http://localhost:5000';

function authHeaders(): Record<string, string> {
  const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function toArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && 'data' in raw) return Array.isArray((raw as any).data) ? (raw as any).data : [];
  if (raw && typeof raw === 'object' && 'items' in raw) return Array.isArray((raw as any).items) ? (raw as any).items : [];
  return [];
}

interface ContentItem {
  id: number;
  type: string;
  title: string;
  description: string;
  image?: string;
  status: string;
  featured: boolean;
  order: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

const ComprehensiveContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Content states
  const [heroSlides, setHeroSlides] = useState<ContentItem[]>([]);
  const [newsArticles, setNewsArticles] = useState<ContentItem[]>([]);
  const [sports, setSports] = useState<ContentItem[]>([]);
  const [teams, setTeams] = useState<ContentItem[]>([]);
  const [players, setPlayers] = useState<ContentItem[]>([]);
  const [coaches, setCoaches] = useState<ContentItem[]>([]);
  const [achievements, setAchievements] = useState<ContentItem[]>([]);
  const [leadership, setLeadership] = useState<ContentItem[]>([]);
  const [trades, setTrades] = useState<ContentItem[]>([]);
  const [developers, setDevelopers] = useState<ContentItem[]>([]);
  const [courses, setCourses] = useState<ContentItem[]>([]);
  const [gallery, setGallery] = useState<ContentItem[]>([]);
  const [events, setEvents] = useState<ContentItem[]>([]);
  const [testimonials, setTestimonials] = useState<ContentItem[]>([]);

  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    image: null as File | null,
    status: 'active',
    featured: false,
    metadata: {}
  });

  const contentTypes = [
    { id: 'hero', name: 'Hero Slides', icon: Sparkles, color: 'from-purple-500 to-pink-500', count: heroSlides.length },
    { id: 'news', name: 'News Articles', icon: Newspaper, color: 'from-blue-500 to-cyan-500', count: newsArticles.length },
    { id: 'sports', name: 'Sports', icon: Trophy, color: 'from-green-500 to-emerald-500', count: sports.length },
    { id: 'teams', name: 'Teams', icon: Users, color: 'from-orange-500 to-red-500', count: teams.length },
    { id: 'players', name: 'Players', icon: Target, color: 'from-yellow-500 to-orange-500', count: players.length },
    { id: 'coaches', name: 'Coaches', icon: Award, color: 'from-indigo-500 to-purple-500', count: coaches.length },
    { id: 'achievements', name: 'Achievements', icon: Trophy, color: 'from-pink-500 to-rose-500', count: achievements.length },
    { id: 'leadership', name: 'Leadership', icon: Briefcase, color: 'from-teal-500 to-cyan-500', count: leadership.length },
    { id: 'trades', name: 'Trades', icon: Briefcase, color: 'from-amber-500 to-yellow-500', count: trades.length },
    { id: 'developers', name: 'Developers', icon: Code, color: 'from-slate-500 to-gray-500', count: developers.length },
    { id: 'courses', name: 'Courses', icon: BookOpen, color: 'from-violet-500 to-purple-500', count: courses.length },
    { id: 'gallery', name: 'Gallery', icon: Image, color: 'from-fuchsia-500 to-pink-500', count: gallery.length },
    { id: 'events', name: 'Events', icon: Calendar, color: 'from-lime-500 to-green-500', count: events.length },
    { id: 'testimonials', name: 'Testimonials', icon: FileText, color: 'from-sky-500 to-blue-500', count: testimonials.length },
  ];

  useEffect(() => {
    fetchAllContent();
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const fetchAllContent = async () => {
    setLoading(true);
    setFetchError(null);
    const headers = authHeaders();
    try {
      const [heroRes, newsRes, sportsRes, teamsRes, playersRes, coachesRes, achievementsRes, 
             leadershipRes, tradesRes, devsRes, coursesRes, galleryRes, eventsRes, testimonialsRes] = await Promise.all([
        axios.get(`${API_BASE}/sports-hero/hero-slides`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/news`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/content-management/sports`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/sports-hero/teams`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/sports-hero/players`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/sports-hero/coaches`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/sports-hero/achievements`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/content-management/leadership`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/content-management/trades`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/content-management/developers`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/unified-content/courses`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/unified-content/gallery`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/unified-content/events`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/unified-content/testimonials`, { headers }).catch(() => ({ data: [] })),
      ]);

      setHeroSlides(toArray<ContentItem>(heroRes?.data));
      setNewsArticles(toArray<ContentItem>(newsRes?.data));
      setSports(toArray<ContentItem>(sportsRes?.data));
      setTeams(toArray<ContentItem>(teamsRes?.data));
      setPlayers(toArray<ContentItem>(playersRes?.data));
      setCoaches(toArray<ContentItem>(coachesRes?.data));
      setAchievements(toArray<ContentItem>(achievementsRes?.data));
      setLeadership(toArray<ContentItem>(leadershipRes?.data));
      setTrades(toArray<ContentItem>(tradesRes?.data));
      setDevelopers(toArray<ContentItem>(devsRes?.data));
      setCourses(toArray<ContentItem>(coursesRes?.data));
      setGallery(toArray<ContentItem>(galleryRes?.data));
      setEvents(toArray<ContentItem>(eventsRes?.data));
      setTestimonials(toArray<ContentItem>(testimonialsRes?.data));
    } catch (error) {
      console.error('Error fetching content:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to load content');
      toast.error('Failed to load content. Use Refresh to retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (type: string) => {
    if (!formData.title?.trim()) {
      toast.error('Umutwe / Title is required');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('status', formData.status);
    formDataToSend.append('featured', String(formData.featured));
    if (formData.metadata && Object.keys(formData.metadata).length) {
      formDataToSend.append('metadata', JSON.stringify(formData.metadata));
    }
    if (formData.image) formDataToSend.append('image', formData.image);

    setUploading(true);
    try {
      const endpoint = getEndpoint(type);
      await axios.post(endpoint, formDataToSend, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Ibikubiyemo byongewe / Content added');
      fetchAllContent();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add content');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (type: string, id: number) => {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('status', formData.status);
    formDataToSend.append('featured', String(formData.featured));
    if (formData.metadata && Object.keys(formData.metadata).length) {
      formDataToSend.append('metadata', JSON.stringify(formData.metadata));
    }
    if (formData.image) formDataToSend.append('image', formData.image);

    setUploading(true);
    try {
      const endpoint = `${getEndpoint(type)}/${id}`;
      await axios.put(endpoint, formDataToSend, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Impinduka zibikinze / Changes saved');
      fetchAllContent();
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!window.confirm('Urashaka gusiba ibi bikubiyemo? / Are you sure you want to delete this content?')) return;
    try {
      const endpoint = `${getEndpoint(type)}/${id}`;
      await axios.delete(endpoint, { headers: authHeaders() });
      toast.success('Ibikubiyemo bisibwe / Content deleted');
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      fetchAllContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    }
  };

  const handleBulkDelete = async (type: string) => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Gusiba ${selectedIds.size} ibikubiyemo? / Delete ${selectedIds.size} items?`)) return;
    const base = getEndpoint(type);
    let ok = 0, fail = 0;
    for (const id of selectedIds) {
      try {
        await axios.delete(`${base}/${id}`, { headers: authHeaders() });
        ok++;
      } catch { fail++; }
    }
    setSelectedIds(new Set());
    fetchAllContent();
    if (ok) toast.success(`${ok} bisibwe / ${ok} deleted`);
    if (fail) toast.error(`${fail} byanze nabi / ${fail} failed`);
  };

  const handleExportCurrent = (type: string) => {
    const data = getData(type);
    if (!Array.isArray(data) || data.length === 0) {
      toast.info('Nta bikubiyemo / No content to export');
      return;
    }
    const headers = ['id', 'title', 'description', 'status', 'featured', 'created_at'];
    const csv = [headers.join(',')].concat(
      data.map((r: any) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export yabitswe / Export done');
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = (type: string) => {
    const data = getData(type);
    if (!Array.isArray(data)) return;
    const ids = data.map((r: any) => r.id).filter(Boolean);
    if (selectedIds.size >= ids.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(ids));
  };

  const getEndpoint = (type: string) => {
    const endpoints: Record<string, string> = {
      hero: `${API_BASE}/sports-hero/hero-slides`,
      news: `${API_BASE}/news`,
      sports: `${API_BASE}/content-management/sports`,
      teams: `${API_BASE}/sports-hero/teams`,
      players: `${API_BASE}/sports-hero/players`,
      coaches: `${API_BASE}/sports-hero/coaches`,
      achievements: `${API_BASE}/sports-hero/achievements`,
      leadership: `${API_BASE}/content-management/leadership`,
      trades: `${API_BASE}/content-management/trades`,
      developers: `${API_BASE}/content-management/developers`,
      courses: `${API_BASE}/unified-content/courses`,
      gallery: `${API_BASE}/unified-content/gallery`,
      events: `${API_BASE}/unified-content/events`,
      testimonials: `${API_BASE}/unified-content/testimonials`,
    };
    return endpoints[type] || '';
  };

  const imageUrl = (item: ContentItem | any) => {
    const src = item?.image || item?.image_url || item?.url;
    if (!src) return '';
    if (src.startsWith('http')) return src;
    return src.startsWith('/') ? `${IMAGE_ORIGIN}${src}` : `${IMAGE_ORIGIN}/${src}`;
  };

  const getData = (type: string) => {
    const dataMap: Record<string, ContentItem[]> = {
      hero: heroSlides, news: newsArticles, sports, teams, players, coaches,
      achievements, leadership, trades, developers, courses, gallery, events, testimonials
    };
    return dataMap[type] || [];
  };

  const resetForm = () => {
    setFormData({
      type: '', title: '', description: '', image: null,
      status: 'active', featured: false, metadata: {}
    });
  };

  const openCreateDialog = (type: string) => {
    resetForm();
    setFormData(prev => ({ ...prev, type }));
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ContentItem, contentType?: string) => {
    setEditingItem(item);
    setFormData({
      type: contentType || (item as any).type || activeTab,
      title: item.title,
      description: item.description ?? '',
      image: null,
      status: (item as any).status ?? 'active',
      featured: (item as any).featured ?? false,
      metadata: (item as any).metadata || {}
    });
    setIsDialogOpen(true);
  };

  const filteredData = (data: ContentItem[] | any) => {
    if (!Array.isArray(data)) return [];
    return data.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const renderContentCard = (item: ContentItem, type: string) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group"
    >
      <Card className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-yellow-400 ${selectedIds.has(item.id) ? 'ring-2 ring-yellow-500' : ''}`}>
        <div className="absolute top-2 left-2 z-10 bg-white/90 rounded p-1">
          <input
            type="checkbox"
            checked={selectedIds.has(item.id)}
            onChange={() => toggleSelect(item.id)}
            className="rounded border-yellow-500 text-yellow-600 focus:ring-yellow-500"
          />
        </div>
        {(item.image || (item as any).image_url || (item as any).url) && (
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <img 
              src={imageUrl(item)} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {item.featured && (
              <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary" onClick={() => openEditDialog(item, type)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(type, item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
            <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
              {item.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{(item as any).created_at ? new Date((item as any).created_at).toLocaleDateString() : '—'}</span>
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost" onClick={() => openEditDialog(item, type)}>
                <Edit className="w-3 h-3 mr-1" />
                Hindura
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-lime-50 p-6">
      {/* Header */}
      <div className="mb-8">
        {fetchError && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{fetchError}</span>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAllContent} className="border-red-300 text-red-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-2">
              Gucunga Ibikubiyemo / Content Management
            </h1>
            <p className="text-gray-600">Gucunga ibikubiyemo byose bya sisitemu / Manage all system content</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllContent}
              disabled={loading}
              className="border-yellow-300"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="bg-gradient-to-r from-yellow-500 to-green-600"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="bg-gradient-to-r from-yellow-500 to-green-600"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {contentTypes.slice(0, 7).map((type) => (
            <Card key={type.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setActiveTab(type.id)}>
              <CardContent className={`p-4 bg-gradient-to-br ${type.color} text-white`}>
                <type.icon className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-2xl font-black">{type.count}</p>
                <p className="text-xs opacity-90">{type.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 border-2 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Shakisha ibikubiyemo / Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-yellow-300 focus:border-green-500"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 border-yellow-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose / All</SelectItem>
                <SelectItem value="active">Bikora / Active</SelectItem>
                <SelectItem value="inactive">Bitakora / Inactive</SelectItem>
                <SelectItem value="draft">Inyandiko / Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max bg-white border-2 border-yellow-200 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
              <BarChart className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            {contentTypes.map((type) => (
              <TabsTrigger 
                key={type.id} 
                value={type.id}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
              >
                <type.icon className="w-4 h-4 mr-2" />
                {type.name}
                <Badge className="ml-2 bg-yellow-500">{type.count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contentTypes.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-yellow-400 overflow-hidden"
                  onClick={() => setActiveTab(type.id)}
                >
                  <CardContent className={`p-6 bg-gradient-to-br ${type.color} text-white relative`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <type.icon className="w-12 h-12 mb-4 relative z-10" />
                    <h3 className="text-2xl font-black mb-2 relative z-10">{type.count}</h3>
                    <p className="text-sm opacity-90 mb-4 relative z-10">{type.name}</p>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateDialog(type.id);
                      }}
                      className="relative z-10 w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ongeraho / Add New
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Individual Content Tabs */}
        {contentTypes.map((type) => (
          <TabsContent key={type.id} value={type.id}>
            <Card className="border-2 border-yellow-200">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-green-600 text-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <type.icon className="w-8 h-8" />
                    <div>
                      <CardTitle className="text-2xl">Gucunga {type.name}</CardTitle>
                      <CardDescription className="text-white/80">
                        {type.count} ibikubiyemo / {type.count} items
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleSelectAll(type.id)}
                      className="bg-white/20 text-white hover:bg-white/30"
                    >
                      {selectedIds.size >= (getData(type.id) as any[])?.length ? 'Gukuraho byose' : 'Hitamo byose'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleExportCurrent(type.id)}
                      className="bg-white/20 text-white hover:bg-white/30"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    {selectedIds.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBulkDelete(type.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Gusiba {selectedIds.size}
                      </Button>
                    )}
                    <Button 
                      onClick={() => openCreateDialog(type.id)}
                      className="bg-white text-green-600 hover:bg-yellow-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ongeraho / Add New
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent" />
                  </div>
                ) : filteredData(getData(type.id)).length === 0 ? (
                  <div className="text-center py-12">
                    <type.icon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Nta bikubiyemo bihari / No content available</p>
                    <Button onClick={() => openCreateDialog(type.id)} className="bg-gradient-to-r from-yellow-500 to-green-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Ongeraho Ibikubiyemo / Add Content
                    </Button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                  }>
                    {filteredData(getData(type.id)).map((item) => renderContentCard(item, type.id))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              {editingItem ? 'Hindura Ibikubiyemo / Edit Content' : 'Ongeraho Ibikubiyemo / Add Content'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Umutwe / Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Andika umutwe / Enter title"
                className="border-yellow-300 focus:border-green-500"
              />
            </div>
            <div>
              <Label>Ibisobanuro / Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Andika ibisobanuro / Enter description"
                rows={4}
                className="border-yellow-300 focus:border-green-500"
              />
            </div>
            <div>
              <Label>Ishusho / Image</Label>
              {editingItem && (editingItem.image || (editingItem as any).image_url || (editingItem as any).url) && (
                <div className="mb-2 rounded-lg overflow-hidden border border-yellow-200 max-w-xs">
                  <img src={imageUrl(editingItem)} alt="Current" className="w-full h-32 object-cover" />
                  <p className="text-xs text-gray-500 p-2 bg-gray-50">Current image</p>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                className="border-yellow-300 focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Imimerere / Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="border-yellow-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Bikora / Active</SelectItem>
                    <SelectItem value="inactive">Bitakora / Inactive</SelectItem>
                    <SelectItem value="draft">Inyandiko / Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label>Byihariye / Featured</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>
              <X className="w-4 h-4 mr-2" />
              Hagarika / Cancel
            </Button>
            <Button 
              onClick={() => editingItem ? handleUpdate(formData.type, editingItem.id) : handleCreate(formData.type)}
              className="bg-gradient-to-r from-yellow-500 to-green-600"
              disabled={uploading || !formData.title?.trim()}
            >
              {uploading ? (
                <><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" /> {editingItem ? 'Bika...' : 'Ongeraho...'}
                </>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> {editingItem ? 'Bika Impinduka / Save Changes' : 'Ongeraho / Add'}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveContentManagement;

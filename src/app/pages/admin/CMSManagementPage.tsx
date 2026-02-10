import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Save, X, Eye, Layout, FileText, Users, Briefcase, Trophy, Code, HelpCircle, Home, Search, Filter, Grid, List, Image as ImageIcon, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { API_BASE_URL } from '@/app/config/apiBase';
import { apiFetch } from '@/app/utils/apiClient';

const sections = [
  { id: 'homepage', name: 'Homepage', icon: Home, color: 'bg-blue-500', desc: 'Hero, banners, announcements', api: '/api/homepage' },
  { id: 'sports', name: 'Sports', icon: Trophy, color: 'bg-green-500', desc: 'Teams, achievements, events', api: '/api/sports' },
  { id: 'services', name: 'Services', icon: Briefcase, color: 'bg-purple-500', desc: 'School services & facilities', api: '/api/services' },
  { id: 'trades', name: 'Trades', icon: Layout, color: 'bg-orange-500', desc: 'AUT, BDC, SOD programs', api: '/api/trades' },
  { id: 'leadership', name: 'Leadership', icon: Users, color: 'bg-indigo-500', desc: 'School leaders & staff', api: '/api/leadership' },
  { id: 'developers', name: 'Developers', icon: Code, color: 'bg-pink-500', desc: 'Development team', api: '/api/developers' },
  { id: 'support', name: 'Support', icon: HelpCircle, color: 'bg-yellow-500', desc: 'Help & contact info', api: '/api/support' },
  { id: 'contact', name: 'Contact', icon: FileText, color: 'bg-red-500', desc: 'Contact information', api: '/api/contact' },
  { id: 'academics', name: 'Academics', icon: FileText, color: 'bg-teal-500', desc: 'Academic programs', api: '/api/academics' }
];

const CMSManagementPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (activeSection) fetchItems(activeSection);
    fetchStats();
  }, [activeSection]);

  const importFromAPI = async (section) => {
    if (!confirm(`Import existing ${section} data from API?`)) return;
    try {
      const data = await apiFetch(`/cms/${section}/import`, { method: 'POST' });
      if (data.success) {
        alert(`Imported ${data.imported} items!`);
        fetchItems(section);
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const fetchStats = async () => {
    const counts = {};
    for (const section of sections) {
      try {
        const data = await apiFetch(`/cms/${section.id}`);
        counts[section.id] = data.items?.length || 0;
      } catch (e) {
        counts[section.id] = 0;
      }
    }
    setStats(counts);
  };

  const fetchItems = async (section) => {
    try {
      const data = await apiFetch(`/cms/${section}`);
      if (data.success) setItems(data.items);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await apiFetch(`/cms/${activeSection}/${id}`, { method: 'DELETE' });
      fetchItems(activeSection);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Advanced CMS</h1>
              <p className="text-gray-600 mt-1">Manage all website content in one place</p>
            </div>
            {activeSection && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => importFromAPI(activeSection)}>
                  <Copy className="w-4 h-4 mr-2" /> Import from API
                </Button>
                <Button variant="outline" onClick={() => setActiveSection(null)}>
                  <Layout className="w-4 h-4 mr-2" /> All Pages
                </Button>
                <Button onClick={() => { setEditItem(null); setShowEditor(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Content
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {!activeSection ? (
          /* Page Selection View */
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Select a Page to Manage</h2>
              <p className="text-gray-600">Choose any section to update content, images, and settings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <Card 
                    key={section.id} 
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-500 group"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <CardContent className="pt-6">
                      <div className={`${section.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{section.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{section.desc}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{stats[section.id] || 0} items</Badge>
                        <Button size="sm" variant="ghost">Manage →</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          /* Content Management View */
          <div className="space-y-6">
            {/* Section Header */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {React.createElement(sections.find(s => s.id === activeSection)?.icon, { className: 'w-12 h-12' })}
                    <div>
                      <h2 className="text-2xl font-bold">{sections.find(s => s.id === activeSection)?.name}</h2>
                      <p className="opacity-90">{sections.find(s => s.id === activeSection)?.desc}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">{items.length} items</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Toolbar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search content..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredItems.map(item => (
                <Card key={item.id} className="hover:shadow-xl transition-shadow group">
                  <CardContent className="pt-6">
                    {item.image && (
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img 
                          src={`${API_BASE_URL}/uploads/cms/${item.image}`} 
                          alt={item.title} 
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                        <div className="absolute top-2 right-2">
                          {item.active == 1 ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                    {item.subtitle && <p className="text-sm text-gray-600 mb-2 line-clamp-1">{item.subtitle}</p>}
                    <p className="text-sm text-gray-700 line-clamp-3 mb-4">{item.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => { setEditItem(item); setShowEditor(true); }}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(item.id)}>
                        <Copy className="w-4 h-4 mr-1" /> Copy ID
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No content yet</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first content item</p>
                  <Button onClick={() => { setEditItem(null); setShowEditor(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Content
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {showEditor && (
        <ContentEditor
          section={activeSection}
          item={editItem}
          onClose={() => setShowEditor(false)}
          onSave={() => { setShowEditor(false); fetchItems(activeSection); }}
        />
      )}
    </div>
  );
};

const ContentEditor = ({ section, item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: item?.id || '',
    title: item?.title || '',
    subtitle: item?.subtitle || '',
    description: item?.description || '',
    content: item?.content || '',
    link: item?.link || '',
    metadata: item?.metadata || '',
    display_order: item?.display_order || 0,
    active: item?.active || 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(item?.image ? `${API_BASE_URL}/uploads/cms/${item.image}` : null);
  const [activeTab, setActiveTab] = useState('basic');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) data.append('image', imageFile);

      await apiFetch(`/cms/${section}`, { method: 'POST', body: data }, true);
      
      onSave();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">{item ? 'Edit' : 'Add New'} Content - {section}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
              <button
                type="button"
                className={`px-4 py-2 font-medium ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Info
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-medium ${activeTab === 'content' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>

            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Image Upload
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                    {preview && (
                      <div className="mt-4 relative">
                        <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg shadow-lg" />
                        <Badge className="absolute top-2 right-2 bg-green-500">Preview</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input 
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                      required 
                      className="text-lg"
                      placeholder="Enter title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subtitle</label>
                    <Input 
                      value={formData.subtitle} 
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} 
                      placeholder="Enter subtitle..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description for preview..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium mb-2">Full Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full h-64 px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full content here... Supports HTML"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tip: You can use HTML tags for formatting</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Link/URL</label>
                    <Input 
                      value={formData.link} 
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })} 
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Order</label>
                    <Input 
                      type="number" 
                      value={formData.display_order} 
                      onChange={(e) => setFormData({ ...formData, display_order: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.active == 1}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Publish Status</span>
                      <p className="text-xs text-gray-500">{formData.active == 1 ? 'Content is visible to public' : 'Content is hidden'}</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} size="lg">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CMSManagementPage;

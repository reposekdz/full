import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Upload, Image, Film, Folder, X, Check, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  category: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  is_published: boolean;
  created_at: string;
}

const mockGallery: GalleryItem[] = [
  { id: 1, title: 'Graduation Ceremony 2025', description: 'Annual graduation ceremony', category: 'Events', type: 'image', url: '/uploads/gallery/1.jpg', thumbnail: '', is_published: true, created_at: '2025-12-15' },
  { id: 2, title: 'Sports Day', description: 'Annual sports competition', category: 'Sports', type: 'image', url: '/uploads/gallery/2.jpg', thumbnail: '', is_published: true, created_at: '2025-11-20' },
  { id: 3, title: 'Science Fair', description: 'Student science projects', category: 'Academic', type: 'image', url: '/uploads/gallery/3.jpg', thumbnail: '', is_published: true, created_at: '2025-10-10' },
  { id: 4, title: 'Music Concert', description: 'School music performance', category: 'Arts', type: 'video', url: '/uploads/gallery/4.mp4', thumbnail: '', is_published: true, created_at: '2025-09-05' },
  { id: 5, title: 'Library Opening', description: 'New library inauguration', category: 'Infrastructure', type: 'image', url: '/uploads/gallery/5.jpg', thumbnail: '', is_published: false, created_at: '2025-08-15' },
];

const GalleryManagerPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>(mockGallery);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const categories = ['all', 'Events', 'Sports', 'Academic', 'Arts', 'Infrastructure'];
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const publishedItems = filteredItems.filter(i => i.is_published);
  const draftItems = filteredItems.filter(i => !i.is_published);
  const images = filteredItems.filter(i => i.type === 'image');
  const videos = filteredItems.filter(i => i.type === 'video');

  const handleTogglePublish = (id: number) => {
    setItems(items.map(i => i.id === id ? { ...i, is_published: !i.is_published } : i));
  };

  const handleSaveItem = (item: Partial<GalleryItem>) => {
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...item } : i));
    } else {
      const newItem: GalleryItem = {
        id: Date.now(),
        title: item.title || 'New Item',
        description: item.description || '',
        category: item.category || 'Events',
        type: item.type || 'image',
        url: '',
        thumbnail: '',
        is_published: false,
        created_at: new Date().toISOString().split('T')[0]
      };
      setItems([...items, newItem]);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 via-white to-rose-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gallery Manager</h1>
          <p className="text-gray-600">Manage photos and videos in the gallery</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button onClick={() => { setEditingItem(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search gallery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          className="p-2 border rounded-lg"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <Folder className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Images</p>
                <p className="text-2xl font-bold text-green-600">{images.length}</p>
              </div>
              <Image className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Videos</p>
                <p className="text-2xl font-bold text-purple-600">{videos.length}</p>
              </div>
              <Film className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-2xl font-bold text-pink-600">{publishedItems.length}</p>
              </div>
              <Eye className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-xl shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 px-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-pink-100">All ({filteredItems.length})</TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-green-100">Images ({images.length})</TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-purple-100">Videos ({videos.length})</TabsTrigger>
            <TabsTrigger value="drafts" className="data-[state=active]:bg-amber-100">Drafts ({draftItems.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="m-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(activeTab === 'all' ? filteredItems : 
                activeTab === 'images' ? images : 
                activeTab === 'videos' ? videos : 
                draftItems).map((item) => (
                <Card key={item.id} className="bg-white border-2 border-gray-100 hover:border-pink-200 transition-all overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                    {item.type === 'image' ? (
                      <Image className="w-12 h-12 text-pink-400" />
                    ) : (
                      <Film className="w-12 h-12 text-purple-400" />
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold text-sm mb-1 truncate">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <Badge className={item.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingItem(item); setShowModal(true); }}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(item.id)}>
                        {item.is_published ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveItem({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as string,
                type: formData.get('type') as 'image' | 'video'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input name="title" defaultValue={editingItem?.title} required placeholder="Gallery item title" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input name="description" defaultValue={editingItem?.description} placeholder="Description" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select name="category" defaultValue={editingItem?.category || 'Events'} className="w-full p-2 border rounded">
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="type" value="image" defaultChecked={editingItem?.type !== 'video'} />
                      Image
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="type" value="video" defaultChecked={editingItem?.type === 'video'} />
                      Video
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">{editingItem ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagerPage;

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Save, X, FileText, Layout, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface Page {
  id: number;
  name: string;
  route: string;
  title: string;
  title_rw: string;
  description: string;
  is_published: boolean;
  is_main_menu: boolean;
  order: number;
}

const defaultPages: Page[] = [
  { id: 1, name: 'Home', route: '/', title: 'Home', title_rw: 'Ahabanza', description: 'Main landing page', is_published: true, is_main_menu: true, order: 1 },
  { id: 2, name: 'About', route: '/about', title: 'About Us', title_rw: 'Ibyerekeye', description: 'About school page', is_published: true, is_main_menu: true, order: 2 },
  { id: 3, name: 'Contact', route: '/contact', title: 'Contact Us', title_rw: 'Twandikire', description: 'Contact information', is_published: true, is_main_menu: true, order: 3 },
  { id: 4, name: 'Admissions', route: '/admissions', title: 'Admissions', title_rw: 'Ibyinjiramo', description: 'Admission information', is_published: true, is_main_menu: true, order: 4 },
  { id: 5, name: 'Gallery', route: '/gallery', title: 'Gallery', title_rw: 'Ibyifashishwa', description: 'Photo gallery', is_published: true, is_main_menu: true, order: 5 },
  { id: 6, name: 'News', route: '/news', title: 'News & Events', title_rw: 'Amakuru', description: 'News and events', is_published: true, is_main_menu: true, order: 6 },
  { id: 7, name: 'Sports', route: '/sports', title: 'Sports', title_rw: 'Imikino', description: 'Sports activities', is_published: true, is_main_menu: true, order: 7 },
  { id: 8, name: 'Trades', route: '/trades', title: 'Trades & Courses', title_rw: 'Imyigire', description: 'Available trades', is_published: true, is_main_menu: true, order: 8 },
];

const PageManagerPage: React.FC = () => {
  const [pages, setPages] = useState<Page[]>(defaultPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredPages = pages.filter(page => 
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.route.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedPages = filteredPages.filter(p => p.is_published);
  const draftPages = filteredPages.filter(p => !p.is_published);
  const menuPages = filteredPages.filter(p => p.is_main_menu);

  const handleTogglePublish = (id: number) => {
    setPages(pages.map(p => p.id === id ? { ...p, is_published: !p.is_published } : p));
  };

  const handleToggleMenu = (id: number) => {
    setPages(pages.map(p => p.id === id ? { ...p, is_main_menu: !p.is_main_menu } : p));
  };

  const handleSavePage = (page: Partial<Page>) => {
    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? { ...p, ...page } : p));
    } else {
      const newPage: Page = {
        id: Date.now(),
        name: page.name || 'New Page',
        route: page.route || '/new-page',
        title: page.title || 'New Page',
        title_rw: page.title_rw || '',
        description: page.description || '',
        is_published: false,
        is_main_menu: false,
        order: pages.length + 1
      };
      setPages([...pages, newPage]);
    }
    setShowModal(false);
    setEditingPage(null);
  };

  const handleDeletePage = (id: number) => {
    if (confirm('Are you sure you want to delete this page?')) {
      setPages(pages.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Page Manager</h1>
          <p className="text-gray-600">Manage website pages and navigation</p>
        </div>
        <Button onClick={() => { setEditingPage(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Page
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pages</p>
                <p className="text-2xl font-bold">{pages.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-2xl font-bold text-green-600">{publishedPages.length}</p>
              </div>
              <Globe className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Drafts</p>
                <p className="text-2xl font-bold text-amber-600">{draftPages.length}</p>
              </div>
              <EyeOff className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Menu</p>
                <p className="text-2xl font-bold text-purple-600">{menuPages.length}</p>
              </div>
              <Layout className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-xl shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 px-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-100">All ({filteredPages.length})</TabsTrigger>
            <TabsTrigger value="published" className="data-[state=active]:bg-green-100">Published ({publishedPages.length})</TabsTrigger>
            <TabsTrigger value="drafts" className="data-[state=active]:bg-amber-100">Drafts ({draftPages.length})</TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-purple-100">In Menu ({menuPages.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(activeTab === 'all' ? filteredPages : 
                    activeTab === 'published' ? publishedPages : 
                    activeTab === 'drafts' ? draftPages : 
                    menuPages).map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{page.name}</td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{page.route}</code>
                      </td>
                      <td className="px-6 py-4">{page.title}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Switch checked={page.is_published} onCheckedChange={() => handleTogglePublish(page.id)} />
                          <Badge className={page.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                            {page.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Switch checked={page.is_main_menu} onCheckedChange={() => handleToggleMenu(page.id)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingPage(page); setShowModal(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingPage ? 'Edit Page' : 'Add New Page'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSavePage({
                name: formData.get('name') as string,
                route: formData.get('route') as string,
                title: formData.get('title') as string,
                title_rw: formData.get('title_rw') as string,
                description: formData.get('description') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Page Name</label>
                  <Input name="name" defaultValue={editingPage?.name} required placeholder="e.g., About" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Route</label>
                  <Input name="route" defaultValue={editingPage?.route} required placeholder="/about" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title (English)</label>
                  <Input name="title" defaultValue={editingPage?.title} required placeholder="About Us" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title (Kinyarwanda)</label>
                  <Input name="title_rw" defaultValue={editingPage?.title_rw} placeholder="Ibyerekeye" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input name="description" defaultValue={editingPage?.description} placeholder="Page description" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">{editingPage ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageManagerPage;

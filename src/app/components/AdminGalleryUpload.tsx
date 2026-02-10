import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/app/config/apiBase';
import { apiFetch } from '@/app/utils/apiClient';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Trash2, Edit, Save, X, Loader2, CheckCircle, AlertCircle, Download, Eye, Grid, List, Search, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface GalleryImage {
  id: number;
  title: string;
  title_rw: string;
  description?: string;
  description_rw?: string;
  image_url: string;
  sort_order: number;
}

const AdminGalleryUpload: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_rw: '',
    description: '',
    description_rw: '',
    sort_order: 0
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/gallery/images');
      if (data.success) setImages(data.images);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleBulkUpload(files);
    }
  }, []);

  const handleBulkUpload = async (files: File[]) => {
    setUploading(true);
    setMessage(null);
    let successCount = 0;

    for (const file of files) {
      const data = new FormData();
      data.append('image', file);
      data.append('title', formData.title || file.name);
      data.append('title_rw', formData.title_rw || file.name);
      data.append('description', formData.description || '');
      data.append('description_rw', formData.description_rw || '');
      data.append('sort_order', formData.sort_order.toString());

      try {
        const result = await apiFetch('/gallery/upload', { method: 'POST', body: data }, true);
        if (result.success) successCount++;
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setMessage({ type: 'success', text: `${successCount}/${files.length} images uploaded successfully!` });
    setUploading(false);
    fetchImages();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await handleBulkUpload(Array.from(files));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this image?')) return;

    try {
      const token = localStorage.getItem('token');
      const data = await apiFetch(`/gallery/${id}`, { method: 'DELETE' });
      if (data.success) {
        setMessage({ type: 'success', text: 'Image deleted!' });
        fetchImages();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  const filteredImages = images.filter(img => 
    img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.title_rw.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-2 border-yellow-200">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-yellow-600" />
              Advanced Gallery Manager
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchImages}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Images</TabsTrigger>
              <TabsTrigger value="manage">Manage Gallery ({images.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              {message && (
                <Alert className={`${message.type === 'success' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title (English)</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Campus Building" />
                </div>
                <div>
                  <Label>Umutwe (Kinyarwanda)</Label>
                  <Input value={formData.title_rw} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} placeholder="Inyubako y'Ikigo" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Description (English)</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional" />
                </div>
                <div>
                  <Label>Ibisobanuro (Kinyarwanda)</Label>
                  <Textarea value={formData.description_rw} onChange={(e) => setFormData({ ...formData, description_rw: e.target.value })} placeholder="Optional" />
                </div>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${
                  dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-yellow-400'
                }`}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-bold text-gray-700 mb-2">
                  {dragActive ? 'Drop images here!' : 'Drag & Drop Images or Click to Upload'}
                </p>
                <p className="text-sm text-gray-500 mb-4">Supports: JPG, PNG, GIF, WEBP (Max 10MB each)</p>
                <Label htmlFor="file-upload">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-green-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-green-600 transition-all cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Select Files
                      </>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search images..."
                    className="pl-10"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-yellow-600" />
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
                  {filteredImages.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-yellow-400 transition-all">
                        <img
                          src={`${API_BASE_URL}${image.image_url}`}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(image.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-2 font-medium truncate">{image.title}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGalleryUpload;

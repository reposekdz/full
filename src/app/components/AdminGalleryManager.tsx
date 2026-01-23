import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, Trash2, Edit, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

interface GalleryImage {
  id: number;
  title: string;
  title_rw: string;
  description?: string;
  description_rw?: string;
  image_url: string;
  sort_order: number;
}

const AdminGalleryManager: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/gallery/images', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formDataToSend = new FormData();
    formDataToSend.append('image', file);
    formDataToSend.append('title', formData.title || 'Campus Image');
    formDataToSend.append('title_rw', formData.title_rw || 'Ifoto y\'Ikigo');
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('description_rw', formData.description_rw || '');
    formDataToSend.append('sort_order', formData.sort_order.toString());

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/gallery/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
        setFormData({ title: '', title_rw: '', description: '', description_rw: '', sort_order: 0 });
        fetchImages();
      } else {
        setMessage({ type: 'error', text: data.message || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Image deleted successfully!' });
        fetchImages();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete image' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="border-2 border-yellow-200">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-yellow-600" />
            Campus Gallery Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {message && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Title (English)</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Campus Building"
              />
            </div>
            <div>
              <Label>Umutwe (Kinyarwanda)</Label>
              <Input
                value={formData.title_rw}
                onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })}
                placeholder="Inyubako y'Ikigo"
              />
            </div>
            <div>
              <Label>Description (English)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div>
              <Label>Ibisobanuro (Kinyarwanda)</Label>
              <Textarea
                value={formData.description_rw}
                onChange={(e) => setFormData({ ...formData, description_rw: e.target.value })}
                placeholder="Ibisobanuro by'inyongera"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-green-500 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-green-600 transition-all">
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Image
                  </>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-yellow-200">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
          <CardTitle>Gallery Images ({images.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-yellow-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={`http://localhost:5000${image.image_url}`}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-center mt-2 font-medium truncate">{image.title}</p>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGalleryManager;

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Edit, Save, X, Upload, Image, Type, Palette } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { useAdminContent } from '@/app/hooks/useAdminContent';

interface AdminContentEditorProps {
  pageName: string;
  sectionName: string;
  children: React.ReactNode;
  isAdmin?: boolean;
  className?: string;
  editMode?: 'inline' | 'dialog';
}

const AdminContentEditor: React.FC<AdminContentEditorProps> = ({
  pageName,
  sectionName,
  children,
  isAdmin = false,
  className = '',
  editMode = 'dialog'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    subtitle: '',
    content_text: '',
    content_html: '',
    background_color: '',
    text_color: '',
    font_size: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const { getContent, updateContent, loading } = useAdminContent(pageName);

  const handleEdit = () => {
    const content = getContent(pageName, sectionName);
    if (content) {
      setEditData({
        title: content.title || '',
        subtitle: content.subtitle || '',
        content_text: content.content_text || '',
        content_html: content.content_html || '',
        background_color: content.background_color || '',
        text_color: content.text_color || '',
        font_size: content.font_size || ''
      });
      setImagePreview(content.image_url || '');
    }
    
    if (editMode === 'dialog') {
      setShowDialog(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    const success = await updateContent(pageName, sectionName, editData, selectedImage || undefined);
    
    if (success) {
      setIsEditing(false);
      setShowDialog(false);
      setSelectedImage(null);
      setImagePreview('');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowDialog(false);
    setSelectedImage(null);
    setImagePreview('');
    setEditData({
      title: '',
      subtitle: '',
      content_text: '',
      content_html: '',
      background_color: '',
      text_color: '',
      font_size: ''
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAdmin) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Admin Edit Overlay */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          onClick={handleEdit}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
      </div>

      {/* Content */}
      <div className={isEditing ? 'border-2 border-dashed border-blue-400 p-2' : ''}>
        {children}
      </div>

      {/* Inline Editing */}
      {isEditing && editMode === 'inline' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg z-20"
        >
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="Enter title"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={editData.content_text}
                onChange={(e) => setEditData({ ...editData, content_text: e.target.value })}
                placeholder="Enter content"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" disabled={loading}>
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dialog Editing */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Content - {pageName}/{sectionName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={editData.subtitle}
                  onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                  placeholder="Enter subtitle"
                />
              </div>
            </div>

            <div>
              <Label>Content Text</Label>
              <Textarea
                value={editData.content_text}
                onChange={(e) => setEditData({ ...editData, content_text: e.target.value })}
                placeholder="Enter content text"
                rows={4}
              />
            </div>

            <div>
              <Label>HTML Content (Advanced)</Label>
              <Textarea
                value={editData.content_html}
                onChange={(e) => setEditData({ ...editData, content_html: e.target.value })}
                placeholder="Enter HTML content"
                rows={3}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image Upload
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Background Color
                </Label>
                <Input
                  type="color"
                  value={editData.background_color}
                  onChange={(e) => setEditData({ ...editData, background_color: e.target.value })}
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Text Color
                </Label>
                <Input
                  type="color"
                  value={editData.text_color}
                  onChange={(e) => setEditData({ ...editData, text_color: e.target.value })}
                />
              </div>
              <div>
                <Label>Font Size</Label>
                <Input
                  value={editData.font_size}
                  onChange={(e) => setEditData({ ...editData, font_size: e.target.value })}
                  placeholder="e.g., 16px, 1.2rem"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContentEditor;
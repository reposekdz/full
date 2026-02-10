import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/config/apiBase';
import { Plus, Edit2, Trash2, Eye, Heart, Image as ImageIcon, Save, X } from 'lucide-react';
import { apiFetch } from '@/app/utils/apiClient';

interface Article {
  id: number;
  title: string;
  description: string;
  content: string;
  image_url: string;
  author: string;
  category: string;
  date_published: string;
  views: number;
  likes: number;
  is_featured: boolean;
  is_active: boolean;
}

const AdminArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    author: '',
    category: 'School Life',
    is_featured: false,
    image: null as File | null
  });

  const categories = ['School Life', 'Guidance', 'Leadership', 'Academics', 'Environment', 'Staff', 'Sports', 'Events', 'Announcements'];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    apiFetch('/news')
      .then((data) => {
        if (data.success) setArticles(data.articles);
      })
      .catch((error) => console.error('Error fetching articles:', error));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('content', formData.content);
    data.append('author', formData.author);
    data.append('category', formData.category);
    data.append('is_featured', String(formData.is_featured));
    if (formData.image) data.append('image', formData.image);

    const url = editingId ? `/news/${editingId}` : '/news';
    const method = editingId ? 'PUT' : 'POST';

    apiFetch(url, { method, body: data }, true)
      .then((result) => {
        if (result.success) {
          fetchArticles();
          resetForm();
        }
      })
      .catch((error) => console.error('Error saving article:', error));
  };

  const handleEdit = (article: Article) => {
    setFormData({
      title: article.title,
      description: article.description,
      content: article.content,
      author: article.author,
      category: article.category,
      is_featured: article.is_featured,
      image: null
    });
    setImagePreview(article.image_url ? `${API_BASE_URL}${article.image_url}` : '');
    setEditingId(article.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    apiFetch(`/news/${id}`, { method: 'DELETE' })
      .then((result) => {
        if (result.success) fetchArticles();
      })
      .catch((error) => console.error('Error deleting article:', error));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', content: '', author: '', category: 'School Life', is_featured: false, image: null });
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">News Article Management</h1>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'Cancel' : 'New Article'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Article' : 'Create New Article'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={6} required />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5" />
                    <span className="text-sm font-medium">Featured Article</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border rounded-lg" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 w-48 h-32 object-cover rounded-lg" />}
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                  <Save size={20} /> {editingId ? 'Update' : 'Create'} Article
                </button>
                <button type="button" onClick={resetForm} className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition">
                  <X size={20} /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {articles.map(article => (
            <div key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="flex">
                <div className="w-64 h-48 bg-gray-200 flex-shrink-0">
                  {article.image_url ? (
                    <img src={`${API_BASE_URL}${article.image_url}`} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={48} className="text-gray-400" /></div>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{article.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{article.category}</span>
                        <span>By {article.author}</span>
                        <span>{new Date(article.date_published).toLocaleDateString()}</span>
                        {article.is_featured && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">Featured</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(article)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(article.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{article.description}</p>
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Eye size={16} /> {article.views || 0} views</span>
                    <span className="flex items-center gap-1"><Heart size={16} /> {article.likes || 0} likes</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminArticleManagement;

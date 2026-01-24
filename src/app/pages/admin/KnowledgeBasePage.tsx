import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, FileText, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const KnowledgeBasePage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [search, selectedCategory]);

  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`http://localhost:5000/api/knowledge-base/articles?${params}`);
      const data = await response.json();
      if (data.success) setArticles(data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/knowledge-base/categories');
      const data = await response.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await fetch(`http://localhost:5000/api/knowledge-base/articles/${id}`, { method: 'DELETE' });
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <Button onClick={() => { setCurrentArticle(null); setShowEditor(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Article
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.category} value={cat.category}>
              {cat.category} ({cat.count})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="line-clamp-2">{article.title}</span>
                <Badge variant="secondary">{article.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {article.views} views
                </span>
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
              </div>
              {article.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.split(',').map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" /> {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.open(`/knowledge/${article.id}`, '_blank')}>
                  <FileText className="w-4 h-4 mr-1" /> View
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setCurrentArticle(article); setShowEditor(true); }}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(article.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showEditor && (
        <ArticleEditor
          article={currentArticle}
          onClose={() => setShowEditor(false)}
          onSave={() => { setShowEditor(false); fetchArticles(); }}
        />
      )}
    </div>
  );
};

const ArticleEditor = ({ article, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    category: article?.category || '',
    tags: article?.tags || '',
    author_id: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = article 
        ? `http://localhost:5000/api/knowledge-base/articles/${article.id}`
        : 'http://localhost:5000/api/knowledge-base/articles';
      
      await fetch(url, {
        method: article ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{article ? 'Edit Article' : 'New Article'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full h-64 px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Article</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBasePage;

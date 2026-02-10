import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';

import { API_BASE_URL } from '@/app/config/apiBase';
const API_BASE = `${API_BASE_URL}/`;

const AdminHomepageManager = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [slides, setSlides] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [events, setEvents] = useState([]);
  const [features, setFeatures] = useState([]);
  const [stats, setStats] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/homepage/admin/${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        switch(activeTab) {
          case 'news': setNews(data.news); break;
          case 'slides': setSlides(data.slides); break;
          case 'testimonials': setTestimonials(data.testimonials); break;
          case 'achievements': setAchievements(data.achievements); break;
          case 'events': setEvents(data.events); break;
          case 'features': setFeatures(data.features); break;
          case 'stats': setStats(data.stats); break;
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleSave = async (item) => {
    try {
      const url = editingItem 
        ? `${API_BASE}/homepage/admin/${activeTab}/${editingItem.id}`
        : `${API_BASE}/homepage/admin/${activeTab}`;
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setShowForm(false);
        setEditingItem(null);
        fetchData();
      }
    } catch (error) {
      alert('Error saving: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/homepage/admin/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      }
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  const renderNewsForm = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <input
        type="text"
        placeholder="Title"
        className="w-full p-2 border rounded"
        defaultValue={editingItem?.title}
        id="title"
      />
      <textarea
        placeholder="Description"
        className="w-full p-2 border rounded"
        rows="3"
        defaultValue={editingItem?.description}
        id="description"
      />
      <textarea
        placeholder="Content"
        className="w-full p-2 border rounded"
        rows="5"
        defaultValue={editingItem?.content}
        id="content"
      />
      <input
        type="text"
        placeholder="Image URL"
        className="w-full p-2 border rounded"
        defaultValue={editingItem?.image_url}
        id="image_url"
      />
      <input
        type="text"
        placeholder="Author"
        className="w-full p-2 border rounded"
        defaultValue={editingItem?.author}
        id="author"
      />
      <input
        type="text"
        placeholder="Category"
        className="w-full p-2 border rounded"
        defaultValue={editingItem?.category}
        id="category"
      />
      <div className="flex gap-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked={editingItem?.is_featured} id="is_featured" />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked={editingItem?.is_active !== false} id="is_active" />
          Active
        </label>
      </div>
      <input
        type="number"
        placeholder="Sort Order"
        className="w-full p-2 border rounded"
        defaultValue={editingItem?.sort_order || 0}
        id="sort_order"
      />
      <div className="flex gap-2">
        <Button onClick={() => {
          const item = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            content: document.getElementById('content').value,
            image_url: document.getElementById('image_url').value,
            author: document.getElementById('author').value,
            category: document.getElementById('category').value,
            is_featured: document.getElementById('is_featured').checked,
            is_active: document.getElementById('is_active').checked,
            sort_order: parseInt(document.getElementById('sort_order').value)
          };
          handleSave(item);
        }}>
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
        <Button variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); }}>
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
      </div>
    </div>
  );

  const renderSlideForm = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <input type="text" placeholder="Title" className="w-full p-2 border rounded" defaultValue={editingItem?.title} id="title" />
      <input type="text" placeholder="Subtitle" className="w-full p-2 border rounded" defaultValue={editingItem?.subtitle} id="subtitle" />
      <textarea placeholder="Description" className="w-full p-2 border rounded" rows="3" defaultValue={editingItem?.description} id="description" />
      <input type="text" placeholder="Image URL" className="w-full p-2 border rounded" defaultValue={editingItem?.image_url} id="image_url" />
      <input type="text" placeholder="Button Text" className="w-full p-2 border rounded" defaultValue={editingItem?.button_text} id="button_text" />
      <input type="text" placeholder="Button Link" className="w-full p-2 border rounded" defaultValue={editingItem?.button_link} id="button_link" />
      <label className="flex items-center gap-2">
        <input type="checkbox" defaultChecked={editingItem?.is_active !== false} id="is_active" />
        Active
      </label>
      <input type="number" placeholder="Sort Order" className="w-full p-2 border rounded" defaultValue={editingItem?.sort_order || 0} id="sort_order" />
      <div className="flex gap-2">
        <Button onClick={() => handleSave({
          title: document.getElementById('title').value,
          subtitle: document.getElementById('subtitle').value,
          description: document.getElementById('description').value,
          image_url: document.getElementById('image_url').value,
          button_text: document.getElementById('button_text').value,
          button_link: document.getElementById('button_link').value,
          is_active: document.getElementById('is_active').checked,
          sort_order: parseInt(document.getElementById('sort_order').value)
        })}>
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
        <Button variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); }}>
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
      </div>
    </div>
  );

  const renderTestimonialForm = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <input type="text" placeholder="Name" className="w-full p-2 border rounded" defaultValue={editingItem?.name} id="name" />
      <input type="text" placeholder="Role" className="w-full p-2 border rounded" defaultValue={editingItem?.role} id="role" />
      <input type="text" placeholder="Avatar (2 letters)" className="w-full p-2 border rounded" maxLength="2" defaultValue={editingItem?.avatar} id="avatar" />
      <textarea placeholder="Quote" className="w-full p-2 border rounded" rows="4" defaultValue={editingItem?.quote} id="quote" />
      <input type="number" placeholder="Rating (1-5)" className="w-full p-2 border rounded" min="1" max="5" defaultValue={editingItem?.rating || 5} id="rating" />
      <label className="flex items-center gap-2">
        <input type="checkbox" defaultChecked={editingItem?.is_active !== false} id="is_active" />
        Active
      </label>
      <input type="number" placeholder="Sort Order" className="w-full p-2 border rounded" defaultValue={editingItem?.sort_order || 0} id="sort_order" />
      <div className="flex gap-2">
        <Button onClick={() => handleSave({
          name: document.getElementById('name').value,
          role: document.getElementById('role').value,
          avatar: document.getElementById('avatar').value,
          quote: document.getElementById('quote').value,
          rating: parseInt(document.getElementById('rating').value),
          is_active: document.getElementById('is_active').checked,
          sort_order: parseInt(document.getElementById('sort_order').value)
        })}>
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
        <Button variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); }}>
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
      </div>
    </div>
  );

  const renderList = () => {
    let items = [];
    switch(activeTab) {
      case 'news': items = news; break;
      case 'slides': items = slides; break;
      case 'testimonials': items = testimonials; break;
      case 'achievements': items = achievements; break;
      case 'events': items = events; break;
      case 'features': items = features; break;
      case 'stats': items = stats; break;
    }

    return (
      <div className="space-y-4">
        {items.map(item => (
          <Card key={item.id} className="border-2">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.title || item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description || item.quote || item.role}</p>
                  <div className="flex gap-2 mt-2">
                    {item.is_active !== false ? (
                      <Badge className="bg-green-500"><Eye className="w-3 h-3 mr-1" /> Active</Badge>
                    ) : (
                      <Badge className="bg-gray-500"><EyeOff className="w-3 h-3 mr-1" /> Inactive</Badge>
                    )}
                    {item.category && <Badge variant="outline">{item.category}</Badge>}
                    {item.sort_order !== undefined && <Badge variant="outline">Order: {item.sort_order}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setShowForm(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'news', label: 'News Articles' },
    { id: 'slides', label: 'Hero Slides' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'events', label: 'Events' },
    { id: 'features', label: 'Features' },
    { id: 'stats', label: 'Statistics' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Homepage Content Manager</CardTitle>
          <p className="text-gray-600">Manage all homepage content from one place</p>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => { setActiveTab(tab.id); setShowForm(false); setEditingItem(null); }}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Add New Button */}
          {!showForm && activeTab !== 'stats' && (
            <Button className="mb-4" onClick={() => { setShowForm(true); setEditingItem(null); }}>
              <Plus className="w-4 h-4 mr-2" /> Add New {tabs.find(t => t.id === activeTab)?.label}
            </Button>
          )}

          {/* Form */}
          {showForm && (
            <div className="mb-6">
              {activeTab === 'news' && renderNewsForm()}
              {activeTab === 'slides' && renderSlideForm()}
              {activeTab === 'testimonials' && renderTestimonialForm()}
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            renderList()
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHomepageManager;

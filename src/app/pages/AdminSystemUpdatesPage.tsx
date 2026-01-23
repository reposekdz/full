import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Settings, Image as ImageIcon, FileText, Layout, Upload, Edit, Trash2, Save, X, Plus, History, Palette, Globe } from 'lucide-react';

const AdminSystemUpdatesPage = () => {
  const [components, setComponents] = useState([]);
  const [images, setImages] = useState([]);
  const [content, setContent] = useState([]);
  const [settings, setSettings] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('components');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [componentsRes, imagesRes, contentRes, settingsRes, historyRes] = await Promise.all([
        fetch('http://localhost:5000/api/system-updates/components'),
        fetch('http://localhost:5000/api/system-updates/images'),
        fetch('http://localhost:5000/api/system-updates/content'),
        fetch('http://localhost:5000/api/system-updates/settings'),
        fetch('http://localhost:5000/api/system-updates/history')
      ]);

      setComponents(await componentsRes.json());
      setImages(await imagesRes.json());
      setContent(await contentRes.json());
      setSettings(await settingsRes.json());
      setHistory(await historyRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let endpoint = '';
      let method = 'POST';
      let body;

      if (modalType === 'image') {
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
        if (imageFile) formDataToSend.append('image', imageFile);
        
        endpoint = 'http://localhost:5000/api/system-updates/images';
        body = formDataToSend;
      } else if (modalType === 'content') {
        endpoint = 'http://localhost:5000/api/system-updates/content';
        body = JSON.stringify(formData);
      } else if (modalType === 'setting') {
        endpoint = 'http://localhost:5000/api/system-updates/settings';
        body = JSON.stringify(formData);
      } else if (modalType === 'component') {
        endpoint = 'http://localhost:5000/api/system-updates/components';
        body = JSON.stringify(formData);
      }

      const options = {
        method,
        body,
        ...(modalType !== 'image' && { headers: { 'Content-Type': 'application/json' } })
      };

      const response = await fetch(endpoint, options);
      if (response.ok) {
        fetchData();
        closeModal();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await fetch(`http://localhost:5000/api/system-updates/${type}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormData(item || {});
    setImagePreview(item?.image_url ? `http://localhost:5000${item.image_url}` : '');
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setFormData({});
    setImageFile(null);
    setImagePreview('');
  };

  const categories = {
    components: [...new Set(components.map(c => c.category))],
    images: [...new Set(images.map(i => i.category))],
    content: [...new Set(content.map(c => c.category))],
    settings: [...new Set(settings.map(s => s.category))]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-indigo-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex">
        {/* Left Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 min-h-screen p-6 shadow-2xl sticky top-0 h-screen overflow-y-auto"
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Settings className="w-12 h-12 text-white animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 text-center">System Updates</h1>
            <p className="text-indigo-200 text-center text-sm">Manage All Components</p>
          </div>

          <div className="space-y-3 mb-8">
            <Button
              onClick={() => setActiveSection('components')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeSection === 'components'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <Layout className="w-5 h-5 mr-3" />
              Components
            </Button>

            <Button
              onClick={() => setActiveSection('images')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeSection === 'images'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <ImageIcon className="w-5 h-5 mr-3" />
              Images
            </Button>

            <Button
              onClick={() => setActiveSection('content')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeSection === 'content'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <FileText className="w-5 h-5 mr-3" />
              Content
            </Button>

            <Button
              onClick={() => setActiveSection('settings')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeSection === 'settings'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <Palette className="w-5 h-5 mr-3" />
              Settings
            </Button>

            <Button
              onClick={() => setActiveSection('history')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeSection === 'history'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <History className="w-5 h-5 mr-3" />
              Update History
            </Button>
          </div>

          <div className="p-4 bg-indigo-800/50 rounded-xl">
            <h3 className="text-white font-bold mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-indigo-200">
                <span>Components:</span>
                <span className="font-bold text-white">{components.length}</span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Images:</span>
                <span className="font-bold text-white">{images.length}</span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Content Items:</span>
                <span className="font-bold text-white">{content.length}</span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Settings:</span>
                <span className="font-bold text-white">{settings.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black text-gray-900">
                {activeSection === 'components' ? 'Manage Components' :
                 activeSection === 'images' ? 'Manage Images' :
                 activeSection === 'content' ? 'Manage Content' :
                 activeSection === 'settings' ? 'System Settings' : 'Update History'}
              </h2>
              {activeSection !== 'history' && (
                <Button
                  onClick={() => openModal(activeSection === 'components' ? 'component' : activeSection === 'images' ? 'image' : activeSection === 'content' ? 'content' : 'setting')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold h-12 px-6 shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New
                </Button>
              )}
            </div>

            {/* Components Section */}
            {activeSection === 'components' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map((component, index) => (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                      <CardContent className="p-6">
                        <Badge className="mb-3 bg-indigo-600">{component.category}</Badge>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{component.display_name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{component.component_name}</p>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{component.description}</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openModal('component', component)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete('components', component.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Images Section */}
            {activeSection === 'images' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                      {image.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={`http://localhost:5000${image.image_url}`}
                            alt={image.alt_text}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <Badge className="mb-2 bg-purple-600 text-xs">{image.category}</Badge>
                        <p className="text-sm font-bold text-gray-900 mb-1">{image.component_name}</p>
                        <p className="text-xs text-gray-600 mb-3">{image.image_key}</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openModal('image', image)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete('images', image.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Content Section */}
            {activeSection === 'content' && (
              <div className="space-y-4">
                {content.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className="bg-pink-600">{item.category}</Badge>
                              <Badge className="bg-gray-600">{item.content_type}</Badge>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.component_name} - {item.content_key}</h3>
                            <p className="text-sm text-gray-700 mb-2 line-clamp-2">{item.content_rw}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.content_en}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => openModal('content', item)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete('content', item.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settings.map((setting, index) => (
                  <motion.div
                    key={setting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-xl">
                      <CardContent className="p-6">
                        <Badge className="mb-3 bg-indigo-600">{setting.category}</Badge>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{setting.setting_key}</h3>
                        <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                        <div className="bg-gray-100 rounded-lg p-3 mb-4">
                          <p className="text-sm font-mono text-gray-900">{setting.setting_value}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openModal('setting', setting)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* History Section */}
            {activeSection === 'history' && (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-green-600">{item.update_type}</Badge>
                              <span className="text-sm font-bold text-gray-900">{item.component_name}</span>
                            </div>
                            <p className="text-sm text-gray-700">{item.update_description}</p>
                            <p className="text-xs text-gray-500 mt-1">By: {item.updated_by} • {new Date(item.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900">
                  {modalType === 'component' ? 'Component' :
                   modalType === 'image' ? 'Image' :
                   modalType === 'content' ? 'Content' : 'Setting'}
                </h3>
                <Button onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {modalType === 'image' && (
                  <>
                    <Input
                      placeholder="Component Name"
                      value={formData.component_name || ''}
                      onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Image Key"
                      value={formData.image_key || ''}
                      onChange={(e) => setFormData({ ...formData, image_key: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Alt Text"
                      value={formData.alt_text || ''}
                      onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    />
                    <Input
                      placeholder="Category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                    <textarea
                      placeholder="Description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border rounded-lg min-h-[80px]"
                    />
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Upload Image</label>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
                      )}
                    </div>
                  </>
                )}

                {modalType === 'content' && (
                  <>
                    <Input
                      placeholder="Component Name"
                      value={formData.component_name || ''}
                      onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Content Key"
                      value={formData.content_key || ''}
                      onChange={(e) => setFormData({ ...formData, content_key: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Content Type"
                      value={formData.content_type || ''}
                      onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    />
                    <Input
                      placeholder="Category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                    <textarea
                      placeholder="Content (Kinyarwanda)"
                      value={formData.content_rw || ''}
                      onChange={(e) => setFormData({ ...formData, content_rw: e.target.value })}
                      className="w-full p-3 border rounded-lg min-h-[100px]"
                      required
                    />
                    <textarea
                      placeholder="Content (English)"
                      value={formData.content_en || ''}
                      onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                      className="w-full p-3 border rounded-lg min-h-[100px]"
                      required
                    />
                  </>
                )}

                {modalType === 'setting' && (
                  <>
                    <Input
                      placeholder="Setting Key"
                      value={formData.setting_key || ''}
                      onChange={(e) => setFormData({ ...formData, setting_key: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Setting Value"
                      value={formData.setting_value || ''}
                      onChange={(e) => setFormData({ ...formData, setting_value: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Setting Type"
                      value={formData.setting_type || ''}
                      onChange={(e) => setFormData({ ...formData, setting_type: e.target.value })}
                    />
                    <Input
                      placeholder="Category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                    <textarea
                      placeholder="Description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border rounded-lg min-h-[80px]"
                    />
                  </>
                )}

                {modalType === 'component' && (
                  <>
                    <Input
                      placeholder="Component Name"
                      value={formData.component_name || ''}
                      onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Display Name"
                      value={formData.display_name || ''}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                    <textarea
                      placeholder="Description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border rounded-lg min-h-[100px]"
                    />
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold h-12">
                    <Save className="w-5 h-5 mr-2" />
                    Save
                  </Button>
                  <Button type="button" onClick={closeModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold h-12">
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSystemUpdatesPage;

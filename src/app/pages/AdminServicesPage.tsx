import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import RwandaLocationSelector from '../components/RwandaLocationSelector';
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon, BookOpen, Users, Shield, Award, Mail, Phone, MapPin, Star, Trophy, Target, Briefcase } from 'lucide-react';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('services');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, coachesRes] = await Promise.all([
        fetch('http://localhost:5000/api/services-advanced/services'),
        fetch('http://localhost:5000/api/services-advanced/coaches')
      ]);
      const servicesData = await servicesRes.json();
      const coachesData = await coachesRes.json();
      setServices(servicesData);
      setCoaches(coachesData);
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
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'object' && formData[key] !== null) {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      const endpoint = activeSection === 'services' ? 'services' : 'coaches';
      const url = editingItem
        ? `http://localhost:5000/api/services-advanced/${endpoint}/${editingItem.id}`
        : `http://localhost:5000/api/services-advanced/${endpoint}`;
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        fetchData();
        closeModal();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const endpoint = activeSection === 'services' ? 'services' : 'coaches';
      await fetch(`http://localhost:5000/api/services-advanced/${endpoint}/${id}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
      setImagePreview(item.image_url ? `http://localhost:5000${item.image_url}` : '');
    } else {
      setFormData(activeSection === 'services' ? {
        title_rw: '', title_en: '', description_rw: '', description_en: '',
        category: '', icon: '', features: '[]', requirements: '[]', contact_info: '{}'
      } : {
        name: '', sport: '', title: '', bio_rw: '', bio_en: '', experience_years: 0,
        qualifications: '[]', achievements: '[]', specializations: '[]',
        email: '', phone: '', office_location: ''
      });
      setImagePreview('');
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
    setImageFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-indigo-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex">
        {/* Left Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900 min-h-screen p-6 shadow-2xl"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Admin Panel</h1>
            <p className="text-indigo-200">Services & Coaches Management</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setActiveSection('services')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeSection === 'services'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <BookOpen className="w-5 h-5 mr-3" />
              Services
            </Button>

            <Button
              onClick={() => setActiveSection('coaches')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeSection === 'coaches'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              Coaches
            </Button>

            <Button
              onClick={() => setActiveSection('jotham')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeSection === 'jotham'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <Trophy className="w-5 h-5 mr-3" />
              Jotham Profile
            </Button>

            <Button
              onClick={() => setActiveSection('analytics')}
              className={`w-full justify-start h-14 text-lg font-bold ${
                activeSection === 'analytics'
                  ? 'bg-white text-indigo-900 shadow-xl'
                  : 'bg-indigo-800/50 text-white hover:bg-indigo-700'
              }`}
            >
              <Target className="w-5 h-5 mr-3" />
              Analytics
            </Button>
          </div>

          <div className="mt-8 p-4 bg-indigo-800/50 rounded-xl">
            <h3 className="text-white font-bold mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-indigo-200">
                <span>Total Services:</span>
                <span className="font-bold text-white">{services.length}</span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Total Coaches:</span>
                <span className="font-bold text-white">{coaches.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black text-gray-900">
                {activeSection === 'services' ? 'Manage Services' :
                 activeSection === 'coaches' ? 'Manage Coaches' :
                 activeSection === 'jotham' ? 'Jotham Profile' : 'Analytics'}
              </h2>
              {(activeSection === 'services' || activeSection === 'coaches') && (
                <Button
                  onClick={() => openModal()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold h-12 px-6 shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add {activeSection === 'services' ? 'Service' : 'Coach'}
                </Button>
              )}
            </div>

            {/* Services Section */}
            {activeSection === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                      {service.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={`http://localhost:5000${service.image_url}`}
                            alt={service.title_rw}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <Badge className="mb-3 bg-indigo-600">{service.category}</Badge>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title_rw}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{service.description_rw}</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openModal(service)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(service.id)}
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

            {/* Coaches Section */}
            {activeSection === 'coaches' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coaches.map((coach, index) => (
                  <motion.div
                    key={coach.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4 mb-4">
                          {coach.image_url && (
                            <img
                              src={`http://localhost:5000${coach.image_url}`}
                              alt={coach.name}
                              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900">{coach.name}</h3>
                            <p className="text-indigo-600 font-bold">{coach.sport}</p>
                            <p className="text-sm text-gray-600">{coach.title}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-indigo-600" />
                            <span>{coach.experience_years} years experience</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-indigo-600" />
                            <span>{coach.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-indigo-600" />
                            <span>{coach.phone}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openModal(coach)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(coach.id)}
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

            {/* Jotham Profile Section */}
            {activeSection === 'jotham' && coaches.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {coaches.filter(c => c.name.includes('Jotham')).map(jotham => (
                  <div key={jotham.id} className="space-y-6">
                    {/* Hero Section */}
                    <Card className="border-0 shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                          {jotham.image_url && (
                            <img
                              src={`http://localhost:5000${jotham.image_url}`}
                              alt={jotham.name}
                              className="w-48 h-48 rounded-full object-cover border-8 border-white shadow-2xl"
                            />
                          )}
                          <div className="flex-1 text-center md:text-left">
                            <h1 className="text-5xl font-black mb-2">{jotham.name}</h1>
                            <p className="text-2xl font-bold text-indigo-100 mb-4">{jotham.title}</p>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                              <Badge className="bg-white text-indigo-900 text-lg px-4 py-2">
                                <Trophy className="w-5 h-5 mr-2 inline" />
                                {jotham.experience_years} Years
                              </Badge>
                              <Badge className="bg-white text-indigo-900 text-lg px-4 py-2">
                                <Shield className="w-5 h-5 mr-2 inline" />
                                {jotham.sport}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Biography */}
                    <Card className="border-0 shadow-xl">
                      <CardContent className="p-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-4 flex items-center">
                          <BookOpen className="w-8 h-8 mr-3 text-indigo-600" />
                          Umwirondoro / Biography
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-indigo-600 mb-2">Kinyarwanda</h3>
                            <p className="text-gray-700 leading-relaxed">{jotham.bio_rw}</p>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-indigo-600 mb-2">English</h3>
                            <p className="text-gray-700 leading-relaxed">{jotham.bio_en}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Qualifications */}
                    <Card className="border-0 shadow-xl">
                      <CardContent className="p-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
                          <Award className="w-8 h-8 mr-3 text-indigo-600" />
                          Impamyabumenyi / Qualifications
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {JSON.parse(jotham.qualifications || '[]').map((qual, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
                              <Star className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                              <span className="text-gray-800 font-medium">{qual}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card className="border-0 shadow-xl">
                      <CardContent className="p-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
                          <Trophy className="w-8 h-8 mr-3 text-indigo-600" />
                          Ibyatsinzwe / Achievements
                        </h2>
                        <div className="space-y-3">
                          {JSON.parse(jotham.achievements || '[]').map((achievement, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500"
                            >
                              <Trophy className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                              <span className="text-gray-800 font-medium">{achievement}</span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Specializations */}
                    <Card className="border-0 shadow-xl">
                      <CardContent className="p-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
                          <Target className="w-8 h-8 mr-3 text-indigo-600" />
                          Ubumenyi Bwihariye / Specializations
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {JSON.parse(jotham.specializations || '[]').map((spec, idx) => (
                            <div key={idx} className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl text-center">
                              <Briefcase className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                              <p className="font-bold text-gray-900">{spec}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50">
                      <CardContent className="p-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                              <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-bold text-gray-900">{jotham.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                              <Phone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-bold text-gray-900">{jotham.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Office</p>
                              <p className="font-bold text-gray-900">{jotham.office_location}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      onClick={() => openModal(jotham)}
                      className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black shadow-xl"
                    >
                      <Edit className="w-6 h-6 mr-2" />
                      Edit Jotham's Profile
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Analytics Section */}
            {activeSection === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-5xl font-black mb-2">{services.length}</p>
                    <p className="text-xl font-bold">Total Services</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  <CardContent className="p-8 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-5xl font-black mb-2">{coaches.length}</p>
                    <p className="text-xl font-bold">Total Coaches</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <CardContent className="p-8 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-5xl font-black mb-2">
                      {coaches.reduce((sum, c) => sum + (JSON.parse(c.achievements || '[]').length), 0)}
                    </p>
                    <p className="text-xl font-bold">Total Achievements</p>
                  </CardContent>
                </Card>
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
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {activeSection === 'services' ? 'Service' : 'Coach'}
                </h3>
                <Button onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Upload className="w-5 h-5" />
                          <span>Click to upload image</span>
                        </div>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                    )}
                  </div>
                </div>

                {activeSection === 'services' ? (
                  <>
                    <Input
                      placeholder="Title (Kinyarwanda)"
                      value={formData.title_rw || ''}
                      onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Title (English)"
                      value={formData.title_en || ''}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Description (Kinyarwanda)"
                      value={formData.description_rw || ''}
                      onChange={(e) => setFormData({ ...formData, description_rw: e.target.value })}
                      className="w-full p-3 border rounded-lg min-h-[100px]"
                      required
                    />
                    <textarea
                      placeholder="Description (English)"
                      value={formData.description_en || ''}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      className="w-full p-3 border rounded-lg min-h-[100px]"
                      required
                    />
                    <Input
                      placeholder="Category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Icon"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="Name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Sport"
                      value={formData.sport || ''}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Biography (Kinyarwanda)"
                      value={formData.bio_rw || ''}
                      onChange={(e) => setFormData({ ...formData, bio_rw: e.target.value })}
                      className="w-full p-3 border rounded-lg min-h-[150px]"
                      required
                    />
                    <textarea
                      placeholder="Biography (English)"
                      value={formData.bio_en || ''}
                      onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                      className="w-full p-3 border rounded-lg min-h-[150px]"
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Experience Years"
                      value={formData.experience_years || ''}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Office Location"
                      value={formData.office_location || ''}
                      onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                    />
                    <div>
                      <Label className="text-lg font-semibold text-indigo-700">Aho Utuye (Rwanda) *</Label>
                      <RwandaLocationSelector
                        onLocationChange={(location) => setFormData({...formData, ...location})}
                        required={true}
                      />
                    </div>
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

export default AdminServicesPage;

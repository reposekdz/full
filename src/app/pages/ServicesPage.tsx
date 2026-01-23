import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, BookOpen, Heart, HelpCircle, Search, Calendar, Clock, User, Phone, Mail, MapPin, ChevronRight, Star, Loader2, ArrowLeft, Filter, X, CheckCircle, Building2, Users, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

interface Service {
  id: number;
  name_rw: string;
  name_en: string;
  description_rw: string;
  description_en: string;
  category: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  location?: string;
  schedule?: string;
  is_active: boolean;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services/services');
      const data = await response.json();
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services);
      } else if (Array.isArray(data)) {
        setServices(data);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name_rw.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description_rw.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    return matchesSearch && matchesCategory && service.is_active;
  });

  const libraryServices = filteredServices.filter(s => s.category === 'library');
  const counselingServices = filteredServices.filter(s => s.category === 'counseling');
  const healthServices = filteredServices.filter(s => s.category === 'health');

  const categories = [
    { id: 'all', name: 'Byose', nameEn: 'All', icon: Briefcase, color: 'from-purple-600 to-indigo-600', count: filteredServices.length },
    { id: 'library', name: 'Isomero', nameEn: 'Library', icon: BookOpen, color: 'from-blue-600 to-indigo-600', count: libraryServices.length },
    { id: 'counseling', name: 'Ubujyanama', nameEn: 'Counseling', icon: HelpCircle, color: 'from-green-600 to-emerald-600', count: counselingServices.length },
    { id: 'health', name: 'Ubuvuzi', nameEn: 'Health', icon: Heart, color: 'from-red-600 to-pink-600', count: healthServices.length }
  ];

  const stats = [
    { label: 'Serivisi Zose', value: services.length, icon: Briefcase, color: 'from-purple-600 to-indigo-600' },
    { label: 'Isomero', value: services.filter(s => s.category === 'library').length, icon: BookOpen, color: 'from-blue-600 to-indigo-600' },
    { label: 'Ubujyanama', value: services.filter(s => s.category === 'counseling').length, icon: HelpCircle, color: 'from-green-600 to-emerald-600' },
    { label: 'Ubuvuzi', value: services.filter(s => s.category === 'health').length, icon: Heart, color: 'from-red-600 to-pink-600' }
  ];

  const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
    const colors = {
      library: 'from-blue-500 to-indigo-500',
      counseling: 'from-green-500 to-emerald-500',
      health: 'from-red-500 to-pink-500'
    };
    const schedule = service.schedule ? JSON.parse(service.schedule) : {};

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        className="h-full"
      >
        <Card className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all h-full bg-white overflow-hidden group">
          <div className={`h-2 bg-gradient-to-r ${colors[service.category as keyof typeof colors] || 'from-gray-500 to-gray-600'}`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge className={`mb-3 bg-gradient-to-r ${colors[service.category as keyof typeof colors]} text-white border-0`}>
                  {service.category === 'library' ? 'Isomero' : service.category === 'counseling' ? 'Ubujyanama' : 'Ubuvuzi'}
                </Badge>
                <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{service.name_rw}</h3>
                <p className="text-gray-600 font-semibold mb-3">{service.name_en}</p>
                <p className="text-sm text-gray-700 line-clamp-3 mb-4">{service.description_rw}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {service.contact_person && (
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-700">{service.contact_person}</span>
                </div>
              )}
              {schedule.days && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">{schedule.days}</span>
                </div>
              )}
              {schedule.hours && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">{schedule.hours}</span>
                </div>
              )}
              {service.location && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">{service.location}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedService(service)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold"
              >
                Reba Byinshi
              </Button>
              <Button
                onClick={() => { setSelectedService(service); setShowRequestModal(true); }}
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold"
              >
                Saba
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-700">Gutegura Serivisi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => onNavigate('home')}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Subira
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <Briefcase className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-3">Serivisi z'Ishuri</h1>
            <p className="text-xl font-semibold text-white/90">Isomero, Ubujyanama n'Ubuvuzi - Serivisi Zose Zihari</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-2 text-center">{stat.value}</p>
              <p className="text-sm font-bold text-gray-600 text-center">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-black text-gray-900">Shakisha Serivisi</h3>
          </div>
          <Input
            placeholder="Andika izina rya serivisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500"
          />
        </motion.div>

        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveCategory(category.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-br ' + category.color + ' text-white border-transparent shadow-2xl scale-105'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:shadow-xl'
              }`}
            >
              <category.icon className={`w-10 h-10 mx-auto mb-3 ${activeCategory === category.id ? 'text-white' : 'text-gray-600'}`} />
              <p className="font-black text-lg mb-1">{category.name}</p>
              <p className={`text-sm font-semibold ${activeCategory === category.id ? 'text-white/80' : 'text-gray-500'}`}>
                {category.count} Serivisi
              </p>
            </motion.button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Nta serivisi zabonetse</h3>
            <p className="text-gray-600">Gerageza gushakisha izindi serivisi</p>
          </motion.div>
        )}
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && !showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-black mb-2">{selectedService.name_rw}</h2>
                    <p className="text-xl font-semibold text-white/90">{selectedService.name_en}</p>
                  </div>
                  <Button
                    onClick={() => setSelectedService(null)}
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-gray-900 mb-3">Ibisobanuro</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedService.description_rw}</p>
                </div>

                {selectedService.contact_person && (
                  <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-black text-gray-900 mb-4">Amakuru y'Itumanaho</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-gray-900">{selectedService.contact_person}</span>
                      </div>
                      {selectedService.contact_email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700">{selectedService.contact_email}</span>
                        </div>
                      )}
                      {selectedService.contact_phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700">{selectedService.contact_phone}</span>
                        </div>
                      )}
                      {selectedService.location && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700">{selectedService.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowRequestModal(true)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-12"
                  >
                    Saba Serivisi
                  </Button>
                  <Button
                    onClick={() => setSelectedService(null)}
                    variant="outline"
                    className="border-2 border-gray-300 font-bold h-12"
                  >
                    Funga
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black">Saba Serivisi</h2>
                  <Button
                    onClick={() => setShowRequestModal(false)}
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-gray-900 mb-2">Icyifuzo Cyoherejwe!</h3>
                  <p className="text-gray-600">Icyifuzo cyawe cyo gukoresha <span className="font-bold">{selectedService.name_rw}</span> cyoherejwe neza. Tuzakumenyesha vuba.</p>
                </div>

                <Button
                  onClick={() => { setShowRequestModal(false); setSelectedService(null); }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold h-12"
                >
                  Siga
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesPage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, BookOpen, Heart, HelpCircle, Search, Calendar, Clock, User, Phone, Mail, MapPin, ChevronRight, Star, Loader2, ArrowLeft, Filter, X, CheckCircle, Building2, Users, Award, TrendingUp, Eye, ThumbsUp, MessageCircle, Share2, SlidersHorizontal, Download, Bookmark, Bell, Zap, Target, Shield } from 'lucide-react';
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'popular' | 'recent'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bookmarkedServices, setBookmarkedServices] = useState<number[]>([]);
  const [serviceRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services-advanced/services');
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
  const cleaningServices = filteredServices.filter(s => s.category === 'cleaning');

  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'name') return a.name_rw.localeCompare(b.name_rw);
    if (sortBy === 'popular') return (serviceRatings[b.id] || 0) - (serviceRatings[a.id] || 0);
    return b.id - a.id; // recent
  });

  const toggleBookmark = (serviceId: number) => {
    setBookmarkedServices(prev => 
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const categories = [
    { id: 'all', name: 'Byose', nameEn: 'All', icon: Briefcase, color: 'from-green-600 to-yellow-500', count: filteredServices.length },
    { id: 'library', name: 'Isomero', nameEn: 'Library', icon: BookOpen, color: 'from-green-500 to-lime-400', count: libraryServices.length },
    { id: 'counseling', name: 'Ubujyanama', nameEn: 'Counseling', icon: HelpCircle, color: 'from-yellow-500 to-green-500', count: counselingServices.length },
    { id: 'health', name: 'Ubuvuzi', nameEn: 'Health', icon: Heart, color: 'from-lime-500 to-yellow-400', count: healthServices.length }
  ];

  const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
    const colors = {
      library: 'from-green-500 to-lime-400',
      counseling: 'from-yellow-500 to-green-500',
      health: 'from-lime-500 to-yellow-400'
    };
    
    const rating = serviceRatings[service.id] || (4 + Math.random());
    const isBookmarked = bookmarkedServices.includes(service.id);
    
    // Safely parse schedule - handle both string and object
    let schedule: any = {};
    if (service.schedule) {
      try {
        if (typeof service.schedule === 'string') {
          schedule = JSON.parse(service.schedule);
        } else if (typeof service.schedule === 'object') {
          schedule = service.schedule;
        }
      } catch (e) {
        console.warn('Schedule parsing error:', e);
        schedule = {};
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        className="h-full"
      >
        <Card className="border-2 border-green-200 hover:border-yellow-400 hover:shadow-2xl transition-all h-full bg-gradient-to-br from-white via-green-50 to-yellow-50 overflow-hidden group">
          <div className={`h-2 bg-gradient-to-r ${colors[service.category as keyof typeof colors] || 'from-gray-500 to-gray-600'}`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`bg-gradient-to-r ${colors[service.category as keyof typeof colors]} text-white border-0`}>
                    {service.category === 'library' ? 'Isomero' : service.category === 'counseling' ? 'Ubujyanama' : 'Ubuvuzi'}
                  </Badge>
                  <button onClick={(e) => { e.stopPropagation(); toggleBookmark(service.id); }} className="p-2 hover:bg-green-100 rounded-full transition-colors">
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-green-600 text-green-600' : 'text-gray-400'}`} />
                  </button>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{service.name_rw}</h3>
                <p className="text-gray-600 font-semibold mb-2">{service.name_en}</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-700">{rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({Math.floor(Math.random() * 100 + 20)} amasuzuma)</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3 mb-4">{service.description_rw}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {service.contact_person && (
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-gray-700">{service.contact_person}</span>
                </div>
              )}
              {schedule.days && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">{schedule.days}</span>
                </div>
              )}
              {schedule.hours && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">{schedule.hours}</span>
                </div>
              )}
              {service.location && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">{service.location}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedService(service)}
                className="flex-1 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white font-bold"
              >
                Reba Byinshi
              </Button>
              <Button
                onClick={() => { setSelectedService(service); setShowRequestModal(true); }}
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold"
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-700">Gutegura Serivisi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-lime-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-yellow-500 to-lime-500 text-white py-20 px-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
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

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative">
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
        {/* Quick Stats Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-green-600 to-yellow-500 rounded-3xl shadow-2xl p-6 mb-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-black mb-1">{services.length}</p>
              <p className="text-sm font-semibold text-white/80">Serivisi Zitandukanye</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-black mb-1">500+</p>
              <p className="text-sm font-semibold text-white/80">Abanyeshuri Bakoresheje</p>
            </div>
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-black mb-1">98%</p>
              <p className="text-sm font-semibold text-white/80">Ibyishimikazi</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-black mb-1">24/7</p>
              <p className="text-sm font-semibold text-white/80">Ubufasha Buhoraho</p>
            </div>
          </div>
        </motion.div>

        {/* Advanced Search & Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Search className="w-6 h-6 text-green-600" />
              <h3 className="text-2xl font-black text-gray-900">Shakisha Serivisi</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="border-green-600 text-green-600">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="border-green-600 text-green-600">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <Input
            placeholder="Andika izina rya serivisi, ibisobanuro, cyangwa ijambo ryibanze..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 text-lg border-2 border-gray-200 focus:border-green-500 mb-4"
          />
          
          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t-2 border-gray-100 pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Itondekanya</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full h-10 border-2 border-gray-200 rounded-lg px-3 focus:border-green-500">
                      <option value="popular">Izikunzwe Cyane</option>
                      <option value="name">Izina (A-Z)</option>
                      <option value="recent">Nshya</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Uburyo bwo Kureba</label>
                    <div className="flex gap-2">
                      <Button variant={viewMode === 'grid' ? 'default' : 'outline'} onClick={() => setViewMode('grid')} className="flex-1">Grid</Button>
                      <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')} className="flex-1">List</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Amanota</label>
                    <select className="w-full h-10 border-2 border-gray-200 rounded-lg px-3 focus:border-green-500">
                      <option>Byose</option>
                      <option>5 Inyenyeri</option>
                      <option>4+ Inyenyeri</option>
                      <option>3+ Inyenyeri</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                  : 'bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:shadow-xl'
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

        {/* Services Grid/List */}
        {sortedServices.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-lg font-bold text-gray-700">{sortedServices.length} Serivisi Zabonetse</p>
              {bookmarkedServices.length > 0 && (
                <Button variant="outline" size="sm" className="border-green-600 text-green-600">
                  <Bookmark className="w-4 h-4 mr-2" />
                  {bookmarkedServices.length} Zabitswe
                </Button>
              )}
            </div>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {sortedServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Nta serivisi zabonetse</h3>
            <p className="text-gray-600">Gerageza gushakisha izindi serivisi</p>
          </motion.div>
        )}
      </div>

      {/* Service Detail Modal - Full Screen */}
      <AnimatePresence>
        {selectedService && !showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-green-50 via-yellow-50 to-lime-50 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-yellow-500 text-white shadow-2xl z-10">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setSelectedService(null)}
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Subira
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                      <Share2 className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                      <ThumbsUp className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-green-200"
              >
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-yellow-400 flex items-center justify-center shadow-xl">
                    {selectedService.category === 'library' && <BookOpen className="w-12 h-12 text-white" />}
                    {selectedService.category === 'counseling' && <HelpCircle className="w-12 h-12 text-white" />}
                    {selectedService.category === 'health' && <Heart className="w-12 h-12 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-gradient-to-r from-green-600 to-yellow-500 text-white">
                        {selectedService.category === 'library' ? 'Isomero' : selectedService.category === 'counseling' ? 'Ubujyanama' : 'Ubuvuzi'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-2 text-lg font-bold text-gray-700">4.8</span>
                      </div>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-3">{selectedService.name_rw}</h1>
                    <p className="text-2xl font-semibold text-gray-600 mb-4">{selectedService.name_en}</p>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => setShowRequestModal(true)}
                        className="bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white font-bold px-8 py-6 text-lg"
                      >
                        Saba Serivisi Ubu
                      </Button>
                      <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold px-8 py-6 text-lg">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Vugana Natwe
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-100"
                  >
                    <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                      <Eye className="w-8 h-8 text-green-600" />
                      Ibisobanuro Birambuye
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">{selectedService.description_rw}</p>
                    <p className="text-gray-600 leading-relaxed">{selectedService.description_en}</p>
                  </motion.div>

                  {/* Features */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-100"
                  >
                    <h2 className="text-3xl font-black text-gray-900 mb-6">Ibintu by'Ingenzi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Serivisi Nziza Cyane',
                        'Abakozi Bafite Ubunararibonye',
                        'Igihe Cyose Turi Hano',
                        'Ibiciro Byiza',
                        'Ubwiza bw\'Akazi',
                        'Kwizera no Guhora Dufasha'
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl">
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                          <span className="font-semibold text-gray-800">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  {selectedService.contact_person && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-3xl shadow-xl p-6 border-2 border-green-100"
                    >
                      <h3 className="text-2xl font-black text-gray-900 mb-4">Amakuru y'Itumanaho</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                          <User className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-gray-900">{selectedService.contact_person}</span>
                        </div>
                        {selectedService.contact_email && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <Mail className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700 text-sm">{selectedService.contact_email}</span>
                          </div>
                        )}
                        {selectedService.contact_phone && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <Phone className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">{selectedService.contact_phone}</span>
                          </div>
                        )}
                        {selectedService.location && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">{selectedService.location}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-600 to-yellow-500 rounded-3xl shadow-xl p-6 text-white"
                  >
                    <h3 className="text-2xl font-black mb-4">Saba Ubu</h3>
                    <p className="mb-6 text-white/90">Saba serivisi yacu uyu munsi kandi uzabona ubufasha bwihuse!</p>
                    <Button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full bg-white text-green-700 hover:bg-gray-100 font-bold h-12"
                    >
                      Saba Serivisi
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
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

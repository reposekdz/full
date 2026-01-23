import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, BookOpen, Users, Trophy, Star, Award, Mail, Phone, MapPin, Shield, Target, Briefcase, ChevronRight, Image as ImageIcon } from 'lucide-react';

const EnhancedServicesPage = () => {
  const [services, setServices] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCoach, setSelectedCoach] = useState(null);

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

  const categories = ['all', ...new Set(services.map(s => s.category))];
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title_rw.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description_rw.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const jotham = coaches.find(c => c.name.includes('Jotham'));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-indigo-600">Tegereza...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-6xl font-black mb-4">Serivisi Zacu</h1>
            <p className="text-2xl font-bold text-indigo-100">Garden TVET School - Excellence in Education & Sports</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Jotham Profile Showcase */}
        {jotham && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-green-50 to-yellow-50 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-400 to-emerald-500"></div>
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Image */}
                  <div className="lg:w-1/3">
                    {jotham.image_url ? (
                      <img
                        src={`http://localhost:5000${jotham.image_url}`}
                        alt={jotham.name}
                        className="w-full h-96 object-cover rounded-2xl shadow-2xl border-8 border-white"
                      />
                    ) : (
                      <div className="w-full h-96 bg-gradient-to-br from-green-400 to-yellow-400 rounded-2xl flex items-center justify-center">
                        <Users className="w-32 h-32 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="lg:w-2/3">
                    <Badge className="mb-4 bg-gradient-to-r from-green-600 to-yellow-500 text-white text-lg px-6 py-2">
                      <Trophy className="w-5 h-5 mr-2 inline" />
                      Umutoza Mukuru
                    </Badge>
                    <h2 className="text-4xl font-black text-gray-900 mb-2">{jotham.name}</h2>
                    <p className="text-2xl font-bold text-green-600 mb-4">{jotham.title}</p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
                        <Shield className="w-4 h-4 mr-2 inline" />
                        {jotham.sport}
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-800 text-base px-4 py-2">
                        <Award className="w-4 h-4 mr-2 inline" />
                        {jotham.experience_years} Imyaka
                      </Badge>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-6 line-clamp-4">{jotham.bio_rw}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-bold text-gray-900">{jotham.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                        <Phone className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-xs text-gray-500">Telefoni</p>
                          <p className="text-sm font-bold text-gray-900">{jotham.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-xs text-gray-500">Ibiro</p>
                          <p className="text-sm font-bold text-gray-900">{jotham.office_location}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedCoach(jotham)}
                      className="w-full bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 hover:from-green-700 hover:via-yellow-600 hover:to-emerald-700 text-white font-black h-14 text-lg shadow-xl"
                    >
                      Reba Byinshi Kuri {jotham.name.split(' ')[0]}
                      <ChevronRight className="w-6 h-6 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
                  <Input
                    placeholder="Shakisha serivisi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-12 text-base border-2 border-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`h-12 px-6 font-bold whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-400'
                      }`}
                    >
                      {cat === 'all' ? 'Byose' : cat}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all h-full">
                {service.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`http://localhost:5000${service.image_url}`}
                      alt={service.title_rw}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    {service.category}
                  </Badge>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title_rw}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{service.description_rw}</p>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                    Menya Byinshi
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* All Coaches Section */}
        {coaches.length > 0 && (
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-8 text-center">Abatoza Bacu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach, index) => (
                <motion.div
                  key={coach.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer" onClick={() => setSelectedCoach(coach)}>
                    <CardContent className="p-6 text-center">
                      {coach.image_url ? (
                        <img
                          src={`http://localhost:5000${coach.image_url}`}
                          alt={coach.name}
                          className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-200"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 mx-auto mb-4 flex items-center justify-center">
                          <Users className="w-16 h-16 text-white" />
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{coach.name}</h3>
                      <p className="text-indigo-600 font-bold mb-2">{coach.sport}</p>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Award className="w-3 h-3 mr-1 inline" />
                        {coach.experience_years} Years
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Coach Detail Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedCoach(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-3 bg-gradient-to-r from-green-500 via-yellow-400 to-emerald-500"></div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {selectedCoach.image_url && (
                  <img
                    src={`http://localhost:5000${selectedCoach.image_url}`}
                    alt={selectedCoach.name}
                    className="w-48 h-48 rounded-full object-cover border-8 border-green-200 shadow-2xl mx-auto md:mx-0"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-4xl font-black text-gray-900 mb-2">{selectedCoach.name}</h2>
                  <p className="text-2xl font-bold text-green-600 mb-4">{selectedCoach.title}</p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge className="bg-green-600 text-white text-base px-4 py-2">
                      {selectedCoach.sport}
                    </Badge>
                    <Badge className="bg-yellow-600 text-white text-base px-4 py-2">
                      {selectedCoach.experience_years} Years Experience
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 flex items-center">
                    <BookOpen className="w-6 h-6 mr-2 text-indigo-600" />
                    Biography
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedCoach.bio_rw}</p>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 flex items-center">
                    <Award className="w-6 h-6 mr-2 text-indigo-600" />
                    Qualifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {JSON.parse(selectedCoach.qualifications || '[]').map((qual, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg">
                        <Star className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-800">{qual}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 flex items-center">
                    <Trophy className="w-6 h-6 mr-2 text-indigo-600" />
                    Achievements
                  </h3>
                  <div className="space-y-2">
                    {JSON.parse(selectedCoach.achievements || '[]').map((achievement, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <Trophy className="w-4 h-4 text-yellow-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-800">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 flex items-center">
                    <Target className="w-6 h-6 mr-2 text-indigo-600" />
                    Specializations
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {JSON.parse(selectedCoach.specializations || '[]').map((spec, idx) => (
                      <div key={idx} className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg text-center">
                        <Briefcase className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                        <p className="text-xs font-bold text-gray-900">{spec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setSelectedCoach(null)}
                className="w-full mt-8 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg"
              >
                Funga
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EnhancedServicesPage;

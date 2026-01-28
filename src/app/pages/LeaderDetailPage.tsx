import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, MapPin, Award, Calendar, Building, Briefcase,
  GraduationCap, Star, Users, MessageCircle, Share2, Download, Video,
  FileText, CheckCircle, Clock, TrendingUp, Target, BookOpen, Sparkles, Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface LeaderDetailPageProps {
  leaderId: number;
  onNavigate: (page: string) => void;
}

interface LeadershipMember {
  id: number;
  name: string;
  role: string;
  department: string;
  biography_en: string;
  biography_rw: string;
  email: string;
  phone: string;
  office_location: string;
  image_url: string;
  experience_years: number;
  status: string;
  display_order: number;
}

const LeaderDetailPage: React.FC<LeaderDetailPageProps> = ({ leaderId, onNavigate }) => {
  const [leader, setLeader] = useState<LeadershipMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'biography' | 'achievements' | 'contact'>('biography');

  useEffect(() => {
    fetchLeaderDetails();
  }, [leaderId]);

  const fetchLeaderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/leadership/${leaderId}`);
      const data = await response.json();
      if (data.success) {
        setLeader(data.leader);
      }
    } catch (error) {
      console.error('Error fetching leader details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-600 border-t-yellow-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg font-bold">Gutegura Amakuru...</p>
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-800 mb-4">Umuyobozi Ntabwo Abonetse</h2>
          <Button onClick={() => onNavigate('leadership')} className="bg-gradient-to-r from-green-600 to-yellow-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Subira
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Uburambe', value: `${leader.experience_years}+`, icon: Award, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Ishami', value: leader.department, icon: Building, color: 'from-green-500 to-green-600' },
    { label: 'Umwanya', value: leader.role, icon: Briefcase, color: 'from-blue-500 to-blue-600' },
    { label: 'Imiterere', value: leader.status, icon: CheckCircle, color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            onClick={() => onNavigate('leadership')}
            className="mb-4 bg-white/20 hover:bg-white/30 text-white border-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Subira ku Buyobozi
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Image & Quick Info */}
            <div className="lg:col-span-1 p-8 bg-gradient-to-br from-yellow-50 to-green-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-green-400 rounded-3xl opacity-20 blur-xl" />
                <img
                  src={`http://localhost:5000${leader.image_url}`}
                  alt={leader.name}
                  className="relative w-full aspect-square object-cover rounded-2xl shadow-2xl border-4 border-white"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>

              <div className="mt-6 text-center">
                <h1 className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                  {leader.name}
                </h1>
                <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white text-lg px-4 py-2">
                  {leader.role}
                </Badge>
              </div>

              <div className="mt-6 space-y-3">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md"
                >
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-bold">Email</p>
                    <p className="text-sm text-gray-800 font-semibold truncate">{leader.email}</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md"
                >
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-bold">Telefoni</p>
                    <p className="text-sm text-gray-800 font-semibold">{leader.phone}</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md"
                >
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-bold">Ibiro</p>
                    <p className="text-sm text-gray-800 font-semibold">{leader.office_location}</p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Tanga Ubutumwa
                </Button>
                <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Side - Detailed Info */}
            <div className="lg:col-span-2 p-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-lg border-2 border-gray-100"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-600 font-bold">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
                {['biography', 'achievements', 'contact'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-3 px-6 rounded-xl font-black transition-all ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-green-600 to-yellow-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab === 'biography' && 'Amateka'}
                    {tab === 'achievements' && 'Ibirangwa'}
                    {tab === 'contact' && 'Vugana'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'biography' && (
                  <motion.div
                    key="biography"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <Card className="border-none shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
                        <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                          <BookOpen className="w-6 h-6 text-green-600" />
                          Amateka mu Cyongereza
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {leader.biography_en || 'No English biography available.'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
                        <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                          <BookOpen className="w-6 h-6 text-yellow-600" />
                          Amateka mu Kinyarwanda
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {leader.biography_rw || 'Nta mateka aboneka mu Kinyarwanda.'}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card className="border-none shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
                        <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                          <Trophy className="w-6 h-6 text-yellow-600" />
                          Ibirangwa & Amahugurwa
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-white rounded-xl">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                              <Star className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-black text-gray-800 mb-1">Uburambe bw'Imyaka {leader.experience_years}+</h3>
                              <p className="text-gray-600">Uburambe bwinshi mu bijyanye n'uburezi na TVET</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl">
                            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                              <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-black text-gray-800 mb-1">Ubuyobozi bw'Inararibonye</h3>
                              <p className="text-gray-600">Guhugura no kuyobora abanyeshuri benshi</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-black text-gray-800 mb-1">Guteza Imbere Ishuri</h3>
                              <p className="text-gray-600">Gufasha abanyeshuri kugera ku ntego zabo</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'contact' && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card className="border-none shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
                        <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                          <MessageCircle className="w-6 h-6 text-green-600" />
                          Amakuru yo Kuvugana
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-r from-green-50 to-white rounded-xl">
                            <label className="text-sm font-black text-gray-600 mb-2 block">Email</label>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-800">{leader.email}</span>
                              <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700">
                                <Mail className="w-4 h-4 mr-2" />
                                Ohereza
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl">
                            <label className="text-sm font-black text-gray-600 mb-2 block">Telefoni</label>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-800">{leader.phone}</span>
                              <Button size="sm" className="bg-gradient-to-r from-yellow-600 to-yellow-700">
                                <Phone className="w-4 h-4 mr-2" />
                                Hamagara
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl">
                            <label className="text-sm font-black text-gray-600 mb-2 block">Aho Ari</label>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-800">{leader.office_location}</span>
                              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700">
                                <MapPin className="w-4 h-4 mr-2" />
                                Erekana
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-xl">
                            <label className="text-sm font-black text-gray-600 mb-2 block">Ishami</label>
                            <span className="text-lg font-bold text-gray-800">{leader.department}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderDetailPage;

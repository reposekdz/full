import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Award, BookOpen, Briefcase, Star, Clock, CheckCircle, Users, TrendingUp, Target, Zap, Calendar, DollarSign, Globe, MessageSquare, ThumbsUp, Eye, Share2, Download, Filter, Search, ChevronDown, ChevronUp, ExternalLink, Heart, Bookmark } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';

interface LeaderDetailPageProps {
  leaderId: string;
  onNavigate: (page: string) => void;
}

interface Leader {
  id: number;
  name: string;
  role: string;
  department: string;
  biography_rw: string;
  email: string;
  phone: string;
  office_location: string;
  image_url: string;
  qualifications: string[] | string;
  experience_years: number;
  specialization: string;
  achievements: string[] | string;
  responsibilities: string[] | string;
  office_hours?: string;
}

const LeaderDetailPage: React.FC<LeaderDetailPageProps> = ({ leaderId, onNavigate }) => {
  const [leader, setLeader] = useState<Leader | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['bio']);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [views, setViews] = useState(0);

  useEffect(() => {
    fetchLeader();
    setViews(Math.floor(Math.random() * 5000) + 1000);
  }, [leaderId]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const fetchLeader = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/leadership/${leaderId}`);
      const data = await response.json();
      setLeader(data);
    } catch (error) {
      console.error('Error fetching leader:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseJSON = (data: string[] | string): string[] => {
    if (Array.isArray(data)) return data;
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Gukuramo amakuru...</p>
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nta makuru aboneka</p>
          <Button onClick={() => onNavigate('leadership')} className="mt-4">
            Subira ku bayobozi
          </Button>
        </div>
      </div>
    );
  }

  const qualifications = parseJSON(leader.qualifications);
  const achievements = parseJSON(leader.achievements);
  const responsibilities = parseJSON(leader.responsibilities);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      <div className="bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-600 text-white py-12 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => onNavigate('leadership')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Subira ku bayobozi
            </Button>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setLiked(!liked)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-sm font-bold">Kunda</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setBookmarked(!bookmarked)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-yellow-300 text-yellow-300' : ''}`} />
                <span className="text-sm font-bold">Bika</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-bold">Sangira</span>
              </motion.button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="relative"
            >
              <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <img
                  src={`http://localhost:5000${leader.image_url}`}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full flex items-center justify-center shadow-xl"
              >
                <Star className="w-8 h-8 text-white fill-current" />
              </motion.div>
            </motion.div>
            
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-3"
              >
                <h1 className="text-5xl font-black">{leader.name}</h1>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-8 h-8 text-yellow-300" />
                </motion.div>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl text-yellow-100 font-bold mb-4"
              >
                {leader.role}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 mb-4"
              >
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-semibold">{leader.email}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-semibold">{leader.phone}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-semibold">{leader.office_location}</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-6"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span className="text-lg font-bold">{views.toLocaleString()} Abareba</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-lg font-bold">{leader.experience_years}+ Imyaka</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-lg font-bold">98% Imikorere</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 gap-2 bg-white p-2 rounded-2xl shadow-xl">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-green-400 data-[state=active]:text-white font-bold">
              <BookOpen className="w-4 h-4 mr-2" />
              Amateka
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-green-400 data-[state=active]:text-white font-bold">
              <Award className="w-4 h-4 mr-2" />
              Impamyabumenyi
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-green-400 data-[state=active]:text-white font-bold">
              <Star className="w-4 h-4 mr-2" />
              Intsinzi
            </TabsTrigger>
            <TabsTrigger value="responsibilities" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-green-400 data-[state=active]:text-white font-bold">
              <Briefcase className="w-4 h-4 mr-2" />
              Inshingano
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-green-400 data-[state=active]:text-white font-bold">
              <TrendingUp className="w-4 h-4 mr-2" />
              Imibare
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-green-400 data-[state=active]:text-white font-bold">
              <MessageSquare className="w-4 h-4 mr-2" />
              Vugana
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-yellow-600" />
                  Amateka Yihariye
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSection('bio')}
                  className="rounded-full"
                >
                  {expandedSections.includes('bio') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              
              <AnimatePresence>
                {expandedSections.includes('bio') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line leading-relaxed"
                  >
                    {leader.biography_rw}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-6">
            {qualifications.map((qual, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-green-400 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-black text-xl">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-bold text-lg">{qual}</p>
                  </div>
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="achievements" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="bg-gradient-to-br from-yellow-100 via-white to-green-100 rounded-2xl p-6 shadow-xl border-2 border-yellow-300"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-green-400 flex items-center justify-center shadow-lg">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                </div>
                <p className="text-gray-900 font-bold text-lg">{achievement}</p>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="responsibilities" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responsibilities.map((resp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-500"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-gray-800 font-semibold text-sm">{resp}</p>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Uburambe', value: `${leader.experience_years}+`, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
                { label: 'Imishinga', value: '50+', icon: Target, color: 'from-green-500 to-emerald-500' },
                { label: 'Ibihembo', value: achievements.length, icon: Trophy, color: 'from-yellow-500 to-orange-500' },
                { label: 'Imikorere', value: '98%', icon: TrendingUp, color: 'from-purple-500 to-pink-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-white rounded-2xl p-6 shadow-xl"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-4xl font-black text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-gray-600 font-semibold">{stat.label}</p>
                  <Progress value={85} className="mt-3" />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-green-600" />
                Vugana Nawe
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Mail, label: 'Email', value: leader.email, color: 'yellow' },
                  { icon: Phone, label: 'Telefone', value: leader.phone, color: 'green' },
                  { icon: MapPin, label: 'Ibiro', value: leader.office_location, color: 'blue' },
                  { icon: Clock, label: 'Igihe', value: leader.office_hours || 'Ku wa mbere - Ku wa gatanu: 8:00 - 17:00', color: 'purple' }
                ].map((contact, index) => (
                  <motion.div
                    key={contact.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 10 }}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 shadow-lg border-l-4 border-green-500"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-${contact.color}-400 to-${contact.color}-600 flex items-center justify-center shadow-lg`}>
                        <contact.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold mb-1">{contact.label}</p>
                        <p className="text-gray-900 font-bold">{contact.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LeaderDetailPage;

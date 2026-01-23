import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Mail, Phone, MapPin, Award, BookOpen, 
  Briefcase, Star, Clock, Building
} from 'lucide-react';

interface LeadershipMember {
  id: number;
  name: string;
  role: string;
  department: string;
  biography_rw: string;
  biography_en: string;
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

const LeadershipPage: React.FC = () => {
  const [leaders, setLeaders] = useState<LeadershipMember[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<LeadershipMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'rw' | 'en'>('rw');

  useEffect(() => {
    fetchLeadership();
  }, []);

  const fetchLeadership = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leadership');
      const data = await response.json();
      const leadersArray = Array.isArray(data) ? data : [];
      setLeaders(leadersArray);
      if (leadersArray.length > 0) setSelectedLeader(leadersArray[0]);
    } catch (error) {
      console.error('Error fetching leadership:', error);
      setLeaders([]);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Gutegura Ubuyobozi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-12 h-12 text-white" />
              <h1 className="text-5xl font-black text-white">UBUYOBOZI</h1>
            </div>
            <p className="text-xl text-white/90 font-semibold">Abayobozi b'Ishuri rya Garden TVET School</p>
            
            <div className="mt-6 flex justify-center gap-2">
              <button onClick={() => setLanguage('rw')} className={`px-6 py-2 rounded-full font-bold transition-all ${language === 'rw' ? 'bg-white text-green-600 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                Kinyarwanda
              </button>
              <button onClick={() => setLanguage('en')} className={`px-6 py-2 rounded-full font-bold transition-all ${language === 'en' ? 'bg-white text-green-600 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                English
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leadership List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Building className="w-6 h-6 text-yellow-600" />
                Abayobozi
              </h2>
              <div className="space-y-4">
                {leaders && leaders.length > 0 ? leaders.map((leader) => (
                  <motion.div key={leader.id} whileHover={{ scale: 1.02 }} onClick={() => setSelectedLeader(leader)} className={`p-4 rounded-2xl cursor-pointer transition-all ${selectedLeader?.id === leader.id ? 'bg-gradient-to-r from-yellow-400 to-green-400 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                        <img src={`http://localhost:5000${leader.image_url}`} alt={leader.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{leader.name}</h3>
                        <p className={`text-xs truncate ${selectedLeader?.id === leader.id ? 'text-white/90' : 'text-gray-600'}`}>{leader.department}</p>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nta bayobozi babonetse</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leader Details */}
          {selectedLeader && (
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-green-400 p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                        <img src={`http://localhost:5000${selectedLeader.image_url}`} alt={selectedLeader.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                      </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h2 className="text-3xl font-black text-white mb-2">{selectedLeader.name}</h2>
                      <p className="text-xl font-bold text-white/90 mb-3">{selectedLeader.role}</p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">{selectedLeader.department}</span>
                        <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {selectedLeader.experience_years}+ {language === 'rw' ? 'Imyaka' : 'Years'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                      <Mail className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Email</p>
                        <a href={`mailto:${selectedLeader.email}`} className="text-sm text-gray-900 hover:text-green-600 font-medium">{selectedLeader.email}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Telefone</p>
                        <a href={`tel:${selectedLeader.phone}`} className="text-sm text-gray-900 hover:text-green-600 font-medium">{selectedLeader.phone}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                      <MapPin className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Ibiro</p>
                        <p className="text-sm text-gray-900 font-medium">{selectedLeader.office_location}</p>
                      </div>
                    </div>
                    {selectedLeader.office_hours && (
                      <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Igihe cyo Kumubona</p>
                          <p className="text-sm text-gray-900 font-medium">{selectedLeader.office_hours}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Biography */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-yellow-600" />
                  {language === 'rw' ? 'Amateka' : 'Biography'}
                </h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{language === 'rw' ? selectedLeader.biography_rw : selectedLeader.biography_en}</p>
                </div>
              </motion.div>

              {/* Qualifications */}
              {(() => {
                const quals = parseJSON(selectedLeader.qualifications);
                return quals.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-xl p-8">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <Award className="w-6 h-6 text-green-600" />
                      {language === 'rw' ? 'Impamyabumenyi' : 'Qualifications'}
                    </h3>
                    <div className="space-y-3">
                      {quals.map((qual: string, index: number) => (
                        <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-green-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 font-medium flex-1">{qual}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Achievements */}
              {(() => {
                const achievs = parseJSON(selectedLeader.achievements);
                return achievs.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl shadow-xl p-8">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-600" />
                      {language === 'rw' ? 'Intsinzi' : 'Achievements'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievs.map((achievement: string, index: number) => (
                        <motion.div key={index} whileHover={{ scale: 1.05 }} className="p-4 bg-gradient-to-br from-yellow-100 to-green-100 rounded-xl border-2 border-yellow-300 shadow-sm">
                          <div className="flex items-center gap-3">
                            <Award className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                            <p className="text-gray-800 font-semibold text-sm">{achievement}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Responsibilities */}
              {(() => {
                const resps = parseJSON(selectedLeader.responsibilities);
                return resps.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-xl p-8">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-green-600" />
                      {language === 'rw' ? 'Inshingano' : 'Responsibilities'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {resps.map((resp: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-green-400"></div>
                          <p className="text-gray-700 text-sm font-medium">{resp}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadershipPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Award, Clock, Briefcase, Target, Star } from 'lucide-react';

interface LeaderDetailProps {
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
  qualifications: string;
  experience_years: number;
  specialization: string;
  achievements: string;
  responsibilities: string;
  office_hours: string;
}

const LeaderDetailPage: React.FC<LeaderDetailProps> = ({ leaderId, onNavigate }) => {
  const [leader, setLeader] = useState<Leader | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeader();
  }, [leaderId]);

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

  const parseJSON = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Gutegura amakuru...</p>
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Nta makuru abonetse</p>
      </div>
    );
  }

  const isPatron = leader.role === 'Patron';
  const qualifications = parseJSON(leader.qualifications);
  const achievements = parseJSON(leader.achievements);
  const responsibilities = parseJSON(leader.responsibilities);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      <div className={`bg-gradient-to-r ${isPatron ? 'from-yellow-500 via-amber-400 to-yellow-500' : 'from-yellow-400 via-green-400 to-yellow-500'} py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onNavigate('leadership')}
            className="flex items-center gap-2 text-white font-bold mb-6 hover:gap-4 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
            Subira ku Buyobozi
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className={`sticky top-8 bg-gradient-to-br ${isPatron ? 'from-yellow-100 via-amber-50 to-yellow-100' : 'from-white via-yellow-50 to-green-50'} rounded-3xl shadow-2xl overflow-hidden ${isPatron ? 'ring-4 ring-yellow-400' : ''}`}>
              {isPatron && (
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 text-center">
                  <span className="text-white font-black text-sm uppercase tracking-wider">👑 Patron</span>
                </div>
              )}
              <div className="relative h-96">
                <img
                  src={`http://localhost:5000${leader.image_url}`}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-6">
                <h1 className="text-3xl font-black text-gray-900 mb-2">{leader.name}</h1>
                <p className={`text-lg font-bold ${isPatron ? 'text-yellow-600' : 'text-green-600'} mb-4`}>{leader.role}</p>
                <div className={`inline-block px-4 py-2 bg-gradient-to-r ${isPatron ? 'from-yellow-400 to-amber-400' : 'from-yellow-400 to-green-400'} rounded-full text-white font-bold text-sm mb-6`}>
                  {leader.department}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className={`w-5 h-5 ${isPatron ? 'text-yellow-600' : 'text-green-600'} mt-1`} />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Imeli</p>
                      <p className="text-sm text-gray-800">{leader.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className={`w-5 h-5 ${isPatron ? 'text-yellow-600' : 'text-green-600'} mt-1`} />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Telefoni</p>
                      <p className="text-sm text-gray-800">{leader.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className={`w-5 h-5 ${isPatron ? 'text-yellow-600' : 'text-green-600'} mt-1`} />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Ibiro</p>
                      <p className="text-sm text-gray-800">{leader.office_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className={`w-5 h-5 ${isPatron ? 'text-yellow-600' : 'text-green-600'} mt-1`} />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Amasaha y'Akazi</p>
                      <p className="text-sm text-gray-800">{leader.office_hours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className={`w-5 h-5 ${isPatron ? 'text-yellow-600' : 'text-green-600'} mt-1`} />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Uburambe</p>
                      <p className="text-sm text-gray-800">{leader.experience_years}+ Imyaka</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className={`w-8 h-8 ${isPatron ? 'text-yellow-600' : 'text-green-600'}`} />
                <h2 className="text-2xl font-black text-gray-900">Umwirondoro</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                {leader.biography_rw.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4 text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className={`w-8 h-8 ${isPatron ? 'text-yellow-600' : 'text-green-600'}`} />
                <h2 className="text-2xl font-black text-gray-900">Ubushobozi n'Amashuri</h2>
              </div>
              <div className="space-y-3">
                {qualifications.map((qual: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-3 p-4 bg-gradient-to-r ${isPatron ? 'from-yellow-50 to-amber-50' : 'from-yellow-50 to-green-50'} rounded-xl`}
                  >
                    <div className={`w-2 h-2 ${isPatron ? 'bg-yellow-500' : 'bg-green-500'} rounded-full mt-2`} />
                    <p className="text-gray-800 flex-1">{qual}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {leader.specialization && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Star className={`w-8 h-8 ${isPatron ? 'text-yellow-600' : 'text-green-600'}`} />
                  <h2 className="text-2xl font-black text-gray-900">Ubuhanga Bwihariye</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{leader.specialization}</p>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className={`w-8 h-8 ${isPatron ? 'text-yellow-600' : 'text-green-600'}`} />
                <h2 className="text-2xl font-black text-gray-900">Ibyagezweho</h2>
              </div>
              <div className="space-y-3">
                {achievements.map((achievement: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-3 p-4 bg-gradient-to-r ${isPatron ? 'from-yellow-50 to-amber-50' : 'from-yellow-50 to-green-50'} rounded-xl`}
                  >
                    <div className={`w-2 h-2 ${isPatron ? 'bg-yellow-500' : 'bg-green-500'} rounded-full mt-2`} />
                    <p className="text-gray-800 flex-1">{achievement}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className={`w-8 h-8 ${isPatron ? 'text-yellow-600' : 'text-green-600'}`} />
                <h2 className="text-2xl font-black text-gray-900">Inshingano</h2>
              </div>
              <div className="space-y-3">
                {responsibilities.map((responsibility: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-3 p-4 bg-gradient-to-r ${isPatron ? 'from-yellow-50 to-amber-50' : 'from-yellow-50 to-green-50'} rounded-xl`}
                  >
                    <div className={`w-2 h-2 ${isPatron ? 'bg-yellow-500' : 'bg-green-500'} rounded-full mt-2`} />
                    <p className="text-gray-800 flex-1">{responsibility}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LeaderDetailPage;

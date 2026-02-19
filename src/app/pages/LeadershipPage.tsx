import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowRight, Mail, Phone, MapPin, Award, Sparkles } from 'lucide-react';

interface LeadershipPageProps {
  onNavigate: (page: string) => void;
}

interface LeadershipMember {
  id: number;
  name: string;
  role: string;
  department: string;
  biography_rw: string;
  email: string;
  phone: string;
  office_location: string;
  image_url: string;
  experience_years: number;
}

const LeadershipPage: React.FC<LeadershipPageProps> = ({ onNavigate }) => {
  const [leaders, setLeaders] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadership();
  }, []);

  const fetchLeadership = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leadership');
      const data = await response.json();
      console.log('Leadership API response:', data);
      const leadersData = data.leaders || data || [];
      
      // Show ALL leaders with or without images - use placeholder if no image
      const leadersWithFallback = leadersData.map((leader: any) => ({
        ...leader,
        hasImage: !!leader.image_url
      }));
      console.log('Total leaders:', leadersWithFallback.length);
      console.log('Image URLs:', leadersWithFallback.map((l: any) => l.image_url));
      
      const roleOrder = {
        'Umwene Ishuri': 1,
        'School Owner': 1,
        'Umujyanama': 2,
        'Advisor': 2,
        'advisor': 2,
        'DOS': 3,
        'Umubitsi': 4,
        'Accountant': 4,
        'Umuyobozi Mukuru': 5,
        'Head Teacher': 5,
        'Headmaster': 5,
        'Patron': 6,
        'DOD': 7,
        'Matron': 8
      };
      const sortedData = Array.isArray(leadersWithFallback) ? leadersWithFallback.sort((a, b) => {
        const aOrder = roleOrder[a.role] || 999;
        const bOrder = roleOrder[b.role] || 999;
        return aOrder - bOrder;
      }) : [];
      setLeaders(sortedData);
    } catch (error) {
      console.error('Error fetching leadership:', error);
      setLeaders([]);
    } finally {
      setLoading(false);
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
      <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-12 h-12 text-white" />
              <h1 className="text-5xl font-black text-white">UBUYOBOZI</h1>
            </div>
            <p className="text-xl text-white/90 font-semibold">Abayobozi b'Ishuri rya Garden TVET School</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {leaders.map((leader, index) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 30, rotateY: -15 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -15, scale: 1.05, rotateY: 5 }}
              onClick={() => onNavigate(`leader/${leader.id}`)}
              className="relative bg-gradient-to-br from-white via-yellow-50 to-green-50 rounded-3xl shadow-2xl overflow-hidden cursor-pointer group perspective-1000"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="absolute top-4 right-4 z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-green-400 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              </div>

              <div className="relative h-72 overflow-hidden bg-gray-200">
                {leader.image_url ? (
                  <motion.img
                    src={`http://localhost:5000${encodeURI(leader.image_url)}`}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Leader image failed:', leader.image_url);
                      // Show placeholder on error
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    whileHover={{ scale: 1.15, rotate: 2 }}
                    transition={{ duration: 0.6 }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-green-400 to-yellow-500 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <div className="w-24 h-24 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-5xl font-black">{leader.name?.charAt(0) || 'L'}</span>
                      </div>
                      <p className="text-sm font-bold opacity-80">Nta ifoto</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-green-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.h3
                    className="text-2xl font-black text-white mb-2 drop-shadow-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.2 }}
                  >
                    {leader.name}
                  </motion.h3>
                  <motion.p
                    className="text-sm text-yellow-300 font-bold drop-shadow-md"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    {leader.role}
                  </motion.p>
                </div>
              </div>

              <div className="relative p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full text-xs font-black text-white shadow-lg"
                  >
                    {leader.department}
                  </motion.span>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-black text-gray-700">{leader.experience_years}+ Imyaka</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="w-3 h-3 text-green-600" />
                    <span className="truncate">{leader.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3 h-3 text-yellow-600" />
                    <span>{leader.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 text-green-600" />
                    <span className="truncate">{leader.office_location}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm line-clamp-3 mb-4 leading-relaxed">{leader.biography_rw ? leader.biography_rw.substring(0, 150) : leader.biography_en?.substring(0, 150) || 'No biography available'}...</p>
                
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between text-white font-black text-sm bg-gradient-to-r from-green-600 to-yellow-600 rounded-xl px-4 py-3 shadow-lg group-hover:shadow-2xl transition-shadow"
                >
                  <span>Reba Byose</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </motion.div>
              </div>

              <div className="absolute inset-0 border-4 border-transparent group-hover:border-yellow-400 rounded-3xl transition-all duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadershipPage;

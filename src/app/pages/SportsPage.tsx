import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaUsers, FaMapMarkerAlt, FaClock, FaBus, FaChevronRight, FaStar, FaMedal, FaFire } from 'react-icons/fa';

interface SportsPageProps {
  onNavigate: (page: string) => void;
}

const SportsPage: React.FC<SportsPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teams' | 'about' | 'facilities'>('teams');

  useEffect(() => {
    fetch('http://localhost:5000/api/sports/teams')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTeams(data.teams);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const facilitiesData = [
    {
      name: 'Stade Ngoma',
      nameEn: 'Ngoma Stadium',
      description: 'Stade Ngoma ni stade nkuru y\'umujyi wa Ngoma. Ikipe yacu ikina hano imikino mikuru. Stade ifite ubushobozi bwo kwakira abantu 5,000 kandi ifite ikirambi cyiza cy\'ibyatsi.',
      distance: '2.5 km kuva ku ishuri',
      transport: 'Bus y\'ishuri',
      schedule: 'Kuwa mbere, Kuwa gatatu, Kuwa gatanu (4:00 PM - 6:00 PM)'
    },
    {
      name: 'Ikirambi cy\'Ishuri',
      nameEn: 'School Ground',
      description: 'Ikirambi cy\'ishuri ni aho dukora imyitozo ya buri munsi. Abanyeshuri bose bashobora gukina hano nyuma y\'amasomo.',
      distance: 'Mu ishuri',
      transport: 'Ntago bikenewe',
      schedule: 'Buri munsi (3:30 PM - 5:30 PM)'
    },
    {
      name: 'Salle Polyvalente',
      nameEn: 'Multi-purpose Hall',
      description: 'Salle Polyvalente ni aho dukina volleyball na basketball. Ifite ubushobozi bwo kwakira abantu 1,000.',
      distance: '1.8 km kuva ku ishuri',
      transport: 'Twagenda n\'amaguru',
      schedule: 'Kuwa kabiri, Kuwa kane (4:00 PM - 6:00 PM)'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Urasubira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
      {/* Hero Header */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">SIPORO</h1>
            <p className="text-2xl text-white/90 mb-6">Amakipe ya Siporo ya Garden TVET School</p>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
                <p className="text-3xl font-black text-white">{teams.length}</p>
                <p className="text-sm text-white/90">Amakipe</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
                <p className="text-3xl font-black text-white">{teams.reduce((sum, t) => sum + (t.total_players || 0), 0)}</p>
                <p className="text-sm text-white/90">Abakinnyi</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
                <p className="text-3xl font-black text-white">{teams.reduce((sum, t) => sum + (t.total_achievements || 0), 0)}</p>
                <p className="text-sm text-white/90">Ibihembo</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-10 border-b-2 border-green-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4">
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'teams' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaTrophy className="inline mr-2" /> Amakipe
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'about' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaStar className="inline mr-2" /> Ibyanyu
            </button>
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'facilities' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaMapMarkerAlt className="inline mr-2" /> Aho Tukina
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {activeTab === 'teams' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:border-green-300 transition-all duration-300">
                  {/* Image Section with Overlay */}
                  <div className="relative h-72 overflow-hidden">
                    {team.image_url ? (
                      <img 
                        src={`http://localhost:5000${team.image_url}`}
                        alt={team.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center">
                        <FaTrophy className="text-white text-7xl opacity-40" />
                      </div>
                    )}
                    
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className="flex gap-2">
                        {(team.total_achievements || 0) > 0 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg"
                          >
                            <FaMedal className="text-sm" /> {team.total_achievements} Ibihembo
                          </motion.div>
                        )}
                        {(team.total_players || 0) >= 15 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg"
                          >
                            <FaFire className="text-sm" /> Ikipe Nini
                          </motion.div>
                        )}
                      </div>
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30"
                      >
                        <FaStar className="text-yellow-400 text-lg" />
                      </motion.div>
                    </div>
                    
                    {/* Team Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <h3 className="text-4xl font-black text-white mb-2 drop-shadow-2xl tracking-tight">{team.name}</h3>
                        <p className="text-white/95 font-bold text-lg drop-shadow-lg">{team.name_en}</p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    {/* Description */}
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{team.description}</p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <motion.div 
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-5 rounded-2xl border-2 border-green-200 overflow-hidden group/stat"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-emerald-400/0 group-hover/stat:from-green-400/10 group-hover/stat:to-emerald-400/10 transition-all duration-300"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <FaUsers className="text-green-600 text-3xl" />
                            <div className="bg-green-600 text-white text-xs font-black px-2 py-1 rounded-full">LIVE</div>
                          </div>
                          <p className="text-4xl font-black text-gray-900 mb-1">{team.total_players || 0}</p>
                          <p className="text-sm text-gray-600 font-bold">Abakinnyi</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        className="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 p-5 rounded-2xl border-2 border-yellow-200 overflow-hidden group/stat"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-orange-400/0 group-hover/stat:from-yellow-400/10 group-hover/stat:to-orange-400/10 transition-all duration-300"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <FaTrophy className="text-yellow-600 text-3xl" />
                            <div className="bg-yellow-600 text-white text-xs font-black px-2 py-1 rounded-full">WIN</div>
                          </div>
                          <p className="text-4xl font-black text-gray-900 mb-1">{team.total_achievements || 0}</p>
                          <p className="text-sm text-gray-600 font-bold">Ibihembo</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onNavigate(`sport-team/${team.id}`)}
                      className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-black text-lg hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 group/btn"
                    >
                      <span>Reba Amakuru Yose</span>
                      <FaChevronRight className="text-sm group-hover/btn:translate-x-2 transition-transform" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Umupira w'Amaguru muri Garden TVET</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Umupira w'amaguru ni kimwe mu mikino ikomeye kandi ikunzwe cyane muri Garden TVET School. Ikipe yacu yatangiye mu 2015 kandi yagize intsinzi nyinshi mu marushanwa atandukanye.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Abakinnyi bacu barangwa n'ubushobozi bukomeye, ubwitange budasanzwe, n'urukundo rukabije rw'umukino. Dukina mu Stade Ngoma, stade nkuru y'umujyi wa Ngoma.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Ishuri ryacu rifite amateka meza yo guteza imbere abakinnyi kandi tugakomeza gukora ibishoboka byose kugira ngo abanyeshuri bacu bagere ku ntera ndende.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="space-y-6">
            {facilitiesData.map((facility, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{facility.name}</h3>
                <p className="text-gray-600 mb-4">{facility.nameEn}</p>
                <p className="text-gray-700 mb-6">{facility.description}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaMapMarkerAlt className="text-green-600" />
                    <span>{facility.distance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaBus className="text-green-600" />
                    <span>{facility.transport}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaClock className="text-green-600" />
                    <span>{facility.schedule}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SportsPage;

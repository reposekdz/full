import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, Clock, Award, Star, TrendingUp, Target, Zap, Shield, Heart, Medal, Activity } from 'lucide-react';

interface SportsPageProps {
  onNavigate: (page: string) => void;
}

const UltraSportsPage: React.FC<SportsPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetch('http://localhost:5000/api/sports/teams')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTeams(data.teams);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Amakipe', value: teams.length, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Abakinnyi', value: teams.reduce((sum, t) => sum + (t.total_players || 0), 0), icon: Activity, color: 'from-green-500 to-green-600' },
    { label: 'Ibihembo', value: teams.reduce((sum, t) => sum + (t.total_achievements || 0), 0), icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Imikino', value: '50+', icon: Target, color: 'from-purple-500 to-purple-600' }
  ];

  const benefits = [
    { icon: Heart, title: 'Ubuzima Bwiza', desc: 'Siporo ituma umubiri ukura kandi ukomera' },
    { icon: Users, title: 'Ubufatanye', desc: 'Kwiga gukorana no gufatanya n\'abandi' },
    { icon: Star, title: 'Ubushobozi', desc: 'Guteza imbere ubushobozi n\'ubumenyi' },
    { icon: Shield, title: 'Imyitwarire', desc: 'Kwiga kwiyubaha no kwubaha abandi' },
    { icon: TrendingUp, title: 'Iterambere', desc: 'Gukomeza gutera imbere buri munsi' },
    { icon: Zap, title: 'Imbaraga', desc: 'Kongera imbaraga n\'ubushobozi' }
  ];

  const facilities = [
    {
      name: 'Stade Ngoma',
      nameEn: 'Ngoma Stadium',
      description: 'Stade nkuru y\'umujyi wa Ngoma ifite ubushobozi bwo kwakira abantu 5,000. Ikirambi cyiza cy\'ibyatsi, amashanyarazi meza, n\'ibikoresho byose bikenewe.',
      distance: '2.5 km',
      transport: 'Bus y\'ishuri',
      schedule: 'Kuwa mbere, Kuwa gatatu, Kuwa gatanu (4:00 PM - 6:00 PM)',
      features: ['Ikirambi cy\'ibyatsi', 'Amashanyarazi', 'Imyanya yo kwiyuhagira', 'Ibikoresho by\'ubuzima']
    },
    {
      name: 'Ikirambi cy\'Ishuri',
      nameEn: 'School Ground',
      description: 'Ikirambi cy\'ishuri ni aho dukora imyitozo ya buri munsi. Abanyeshuri bose bashobora gukina hano nyuma y\'amasomo.',
      distance: 'Mu ishuri',
      transport: 'Ntago bikenewe',
      schedule: 'Buri munsi (3:30 PM - 5:30 PM)',
      features: ['Ikirambi kinini', 'Amazi meza', 'Umutekano mwiza', 'Ibikoresho by\'imyitozo']
    },
    {
      name: 'Salle Polyvalente',
      nameEn: 'Multi-purpose Hall',
      description: 'Salle Polyvalente ni aho dukina volleyball na basketball. Ifite ubushobozi bwo kwakira abantu 1,000 kandi ifite ibikoresho byose bikenewe.',
      distance: '1.8 km',
      transport: 'Twagenda n\'amaguru',
      schedule: 'Kuwa kabiri, Kuwa kane (4:00 PM - 6:00 PM)',
      features: ['Ikirambi cy\'imbere', 'Intebe nyinshi', 'Amashanyarazi', 'Ibikoresho by\'imikino']
    }
  ];

  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50\">
        <div className=\"text-center\">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: \"linear\" }}
            className=\"w-16 h-16 border-4 border-green-600 border-t-yellow-600 rounded-full mx-auto mb-4\"
          />
          <p className=\"text-gray-600 text-lg font-bold\">Gutegura Siporo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50\">
      {/* Hero Header */}
      <div className=\"relative bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 py-20 overflow-hidden\">
        <motion.div
          animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
          transition={{ duration: 20, repeat: Infinity }}
          className=\"absolute inset-0 opacity-20\"
          style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.3) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.3) 75%)', backgroundSize: '50px 50px' }}
        />
        <div className=\"max-w-7xl mx-auto px-4 relative z-10\">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className=\"text-center\"
          >
            <div className=\"flex items-center justify-center gap-4 mb-6\">
              <Trophy className=\"w-16 h-16 text-white\" />
              <h1 className=\"text-6xl font-black text-white\">SIPORO</h1>
              <Trophy className=\"w-16 h-16 text-white\" />
            </div>
            <p className=\"text-2xl text-white/90 font-bold mb-8\">Amakipe ya Siporo ya Garden TVET School</p>
            <p className=\"text-lg text-white/80 max-w-3xl mx-auto\">
              Siporo ni kimwe mu bintu by\'ingenzi muri Garden TVET School. Dufasha abanyeshuri guteza imbere ubushobozi bwabo, kwiga ubufatanye, no kugira ubuzima bwiza.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className=\"max-w-7xl mx-auto px-4 -mt-12 relative z-20\">
        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-12\">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className=\"bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-100\"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className=\"w-7 h-7 text-white\" />
              </div>
              <p className=\"text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent\">{stat.value}</p>
              <p className=\"text-sm text-gray-600 font-bold\">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className=\"bg-white shadow-md sticky top-0 z-30\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"flex gap-2 py-4 overflow-x-auto\">
            {['teams', 'benefits', 'facilities', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-black transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-green-600 to-yellow-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'teams' && 'Amakipe'}
                {tab === 'benefits' && 'Inyungu'}
                {tab === 'facilities' && 'Aho Tukina'}
                {tab === 'about' && 'Ibijanye na Siporo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className=\"max-w-7xl mx-auto px-4 py-12\">
        <AnimatePresence mode=\"wait\">
          {activeTab === 'teams' && (
            <motion.div
              key=\"teams\"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-6\">
                {teams.map((team, idx) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={() => onNavigate(`sport-team/${team.id}`)}
                    className=\"bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer group\"
                  >
                    <div className=\"relative h-56 overflow-hidden\">
                      <motion.img
                        src={`http://localhost:5000${team.image_url}`}
                        alt={team.name}
                        className=\"w-full h-full object-cover\"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className=\"absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent\" />
                      <div className=\"absolute top-4 right-4\">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: \"linear\" }}
                          className=\"w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full flex items-center justify-center shadow-lg\"
                        >
                          <Trophy className=\"w-6 h-6 text-white\" />
                        </motion.div>
                      </div>
                      <div className=\"absolute bottom-4 left-4 right-4\">
                        <h3 className=\"text-2xl font-black text-white mb-1\">{team.name}</h3>
                        <p className=\"text-white/90 font-semibold\">{team.name_en}</p>
                      </div>
                    </div>
                    <div className=\"p-6\">
                      <p className=\"text-gray-700 mb-4 line-clamp-2\">{team.description}</p>
                      <div className=\"grid grid-cols-2 gap-4 mb-4\">
                        <div className=\"flex items-center gap-2 text-gray-700\">
                          <Users className=\"w-5 h-5 text-green-600\" />
                          <span className=\"font-bold\">{team.total_players || 0} Abakinnyi</span>
                        </div>
                        <div className=\"flex items-center gap-2 text-gray-700\">
                          <Trophy className=\"w-5 h-5 text-yellow-600\" />
                          <span className=\"font-bold\">{team.total_achievements || 0} Ibihembo</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className=\"w-full bg-gradient-to-r from-green-600 to-yellow-600 text-white py-3 rounded-xl font-black shadow-lg hover:shadow-xl transition\"
                      >
                        Reba Byose →
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'benefits' && (
            <motion.div
              key=\"benefits\"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className=\"bg-white rounded-2xl shadow-xl p-8 mb-8\">
                <h2 className=\"text-3xl font-black text-gray-900 mb-4\">Inyungu zo Gukina Siporo</h2>
                <p className=\"text-gray-700 text-lg mb-8\">
                  Siporo ifite inyungu nyinshi ku buzima bw\'umubiri n\'ubw\'imitekerereze. Dore inyungu z\'ingenzi zo gukina siporo muri Garden TVET School:
                </p>
              </div>
              <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-6\">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className=\"bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100\"
                  >
                    <div className=\"w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-4\">
                      <benefit.icon className=\"w-8 h-8 text-white\" />
                    </div>
                    <h3 className=\"text-xl font-black text-gray-900 mb-2\">{benefit.title}</h3>
                    <p className=\"text-gray-700\">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'facilities' && (
            <motion.div
              key=\"facilities\"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className=\"space-y-6\"
            >
              {facilities.map((facility, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className=\"bg-white rounded-2xl shadow-xl p-8\"
                >
                  <div className=\"flex items-start gap-4 mb-6\">
                    <div className=\"w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0\">
                      <MapPin className=\"w-8 h-8 text-white\" />
                    </div>
                    <div>
                      <h3 className=\"text-2xl font-black text-gray-900 mb-1\">{facility.name}</h3>
                      <p className=\"text-gray-600 font-semibold\">{facility.nameEn}</p>
                    </div>
                  </div>
                  <p className=\"text-gray-700 text-lg mb-6\">{facility.description}</p>
                  <div className=\"grid md:grid-cols-3 gap-4 mb-6\">
                    <div className=\"flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-white rounded-xl\">
                      <MapPin className=\"w-5 h-5 text-green-600\" />
                      <div>
                        <p className=\"text-xs text-gray-600 font-bold\">Intera</p>
                        <p className=\"text-sm font-black text-gray-900\">{facility.distance}</p>
                      </div>
                    </div>
                    <div className=\"flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl\">
                      <Activity className=\"w-5 h-5 text-yellow-600\" />
                      <div>
                        <p className=\"text-xs text-gray-600 font-bold\">Transport</p>
                        <p className=\"text-sm font-black text-gray-900\">{facility.transport}</p>
                      </div>
                    </div>
                    <div className=\"flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl\">
                      <Clock className=\"w-5 h-5 text-blue-600\" />
                      <div>
                        <p className=\"text-xs text-gray-600 font-bold\">Igihe</p>
                        <p className=\"text-sm font-black text-gray-900\">{facility.schedule}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className=\"text-sm font-black text-gray-900 mb-3\">Ibikoresho:</p>
                    <div className=\"flex flex-wrap gap-2\">
                      {facility.features.map((feature, i) => (
                        <span key={i} className=\"px-4 py-2 bg-gradient-to-r from-green-100 to-yellow-100 text-gray-800 rounded-full text-sm font-bold\">
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key=\"about\"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className=\"bg-white rounded-2xl shadow-xl p-8\"
            >
              <h2 className=\"text-3xl font-black text-gray-900 mb-6\">Siporo muri Garden TVET School</h2>
              <div className=\"space-y-6 text-gray-700 text-lg leading-relaxed\">
                <p>
                  <strong className=\"text-green-600\">Siporo ni kimwe mu bintu by\'ingenzi</strong> muri Garden TVET School. Dufasha abanyeshuri guteza imbere ubushobozi bwabo mu mikino itandukanye, kwiga ubufatanye, no kugira ubuzima bwiza.
                </p>
                <p>
                  <strong className=\"text-yellow-600\">Amakipe yacu</strong> akina mu marushanwa atandukanye mu karere no mu gihugu. Dufite amateka meza yo gutsinda ibihembo n\'ibikombe byinshi.
                </p>
                <p>
                  <strong className=\"text-blue-600\">Abatoza bacu</strong> ni abantu bafite ubumenyi n\'uburambe mu mikino. Bafasha abanyeshuri guteza imbere ubushobozi bwabo no kugera ku ntego zabo.
                </p>
                <p>
                  <strong className=\"text-purple-600\">Ibikoresho byacu</strong> ni byiza kandi bifite ubwiza. Dufite ikirambi cy\'ishuri, kandi dukoresha Stade Ngoma n\'ibindi bikoresho by\'umujyi.
                </p>
                <p>
                  <strong className=\"text-red-600\">Intego yacu</strong> ni uguteza imbere abanyeshuri mu mikino, kubafasha kugira ubuzima bwiza, no kubafasha kugera ku ntego zabo mu buzima.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UltraSportsPage;

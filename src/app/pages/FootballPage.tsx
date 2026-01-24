import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, Target, Star, ArrowLeft, Play, Award, TrendingUp, Clock, MapPin, User } from 'lucide-react';

interface FootballPageProps {
  onNavigate: (page: string) => void;
}

interface Player {
  id: number;
  name: string;
  position: string;
  jersey_number: number;
  image_url: string;
  goals: number;
  matches_played: number;
}

interface Match {
  id: number;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  result?: string;
  score?: string;
  status: 'upcoming' | 'completed';
}

interface Coach {
  id: number;
  name: string;
  image_url: string;
  experience: string;
  achievements: string[];
}

const FootballPage: React.FC<FootballPageProps> = ({ onNavigate }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0, goals: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFootballData();
  }, []);

  const fetchFootballData = async () => {
    try {
      const [playersRes, matchesRes, coachRes, galleryRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/sports/football/players'),
        fetch('http://localhost:5000/api/sports/football/matches'),
        fetch('http://localhost:5000/api/sports/football/coach'),
        fetch('http://localhost:5000/api/sports/football/gallery'),
        fetch('http://localhost:5000/api/sports/football/stats')
      ]);

      const [playersData, matchesData, coachData, galleryData, statsData] = await Promise.all([
        playersRes.json(),
        matchesRes.json(),
        coachRes.json(),
        galleryRes.json(),
        statsRes.json()
      ]);

      setPlayers(playersData);
      setMatches(matchesData);
      setCoach(coachData);
      setGallery(galleryData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching football data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="text-8xl">⚽</div>
        </motion.div>
      </div>
    );
  }

  const upcomingMatches = matches.filter(m => m.status === 'upcoming').slice(0, 3);
  const recentMatches = matches.filter(m => m.status === 'completed').slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-r from-green-600 to-yellow-500 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-10"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -20, 0], rotate: [0, 360] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            >
              ⚽
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.button
            onClick={() => onNavigate('sports')}
            whileHover={{ scale: 1.05 }}
            className="mb-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Garuka
          </motion.button>

          <div className="flex items-center gap-8 mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-9xl"
            >
              ⚽
            </motion.div>
            <div>
              <h1 className="text-6xl font-black text-white mb-4">FOOTBALL TEAM</h1>
              <p className="text-2xl text-white/90 font-bold">Garden TVET School Football Club</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Intsinzi', value: stats.wins, icon: Trophy, color: 'yellow' },
              { label: 'Abakinnyi', value: players.length, icon: Users, color: 'green' },
              { label: 'Ibitsindagiye', value: stats.goals, icon: Target, color: 'yellow' },
              { label: 'Imikino', value: matches.length, icon: Calendar, color: 'green' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/20 backdrop-blur-md p-4 rounded-xl text-center"
              >
                <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-200`} />
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-white/80 font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Muri Rusange', icon: Star },
              { id: 'players', label: 'Abakinnyi', icon: Users },
              { id: 'matches', label: 'Imikino', icon: Calendar },
              { id: 'gallery', label: 'Amafoto', icon: Play }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ y: -2 }}
                className={`flex items-center gap-2 py-4 px-6 font-bold border-b-4 transition-all ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-green-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Coach Section */}
              {coach && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-3xl font-black text-gray-900 mb-6">Umutoza</h2>
                  <div className="flex items-center gap-6">
                    <img src={coach.image_url} alt={coach.name} className="w-24 h-24 rounded-full object-cover" />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{coach.name}</h3>
                      <p className="text-gray-600 mb-2">{coach.experience}</p>
                      <div className="flex flex-wrap gap-2">
                        {coach.achievements.map((achievement, i) => (
                          <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Matches */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-3xl font-black text-gray-900 mb-6">Imikino Itegerejwe</h2>
                <div className="space-y-4">
                  {upcomingMatches.map((match) => (
                    <motion.div
                      key={match.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">⚽</div>
                        <div>
                          <p className="font-bold text-gray-900">vs {match.opponent}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {match.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {match.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {match.venue}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Results */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-3xl font-black text-gray-900 mb-6">Ibisubizo Biheruka</h2>
                <div className="space-y-4">
                  {recentMatches.map((match) => (
                    <motion.div
                      key={match.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">⚽</div>
                        <div>
                          <p className="font-bold text-gray-900">vs {match.opponent}</p>
                          <p className="text-sm text-gray-600">{match.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900">{match.score}</p>
                        <p className={`text-sm font-bold ${
                          match.result === 'win' ? 'text-green-600' : 
                          match.result === 'loss' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {match.result === 'win' ? 'Intsinzi' : match.result === 'loss' ? 'Gutsindwa' : 'Kuraguza'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'players' && (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="relative h-64">
                      <img src={player.image_url} alt={player.name} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl">
                        {player.jersey_number}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-black text-gray-900 mb-2">{player.name}</h3>
                      <p className="text-green-600 font-bold mb-4">{player.position}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-black text-gray-900">{player.goals}</p>
                          <p className="text-sm text-gray-600">Ibitsindagiye</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-black text-gray-900">{player.matches_played}</p>
                          <p className="text-sm text-gray-600">Imikino</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-3xl font-black text-gray-900 mb-6">Imikino Yose</h2>
                <div className="space-y-4">
                  {matches.map((match) => (
                    <motion.div
                      key={match.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-xl border-l-4 ${
                        match.status === 'upcoming' 
                          ? 'bg-blue-50 border-blue-500' 
                          : match.result === 'win'
                          ? 'bg-green-50 border-green-500'
                          : match.result === 'loss'
                          ? 'bg-red-50 border-red-500'
                          : 'bg-yellow-50 border-yellow-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">⚽</div>
                          <div>
                            <p className="font-bold text-gray-900">vs {match.opponent}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{match.date}</span>
                              <span>{match.time}</span>
                              <span>{match.venue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {match.status === 'completed' ? (
                            <>
                              <p className="text-2xl font-black text-gray-900">{match.score}</p>
                              <p className={`text-sm font-bold ${
                                match.result === 'win' ? 'text-green-600' : 
                                match.result === 'loss' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {match.result === 'win' ? 'Intsinzi' : match.result === 'loss' ? 'Gutsindwa' : 'Kuraguza'}
                              </p>
                            </>
                          ) : (
                            <p className="text-blue-600 font-bold">Itegerejwe</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative group cursor-pointer"
                  >
                    <img 
                      src={image} 
                      alt={`Gallery ${index + 1}`} 
                      className="w-full h-64 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-2xl" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FootballPage;
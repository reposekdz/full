import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Award, TrendingUp, ArrowRight, Sparkles, Star, Target, Zap, Crown, Flame, Medal, Calendar, Activity, Filter, Search as SearchIcon, ChevronRight, TrendingDown } from 'lucide-react';

interface SportsPageProps {
  onNavigate: (page: string) => void;
}

const EnhancedSportsPageNew: React.FC<SportsPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, leaderboardRes, matchesRes, playersRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5000/api/sports/teams'),
        fetch('http://localhost:5000/api/sports/leaderboard'),
        fetch('http://localhost:5000/api/sports/upcoming-matches'),
        fetch('http://localhost:5000/api/sports/top-players'),
        fetch('http://localhost:5000/api/sports/analytics')
      ]);
      const [teamsData, leaderboardData, matchesData, playersData, analyticsData] = await Promise.all([
        teamsRes.json(),
        leaderboardRes.json(),
        matchesRes.json(),
        playersRes.json(),
        analyticsRes.json()
      ]);
      if (teamsData.success) setTeams(teamsData.teams);
      if (leaderboardData.success) setLeaderboard(leaderboardData.leaderboard);
      if (matchesData.success) setUpcomingMatches(matchesData.matches);
      if (playersData.success) setTopPlayers(playersData.players);
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesFilter = activeFilter === 'all' || team.sport_type === activeFilter;
    const matchesSearch = team.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         team.name_en?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const gradients = [
    'from-yellow-400 via-green-400 to-yellow-500',
    'from-green-400 via-yellow-400 to-green-500',
    'from-yellow-500 via-green-400 to-yellow-400',
    'from-green-500 via-yellow-400 to-green-400'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Trophy className="w-20 h-20 text-green-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], x: [0, Math.random() * 20 - 10, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          >
            {i % 3 === 0 ? '⚽' : i % 3 === 1 ? '🏐' : '🏆'}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 opacity-90" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="inline-flex items-center gap-6 mb-8">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="bg-white p-8 rounded-3xl shadow-2xl">
                <Trophy className="w-20 h-20 text-green-600" />
              </motion.div>
              <h1 className="text-8xl font-black text-white drop-shadow-2xl">SIPORO</h1>
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="bg-white p-8 rounded-3xl shadow-2xl">
                <Crown className="w-20 h-20 text-yellow-600" />
              </motion.div>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-3xl text-white font-black mb-8 drop-shadow-lg">
              Amakipe ya Siporo ya Garden TVET School
            </motion.p>

            {analytics && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap justify-center gap-6">
                {[
                  { icon: Trophy, label: `${analytics.teams} Amakipe`, color: 'yellow' },
                  { icon: Users, label: `${analytics.players} Abakinnyi`, color: 'green' },
                  { icon: Activity, label: `${analytics.matches} Imikino`, color: 'yellow' },
                  { icon: Award, label: `${analytics.achievements} Ibihembo`, color: 'green' },
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.1, y: -5 }} className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-white/50 shadow-xl">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-7 h-7 text-${item.color}-100`} />
                      <span className="font-black text-white text-lg">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Search & Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Shakisha ikipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-bold"
              />
            </div>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Byose', icon: '🏆' },
                { id: 'football', label: 'Football', icon: '⚽' },
                { id: 'volleyball', label: 'Volleyball', icon: '🏐' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-green-600 to-yellow-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Section */}
        {leaderboard.length > 0 && (
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-yellow-400 to-green-500 rounded-3xl shadow-2xl p-8 mb-12">
            <h2 className="text-4xl font-black text-white mb-6 flex items-center gap-3">
              <Medal className="w-10 h-10" />
              Urutonde rw'Intsinzi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 text-9xl opacity-5">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-5xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                      <div className="text-6xl">{team.icon}</div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{team.name}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-3xl font-black text-green-600">{team.wins}</p>
                        <p className="text-xs text-gray-600 font-bold">Intsinzi</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-3xl font-black text-blue-600">{team.players}</p>
                        <p className="text-xs text-gray-600 font-bold">Abakinnyi</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Teams Grid */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h2 className="text-6xl font-black text-gray-900 mb-8 bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent text-center">
            Amakipe Yacu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredTeams.map((team, index) => {
              const gradientClass = `bg-gradient-to-r ${gradients[index % gradients.length]}`;
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -10 }}
                  onHoverStart={() => setHoveredTeam(team.id)}
                  onHoverEnd={() => setHoveredTeam(null)}
                  onClick={() => onNavigate(`sport-team/${team.id}`)}
                  className="group relative cursor-pointer"
                >
                  <motion.div animate={{ opacity: hoveredTeam === team.id ? 0.8 : 0 }} className={`absolute inset-0 ${gradientClass} rounded-2xl blur-2xl`} />
                  <div className={`relative ${gradientClass} p-1.5 rounded-2xl shadow-xl`}>
                    <div className="bg-white rounded-xl overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <motion.img whileHover={{ scale: 1.15 }} src={team.image_url} alt={team.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-6xl drop-shadow-xl">
                            {team.icon}
                          </motion.div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-2xl font-black text-white mb-1 drop-shadow-xl">{team.name}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <Users className="w-5 h-5 mx-auto mb-1 text-yellow-700" />
                            <p className="text-lg font-black text-gray-900">{team.total_players || 0}</p>
                            <p className="text-xs text-gray-600 font-bold">Abakinnyi</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <Trophy className="w-5 h-5 mx-auto mb-1 text-green-700" />
                            <p className="text-lg font-black text-gray-900">{team.total_achievements || 0}</p>
                            <p className="text-xs text-gray-600 font-bold">Ibihembo</p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <Star className="w-5 h-5 mx-auto mb-1 text-blue-700" />
                            <p className="text-lg font-black text-gray-900">{team.total_wins || 0}</p>
                            <p className="text-xs text-gray-600 font-bold">Intsinzi</p>
                          </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full ${gradientClass} text-white py-3 rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2`}>
                          <Trophy className="w-4 h-4" />
                          Reba Byose
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Calendar className="w-10 h-10 text-blue-600" />
              Imikino Itegerejwe
            </h2>
            <div className="space-y-4">
              {upcomingMatches.slice(0, 5).map((match, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{match.icon}</div>
                    <div>
                      <p className="font-black text-gray-900">{match.team_name} vs {match.opponent}</p>
                      <p className="text-sm text-gray-600 font-bold">{match.location_rw}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600">{new Date(match.match_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600 font-bold">{match.match_time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Players */}
        {topPlayers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8">
            <h2 className="text-4xl font-black text-white mb-6 flex items-center gap-3">
              <Star className="w-10 h-10" />
              Abakinnyi Beza
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topPlayers.slice(0, 8).map((player, idx) => (
                <motion.div key={player.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl p-4 text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center overflow-hidden">
                    {player.image_url ? (
                      <img src={`http://localhost:5000${player.image_url}`} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-black text-gray-900 mb-1">{player.name_rw || player.name}</h3>
                  <p className="text-xs text-gray-600 font-bold mb-2">{player.position_rw}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{player.team_icon}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">#{player.jersey_number}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSportsPageNew;

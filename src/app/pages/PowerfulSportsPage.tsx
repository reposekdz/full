import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, Clock, Bus, ChevronRight, Star, Award, TrendingUp, Filter, Search, Grid, List, Play, Medal, Target, Zap } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  name_en: string;
  description: string;
  image_url: string;
  total_players: number;
  total_achievements: number;
  coach_name?: string;
  founded_year?: number;
  win_rate?: number;
}

interface SportsPageProps {
  onNavigate: (page: string) => void;
}

const PowerfulSportsPage: React.FC<SportsPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teams' | 'stats' | 'facilities' | 'achievements'>('teams');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/sports/teams')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTeams(data.teams);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.name_en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterSport === 'all' || team.name.toLowerCase().includes(filterSport.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { icon: Trophy, label: 'Total Trophies', value: teams.reduce((acc, t) => acc + (t.total_achievements || 0), 0), color: 'from-yellow-500 to-orange-500' },
    { icon: Users, label: 'Active Players', value: teams.reduce((acc, t) => acc + (t.total_players || 0), 0), color: 'from-blue-500 to-cyan-500' },
    { icon: Award, label: 'Teams', value: teams.length, color: 'from-green-500 to-emerald-500' },
    { icon: TrendingUp, label: 'Win Rate', value: '78%', color: 'from-purple-500 to-pink-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Zap className="w-16 h-16 text-green-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto px-4 py-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <Trophy className="w-16 h-16" />
            <div>
              <h1 className="text-6xl font-black mb-2">SPORTS EXCELLENCE</h1>
              <p className="text-2xl font-light">Garden TVET School Athletic Programs</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <stat.icon className="w-8 h-8 mb-3" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex gap-2">
              {[
                { id: 'teams', label: 'Teams', icon: Users },
                { id: 'stats', label: 'Statistics', icon: TrendingUp },
                { id: 'facilities', label: 'Facilities', icon: MapPin },
                { id: 'achievements', label: 'Achievements', icon: Medal }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {activeTab === 'teams' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Search & Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  />
                </div>
                <select
                  value={filterSport}
                  onChange={(e) => setFilterSport(e.target.value)}
                  className="px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                >
                  <option value="all">All Sports</option>
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                  <option value="volleyball">Volleyball</option>
                </select>
              </div>

              {/* Teams Display */}
              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredTeams.map((team, idx) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      onClick={() => onNavigate(`sport-team/${team.id}`)}
                      className="group bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={team.image_url}
                          alt={team.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          {team.total_achievements}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-3xl font-black text-white mb-1">{team.name}</h3>
                          <p className="text-white/90 font-medium">{team.name_en}</p>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <p className="text-gray-600 mb-6 line-clamp-2">{team.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                            <Users className="w-6 h-6 text-blue-600 mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{team.total_players}</div>
                            <div className="text-sm text-gray-600">Players</div>
                          </div>
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
                            <Trophy className="w-6 h-6 text-yellow-600 mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{team.total_achievements}</div>
                            <div className="text-sm text-gray-600">Trophies</div>
                          </div>
                        </div>
                        
                        <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105">
                          View Details <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTeams.map((team, idx) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => onNavigate(`sport-team/${team.id}`)}
                      className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6 hover:shadow-xl transition-all cursor-pointer"
                    >
                      <img src={team.image_url} alt={team.name} className="w-24 h-24 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">{team.name}</h3>
                        <p className="text-gray-600">{team.name_en}</p>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{team.total_players}</div>
                          <div className="text-sm text-gray-600">Players</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{team.total_achievements}</div>
                          <div className="text-sm text-gray-600">Trophies</div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {teams.map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img src={team.image_url} alt={team.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <h3 className="text-2xl font-bold">{team.name}</h3>
                      <p className="text-gray-600">{team.name_en}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Win Rate</span>
                        <span className="font-bold">{team.win_rate || 75}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${team.win_rate || 75}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{team.total_players}</div>
                        <div className="text-sm text-gray-600">Players</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600">{team.total_achievements}</div>
                        <div className="text-sm text-gray-600">Trophies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{team.founded_year || 2015}</div>
                        <div className="text-sm text-gray-600">Founded</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'facilities' && (
            <motion.div
              key="facilities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                { name: 'Stade Ngoma', icon: Target, distance: '2.5 km', capacity: '5,000', transport: 'School Bus', schedule: 'Mon, Wed, Fri 4-6 PM' },
                { name: 'School Ground', icon: Play, distance: 'On Campus', capacity: '500', transport: 'Walk', schedule: 'Daily 3:30-5:30 PM' },
                { name: 'Multi-purpose Hall', icon: Medal, distance: '1.8 km', capacity: '1,000', transport: 'Walk', schedule: 'Tue, Thu 4-6 PM' }
              ].map((facility, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all"
                >
                  <facility.icon className="w-12 h-12 text-green-600 mb-4" />
                  <h3 className="text-2xl font-bold mb-4">{facility.name}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <span>{facility.distance}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>{facility.capacity} capacity</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Bus className="w-5 h-5 text-yellow-600" />
                      <span>{facility.transport}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>{facility.schedule}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {teams.map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{team.name}</h3>
                      <p className="text-gray-600">{team.total_achievements} Total Achievements</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[...Array(Math.min(team.total_achievements, 6))].map((_, i) => (
                      <div key={i} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                        <Medal className="w-6 h-6 text-yellow-600 mb-2" />
                        <div className="font-bold">Championship {i + 1}</div>
                        <div className="text-sm text-gray-600">202{3 - i}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PowerfulSportsPage;

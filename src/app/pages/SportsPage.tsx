import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Calendar, Award, TrendingUp, Target, Medal, Star, ChevronRight, ArrowLeft, Search, Filter, X, MapPin, Clock, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface SportsPageProps {
  onNavigate: (page: string) => void;
}

const SportsPage: React.FC<SportsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, matchesRes, upcomingRes] = await Promise.all([
        fetch('http://localhost:5000/api/sports/teams'),
        fetch('http://localhost:5000/api/sports/matches?upcoming=false'),
        fetch('http://localhost:5000/api/sports/matches?upcoming=true')
      ]);
      
      const teamsData = await teamsRes.json();
      const matchesData = await matchesRes.json();
      const upcomingData = await upcomingRes.json();
      
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setUpcomingMatches(Array.isArray(upcomingData) ? upcomingData : []);
    } catch (error) {
      console.error('Error fetching sports data:', error);
      setTeams([]);
      setMatches([]);
      setUpcomingMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Amakipe', value: teams.length, icon: Users, color: 'from-blue-600 to-indigo-600' },
    { label: 'Intsinzi', value: teams.reduce((sum, t) => sum + (t.wins || 0), 0), icon: Trophy, color: 'from-green-600 to-emerald-600' },
    { label: 'Imikino', value: matches.length, icon: Target, color: 'from-purple-600 to-pink-600' },
    { label: 'Ibihembo', value: teams.reduce((sum, t) => sum + (t.achievements?.length || 0), 0), icon: Award, color: 'from-yellow-600 to-orange-600' }
  ];

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-700">Gutegura Siporo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-8 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => onNavigate('home')} variant="ghost" className="text-white hover:bg-white/20 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Subira
          </Button>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-3">Siporo n'Imikino</h1>
            <p className="text-xl font-semibold text-white/90">Amakipe, Imikino n'Intsinzi - Garden TVET Sports</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-2 text-center">{stat.value}</p>
              <p className="text-sm font-bold text-gray-600 text-center">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4 mb-8">
          {['teams', 'matches', 'upcoming'].map((tab) => (
            <Button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 h-14 text-lg font-bold ${activeTab === tab ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-200'}`}>
              {tab === 'teams' ? 'Amakipe' : tab === 'matches' ? 'Imikino Yakinnye' : 'Imikino Izaza'}
            </Button>
          ))}
        </div>

        {activeTab === 'teams' && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-6 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Search className="w-6 h-6 text-green-600" />
                <h3 className="text-2xl font-black text-gray-900">Shakisha Ikipe</h3>
              </div>
              <Input placeholder="Andika izina ry'ikipe..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 text-lg border-2 border-gray-200" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTeams.map((team, index) => (
                <motion.div key={team.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="border-2 border-gray-200 hover:border-green-400 hover:shadow-2xl transition-all overflow-hidden group">
                    <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Badge className="mb-3 bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">{team.sport}</Badge>
                          <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{team.name}</h3>
                          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{team.description_rw}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-black text-green-600">{team.wins || 0}</p>
                          <p className="text-xs text-gray-600 font-semibold">Intsinzi</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-black text-red-600">{team.losses || 0}</p>
                          <p className="text-xs text-gray-600 font-semibold">Gutsindwa</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-black text-blue-600">{team.players_count || 0}</p>
                          <p className="text-xs text-gray-600 font-semibold">Abakinnyi</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-700">Umutoza: {team.coach}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Star className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-700">Kapiteni: {team.captain}</span>
                        </div>
                      </div>

                      <Button onClick={() => setSelectedTeam(team)}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold">
                        Reba Byinshi
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <motion.div key={match.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className={`border-2 ${match.result === 'win' ? 'border-green-200 bg-green-50' : match.result === 'loss' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'} hover:shadow-xl transition-all`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Badge className={`mb-3 ${match.result === 'win' ? 'bg-green-600' : match.result === 'loss' ? 'bg-red-600' : 'bg-yellow-600'} text-white`}>
                          {match.result === 'win' ? 'INTSINZI' : match.result === 'loss' ? 'GUTSINDWA' : 'KURINGANIZA'}
                        </Badge>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{match.team_name} vs {match.opponent}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{match.match_date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{match.venue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-gray-900">{match.score}</p>
                        <Badge className="mt-2">{match.sport}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingMatches.map((match, index) => (
              <motion.div key={match.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">{match.sport}</Badge>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">{match.team_name} vs {match.opponent}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold">{match.match_date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">{match.match_time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span className="font-semibold">{match.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTeam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTeam(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-black mb-2">{selectedTeam.name}</h2>
                    <p className="text-xl font-semibold text-white/90">{selectedTeam.sport}</p>
                  </div>
                  <Button onClick={() => setSelectedTeam(null)} variant="ghost" className="text-white hover:bg-white/20">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-green-600">{selectedTeam.wins || 0}</p>
                    <p className="text-sm text-gray-600 font-semibold">Intsinzi</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-red-600">{selectedTeam.losses || 0}</p>
                    <p className="text-sm text-gray-600 font-semibold">Gutsindwa</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-yellow-600">{selectedTeam.draws || 0}</p>
                    <p className="text-sm text-gray-600 font-semibold">Kuringaniza</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-blue-600">{selectedTeam.players_count || 0}</p>
                    <p className="text-sm text-gray-600 font-semibold">Abakinnyi</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-gray-900 mb-3">Ibisobanuro</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedTeam.description_rw}</p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-black text-gray-900 mb-4">Amakuru y'Ikipe</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Umutoza:</span>
                      <span className="font-bold text-gray-900">{selectedTeam.coach}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Kapiteni:</span>
                      <span className="font-bold text-gray-900">{selectedTeam.captain}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Yashinzwe:</span>
                      <span className="font-bold text-gray-900">{selectedTeam.founded_year}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-gray-900 mb-4">Ibihembo</h3>
                  <div className="space-y-2">
                    {selectedTeam.achievements && selectedTeam.achievements.map((achievement: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 bg-yellow-50 rounded-lg p-3">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-gray-900">{achievement.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={() => setSelectedTeam(null)} className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold h-12">
                  Funga
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SportsPage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Calendar, Award, TrendingUp, Target, Medal, Star, ArrowLeft, Search, X, MapPin, Clock, Shield, Loader2, Eye, BarChart3, Mail, Phone, BookOpen, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import TeamDetailPage from './TeamDetailPage';

interface AdvancedSportsPageProps {
  onNavigate: (page: string) => void;
}

const AdvancedSportsPage: React.FC<AdvancedSportsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState<number | null>(null);
  const [filterSport, setFilterSport] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, matchesRes, upcomingRes, coachesRes] = await Promise.all([
        fetch('http://localhost:5000/api/sports/teams'),
        fetch('http://localhost:5000/api/sports/matches?upcoming=false'),
        fetch('http://localhost:5000/api/sports/matches?upcoming=true'),
        fetch('http://localhost:5000/api/services-advanced/coaches')
      ]);
      
      const teamsData = await teamsRes.json();
      const matchesData = await matchesRes.json();
      const upcomingData = await upcomingRes.json();
      const coachesData = await coachesRes.json();
      
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setUpcomingMatches(Array.isArray(upcomingData) ? upcomingData : []);
      setCoaches(Array.isArray(coachesData) ? coachesData : []);
    } catch (error) {
      console.error('Error fetching sports data:', error);
      setTeams([]);
      setMatches([]);
      setUpcomingMatches([]);
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = filterSport === 'all' || team.sport.toLowerCase() === filterSport.toLowerCase();
    return matchesSearch && matchesSport;
  });

  const sports = ['all', 'Football', 'Basketball', 'Volleyball', 'Athletics'];
  
  const stats = [
    { label: 'Amakipe', value: teams.length, icon: Users, color: 'from-green-400 via-emerald-500 to-teal-600' },
    { label: 'Intsinzi', value: teams.reduce((sum, t) => sum + (t.wins || 0), 0), icon: Trophy, color: 'from-yellow-400 via-amber-500 to-orange-600' },
    { label: 'Imikino', value: matches.length, icon: Target, color: 'from-lime-400 via-green-500 to-emerald-600' },
    { label: 'Ibihembo', value: teams.reduce((sum, t) => sum + (t.achievements?.length || 0), 0), icon: Award, color: 'from-amber-400 via-yellow-500 to-orange-600' }
  ];

  if (selectedTeamDetail) {
    return <TeamDetailPage teamId={selectedTeamDetail} onBack={() => setSelectedTeamDetail(null)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-20 h-20 animate-spin text-white mx-auto mb-4" />
          <p className="text-2xl font-black text-white">Gutegura Siporo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-emerald-50 flex">
      {/* Left Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 bg-gradient-to-b from-green-900 via-emerald-900 to-yellow-900 min-h-screen p-6 shadow-2xl sticky top-0 h-screen overflow-y-auto"
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 text-center">Siporo</h1>
          <p className="text-green-200 text-center text-sm">Garden TVET Sports</p>
        </div>

        <div className="space-y-3 mb-8">
          <Button
            onClick={() => setActiveTab('teams')}
            className={`w-full justify-start h-14 text-lg font-bold ${
              activeTab === 'teams'
                ? 'bg-white text-green-900 shadow-xl'
                : 'bg-green-800/50 text-white hover:bg-green-700'
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Amakipe
          </Button>

          <Button
            onClick={() => setActiveTab('matches')}
            className={`w-full justify-start h-14 text-lg font-bold ${
              activeTab === 'matches'
                ? 'bg-white text-green-900 shadow-xl'
                : 'bg-green-800/50 text-white hover:bg-green-700'
            }`}
          >
            <Target className="w-5 h-5 mr-3" />
            Imikino Yakinnye
          </Button>

          <Button
            onClick={() => setActiveTab('upcoming')}
            className={`w-full justify-start h-14 text-lg font-bold ${
              activeTab === 'upcoming'
                ? 'bg-white text-green-900 shadow-xl'
                : 'bg-green-800/50 text-white hover:bg-green-700'
            }`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Imikino Izaza
          </Button>

          <Button
            onClick={() => setActiveTab('analytics')}
            className={`w-full justify-start h-14 text-lg font-bold ${
              activeTab === 'analytics'
                ? 'bg-white text-green-900 shadow-xl'
                : 'bg-green-800/50 text-white hover:bg-green-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Imibare
          </Button>

          <Button
            onClick={() => setActiveTab('achievements')}
            className={`w-full justify-start h-14 text-lg font-bold ${
              activeTab === 'achievements'
                ? 'bg-white text-green-900 shadow-xl'
                : 'bg-green-800/50 text-white hover:bg-green-700'
            }`}
          >
            <Award className="w-5 h-5 mr-3" />
            Ibihembo
          </Button>

          <Button
            onClick={() => setActiveTab('coaches')}
            className={`w-full justify-start h-14 text-lg font-bold ${
              activeTab === 'coaches'
                ? 'bg-white text-green-900 shadow-xl'
                : 'bg-green-800/50 text-white hover:bg-green-700'
            }`}
          >
            <Shield className="w-5 h-5 mr-3" />
            Abatoza
          </Button>
        </div>

        <div className="p-4 bg-green-800/50 rounded-xl mb-4">
          <h3 className="text-white font-bold mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Imibare Yihuse
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-200 text-sm">Amakipe:</span>
              <span className="font-black text-white text-xl">{teams.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-200 text-sm">Intsinzi:</span>
              <span className="font-black text-white text-xl">{teams.reduce((sum, t) => sum + (t.wins || 0), 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-200 text-sm">Imikino:</span>
              <span className="font-black text-white text-xl">{matches.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-200 text-sm">Ibihembo:</span>
              <span className="font-black text-white text-xl">{teams.reduce((sum, t) => sum + (t.achievements?.length || 0), 0)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
          <h3 className="text-white font-black mb-2 text-center">Ikipe Nziza</h3>
          {teams.length > 0 && (() => {
            const topTeam = teams.reduce((prev, current) => 
              ((current.wins || 0) > (prev.wins || 0)) ? current : prev
            );
            return (
              <div className="text-center">
                <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
                <p className="text-white font-black text-lg">{topTeam.name}</p>
                <p className="text-white/90 text-sm">{topTeam.wins || 0} Intsinzi</p>
              </div>
            );
          })()}
        </div>

        <Button
          onClick={() => onNavigate('home')}
          className="w-full mt-6 bg-white text-green-900 hover:bg-green-50 font-bold h-12"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Subira Ahabanza
        </Button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1">
      {/* Animated Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white py-12 px-4 shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl"
              >
                <Trophy className="w-14 h-14 text-white" />
              </motion.div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-4 drop-shadow-lg">Siporo n'Imikino</h1>
            <p className="text-2xl font-bold text-white/95 drop-shadow">Garden TVET Sports Excellence</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Animated Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl"></div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-xl relative z-10`}>
                    <stat.icon className="w-9 h-9 text-white" />
                  </div>
                  <p className="text-4xl font-black text-gray-900 mb-2 text-center">{stat.value}</p>
                  <p className="text-sm font-bold text-gray-600 text-center uppercase tracking-wide">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-green-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-600" />
                  <Input
                    placeholder="Shakisha ikipe cyangwa siporo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-14 text-lg border-2 border-green-200 focus:border-yellow-500 bg-white"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sports.map((sport) => (
                    <Button
                      key={sport}
                      onClick={() => setFilterSport(sport)}
                      className={`h-14 px-6 font-bold whitespace-nowrap ${
                        filterSport === sport
                          ? 'bg-gradient-to-r from-green-600 to-yellow-500 text-white shadow-xl'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400'
                      }`}
                    >
                      {sport === 'all' ? 'Byose' : sport}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['teams', 'matches', 'upcoming', 'analytics'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-16 px-8 text-lg font-black whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400 hover:shadow-xl'
              }`}
            >
              {tab === 'teams' ? 'Amakipe' : tab === 'matches' ? 'Imikino Yakinnye' : tab === 'upcoming' ? 'Imikino Izaza' : 'Imibare'}
            </Button>
          ))}
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-green-50 to-yellow-50 overflow-hidden group">
                  <div className="h-3 bg-gradient-to-r from-green-500 via-yellow-400 to-emerald-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Badge className="mb-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white border-0 text-sm px-4 py-1">
                          {team.sport}
                        </Badge>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{team.name}</h3>
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{team.description_rw}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 text-center border-2 border-green-200">
                        <p className="text-3xl font-black text-green-700">{team.wins || 0}</p>
                        <p className="text-xs text-gray-700 font-bold uppercase">Intsinzi</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-xl p-4 text-center border-2 border-red-200">
                        <p className="text-3xl font-black text-red-700">{team.losses || 0}</p>
                        <p className="text-xs text-gray-700 font-bold uppercase">Gutsindwa</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-4 text-center border-2 border-yellow-200">
                        <p className="text-3xl font-black text-yellow-700">{team.players_count || 0}</p>
                        <p className="text-xs text-gray-700 font-bold uppercase">Abakinnyi</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-gray-900">Umutoza: {team.coach}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="font-bold text-gray-900">Kapiteni: {team.captain}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedTeamDetail(team.id)}
                      className="w-full bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 hover:from-green-700 hover:via-yellow-600 hover:to-emerald-700 text-white font-black shadow-xl"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Reba Ikipe Yose
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className={`border-0 shadow-2xl ${
                  match.result === 'win' ? 'bg-gradient-to-r from-green-100 to-emerald-100' :
                  match.result === 'loss' ? 'bg-gradient-to-r from-red-100 to-pink-100' :
                  'bg-gradient-to-r from-yellow-100 to-amber-100'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Badge className={`mb-3 text-white text-sm px-4 py-1 ${
                          match.result === 'win' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                          match.result === 'loss' ? 'bg-gradient-to-r from-red-600 to-pink-600' :
                          'bg-gradient-to-r from-yellow-600 to-amber-600'
                        }`}>
                          {match.result === 'win' ? '🏆 INTSINZI' : match.result === 'loss' ? '❌ GUTSINDWA' : '🤝 KURINGANIZA'}
                        </Badge>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">{match.team_name} vs {match.opponent}</h3>
                        <div className="flex items-center space-x-6 text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-bold">{match.match_date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span className="font-bold">{match.venue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-5xl font-black text-gray-900 mb-2">{match.score}</p>
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">{match.sport}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upcoming Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-1">
                          {match.sport}
                        </Badge>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">{match.team_name} vs {match.opponent}</h3>
                        <div className="flex items-center space-x-6 text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="font-bold text-lg">{match.match_date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="font-bold text-lg">{match.match_time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span className="font-bold text-lg">{match.venue}</span>
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

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team, index) => (
              team.achievements && team.achievements.length > 0 && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-50 to-amber-50 h-full">
                    <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-600">{team.sport}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {team.achievements.map((achievement: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-white rounded-lg border-2 border-yellow-200">
                            <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-gray-900">{achievement.title}</p>
                              <p className="text-xs text-gray-600">{achievement.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            ))}
          </div>
        )}

        {/* Coaches Tab */}
        {activeTab === 'coaches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach, index) => (
              <motion.div
                key={coach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => setSelectedCoach(coach)}
              >
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-green-50 hover:shadow-2xl transition-all h-full">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-yellow-500"></div>
                  <CardContent className="p-6">
                    {coach.image_url ? (
                      <img
                        src={`http://localhost:5000${coach.image_url}`}
                        alt={coach.name}
                        className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-green-200 shadow-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Shield className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">{coach.name}</h3>
                    <Badge className="mb-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white mx-auto block w-fit">
                      {coach.sport}
                    </Badge>
                    <p className="text-gray-700 font-bold mb-4 text-center">{coach.title}</p>
                    <div className="grid grid-cols-2 gap-2 text-center mb-4">
                      <div className="bg-green-100 rounded-lg p-3">
                        <p className="text-2xl font-black text-green-700">{coach.experience_years}</p>
                        <p className="text-xs text-gray-600 font-bold">Imyaka</p>
                      </div>
                      <div className="bg-yellow-100 rounded-lg p-3">
                        <p className="text-2xl font-black text-yellow-700">{JSON.parse(coach.achievements || '[]').length}</p>
                        <p className="text-xs text-gray-600 font-bold">Ibihembo</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white font-bold">
                      <Eye className="w-4 h-4 mr-2" />
                      Reba Byinshi
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="w-7 h-7 mr-3 text-green-600" />
                  Imibare y'Intsinzi
                </h3>
                <div className="space-y-4">
                  {teams.map((team, index) => {
                    const totalGames = (team.wins || 0) + (team.losses || 0) + (team.draws || 0);
                    const winRate = totalGames > 0 ? ((team.wins || 0) / totalGames * 100) : 0;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{team.name}</span>
                          <span className="text-2xl font-black text-green-600">{winRate.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${winRate}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardContent className="p-6">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                  <Trophy className="w-7 h-7 mr-3 text-yellow-600" />
                  Ibihembo
                </h3>
                <div className="space-y-4">
                  {teams.map((team, index) => (
                    team.achievements && team.achievements.length > 0 && (
                      <div key={index} className="bg-white rounded-xl p-4 border-2 border-yellow-200">
                        <h4 className="font-black text-gray-900 mb-2">{team.name}</h4>
                        <div className="space-y-2">
                          {team.achievements.map((achievement: any, i: number) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Award className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-semibold text-gray-700">{achievement.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>

      {/* Team Detail Modal */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTeam(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white p-8 rounded-t-3xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-4xl font-black mb-3">{selectedTeam.name}</h2>
                    <p className="text-2xl font-bold text-white/95">{selectedTeam.sport}</p>
                  </div>
                  <Button onClick={() => setSelectedTeam(null)} variant="ghost" className="text-white hover:bg-white/20">
                    <X className="w-7 h-7" />
                  </Button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 text-center border-2 border-green-300">
                    <p className="text-4xl font-black text-green-700">{selectedTeam.wins || 0}</p>
                    <p className="text-sm text-gray-700 font-bold uppercase mt-2">Intsinzi</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl p-6 text-center border-2 border-red-300">
                    <p className="text-4xl font-black text-red-700">{selectedTeam.losses || 0}</p>
                    <p className="text-sm text-gray-700 font-bold uppercase mt-2">Gutsindwa</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-6 text-center border-2 border-yellow-300">
                    <p className="text-4xl font-black text-yellow-700">{selectedTeam.draws || 0}</p>
                    <p className="text-sm text-gray-700 font-bold uppercase mt-2">Kuringaniza</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-6 text-center border-2 border-blue-300">
                    <p className="text-4xl font-black text-blue-700">{selectedTeam.players_count || 0}</p>
                    <p className="text-sm text-gray-700 font-bold uppercase mt-2">Abakinnyi</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Ibisobanuro</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">{selectedTeam.description_rw}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border-2 border-blue-200">
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Amakuru y'Ikipe</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-semibold">Umutoza:</span>
                      <span className="font-black text-gray-900 text-lg">{selectedTeam.coach}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-semibold">Kapiteni:</span>
                      <span className="font-black text-gray-900 text-lg">{selectedTeam.captain}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-semibold">Yashinzwe:</span>
                      <span className="font-black text-gray-900 text-lg">{selectedTeam.founded_year}</span>
                    </div>
                  </div>
                </div>

                {selectedTeam.achievements && selectedTeam.achievements.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-gray-900 mb-4">Ibihembo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTeam.achievements.map((achievement: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-4 border-2 border-yellow-300">
                          <Award className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                          <span className="font-bold text-gray-900">{achievement.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setSelectedTeam(null)}
                  className="w-full h-14 bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white font-black text-lg shadow-xl"
                >
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

export default AdvancedSportsPage;

      {/* Coach Detail Modal */}
      <AnimatePresence>
        {selectedCoach && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedCoach(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-8"
            >
              {/* Hero Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white p-8 rounded-t-3xl">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-5xl font-black mb-3">{selectedCoach.name}</h2>
                    <p className="text-2xl font-bold text-white/95">{selectedCoach.title}</p>
                  </div>
                  <Button onClick={() => setSelectedCoach(null)} variant="ghost" className="text-white hover:bg-white/20">
                    <X className="w-7 h-7" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-white text-green-900 text-lg px-6 py-2">
                    <Shield className="w-5 h-5 mr-2 inline" />
                    {selectedCoach.sport}
                  </Badge>
                  <Badge className="bg-white text-green-900 text-lg px-6 py-2">
                    <Award className="w-5 h-5 mr-2 inline" />
                    {selectedCoach.experience_years} Years Experience
                  </Badge>
                </div>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {/* Profile Image & Quick Info */}
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  {selectedCoach.image_url ? (
                    <img
                      src={`http://localhost:5000${selectedCoach.image_url}`}
                      alt={selectedCoach.name}
                      className="w-64 h-64 rounded-2xl object-cover border-8 border-green-200 shadow-2xl mx-auto md:mx-0"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-gradient-to-br from-green-400 to-yellow-400 rounded-2xl flex items-center justify-center border-8 border-green-200 shadow-2xl mx-auto md:mx-0">
                      <Shield className="w-32 h-32 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-yellow-50 h-full">
                      <CardContent className="p-6">
                        <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                          <Users className="w-6 h-6 mr-2 text-green-600" />
                          Contact Information
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                              <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-bold text-gray-900">{selectedCoach.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                              <Phone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-bold text-gray-900">{selectedCoach.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Office Location</p>
                              <p className="font-bold text-gray-900">{selectedCoach.office_location}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Biography */}
                <Card className="border-0 shadow-xl mb-6">
                  <CardContent className="p-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
                      <BookOpen className="w-8 h-8 mr-3 text-green-600" />
                      Umwirondoro / Biography
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-bold text-green-600 mb-3">Kinyarwanda</h4>
                        <p className="text-gray-700 leading-relaxed text-lg">{selectedCoach.bio_rw}</p>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-green-600 mb-3">English</h4>
                        <p className="text-gray-700 leading-relaxed text-lg">{selectedCoach.bio_en}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Qualifications */}
                <Card className="border-0 shadow-xl mb-6">
                  <CardContent className="p-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
                      <Award className="w-8 h-8 mr-3 text-green-600" />
                      Impamyabumenyi / Qualifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {JSON.parse(selectedCoach.qualifications || '[]').map((qual: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
                        >
                          <Star className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-800 font-medium text-base">{qual}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="border-0 shadow-xl mb-6">
                  <CardContent className="p-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
                      <Trophy className="w-8 h-8 mr-3 text-yellow-600" />
                      Ibyatsinzwe / Achievements
                    </h3>
                    <div className="space-y-3">
                      {JSON.parse(selectedCoach.achievements || '[]').map((achievement: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-500"
                        >
                          <Trophy className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-800 font-medium text-base">{achievement}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Specializations */}
                <Card className="border-0 shadow-xl mb-6">
                  <CardContent className="p-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
                      <Target className="w-8 h-8 mr-3 text-green-600" />
                      Ubumenyi Bwihariye / Specializations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {JSON.parse(selectedCoach.specializations || '[]').map((spec: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl text-center border-2 border-green-300"
                        >
                          <Briefcase className="w-10 h-10 text-green-600 mx-auto mb-3" />
                          <p className="font-bold text-gray-900 text-base">{spec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Close Button */}
                <Button
                  onClick={() => setSelectedCoach(null)}
                  className="w-full h-16 bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white font-black text-xl shadow-xl"
                >
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

export default AdvancedSportsPage;

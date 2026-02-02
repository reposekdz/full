import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Calendar, TrendingUp, Award, Target, Zap, Star, ChevronRight, Filter, Search, Medal, Clock, MapPin, Activity, BarChart3, Flame, Crown, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface ModernSportsPageProps {
  onNavigate: (page: string) => void;
}

const ModernSportsPage: React.FC<ModernSportsPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSport, setFilterSport] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [teamsRes, statsRes, matchesRes, playersRes, leaderboardRes] = await Promise.all([
        fetch('http://localhost:5000/api/sports/teams'),
        fetch('http://localhost:5000/api/sports/analytics'),
        fetch('http://localhost:5000/api/sports/upcoming-matches'),
        fetch('http://localhost:5000/api/sports/top-players'),
        fetch('http://localhost:5000/api/sports/leaderboard')
      ]);

      const [teamsData, statsData, matchesData, playersData, leaderboardData] = await Promise.all([
        teamsRes.json(),
        statsRes.json(),
        matchesData.json(),
        playersRes.json(),
        leaderboardRes.json()
      ]);

      if (teamsData.success) setTeams(teamsData.teams);
      if (statsData.success) setStatistics(statsData.analytics);
      if (matchesData.success) setUpcomingMatches(matchesData.matches);
      if (playersData.success) setTopPlayers(playersData.players);
      if (leaderboardData.success) setLeaderboard(leaderboardData.leaderboard);
    } catch (error) {
      console.error('Failed to fetch sports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.name_en?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = filterSport === 'all' || team.sport_type === filterSport;
    return matchesSearch && matchesSport;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 text-white py-20 overflow-hidden"
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-16 h-16" />
              <h1 className="text-6xl font-black">SIPORO</h1>
            </div>
            <p className="text-2xl font-semibold mb-6">Garden TVET School Sports Excellence</p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-lg font-bold">{statistics?.players || 0} Abakinnyi</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="text-lg font-bold">{statistics?.teams || 0} Amakipe</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span className="text-lg font-bold">{statistics?.matches || 0} Imikino</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-lg font-bold">{statistics?.achievements || 0} Ibihembo</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <Card className="shadow-2xl border-2 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Shakisha ikipe cyangwa umukinnyi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg border-2 border-green-200 focus:border-green-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterSport === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterSport('all')}
                  className="h-12"
                >
                  Byose
                </Button>
                <Button
                  variant={filterSport === 'football' ? 'default' : 'outline'}
                  onClick={() => setFilterSport('football')}
                  className="h-12"
                >
                  Umupira w'Amaguru
                </Button>
                <Button
                  variant={filterSport === 'basketball' ? 'default' : 'outline'}
                  onClick={() => setFilterSport('basketball')}
                  className="h-12"
                >
                  Basketball
                </Button>
                <Button
                  variant={filterSport === 'volleyball' ? 'default' : 'outline'}
                  onClick={() => setFilterSport('volleyball')}
                  className="h-12"
                >
                  Volleyball
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="teams" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-white shadow-lg">
            <TabsTrigger value="teams" className="text-lg font-bold">
              <Shield className="w-5 h-5 mr-2" />
              Amakipe
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-lg font-bold">
              <Crown className="w-5 h-5 mr-2" />
              Ibyiciro
            </TabsTrigger>
            <TabsTrigger value="players" className="text-lg font-bold">
              <Star className="w-5 h-5 mr-2" />
              Abakinnyi
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-lg font-bold">
              <Calendar className="w-5 h-5 mr-2" />
              Imikino
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => onNavigate(`sport-team/${team.id}`)}
                  className="cursor-pointer"
                >
                  <Card className="overflow-hidden border-2 border-green-200 hover:border-yellow-400 hover:shadow-2xl transition-all group">
                    <div className="relative h-56 overflow-hidden">
                      <motion.img
                        src={team.image_url || '/placeholder-team.jpg'}
                        alt={team.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-yellow-500 text-black font-bold text-sm">
                          <Flame className="w-4 h-4 mr-1" />
                          {team.total_wins || 0} Intsinzi
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-3xl font-black text-white mb-1">{team.name}</h3>
                        <p className="text-white/90 font-semibold">{team.name_en}</p>
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <p className="text-gray-700 line-clamp-2">{team.description}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Users className="w-5 h-5 mx-auto mb-1 text-green-600" />
                          <p className="text-2xl font-black text-green-700">{team.total_players || 0}</p>
                          <p className="text-xs text-gray-600">Abakinnyi</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                          <p className="text-2xl font-black text-yellow-700">{team.total_achievements || 0}</p>
                          <p className="text-xs text-gray-600">Ibihembo</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                          <p className="text-2xl font-black text-blue-700">{team.total_goals || 0}</p>
                          <p className="text-xs text-gray-600">Ibitego</p>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 font-bold group-hover:shadow-lg">
                        Reba Byose
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="border-2 border-yellow-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                <CardTitle className="text-3xl font-black flex items-center gap-3">
                  <Crown className="w-8 h-8" />
                  Ibyiciro by'Amakipe
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {leaderboard.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
                        index === 0 ? 'bg-yellow-50 border-yellow-400' :
                        index === 1 ? 'bg-gray-50 border-gray-400' :
                        index === 2 ? 'bg-orange-50 border-orange-400' :
                        'bg-white border-gray-200'
                      } hover:shadow-lg transition-all cursor-pointer`}
                      onClick={() => onNavigate(`sport-team/${team.id}`)}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900">{team.name}</h4>
                        <p className="text-sm text-gray-600">{team.players} abakinnyi</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-green-600">{team.wins}</p>
                        <p className="text-sm text-gray-600">Intsinzi</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-700">{team.matches}</p>
                        <p className="text-sm text-gray-600">Imikino</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-2 border-green-200 hover:border-yellow-400 hover:shadow-xl transition-all">
                    <CardContent className="p-6 text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full blur-md opacity-50" />
                        <img
                          src={player.photo_url || '/placeholder-player.jpg'}
                          alt={player.name}
                          className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        {index < 3 && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star className="w-5 h-5 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{player.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{player.position}</p>
                      <Badge className="mb-3">{player.team_name}</Badge>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-green-50 p-2 rounded-lg">
                          <p className="text-2xl font-black text-green-600">{player.goals || 0}</p>
                          <p className="text-xs text-gray-600">Ibitego</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <p className="text-2xl font-black text-blue-600">{player.matches_played || 0}</p>
                          <p className="text-xs text-gray-600">Imikino</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Upcoming Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 border-green-200 hover:shadow-xl transition-all">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-green-600">{match.competition || 'Umukino'}</Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {new Date(match.match_date).toLocaleDateString('rw-RW')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center flex-1">
                          <img
                            src={match.icon || '/placeholder-team.jpg'}
                            alt={match.team_name}
                            className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-green-200"
                          />
                          <p className="font-bold text-lg">{match.team_name}</p>
                        </div>
                        <div className="text-center px-4">
                          <p className="text-4xl font-black text-gray-400">VS</p>
                        </div>
                        <div className="text-center flex-1">
                          <img
                            src={match.opponent_logo || '/placeholder-team.jpg'}
                            alt={match.opponent}
                            className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-yellow-200"
                          />
                          <p className="font-bold text-lg">{match.opponent}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{match.location}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{match.match_time}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModernSportsPage;

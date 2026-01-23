import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Users, Calendar, Target, TrendingUp, Award, Star, MapPin, Clock, Play, Share2, Heart, Medal, Zap } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface VolleyballDetailPageProps {
  onNavigate: (page: string) => void;
}

const API_BASE = 'http://localhost:5000/api';

const VolleyballDetailPage: React.FC<VolleyballDetailPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [trophies, setTrophies] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolleyballData();
  }, []);

  const fetchVolleyballData = async () => {
    try {
      const [teamsRes, playersRes, matchesRes, upcomingRes, trophiesRes, galleryRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/sports/teams?sport_type=volleyball`),
        fetch(`${API_BASE}/sports/players/top?sport_type=volleyball&limit=12`),
        fetch(`${API_BASE}/sports/matches/results?sport_type=volleyball&limit=10`),
        fetch(`${API_BASE}/sports/matches/upcoming?sport_type=volleyball&limit=5`),
        fetch(`${API_BASE}/sports/trophies?sport_type=volleyball`),
        fetch(`${API_BASE}/sports/gallery?sport_type=volleyball&limit=12`),
        fetch(`${API_BASE}/sports/statistics`)
      ]);

      const [teamsData, playersData, matchesData, upcomingData, trophiesData, galleryData, statsData] = await Promise.all([
        teamsRes.json(), playersRes.json(), matchesRes.json(), upcomingRes.json(), trophiesRes.json(), galleryRes.json(), statsRes.json()
      ]);

      if (teamsData.success) setTeams(teamsData.teams);
      if (playersData.success) setPlayers(playersData.players);
      if (matchesData.success) setMatches(matchesData.matches);
      if (upcomingData.success) setUpcomingMatches(upcomingData.matches);
      if (trophiesData.success) setTrophies(trophiesData.trophies);
      if (galleryData.success) setGallery(galleryData.gallery);
      if (statsData.success) setStats(statsData.statistics);
    } catch (error) {
      console.error('Error fetching volleyball data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    { label: 'Teams', value: teams.length.toString(), icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'Players', value: players.length.toString(), icon: Star, color: 'from-purple-500 to-violet-600' },
    { label: 'Matches', value: matches.length.toString(), icon: Calendar, color: 'from-cyan-500 to-teal-600' },
    { label: 'Trophies', value: trophies.length.toString(), icon: Trophy, color: 'from-yellow-500 to-orange-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-3xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-80 rounded-3xl overflow-hidden mb-8 shadow-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1600&q=80"
            alt="Volleyball"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/80 to-blue-600/90" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-8xl mb-4"
            >
              🏐
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">Volleyball</h1>
            <p className="text-xl text-blue-100 max-w-2xl">Umupira wo mu Kirere - Reach for the Sky</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => onNavigate('sports')}
            className="absolute top-4 left-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Sports
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-5 text-center">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border-2 border-blue-200 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-bold">
              Overview
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-bold">
              Teams
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-bold">
              Players
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-bold">
              Matches
            </TabsTrigger>
            <TabsTrigger value="trophies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-bold">
              Trophies
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-2 border-blue-200 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  About Volleyball at Garden TVET
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our volleyball program has established itself as a powerhouse in regional competitions. With dedicated training facilities 
                  and expert coaching staff, we nurture athletes who excel in teamwork, agility, and strategic play. Our teams consistently 
                  perform at the highest levels in both indoor and beach volleyball competitions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-2">Training Schedule</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Monday - Friday: 3:30 PM - 5:30 PM</li>
                      <li>• Saturday: 8:00 AM - 11:00 AM</li>
                      <li>• Sunday: Optional practice</li>
                    </ul>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h3 className="font-bold text-indigo-900 mb-2">Facilities</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Professional indoor court</li>
                      <li>• Beach volleyball court</li>
                      <li>• Strength & conditioning area</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Matches */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Upcoming Matches
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.map((match) => (
                  <Card key={match.id} className="border-2 border-purple-200 hover:shadow-xl transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-purple-100 text-purple-700 font-bold">Upcoming</Badge>
                        <span className="text-sm text-gray-500">{match.match_date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <p className="font-bold text-gray-900">{match.home_team}</p>
                        </div>
                        <div className="px-4">
                          <span className="text-2xl font-black text-gray-400">VS</span>
                        </div>
                        <div className="text-center flex-1">
                          <p className="font-bold text-gray-900">{match.away_team}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{match.location || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{match.match_time || 'TBD'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Play className="w-6 h-6 text-cyan-600" />
                  Photo Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      className="relative h-48 rounded-xl overflow-hidden shadow-lg cursor-pointer"
                    >
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <p className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold">{item.title}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="border-2 border-blue-200 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-600">{team.player_count} players</p>
                      </div>
                    </div>
                    {team.description && (
                      <p className="text-sm text-gray-700 mb-4">{team.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-700 font-bold">{team.category || 'Senior'}</Badge>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {players.map((player) => (
                <Card key={player.id} className="border-2 border-purple-200 hover:shadow-xl transition-all">
                  <CardContent className="p-5 text-center">
                    {player.photo ? (
                      <img src={player.photo} alt={player.name} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-purple-200" />
                    ) : (
                      <Avatar className="w-24 h-24 mx-auto mb-3 border-4 border-purple-200">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-2xl font-bold">
                          {player.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <h3 className="text-lg font-black text-gray-900 mb-1">{player.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{player.position}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Spikes</p>
                        <p className="text-lg font-black text-blue-600">{player.total_goals || 0}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Blocks</p>
                        <p className="text-lg font-black text-purple-600">{player.total_assists || 0}</p>
                      </div>
                      <div className="bg-cyan-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Matches</p>
                        <p className="text-lg font-black text-cyan-600">{player.matches_played || 0}</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                      {player.team_name || 'Garden TVET'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <div className="space-y-4">
              {matches.map((match) => (
                <Card key={match.id} className="border-2 border-cyan-200 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-cyan-100 text-cyan-700 font-bold">{match.competition || 'League'}</Badge>
                      <span className="text-sm text-gray-500">{match.match_date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="font-bold text-gray-900 text-lg mb-2">{match.home_team}</p>
                        <p className="text-4xl font-black text-blue-600">{match.home_score}</p>
                      </div>
                      <div className="px-6">
                        <span className="text-3xl font-black text-gray-400">-</span>
                      </div>
                      <div className="text-center flex-1">
                        <p className="font-bold text-gray-900 text-lg mb-2">{match.away_team}</p>
                        <p className="text-4xl font-black text-indigo-600">{match.away_score}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{match.location || 'Home Court'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trophies Tab */}
          <TabsContent value="trophies" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trophies.map((trophy) => (
                <Card key={trophy.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="text-6xl mb-4"
                    >
                      🏆
                    </motion.div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{trophy.trophy_name}</h3>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold mb-3">
                      {trophy.year}
                    </Badge>
                    <p className="text-sm text-gray-700 mb-2">{trophy.competition}</p>
                    <p className="text-xs text-gray-500">{trophy.date_won}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VolleyballDetailPage;

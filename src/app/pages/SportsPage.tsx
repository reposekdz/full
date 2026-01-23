import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Calendar, Award, TrendingUp, Target, Medal, Star, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

const SportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const sportsCategories = [
    { id: 1, name: 'Basketball', name_rw: 'Basketball', icon: Trophy, color: 'from-orange-500 to-red-600', teams: 3, players: 45 },
    { id: 2, name: 'Football', name_rw: 'Umupira w\'Amaguru', icon: Target, color: 'from-green-500 to-teal-600', teams: 4, players: 88 },
    { id: 3, name: 'Volleyball', name_rw: 'Volleyball', icon: Medal, color: 'from-blue-500 to-indigo-600', teams: 2, players: 24 },
    { id: 4, name: 'Athletics', name_rw: 'Imikino Ngororamubiri', icon: Star, color: 'from-yellow-500 to-orange-600', teams: 1, players: 56 }
  ];

  const upcomingMatches = [
    { id: 1, sport: 'Basketball', team1: 'Garden TVET A', team2: 'Rival School', date: '2026-02-01', time: '14:00', venue: 'Main Court' },
    { id: 2, sport: 'Football', team1: 'Garden TVET', team2: 'City College', date: '2026-02-05', time: '16:00', venue: 'Stadium' },
    { id: 3, sport: 'Volleyball', team1: 'Garden TVET', team2: 'Tech Institute', date: '2026-02-08', time: '15:00', venue: 'Sports Hall' }
  ];

  const achievements = [
    { id: 1, title: 'Regional Champions 2025', sport: 'Basketball', icon: Trophy, color: 'text-yellow-500' },
    { id: 2, title: 'Best Team Award', sport: 'Football', icon: Award, color: 'text-green-500' },
    { id: 3, title: 'Fair Play Trophy', sport: 'Volleyball', icon: Medal, color: 'text-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Sports & Athletics
          </h1>
          <p className="text-xl text-gray-600">Siporo n'Imikino Ngororamubiri</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-yellow-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sportsCategories.map((sport, index) => {
                const Icon = sport.icon;
                return (
                  <motion.div
                    key={sport.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                  >
                    <Card className="border-2 border-yellow-200 hover:border-green-400 transition-all cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${sport.color} flex items-center justify-center shadow-xl`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{sport.name}</h3>
                        <p className="text-gray-600 mb-4">{sport.name_rw}</p>
                        <div className="flex justify-around text-sm">
                          <div>
                            <p className="font-bold text-2xl text-yellow-600">{sport.teams}</p>
                            <p className="text-gray-500">Teams</p>
                          </div>
                          <div>
                            <p className="font-bold text-2xl text-green-600">{sport.players}</p>
                            <p className="text-gray-500">Players</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Card className="border-2 border-yellow-200">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                  Upcoming Matches
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingMatches.map((match) => (
                    <motion.div
                      key={match.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl border-2 border-yellow-200 hover:border-green-400 transition-all"
                    >
                      <div className="flex-1">
                        <Badge className="mb-2 bg-gradient-to-r from-yellow-500 to-green-500 text-white">{match.sport}</Badge>
                        <h4 className="font-bold text-lg">{match.team1} vs {match.team2}</h4>
                        <p className="text-sm text-gray-600">{match.venue}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">{match.date}</p>
                        <p className="text-gray-600">{match.time}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 ml-4" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sportsCategories.map((sport) => (
                <Card key={sport.id} className="border-2 border-yellow-200">
                  <CardHeader className={`bg-gradient-to-r ${sport.color}`}>
                    <CardTitle className="text-white flex items-center gap-2">
                      {React.createElement(sport.icon, { className: "w-6 h-6" })}
                      {sport.name} Teams
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {[...Array(sport.teams)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-bold">Team {String.fromCharCode(65 + i)}</p>
                            <p className="text-sm text-gray-600">{Math.floor(sport.players / sport.teams)} players</p>
                          </div>
                          <Badge>Active</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matches">
            <Card className="border-2 border-yellow-200">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
                <CardTitle>Match Schedule</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingMatches.map((match) => (
                    <div key={match.id} className="p-6 border-2 border-yellow-200 rounded-xl hover:border-green-400 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white text-lg px-4 py-2">{match.sport}</Badge>
                        <div className="text-right">
                          <p className="font-bold text-xl text-yellow-600">{match.date}</p>
                          <p className="text-gray-600">{match.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-8 mb-4">
                        <div className="text-center flex-1">
                          <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-yellow-500 to-green-500 rounded-full flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-white" />
                          </div>
                          <p className="font-bold text-lg">{match.team1}</p>
                        </div>
                        <div className="text-4xl font-black text-gray-300">VS</div>
                        <div className="text-center flex-1">
                          <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-white" />
                          </div>
                          <p className="font-bold text-lg">{match.team2}</p>
                        </div>
                      </div>
                      <p className="text-center text-gray-600">📍 {match.venue}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                  >
                    <Card className="border-2 border-yellow-200 hover:border-green-400 transition-all">
                      <CardContent className="p-8 text-center">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-green-500 rounded-full flex items-center justify-center shadow-2xl">
                          <Icon className={`w-12 h-12 text-white`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">{achievement.sport}</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SportsPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Star, TrendingUp, Medal, Target, Zap, Crown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function GamificationSystemPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [period, setPeriod] = useState('all');
  const [userPoints, setUserPoints] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaderboard();
    fetchBadges();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/gamification/leaderboard?period=${period}&limit=50`);
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) { console.error(err); }
  };

  const fetchBadges = async () => {
    try {
      const res = await axios.get(`${API_URL}/gamification/badges`);
      setBadges(res.data.badges || []);
    } catch (err) { console.error(err); }
  };

  const stats = [
    { title: 'Total Players', value: leaderboard.length, icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Active Badges', value: badges.length, icon: Award, color: 'from-purple-500 to-purple-600' },
    { title: 'Top Score', value: leaderboard[0]?.total_points || 0, icon: Star, color: 'from-blue-500 to-blue-600' },
    { title: 'Avg Points', value: Math.round(leaderboard.reduce((acc, p) => acc + (p.total_points || 0), 0) / (leaderboard.length || 1)), icon: TrendingUp, color: 'from-green-500 to-green-600' }
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-500 font-bold">#{rank}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Gamification System</h1>
          <p className="text-gray-600">Points, badges, and leaderboards</p>
        </div>
        <div className="flex gap-2">
          <Button variant={period === 'all' ? 'default' : 'outline'} onClick={() => setPeriod('all')}>All Time</Button>
          <Button variant={period === 'month' ? 'default' : 'outline'} onClick={() => setPeriod('month')}>This Month</Button>
          <Button variant={period === 'week' ? 'default' : 'outline'} onClick={() => setPeriod('week')}>This Week</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/80 text-sm">{stat.title}</p>
                      <p className="text-3xl font-black mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className="w-10 h-10 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Badges</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((player, idx) => (
                    <TableRow key={player.id} className={idx < 3 ? 'bg-yellow-50' : ''}>
                      <TableCell className="text-center">{getRankIcon(player.rank || idx + 1)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                              {player.first_name?.charAt(0)}{player.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{player.first_name} {player.last_name}</p>
                            <p className="text-xs text-gray-500">Student ID: {player.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-lg">{player.total_points || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-500">{player.badge_count || 0} Badges</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <Progress value={Math.min((player.total_points / 10000) * 100, 100)} className="h-2" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Available Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map(badge => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <Card className="overflow-hidden border-2 hover:border-purple-500 transition">
                      <CardContent className="p-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                        <div className="flex items-center justify-center gap-2">
                          <Target className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-semibold">{badge.points_required} points</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {badges.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No badges available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

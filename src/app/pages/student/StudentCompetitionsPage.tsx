import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Gem, Award, Target, Zap, Users, Calendar, Clock, TrendingUp, Crown, Star, Flame } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function StudentCompetitionsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [myCompetitions, setMyCompetitions] = useState<any[]>([]);
  const [tradeLeaderboard, setTradeLeaderboard] = useState<any[]>([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState<any[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null);
  const [competitionLeaderboard, setCompetitionLeaderboard] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
    fetchCompetitions();
    fetchMyCompetitions();
    fetchLeaderboards();
    fetchAnalytics();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/student-competitions/student/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDashboard(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCompetitions = async () => {
    try {
      const student = JSON.parse(localStorage.getItem('student') || '{}');
      const res = await axios.get(`${API_URL}/student-competitions/competitions?trade_id=${student.trade_id}&status=active`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCompetitions(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyCompetitions = async () => {
    try {
      const res = await axios.get(`${API_URL}/student-competitions/student/my-competitions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyCompetitions(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLeaderboards = async () => {
    try {
      const student = JSON.parse(localStorage.getItem('student') || '{}');
      const [tradeRes, overallRes] = await Promise.all([
        axios.get(`${API_URL}/student-competitions/leaderboard/trade/${student.trade_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/student-competitions/leaderboard/overall`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setTradeLeaderboard(tradeRes.data);
      setOverallLeaderboard(overallRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}/student-competitions/analytics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAnalytics(res.data);
    } catch (err) { console.error(err); }
  };

  const registerCompetition = async (competitionId: number) => {
    try {
      await axios.post(`${API_URL}/student-competitions/competitions/${competitionId}/register`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCompetitions();
      fetchMyCompetitions();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  const viewLeaderboard = async (competitionId: number) => {
    try {
      const res = await axios.get(`${API_URL}/student-competitions/competitions/${competitionId}/leaderboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCompetitionLeaderboard(res.data);
    } catch (err) { console.error(err); }
  };

  const getMedalIcon = (type: string) => {
    switch (type) {
      case 'diamond': return <Gem className="w-6 h-6 text-cyan-400" />;
      case 'gold': return <Medal className="w-6 h-6 text-yellow-500" />;
      case 'silver': return <Medal className="w-6 h-6 text-gray-400" />;
      case 'bronze': return <Medal className="w-6 h-6 text-orange-600" />;
      default: return <Award className="w-6 h-6 text-gray-400" />;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-8 h-8 text-orange-600" />;
    return <span className="text-2xl font-black text-gray-600">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Amarushanwa & Amanota
          </h1>
          <p className="text-gray-600 mt-1">Compete, Win Medals & Earn Points!</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-2 border-purple-200 hover:shadow-2xl transition">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Total Points</p>
                    <p className="text-4xl font-black">{dashboard?.total_points || 0}</p>
                  </div>
                  <Zap className="w-12 h-12 opacity-80" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white">Rank #{dashboard?.rank_in_trade || '-'}</Badge>
                  <span className="text-xs text-white/80">in your trade</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden border-2 border-cyan-200 hover:shadow-2xl transition">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Diamond Medals</p>
                    <p className="text-4xl font-black">{dashboard?.medals?.diamond || 0}</p>
                  </div>
                  <Gem className="w-12 h-12 opacity-80" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="font-bold">{dashboard?.medals?.gold || 0}</p>
                    <p className="text-white/70">Gold</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{dashboard?.medals?.silver || 0}</p>
                    <p className="text-white/70">Silver</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{dashboard?.medals?.bronze || 0}</p>
                    <p className="text-white/70">Bronze</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="overflow-hidden border-2 border-pink-200 hover:shadow-2xl transition">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Competitions</p>
                    <p className="text-4xl font-black">{dashboard?.total_competitions || 0}</p>
                  </div>
                  <Trophy className="w-12 h-12 opacity-80" />
                </div>
                <Progress value={((dashboard?.total_competitions || 0) / 10) * 100} className="h-2 bg-white/20" />
                <p className="text-xs text-white/80 mt-2">Complete 10 for achievement</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="overflow-hidden border-2 border-yellow-200 hover:shadow-2xl transition">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Overall Rank</p>
                    <p className="text-4xl font-black">#{dashboard?.overall_rank || '-'}</p>
                  </div>
                  <Crown className="w-12 h-12 opacity-80" />
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs">Keep competing to climb!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="competitions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-purple-200">
          <TabsTrigger value="competitions">Available</TabsTrigger>
          <TabsTrigger value="my-competitions">My Competitions</TabsTrigger>
          <TabsTrigger value="trade-leaderboard">Trade Rank</TabsTrigger>
          <TabsTrigger value="overall-leaderboard">Overall Rank</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map(comp => (
              <motion.div key={comp.id} whileHover={{ scale: 1.02 }} className="h-full">
                <Card className="h-full border-2 border-purple-200 hover:border-purple-400 transition hover:shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{comp.title}</CardTitle>
                        <p className="text-xs text-white/80 mt-1">{comp.category_name}</p>
                      </div>
                      {getMedalIcon(comp.medal_type)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{comp.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(comp.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{comp.participant_count}/{comp.max_participants}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        +{comp.points_reward} pts
                      </Badge>
                      <Badge variant="outline">{comp.competition_type}</Badge>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                          disabled={comp.is_registered > 0}
                          onClick={() => { setSelectedCompetition(comp); viewLeaderboard(comp.id); }}
                        >
                          {comp.is_registered > 0 ? 'Registered' : 'View Details'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{selectedCompetition?.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-gray-600">{selectedCompetition?.description}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Rules</h4>
                            <p className="text-sm text-gray-600">{selectedCompetition?.rules || 'Follow standard competition rules'}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Current Leaderboard</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {competitionLeaderboard.map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-600">#{entry.rank}</span>
                                    <span className="text-sm">{entry.student_name}</span>
                                  </div>
                                  <span className="font-bold text-purple-600">{entry.score}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {selectedCompetition?.is_registered === 0 && (
                            <Button 
                              onClick={() => { registerCompetition(selectedCompetition.id); }}
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                              Register Now
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-competitions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Competitions</CardTitle>
                {analytics && (
                  <div className="flex gap-4 text-sm">
                    <Badge className="bg-blue-500">Total: {myCompetitions.length}</Badge>
                    <Badge className="bg-green-500">Completed: {myCompetitions.filter(c => c.completion_status === 'completed').length}</Badge>
                    <Badge className="bg-yellow-500">In Progress: {myCompetitions.filter(c => c.completion_status === 'in_progress').length}</Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCompetitions.map(comp => (
                  <div key={comp.id} className="flex items-center justify-between p-4 border-2 border-purple-100 rounded-lg hover:border-purple-300 transition">
                    <div className="flex items-center gap-4">
                      {getMedalIcon(comp.medal_earned)}
                      <div>
                        <p className="font-semibold">{comp.title}</p>
                        <p className="text-xs text-gray-500">{comp.category_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {comp.rank && <Badge className="bg-purple-500">Rank #{comp.rank}</Badge>}
                      <Badge className="bg-yellow-500">+{comp.points_earned} pts</Badge>
                      <Badge variant={comp.completion_status === 'completed' ? 'default' : 'outline'}>
                        {comp.completion_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trade-leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Trade Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tradeLeaderboard.map((entry, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                    <div className={`flex items-center justify-between p-4 rounded-lg ${idx < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 flex justify-center">{getRankIcon(idx + 1)}</div>
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            {entry.student_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{entry.student_name}</p>
                          <p className="text-xs text-gray-500">{entry.student_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-black text-purple-600">{entry.total_points}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                        <div className="flex gap-1">
                          {entry.diamond_medals > 0 && <Badge className="bg-cyan-500">{entry.diamond_medals}💎</Badge>}
                          {entry.gold_medals > 0 && <Badge className="bg-yellow-500">{entry.gold_medals}🥇</Badge>}
                          {entry.silver_medals > 0 && <Badge className="bg-gray-400">{entry.silver_medals}🥈</Badge>}
                          {entry.bronze_medals > 0 && <Badge className="bg-orange-600">{entry.bronze_medals}🥉</Badge>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overall-leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Overall School Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overallLeaderboard.map((entry, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                    <div className={`flex items-center justify-between p-4 rounded-lg ${idx < 3 ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 flex justify-center">{getRankIcon(entry.rank)}</div>
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            {entry.student_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{entry.student_name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">{entry.student_code}</p>
                            <Badge variant="outline" className="text-xs">{entry.trade_name}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{entry.total_points}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                        <div className="flex gap-1">
                          {entry.diamond_medals > 0 && <Badge className="bg-cyan-500">{entry.diamond_medals}💎</Badge>}
                          {entry.gold_medals > 0 && <Badge className="bg-yellow-500">{entry.gold_medals}🥇</Badge>}
                          {entry.silver_medals > 0 && <Badge className="bg-gray-400">{entry.silver_medals}🥈</Badge>}
                          {entry.bronze_medals > 0 && <Badge className="bg-orange-600">{entry.bronze_medals}🥉</Badge>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

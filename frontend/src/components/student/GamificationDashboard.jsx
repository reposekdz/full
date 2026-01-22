import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Star, TrendingUp, Zap, Crown } from 'lucide-react';

const GamificationDashboard = ({ studentId }) => {
  const [level, setLevel] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [points, setPoints] = useState(null);

  useEffect(() => {
    fetchGamificationData();
  }, [studentId]);

  const fetchGamificationData = async () => {
    const [levelRes, badgesRes, leaderboardRes, pointsRes] = await Promise.all([
      fetch(`/api/gamification/level/${studentId}`),
      fetch(`/api/gamification/badges/${studentId}`),
      fetch(`/api/gamification/leaderboard/class/weekly`),
      fetch(`/api/gamification/points/${studentId}`)
    ]);

    setLevel(await levelRes.json());
    setBadges(await badgesRes.json());
    setLeaderboard(await leaderboardRes.json());
    setPoints(await pointsRes.json());
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-400',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    };
    return colors[rarity] || 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
              <p className="text-3xl font-bold">{level?.current_level || 1}</p>
              <p className="text-sm text-gray-500">Current Level</p>
              <p className="text-xs text-gray-400 mt-1">{level?.level_title}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Star className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold">{level?.current_xp || 0}</p>
              <p className="text-sm text-gray-500">XP</p>
              <Progress value={(level?.current_xp / level?.next_level_xp) * 100} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-2 text-purple-500" />
              <p className="text-3xl font-bold">{badges.length}</p>
              <p className="text-sm text-gray-500">Badges Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">My Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="points">Points History</TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className="text-center p-4 border rounded-lg hover:shadow-lg transition">
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full ${getRarityColor(badge.rarity)} flex items-center justify-center`}>
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-sm">{badge.badge_name}</p>
                    <Badge className={`mt-1 ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{badge.badge_description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Earned: {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((student, idx) => (
                  <div key={student.student_id} className={`flex items-center justify-between p-3 rounded-lg ${idx < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-yellow-500 text-white' :
                        idx === 1 ? 'bg-gray-400 text-white' :
                        idx === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-200'
                      }`}>
                        {idx === 0 ? <Crown className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-xs text-gray-500">Level {student.current_level} • {student.level_title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{student.total_points}</p>
                      <p className="text-xs text-gray-500">{student.activities_count} activities</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>Points Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-semibold">Total Points</span>
                  <span className="text-2xl font-bold text-blue-600">{points?.total || 0}</span>
                </div>
                
                {points?.breakdown?.map(item => (
                  <div key={item.points_type} className="flex justify-between items-center p-3 border rounded">
                    <span className="capitalize">{item.points_type.replace('_', ' ')}</span>
                    <span className="font-semibold">{item.total} pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationDashboard;

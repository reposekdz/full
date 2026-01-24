import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, Medal, TrendingUp, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import axios from 'axios';

interface Achievement {
  id: number;
  student_id: number;
  title: string;
  description: string;
  category: string;
  achievement_date: string;
  certificate_url?: string;
  first_name: string;
  last_name: string;
}

interface BadgeType {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  points_required: number;
}

interface StudentBadge {
  id: number;
  badge_id: number;
  earned_date: string;
  name: string;
  description: string;
  icon_url: string;
  points_required: number;
}

export const AchievementsBadges: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formData, setFormData] = useState({
    student_id: '', title: '', description: '', category: 'academic',
    achievement_date: new Date().toISOString().split('T')[0], certificate_url: ''
  });

  useEffect(() => {
    fetchAchievements();
    fetchBadges();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/comprehensive-db/achievements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAchievements(response.data.achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/comprehensive-db/badges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBadges(response.data.badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchStudentBadges = async (studentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/comprehensive-db/student-badges/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentBadges(response.data.badges);
    } catch (error) {
      console.error('Error fetching student badges:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/comprehensive-db/achievements', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAchievements();
      setIsDialogOpen(false);
      setFormData({ student_id: '', title: '', description: '', category: 'academic', achievement_date: new Date().toISOString().split('T')[0], certificate_url: '' });
    } catch (error) {
      console.error('Error creating achievement:', error);
    }
  };

  const awardBadge = async (studentId: string, badgeId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/comprehensive-db/award-badge', 
        { student_id: studentId, badge_id: badgeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudentBadges(studentId);
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      academic: <Star className="w-5 h-5 text-yellow-500" />,
      sports: <Trophy className="w-5 h-5 text-blue-500" />,
      arts: <Award className="w-5 h-5 text-purple-500" />,
      leadership: <Medal className="w-5 h-5 text-green-500" />,
      community: <TrendingUp className="w-5 h-5 text-orange-500" />
    };
    return icons[category] || <Award className="w-5 h-5" />;
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6" />
                Student Achievements
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" />Add Achievement</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Record Achievement</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Student ID" type="number" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} required />
                    <Input placeholder="Achievement Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <textarea className="w-full p-2 border rounded" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} required />
                    <div className="grid grid-cols-2 gap-4">
                      <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="arts">Arts</SelectItem>
                          <SelectItem value="leadership">Leadership</SelectItem>
                          <SelectItem value="community">Community Service</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="date" value={formData.achievement_date} onChange={e => setFormData({...formData, achievement_date: e.target.value})} required />
                    </div>
                    <Input placeholder="Certificate URL (optional)" value={formData.certificate_url} onChange={e => setFormData({...formData, certificate_url: e.target.value})} />
                    <Button type="submit" className="w-full">Record Achievement</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">Loading achievements...</div>
              ) : (
                <div className="grid gap-4">
                  {achievements.map(achievement => (
                    <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                            {getCategoryIcon(achievement.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{achievement.title}</h3>
                              <Badge variant="outline">{achievement.category}</Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{achievement.description}</p>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>👤 {achievement.first_name} {achievement.last_name}</span>
                              <span>📅 {new Date(achievement.achievement_date).toLocaleDateString()}</span>
                              {achievement.certificate_url && <span>📜 Certificate Available</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Badge System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Input placeholder="Enter Student ID to view badges" type="number" value={selectedStudent} onChange={e => { setSelectedStudent(e.target.value); if(e.target.value) fetchStudentBadges(e.target.value); }} />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {badges.map(badge => (
                  <Card key={badge.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">{badge.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                      <Badge variant="secondary">{badge.points_required} points</Badge>
                      {selectedStudent && (
                        <Button size="sm" className="mt-3 w-full" onClick={() => awardBadge(selectedStudent, badge.id)}>
                          Award Badge
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {studentBadges.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Earned Badges</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {studentBadges.map(badge => (
                      <Card key={badge.id} className="bg-gradient-to-br from-yellow-50 to-orange-50">
                        <CardContent className="p-4 text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Medal className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="font-semibold text-sm">{badge.name}</h4>
                          <p className="text-xs text-gray-500">{new Date(badge.earned_date).toLocaleDateString()}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

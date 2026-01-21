import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, GraduationCap, Calendar, ClipboardList, TrendingUp, Award, Search, Users, Clock, Target, ChevronRight, Star, Download, Filter, Play, FileText, Brain, Zap, Trophy, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';

interface AcademicsPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AcademicsPage: React.FC<AcademicsPageProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [filterLevel, setFilterLevel] = useState('all');

  const courses = [
    { id: 'c1', name: 'Iterambere rya Urubuga', nameEn: 'Web Development', level: 'Level 4 SOD', students: 45, instructor: 'Dr. Alice Uwase', instructorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', progress: 65, rating: 4.9, duration: '12 ibyumweru', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', color: 'from-blue-500 to-indigo-500', topics: ['React', 'Node.js', 'Database', 'API'], materials: 24 },
    { id: 'c2', name: 'Imicungire y\'Ubwubatsi', nameEn: 'Construction Management', level: 'Level 4 BDC', students: 35, instructor: 'Mr. Emmanuel Kayitare', instructorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', progress: 50, rating: 4.8, duration: '14 ibyumweru', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80', color: 'from-orange-500 to-red-500', topics: ['Planning', 'Cost Estimation', 'Site Management', 'Quality Control'], materials: 18 },
    { id: 'c3', name: 'Ikoranabuhanga ry\'Imodoka', nameEn: 'Automobile Technology', level: 'Level 5 AUT', students: 32, instructor: 'Ms. Claire Uwera', instructorPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', progress: 75, rating: 4.9, duration: '10 ibyumweru', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80', color: 'from-green-500 to-emerald-500', topics: ['EV Systems', 'Battery Tech', 'Motor Control', 'Diagnostics'], materials: 20 },
    { id: 'c4', name: 'Sisitemu zo Gucunga Ububiko', nameEn: 'Database Management', level: 'Level 3 SOD', students: 42, instructor: 'Ms. Grace Mukamana', instructorPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', progress: 40, rating: 4.7, duration: '10 ibyumweru', image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80', color: 'from-purple-500 to-pink-500', topics: ['SQL', 'Normalization', 'Optimization', 'Security'], materials: 16 },
    { id: 'c5', name: 'Gushushanya Imyubakire', nameEn: 'Structural Design', level: 'Level 5 BDC', students: 38, instructor: 'Eng. Patrick Habimana', instructorPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', progress: 60, rating: 4.8, duration: '14 ibyumweru', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80', color: 'from-indigo-500 to-blue-500', topics: ['Load Analysis', 'Concrete Design', 'Steel Structures', 'Foundations'], materials: 22 },
    { id: 'c6', name: 'Sisitemu za Moteri', nameEn: 'Engine Systems', level: 'Level 3 AUT', students: 40, instructor: 'Mr. Frank Niyonzima', instructorPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', progress: 55, rating: 4.6, duration: '12 ibyumweru', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80', color: 'from-teal-500 to-cyan-500', topics: ['Engine Components', 'Fuel Systems', 'Cooling', 'Troubleshooting'], materials: 19 }
  ];

  const exams = [
    { id: 'e1', name: 'Ikizamini cya Web Development', date: '2024-02-15', time: '09:00', room: 'Lab A1', status: 'upcoming' },
    { id: 'e2', name: 'Ikizamini cya Construction', date: '2024-02-20', time: '08:00', room: 'Room 301', status: 'upcoming' },
    { id: 'e3', name: 'Ikizamini cya Automobile', date: '2024-02-25', time: '10:00', room: 'Auto Lab', status: 'upcoming' }
  ];

  const results = [
    { id: 'r1', course: 'Web Development', score: 85, grade: 'A', percentage: 85, rank: 5, total: 45 },
    { id: 'r2', course: 'Construction Management', score: 128, grade: 'A', percentage: 85.3, rank: 3, total: 35 },
    { id: 'r3', course: 'Automobile Technology', score: 90, grade: 'A', percentage: 90, rank: 2, total: 32 }
  ];

  const stats = [
    { label: 'Amasomo', value: courses.length.toString(), icon: BookOpen, color: 'from-blue-600 to-indigo-600' },
    { label: 'Ibizamini', value: exams.length.toString(), icon: ClipboardList, color: 'from-purple-600 to-pink-600' },
    { label: 'Impera', value: '85.5%', icon: TrendingUp, color: 'from-green-600 to-emerald-600' },
    { label: 'Abanyeshuri', value: courses.reduce((sum, c) => sum + c.students, 0).toString(), icon: Users, color: 'from-yellow-600 to-orange-600' }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <AdvancedLeftSidebar currentPage="academics" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl">
                <GraduationCap className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900">Amasomo</h1>
                <p className="text-lg text-gray-600 font-semibold mt-1">Amasomo, Ibizamini n'Ibisubizo</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1 text-center">{stat.value}</p>
                  <p className="text-sm font-semibold text-gray-600 text-center">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Search className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl font-black text-gray-900">Shakisha</h3>
            </div>
            <Input placeholder="Shakisha amasomo, ibizamini..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-lg border-2 border-blue-200" />
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 h-14 bg-white border-2 border-blue-200 rounded-2xl p-1">
              <TabsTrigger value="courses" className="text-base font-bold rounded-xl">Amasomo</TabsTrigger>
              <TabsTrigger value="exams" className="text-base font-bold rounded-xl">Ibizamini</TabsTrigger>
              <TabsTrigger value="results" className="text-base font-bold rounded-xl">Ibisubizo</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="mt-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 font-semibold">Byaboniwe: <span className="font-black text-blue-600">{courses.filter(c => filterLevel === 'all' || c.level.includes(filterLevel)).length}</span> amasomo</p>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-48 border-2 border-blue-200"><SelectValue placeholder="Urwego" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Urwego Rwose</SelectItem>
                    <SelectItem value="Level 3">Level 3</SelectItem>
                    <SelectItem value="Level 4">Level 4</SelectItem>
                    <SelectItem value="Level 5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {courses.filter(c => filterLevel === 'all' || c.level.includes(filterLevel)).map((course, index) => (
                    <motion.div key={course.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }} layout>
                      <Card className="border-2 border-blue-100 hover:border-blue-400 hover:shadow-2xl transition-all overflow-hidden cursor-pointer group" onClick={() => setSelectedCourse(course)}>
                        <div className="relative h-48 overflow-hidden">
                          <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-black text-sm">{course.rating}</span>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <Badge className="mb-2 bg-blue-600 text-white font-bold">{course.level}</Badge>
                            <Progress value={(course.students / 50) * 100} className="h-2 bg-white/30" />
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div>
                            <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{course.name}</h3>
                            <p className="text-gray-600 font-semibold text-sm">{course.nameEn}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-10 h-10 border-2 border-blue-200">
                              <img src={course.instructorPhoto} alt={course.instructor} />
                              <AvatarFallback>{course.instructor[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{course.instructor}</p>
                              <p className="text-xs text-gray-600 font-semibold">Umwarimu</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-blue-50 rounded-lg p-2">
                              <Users className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                              <p className="text-xs font-black text-gray-900">{course.students}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-2">
                              <Clock className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                              <p className="text-xs font-black text-gray-900">{course.duration}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2">
                              <FileText className="w-4 h-4 mx-auto mb-1 text-green-600" />
                              <p className="text-xs font-black text-gray-900">{course.materials}</p>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-600">Iterambere</span>
                              <span className="text-sm font-black text-blue-600">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-3" />
                          </div>
                          <Button className={`w-full bg-gradient-to-r ${course.color} text-white font-bold group-hover:shadow-lg transition-shadow`}>
                            Reba Byinshi <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="exams" className="mt-6">
              <div className="space-y-4">
                {exams.map((exam, index) => (
                  <motion.div key={exam.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="border-2 border-purple-100 hover:border-purple-400 hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-gray-900 mb-3">{exam.name}</h3>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <span className="font-bold">{exam.date}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-purple-600" />
                                <span className="font-semibold">{exam.time}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Target className="w-4 h-4 text-purple-600" />
                                <span className="font-semibold">{exam.room}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 font-bold">Bizaza</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="mt-6">
              <div className="space-y-4">
                {results.map((result, index) => (
                  <motion.div key={result.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="border-2 border-green-100 hover:border-green-400 hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div className="md:col-span-2">
                            <h3 className="text-xl font-black text-gray-900">{result.course}</h3>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-black text-green-600">{result.score}</p>
                            <p className="text-xs text-gray-600">Amanota</p>
                          </div>
                          <div className="text-center">
                            <Badge className="text-lg font-black bg-green-500 text-white">{result.grade}</Badge>
                            <p className="text-xs text-gray-600 mt-1">{result.percentage}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-black text-gray-900">{result.rank}/{result.total}</p>
                            <p className="text-xs text-gray-600">Umwanya</p>
                          </div>
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

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          {selectedCourse && (
            <ScrollArea className="h-[90vh]">
              <div className="relative h-80 overflow-hidden">
                <img src={selectedCourse.image} alt={selectedCourse.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <Badge className="mb-3 bg-blue-600 text-white text-lg px-4 py-2">{selectedCourse.level}</Badge>
                  <h2 className="text-4xl font-black text-white mb-2">{selectedCourse.name}</h2>
                  <p className="text-xl text-blue-200">{selectedCourse.nameEn}</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center border-2 border-blue-200">
                    <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-black">{selectedCourse.rating}</p>
                    <p className="text-xs text-gray-600 font-semibold">Ikiciro</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-200">
                    <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-black">{selectedCourse.students}</p>
                    <p className="text-xs text-gray-600 font-semibold">Abanyeshuri</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center border-2 border-purple-200">
                    <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-black">{selectedCourse.duration}</p>
                    <p className="text-xs text-gray-600 font-semibold">Igihe</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center border-2 border-orange-200">
                    <FileText className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-black">{selectedCourse.materials}</p>
                    <p className="text-xs text-gray-600 font-semibold">Ibikoresho</p>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-4 text-center border-2 border-pink-200">
                    <Target className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                    <p className="text-2xl font-black">{selectedCourse.progress}%</p>
                    <p className="text-xs text-gray-600 font-semibold">Iterambere</p>
                  </div>
                </div>
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                        <img src={selectedCourse.instructorPhoto} alt={selectedCourse.instructor} />
                        <AvatarFallback>{selectedCourse.instructor[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-600 mb-1">UMWARIMU</p>
                        <h4 className="text-2xl font-black text-gray-900">{selectedCourse.instructor}</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
                  <h4 className="text-lg font-black mb-4 flex items-center"><Brain className="w-5 h-5 mr-2 text-blue-600" />Ingingo Zizigwa</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCourse.topics.map((topic: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2 bg-blue-50 rounded-lg p-3">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-lg">
                  <Trophy className="w-5 h-5 mr-2" />Iyandikishe Kuri Iri Somo
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicsPage;

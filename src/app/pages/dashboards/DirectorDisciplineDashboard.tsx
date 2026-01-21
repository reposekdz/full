import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Award, 
  FileText,
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Target,
  BarChart3,
  ClipboardList,
  UserCheck,
  UserX,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import LeftSidebar from '@/app/components/LeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface DirectorDisciplineDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DirectorDisciplineDashboard: React.FC<DirectorDisciplineDashboardProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      title: 'Abanyeshuri Bose',
      value: '1,248',
      change: '-2%',
      trend: 'down',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Impamvu Mbi',
      value: '23',
      change: '-15%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Ibihembo',
      value: '145',
      change: '+8%',
      trend: 'up',
      icon: Award,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Imyitwarire Myiza',
      value: '94.2%',
      change: '+3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
  ];

  const recentIncidents = [
    {
      student: 'Jean Mugisha',
      class: 'S3 A',
      incident: 'Gutinda mu ishuri',
      severity: 'low',
      date: '2 amasaha ashize',
      status: 'resolved',
      action: 'Verbal Warning'
    },
    {
      student: 'Marie Uwase',
      class: 'S5 B',
      incident: 'Guhangana n\'umunyeshuri',
      severity: 'high',
      date: '5 amasaha ashize',
      status: 'pending',
      action: 'Investigation'
    },
    {
      student: 'Patrick Nkusi',
      class: 'S2 C',
      incident: 'Kudakora homework',
      severity: 'medium',
      date: '1 umunsi ushize',
      status: 'resolved',
      action: 'Parent Contact'
    },
    {
      student: 'Grace Mutesi',
      class: 'S4 A',
      incident: 'Gukoresha telefoni mu ishuri',
      severity: 'low',
      date: '2 iminsi ishize',
      status: 'resolved',
      action: 'Confiscation'
    },
  ];

  const conductRecords = [
    {
      class: 'S1 A',
      students: 42,
      incidents: 3,
      goodBehavior: 98,
      warnings: 2,
      trend: 'up'
    },
    {
      class: 'S2 B',
      students: 38,
      incidents: 5,
      goodBehavior: 95,
      warnings: 4,
      trend: 'down'
    },
    {
      class: 'S3 A',
      students: 40,
      incidents: 2,
      goodBehavior: 99,
      warnings: 1,
      trend: 'up'
    },
    {
      class: 'S4 C',
      students: 35,
      incidents: 8,
      goodBehavior: 92,
      warnings: 6,
      trend: 'down'
    },
    {
      class: 'S5 A',
      students: 44,
      incidents: 1,
      goodBehavior: 100,
      warnings: 0,
      trend: 'up'
    },
  ];

  const rewardsList = [
    {
      student: 'Alice Umutoni',
      class: 'S6 A',
      achievement: 'Indahemuka y\'Ukwezi',
      date: 'Jan 15, 2026',
      points: 100,
      type: 'excellence'
    },
    {
      student: 'David Habimana',
      class: 'S4 B',
      achievement: 'Umuntu Mwiza w\'Icyumweru',
      date: 'Jan 18, 2026',
      points: 50,
      type: 'behavior'
    },
    {
      student: 'Sarah Imanizabayo',
      class: 'S3 C',
      achievement: 'Gufasha Andi',
      date: 'Jan 20, 2026',
      points: 75,
      type: 'service'
    },
    {
      student: 'Eric Nshuti',
      class: 'S5 A',
      achievement: 'Imyitwarire Myiza',
      date: 'Jan 19, 2026',
      points: 60,
      type: 'conduct'
    },
  ];

  const disciplinaryActions = [
    {
      type: 'Verbal Warning',
      count: 45,
      color: 'bg-yellow-500'
    },
    {
      type: 'Written Warning',
      count: 18,
      color: 'bg-orange-500'
    },
    {
      type: 'Parent Meeting',
      count: 12,
      color: 'bg-red-500'
    },
    {
      type: 'Suspension',
      count: 3,
      color: 'bg-red-700'
    },
    {
      type: 'Community Service',
      count: 8,
      color: 'bg-blue-500'
    },
  ];

  const topStudents = [
    { name: 'Alice Umutoni', class: 'S6 A', points: 500, avatar: 'AU', rank: 1 },
    { name: 'David Habimana', class: 'S4 B', points: 475, avatar: 'DH', rank: 2 },
    { name: 'Sarah Imanizabayo', class: 'S3 C', points: 450, avatar: 'SI', rank: 3 },
    { name: 'Eric Nshuti', class: 'S5 A', points: 425, avatar: 'EN', rank: 4 },
    { name: 'Grace Kayitesi', class: 'S2 B', points: 400, avatar: 'GK', rank: 5 },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <LeftSidebar currentPage="dashboard" onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                  Ikibanza cy'Umuyobozi w'Imyitwarire
                </h1>
                <p className="text-gray-600 mt-2">Gucunga imyitwarire y'abanyeshuri n'indakemwa</p>
              </div>
              <div className="flex space-x-3">
                <Button className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Raporo
                </Button>
                <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Impamvu Nshya
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className={`border-2 border-yellow-200 ${stat.bgColor} hover:shadow-xl transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <Badge className={`${
                            stat.trend === 'up' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {stat.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {stat.change}
                          </Badge>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto bg-white border-2 border-yellow-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Incamake
              </TabsTrigger>
              <TabsTrigger value="incidents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Impamvu
              </TabsTrigger>
              <TabsTrigger value="conduct" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Imyitwarire
              </TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Ibihembo
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Raporo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                      Impamvu Ziheruka
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {recentIncidents.map((incident, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{incident.student}</h4>
                                <Badge variant="outline" className="mt-1">{incident.class}</Badge>
                              </div>
                              <Badge className={
                                incident.severity === 'high' ? 'bg-red-100 text-red-700' :
                                incident.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {incident.severity === 'high' ? 'Bikomeye' : incident.severity === 'medium' ? 'Byiciriritse' : 'Byoroshye'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{incident.incident}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{incident.date}</span>
                              <Badge className={
                                incident.status === 'resolved' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }>
                                {incident.status === 'resolved' ? 'Byakemuwe' : 'Birategerezwa'}
                              </Badge>
                            </div>
                            <div className="mt-2 pt-2 border-t border-yellow-100">
                              <span className="text-xs font-medium text-gray-600">Icyakozwe: {incident.action}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Star className="h-5 w-5 mr-2 text-yellow-600" />
                      Abanyeshuri Bakomeye
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {topStudents.map((student, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50 transition-all">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold text-lg">
                              {student.rank}
                            </div>
                            <Avatar className="h-12 w-12 border-2 border-yellow-400">
                              <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                                {student.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-600">{student.class}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-600" />
                                <span className="font-bold text-yellow-600">{student.points}</span>
                              </div>
                              <p className="text-xs text-gray-500">amanota</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-5 w-5 mr-2 text-yellow-600" />
                    Ibyakozwe ku Myitwarire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {disciplinaryActions.map((action, index) => (
                      <div key={index} className="text-center p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 transition-all">
                        <div className={`w-16 h-16 ${action.color} rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-black`}>
                          {action.count}
                        </div>
                        <p className="text-sm font-medium text-gray-700">{action.type}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Impamvu Zose</CardTitle>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Mugaragaza
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200">
                          <th className="text-left p-3 font-bold text-gray-700">Umunyeshuri</th>
                          <th className="text-left p-3 font-bold text-gray-700">Icyiciro</th>
                          <th className="text-left p-3 font-bold text-gray-700">Impamvu</th>
                          <th className="text-left p-3 font-bold text-gray-700">Urwego</th>
                          <th className="text-left p-3 font-bold text-gray-700">Itariki</th>
                          <th className="text-left p-3 font-bold text-gray-700">Uko bimeze</th>
                          <th className="text-left p-3 font-bold text-gray-700">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentIncidents.map((incident, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50">
                            <td className="p-3 font-medium">{incident.student}</td>
                            <td className="p-3">
                              <Badge variant="outline">{incident.class}</Badge>
                            </td>
                            <td className="p-3 text-sm">{incident.incident}</td>
                            <td className="p-3">
                              <Badge className={
                                incident.severity === 'high' ? 'bg-red-100 text-red-700' :
                                incident.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {incident.severity === 'high' ? 'Bikomeye' : incident.severity === 'medium' ? 'Byiciriritse' : 'Byoroshye'}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-gray-600">{incident.date}</td>
                            <td className="p-3">
                              <Badge className={
                                incident.status === 'resolved' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }>
                                {incident.status === 'resolved' ? 'Byakemuwe' : 'Birategerezwa'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conduct" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Imyitwarire y'Amaklasi</CardTitle>
                  <CardDescription>Kugenzura imyitwarire y'abanyeshuri muri buri cyiciro</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200">
                          <th className="text-left p-3 font-bold text-gray-700">Icyiciro</th>
                          <th className="text-left p-3 font-bold text-gray-700">Abanyeshuri</th>
                          <th className="text-left p-3 font-bold text-gray-700">Impamvu</th>
                          <th className="text-left p-3 font-bold text-gray-700">Imyitwarire Myiza %</th>
                          <th className="text-left p-3 font-bold text-gray-700">Iburira</th>
                          <th className="text-left p-3 font-bold text-gray-700">Icyerekezo</th>
                          <th className="text-left p-3 font-bold text-gray-700">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conductRecords.map((record, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50">
                            <td className="p-3 font-bold">{record.class}</td>
                            <td className="p-3">{record.students}</td>
                            <td className="p-3">
                              <Badge className="bg-red-100 text-red-700">{record.incidents}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" 
                                    style={{ width: `${record.goodBehavior}%` }}
                                  />
                                </div>
                                <span className="font-bold text-sm">{record.goodBehavior}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{record.warnings}</Badge>
                            </td>
                            <td className="p-3">
                              {record.trend === 'up' ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-red-600" />
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Reba
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Award className="h-5 w-5 mr-2 text-yellow-600" />
                    Ibihembo n'Ibihano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rewardsList.map((reward, index) => (
                      <Card key={index} className="border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-lg transition-all bg-gradient-to-br from-yellow-50 to-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-center mb-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 flex items-center justify-center">
                              <Award className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          <h4 className="font-bold text-center text-gray-900 mb-1">{reward.student}</h4>
                          <p className="text-xs text-center text-gray-600 mb-3">{reward.class}</p>
                          <Badge className="w-full justify-center bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 mb-2">
                            {reward.achievement}
                          </Badge>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{reward.date}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-600" />
                              <span className="font-bold">{reward.points}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Raporo y'Ukwezi</h3>
                    <p className="text-sm text-gray-600 mb-4">Raporo yuzuye y'imyitwarire y'ukwezi</p>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Kuramo
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Imibare Rusange</h3>
                    <p className="text-sm text-gray-600 mb-4">Imibare n'amakuru y'imyitwarire</p>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      Reba
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <ClipboardList className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Raporo Yihariye</h3>
                    <p className="text-sm text-gray-600 mb-4">Kora raporo yihariye</p>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Kora
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DirectorDisciplineDashboard;

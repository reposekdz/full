import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Award, Calendar, DollarSign, Trophy, Shield, Gem, Medal, Plus, Search, Link as LinkIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import apiService from '@/app/services/apiService';

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [academics, setAcademics] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [discipline, setDiscipline] = useState<any>(null);
  const [fees, setFees] = useState<any>(null);
  const [competitions, setCompetitions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Link Child State
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [studentCode, setStudentCode] = useState('');
  const [relationship, setRelationship] = useState('');
  const [linkingStatus, setLinkingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) fetchChildData();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyChildren();
      setChildren(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) setSelectedChild(data[0]);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async () => {
    try {
      const [dashData, acadData, attData, discData, feeData, compData] = await Promise.all([
        apiService.getChildDashboard(selectedChild.user_id),
        apiService.getChildAcademics(selectedChild.user_id),
        apiService.getChildAttendance(selectedChild.user_id),
        apiService.getChildDiscipline(selectedChild.user_id),
        apiService.getChildFees(selectedChild.user_id),
        apiService.getChildCompetitions(selectedChild.user_id)
      ]);

      setDashboard(dashData);
      setAcademics(acadData);
      setAttendance(attData);
      setDiscipline(discData);
      setFees(feeData);
      setCompetitions(compData);
    } catch (err) { console.error(err); }
  };

  const handleLinkChild = async () => {
    if (!studentCode || !relationship) {
      setErrorMessage('Please fill in all fields');
      setLinkingStatus('error');
      return;
    }

    try {
      setLinkingStatus('loading');
      const response = await apiService.linkChild(studentCode, relationship);
      if (response.success) {
        setLinkingStatus('success');
        setTimeout(() => {
          setIsLinkDialogOpen(false);
          setLinkingStatus('idle');
          setStudentCode('');
          setRelationship('');
          fetchChildren();
        }, 2000);
      } else {
        setErrorMessage(response.message || 'Failed to link child');
        setLinkingStatus('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      setLinkingStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-900 font-bold">Loading family data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Ikibanza cy'Umubyeyi
          </h1>
          <p className="text-gray-600">Gukurikirana imyigire n'iterambere ry'abana bawe</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl shadow-md border-2 border-purple-100">
            {children.map(child => (
              <Button 
                key={child.user_id} 
                variant="ghost"
                className={`rounded-xl px-6 transition-all duration-300 ${
                  selectedChild?.user_id === child.user_id 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'hover:bg-purple-50 text-gray-600'
                }`}
                onClick={() => setSelectedChild(child)}
              >
                {child.name}
              </Button>
            ))}
          </div>

          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg shadow-green-200 rounded-xl px-6">
                <Plus className="w-5 h-5 mr-2" />
                Huza n'Umwana
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <LinkIcon className="text-purple-600" />
                  Huza n'Umwana Mushya
                </DialogTitle>
                <DialogDescription>
                  Injiza kode y'umunyeshuri n'isano mufitanye kugira ngo umukurikirane.
                </DialogDescription>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Ntabwo ufite kode? <Button variant="link" className="h-auto p-0 text-blue-600 underline" onClick={() => window.location.href = '/contact-admin'}>Vugisha Admin, Headmaster, cyangwa DOS</Button></span>
                  </p>
                </div>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="studentCode">Kode y'Umunyeshuri</Label>
                  <Input 
                    id="studentCode" 
                    placeholder="Injiza kode (e.g. STU123)" 
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="border-2 border-purple-100 focus:border-purple-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="relationship">Isano mufitanye</Label>
                  <Select onValueChange={setRelationship} value={relationship}>
                    <SelectTrigger className="border-2 border-purple-100">
                      <SelectValue placeholder="Hitamo isano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father">Papa</SelectItem>
                      <SelectItem value="Mother">Mama</SelectItem>
                      <SelectItem value="Guardian">Umurinzi</SelectItem>
                      <SelectItem value="Other">Ikindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <AnimatePresence>
                {linkingStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 mb-4"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Byakozwe neza!
                  </motion.div>
                )}
                {linkingStatus === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-4"
                  >
                    <AlertCircle className="w-5 h-5" />
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <DialogFooter>
                <Button 
                  onClick={handleLinkChild} 
                  disabled={linkingStatus === 'loading'}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  {linkingStatus === 'loading' ? 'Guhuza...' : 'Emeza Guhuza'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedChild ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Amanota Rusange', value: `${dashboard?.average_marks?.toFixed(1) || 0}%`, icon: Award, color: 'from-blue-500 to-indigo-600', sub: 'Impera zose' },
              { title: 'Kwitabira', value: `${dashboard?.attendance_percentage || 0}%`, icon: Calendar, color: 'from-green-500 to-emerald-600', sub: 'Uyu muryango' },
              { title: 'Amanota y\'Imyitwarire', value: dashboard?.conduct_score || 100, icon: Shield, color: 'from-purple-500 to-pink-600', sub: 'Conduct' },
              { title: 'Ikirarane cy\'Ishuri', value: `FRw ${(dashboard?.fee_balance || 0).toLocaleString()}`, icon: DollarSign, color: 'from-red-500 to-orange-600', sub: 'Balance' }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${stat.color} p-6 text-white h-full`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium uppercase tracking-wider">{stat.title}</p>
                          <p className="text-4xl font-black mt-2">{stat.value}</p>
                          <p className="text-white/60 text-xs mt-2">{stat.sub}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                          <stat.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-2 border-purple-50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="text-yellow-600" />
                  Imidari n'Ibyagezweho
                </CardTitle>
                <CardDescription>Ibigwi by'umwana mu marushanwa n'imyigire</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { type: 'Diamond', count: dashboard?.medals?.diamond || 0, icon: Gem, color: 'text-cyan-500', bg: 'bg-cyan-50' },
                    { type: 'Gold', count: dashboard?.medals?.gold || 0, icon: Medal, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                    { type: 'Silver', count: dashboard?.medals?.silver || 0, icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50' },
                    { type: 'Bronze', count: dashboard?.medals?.bronze || 0, icon: Medal, color: 'text-orange-600', bg: 'bg-orange-50' }
                  ].map((medal, i) => (
                    <div key={i} className={`text-center p-6 rounded-2xl border-2 border-transparent hover:border-purple-200 transition-all ${medal.bg}`}>
                      <medal.icon className={`w-14 h-14 mx-auto mb-3 ${medal.color} filter drop-shadow-md`} />
                      <p className="text-3xl font-black">{medal.count}</p>
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-tighter">{medal.type}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="text-blue-600" />
                  Amarushanwa ya Vuba
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <div className="divide-y-2 divide-purple-50">
                    {competitions?.competitions?.length > 0 ? competitions.competitions.map((comp: any, i: number) => (
                      <div key={i} className="p-4 hover:bg-purple-50/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-gray-900 line-clamp-1">{comp.title}</p>
                          <Badge className="bg-purple-600">+{comp.points_earned} pts</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {comp.medal_earned !== 'none' && (
                            <Badge className={
                              comp.medal_earned === 'diamond' ? 'bg-cyan-500' :
                              comp.medal_earned === 'gold' ? 'bg-yellow-500' :
                              comp.medal_earned === 'silver' ? 'bg-gray-400' : 'bg-orange-600'
                            }>
                              {comp.medal_earned}
                            </Badge>
                          )}
                          <p className="text-xs text-gray-500">{comp.category_name}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500">Nta marushanwa ahari</div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="academics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 bg-white border-2 border-purple-100 rounded-2xl shadow-lg">
              <TabsTrigger value="academics" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Imyigire</TabsTrigger>
              <TabsTrigger value="attendance" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Kwitabira</TabsTrigger>
              <TabsTrigger value="discipline" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Imyitwarire</TabsTrigger>
              <TabsTrigger value="fees" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Amafaranga</TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Imikoro</TabsTrigger>
            </TabsList>

            <TabsContent value="academics">
              <Card className="border-2 border-purple-50 shadow-xl overflow-hidden">
                <CardHeader className="bg-white border-b-2 border-purple-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-black text-gray-900">Iterambere mu Masomo</CardTitle>
                    <Button variant="outline" className="border-2 border-purple-100">
                      <Download className="w-4 h-4 mr-2" /> Raporo yuzuye
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {academics?.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100 shadow-sm text-center">
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Average Marks</p>
                        <p className="text-5xl font-black text-blue-900">{academics.summary.average_marks?.toFixed(1)}%</p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-100 shadow-sm text-center">
                        <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2">Total Subjects</p>
                        <p className="text-5xl font-black text-green-900">{academics.summary.total_subjects}</p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-100 shadow-sm text-center">
                        <p className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-2">GPA</p>
                        <p className="text-5xl font-black text-purple-900">{academics.summary.gpa?.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {academics?.performance?.map((perf: any, i: number) => (
                      <div key={i} className="p-6 border-2 border-purple-50 rounded-2xl hover:border-purple-200 transition-all bg-white shadow-sm group">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">{perf.subject_name}</p>
                            <p className="text-sm text-gray-500">Term {perf.term} • Class Rank: #{perf.rank || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-purple-600">{(perf.quiz_marks + perf.midterm_marks + perf.final_marks).toFixed(1)}</p>
                            <p className="text-xs font-bold text-gray-400">OUT OF 100</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between text-xs font-bold text-gray-600">
                            <span>QUIZ: {perf.quiz_marks}</span>
                            <span>MID: {perf.midterm_marks}</span>
                            <span>FINAL: {perf.final_marks}</span>
                          </div>
                          <Progress 
                            value={perf.quiz_marks + perf.midterm_marks + perf.final_marks} 
                            className="h-3 bg-purple-50" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <Card className="border-2 border-purple-50 shadow-xl">
                <CardHeader>
                  <CardTitle>Imibare yo Kwitabira</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {attendance?.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      {[
                        { label: 'Iminsi Yose', value: attendance.summary.total_days, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Yitabiriye', value: attendance.summary.present_days, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Ntiyabonetse', value: attendance.summary.absent_days, color: 'text-red-600', bg: 'bg-red-50' },
                        { label: 'Yatinze', value: attendance.summary.late_days, color: 'text-yellow-600', bg: 'bg-yellow-50' }
                      ].map((item, i) => (
                        <div key={i} className={`text-center p-6 rounded-2xl ${item.bg}`}>
                          <p className="text-xs font-bold text-gray-600 uppercase mb-2">{item.label}</p>
                          <p className={`text-4xl font-black ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attendance?.attendance?.map((att: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 border-2 border-purple-50 rounded-xl bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            att.status === 'present' ? 'bg-green-100 text-green-600' :
                            att.status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{new Date(att.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <p className="text-xs text-gray-500">{att.subject_name || 'General Attendance'}</p>
                          </div>
                        </div>
                        <Badge className={`rounded-lg px-4 py-1 uppercase text-[10px] font-black tracking-widest ${
                          att.status === 'present' ? 'bg-green-600' :
                          att.status === 'absent' ? 'bg-red-600' : 'bg-yellow-600'
                        }`}>
                          {att.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees">
              <Card className="border-2 border-purple-50 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b-2 border-green-100">
                  <CardTitle className="text-2xl font-black flex items-center gap-2">
                    <DollarSign className="text-green-600" />
                    Amateka yo Kwishyura
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {fees?.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="p-8 bg-green-50 rounded-3xl border-2 border-green-100 flex items-center justify-between shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Total Paid</p>
                          <p className="text-4xl font-black text-green-900">FRw {fees.summary.total_paid?.toLocaleString()}</p>
                        </div>
                        <CheckCircle2 className="w-12 h-12 text-green-600 opacity-20" />
                      </div>
                      <div className="p-8 bg-red-50 rounded-3xl border-2 border-red-100 flex items-center justify-between shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1">Current Balance</p>
                          <p className="text-4xl font-black text-red-900">FRw {fees.summary.total_balance?.toLocaleString()}</p>
                        </div>
                        <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    {fees?.payments?.map((payment: any, i: number) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 border-2 border-purple-50 rounded-2xl bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-gray-900">{payment.fee_type}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(payment.payment_date).toLocaleDateString()} • Ref: {payment.reference || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-green-600">FRw {payment.amount_paid?.toLocaleString()}</p>
                          {payment.balance > 0 && (
                            <Badge variant="outline" className="text-red-600 border-red-200 mt-1">
                              Remaining: FRw {payment.balance?.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assignments">
              <Card className="border-2 border-purple-50 shadow-xl">
                <CardHeader>
                  <CardTitle>Imikoro n'Ibizamini</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Reuse Student assignments UI style but for parent viewing */}
                  <p className="text-gray-500 text-center py-10">Urugero rw'imikoro ruri gutegurwa...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="p-20 text-center border-4 border-dashed border-purple-100 rounded-[40px]">
          <div className="max-w-md mx-auto">
            <div className="bg-purple-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Nta Mwana Uhujije</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Kugira ngo ubashe gukurikirana imyigire y'umwana wawe, kanda kuri buto yo hejuru uhuze n'umwana ukoresheje kode ye.
            </p>
            <Button 
              onClick={() => setIsLinkDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl px-10 py-6 text-lg font-bold shadow-xl shadow-purple-200"
            >
              Huza n'Umwana ubu
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

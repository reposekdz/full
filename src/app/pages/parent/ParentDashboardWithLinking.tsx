import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  GraduationCap,
  BarChart,
  CheckCircle,
  DollarSign,
  FileText,
  MessageSquare,
  Heart,
  Home as HomeIcon,
  BookOpen,
  Trophy,
  Bell,
  FileCheck,
  Plus,
  X,
  Loader2,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface Student {
  id: number;
  name: string;
  trade: string;
  level: number;
  student_code?: string;
}

interface LinkedStudent {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_name: string;
  level_number: number;
  gender: string;
}

interface LinkFormData {
  student_name: string;
  student_trade: string;
  student_level: string;
  student_gender: string;
}

export default function ParentDashboardWithLinking() {
  const [hasLinkedStudent, setHasLinkedStudent] = useState(false);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkFormData, setLinkFormData] = useState<LinkFormData>({
    student_name: '',
    student_trade: '',
    student_level: '',
    student_gender: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkLinkedStudents();
  }, []);

  const checkLinkedStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/parent-dashboard/children', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success && result.children && result.children.length > 0) {
        setLinkedStudents(result.children);
        setHasLinkedStudent(true);
      }
    } catch (error) {
      console.error('Error checking linked students:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    averageGrade: 85,
    attendanceRate: 95,
    pendingFees: 100000,
    notifications: 5
  };

  const subjects = [
    { name: 'Imibare', grade: 'A', color: 'bg-green-500' },
    { name: 'Ubumenyi bwa Sisitemu', grade: 'A-', color: 'bg-green-500' },
    { name: 'Ikoranabuhanga', grade: 'B+', color: 'bg-yellow-500' },
    { name: 'Icyongereza', grade: 'A', color: 'bg-green-500' },
    { name: 'Kinyarwanda', grade: 'A+', color: 'bg-green-500' }
  ];

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/parent-linking/link-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...linkFormData,
          relationship_type: 'Parent'
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message || 'Student link request submitted successfully!');
        setTimeout(() => {
          checkLinkedStudents();
        }, 2000);
      } else {
        setErrorMessage(result.message || 'Failed to submit link request');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred while submitting the request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-400 to-green-500 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasLinkedStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-400 to-green-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Link with your student</h2>
            <p className="text-gray-600">Please provide your student's details to link your account</p>
          </div>

          <form onSubmit={handleSubmitLink} className="space-y-4">
            <div>
              <Label htmlFor="studentName" className="text-gray-700 font-semibold">Student Name *</Label>
              <Input
                id="studentName"
                placeholder="Enter student's full name"
                value={linkFormData.student_name}
                onChange={(e) => setLinkFormData({ ...linkFormData, student_name: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="studentTrade" className="text-gray-700 font-semibold">Trade *</Label>
              <Select
                value={linkFormData.student_trade}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_trade: value })}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDC">BDC - Building Construction</SelectItem>
                  <SelectItem value="SOD">SOD - Software Development</SelectItem>
                  <SelectItem value="AUT">AUT - Automotive Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="studentLevel" className="text-gray-700 font-semibold">Level *</Label>
              <Select
                value={linkFormData.student_level}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_level: value })}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="studentGender" className="text-gray-700 font-semibold">Gender *</Label>
              <Select
                value={linkFormData.student_gender}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_gender: value })}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white font-semibold py-6 text-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Link Student
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  const dashboardCards = [
    {
      icon: BarChart,
      title: "Amanota y'Umwana",
      color: 'from-red-500 to-red-600',
      items: subjects.map(s => ({ label: s.name, value: s.grade, badge: true })),
      action: 'Reba Amanota Yose'
    },
    {
      icon: CheckCircle,
      title: 'Kwitabira Amasomo',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Iminsi yitabiriye', value: '95%', badge: true, badgeColor: 'bg-green-500' },
        { label: 'Iminsi yataye', value: '2', badge: true },
        { label: 'Iminsi yatinze', value: '3', badge: true },
        { label: 'Raporo z\'ukwezi', value: '', badge: false },
        { label: 'Kumenyesha ku kwitabira', value: '', badge: false }
      ],
      action: 'Reba Kwitabira'
    },
    {
      icon: DollarSign,
      title: 'Amafaranga y\'Ishuri',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Yishyuwe', value: '500,000 RWF', badge: true, badgeColor: 'bg-green-500' },
        { label: 'Asigaye', value: '100,000 RWF', badge: true, badgeColor: 'bg-yellow-500' },
        { label: 'Amateka y\'kwishyura', value: '', badge: false },
        { label: 'Kwishyura online', value: '', badge: false },
        { label: 'Raporo z\'amafaranga', value: '', badge: false }
      ],
      action: 'Ishyura Ubu'
    },
    {
      icon: FileText,
      title: 'Ibizamini n\'Ibikorwa',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Ibizamini bizaza', value: '5', badge: true },
        { label: 'Amanota y\'ibizamini', value: '', badge: false },
        { label: 'Ibikorwa by\'amasomo', value: '', badge: false },
        { label: 'Raporo z\'ibizamini', value: '', badge: false },
        { label: 'Kumenyesha k\'ibizamini', value: '', badge: false }
      ],
      action: 'Reba Ibizamini'
    },
    {
      icon: MessageSquare,
      title: 'Itumanaho n\'Abarimu',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Kohereza ubutumwa', value: '', badge: false },
        { label: 'Gusaba inama', value: '', badge: false },
        { label: 'Inama z\'ababyeyi', value: '', badge: false },
        { label: 'Raporo z\'abarimu', value: '', badge: false },
        { label: 'Kumenyesha k\'abarimu', value: '', badge: false }
      ],
      action: 'Vugana n\'Umwarimu'
    },
    {
      icon: Heart,
      title: 'Imyitwarire y\'Umwana',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Imyitwarire', value: 'Nziza', badge: true, badgeColor: 'bg-green-500' },
        { label: 'Indangagaciro', value: '', badge: false },
        { label: 'Ibihano', value: '', badge: false },
        { label: 'Ibihembo', value: '', badge: false },
        { label: 'Raporo z\'imyitwarire', value: '', badge: false }
      ],
      action: 'Reba Imyitwarire'
    },
    {
      icon: HomeIcon,
      title: 'Ubuzima bw\'Umwana',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Amateka y\'ubuzima', value: '', badge: false },
        { label: 'Imiti n\'ubuvuzi', value: '', badge: false },
        { label: 'Gukurikirana indwara', value: '', badge: false },
        { label: 'Raporo z\'ubuzima', value: '', badge: false },
        { label: 'Kumenyesha k\'ubuzima', value: '', badge: false }
      ],
      action: 'Reba Ubuzima'
    },
    {
      icon: HomeIcon,
      title: 'Icumbi cy\'Umwana',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Icumbi', value: 'Block A', badge: true },
        { label: 'Icyumba', value: 'Room 205', badge: true },
        { label: 'Kwishyura icumbi', value: '', badge: false },
        { label: 'Raporo z\'icumbi', value: '', badge: false },
        { label: 'Kumenyesha k\'icumbi', value: '', badge: false }
      ],
      action: 'Reba Icumbi'
    },
    {
      icon: BookOpen,
      title: 'Ibitabo by\'Umwana',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Ibitabo yahagaritse', value: '', badge: false },
        { label: 'Amateka y\'ibitabo', value: '', badge: false },
        { label: 'Amande y\'ibitabo', value: '', badge: false },
        { label: 'Raporo z\'isomero', value: '', badge: false },
        { label: 'Kumenyesha k\'ibitabo', value: '', badge: false }
      ],
      action: 'Reba Ibitabo'
    },
    {
      icon: Trophy,
      title: 'Siporo n\'Ibikorwa',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Amakipe y\'umwana', value: '', badge: false },
        { label: 'Amarushanwa', value: '', badge: false },
        { label: 'Ibihembo', value: '', badge: false },
        { label: 'Raporo za siporo', value: '', badge: false },
        { label: 'Kumenyesha k\'ibikorwa', value: '', badge: false }
      ],
      action: 'Reba Siporo'
    },
    {
      icon: Bell,
      title: 'Kumenyesha',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Kumenyesha gishya', value: '5', badge: true },
        { label: 'Itangazo ry\'ishuri', value: '', badge: false },
        { label: 'Kumenyesha k\'amanota', value: '', badge: false },
        { label: 'Kumenyesha k\'amafaranga', value: '', badge: false },
        { label: 'Kumenyesha k\'imyitwarire', value: '', badge: false }
      ],
      action: 'Reba Kumenyesha'
    },
    {
      icon: FileCheck,
      title: 'Raporo z\'Iterambere',
      color: 'from-red-500 to-red-600',
      items: [
        { label: 'Raporo z\'ukwezi', value: '', badge: false },
        { label: 'Raporo z\'igihembwe', value: '', badge: false },
        { label: 'Raporo z\'umwaka', value: '', badge: false },
        { label: 'Gusuzuma iterambere', value: '', badge: false },
        { label: 'Inama z\'iterambere', value: '', badge: false }
      ],
      action: 'Reba Raporo'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-green-500 via-yellow-500 to-green-600 text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            PORTAL Y'UMUBYEYI
          </div>
          <div className="flex items-center gap-4">
            <a href="/home" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
              ← Ahabanza
            </a>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <span className="hidden md:inline">Mukamana Marie</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
            Murakaza neza, Mukamana Marie!
          </h1>
          <p className="text-gray-600 mb-6">
            Hano ushobora gukurikirana iterambere ry'abana bawe mu ishuri
          </p>
          
          {/* Children Selector */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {linkedStudents.map((child) => (
              <motion.div
                key={child.id}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-4 rounded-xl cursor-pointer flex-1 text-center"
              >
                <GraduationCap className="w-6 h-6 inline-block mr-2" />
                {child.first_name} {child.last_name} - {child.trade_name} Level {child.level_number}
              </motion.div>
            ))}
          </div>

          {/* Link Another Student Button */}
          <Button
            onClick={() => setHasLinkedStudent(false)}
            className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Iyandikishe
          </Button>
        </motion.div>

        {/* Alert */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-8">
          <div className="flex items-start">
            <Bell className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <strong>🔔 Kumenyesha:</strong> Mugabo Jean afite ikizamini cy'Imibare kuwa Kane. Musabe amufashe kwiga!
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-6 rounded-xl text-center"
          >
            <div className="text-4xl font-bold">{stats.averageGrade}%</div>
            <div className="text-sm mt-2 opacity-90">Amanota Rusange</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-6 rounded-xl text-center"
          >
            <div className="text-4xl font-bold">{stats.attendanceRate}%</div>
            <div className="text-sm mt-2 opacity-90">Kwitabira</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-6 rounded-xl text-center"
          >
            <div className="text-4xl font-bold">{stats.pendingFees / 1000}K</div>
            <div className="text-sm mt-2 opacity-90">Amafaranga Asigaye</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-6 rounded-xl text-center"
          >
            <div className="text-4xl font-bold">{stats.notifications}</div>
            <div className="text-sm mt-2 opacity-90">Kumenyesha Gishya</div>
          </motion.div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-green-500 to-yellow-500 p-3 rounded-lg">
                      <card.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {card.items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="text-sm text-gray-700">{item.label}</span>
                        {item.badge && item.value && (
                          <Badge className={item.badgeColor || 'bg-red-500'}>
                            {item.value}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600"
                  >
                    {card.action}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Linking Modal (removed - now inline) */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600 text-xl">Link with your student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitLink} className="space-y-4">
            <div>
              <Label htmlFor="studentName">Student Name:</Label>
              <Input
                id="studentName"
                placeholder="Enter student's full name"
                value={linkFormData.student_name}
                onChange={(e) => setLinkFormData({ ...linkFormData, student_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="studentTrade">Trade:</Label>
              <Select
                value={linkFormData.student_trade}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_trade: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDC">BDC - Building Construction</SelectItem>
                  <SelectItem value="SOD">SOD - Software Development</SelectItem>
                  <SelectItem value="AUT">AUT - Automotive Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="studentLevel">Level:</Label>
              <Select
                value={linkFormData.student_level}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_level: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="studentGender">Gender:</Label>
              <Select
                value={linkFormData.student_gender}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_gender: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLinkingModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, GraduationCap, Award, Calendar, Phone, Mail, MapPin, Plus, Link as LinkIcon, Eye, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import apiService from '@/app/services/apiService';

interface Student {
  id: number;
  student_id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: string;
  trade_code: string;
  trade_name: string;
  level: number;
  email?: string;
  phone?: string;
  class_name?: string;
}

export default function ParentChildren() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  
  // Linking state
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('SOD');
  const [selectedLevel, setSelectedLevel] = useState('4');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [linkMessage, setLinkMessage] = useState('');
  const [studentsCache, setStudentsCache] = useState<Map<string, Student[]>>(new Map());

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (isLinkDialogOpen && selectedTrade && selectedLevel) {
      loadStudents();
    }
  }, [isLinkDialogOpen, selectedTrade, selectedLevel]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyChildren();
      setChildren(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch children:', err);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    const cacheKey = `${selectedTrade}-${selectedLevel}`;
    
    if (studentsCache.has(cacheKey)) {
      setStudentsData(studentsCache.get(cacheKey) || []);
      return;
    }

    try {
      setLoadingStudents(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:3000/api/global-student-management/students?trade=${selectedTrade}&level=${selectedLevel}&limit=500&sortBy=first_name&sortOrder=ASC&status=active`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.students && result.students.length > 0) {
        const students = result.students.map((s: any) => ({
          ...s,
          full_name: `${s.first_name} ${s.last_name}`.trim()
        }));
        setStudentsData(students);
        setStudentsCache(new Map(studentsCache.set(cacheKey, students)));
      } else {
        setStudentsData([]);
      }
    } catch (error) {
      console.error('Ikosa ryo gushakisha abanyeshuri:', error);
      setStudentsData([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!selectedStudent) {
      setLinkStatus('error');
      setLinkMessage('Nyamuneka hitamo umunyeshuri!');
      return;
    }

    const student = studentsData[parseInt(selectedStudent)];
    if (!student) {
      setLinkStatus('error');
      setLinkMessage('Ikosa: Amakuru y\'umunyeshuri ntabonetse');
      return;
    }

    try {
      setLinking(true);
      setLinkStatus('idle');
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3000/api/parent-linking/link-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_name: student.full_name,
          student_first_name: student.first_name,
          student_last_name: student.last_name,
          student_trade: selectedTrade,
          student_level: selectedLevel,
          student_gender: selectedGender || student.gender,
          relationship_type: 'Parent',
          student_code: student.student_code
        })
      });

      const result = await response.json();

      if (result.success) {
        setLinkStatus('success');
        setLinkMessage(result.message || 'Icyifuzo cyoherejwe neza!');
        setTimeout(() => {
          setIsLinkDialogOpen(false);
          resetLinkForm();
          fetchChildren();
        }, 2000);
      } else {
        setLinkStatus('error');
        setLinkMessage(result.message || 'Ntibyakunze kohereza icyifuzo');
      }
    } catch (error) {
      console.error('Ikosa:', error);
      setLinkStatus('error');
      setLinkMessage('Habaye ikosa. Nyamuneka ongera ugerageze.');
    } finally {
      setLinking(false);
    }
  };

  const resetLinkForm = () => {
    setSelectedTrade('SOD');
    setSelectedLevel('4');
    setSelectedGender('');
    setSelectedStudent('');
    setStudentsData([]);
    setLinkStatus('idle');
    setLinkMessage('');
  };

  const selectedStudentData = selectedStudent ? studentsData[parseInt(selectedStudent)] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Abana Banjye
          </h1>
          <p className="text-gray-600">Abana bawe bohugura muri Garden TVET School</p>
        </div>
        <Button 
          onClick={() => setIsLinkDialogOpen(true)}
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Huza Umwana Mushya
        </Button>
      </div>

      {children.length === 0 ? (
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardContent className="p-12 text-center">
            <Users className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Nta mwana uhujwe</h3>
            <p className="text-gray-500 mb-6">Nturafite umwana uhujwe kuri konti yawe</p>
            <Button 
              onClick={() => setIsLinkDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Huza Umwana
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <motion.div
              key={child.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2 border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <div className="h-32 bg-gradient-to-br from-purple-600 to-blue-600 relative">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-purple-600 text-3xl font-black shadow-xl border-4 border-white">
                      {child.name?.charAt(0) || 'S'}
                    </div>
                  </div>
                </div>
                <CardContent className="pt-16 pb-6 px-6 text-center">
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{child.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{child.admission_number}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Isano:</span>
                      <Badge className="bg-purple-100 text-purple-700">{child.relationship || 'Parent'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Urwego:</span>
                      <Badge className="bg-blue-100 text-blue-700">{child.level || 'Year 1'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Umwuga:</span>
                      <Badge className="bg-green-100 text-green-700">{child.trade || 'N/A'}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Amanota</span>
                        <span className="font-bold text-purple-600">{child.average_marks || 0}%</span>
                      </div>
                      <Progress value={child.average_marks || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Kwitabira</span>
                        <span className="font-bold text-green-600">{child.attendance_percentage || 0}%</span>
                      </div>
                      <Progress value={child.attendance_percentage || 0} className="h-2" />
                    </div>
                  </div>

                  <Button 
                    onClick={() => setSelectedChild(child)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white group-hover:from-purple-700 group-hover:to-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Reba Amakuru Yose
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {children.length > 0 && (
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Incamake y'Imikorere
            </CardTitle>
            <CardDescription>Imikorere rusange y'abana bawe</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Users className="w-10 h-10 mx-auto text-blue-600 mb-2" />
                <p className="text-3xl font-black text-blue-900">{children.length}</p>
                <p className="text-sm text-blue-700">Abana Bahujwe</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <Award className="w-10 h-10 mx-auto text-green-600 mb-2" />
                <p className="text-3xl font-black text-green-900">
                  {(children.reduce((sum, child) => sum + (child.average_marks || 0), 0) / children.length || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-green-700">Impera y'Amanota</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <Calendar className="w-10 h-10 mx-auto text-purple-600 mb-2" />
                <p className="text-3xl font-black text-purple-900">
                  {(children.reduce((sum, child) => sum + (child.attendance_percentage || 0), 0) / children.length || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-purple-700">Kwitabira</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                <GraduationCap className="w-10 h-10 mx-auto text-yellow-600 mb-2" />
                <p className="text-3xl font-black text-yellow-900">
                  {children.reduce((sum, child) => sum + (child.total_medals || 0), 0)}
                </p>
                <p className="text-sm text-yellow-700">Ibihembo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Student Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ✨ Huza n'Umwana Wawe
            </DialogTitle>
            <DialogDescription className="text-base">
              Hitamo umwuga n'urwego kugirango ubone abanyeshuri, hanyuma uhitemo umwana wawe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Trade Selection */}
            <div className="space-y-2">
              <Label htmlFor="trade" className="text-sm font-semibold text-gray-700">
                🎓 Umwuga (Trade):
              </Label>
              <Select value={selectedTrade} onValueChange={(val) => {
                setSelectedTrade(val);
                setSelectedStudent('');
              }}>
                <SelectTrigger className="border-2 border-purple-100 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDC">BDC - Kubaka</SelectItem>
                  <SelectItem value="SOD">SOD - Ikoranabuhanga</SelectItem>
                  <SelectItem value="AUT">AUT - Imodoka</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Level Selection */}
            <div className="space-y-2">
              <Label htmlFor="level" className="text-sm font-semibold text-gray-700">
                📊 Urwego (Level):
              </Label>
              <Select value={selectedLevel} onValueChange={(val) => {
                setSelectedLevel(val);
                setSelectedStudent('');
              }}>
                <SelectTrigger className="border-2 border-purple-100 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Urwego 1</SelectItem>
                  <SelectItem value="2">Urwego 2</SelectItem>
                  <SelectItem value="3">Urwego 3</SelectItem>
                  <SelectItem value="4">Urwego 4</SelectItem>
                  <SelectItem value="5">Urwego 5</SelectItem>
                  <SelectItem value="6">Urwego 6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student" className="text-sm font-semibold text-gray-700">
                👤 Amazina y'Umunyeshuri:
              </Label>
              {loadingStudents ? (
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-purple-200 rounded-lg">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
                  <span className="text-purple-600 font-medium">Gushakisha abanyeshuri...</span>
                </div>
              ) : studentsData.length > 0 ? (
                <>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="border-2 border-purple-100 focus:border-purple-500">
                      <SelectValue placeholder={`✅ Hitamo umunyeshuri... (${studentsData.length} babonetse)`} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {studentsData.map((student, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{student.gender === 'Male' ? '👨' : student.gender === 'Female' ? '👩' : '👤'}</span>
                            <span>{student.full_name}</span>
                            {student.student_code && <span className="text-xs text-gray-500">- {student.student_code}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    📝 Hitamo umwuga n'urwego kugirango ubone abanyeshuri
                  </p>
                </>
              ) : (
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Nta munyeshuri ubonetse kuri {selectedTrade} Urwego {selectedLevel}</p>
                </div>
              )}
            </div>

            {/* Gender Selection (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                ⚧ Igitsina (Optional - kugirango tubone neza):
              </Label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="border-2 border-purple-100 focus:border-purple-500">
                  <SelectValue placeholder="Hitamo igitsina..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Hitamo igitsina...</SelectItem>
                  <SelectItem value="Male">👨 Gabo</SelectItem>
                  <SelectItem value="Female">👩 Gore</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selected Student Preview */}
            {selectedStudentData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-purple-200"
              >
                <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Amakuru y'Umunyeshuri Wahisemo:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">📛 Amazina:</p>
                    <p className="font-semibold text-gray-900">{selectedStudentData.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">🆔 Nimero:</p>
                    <p className="font-semibold text-gray-900">{selectedStudentData.student_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">🎓 Umwuga:</p>
                    <p className="font-semibold text-gray-900">{selectedStudentData.trade_name || selectedStudentData.trade_code}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">📊 Urwego:</p>
                    <p className="font-semibold text-gray-900">Urwego {selectedStudentData.level}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">⚧ Igitsina:</p>
                    <p className="font-semibold text-gray-900">
                      {selectedStudentData.gender === 'Male' ? 'Gabo' : selectedStudentData.gender === 'Female' ? 'Gore' : 'N/A'}
                    </p>
                  </div>
                  {selectedStudentData.class_name && (
                    <div>
                      <p className="text-gray-600 font-medium">🏫 Ishuri:</p>
                      <p className="font-semibold text-gray-900">{selectedStudentData.class_name}</p>
                    </div>
                  )}
                </div>
                {(selectedStudentData.email || selectedStudentData.phone) && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    {selectedStudentData.email && (
                      <p className="text-xs text-gray-600">📧 {selectedStudentData.email}</p>
                    )}
                    {selectedStudentData.phone && (
                      <p className="text-xs text-gray-600">📱 {selectedStudentData.phone}</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Status Messages */}
            <AnimatePresence>
              {linkStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-lg border-2 border-green-200"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{linkMessage}</p>
                </motion.div>
              )}
              {linkStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-lg border-2 border-red-200"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{linkMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsLinkDialogOpen(false);
                resetLinkForm();
              }}
              disabled={linking}
              className="border-2 border-gray-200"
            >
              Hagarika
            </Button>
            <Button
              onClick={handleLinkStudent}
              disabled={linking || !selectedStudent || loadingStudents}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
            >
              {linking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tegereza...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Ohereza
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

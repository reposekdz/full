import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Users, GraduationCap, CheckCircle2, AlertCircle, Loader2, Sparkles, Trophy, BookOpen, Award } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import apiService from '@/app/services/apiService';
import RwandaLocationTextInput from '@/app/components/RwandaLocationTextInput';

interface ModernRegisterPageProps {
  onNavigate: (page: string) => void;
}

const ModernRegisterPage: React.FC<ModernRegisterPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isKinyarwanda = language === 'rw';
  const { getRoleDashboard } = useAuth();

  const translations = {
    title: isKinyarwanda ? 'Injira muri Garden TVET' : 'Join Garden TVET School',
    heading: isKinyarwanda ? 'Ejo heza haratangirwa hano' : 'Your Future Starts Here',
    subheading: isKinyarwanda ? 'Uburyo bugezweho bwo gucunga ishuri no gufasha ababyeyi kurikirana abana babo.' : 'Advanced school management system designed to connect parents with their academic journey.',
    importanceTitle: isKinyarwanda ? 'Kuki hitamo Garden TVET?' : 'Why Choose Garden TVET?',
    importance1: isKinyarwanda ? 'Imiyoborere ihamye' : 'Excellence in Technical Education',
    importanceDesc1: isKinyarwanda ? 'Abana bacu bahabwa ubumenyi bugezweho bukenewe ku isoko ry\'umurimo.' : 'Providing students with the practical skills needed for today\'s competitive job market.',
    importance2: isKinyarwanda ? 'Ubufatanye n\'ababyeyi' : 'Seamless Parent Integration',
    importanceDesc2: isKinyarwanda ? 'Ababyeyi bakurikirana amanota, imyitwarire n\'amafaranga y\'ishuri mu buryo bworoshye.' : 'Parents can easily monitor grades, attendance, and financial status in real-time.',
    importance3: isKinyarwanda ? 'Ikoranabuhanga rigezweho' : 'Innovative Learning Environment',
    importanceDesc3: isKinyarwanda ? 'Tukoresha ikoranabuhanga mu kwigisha no mu miyoborere y\'ishuri.' : 'Leveraging modern technology to enhance both teaching and administrative processes.',

    step1: isKinyarwanda ? 'Umubyeyi' : 'Parent Info',
    step2: isKinyarwanda ? 'Umunyeshuri' : 'Student Info',
    step3: isKinyarwanda ? 'Ijambo ry\'ibanga' : 'Security',

    parentInfo: isKinyarwanda ? 'Amakuru y\'umubyeyi' : 'Parent Information',
    studentInfo: isKinyarwanda ? 'Amakuru y\'umunyeshuri' : 'Student Information',
    studentInfoDesc: isKinyarwanda ? 'Uzuza amakuru y\'umwana kugira ngo ahite afatanywa na konti yawe. Niba umwana wawe atabonetse, konti izafungurwa bgukurikiranwa n\'abakozi.' : 'Provide your child\'s details to automatically link them to your account. If your child is not found, staff will help link after registration.',
    studentSearchPlaceholder: isKinyarwanda ? 'Shakisha umwana wawe...' : 'Search for your child...',
    studentNotFound: isKinyarwanda ? 'Nta munyeshuri wabonetse. Konti izafungurwa, staff izaguhuza n\'umwana.' : 'Student not found. Account created - staff will help link your child.',
    studentFound: isKinyarwanda ? 'Umunyaeshuri wabonetse!' : 'Student found!',
    selectStudent: isKinyarwanda ? 'Hitamo uyu mwana' : 'Select this child',
    noStudentFound: isKinyarwanda ? 'Nta munyeshuri wabonetse mushakisha' : 'No students found in search',
    contactStaff: isKinyarwanda ? 'Shikana n\'abakozi b\'ishuri' : 'Contact school staff',

    studentFullName: isKinyarwanda ? 'Amazina yose y\'umunyeshuri *' : 'Student Full Name *',
    studentLevel: isKinyarwanda ? 'Urwego (Level) *' : 'Level *',
    studentTrade: isKinyarwanda ? 'Umwuga (Trade) *' : 'Trade *',
    studentGender: isKinyarwanda ? 'Igitsina cy\'umunyeshuri *' : 'Student Gender *',

    back: isKinyarwanda ? 'Subira inyuma' : 'Back',
    next: isKinyarwanda ? 'Komeza' : 'Next Step',
    submit: isKinyarwanda ? 'Fungura Konti' : 'Complete Registration',

    forStudents: isKinyarwanda ? 'Ku banyeshuri' : 'For Students',
    forParents: isKinyarwanda ? 'Ku babyeyi' : 'For Parents',
    createAccount: isKinyarwanda ? 'Fungura Konti' : 'Create Account',
    joinToday: isKinyarwanda ? 'Winjira muri Garden TVET School uyu munsi' : 'Join Garden TVET School today',
    firstName: isKinyarwanda ? 'Izina rya mbere *' : 'First Name *',
    lastName: isKinyarwanda ? 'Izina rya kabiri *' : 'Last Name *',
    email: isKinyarwanda ? 'Imeri' : 'Email',
    optional: isKinyarwanda ? '(Bihitamo)' : '(Optional)',
    phone: isKinyarwanda ? 'Nimero ya telefone *' : 'Phone Number *',
    location: isKinyarwanda ? 'Aho utaha (Bihitamo)' : 'Location (Optional)',
    male: isKinyarwanda ? 'Gabo' : 'Male',
    female: isKinyarwanda ? 'Gore' : 'Female',
    password: isKinyarwanda ? 'Ijambo ry\'ibanga *' : 'Password *',
    confirmPassword: isKinyarwanda ? 'Subiramo ijambo ry\'ibanga *' : 'Confirm Password *',
    loading: isKinyarwanda ? 'Tegereza...' : 'Processing...',
    passMismatch: isKinyarwanda ? 'Amagambo y\'ibanga ntaguhura' : 'Passwords do not match',
    regSuccess: isKinyarwanda ? 'Kwinjira byagenze neza! Tegereza...' : 'Registration successful! Redirecting...',
    alreadyHaveAccount: isKinyarwanda ? 'Usanzwe ufite konti?' : 'Already have an account?',
    loginHere: isKinyarwanda ? 'Injira hano' : 'Login here'
  };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'parent' as 'parent',
    address: '',
    date_of_birth: '',
    gender: '' as 'Male' | 'Female' | '',
    // Student fields for linking
    student_name: '',
    student_level: '',
    student_trade: '',
    student_gender: '' as 'Male' | 'Female' | '',
    // Location
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: ''
  });

  // Student search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const result = await apiService.getAvailableTrades();
        if (result.success) {
          setTrades(result.trades || []);
        }
      } catch (err) {
        console.error('Failed to fetch trades:', err);
      }
    };
    fetchTrades();
  }, []);

  // Student search with debouncing
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearchError('');
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const result = await apiService.searchStudents(searchQuery);
        if (result.success) {
          setSearchResults(result.students || []);
          if (result.students?.length === 0) {
            setSearchError(isKinyarwanda ? 'Nta munyeshuri wabonetse' : 'No students found');
          }
        } else {
          setSearchError(result.message || 'Search failed');
          setSearchResults([]);
        }
      } catch (err: any) {
        setSearchError(err.message || 'Search failed');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, isKinyarwanda]);

  const nextStep = () => {
    if (step === 1) {
      if (!formData.first_name || !formData.last_name || !formData.phone) {
        setError(isKinyarwanda ? 'Uzuza amakuru yose asabwa *' : 'Please fill all required fields *');
        return;
      }
    } else if (step === 2) {
      // Allow proceeding without selecting a student - staff will help link later
      if (!selectedStudent && searchResults.length === 0 && searchQuery.length >= 2) {
        // No student found - this is fine, can proceed
        setError('');
      } else if (!selectedStudent && searchQuery.length < 2) {
        // Need to search for student
        setError(isKinyarwanda ? 'Shakisha umwana wawe usingura izina' : 'Search for your child by name');
        return;
      }
    }
    setError('');
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError(translations.passMismatch);
      return;
    }

    setLoading(true);
    try {
      // Use selected student data if available, otherwise send the search query for staff to help
      const registrationData = {
        ...formData,
        relationship_type: 'Parent',
        ...(selectedStudent && {
          student_name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
          student_level: selectedStudent.levelNumber?.toString(),
          student_trade: selectedStudent.trade_code,
          student_gender: selectedStudent.gender
        }),
        // If no student selected but we have search info, send that too for staff reference
        ...(!selectedStudent && formData.student_name && {
          student_name: formData.student_name,
          student_level: formData.student_level,
          student_trade: formData.student_trade,
          student_gender: formData.student_gender
        })
      };

      const result = await apiService.request('/parent-registration/register', {
        method: 'POST',
        body: JSON.stringify(registrationData)
      });

      if (result.success && result.token) {
        setSuccess(result.message || translations.regSuccess);

        // Store user and token
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        setTimeout(() => onNavigate(getRoleDashboard('parent')), 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
      <div className="w-full max-w-[1240px]">
        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Left Column: Importance & Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:flex flex-col justify-center space-y-8 pr-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
                <Sparkles className="w-4 h-4" />
                GARDEN TVET SCHOOL
              </div>
              <h1 className="text-6xl font-black text-slate-900 leading-tight">
                {translations.heading}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                {translations.subheading}
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: translations.importance1,
                  desc: translations.importanceDesc1,
                  icon: GraduationCap,
                  color: "bg-blue-100 text-blue-600"
                },
                {
                  title: translations.importance2,
                  desc: translations.importanceDesc2,
                  icon: Users,
                  color: "bg-green-100 text-green-600"
                },
                {
                  title: translations.importance3,
                  desc: translations.importanceDesc3,
                  icon: Sparkles,
                  color: "bg-purple-100 text-purple-600"
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex gap-4 p-4 rounded-2xl transition-all hover:bg-white hover:shadow-xl hover:shadow-yellow-500/10 border border-transparent hover:border-yellow-200"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-4">
              <div className="flex -space-x-3 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  +2k
                </div>
              </div>
              <p className="text-slate-500 text-sm italic">
                {isKinyarwanda ? 'Yiyunge ku bandi babyeyi basaga 2,000 baduhisemo.' : 'Join over 2,000+ happy parents who chose our system.'}
              </p>
            </div>
          </motion.div>

          {/* Right Column: Multi-step Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Decorative background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-200/30 rounded-full blur-3xl pointer-events-none" />

            <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white">
              <CardContent className="p-8 md:p-12">
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">{translations.createAccount}</h2>
                  <p className="text-slate-500">{translations.joinToday}</p>
                </div>

                {/* Steps Indicator */}
                <div className="flex justify-between mb-12 relative overflow-hidden">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                  <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-yellow-500 -translate-y-1/2 z-0"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((step - 1) / 2) * 100}%` }}
                  />
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="relative z-10 flex flex-col items-center">
                      <motion.div
                        animate={{
                          backgroundColor: step >= s ? "#eab308" : "#f1f5f9",
                          scale: step === s ? 1.2 : 1,
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'text-white' : 'text-slate-400'}`}
                      >
                        {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                      </motion.div>
                      <span className={`text-[10px] uppercase font-bold tracking-tighter mt-2 ${step >= s ? 'text-yellow-600' : 'text-slate-400'}`}>
                        {translations[`step${s}` as keyof typeof translations]}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{translations.firstName}</Label>
                            <Input
                              value={formData.first_name}
                              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                              className="rounded-2xl border-slate-200 focus:border-yellow-500 focus:ring-yellow-500"
                              placeholder="John"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{translations.lastName}</Label>
                            <Input
                              value={formData.last_name}
                              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                              className="rounded-2xl border-slate-200 focus:border-yellow-500 focus:ring-yellow-500"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{translations.phone}</Label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="rounded-2xl border-slate-200 focus:border-yellow-500 focus:ring-yellow-500"
                            placeholder="0781234567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{translations.location}</Label>
                          <RwandaLocationTextInput
                            onLocationChange={(location) => setFormData({ ...formData, ...location })}
                            initialValues={formData}
                            required={false}
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl mb-4">
                          <div className="flex gap-3">
                            <Users className="w-5 h-5 text-yellow-600 shrink-0" />
                            <div>
                              <h4 className="font-bold text-yellow-900 text-sm">{translations.studentInfo}</h4>
                              <p className="text-yellow-800 text-xs">
                                {isKinyarwanda
                                  ? 'Shakisha umwana wawe hanyuma umuhitemo kuri liste'
                                  : 'Search for your child and select them from the results'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{isKinyarwanda ? 'Shakisha umwana wawe' : 'Search for your child'}</Label>
                          <div className="relative">
                            <Input
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="rounded-2xl border-slate-200 pl-10"
                              placeholder={isKinyarwanda ? "Andika izina ry'umwana..." : "Type child's name..."}
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            {searching && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-600 animate-spin" />
                            )}
                          </div>
                        </div>

                        {/* Selected Student Display */}
                        {selectedStudent && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-green-50 border-2 border-green-500 rounded-2xl"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  <span className="font-bold text-green-900">
                                    {isKinyarwanda ? 'Umwana Wahitowe' : 'Selected Student'}
                                  </span>
                                </div>
                                <p className="font-bold text-lg text-slate-900">
                                  {selectedStudent.firstName} {selectedStudent.lastName}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                    {selectedStudent.level}
                                  </Badge>
                                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                    {selectedStudent.trade}
                                  </Badge>
                                  <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                                    {selectedStudent.gender === 'Male' ? (isKinyarwanda ? 'Gabo' : 'Male') : (isKinyarwanda ? 'Gore' : 'Female')}
                                  </Badge>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(null);
                                  setSearchQuery('');
                                }}
                                className="text-slate-500 hover:text-slate-700"
                              >
                                ✕
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Search Results */}
                        {!selectedStudent && searchQuery.length >= 2 && (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {searching ? (
                              <div className="text-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-yellow-600 mx-auto" />
                                <p className="text-slate-500 mt-2 text-sm">
                                  {isKinyarwanda ? 'Turarondera...' : 'Searching...'}
                                </p>
                              </div>
                            ) : searchResults.length > 0 ? (
                              <>
                                <p className="text-xs text-slate-500 mb-2">
                                  {isKinyarwanda
                                    ? `Abantu ${searchResults.length} babonetse`
                                    : `${searchResults.length} student${searchResults.length !== 1 ? 's' : ''} found`}
                                </p>
                                {searchResults.map((student) => (
                                  <motion.button
                                    key={student.id}
                                    type="button"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setSearchQuery('');
                                      setSearchResults([]);
                                    }}
                                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="font-bold text-slate-900">
                                            {student.firstName} {student.lastName}
                                          </p>
                                          {student.matchScore && (
                                            <Badge variant="outline" className="text-xs">
                                              {student.matchScore}% {isKinyarwanda ? 'ihuye' : 'match'}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">
                                          {isKinyarwanda ? 'Nimero' : 'ID'}: {student.studentId}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                                            {student.level}
                                          </Badge>
                                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">
                                            {student.trade}
                                          </Badge>
                                          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 text-xs">
                                            {student.gender === 'Male' ? (isKinyarwanda ? 'Gabo' : 'Male') : (isKinyarwanda ? 'Gore' : 'Female')}
                                          </Badge>
                                        </div>
                                      </div>
                                      <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                  </motion.button>
                                ))}
                              </>
                            ) : searchError ? (
                              <div className="text-center py-8">
                                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500">{searchError}</p>
                                <p className="text-slate-400 text-sm mt-2">
                                  {isKinyarwanda
                                    ? 'Konta izafungurwa, staff izaguhuza n\'umwana wawe.'
                                    : 'Account will be created, staff will help link your child.'}
                                </p>
                                <Button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudent(null);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                    setStep(s => s + 1);
                                  }}
                                  className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white"
                                >
                                  {isKinyarwanda ? 'Fungura Konti' : 'Create Account'}
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {!selectedStudent && searchQuery.length < 2 && (
                          <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">
                              {isKinyarwanda
                                ? 'Andika izina ry\'umwana wawe kugira ngo turonke'
                                : 'Type your child\'s name to search'}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label>{translations.email} {translations.optional}</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="rounded-2xl border-slate-200"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{translations.password}</Label>
                          <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="rounded-2xl border-slate-200"
                            placeholder="Minimum 6 characters"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{translations.confirmPassword}</Label>
                          <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="rounded-2xl border-slate-200"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-4">
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                        <Alert className="border-red-200 bg-red-50 text-red-800 rounded-2xl">
                          <AlertCircle className="w-4 h-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                        <Alert className="border-green-200 bg-green-50 text-green-800 rounded-2xl">
                          <CheckCircle2 className="w-4 h-4" />
                          <AlertDescription>{success}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      {step > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="flex-1 rounded-[20px] py-7 font-bold border-2"
                        >
                          {translations.back}
                        </Button>
                      )}

                      {step < 3 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white rounded-[20px] py-7 font-bold text-lg"
                        >
                          {translations.next}
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-[2] bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-[20px] py-7 font-bold text-lg"
                        >
                          {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            translations.submit
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-center pt-6">
                    <p className="text-slate-500 font-medium">
                      {translations.alreadyHaveAccount}{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('login')}
                        className="text-yellow-600 hover:text-yellow-700 font-bold underline underline-offset-4"
                      >
                        {translations.loginHere}
                      </button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModernRegisterPage;

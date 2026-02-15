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
import { apiService } from '@/app/services/apiService';
import RwandaLocationTextInput from '@/app/components/RwandaLocationTextInput';

interface ModernRegisterPageProps {
  onNavigate: (page: string) => void;
}

const ModernRegisterPage: React.FC<ModernRegisterPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isKinyarwanda = language === 'rw';
  const { getRoleDashboard } = useAuth();

  const translations = {
    title: isKinyarwanda ? 'Join Our Community' : 'Join Our Community', // Assuming heading remains same or similar
    heading: isKinyarwanda ? 'Winjira mu muryango wacu' : 'Join Our Community',
    subheading: isKinyarwanda ? 'Tangira urugendo rwawe rwo gutsinda' : 'Start your journey to excellence',
    forStudents: isKinyarwanda ? 'Ku banyeshuri' : 'For Students',
    forParents: isKinyarwanda ? 'Ku babyeyi' : 'For Parents',
    studentDesc: isKinyarwanda ? 'Umunyeshuri' : 'Umunyeshuri',
    parentDesc: isKinyarwanda ? 'Umubyeyi' : 'Umubyeyi',
    studentBenefit1: isKinyarwanda ? 'Gera ku masomo n\'imikoro 24/7' : 'Access courses and assignments',
    studentBenefit2: isKinyarwanda ? 'Reba amanota n\'imyitwarire' : 'View grades and attendance',
    parentBenefit1: isKinyarwanda ? 'Kurikirana amajyambere y\'umwana' : 'Monitor child\'s progress',
    parentBenefit2: isKinyarwanda ? 'Kurikirana imyitwarire n\'amafaranga' : 'Track attendance & fees',
    createAccount: isKinyarwanda ? 'Fungura Konti' : 'Create Account',
    joinToday: isKinyarwanda ? 'Winjira muri Garden TVET School uyu munsi' : 'Join Garden TVET School today',
    iam: isKinyarwanda ? 'Ndi *' : 'I am a *',
    selectRole: isKinyarwanda ? 'Hitamo icyo uri cyo' : 'Select your role',
    student: isKinyarwanda ? 'Umunyeshuri' : 'Student',
    parent: isKinyarwanda ? 'Umubyeyi' : 'Parent',
    firstName: isKinyarwanda ? 'Izina rya mbere *' : 'First Name *',
    lastName: isKinyarwanda ? 'Izina rya kabiri *' : 'Last Name *',
    email: isKinyarwanda ? 'Imeri' : 'Email',
    optional: isKinyarwanda ? '(Bihitamo)' : '(Optional)',
    phone: isKinyarwanda ? 'Nimero ya telefone *' : 'Phone Number *',
    dob: isKinyarwanda ? 'Itariki y\'amavuko' : 'Date of Birth',
    gender: isKinyarwanda ? 'Igitsina' : 'Gender',
    selectGender: isKinyarwanda ? 'Hitamo' : 'Select',
    male: isKinyarwanda ? 'Gabo' : 'Male',
    female: isKinyarwanda ? 'Gore' : 'Female',
    selectTrade: isKinyarwanda ? 'Hitamo Umwuga *' : 'Select Trade *',
    chooseTrade: isKinyarwanda ? 'Hitamo umwuga wiga' : 'Choose your trade',
    location: isKinyarwanda ? 'Aho utaha (Bihitamo)' : 'Location (Optional)',
    districtPlaceholder: isKinyarwanda ? 'Akarere, Umurenge, Akagari' : 'District, Sector, Cell',
    password: isKinyarwanda ? 'Ijambo ry\'ibanga *' : 'Password *',
    confirmPassword: isKinyarwanda ? 'Subiramo ijambo ry\'ibanga *' : 'Confirm Password *',
    submit: isKinyarwanda ? 'Fungura Konti' : 'Create Account',
    loading: isKinyarwanda ? 'Tegereza...' : 'Creating Account...',
    passMismatch: isKinyarwanda ? 'Amagambo y\'ibanga ntaguhura' : 'Passwords do not match',
    selectRoleErr: isKinyarwanda ? 'Wibagiwe guhitamo icyo uri cyo' : 'Please select a role',
    selectTradeErr: isKinyarwanda ? 'Wibagiwe guhitamo umwuga' : 'Please select a trade',
    regSuccess: isKinyarwanda ? 'Kwinjira byagenze neza! Tegereza...' : 'Registration successful! Redirecting...',
    studentIdMsg: isKinyarwanda ? 'Kwinjira byagenze neza! Nimero yawe ni: ' : 'Registration successful! Your Student ID: ',
    alreadyHaveAccount: isKinyarwanda ? 'Usanzwe ufite konti?' : 'Already have an account?',
    loginHere: isKinyarwanda ? 'Injira hano' : 'Login here'
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '' as 'parent' | '',
    address: '',
    date_of_birth: '',
    gender: '' as 'Male' | 'Female' | '',
    serial_code: '',
    // Text-based location fields
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: ''
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError(translations.passMismatch);
      return;
    }
    if (!formData.role) {
      setError(translations.selectRoleErr);
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.parentPhoneRegister({
          phone: formData.phone,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || undefined,
          address: formData.address || undefined,
          province: formData.province || undefined,
          district: formData.district || undefined,
          sector: formData.sector || undefined,
          cell: formData.cell || undefined,
          village: formData.village || undefined,
        });
        
        if (result.success && result.token) {
          setSuccess(translations.regSuccess);
          setTimeout(() => onNavigate(getRoleDashboard('parent')), 1500);
        } else {
          setError(result.message || 'Registration failed');
        }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: BookOpen, text: translations.studentBenefit1, color: 'text-yellow-500' },
    { icon: Trophy, text: translations.studentBenefit2, color: 'text-green-500' },
    { icon: Award, text: translations.parentBenefit1, color: 'text-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:block space-y-6"
          >
            <div className="text-center mb-8">
              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white px-4 py-2 text-lg font-bold border-0 mb-4">
                Garden TVET School
              </Badge>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-2">
                {translations.heading}
              </h1>
              <p className="text-gray-600">{translations.subheading}</p>
            </div>

            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-green-600 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{translations.forStudents}</h3>
                    <p className="text-gray-600">{translations.studentDesc}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {translations.studentBenefit1}
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {translations.studentBenefit2}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-yellow-600 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{translations.forParents}</h3>
                    <p className="text-gray-600">{translations.parentDesc}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {translations.parentBenefit1}
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {translations.parentBenefit2}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Side - Registration Form */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full"
          >
            <Card className="border-2 border-green-200 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">{translations.createAccount}</h2>
                  <p className="text-gray-600">{translations.joinToday}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>{translations.iam}</Label>
                    <Select value={formData.role} onValueChange={(value: 'parent') => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="border-2">
                        <SelectValue placeholder={translations.selectRole} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">{translations.parent} ({translations.parentDesc})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{translations.firstName}</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>{translations.lastName}</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{translations.email} {translations.optional}</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>{translations.phone}</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+250 XXX XXX XXX"
                      required
                    />
                  </div>

                  <div>
                    <Label>{translations.location}</Label>
                      <RwandaLocationTextInput
                        onLocationChange={(location) => setFormData({...formData, ...location})}
                        initialValues={{
                          province: formData.province,
                          district: formData.district,
                          sector: formData.sector,
                          cell: formData.cell,
                          village: formData.village
                        }}
                        required={false}
                      />
                    </div>

                  <div>
                    <Label>{translations.password}</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <Label>{translations.confirmPassword}</Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Alert className="border-yellow-300 bg-yellow-50">
                          <AlertCircle className="w-4 h-4 text-yellow-800" />
                          <AlertDescription className="text-yellow-800">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Alert className="border-green-300 bg-green-50">
                          <CheckCircle2 className="w-4 h-4 text-green-800" />
                          <AlertDescription className="text-green-800">{success}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 text-white font-bold py-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {translations.loading}
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        {translations.submit}
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-gray-600">
                      {translations.alreadyHaveAccount}{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('login')}
                        className="text-green-600 hover:text-green-700 font-semibold"
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Loader2, CheckCircle2, AlertCircle, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { apiService } from '@/app/services/apiService';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { getRoleDashboard } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '' as 'student' | 'parent' | '',
    address: '',
    date_of_birth: '',
    gender: '' as 'Male' | 'Female' | '',
    trade_code: '',
    level_number: '',
    level_suffix: ''
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
      setError(language === 'rw' ? 'Amagambo y\'ibanga ntabwo ahuje' : 'Passwords do not match');
      return;
    }
    if (!formData.role) {
      setError(language === 'rw' ? 'Hitamo uruhare' : 'Please select a role');
      return;
    }
    if (formData.role === 'student' && !formData.trade_code) {
      setError(language === 'rw' ? 'Hitamo umwuga' : 'Please select a trade');
      return;
    }

    setLoading(true);
    try {
      if (formData.role === 'parent') {
        const result = await apiService.parentPhoneRegister({
          phone: formData.phone,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || undefined,
          address: formData.address || undefined
        });
        
        if (result.success && result.token) {
          setSuccess(language === 'rw' ? 'Iyandikishe ryagenze neza! Gutegereza...' : 'Registration successful! Redirecting...');
          setTimeout(() => onNavigate(getRoleDashboard('parent')), 1500);
        } else {
          setError(result.message || (language === 'rw' ? 'Iyandikishe ryanze' : 'Registration failed'));
        }
      } else {
        const result = await apiService.registerStudent({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          date_of_birth: formData.date_of_birth || undefined,
          gender: formData.gender || undefined,
          trade_code: formData.trade_code,
          level_number: parseInt(formData.level_number),
          level_suffix: formData.level_suffix || undefined,
          address: formData.address || undefined
        });

        if (result.success && result.token) {
          setSuccess(language === 'rw' ? `Iyandikishe ryagenze neza! Nimero yawe: ${result.user.student_id}` : `Registration successful! Your Student ID: ${result.user.student_id}`);
          setTimeout(() => onNavigate(getRoleDashboard('student')), 2000);
        } else {
          setError(result.message || (language === 'rw' ? 'Iyandikishe ryanze' : 'Registration failed'));
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(language === 'rw' ? 'Hari ikibazo. Ongera ugerageze.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-2 border-yellow-200">
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              whileHover={{ rotate: 360 }}
              className="inline-block bg-gradient-to-r from-yellow-500 to-green-500 p-2.5 rounded-full mb-2 shadow-lg"
            >
              <UserPlus className="w-5 h-5 text-white" />
            </motion.div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              {language === 'rw' ? 'Iyandikishe' : 'Register'}
            </h1>
            <p className="text-gray-600 text-xs mt-1">
              {language === 'rw' ? 'Iyandikishe ry\'Abanyeshuri n\'Ababyeyi' : 'Student & Parent Registration'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="border-red-300 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="ml-2 text-red-800 text-xs">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="border-green-300 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="ml-2 text-green-800 text-xs">{success}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="role" className="text-xs text-gray-700 font-medium">
                {language === 'rw' ? 'Uruhare' : 'Role'} *
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'student' | 'parent' })}>
                <SelectTrigger className="mt-1 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 text-sm rounded-lg">
                  <SelectValue placeholder={language === 'rw' ? 'Hitamo uruhare rwawe' : 'Select your role'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{language === 'rw' ? 'Umunyeshuri' : 'Student'}</SelectItem>
                  <SelectItem value="parent">{language === 'rw' ? 'Umubyeyi' : 'Parent'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label htmlFor="first_name" className="text-xs text-gray-700 font-medium">
                  {language === 'rw' ? 'Izina Rya Mbere' : 'First Name'} *
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-500" />
                  <Input
                    id="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="pl-8 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 text-sm rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="last_name" className="text-xs text-gray-700 font-medium">
                  {language === 'rw' ? 'Izina Rya Kabiri' : 'Last Name'} *
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-500" />
                  <Input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="pl-8 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 text-sm rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-xs text-gray-700 font-medium">
                {language === 'rw' ? 'Imeyili' : 'Email'} {formData.role === 'parent' ? '' : '*'}
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-500" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-8 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 text-sm rounded-lg"
                  required={formData.role === 'student'}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs text-gray-700 font-medium">
                {language === 'rw' ? 'Telefoni' : 'Phone'} *
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-500" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-8 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 text-sm rounded-lg"
                  placeholder="0788123456"
                  required
                />
              </div>
            </div>

            {formData.role === 'student' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label htmlFor="date_of_birth" className="text-xs text-gray-700 font-medium">
                      {language === 'rw' ? 'Itariki y\'Amavuko' : 'Date of Birth'}
                    </Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-500" />
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="pl-8 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 text-sm rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-xs text-gray-700 font-medium">
                      {language === 'rw' ? 'Igitsina' : 'Gender'}
                    </Label>
                    <Select value={formData.gender} onValueChange={(value: 'Male' | 'Female') => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="mt-1 h-9 border-yellow-200 focus:border-yellow-500 text-sm rounded-lg">
                        <SelectValue placeholder={language === 'rw' ? 'Hitamo' : 'Select'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{language === 'rw' ? 'Gabo' : 'Male'}</SelectItem>
                        <SelectItem value="Female">{language === 'rw' ? 'Gore' : 'Female'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="trade" className="text-xs text-gray-700 font-medium">
                    {language === 'rw' ? 'Hitamo Umwuga' : 'Select Trade'} *
                  </Label>
                  <Select value={formData.trade_code} onValueChange={(value) => {
                    const selectedTrade = trades.find(t => t.trade_code === value);
                    setFormData({ 
                      ...formData, 
                      trade_code: value,
                      level_number: selectedTrade?.level_number?.toString() || '',
                      level_suffix: selectedTrade?.level_suffix || ''
                    });
                  }}>
                    <SelectTrigger className="mt-1 h-9 border-yellow-200 focus:border-yellow-500 text-sm rounded-lg">
                      <SelectValue placeholder={language === 'rw' ? 'Hitamo umwuga wawe' : 'Choose your trade'} />
                    </SelectTrigger>
                    <SelectContent>
                      {trades.map((trade) => (
                        <SelectItem key={trade.id} value={trade.trade_code}>
                          {trade.full_name || trade.trade_name} - {language === 'rw' ? 'Urwego' : 'Level'} {trade.level_number}{trade.level_suffix || ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {formData.role === 'parent' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label htmlFor="address" className="text-xs text-gray-700 font-medium">
                  {language === 'rw' ? 'Aderesi' : 'Address'}
                </Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-500" />
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-8 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 text-sm rounded-lg"
                    placeholder={language === 'rw' ? 'Injiza aderesi yawe' : 'Enter your address'}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <Label htmlFor="password" className="text-xs text-gray-700 font-medium">
                {language === 'rw' ? 'Ijambo ry\'Ibanga' : 'Password'} *
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-500" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-8 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 text-sm rounded-lg"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-xs text-gray-700 font-medium">
                {language === 'rw' ? 'Emeza Ijambo ry\'Ibanga' : 'Confirm Password'} *
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-8 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 text-sm rounded-lg"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold mt-3 shadow-lg disabled:opacity-50 text-sm rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'rw' ? 'Gukora Konti...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {language === 'rw' ? 'Iyandikishe' : 'Register'}
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-3 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('login')}
              className="text-xs text-yellow-700 hover:text-green-600 hover:underline font-bold"
            >
              {language === 'rw' ? 'Usanzwe ufite konti? Injira' : 'Already have an account? Login'}
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-gradient-to-br from-yellow-50 to-green-50 rounded-lg border border-yellow-200"
          >
            <p className="text-xs font-semibold text-gray-700 mb-2 text-center">
              ✨ {language === 'rw' ? 'Inyungu z\'Konti' : 'Account Benefits'}
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {language === 'rw' ? 'Kugenzura iterambere n\'amanota' : 'Track progress and grades'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                {language === 'rw' ? 'Kubona ibikoresho byo kwiga 24/7' : 'Access learning resources 24/7'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {language === 'rw' ? 'Guhuza n\'abarimu n\'ababyeyi' : 'Connect with teachers and parents'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                {language === 'rw' ? 'Kubona amakuru ako kanya' : 'Receive instant notifications'}
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

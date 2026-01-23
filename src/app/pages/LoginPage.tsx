import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { 
  Lock, Mail, ChevronRight, Sparkles, Eye, EyeOff, ArrowLeft,
  GraduationCap, Users, BookOpen, Shield, School, DollarSign, 
  Package, Settings, User, Loader2, CheckCircle2, AlertCircle, KeyRound, X, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle
 } from '@/app/components/ui/dialog';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

const UNIFIED_EMAIL = 'reponse@gmail.com';
const UNIFIED_PASSWORD = '2026';
const MS_ACCESS_CODE = 'g@2026';

// Public roles - Parents and Students
const PUBLIC_ROLES: { value: UserRole; label: string; labelRw: string; icon: React.ElementType; color: string; bgGradient: string; description: string }[] = [
  { value: 'student', label: 'Student', labelRw: 'Umunyeshuri', icon: User, color: 'from-blue-500 to-indigo-600', bgGradient: 'from-blue-50 to-indigo-50', description: 'Reba amanota n\'ibikorwa' },
  { value: 'parent', label: 'Parent', labelRw: 'Umubyeyi', icon: Users, color: 'from-pink-500 to-rose-600', bgGradient: 'from-pink-50 to-rose-50', description: 'Kugenzura abana' },
];

// Management Staff roles - requires MS code
const MANAGEMENT_ROLES: { value: UserRole; label: string; labelRw: string; icon: React.ElementType; color: string; bgGradient: string; description: string }[] = [
  { value: 'teacher', label: 'Teacher', labelRw: 'Umwarimu', icon: GraduationCap, color: 'from-green-500 to-teal-600', bgGradient: 'from-green-50 to-teal-50', description: 'Gucunga amaklasi' },
  { value: 'director_study', label: 'Director of Study', labelRw: "Umuyobozi w'Amasomo (DOS)", icon: BookOpen, color: 'from-yellow-500 to-amber-600', bgGradient: 'from-yellow-50 to-amber-50', description: 'Gucunga amasomo' },
  { value: 'director_discipline', label: 'Director of Discipline', labelRw: "Umuyobozi w'Imyitwarire (DOD)", icon: Shield, color: 'from-red-500 to-orange-600', bgGradient: 'from-red-50 to-orange-50', description: 'Gucunga imyitwarire' },
  { value: 'headmaster', label: 'Head Master', labelRw: 'Umuyobozi Mukuru', icon: School, color: 'from-purple-500 to-violet-600', bgGradient: 'from-purple-50 to-violet-50', description: 'Kugenzura ishuri' },
  { value: 'accountant', label: 'Accountant', labelRw: 'Umubare', icon: DollarSign, color: 'from-emerald-500 to-green-600', bgGradient: 'from-emerald-50 to-green-50', description: 'Gucunga amafaranga' },
  { value: 'stock_manager', label: 'Stock Manager', labelRw: "Umukozi w'Ububiko", icon: Package, color: 'from-cyan-500 to-blue-600', bgGradient: 'from-cyan-50 to-blue-50', description: 'Gucunga ibikoresho' },
  { value: 'admin', label: 'Administrator', labelRw: 'Umuyobozi wa Sistema', icon: Settings, color: 'from-slate-500 to-gray-600', bgGradient: 'from-slate-50 to-gray-50', description: 'Gucunga sisitemu' },
];

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { loginWithRole, getRoleDashboard } = useAuth();
  
  // View states
  const [step, setStep] = useState<'role-select' | 'login-form' | 'ms-roles'>('role-select');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // MS Code Modal
  const [showMSModal, setShowMSModal] = useState(false);
  const [msCode, setMSCode] = useState('');
  const [msCodeError, setMSCodeError] = useState('');
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedRoleData = [...PUBLIC_ROLES, ...MANAGEMENT_ROLES].find(r => r.value === selectedRole);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('login-form');
    setError('');
    setSuccess('');
  };

  const handleBackToRoles = () => {
    setStep('role-select');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleBackToMSRoles = () => {
    setStep('ms-roles');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleMSCodeSubmit = () => {
    if (msCode === MS_ACCESS_CODE) {
      setShowMSModal(false);
      setMSCode('');
      setMSCodeError('');
      setStep('ms-roles');
    } else {
      setMSCodeError(language === 'rw' ? 'Kode ntabwo ari yo' : 'Invalid access code');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      let endpoint = 'http://localhost:5000/api/auth/login';
      let loginData: any = {};

      if (selectedRole === 'parent') {
        endpoint = 'http://localhost:5000/api/auth/login/parent';
        loginData = {
          phone: email,
          password: password
        };
      } else {
        loginData = {
          username: email,
          password: password
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', selectedRole);
        
        setSuccess(language === 'rw' ? 'Kwinjira byagenze neza! Gutegereza...' : 'Login successful! Redirecting...');
        setTimeout(() => {
          onNavigate(getRoleDashboard(selectedRole));
        }, 1500);
      } else {
        setError(language === 'rw' ? 'Amakuru yinjijwe ntabwo ari yo' : data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(language === 'rw' ? 'Hari ikibazo. Ongera ugerageze.' : 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    if (!selectedRole) return;
    setEmail(UNIFIED_EMAIL);
    setPassword(UNIFIED_PASSWORD);
    
    setIsLoading(true);
    setError('');
    
    try {
      const loginData = {
        username: UNIFIED_EMAIL,
        password: UNIFIED_PASSWORD
      };

      let endpoint = 'http://localhost:5000/api/auth/login';
      if (selectedRole === 'parent') {
        endpoint = 'http://localhost:5000/api/auth/login/parent';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', selectedRole);
        
        setSuccess(language === 'rw' ? 'Kwinjira byagenze neza!' : 'Login successful!');
        setTimeout(() => {
          onNavigate(getRoleDashboard(selectedRole));
        }, 1000);
      } else {
        setError(language === 'rw' ? 'Kwinjira byanze' : data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Quick login error:', err);
      setError(language === 'rw' ? 'Hari ikibazo' : 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleCard = (role: typeof PUBLIC_ROLES[0], index: number) => {
    const Icon = role.icon;
    return (
      <motion.div
        key={role.value}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          onClick={() => handleRoleSelect(role.value)}
          className={`cursor-pointer border-2 border-yellow-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${role.bgGradient} overflow-hidden group`}
        >
          <CardContent className="p-5">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg mb-4`}
            >
              <Icon className="w-7 h-7 text-white" />
            </motion.div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {language === 'rw' ? role.labelRw : role.label}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {role.description}
            </p>

            <Button
              className={`w-full bg-gradient-to-r ${role.color} text-white font-semibold shadow-md hover:shadow-lg transition-all group-hover:scale-[1.02]`}
            >
              {language === 'rw' ? 'Injira' : 'Login'}
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50/30 to-yellow-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white px-4 py-1 font-semibold border-0">
              Garden TVET
            </Badge>
            <Sparkles className="w-6 h-6 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-600 bg-clip-text text-transparent">
            {step === 'role-select' 
              ? (language === 'rw' ? 'Hitamo Uruhare Rwawe' : 'Select Your Role')
              : step === 'ms-roles'
              ? (language === 'rw' ? 'Abakozi b\'Ubuyobozi' : 'Management Staff')
              : (language === 'rw' ? 'Kwinjira' : 'Login')
            }
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'role-select' 
              ? (language === 'rw' ? 'Kanda ku ruhare rwawe kugira ngo winjire' : 'Click on your role to login')
              : step === 'ms-roles'
              ? (language === 'rw' ? 'Hitamo uruhare rwawe rwo mu buyobozi' : 'Select your management role')
              : (language === 'rw' ? 'Injiza email n\'ijambo ry\'ibanga' : 'Enter your credentials')
            }
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Public Role Selection (Student/Parent) */}
          {step === 'role-select' && (
            <motion.div
              key="role-select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                {PUBLIC_ROLES.map((role, index) => renderRoleCard(role, index))}
              </div>

              {/* MS Button - Small Interactive Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mt-8"
              >
                <Button
                  onClick={() => setShowMSModal(true)}
                  variant="outline"
                  className="border-2 border-purple-400 text-purple-700 hover:bg-purple-50 hover:border-purple-500 font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <KeyRound className="w-5 h-5 mr-2" />
                  MS
                  <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs">
                    {language === 'rw' ? 'Abakozi' : 'Staff'}
                  </Badge>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8 space-y-3"
              >
                <Button
                  variant="outline"
                  onClick={() => onNavigate('home')}
                  className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'rw' ? 'Subira Ahabanza' : 'Back to Home'}
                </Button>
                
                <p className="text-sm text-gray-500">
                  {language === 'rw' ? "Nta konti ufite?" : "Don't have an account?"}{' '}
                  <button
                    onClick={() => onNavigate('register')}
                    className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                  >
                    {language === 'rw' ? 'Iyandikishe' : 'Register'}
                  </button>
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Step: MS Role Selection (Management Staff) */}
          {step === 'ms-roles' && (
            <motion.div
              key="ms-roles"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 flex justify-center"
              >
                <Button
                  variant="ghost"
                  onClick={handleBackToRoles}
                  className="text-gray-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'rw' ? 'Subira ku ruhare' : 'Back to Roles'}
                </Button>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {MANAGEMENT_ROLES.map((role, index) => renderRoleCard(role, index))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Login Form */}
          {step === 'login-form' && selectedRoleData && (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="max-w-sm mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4"
              >
                <Button
                  variant="ghost"
                  onClick={MANAGEMENT_ROLES.find(r => r.value === selectedRole) ? handleBackToMSRoles : handleBackToRoles}
                  className="text-gray-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'rw' ? 'Subira ku ruhare' : 'Back to Roles'}
                </Button>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center mb-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${selectedRoleData.color} flex items-center justify-center shadow-xl mb-4`}
                >
                  <selectedRoleData.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'rw' ? selectedRoleData.labelRw : selectedRoleData.label}
                </h2>
                <p className="text-gray-500 text-sm">{selectedRoleData.description}</p>
              </motion.div>

              <Card className="border-2 border-yellow-200 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                <CardHeader className={`bg-gradient-to-r ${selectedRoleData.bgGradient} pb-3 pt-4`}>
                  <CardTitle className="text-center text-base font-bold text-gray-800">
                    {language === 'rw' ? 'Kwinjira mu Sisitemu' : 'Login to Dashboard'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4"
                      >
                        <Alert className="border-red-300 bg-red-50 text-red-800">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="ml-2">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4"
                      >
                        <Alert className="border-green-300 bg-green-50 text-green-800">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="ml-2">{success}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                        {selectedRole === 'parent' 
                          ? (language === 'rw' ? 'Nimero ya Telefoni' : 'Phone Number')
                          : (language === 'rw' ? 'Aderesi ya Email' : 'Email Address')
                        }
                      </Label>
                      <div className="relative">
                        {selectedRole === 'parent' ? (
                          <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        ) : (
                          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        )}
                        <Input
                          id="email"
                          type={selectedRole === 'parent' ? 'tel' : 'email'}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={selectedRole === 'parent' ? '0788123456' : UNIFIED_EMAIL}
                          className="pl-9 h-10 border-2 border-gray-200 focus:border-yellow-400 transition-colors text-sm rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                        {language === 'rw' ? "Ijambo ry'ibanga" : 'Password'}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-9 pr-9 h-10 border-2 border-gray-200 focus:border-yellow-400 transition-colors text-sm rounded-lg"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full h-11 bg-gradient-to-r ${selectedRoleData.color} text-white font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-70 rounded-lg mt-4`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'rw' ? 'Gutegereza...' : 'Logging in...'}
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            {language === 'rw' ? 'Injira' : 'Login'}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleQuickLogin}
                        disabled={isLoading}
                        className="w-full h-9 border-2 border-green-400 text-green-700 hover:bg-green-50 font-semibold text-sm rounded-lg"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        {language === 'rw' ? 'Kwinjira Vuba' : 'Quick Login'}
                      </Button>
                    </motion.div>
                    <p className="text-xs text-center text-gray-500 mt-1.5">
                      {language === 'rw' ? 'Koresha amazina y\'ibanze' : 'Use default credentials'}
                    </p>
                  </div>

                  <div className="mt-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1.5">
                      {language === 'rw' ? 'Amazina y\'ibanze:' : 'Default Credentials:'}
                    </p>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Email:</span>
                      <code className="bg-white px-2 py-0.5 rounded text-gray-700 text-xs font-mono">{UNIFIED_EMAIL}</code>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Password:</span>
                      <code className="bg-white px-2 py-0.5 rounded text-gray-700 text-xs font-mono">{UNIFIED_PASSWORD}</code>
                    </div>
                  </div>

                  <p className="text-center text-xs text-gray-500 mt-3">
                    {language === 'rw' ? "Nta konti ufite?" : "Don't have an account?"}{' '}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigate('register')}
                      className="text-green-600 hover:text-green-700 font-bold hover:underline"
                    >
                      {language === 'rw' ? 'Iyandikishe' : 'Register'}
                    </motion.button>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MS Access Code Modal */}
      <Dialog open={showMSModal} onOpenChange={setShowMSModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
              <KeyRound className="w-6 h-6 text-purple-600" />
              {language === 'rw' ? 'Kode y\'Abakozi' : 'Staff Access Code'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-center text-gray-600 text-sm">
              {language === 'rw' 
                ? 'Injiza kode yo kwinjira mu buyobozi' 
                : 'Enter the management staff access code'}
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="ms-code" className="text-gray-700 font-medium">
                {language === 'rw' ? 'Kode' : 'Access Code'}
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="ms-code"
                  type="password"
                  value={msCode}
                  onChange={(e) => {
                    setMSCode(e.target.value);
                    setMSCodeError('');
                  }}
                  placeholder="••••••"
                  className="pl-10 h-12 border-2 border-purple-200 focus:border-purple-400 transition-colors text-center text-lg tracking-widest"
                  onKeyDown={(e) => e.key === 'Enter' && handleMSCodeSubmit()}
                />
              </div>
              {msCodeError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  {msCodeError}
                </motion.p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMSModal(false);
                  setMSCode('');
                  setMSCodeError('');
                }}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                {language === 'rw' ? 'Hagarika' : 'Cancel'}
              </Button>
              <Button
                onClick={handleMSCodeSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {language === 'rw' ? 'Emeza' : 'Verify'}
              </Button>
            </div>

            <p className="text-xs text-center text-gray-400">
              {language === 'rw' 
                ? 'Kode: g@2026 (Demo)' 
                : 'Code: g@2026 (Demo)'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;

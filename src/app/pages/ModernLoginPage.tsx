import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { 
  Lock, Mail, Eye, EyeOff, ArrowLeft, User, Users, GraduationCap, 
  BookOpen, Shield, School, DollarSign, Package, Settings, 
  Loader2, CheckCircle2, AlertCircle, KeyRound, Sparkles, Trophy, Target, TrendingUp, Phone
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface ModernLoginPageProps {
  onNavigate: (page: string) => void;
}

const UNIFIED_EMAIL = 'reponsekdz06@gmail.com';
const MS_ACCESS_CODE = 'g@2026';

const PUBLIC_ROLES = [
  { value: 'student' as UserRole, label: 'Student', labelRw: 'Umunyeshuri', icon: User, color: 'from-yellow-500 to-green-600' },
  { value: 'parent' as UserRole, label: 'Parent', labelRw: 'Umubyeyi', icon: Users, color: 'from-green-500 to-yellow-600' },
];

const MANAGEMENT_ROLES = [
  { value: 'teacher' as UserRole, label: 'Teacher', labelRw: 'Umwarimu', icon: GraduationCap, color: 'from-yellow-400 to-green-500' },
  { value: 'director_study' as UserRole, label: 'Director of Study', labelRw: "DOS", icon: BookOpen, color: 'from-green-400 to-yellow-500' },
  { value: 'director_discipline' as UserRole, label: 'Director of Discipline', labelRw: "DOD", icon: Shield, color: 'from-yellow-500 to-green-400' },
  { value: 'advisor' as UserRole, label: 'Advisor', labelRw: 'Umujyanama', icon: Target, color: 'from-blue-500 to-purple-500' },
  { value: 'headmaster' as UserRole, label: 'Head Master', labelRw: 'Umuyobozi Mukuru', icon: School, color: 'from-green-500 to-yellow-400' },
  { value: 'accountant' as UserRole, label: 'Accountant', labelRw: 'Umubare', icon: DollarSign, color: 'from-yellow-600 to-green-500' },
  { value: 'stock_manager' as UserRole, label: 'Stock Manager', labelRw: "Ububiko", icon: Package, color: 'from-green-600 to-yellow-500' },
  { value: 'admin' as UserRole, label: 'Administrator', labelRw: 'Admin', icon: Settings, color: 'from-yellow-500 to-green-600' },
];

const ModernLoginPage: React.FC<ModernLoginPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { loginWithRole, getRoleDashboard } = useAuth();
  
  const [step, setStep] = useState<'role-select' | 'login-form' | 'ms-roles'>('role-select');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showMSModal, setShowMSModal] = useState(false);
  const [msCode, setMSCode] = useState('');
  const [msCodeError, setMSCodeError] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedRoleData = [...PUBLIC_ROLES, ...MANAGEMENT_ROLES].find(r => r.value === selectedRole);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      let result;
      
      if (selectedRole === 'student') {
        const response = await fetch('http://localhost:5000/api/auth/login/student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serial_code: email, password })
        });
        result = await response.json();
        
        if (result.success) {
          setSuccess(language === 'rw' ? 'Kwinjira byagenze neza!' : 'Login successful!');
          if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
          }
          window.location.href = `/${getRoleDashboard(selectedRole)}`;
        } else {
          setError(result.message || 'Invalid serial code or password');
        }
      } else if (selectedRole === 'parent') {
        const response = await fetch('http://localhost:5000/api/auth/login/parent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        });
        result = await response.json();
        
        if (result.success) {
          setSuccess(language === 'rw' ? 'Kwinjira byagenze neza!' : 'Login successful!');
          if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
          }
          window.location.href = '/dashboard-parent';
        } else {
          setError(result.message || 'Invalid phone or password');
        }
      } else {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        });
        result = await response.json();
        
        if (result.success) {
          setSuccess(language === 'rw' ? 'Kwinjira byagenze neza!' : 'Login successful!');
          if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
          }
          window.location.href = `/${getRoleDashboard(selectedRole)}`;
        } else {
          setError(result.message || (language === 'rw' ? 'Email cyangwa ijambo ry\'ibanga sibyo' : 'Invalid credentials'));
        }
      }
    } catch (err) {
      setError(language === 'rw' ? 'Hari ikibazo' : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'login-form' && selectedRoleData ? (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-6xl"
          >
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              {/* Left Side - Info Cards */}
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
                    Welcome Back!
                  </h1>
                  <p className="text-gray-600">Login to access your dashboard</p>
                </div>

                <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedRoleData.color} flex items-center justify-center mb-4`}>
                      <selectedRoleData.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {language === 'rw' ? selectedRoleData.labelRw : selectedRoleData.label}
                    </h3>
                    <p className="text-gray-600 mb-4">Access your personalized dashboard</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Real-time updates
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Secure access
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        24/7 availability
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Excellence in Education</h4>
                        <p className="text-sm text-gray-600">Building tomorrow's leaders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Right Side - Login Form */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <Card className="border-2 border-yellow-200 shadow-2xl">
                  <CardContent className="p-8">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setStep(MANAGEMENT_ROLES.find(r => r.value === selectedRole) ? 'ms-roles' : 'role-select');
                        setSelectedRole(null);
                      }}
                      className="mb-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>

                    <div className="text-center mb-6">
                      <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${selectedRoleData.color} flex items-center justify-center mb-4`}>
                        <selectedRoleData.icon className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {language === 'rw' ? selectedRoleData.labelRw : selectedRoleData.label}
                      </h2>
                      <p className="text-gray-500 text-sm">Enter your credentials</p>
                    </div>

                    {error && (
                      <Alert className="mb-4 border-yellow-300 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="ml-2 text-yellow-800">{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="mb-4 border-green-300 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="ml-2 text-green-800">{success}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                      {selectedRole === 'student' ? (
                        <>
                          <div>
                            <Label htmlFor="serial">Nimero y'Umunyeshuri (Serial Code)</Label>
                            <div className="relative mt-1">
                              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                id="serial"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Andika nimero yawe"
                                className="pl-10 h-12"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="password">Ijambo ry'Ibanga (Password)</Label>
                            <div className="relative mt-1">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : selectedRole === 'parent' ? (
                        <>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative mt-1">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+250 XXX XXX XXX"
                                className="pl-10 h-12"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative mt-1">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative mt-1">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={UNIFIED_EMAIL}
                                className="pl-10 h-12"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative mt-1">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full h-12 bg-gradient-to-r ${selectedRoleData.color} text-white font-bold text-lg`}
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
                      </Button>
                    </form>


                    {(selectedRole === 'parent' || selectedRole === 'student') && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => onNavigate('register')}
                            className="text-green-600 hover:text-green-700 font-semibold"
                          >
                            Register here
                          </button>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        ) : step === 'role-select' ? (
          <motion.div
            key="role-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl"
          >
            <div className="text-center mb-8">
              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white px-4 py-2 mb-4">
                Garden TVET School
              </Badge>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                Select Your Role
              </h1>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
              {PUBLIC_ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.div key={role.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card
                      onClick={() => {
                        setSelectedRole(role.value);
                        setStep('login-form');
                      }}
                      className="cursor-pointer border-2 border-yellow-200 hover:border-green-400 transition-all"
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">{language === 'rw' ? role.labelRw : role.label}</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center">
              <Button onClick={() => setShowMSModal(true)} variant="outline" className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50">
                <KeyRound className="w-5 h-5 mr-2" />
                Management Staff
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ms-roles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-6xl"
          >
            <Button variant="ghost" onClick={() => setStep('role-select')} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MANAGEMENT_ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.div key={role.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card
                      onClick={() => {
                        setSelectedRole(role.value);
                        setStep('login-form');
                      }}
                      className="cursor-pointer border-2 border-yellow-200 hover:border-green-400"
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-bold">{language === 'rw' ? role.labelRw : role.label}</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showMSModal} onOpenChange={setShowMSModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Access Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              value={msCode}
              onChange={(e) => {
                setMSCode(e.target.value);
                setMSCodeError('');
              }}
              placeholder="Enter code"
              className="text-center"
            />
            {msCodeError && <p className="text-red-500 text-sm">{msCodeError}</p>}
            <Button
              onClick={() => {
                if (msCode === MS_ACCESS_CODE) {
                  setShowMSModal(false);
                  setStep('ms-roles');
                } else {
                  setMSCodeError('Invalid code');
                }
              }}
              className="w-full"
            >
              Verify
            </Button>
            <p className="text-xs text-center text-gray-400">Staff access code required</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModernLoginPage;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { 
  Lock, Mail, Eye, EyeOff, ArrowLeft, User, Users, GraduationCap, 
  BookOpen, Shield, School, DollarSign, Package, Settings, 
  Loader2, CheckCircle2, AlertCircle, KeyRound, Sparkles, Trophy, 
  Target, TrendingUp, Phone, Fingerprint, Smartphone, QrCode,
  Globe, Zap, Star, Heart, Coffee, Wifi, Camera, Mic, Bell,
  MessageCircle, Video, Calendar, Map, Clock, Battery, Signal
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface UltraModernLoginPageProps {
  onNavigate: (page: string) => void;
}

const UNIFIED_EMAIL = 'reponsekdz06@gmail.com';
const MS_ACCESS_CODE = 'g@2026';

const PUBLIC_ROLES = [
  { value: 'parent' as UserRole, label: 'Parent', labelRw: 'Umubyeyi', icon: Users, color: 'from-emerald-500 to-teal-600', description: 'Monitor your child\'s progress' },
];

const MANAGEMENT_ROLES = [
  { value: 'teacher' as UserRole, label: 'Teacher', labelRw: 'Umwarimu', icon: GraduationCap, color: 'from-blue-500 to-indigo-600', description: 'Manage classes and students' },
  { value: 'director_study' as UserRole, label: 'Director of Study', labelRw: "DOS", icon: BookOpen, color: 'from-purple-500 to-pink-600', description: 'Academic oversight' },
  { value: 'director_discipline' as UserRole, label: 'Director of Discipline', labelRw: "DOD", icon: Shield, color: 'from-red-500 to-orange-600', description: 'Student discipline management' },
  { value: 'advisor' as UserRole, label: 'Advisor', labelRw: 'Umujyanama', icon: Target, color: 'from-cyan-500 to-blue-600', description: 'Student guidance and counseling' },
  { value: 'headmaster' as UserRole, label: 'Head Master', labelRw: 'Umuyobozi Mukuru', icon: School, color: 'from-violet-500 to-purple-600', description: 'School administration' },
  { value: 'accountant' as UserRole, label: 'Accountant', labelRw: 'Umubare', icon: DollarSign, color: 'from-green-500 to-emerald-600', description: 'Financial management' },
  { value: 'stock_manager' as UserRole, label: 'Stock Manager', labelRw: "Ububiko", icon: Package, color: 'from-amber-500 to-yellow-600', description: 'Inventory management' },
  { value: 'admin' as UserRole, label: 'Administrator', labelRw: 'Admin', icon: Settings, color: 'from-slate-500 to-gray-600', description: 'System administration' },
];

const FLOATING_ICONS = [
  { icon: Star, delay: 0 },
  { icon: Heart, delay: 0.5 },
  { icon: Coffee, delay: 1 },
  { icon: Wifi, delay: 1.5 },
  { icon: Camera, delay: 2 },
  { icon: Mic, delay: 2.5 },
  { icon: Bell, delay: 3 },
  { icon: MessageCircle, delay: 3.5 },
];

const UltraModernLoginPage: React.FC<UltraModernLoginPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { loginWithRole, getRoleDashboard } = useAuth();
  
  const [step, setStep] = useState<'role-select' | 'login-form' | 'ms-roles' | 'biometric'>('role-select');
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
  const [rememberMe, setRememberMe] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedRoleData = [...PUBLIC_ROLES, ...MANAGEMENT_ROLES].find(r => r.value === selectedRole);

  // Initialize effects
  useEffect(() => {
    // Check biometric support
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      setBiometricSupported(true);
    }

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check battery level
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    // Network status
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Animated background
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles: any[] = [];
        for (let i = 0; i < 50; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.2
          });
        }

        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(34, 197, 94, ${particle.opacity})`;
            ctx.fill();
          });
          
          requestAnimationFrame(animate);
        };
        animate();
      }
    }

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Handle login attempts and blocking
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsBlocked(true);
      setBlockTimeRemaining(300); // 5 minutes
      
      const blockInterval = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            setLoginAttempts(0);
            clearInterval(blockInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(blockInterval);
    }
  }, [loginAttempts]);

  const handleBiometricLogin = async () => {
    if (!biometricSupported) return;
    
    try {
      setIsLoading(true);
      // Simulate biometric authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user has saved biometric data
      const savedBiometric = localStorage.getItem('biometric_user');
      if (savedBiometric) {
        const userData = JSON.parse(savedBiometric);
        setSuccess('Biometric authentication successful!');
        setTimeout(() => {
          window.location.href = `/${getRoleDashboard(userData.role)}`;
        }, 1000);
      } else {
        setError('No biometric data found. Please login with credentials first.');
      }
    } catch (err) {
      setError('Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || isBlocked) return;
    
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      let result;
      
      if (selectedRole === 'parent') {
        const response = await fetch('http://localhost:5000/api/auth/login/parent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        });
        result = await response.json();
        
        if (result.success) {
          setSuccess(language === 'rw' ? 'Kwinjira byagenze neza!' : 'Login successful!');
          setLoginAttempts(0);
          
          if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Save biometric data if enabled
            if (rememberMe && biometricSupported) {
              localStorage.setItem('biometric_user', JSON.stringify({
                role: selectedRole,
                user: result.user
              }));
            }
          }
          
          setTimeout(() => {
            window.location.href = '/dashboard-parent';
          }, 500);
        } else {
          setError(result.message || 'Invalid phone or password');
          setLoginAttempts(prev => prev + 1);
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
          setLoginAttempts(0);
          
          if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Save biometric data if enabled
            if (rememberMe && biometricSupported) {
              localStorage.setItem('biometric_user', JSON.stringify({
                role: selectedRole,
                user: result.user
              }));
            }
          }
          
          window.location.href = `/${getRoleDashboard(selectedRole)}`;
        } else {
          setError(result.message || (language === 'rw' ? 'Email cyangwa ijambo ry\'ibanga sibyo' : 'Invalid credentials'));
          setLoginAttempts(prev => prev + 1);
        }
      }
    } catch (err) {
      setError(language === 'rw' ? 'Hari ikibazo' : 'Network error');
      setLoginAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatBlockTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-30"
      />
      
      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOATING_ICONS.map((item, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight]
            }}
            transition={{
              duration: 8,
              delay: item.delay,
              repeat: Infinity,
              repeatDelay: 5
            }}
          >
            <item.icon className="w-6 h-6 text-emerald-400" />
          </motion.div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 text-white/70 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTime(currentTime)}
          </div>
          <div className="flex items-center gap-1">
            <Signal className={`w-4 h-4 ${networkStatus === 'online' ? 'text-green-400' : 'text-red-400'}`} />
            {networkStatus}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Battery className={`w-4 h-4 ${batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`} />
            {batteryLevel}%
          </div>
          <Badge variant="outline" className="border-emerald-400 text-emerald-400">
            Garden TVET
          </Badge>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {step === 'login-form' && selectedRoleData ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="w-full max-w-6xl"
            >
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Interactive Info */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden lg:block space-y-6"
                >
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center"
                    >
                      <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-2">
                      Welcome Back!
                    </h1>
                    <p className="text-white/70">Advanced secure login system</p>
                  </div>

                  <Card className="border-2 border-emerald-400/30 bg-white/10 backdrop-blur-lg">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedRoleData.color} flex items-center justify-center mb-4`}>
                        <selectedRoleData.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {language === 'rw' ? selectedRoleData.labelRw : selectedRoleData.label}
                      </h3>
                      <p className="text-white/70 mb-4">{selectedRoleData.description}</p>
                      <div className="space-y-2">
                        <motion.div 
                          className="flex items-center gap-2 text-sm text-emerald-400"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Real-time updates
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-2 text-sm text-emerald-400"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Advanced security
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-2 text-sm text-emerald-400"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Biometric support
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interactive Features */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20"
                    >
                      <QrCode className="w-8 h-8 text-emerald-400 mb-2" />
                      <p className="text-white text-sm font-semibold">QR Login</p>
                      <p className="text-white/60 text-xs">Scan to login</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20"
                    >
                      <Smartphone className="w-8 h-8 text-blue-400 mb-2" />
                      <p className="text-white text-sm font-semibold">Mobile App</p>
                      <p className="text-white/60 text-xs">Download now</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-2 border-emerald-400/30 bg-white/10 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-8">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setStep(MANAGEMENT_ROLES.find(r => r.value === selectedRole) ? 'ms-roles' : 'role-select');
                          setSelectedRole(null);
                        }}
                        className="mb-6 text-white hover:bg-white/10"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>

                      <div className="text-center mb-6">
                        <motion.div 
                          className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${selectedRoleData.color} flex items-center justify-center mb-4`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <selectedRoleData.icon className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white">
                          {language === 'rw' ? selectedRoleData.labelRw : selectedRoleData.label}
                        </h2>
                        <p className="text-white/60 text-sm">Secure authentication required</p>
                      </div>

                      {/* Security Status */}
                      <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-400">Security Level: High</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(i => (
                              <div key={i} className="w-2 h-2 rounded-full bg-emerald-400" />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Login Attempts Warning */}
                      {loginAttempts > 0 && (
                        <Alert className="mb-4 border-yellow-400/30 bg-yellow-500/20">
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-200">
                            {loginAttempts}/5 login attempts. {5 - loginAttempts} remaining.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Block Warning */}
                      {isBlocked && (
                        <Alert className="mb-4 border-red-400/30 bg-red-500/20">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-200">
                            Account temporarily blocked. Try again in {formatBlockTime(blockTimeRemaining)}.
                          </AlertDescription>
                        </Alert>
                      )}

                      {error && (
                        <Alert className="mb-4 border-red-400/30 bg-red-500/20">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-200">{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="mb-4 border-green-400/30 bg-green-500/20">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <AlertDescription className="text-green-200">{success}</AlertDescription>
                        </Alert>
                      )}

                      <form onSubmit={handleLogin} className="space-y-4">
                        {selectedRole === 'parent' ? (
                          <div>
                            <Label htmlFor="phone" className="text-white">Phone Number</Label>
                            <div className="relative mt-1">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                              <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+250 XXX XXX XXX"
                                className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                required
                                disabled={isBlocked}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="email" className="text-white">Email Address</Label>
                            <div className="relative mt-1">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={UNIFIED_EMAIL}
                                className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                disabled={isBlocked}
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="password" className="text-white">Password</Label>
                          <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="pl-10 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                              required
                              disabled={isBlocked}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              disabled={isBlocked}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5 text-white/40" /> : <Eye className="w-5 h-5 text-white/40" />}
                            </button>
                          </div>
                        </div>

                        {/* Remember Me & Biometric */}
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-white/70 text-sm">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="rounded border-white/20"
                              disabled={isBlocked}
                            />
                            Remember me
                          </label>
                          {biometricSupported && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleBiometricLogin}
                              className="text-emerald-400 hover:bg-emerald-400/10"
                              disabled={isBlocked}
                            >
                              <Fingerprint className="w-4 h-4 mr-1" />
                              Biometric
                            </Button>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading || isBlocked}
                          className={`w-full h-12 bg-gradient-to-r ${selectedRoleData.color} text-white font-bold text-lg hover:scale-105 transition-transform`}
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : isBlocked ? (
                            `Blocked (${formatBlockTime(blockTimeRemaining)})`
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-2" />
                              Secure Login
                            </>
                          )}
                        </Button>
                      </form>

                      {selectedRole === 'parent' && (
                        <div className="mt-6 text-center space-y-2">
                          <p className="text-white/70 text-sm">
                            {language === 'rw' ? "Nta konti ufite?" : "Don't have an account?"}{' '}
                            <button
                              type="button"
                              onClick={() => onNavigate('parent-register')}
                              className="text-emerald-400 hover:text-emerald-300 font-semibold"
                            >
                              {language === 'rw' ? "Iyandikisha nk'Umubyeyi" : "Register as Parent"}
                            </button>
                          </p>
                          <p className="text-xs text-white/50">
                            {language === 'rw' ? "Injiza telefoni, izina ry'umwana, urwego n'umwuga." : "Enter phone, student name, level & trade."}
                          </p>
                        </div>
                      )}

                      {/* Social Login Options */}
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <p className="text-center text-white/60 text-sm mb-4">Or continue with</p>
                        <div className="grid grid-cols-3 gap-3">
                          <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                            <Globe className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                            <Smartphone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ) : step === 'role-select' ? (
            <motion.div
              key="role-select"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full max-w-4xl"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center"
                >
                  <School className="w-12 h-12 text-white" />
                </motion.div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-4">
                  Garden TVET School
                </h1>
                <p className="text-white/70 text-xl">Select Your Role to Continue</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                {PUBLIC_ROLES.map((role, index) => {
                  const Icon = role.icon;
                  return (
                    <motion.div 
                      key={role.value} 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        onClick={() => {
                          setSelectedRole(role.value);
                          setStep('login-form');
                        }}
                        className="cursor-pointer border-2 border-emerald-400/30 bg-white/10 backdrop-blur-lg hover:border-emerald-400 transition-all duration-300"
                      >
                        <CardContent className="p-8 text-center">
                          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {language === 'rw' ? role.labelRw : role.label}
                          </h3>
                          <p className="text-white/60">{role.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => setShowMSModal(true)} 
                    variant="outline" 
                    className="border-2 border-emerald-400/50 bg-white/10 text-emerald-400 hover:bg-emerald-400/10 backdrop-blur-lg px-8 py-3"
                  >
                    <KeyRound className="w-5 h-5 mr-2" />
                    Management Staff Access
                  </Button>
                </motion.div>
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
              <Button 
                variant="ghost" 
                onClick={() => setStep('role-select')} 
                className="mb-6 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {MANAGEMENT_ROLES.map((role, index) => {
                  const Icon = role.icon;
                  return (
                    <motion.div 
                      key={role.value}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        onClick={() => {
                          setSelectedRole(role.value);
                          setStep('login-form');
                        }}
                        className="cursor-pointer border-2 border-white/20 bg-white/10 backdrop-blur-lg hover:border-emerald-400 transition-all duration-300"
                      >
                        <CardContent className="p-6 text-center">
                          <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-bold text-white text-sm mb-1">
                            {language === 'rw' ? role.labelRw : role.label}
                          </h3>
                          <p className="text-white/60 text-xs">{role.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Management Staff Access Modal */}
      <Dialog open={showMSModal} onOpenChange={setShowMSModal}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-emerald-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Staff Access Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type="password"
                value={msCode}
                onChange={(e) => {
                  setMSCode(e.target.value);
                  setMSCodeError('');
                }}
                placeholder="Enter access code"
                className="pl-10 text-center bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            {msCodeError && <p className="text-red-400 text-sm">{msCodeError}</p>}
            <Button
              onClick={() => {
                if (msCode === MS_ACCESS_CODE) {
                  setShowMSModal(false);
                  setStep('ms-roles');
                } else {
                  setMSCodeError('Invalid access code');
                }
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              <Shield className="w-4 h-4 mr-2" />
              Verify Access
            </Button>
            <p className="text-xs text-center text-white/40">
              Authorized personnel only
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UltraModernLoginPage;
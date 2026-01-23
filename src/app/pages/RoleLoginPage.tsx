import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import {
  GraduationCap,
  Users,
  BookOpen,
  Shield,
  School,
  DollarSign,
  Package,
  Settings,
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  UserPlus,
  LogIn
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Progress } from '@/app/components/ui/progress';
import { UserRole, useAuth } from '@/app/contexts/AuthContext';

interface RoleLoginPageProps {
  onNavigate: (page: string) => void;
  onRoleSelect: (role: UserRole) => void;
  selectedRole: UserRole | null;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Role configurations
const roles = [
  {
    role: 'director_study' as UserRole,
    title: "Umuyobozi w'Amasomo",
    subtitle: 'Director of Studies',
    description: "Gucunga amasomo n'iterambere ry'abanyeshuri",
    icon: BookOpen,
    color: 'from-yellow-500 to-amber-600',
    bgGradient: 'from-yellow-50 to-amber-50',
    features: ['Academic Oversight', 'Curriculum Management', 'Student Records', 'Performance Reports']
  },
  {
    role: 'director_discipline' as UserRole,
    title: "Umuyobozi w'Imyitwarire",
    subtitle: 'Director of Discipline',
    description: "Gucunga imyitwarire y'abanyeshuri",
    icon: Shield,
    color: 'from-red-500 to-orange-600',
    bgGradient: 'from-red-50 to-orange-50',
    features: ['Conduct Records', 'Disciplinary Actions', 'Behavior Analytics', 'Student Welfare']
  },
  {
    role: 'headmaster' as UserRole,
    title: 'Umuyobozi Mukuru',
    subtitle: 'Head Master',
    description: 'Kugenzura ishuri ryose',
    icon: School,
    color: 'from-purple-500 to-violet-600',
    bgGradient: 'from-purple-50 to-violet-50',
    features: ['School Management', 'Staff Oversight', 'Strategic Planning', 'Overall Analytics']
  },
  {
    role: 'teacher' as UserRole,
    title: 'Umwarimu',
    subtitle: 'Teacher Portal',
    description: "Gucunga amaklasi, amanota, n'abanyeshuri",
    icon: GraduationCap,
    color: 'from-green-500 to-teal-600',
    bgGradient: 'from-green-50 to-teal-50',
    features: ['Class Management', 'Grading System', 'Attendance Tracking', 'Lesson Plans']
  },
  {
    role: 'accountant' as UserRole,
    title: 'Umubare',
    subtitle: 'Accountant',
    description: "Gucunga amafaranga n'imari",
    icon: DollarSign,
    color: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-50 to-green-50',
    features: ['Financial Management', 'Payment Processing', 'Budget Control', 'Financial Reports']
  },
  {
    role: 'stock_manager' as UserRole,
    title: "Umukozi w'Ububiko",
    subtitle: 'Stock Manager',
    description: "Gucunga ibikoresho n'ububiko",
    icon: Package,
    color: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-50 to-blue-50',
    features: ['Inventory Management', 'Supply Chain', 'Asset Tracking', 'Purchase Orders']
  },
  {
    role: 'admin' as UserRole,
    title: 'Umuyobozi wa Sistema',
    subtitle: 'System Administrator',
    description: 'Gucunga sisitemu yose',
    icon: Settings,
    color: 'from-slate-500 to-gray-600',
    bgGradient: 'from-slate-50 to-gray-50',
    features: ['System Configuration', 'User Management', 'Security Settings', 'System Maintenance']
  },
  {
    role: 'student' as UserRole,
    title: 'Umunyeshuri',
    subtitle: 'Student Portal',
    description: "Reba amanota yawe, imyitwarire, n'ibikorwa byawe",
    icon: User,
    color: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    features: ['Grades & Reports', 'Attendance', 'Schedule', 'Assignments']
  },
  {
    role: 'parent' as UserRole,
    title: 'Umubyeyi',
    subtitle: 'Parent Portal',
    description: "Kugenzura iterambere ry'umwana wawe",
    icon: Users,
    color: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-50 to-rose-50',
    features: ['Student Progress', 'Communication', 'Payments', 'Reports']
  }
];

// Password strength calculator
const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
  let level = 0;
  if (password.length >= 6) level++;
  if (password.length >= 8) level++;
  if (/[A-Z]/.test(password)) level++;
  if (/[0-9]/.test(password)) level++;
  if (/[^A-Za-z0-9]/.test(password)) level++;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];

  return { level, label: labels[Math.min(level, 4)], color: colors[Math.min(level, 4)] };
};

const RoleLoginPage: React.FC<RoleLoginPageProps> = ({ onNavigate, onRoleSelect, selectedRole }) => {
  const [step, setStep] = useState<'select' | 'credentials'>('select');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, label: 'Very Weak', color: 'bg-red-500' });
  
  const { loginWithRole, registerRole, getRoleDashboard } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: 'reponse@gmail.com',
      password: '2026',
      rememberMe: false
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  });

  const selectedRoleData = roles.find(r => r.role === selectedRole);

  // Watch password for strength indicator
  const watchedPassword = registerForm.watch('password');
  
  useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(getPasswordStrength(watchedPassword));
    } else {
      setPasswordStrength({ level: 0, label: 'Very Weak', color: 'bg-red-500' });
    }
  }, [watchedPassword]);

  // Auto-advance to credentials if role is already selected
  useEffect(() => {
    if (selectedRole) {
      setStep('credentials');
    }
  }, [selectedRole]);

  const handleRoleSelect = (role: UserRole) => {
    setStep('credentials');
    onRoleSelect(role);
  };

  const handleLogin = async (data: LoginFormData) => {
    if (!selectedRole) return;
    
    setLoading(true);
    setMessage(null);

    try {
      let result;
      
      // Student login with serial code
      if (selectedRole === 'student') {
        const response = await fetch('http://localhost:5000/api/auth/login/student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serial_code: data.email, // email field contains serial code for students
            password: data.password
          })
        });
        result = await response.json();
      }
      // Parent login with phone
      else if (selectedRole === 'parent') {
        const response = await fetch('http://localhost:5000/api/auth/login/parent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: data.email, // email field contains phone for parents
            password: data.password
          })
        });
        result = await response.json();
      }
      // Other roles use standard login
      else {
        result = await loginWithRole(selectedRole, {
          email: data.email,
          password: data.password
        });
      }

      if (result.success) {
        setMessage({ type: 'success', text: 'Login successful! Redirecting to dashboard...' });
        
        // Store token and user if provided
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        
        if (data.rememberMe) {
          localStorage.setItem('rememberedEmail', data.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        setTimeout(() => {
          const dashboard = selectedRole === 'student' ? 'dashboard-student' : 
                          selectedRole === 'parent' ? 'dashboard-parent' : 
                          getRoleDashboard(selectedRole);
          onNavigate(dashboard);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Invalid credentials. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    if (!selectedRole) return;

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    // Validate password strength
    if (data.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await registerRole({
        roleName: selectedRole,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Account created successfully! Redirecting...' });
        
        setTimeout(() => {
          onNavigate((result as { success: boolean; dashboardPage?: string }).dashboardPage || getRoleDashboard(selectedRole));
        }, 1500);
      } else {
        setMessage({ type: 'error', text: (result as { success: boolean; message?: string }).message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email or set default
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      loginForm.setValue('email', rememberedEmail);
      loginForm.setValue('rememberMe', true);
    } else if (selectedRole !== 'student' && selectedRole !== 'parent') {
      // Set default credentials for management roles
      loginForm.setValue('email', 'reponse@gmail.com');
      loginForm.setValue('password', '2026');
    }
  }, [selectedRole]);

  // Role Selection Step
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-yellow-500 mr-2" />
              <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-600 bg-clip-text text-transparent">
                Hitamo Uruhare Rwawe
              </h1>
              <Sparkles className="h-8 w-8 text-green-500 ml-2" />
            </div>
            <p className="text-xl text-gray-600 font-medium">
              Select Your Role to Access Your Dashboard
            </p>
            <Badge className="mt-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white text-lg px-6 py-2">
              TVET School Management System
            </Badge>
          </motion.div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((roleData, index) => {
              const Icon = roleData.icon;

              return (
                <motion.div
                  key={roleData.role}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer border-3 transition-all duration-300 border-yellow-200 hover:border-green-400 hover:shadow-xl bg-gradient-to-br ${roleData.bgGradient} overflow-hidden group`}
                    onClick={() => handleRoleSelect(roleData.role)}
                  >
                    <CardContent className="p-6">
                      {/* Icon Section */}
                      <div className="relative mb-4">
                        <motion.div
                          className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${roleData.color} flex items-center justify-center shadow-lg`}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </motion.div>
                      </div>

                      {/* Title */}
                      <div className="text-center mb-3">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {roleData.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {roleData.subtitle}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-center text-gray-600 text-sm mb-4">
                        {roleData.description}
                      </p>

                      {/* Action Button */}
                      <Button
                        className={`w-full bg-gradient-to-r ${roleData.color} text-white font-semibold py-2 shadow-md hover:shadow-lg transition-all group-hover:scale-105`}
                      >
                        Injira
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              onClick={() => onNavigate('home')}
              className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-8 py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Subira Ahabanza
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Credentials Step - Login/Register Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => setStep('select')}
            className="text-gray-600 hover:text-yellow-700 hover:bg-yellow-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </motion.div>

        {/* Header with Role Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {selectedRoleData && (
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className={`p-4 rounded-2xl bg-gradient-to-br ${selectedRoleData.color} shadow-lg mb-4`}
              >
                <selectedRoleData.icon className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedRoleData.title}
              </h1>
              <p className="text-gray-500 mt-1">{selectedRoleData.subtitle}</p>
              <Badge className="mt-3 bg-gradient-to-r from-yellow-500 to-green-500 text-white px-4 py-1">
                Role Authentication
              </Badge>
            </div>
          )}
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-yellow-200 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50 pb-4">
              <CardTitle className="text-center text-xl text-gray-800">
                Welcome Back!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
                {(selectedRole === 'student' || selectedRole === 'parent') ? (
                  <div className="mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium">
                        {selectedRole === 'student' ? 'Student registration requires additional information.' : 'Parent registration requires additional information.'}
                      </p>
                      <Button
                        type="button"
                        onClick={() => onNavigate('register')}
                        className="mt-3 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Go to Registration Page
                      </Button>
                    </div>
                  </div>
                ) : (
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white transition-all"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register
                    </TabsTrigger>
                  </TabsList>
                )}

                {/* Message Alert */}
                <AnimatePresence mode="wait">
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mb-4"
                    >
                      <Alert
                        className={`${
                          message.type === 'success'
                            ? 'border-green-300 bg-green-50 text-green-800'
                            : 'border-red-300 bg-red-50 text-red-800'
                        }`}
                      >
                        {message.type === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className="ml-2">{message.text}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <TabsContent value="login" className="mt-0">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    {/* Serial Code Field for Students */}
                    {selectedRole === 'student' ? (
                      <div className="space-y-2">
                        <Label htmlFor="login-serial" className="text-gray-700 font-medium">
                          Nimero y'Umunyeshuri (Serial Code)
                        </Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="login-serial"
                            type="text"
                            placeholder="Andika nimero yawe"
                            className="pl-10 border-2 border-gray-200 focus:border-yellow-400 h-12 transition-colors"
                            {...loginForm.register('email', { required: 'Serial code is required' })}
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm"
                          >
                            {loginForm.formState.errors.email.message}
                          </motion.p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-gray-700 font-medium">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 border-2 border-gray-200 focus:border-yellow-400 h-12 transition-colors"
                            {...loginForm.register('email', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm"
                          >
                            {loginForm.formState.errors.email.message}
                          </motion.p>
                        )}
                      </div>
                    )}

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700 font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 border-2 border-gray-200 focus:border-yellow-400 h-12 transition-colors"
                          {...loginForm.register('password', { required: 'Password is required' })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm"
                        >
                          {loginForm.formState.errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={loginForm.watch('rememberMe')}
                          onCheckedChange={(checked) => loginForm.setValue('rememberMe', checked as boolean)}
                        />
                        <Label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-yellow-600 hover:text-yellow-700 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full h-12 bg-gradient-to-r ${selectedRoleData?.color || 'from-yellow-500 to-green-500'} text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-5 w-5 mr-2" />
                          Login to Dashboard
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register" className="mt-0">
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-700 font-medium">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="Enter first name"
                          className="border-2 border-gray-200 focus:border-blue-400 h-11 transition-colors"
                          {...registerForm.register('firstName', { required: 'First name is required' })}
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-red-500 text-xs">{registerForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-700 font-medium">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Enter last name"
                          className="border-2 border-gray-200 focus:border-blue-400 h-11 transition-colors"
                          {...registerForm.register('lastName', { required: 'Last name is required' })}
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-red-500 text-xs">{registerForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-gray-700 font-medium">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="Enter email address"
                          className="pl-10 border-2 border-gray-200 focus:border-blue-400 h-11 transition-colors"
                          {...registerForm.register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          className="pl-10 border-2 border-gray-200 focus:border-blue-400 h-11 transition-colors"
                          {...registerForm.register('phone')}
                        />
                      </div>
                    </div>

                    {/* Password Field with Strength Indicator */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-gray-700 font-medium">
                        Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password (min 6 characters)"
                          className="pl-10 pr-10 border-2 border-gray-200 focus:border-blue-400 h-11 transition-colors"
                          {...registerForm.register('password', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">{registerForm.formState.errors.password.message}</p>
                      )}
                      
                      {/* Password Strength Indicator */}
                      {watchedPassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <Progress value={(passwordStrength.level / 5) * 100} className="h-2 flex-1" />
                            <span className={`text-xs font-medium ${
                              passwordStrength.level < 2 ? 'text-red-500' : 
                              passwordStrength.level < 4 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10 border-2 border-gray-200 focus:border-blue-400 h-11 transition-colors"
                          {...registerForm.register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === registerForm.watch('password') || 'Passwords do not match'
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-sm">{registerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>

                    {/* Registration Info */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium mb-2">Registration Info:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Creates custom credentials for this role</li>
                        <li>• Password must be at least 6 characters</li>
                        <li>• You can register once per role</li>
                      </ul>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role Features */}
        {selectedRoleData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card className="bg-white/50 border border-gray-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                  Features Available
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoleData.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      {feature}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoleLoginPage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Edit,
  Save,
  RefreshCw,
  Key,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { UserRole } from '@/app/contexts/AuthContext';

interface RoleLoginPageProps {
  onNavigate: (page: string) => void;
  onRoleSelect: (role: UserRole) => void;
  selectedRole: UserRole | null;
}

const RoleLoginPage: React.FC<RoleLoginPageProps> = ({ onNavigate, onRoleSelect, selectedRole }) => {
  const [step, setStep] = useState<'select' | 'credentials'>('select');
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCredentials, setEditCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [roleData, setRoleData] = useState<any>(null);

  const API_BASE = 'http://localhost:5000/api';

  const roles = [
    {
      role: 'director_study' as UserRole,
      title: 'Umuyobozi w\'Amasomo',
      subtitle: 'Director of Studies',
      description: 'Gucunga amasomo n\'iterambere ry\'abanyeshuri',
      icon: BookOpen,
      color: 'from-yellow-500 to-amber-600',
      bgGradient: 'from-yellow-50 to-amber-50',
      features: ['Academic Oversight', 'Curriculum Management', 'Student Records', 'Performance Reports']
    },
    {
      role: 'director_discipline' as UserRole,
      title: 'Umuyobozi w\'Imyitwarire',
      subtitle: 'Director of Discipline',
      description: 'Gucunga imyitwarire y\'abanyeshuri',
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
      description: 'Gucunga amaklasi, amanota, n\'abanyeshuri',
      icon: GraduationCap,
      color: 'from-green-500 to-teal-600',
      bgGradient: 'from-green-50 to-teal-50',
      features: ['Class Management', 'Grading System', 'Attendance Tracking', 'Lesson Plans']
    },
    {
      role: 'accountant' as UserRole,
      title: 'Umubare',
      subtitle: 'Accountant',
      description: 'Gucunga amafaranga n\'imari',
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      features: ['Financial Management', 'Payment Processing', 'Budget Control', 'Financial Reports']
    },
    {
      role: 'stock_manager' as UserRole,
      title: 'Umukozi w\'Ububiko',
      subtitle: 'Stock Manager',
      description: 'Gucunga ibikoresho n\'ububiko',
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
    }
  ];

  const selectedRoleData = roles.find(r => r.role === selectedRole);

  useEffect(() => {
    if (selectedRole && step === 'credentials') {
      loadRoleCredentials();
    }
  }, [selectedRole, step]);

  const loadRoleCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/role-auth/role/${selectedRole}`);
      const data = await response.json();
      
      if (data.success) {
        setRoleData(data.data);
        setCredentials({
          email: data.data.email,
          password: '2026' // Default password
        });
        setEditCredentials({
          email: data.data.email,
          password: '',
          confirmPassword: '',
          first_name: data.data.first_name || '',
          last_name: data.data.last_name || '',
          phone: data.data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error loading role credentials:', error);
      setMessage({ type: 'error', text: 'Failed to load role credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setStep('credentials');
    onRoleSelect(role);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch(`${API_BASE}/role-auth/login-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roleName: selectedRole,
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        
        setTimeout(() => {
          // Navigate to role-specific dashboard
          const dashboardMap: Record<string, string> = {
            director_study: 'dashboard-director-study',
            director_discipline: 'dashboard-director-discipline', 
            headmaster: 'dashboard-headmaster',
            teacher: 'dashboard-teacher',
            accountant: 'dashboard-accountant',
            stock_manager: 'dashboard-stock',
            admin: 'admin'
          };
          onNavigate(dashboardMap[selectedRole!] || 'dashboard');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setMessage(null);

      if (editCredentials.password !== editCredentials.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        return;
      }

      const response = await fetch(`${API_BASE}/role-auth/register-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roleName: selectedRole,
          email: editCredentials.email,
          password: editCredentials.password,
          confirmPassword: editCredentials.confirmPassword,
          first_name: editCredentials.first_name,
          last_name: editCredentials.last_name,
          phone: editCredentials.phone
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setMessage({ type: 'success', text: 'Registration successful! Redirecting to dashboard...' });
        
        setTimeout(() => {
          // Navigate to role-specific dashboard
          const dashboardMap: Record<string, string> = {
            director_study: 'dashboard-director-study',
            director_discipline: 'dashboard-director-discipline', 
            headmaster: 'dashboard-headmaster',
            teacher: 'dashboard-teacher',
            accountant: 'dashboard-accountant',
            stock_manager: 'dashboard-stock',
            admin: 'admin'
          };
          onNavigate(dashboardMap[selectedRole!] || 'dashboard');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    try {
      setLoading(true);
      setMessage(null);

      if (editCredentials.password && editCredentials.password !== editCredentials.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        return;
      }

      const updateData: any = {
        email: editCredentials.email,
        first_name: editCredentials.first_name,
        last_name: editCredentials.last_name,
        phone: editCredentials.phone
      };

      if (editCredentials.password) {
        updateData.password = editCredentials.password;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/role-auth/role/${selectedRole}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Credentials updated successfully!' });
        setIsEditing(false);
        loadRoleCredentials(); // Reload the data
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

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
              Select Your Role to Access Advanced Features
            </p>
            <Badge className="mt-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white text-lg px-6 py-2">
              Enhanced Role-Based System
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
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer border-4 transition-all duration-300 border-yellow-200 hover:border-green-400 hover:shadow-xl bg-gradient-to-br ${roleData.bgGradient} overflow-hidden group`}
                    onClick={() => handleRoleSelect(roleData.role)}
                  >
                    <CardContent className="p-6">
                      {/* Icon Section */}
                      <div className="relative mb-4">
                        <motion.div
                          className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${roleData.color} flex items-center justify-center shadow-lg`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="h-10 w-10 text-white" />
                        </motion.div>
                      </div>

                      {/* Title */}
                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-black text-gray-900 mb-1">
                          {roleData.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {roleData.subtitle}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-center text-gray-700 mb-4 min-h-12">
                        {roleData.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        {roleData.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + idx * 0.1 }}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${roleData.color} mr-2`} />
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Button
                        className={`w-full bg-gradient-to-r ${roleData.color} text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                      >
                        Injira
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </CardContent>

                    {/* Hover Effect Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${roleData.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
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
              className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 text-lg px-8 py-3"
            >
              Subira Ahabanza
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Credentials step
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setStep('select')}
            className="absolute top-8 left-8 text-yellow-600 hover:text-yellow-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Roles
          </Button>

          <div className="flex items-center justify-center mb-4">
            {selectedRoleData && (
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedRoleData.color} mr-4`}>
                <selectedRoleData.icon className="h-10 w-10 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                {selectedRoleData?.title}
              </h1>
              <p className="text-lg text-gray-600">{selectedRoleData?.subtitle}</p>
            </div>
          </div>
          
          <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white px-4 py-2">
            Role Authentication System
          </Badge>
        </motion.div>

        {/* Credentials Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-4 border-yellow-200 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Role Credentials
              </CardTitle>
              <p className="text-gray-600">
                Manage your personalized login credentials
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Register
                  </TabsTrigger>
                  <TabsTrigger 
                    value="manage" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Manage
                  </TabsTrigger>
                </TabsList>

                {/* Message Display */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mb-4"
                    >
                      <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                        {message.type === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                          {message.text}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={credentials.email}
                          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10 border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={credentials.password}
                          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 pr-10 border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleLogin}
                      disabled={loading || !credentials.email || !credentials.password}
                      className="w-full bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold py-3 text-lg"
                    >
                      {loading ? (
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Key className="h-5 w-5 mr-2" />
                      )}
                      {loading ? 'Logging in...' : 'Login to Dashboard'}
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Default Credentials:</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Email:</strong> reponse@gmail.com
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Password:</strong> 2026
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      You can customize these credentials in the "Manage" tab
                    </p>
                  </div>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reg_first_name" className="text-sm font-medium">
                          First Name *
                        </Label>
                        <Input
                          id="reg_first_name"
                          value={editCredentials.first_name}
                          onChange={(e) => setEditCredentials(prev => ({ ...prev, first_name: e.target.value }))}
                          className="border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter first name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="reg_last_name" className="text-sm font-medium">
                          Last Name *
                        </Label>
                        <Input
                          id="reg_last_name"
                          value={editCredentials.last_name}
                          onChange={(e) => setEditCredentials(prev => ({ ...prev, last_name: e.target.value }))}
                          className="border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg_email" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg_email"
                          type="email"
                          value={editCredentials.email}
                          onChange={(e) => setEditCredentials(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10 border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg_phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="reg_phone"
                        value={editCredentials.phone}
                        onChange={(e) => setEditCredentials(prev => ({ ...prev, phone: e.target.value }))}
                        className="border-2 border-yellow-200 focus:border-green-400"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg_password" className="text-sm font-medium">
                        Password *
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg_password"
                          type={showPassword ? 'text' : 'password'}
                          value={editCredentials.password}
                          onChange={(e) => setEditCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 pr-10 border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter password (min 6 characters)"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg_confirm_password" className="text-sm font-medium">
                        Confirm Password *
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg_confirm_password"
                          type={showPassword ? 'text' : 'password'}
                          value={editCredentials.confirmPassword}
                          onChange={(e) => setEditCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pl-10 border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleRegister}
                      disabled={loading || !editCredentials.first_name || !editCredentials.last_name || !editCredentials.email || !editCredentials.password || !editCredentials.confirmPassword}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 text-lg"
                    >
                      {loading ? (
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <User className="h-5 w-5 mr-2" />
                      )}
                      {loading ? 'Registering...' : 'Register Role Credentials'}
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Registration Information:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• This will customize your login credentials for this role</li>
                      <li>• Password must be at least 6 characters long</li>
                      <li>• You can only register once per role</li>
                      <li>• After registration, use your custom credentials to login</li>
                    </ul>
                  </div>
                </TabsContent>

                {/* Manage Tab */}
                <TabsContent value="manage" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name" className="text-sm font-medium">
                          First Name
                        </Label>
                        <Input
                          id="first_name"
                          value={editCredentials.first_name}
                          onChange={(e) => setEditCredentials(prev => ({ ...prev, first_name: e.target.value }))}
                          className="border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter first name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="last_name" className="text-sm font-medium">
                          Last Name
                        </Label>
                        <Input
                          id="last_name"
                          value={editCredentials.last_name}
                          onChange={(e) => setEditCredentials(prev => ({ ...prev, last_name: e.target.value }))}
                          className="border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit_email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="edit_email"
                          type="email"
                          value={editCredentials.email}
                          onChange={(e) => setEditCredentials(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10 border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={editCredentials.phone}
                        onChange={(e) => setEditCredentials(prev => ({ ...prev, phone: e.target.value }))}
                        className="border-2 border-yellow-200 focus:border-green-400"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="new_password" className="text-sm font-medium">
                        New Password (Optional)
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="new_password"
                          type="password"
                          value={editCredentials.password}
                          onChange={(e) => setEditCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 border-2 border-yellow-200 focus:border-green-400"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>

                    {editCredentials.password && (
                      <div>
                        <Label htmlFor="confirm_password" className="text-sm font-medium">
                          Confirm Password
                        </Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="confirm_password"
                            type="password"
                            value={editCredentials.confirmPassword}
                            onChange={(e) => setEditCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="pl-10 border-2 border-yellow-200 focus:border-green-400"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleUpdateCredentials}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3"
                    >
                      {loading ? (
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5 mr-2" />
                      )}
                      {loading ? 'Updating...' : 'Update Credentials'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleLoginPage;
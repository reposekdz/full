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

interface ModernRegisterPageProps {
  onNavigate: (page: string) => void;
}

const ModernRegisterPage: React.FC<ModernRegisterPageProps> = ({ onNavigate }) => {
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
      setError('Passwords do not match');
      return;
    }
    if (!formData.role) {
      setError('Please select a role');
      return;
    }
    if (formData.role === 'student' && !formData.trade_code) {
      setError('Please select a trade');
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
          setSuccess('Registration successful! Redirecting...');
          setTimeout(() => onNavigate(getRoleDashboard('parent')), 1500);
        } else {
          setError(result.message || 'Registration failed');
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
          setSuccess(`Registration successful! Your Student ID: ${result.user.student_id}`);
          setTimeout(() => onNavigate(getRoleDashboard('student')), 2000);
        } else {
          setError(result.message || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: BookOpen, text: 'Access learning resources 24/7', color: 'text-yellow-500' },
    { icon: Trophy, text: 'Track academic progress & grades', color: 'text-green-500' },
    { icon: Award, text: 'Receive instant notifications', color: 'text-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Info Cards */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:block space-y-6"
          ><div className="text-center mb-8">
              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white px-4 py-2 text-lg font-bold border-0 mb-4">
                Garden TVET School
              </Badge>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-2">
                Join Our Community
              </h1>
              <p className="text-gray-600">Start your journey to excellence</p>
            </div>

            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-green-600 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">For Students</h3>
                    <p className="text-gray-600">Umunyeshuri</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Access courses and assignments
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    View grades and attendance
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
                    <h3 className="text-2xl font-bold text-gray-900">For Parents</h3>
                    <p className="text-gray-600">Umubyeyi</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Monitor child's progress
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Track attendance & fees
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
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Create Account</h2>
                  <p className="text-gray-600">Join Garden TVET School today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>I am a *</Label>
                    <Select value={formData.role} onValueChange={(value: 'student' | 'parent') => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="border-2">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student (Umunyeshuri)</SelectItem>
                        <SelectItem value="parent">Parent (Umubyeyi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email {formData.role === 'parent' ? '(Optional)' : '*'}</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required={formData.role === 'student'}
                    />
                  </div>

                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+250 XXX XXX XXX"
                      required
                    />
                  </div>

                  {formData.role === 'student' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date of Birth</Label>
                          <Input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Gender</Label>
                          <Select value={formData.gender} onValueChange={(value: 'Male' | 'Female') => setFormData({ ...formData, gender: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Select Trade *</Label>
                        <Select value={formData.trade_code} onValueChange={(value) => {
                          const selectedTrade = trades.find(t => t.trade_code === value);
                          setFormData({ 
                            ...formData, 
                            trade_code: value,
                            level_number: selectedTrade?.level_number?.toString() || '',
                            level_suffix: selectedTrade?.level_suffix || ''
                          });
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your trade" />
                          </SelectTrigger>
                          <SelectContent>
                            {trades.map((trade) => (
                              <SelectItem key={trade.id} value={trade.trade_code}>
                                {trade.full_name || trade.trade_name} - Level {trade.level_number}{trade.level_suffix || ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {formData.role === 'parent' && (
                    <div>
                      <Label>Location (Optional)</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="District, Sector, Cell"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <Label>Confirm Password *</Label>
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
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('login')}
                        className="text-green-600 hover:text-green-700 font-semibold"
                      >
                        Login here
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

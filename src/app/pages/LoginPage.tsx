import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Loader2, Shield, Fingerprint, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLogin }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'serial'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    serialCode: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint = 'http://localhost:5000/api/auth/login';
      let loginData: any = { password: formData.password };

      // Determine endpoint and data based on login method
      if (loginMethod === 'phone') {
        // Try parent login first, then fallback to regular login
        endpoint = 'http://localhost:5000/api/auth/login/parent';
        loginData = { phone: formData.phone, password: formData.password };
      } else if (loginMethod === 'serial') {
        // Student login with serial code
        endpoint = 'http://localhost:5000/api/auth/login/student';
        loginData = { serial_code: formData.serialCode, password: formData.password };
      } else {
        // Email login - works for all registered users (parent, student, staff)
        loginData = { username: formData.email, password: formData.password };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        setSuccess('Kwinjira byagenze neza!');

        // Store token and user data
        const storage = formData.rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        storage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        const role = data.user.role;
        const dashboardMap: Record<string, string> = {
          student: 'dashboard-student',
          parent: 'dashboard-parent',
          teacher: 'dashboard-teacher',
          admin: 'admin',
          headmaster: 'dashboard-headmaster',
          advisor: 'dashboard-advisor',
          dos: 'dashboard-dos',
          dod: 'dashboard-dod',
          accountant: 'dashboard-accountant',
          stock_manager: 'dashboard-stock'
        };
        const dashboardPage = dashboardMap[role] || 'dashboard';

        // Call onLogin to update app state
        onLogin(data.user);

        // Navigate to dashboard
        setTimeout(() => {
          onNavigate(dashboardPage);
        }, 500);
      } else {
        setError(data.message || 'Kwinjira ntibyakunze. Gerageza ukundi.');
      }
    } catch (err) {
      setError('Habaye ikosa. Gerageza ukundi.');
    } finally {
      setLoading(false);
    }
  };

  const loginMethods = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Telefoni', icon: Phone },
    { id: 'serial', label: 'Kode', icon: Fingerprint }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex flex-col justify-center text-white p-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl"
          >
            <Shield className="w-20 h-20 text-green-600" />
          </motion.div>
          <h1 className="text-6xl font-black mb-4">Murakaza Neza!</h1>
          <p className="text-2xl font-bold mb-6">Garden TVET School</p>
          <p className="text-xl text-green-100 mb-8">
            Sisitemu Ikomeye yo Gucunga Ishuri
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg">Umutekano Ukomeye</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg">Kwinjira Byoroshye</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg">Ibikorwa Byinshi</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-2xl border-4 border-white">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-gray-900 mb-2">Injira</h2>
                <p className="text-gray-600">Injira muri konti yawe</p>
              </div>

              {/* Login Method Selector */}
              <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                {loginMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setLoginMethod(method.id as any)}
                    className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${loginMethod === method.id
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <method.icon className="w-4 h-4" />
                    {method.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Login */}
                {loginMethod === 'email' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Imeyili
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder=""
                        className="pl-10 h-12 text-lg"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {/* Phone Login */}
                {loginMethod === 'phone' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nimero ya Telefoni
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder=""
                        className="pl-10 h-12 text-lg"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {/* Serial Code Login */}
                {loginMethod === 'serial' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Kode y'Umunyeshuri
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        value={formData.serialCode}
                        onChange={(e) => setFormData({ ...formData, serialCode: e.target.value.toUpperCase() })}
                        placeholder=""
                        className="pl-10 h-12 text-lg font-mono"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Ijambo Ryibanga
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder=""
                      className="pl-10 pr-10 h-12 text-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Nyibuka</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="text-sm font-bold text-green-600 hover:text-green-700"
                  >
                    Wibagiwe Ijambo Ryibanga?
                  </button>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-700 font-semibold">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success Message */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-700 font-semibold">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gutegereza...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Injira
                    </>
                  )}
                </Button>

                {/* Register Link */}
                <div className="text-center pt-4 border-t">
                  <p className="text-gray-600">
                    Ntufite konti?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('parent-register')}
                      className="font-bold text-green-600 hover:text-green-700"
                    >
                      Iyandikishe nk'umubyeyi
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

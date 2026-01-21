import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

import { apiService } from '@/app/services/apiService';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { login, getRoleDashboard } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '' as 'student' | 'parent' | '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (formData.role === 'parent') {
        result = await apiService.registerParent({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address
        });
        
        if (result.success && result.token) {
          localStorage.setItem('token', result.token);
          const dashboard = getRoleDashboard('parent');
          onNavigate(dashboard);
        } else {
          setError(result.message || 'Registration failed');
        }
      } else {
        const registerResult = await apiService.request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username: formData.email.split('@')[0],
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone
          })
        });

        if (registerResult.success) {
          const loginResult = await login(formData.email, formData.password);
          if (loginResult.success && loginResult.dashboardPage) {
            onNavigate(loginResult.dashboardPage);
          }
        } else {
          setError(registerResult.message || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-yellow-200">
          <div className="text-center mb-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="inline-block bg-gradient-to-r from-yellow-500 to-green-500 p-3 rounded-full mb-3 shadow-lg"
            >
              <UserPlus className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              {t('register')}
            </h1>
            <p className="text-gray-600 text-sm mt-1">Student & Parent Registration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name" className="text-sm text-gray-700">First Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                  <Input
                    id="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="pl-9 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="last_name" className="text-sm text-gray-700">Last Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                  <Input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="pl-9 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm text-gray-700">{t('email')}</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-9 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm text-gray-700">{t('phoneNumber')}</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-9 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role" className="text-sm text-gray-700">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'student' | 'parent' })}>
                <SelectTrigger className="mt-1 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-gray-700">{t('password')}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-9 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm text-gray-700">{t('confirmPassword')}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-9 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            {formData.role === 'parent' && (
              <div>
                <Label htmlFor="address" className="text-sm text-gray-700">Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 h-9 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold mt-4 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : t('signUp')}
            </Button>
          </form>

          <div className="mt-3 text-center">
            <button
              onClick={() => onNavigate('login')}
              className="text-sm text-yellow-700 hover:text-green-600 hover:underline font-medium"
            >
              Already have an account? {t('login')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

/**
 * Enhanced Parent Registration v2.0
 * Features: Simple parent registration, real-time validation, automatic redirect
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, nsEye, EyeOff, Mail, Lock, Phone, AlertCircle, CheckCircle, Loader2,
  ArrowRight, Heart, Sparkles, Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '@/app/config/apiBase';
import RwandaLocationParentInput from '@/app/components/RwandaLocationParentInput';

interface ParentRegistrationPageProps {
  onNavigate: (page: string) => void;
}

const ParentRegistrationPage: React.FC<ParentRegistrationPageProps> = ({ onNavigate }) => {
  const { setAuthFromRegistration } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    province: '',
    district: '',
    sector: '',
    relationshipType: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = "Izina ryambere rirakenewe";
    if (!formData.lastName.trim()) errors.lastName = "Izina ryukuri rirakenewe";
    if (!formData.phone.trim()) errors.phone = "Telefoni irakenewe";
    else if (!/^07\d{8}$/.test(formData.phone.replace(/\s/g, ''))) errors.phone = "Telefoni ntiyemewe (07XXXXXXXX)";
    // Email is optional - auto-generated if not provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Imeyili ntiyemewe";
    if (!formData.password) errors.password = "Ijambo ryibanga rirakenewe";
    else if (formData.password.length < 6) errors.password = "Ijambo ryibanga rigomba kuba rifite imibare 6 nibura";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Amagambo yibanga ntabwo ahuje";
    if (!formData.gender) errors.gender = "Hitamo igitsina";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone.replace(/\s/g, ''),
        password: formData.password,
        address: [formData.province, formData.district, formData.sector].filter(Boolean).join(', '),
        province: formData.province,
        district: formData.district,
        sector: formData.sector,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        relationship_type: formData.relationshipType,
        selected_students: [] // No students linked during registration
      };

      const response = await fetch(`${API_BASE_URL}/parent-registration/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Kwiyandikisha byagenze neza! Turerekeza kuri dashboard yawe...");

        if (data.token && data.user) {
          // Store auth data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('role', 'parent');

          console.log('✅ Registration successful:', { token: data.token, user: data.user });

          if (setAuthFromRegistration) {
            const dashboardRoute = setAuthFromRegistration(data.token, data.user);
            console.log('✅ Auth context updated, dashboard route:', dashboardRoute);
          }

          // Navigate to parent child linking page
          setTimeout(() => {
            console.log('🚀 Navigating to parent-child-linking');
            onNavigate('parent-child-linking');
            window.scrollTo(0, 0);
          }, 1500);
        } else {
          setTimeout(() => onNavigate('login'), 2000);
        }
      } else {
        setError(data.message || "Kwiyandikisha ntibyakunze. Gerageza ukundi.");
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.message || "Habaye ikosa ryo kwiyandikisha. Gerageza ukundi.";
      if (err.message && err.message.includes('fetch')) {
        setError("Ntushobora guhuza na seriveri. Kugenzura niba seriveri irakoze.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 bg-white/10 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${10 + i * 10}%`
            }}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10">
        <Card className="shadow-2xl border-4 border-white backdrop-blur-sm bg-white/95">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <UserPlus className="w-12 h-12 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </motion.div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Iyandikisha nk'Umubyeyi</h2>
              <p className="text-gray-600">Fungura konti nshya kugira ngo ukurikirane abana bawe</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Izina Ryambere</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder=""
                    className="h-12"
                  />
                  {validationErrors.firstName && <p className="text-red-600 text-xs mt-1">{validationErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Izina Ryukuri</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder=""
                    className="h-12"
                  />
                  {validationErrors.lastName && <p className="text-red-600 text-xs mt-1">{validationErrors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Imeyili</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-12"
                  />
                </div>
                {validationErrors.email && <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Telefoni *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="07XXXXXXXX"
                    className="pl-10 h-12"
                  />
                </div>
                {validationErrors.phone && <p className="text-red-600 text-xs mt-1">{validationErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ijambo Ryibanga</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
                {validationErrors.password && <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Emeza Ijambo Ryibanga</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 h-12"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && <p className="text-red-600 text-xs mt-1">{validationErrors.confirmPassword}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Itariki y'Amavuko</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="h-12"
                  />
                  {validationErrors.dateOfBirth && <p className="text-red-600 text-xs mt-1">{validationErrors.dateOfBirth}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Igitsina</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-12 border rounded-lg px-3"
                  >
                    <option value="">Hitamo</option>
                    <option value="male">Gabo</option>
                    <option value="female">Gore</option>
                  </select>
                  {validationErrors.gender && <p className="text-red-600 text-xs mt-1">{validationErrors.gender}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Aho Utuye (Intara, Akarere, Umurenge)</label>
                <RwandaLocationParentInput
                  onLocationChange={(loc) => setFormData({
                    ...formData,
                    province: loc.province || '',
                    district: loc.district || '',
                    sector: loc.sector || ''
                  })}
                  initialValues={{
                    province: formData.province,
                    district: formData.district,
                    sector: formData.sector
                  }}
                  required={true}
                />
                {(validationErrors.province || validationErrors.district || validationErrors.sector) && (
                  <p className="text-red-600 text-xs mt-1">
                    {validationErrors.province || validationErrors.district || validationErrors.sector}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Isano n'Umwana</label>
                <select
                  value={formData.relationshipType}
                  onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value })}
                  className="w-full h-12 border rounded-lg px-3"
                >
                  <option value="">Hitamo isano</option>
                  <option value="father">Data</option>
                  <option value="mother">Mama</option>
                  <option value="guardian">Umurezi</option>
                  <option value="other">Ikindi</option>
                </select>
                {validationErrors.relationshipType && <p className="text-red-600 text-xs mt-1">{validationErrors.relationshipType}</p>}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700 font-semibold">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-xl flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </motion.div>
                    <p className="text-green-700 font-semibold">{success}</p>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Heart className="w-4 h-4 text-green-600" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 mt-8">
                <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-lg font-bold">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gutegereza...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Iyandikisha
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center mt-6 pt-6 border-t">
                <p className="text-gray-600">
                  Usanzwe ufite konti?{' '}
                  <button type="button" onClick={() => onNavigate('login')} className="font-bold text-green-600 hover:text-green-700">
                    Injira
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ParentRegistrationPage;

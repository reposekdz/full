/**
 * Parent-only registration: link with child(ren).
 * Requires: phone, student name, level, trade. No role selection (parent is known).
 * Waits for school staff confirmation for full access.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Loader2,
  GraduationCap, ArrowRight, ArrowLeft, Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '@/app/config/apiBase';
import RwandaLocationTextInput from '@/app/components/RwandaLocationTextInput';

interface ParentRegistrationPageProps {
  onNavigate: (page: string) => void;
}

const TRADES = [
  'Software Development',
  'Electrical Installation',
  'Plumbing',
  'Welding',
  'Carpentry',
  'Masonry'
];

const LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

const ParentRegistrationPage: React.FC<ParentRegistrationPageProps> = ({ onNavigate }) => {
  const { setAuthFromRegistration } = useAuth();
  const [step, setStep] = useState(1);
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
    cell: '',
    village: '',
    nationalId: '',
    relationshipType: '',
    studentFirstName: '',
    studentLastName: '',
    studentTrade: '',
    studentLevel: '',
    studentId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.firstName.trim()) errors.firstName = "Izina ryambere rirakenewe";
      if (!formData.lastName.trim()) errors.lastName = "Izina ryukuri rirakenewe";
      if (!formData.phone.trim()) errors.phone = "Telefoni irakenewe";
      else if (!/^07\d{8}$/.test(formData.phone.replace(/\s/g, ''))) errors.phone = "Telefoni ntiyemewe (07XXXXXXXX)";
      if (!formData.email.trim()) errors.email = "Imeyili irakenewe";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Imeyili ntiyemewe";
      if (!formData.password) errors.password = "Ijambo ryibanga rirakenewe";
      else if (formData.password.length < 6) errors.password = "Ijambo ryibanga rigomba kuba rifite imibare 6 nibura";
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Amagambo yibanga ntabwo ahuje";
      if (!formData.dateOfBirth) errors.dateOfBirth = "Itariki y'amavuko irakenewe";
      if (!formData.gender) errors.gender = "Hitamo igitsina";
      const hasLocation = formData.province && formData.district && formData.sector;
      if (!hasLocation) {
        if (!formData.province) errors.province = "Hitamo intara";
        if (!formData.district) errors.district = "Hitamo akarere";
        if (!formData.sector) errors.sector = "Hitamo umurenge";
      }
      if (!formData.address.trim() && !hasLocation) errors.address = "Aderesi cyangwa aho utuye rirakenewe";
      if (!formData.relationshipType) errors.relationshipType = "Hitamo isano n'umwana";
    }
    if (currentStep === 2) {
      if (!formData.studentFirstName.trim()) errors.studentFirstName = "Izina ry'umwana rirakenewe";
      if (!formData.studentLastName.trim()) errors.studentLastName = "Izina ryukuri ry'umwana rirakenewe";
      if (!formData.studentTrade) errors.studentTrade = "Hitamo umwuga w'umwana";
      if (!formData.studentLevel) errors.studentLevel = "Hitamo urwego rw'umwana";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/user-auth/parent/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone.replace(/\s/g, ''),
          password: formData.password,
          address: formData.address || [formData.province, formData.district, formData.sector, formData.cell, formData.village].filter(Boolean).join(', '),
          province: formData.province || undefined,
          district: formData.district || undefined,
          sector: formData.sector || undefined,
          cell: formData.cell || undefined,
          village: formData.village || undefined,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          national_id: formData.nationalId || undefined,
          relationship_type: formData.relationshipType,
          student_first_name: formData.studentFirstName,
          student_last_name: formData.studentLastName,
          student_trade: formData.studentTrade,
          student_level: formData.studentLevel,
          student_id: formData.studentId || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(
          "Kwiyandikisha byagenze neza. Tegereza ko umukozi w'ishuri abona n'akemura kugira ngo uhabwe uburenganzira buuzuye. Urakwiye kwinjira."
        );
        if (data.token && data.user) {
          const dashboardPage = setAuthFromRegistration(data.token, data.user);
          setTimeout(() => onNavigate(dashboardPage), 2500);
        } else {
          setTimeout(() => onNavigate('login'), 2500);
        }
      } else {
        setError(data.message || "Kwiyandikisha ntibyakunze. Gerageza ukundi.");
      }
    } catch (err) {
      setError("Habaye ikosa. Gerageza ukundi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="shadow-2xl border-4 border-white">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <UserPlus className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Iyandikisha nk'Umubyeyi</h2>
              <p className="text-gray-600">Fungura konti nshya no guhuza n'umwana wawe</p>
              <div className="flex justify-center gap-2 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1. Amakuru y'umubyeyi
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2. Amakuru y'umwana
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-4"
                  >
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">Aho Utuye (Intara, Akarere, Umurenge, Akagari, Umudugudu)</label>
                      <RwandaLocationTextInput
                        onLocationChange={(loc) => setFormData({
                          ...formData,
                          province: loc.province || '',
                          district: loc.district || '',
                          sector: loc.sector || '',
                          cell: loc.cell || '',
                          village: loc.village || '',
                          address: [loc.province, loc.district, loc.sector, loc.cell, loc.village].filter(Boolean).join(', ') || formData.address
                        })}
                        initialValues={{
                          province: formData.province,
                          district: formData.district,
                          sector: formData.sector,
                          cell: formData.cell,
                          village: formData.village
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">Aderesi (Bihitamo)</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Aderesi y'umudugudu"
                        className="h-12"
                      />
                      {validationErrors.address && <p className="text-red-600 text-xs mt-1">{validationErrors.address}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Indangamuntu (Bihitamo)</label>
                      <Input
                        value={formData.nationalId}
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                        placeholder="1199012345678901"
                        className="h-12"
                      />
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
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl mb-4">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                        Amakuru y'Umwana Wiga
                      </h3>
                      <p className="text-sm text-gray-600">Injiza amakuru y'umwana wawe wiga muri Garden TVET School. Tegereza ko umukozi w'ishuri abona n'akemura.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Izina ry'Umwana</label>
                        <Input
                          value={formData.studentFirstName}
                          onChange={(e) => setFormData({ ...formData, studentFirstName: e.target.value })}
                          placeholder="Marie"
                          className="h-12"
                        />
                        {validationErrors.studentFirstName && <p className="text-red-600 text-xs mt-1">{validationErrors.studentFirstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Izina Ryukuri</label>
                        <Input
                          value={formData.studentLastName}
                          onChange={(e) => setFormData({ ...formData, studentLastName: e.target.value })}
                          placeholder="UWASE"
                          className="h-12"
                        />
                        {validationErrors.studentLastName && <p className="text-red-600 text-xs mt-1">{validationErrors.studentLastName}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Umwuga w'Umwana</label>
                        <select
                          value={formData.studentTrade}
                          onChange={(e) => setFormData({ ...formData, studentTrade: e.target.value })}
                          className="w-full h-12 border rounded-lg px-3"
                        >
                          <option value="">Hitamo umwuga</option>
                          {TRADES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        {validationErrors.studentTrade && <p className="text-red-600 text-xs mt-1">{validationErrors.studentTrade}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Urwego rw'Umwana</label>
                        <select
                          value={formData.studentLevel}
                          onChange={(e) => setFormData({ ...formData, studentLevel: e.target.value })}
                          className="w-full h-12 border rounded-lg px-3"
                        >
                          <option value="">Hitamo urwego</option>
                          {LEVELS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                        {validationErrors.studentLevel && <p className="text-red-600 text-xs mt-1">{validationErrors.studentLevel}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nimero y'Umwana (Bihitamo)</label>
                      <Input
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        placeholder="SWD0012026"
                        className="h-12"
                      />
                      <p className="text-xs text-gray-500 mt-1">Niba uzi nimero y'umwana, yinjize hano</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                      <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        Nyuma yo kwiyandikisha, umukozi w'ishuri (Umukuru w'ishuri, DOS, DOD, Umukontiri cyangwa Umuyobozi) azasuzuma icyifuzo cyawe kandi azaha uburenganzira buuzuye. Uzabona ubutumwa nyuma y'icyemezo.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700 font-semibold">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-700 font-semibold">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <Button type="button" onClick={handleBack} variant="outline" className="flex-1 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Subira
                  </Button>
                )}
                {step < 2 ? (
                  <Button type="button" onClick={handleNext} className="flex-1 h-12 bg-gradient-to-r from-green-600 to-teal-600">
                    Komeza
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600">
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
                )}
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Loader2, Shield, Calendar, MapPin, Briefcase, GraduationCap, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { getRoleDashboard } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Step 2: Account Info
    password: '',
    confirmPassword: '',
    role: 'student',
    // Step 3: Additional Info
    dateOfBirth: '',
    gender: '',
    address: '',
    nationalId: '',
    // Step 4: Role-specific
    studentCode: '',
    parentName: '',
    parentPhone: '',
    course: '',
    level: '',
    // Parent-specific: Student connection
    studentFirstName: '',
    studentLastName: '',
    studentTrade: '',
    studentLevel: '',
    studentId: '',
    relationshipType: '',
    // Terms
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<any>({});

  const validateStep = (currentStep: number) => {
    const errors: any = {};

    if (currentStep === 1) {
      if (!formData.firstName) errors.firstName = 'Izina ryambere rirakenewe';
      if (!formData.lastName) errors.lastName = 'Izina ryukuri rirakenewe';
      if (!formData.email) errors.email = 'Imeyili irakenewe';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Imeyili ntiyemewe';
      if (!formData.phone) errors.phone = 'Telefoni irakenewe';
      else if (!/^07\d{8}$/.test(formData.phone)) errors.phone = 'Telefoni ntiyemewe (07XXXXXXXX)';
    }

    if (currentStep === 2) {
      if (!formData.password) errors.password = 'Ijambo ryibanga rirakenewe';
      else if (formData.password.length < 6) errors.password = 'Ijambo ryibanga rigomba kuba rifite imibare 6 nibura';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Amagambo yibanga ntabwo ahuje';
      if (!formData.role) errors.role = 'Hitamo uruhare';
    }

    if (currentStep === 3) {
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Itariki y\'amavuko irakenewe';
      if (!formData.gender) errors.gender = 'Hitamo igitsina';
      if (!formData.address) errors.address = 'Aderesi irakenewe';
    }

    if (currentStep === 4) {
      if (formData.role === 'student') {
        if (!formData.course) errors.course = 'Hitamo umwuga';
        if (!formData.level) errors.level = 'Hitamo urwego';
        if (!formData.parentName) errors.parentName = 'Izina ry\'umubyeyi rirakenewe';
        if (!formData.parentPhone) errors.parentPhone = 'Telefoni y\'umubyeyi irakenewe';
      }
      if (formData.role === 'parent') {
        if (!formData.studentFirstName) errors.studentFirstName = 'Izina ry\'umwana rirakenewe';
        if (!formData.studentLastName) errors.studentLastName = 'Izina ryukuri ry\'umwana rirakenewe';
        if (!formData.studentTrade) errors.studentTrade = 'Hitamo umwuga w\'umwana';
        if (!formData.studentLevel) errors.studentLevel = 'Hitamo urwego rw\'umwana';
        if (!formData.relationshipType) errors.relationshipType = 'Hitamo isano';
      }
      if (!formData.agreeTerms) errors.agreeTerms = 'Ugomba kwemera amabwiriza';
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
    
    if (!validateStep(4)) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint = '';
      let payload: any = {};

      if (formData.role === 'parent') {
        endpoint = 'http://localhost:5000/api/auth/register/parent';
        payload = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          national_id: formData.nationalId,
          student_first_name: formData.studentFirstName,
          student_last_name: formData.studentLastName,
          student_trade: formData.studentTrade,
          student_level: formData.studentLevel,
          student_id: formData.studentId,
          relationship_type: formData.relationshipType
        };
      } else if (formData.role === 'student') {
        endpoint = 'http://localhost:5000/api/auth/register/student';
        payload = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          national_id: formData.nationalId,
          trade_code: formData.course,
          level: formData.level,
          parent_name: formData.parentName,
          parent_phone: formData.parentPhone
        };
      } else {
        setError('Uruhare ntirwemewe');
        setLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Kwiyandikisha byagenze neza! Urakwiye kwinjira.');
        
        // Store token and user data for automatic login
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Redirect to appropriate dashboard immediately
        const dashboardPage = getRoleDashboard(formData.role);
        setTimeout(() => {
          onNavigate(dashboardPage);
        }, 1500);
      } else {
        setError(data.message || 'Kwiyandikisha ntibyakunze. Gerageza ukundi.');
      }
    } catch (err) {
      setError('Habaye ikosa. Gerageza ukundi.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'student', label: 'Umunyeshuri', icon: GraduationCap },
    { value: 'parent', label: 'Umubyeyi', icon: User },
    { value: 'teacher', label: 'Umwarimu', icon: Briefcase }
  ];

  const courses = [
    'Software Development',
    'Electrical Installation',
    'Plumbing',
    'Welding',
    'Carpentry',
    'Masonry'
  ];

  const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

  const steps = [
    { number: 1, title: 'Amakuru Yibanze', icon: User },
    { number: 2, title: 'Konti', icon: Lock },
    { number: 3, title: 'Amakuru Yinyongera', icon: MapPin },
    { number: 4, title: 'Soza', icon: Check }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-2xl border-4 border-white">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
              >
                <UserPlus className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Iyandikishe</h2>
              <p className="text-gray-600">Fungura konti nshya</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                {steps.map((s, i) => (
                  <div key={s.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                        step >= s.number
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step > s.number ? <Check className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                      </div>
                      <p className={`text-xs mt-2 font-bold ${step >= s.number ? 'text-blue-600' : 'text-gray-500'}`}>
                        {s.title}
                      </p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 rounded ${step > s.number ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
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
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder=""
                          className="pl-10 h-12"
                        />
                      </div>
                      {validationErrors.email && <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Telefoni</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder=""
                          className="pl-10 h-12"
                        />
                      </div>
                      {validationErrors.phone && <p className="text-red-600 text-xs mt-1">{validationErrors.phone}</p>}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Account Info */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Ijambo Ryibanga</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder=""
                          className="pl-10 pr-10 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                      {validationErrors.password && <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Emeza Ijambo Ryibanga</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder=""
                          className="pl-10 pr-10 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && <p className="text-red-600 text-xs mt-1">{validationErrors.confirmPassword}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Uruhare</label>
                      <div className="grid grid-cols-3 gap-3">
                        {roles.map((role) => (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: role.value })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              formData.role === role.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <role.icon className={`w-8 h-8 mx-auto mb-2 ${formData.role === role.value ? 'text-blue-600' : 'text-gray-400'}`} />
                            <p className={`text-sm font-bold ${formData.role === role.value ? 'text-blue-600' : 'text-gray-600'}`}>
                              {role.label}
                            </p>
                          </button>
                        ))}
                      </div>
                      {validationErrors.role && <p className="text-red-600 text-xs mt-1">{validationErrors.role}</p>}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Additional Info */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-4"
                  >
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">Aderesi</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Kigali, Gasabo, Remera"
                        className="h-12"
                      />
                      {validationErrors.address && <p className="text-red-600 text-xs mt-1">{validationErrors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Indangamuntu (Optional)</label>
                      <Input
                        value={formData.nationalId}
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                        placeholder="1199012345678901"
                        className="h-12"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Role-specific & Terms */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-4"
                  >
                    {formData.role === 'student' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Umwuga</label>
                            <select
                              value={formData.course}
                              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                              className="w-full h-12 border rounded-lg px-3"
                            >
                              <option value="">Hitamo umwuga</option>
                              {courses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {validationErrors.course && <p className="text-red-600 text-xs mt-1">{validationErrors.course}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Urwego</label>
                            <select
                              value={formData.level}
                              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                              className="w-full h-12 border rounded-lg px-3"
                            >
                              <option value="">Hitamo urwego</option>
                              {levels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            {validationErrors.level && <p className="text-red-600 text-xs mt-1">{validationErrors.level}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Izina ry'Umubyeyi</label>
                          <Input
                            value={formData.parentName}
                            onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                            placeholder="Jean MUGABO"
                            className="h-12"
                          />
                          {validationErrors.parentName && <p className="text-red-600 text-xs mt-1">{validationErrors.parentName}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Telefoni y'Umubyeyi</label>
                          <Input
                            value={formData.parentPhone}
                            onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                            placeholder="0788123456"
                            className="h-12"
                          />
                          {validationErrors.parentPhone && <p className="text-red-600 text-xs mt-1">{validationErrors.parentPhone}</p>}
                        </div>
                      </>
                    )}

                    {formData.role === 'parent' && (
                      <>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-4">
                          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            Amakuru y'Umwana Wiga
                          </h3>
                          <p className="text-sm text-gray-600">Injiza amakuru y'umwana wawe wiga muri Garden TVET School</p>
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
                              {courses.map(c => <option key={c} value={c}>{c}</option>)}
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
                              {levels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            {validationErrors.studentLevel && <p className="text-red-600 text-xs mt-1">{validationErrors.studentLevel}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Nimero y'Umwana (Optional)</label>
                          <Input
                            value={formData.studentId}
                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            placeholder="SWD0012026"
                            className="h-12"
                          />
                          <p className="text-xs text-gray-500 mt-1">Niba uzi nimero y'umwana, yinjize hano</p>
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
                      </>
                    )}

                    <div className="p-4 bg-blue-50 rounded-xl">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded mt-1"
                        />
                        <span className="text-sm text-gray-700">
                          Ndemeye <button type="button" className="text-blue-600 font-bold hover:underline">amabwiriza n'amategeko</button> ya Garden TVET School
                        </span>
                      </label>
                      {validationErrors.agreeTerms && <p className="text-red-600 text-xs mt-2">{validationErrors.agreeTerms}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 font-semibold">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700 font-semibold">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Subira
                  </Button>
                )}

                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Komeza
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Gutegereza...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Iyandikishe
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Login Link */}
              <div className="text-center mt-6 pt-6 border-t">
                <p className="text-gray-600">
                  Usanzwe ufite konti?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="font-bold text-blue-600 hover:text-blue-700"
                  >
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

export default RegisterPage;

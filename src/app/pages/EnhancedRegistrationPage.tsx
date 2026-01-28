import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Plus,
  X,
  Building,
  Briefcase,
  Heart
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { apiService } from '@/app/services/apiService';

interface EnhancedRegistrationPageProps {
  onNavigate: (page: string) => void;
}

interface Trade {
  id: number;
  trade_code: string;
  trade_name: string;
  level_number: number;
  level_suffix?: string;
  full_name: string;
  description: string;
  capacity: number;
  class_count: number;
  total_students: number;
}

const EnhancedRegistrationPage: React.FC<EnhancedRegistrationPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { login, getRoleDashboard } = useAuth();

  const [registrationType, setRegistrationType] = useState<'student' | 'parent' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Student registration form
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    gender: '' as 'Male' | 'Female' | '',
    trade_code: '',
    level_number: 0,
    level_suffix: '',
    address: '',
    emergency_contact: '',
    medical_info: '',
    parent_info: {
      first_name: '',
      last_name: '',
      phone: '',
      email: ''
    }
  });

  // Parent registration form
  const [parentForm, setParentForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    occupation: '',
    relationship: '' as 'father' | 'mother' | 'guardian' | '',
    children: [] as Array<{ student_id: string; first_name: string; last_name: string }>
  });

  const [childSearchQuery, setChildSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (registrationType === 'student') {
      fetchTrades();
    }
  }, [registrationType]);

  const fetchTrades = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/registration/trades');
      const data = await response.json();
      if (data.success) {
        setTrades(data.trades);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) return;

    setCheckingEmail(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setEmailAvailable(data.available);
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const searchStudents = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await apiService.request('/dos/students', {
        method: 'GET',
        params: { search: query, limit: 5 }
      });

      if (response.success) {
        setSearchResults(response.data.students);
      }
    } catch (error) {
      console.error('Error searching students:', error);
    }
  };

  const handleStudentRegistration = async () => {
    setLoading(true);
    setError('');

    if (studentForm.password !== studentForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Auto login after successful registration
        setTimeout(() => {
          const dashboard = getRoleDashboard('student');
          onNavigate(dashboard);
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleParentRegistration = async () => {
    setLoading(true);
    setError('');

    if (parentForm.password !== parentForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parentForm)
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess(true);
        // Redirect to parent dashboard
        setTimeout(() => {
          onNavigate('/parent/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTotalSteps = () => {
    return registrationType === 'student' ? 4 : 3;
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return registrationType === 'student'
          ? studentForm.first_name && studentForm.last_name && studentForm.email && studentForm.phone
          : parentForm.first_name && parentForm.last_name && parentForm.email && parentForm.phone;
      case 2:
        return registrationType === 'student'
          ? studentForm.password && studentForm.confirmPassword && studentForm.password === studentForm.confirmPassword
          : parentForm.password && parentForm.confirmPassword && parentForm.password === parentForm.confirmPassword;
      case 3:
        return registrationType === 'student'
          ? studentForm.trade_code && studentForm.level_number
          : true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStudentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student_first_name" className="text-sm text-gray-700">First Name *</Label>
                <Input
                  id="student_first_name"
                  value={studentForm.first_name}
                  onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="student_last_name" className="text-sm text-gray-700">Last Name *</Label>
                <Input
                  id="student_last_name"
                  value={studentForm.last_name}
                  onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="student_email" className="text-sm text-gray-700">Email Address *</Label>
              <div className="relative mt-1">
                <Input
                  id="student_email"
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => {
                    setStudentForm({ ...studentForm, email: e.target.value });
                    checkEmailAvailability(e.target.value);
                  }}
                  className="pr-10"
                  required
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {!checkingEmail && studentForm.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailAvailable === true && <Check className="h-4 w-4 text-green-600" />}
                    {emailAvailable === false && <AlertCircle className="h-4 w-4 text-red-600" />}
                  </div>
                )}
              </div>
              {emailAvailable === false && (
                <p className="text-sm text-red-600 mt-1">This email is already registered</p>
              )}
            </div>

            <div>
              <Label htmlFor="student_phone" className="text-sm text-gray-700">Phone Number *</Label>
              <Input
                id="student_phone"
                value={studentForm.phone}
                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student_dob" className="text-sm text-gray-700">Date of Birth</Label>
                <Input
                  id="student_dob"
                  type="date"
                  value={studentForm.date_of_birth}
                  onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="student_gender" className="text-sm text-gray-700">Gender</Label>
                <Select value={studentForm.gender} onValueChange={(value) => setStudentForm({ ...studentForm, gender: value as 'Male' | 'Female' })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Security</h3>
              <p className="text-gray-600">Create a secure password</p>
            </div>

            <div>
              <Label htmlFor="student_password" className="text-sm text-gray-700">Password *</Label>
              <div className="relative mt-1">
                <Input
                  id="student_password"
                  type={showPassword ? "text" : "password"}
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="student_confirm_password" className="text-sm text-gray-700">Confirm Password *</Label>
              <Input
                id="student_confirm_password"
                type="password"
                value={studentForm.confirmPassword}
                onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                className="mt-1"
                required
              />
              {studentForm.password && studentForm.confirmPassword && studentForm.password !== studentForm.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Academic Program</h3>
              <p className="text-gray-600">Choose your trade and level</p>
            </div>

            <div>
              <Label className="text-sm text-gray-700">Available Programs</Label>
              <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                {trades.map((trade) => (
                  <Card
                    key={trade.id}
                    className={`cursor-pointer transition-all ${
                      studentForm.trade_code === trade.trade_code && studentForm.level_number === trade.level_number
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setStudentForm({
                      ...studentForm,
                      trade_code: trade.trade_code,
                      level_number: trade.level_number,
                      level_suffix: trade.level_suffix || ''
                    })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">{trade.full_name}</h4>
                          <p className="text-sm text-gray-600">{trade.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline">{trade.class_count} classes</Badge>
                            <Badge variant="outline">{trade.total_students} students</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h3>
              <p className="text-gray-600">Help us provide better support</p>
            </div>

            <div>
              <Label htmlFor="student_address" className="text-sm text-gray-700">Address</Label>
              <Textarea
                id="student_address"
                value={studentForm.address}
                onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                className="mt-1"
                placeholder="Enter your full address"
              />
            </div>

            <div>
              <Label htmlFor="student_emergency" className="text-sm text-gray-700">Emergency Contact</Label>
              <Input
                id="student_emergency"
                value={studentForm.emergency_contact}
                onChange={(e) => setStudentForm({ ...studentForm, emergency_contact: e.target.value })}
                className="mt-1"
                placeholder="Emergency contact name and phone"
              />
            </div>

            <div>
              <Label htmlFor="student_medical" className="text-sm text-gray-700">Medical Information</Label>
              <Textarea
                id="student_medical"
                value={studentForm.medical_info}
                onChange={(e) => setStudentForm({ ...studentForm, medical_info: e.target.value })}
                className="mt-1"
                placeholder="Any medical conditions or allergies"
              />
            </div>

            <div className="border-t pt-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Parent/Guardian Information (Optional)
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parent_first_name" className="text-sm text-gray-700">First Name</Label>
                  <Input
                    id="parent_first_name"
                    value={studentForm.parent_info.first_name}
                    onChange={(e) => setStudentForm({
                      ...studentForm,
                      parent_info: { ...studentForm.parent_info, first_name: e.target.value }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="parent_last_name" className="text-sm text-gray-700">Last Name</Label>
                  <Input
                    id="parent_last_name"
                    value={studentForm.parent_info.last_name}
                    onChange={(e) => setStudentForm({
                      ...studentForm,
                      parent_info: { ...studentForm.parent_info, last_name: e.target.value }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="parent_phone" className="text-sm text-gray-700">Phone</Label>
                  <Input
                    id="parent_phone"
                    value={studentForm.parent_info.phone}
                    onChange={(e) => setStudentForm({
                      ...studentForm,
                      parent_info: { ...studentForm.parent_info, phone: e.target.value }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="parent_email" className="text-sm text-gray-700">Email</Label>
                  <Input
                    id="parent_email"
                    type="email"
                    value={studentForm.parent_info.email}
                    onChange={(e) => setStudentForm({
                      ...studentForm,
                      parent_info: { ...studentForm.parent_info, email: e.target.value }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderParentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parent_first_name" className="text-sm text-gray-700">First Name *</Label>
                <Input
                  id="parent_first_name"
                  value={parentForm.first_name}
                  onChange={(e) => setParentForm({ ...parentForm, first_name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="parent_last_name" className="text-sm text-gray-700">Last Name *</Label>
                <Input
                  id="parent_last_name"
                  value={parentForm.last_name}
                  onChange={(e) => setParentForm({ ...parentForm, last_name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="parent_email" className="text-sm text-gray-700">Email Address *</Label>
              <div className="relative mt-1">
                <Input
                  id="parent_email"
                  type="email"
                  value={parentForm.email}
                  onChange={(e) => {
                    setParentForm({ ...parentForm, email: e.target.value });
                    checkEmailAvailability(e.target.value);
                  }}
                  className="pr-10"
                  required
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {!checkingEmail && parentForm.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailAvailable === true && <Check className="h-4 w-4 text-green-600" />}
                    {emailAvailable === false && <AlertCircle className="h-4 w-4 text-red-600" />}
                  </div>
                )}
              </div>
              {emailAvailable === false && (
                <p className="text-sm text-red-600 mt-1">This email is already registered</p>
              )}
            </div>

            <div>
              <Label htmlFor="parent_phone" className="text-sm text-gray-700">Phone Number *</Label>
              <Input
                id="parent_phone"
                value={parentForm.phone}
                onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="parent_relationship" className="text-sm text-gray-700">Relationship to Child</Label>
              <Select value={parentForm.relationship} onValueChange={(value) => setParentForm({ ...parentForm, relationship: value as 'father' | 'mother' | 'guardian' })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="parent_occupation" className="text-sm text-gray-700">Occupation</Label>
              <Input
                id="parent_occupation"
                value={parentForm.occupation}
                onChange={(e) => setParentForm({ ...parentForm, occupation: e.target.value })}
                className="mt-1"
                placeholder="Your profession"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Security</h3>
              <p className="text-gray-600">Create a secure password</p>
            </div>

            <div>
              <Label htmlFor="parent_password" className="text-sm text-gray-700">Password *</Label>
              <div className="relative mt-1">
                <Input
                  id="parent_password"
                  type={showPassword ? "text" : "password"}
                  value={parentForm.password}
                  onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="parent_confirm_password" className="text-sm text-gray-700">Confirm Password *</Label>
              <Input
                id="parent_confirm_password"
                type="password"
                value={parentForm.confirmPassword}
                onChange={(e) => setParentForm({ ...parentForm, confirmPassword: e.target.value })}
                className="mt-1"
                required
              />
              {parentForm.password && parentForm.confirmPassword && parentForm.password !== parentForm.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Children Information</h3>
              <p className="text-gray-600">Link your children to your account</p>
            </div>

            <div>
              <Label className="text-sm text-gray-700">Search and Add Children</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={childSearchQuery}
                  onChange={(e) => {
                    setChildSearchQuery(e.target.value);
                    searchStudents(e.target.value);
                  }}
                  className="pl-9"
                  placeholder="Search by student name or ID"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto border rounded-lg">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        if (!parentForm.children.find(c => c.student_id === student.student_id)) {
                          setParentForm({
                            ...parentForm,
                            children: [...parentForm.children, {
                              student_id: student.student_id,
                              first_name: student.first_name,
                              last_name: student.last_name
                            }]
                          });
                        }
                        setChildSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                        </div>
                        <Plus className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {parentForm.children.length > 0 && (
              <div>
                <Label className="text-sm text-gray-700">Added Children</Label>
                <div className="mt-3 space-y-2">
                  {parentForm.children.map((child, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">{child.first_name} {child.last_name}</p>
                        <p className="text-sm text-gray-600">ID: {child.student_id}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setParentForm({
                            ...parentForm,
                            children: parentForm.children.filter((_, i) => i !== index)
                          });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="parent_address" className="text-sm text-gray-700">Address</Label>
              <Textarea
                id="parent_address"
                value={parentForm.address}
                onChange={(e) => setParentForm({ ...parentForm, address: e.target.value })}
                className="mt-1"
                placeholder="Enter your full address"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4 bg-gradient-to-br from-green-50 via-white to-green-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-green-200">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full mb-6"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Welcome to our school management system. You will be redirected to your dashboard shortly.
            </p>
            <div className="animate-pulse bg-gray-200 h-2 rounded-full"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!registrationType) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-full mb-6 shadow-lg"
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Join Our School Community
            </h1>
            <p className="text-xl text-gray-600">Choose your registration type to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all"
                onClick={() => setRegistrationType('student')}
              >
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-white mx-auto" />
                  </div>
                  <CardTitle className="text-2xl">Student Registration</CardTitle>
                  <CardDescription className="text-lg">
                    Join as a student and start your educational journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Access to course materials
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Track your academic progress
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Connect with teachers and peers
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Receive important notifications
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all"
                onClick={() => setRegistrationType('parent')}
              >
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white mx-auto" />
                  </div>
                  <CardTitle className="text-2xl">Parent Registration</CardTitle>
                  <CardDescription className="text-lg">
                    Stay connected with your child's education
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Monitor your child's progress
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Receive academic reports
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Communicate with teachers
                    </li>
                    <li className="flex items-center">
                      <

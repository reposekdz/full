import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, AlertCircle, FileText, User, Phone, Mail, MapPin, Users, GraduationCap, BookOpen, Upload, Calendar, Clock, Star, Award, Target, Shield, Search, ChevronDown, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '@/app/config/apiBase';
import RwandaLocationTextInput from './RwandaLocationTextInput';

interface ApplicationFormProps {
  onClose?: () => void;
}

interface ValidationRule {
  field_name: string;
  rule_type: string;
  rule_value: string;
  error_message_en: string;
  error_message_rw: string;
}

export const StudentApplicationForm: React.FC<ApplicationFormProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [validationRules, setValidationRules] = useState<{[key: string]: ValidationRule[]}>({});
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [reportCard, setReportCard] = useState<File | null>(null);
  const [reportCardPreview, setReportCardPreview] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    national_id: '',
    address: '',
    
    // Text-based location fields (NEW - for writing instead of selecting)
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    
    // Parent/Guardian Information
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    parent_occupation: '',
    parent_address: '',
    emergency_contact: '',
    emergency_phone: '',
    
    // Academic Information
    previous_school: '',
    education_level: '',
    completion_year: '',
    previous_grades: '',
    trade_code: '',
    level_number: '',
    preferred_start_date: '',
    
    // Additional Information
    reason_for_applying: '',
    career_goals: '',
    special_needs: '',
    medical_conditions: '',
    languages_spoken: '',
    computer_skills: '',
    work_experience: '',
    
    // Financial Information
    fee_payment_method: '',
    sponsor_name: '',
    sponsor_phone: '',
    financial_support: ''
  });

  useEffect(() => {
    fetchTrades();
    fetchLevels();
    fetchValidationRules();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student-applications-production/trades`);
      const data = await response.json();
      if (data.success) setTrades(data.data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trade-levels`);
      const data = await response.json();
      if (data.success) setLevels(data.levels);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const fetchValidationRules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/validation-rules`);
      const data = await response.json();
      if (data.success) {
        setValidationRules(data.rules);
      }
    } catch (error) {
      console.error('Error fetching validation rules:', error);
    }
  };

  const validateField = (name: string, value: string) => {
    const rules = validationRules[name] || [];
    
    for (const rule of rules) {
      switch (rule.rule_type) {
        case 'required':
          if (!value || value.trim() === '') {
            return rule.error_message_rw;
          }
          break;
        case 'min_length':
          if (value.length < parseInt(rule.rule_value)) {
            return rule.error_message_rw;
          }
          break;
        case 'max_length':
          if (value.length > parseInt(rule.rule_value)) {
            return rule.error_message_rw;
          }
          break;
        case 'pattern':
          const regex = new RegExp(rule.rule_value);
          if (!regex.test(value)) {
            return rule.error_message_rw;
          }
          break;
      }
    }
    
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }
    
    if (name === 'trade_code') {
      setSelectedTrade(value);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments([...documents, ...Array.from(e.target.files)]);
    }
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReportCard(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportCardPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const validateStep = (stepNumber: number) => {
    const errors: {[key: string]: string} = {};
    
    switch (stepNumber) {
      case 1:
        const step1Fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 'province', 'district', 'sector'];
        step1Fields.forEach(field => {
          const error = validateField(field, formData[field as keyof typeof formData]);
          if (error) errors[field] = error;
        });
        
        // Check if location fields are filled
        if (!formData.province) errors['province'] = 'Intara irakenewe';
        if (!formData.district) errors['district'] = 'Akarere rakeneye';
        if (!formData.sector) errors['sector'] = 'Umurenge urakenewe';
        
        // Age validation
        if (formData.date_of_birth) {
          const age = new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear();
          if (age < 14 || age > 35) {
            errors.date_of_birth = 'Imyaka igomba kuba hagati ya 14 na 35';
          }
        }
        break;
        
      case 2:
        const step2Fields = ['parent_name', 'parent_phone', 'previous_school', 'education_level'];
        step2Fields.forEach(field => {
          const error = validateField(field, formData[field as keyof typeof formData]);
          if (error) errors[field] = error;
        });
        break;
        
      case 3:
        const step3Fields = ['trade_code', 'level_number', 'reason_for_applying'];
        step3Fields.forEach(field => {
          const error = validateField(field, formData[field as keyof typeof formData]);
          if (error) errors[field] = error;
        });
        
        if (formData.reason_for_applying.length < 50) {
          errors.reason_for_applying = 'Impamvu zigomba kuba byibuze inyuguti 50';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsValidating(true);

    try {
      // Final validation
      if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
        setLoading(false);
        setIsValidating(false);
        return;
      }
      
      const formDataToSend = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      
      // Add profile photo
      if (profilePhoto) {
        formDataToSend.append('profile_photo', profilePhoto);
      }
      
      // Add report card
      if (reportCard) {
        formDataToSend.append('report_card', reportCard);
      }
      
      // Add documents
      documents.forEach((doc) => {
        formDataToSend.append('documents', doc);
      });
      
      formDataToSend.append('application_date', new Date().toISOString().split('T')[0]);
      formDataToSend.append('status', 'pending');

      const response = await fetch(`${API_BASE_URL}/student-applications-production/submit`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setApplicationNumber(data.data.application_number);
        setSubmitted(true);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          alert('Habaye amakosa:\n' + data.errors.join('\n'));
        } else {
          alert(data.message || 'Habaye ikosa. Ongera ugerageze.');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Habaye ikosa. Ongera ugerageze.');
    } finally {
      setLoading(false);
      setIsValidating(false);
    }
  };

  const getAvailableLevels = () => {
    if (!selectedTrade) return [];
    return levels.filter(level => 
      trades.find(trade => trade.trade_code === selectedTrade)?.available_levels?.includes(level.level_number)
    );
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-2xl text-center"
      >
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-green-600 mb-4">Byakunze!</h2>
        <p className="text-xl mb-4">Ibyifuzo byawe byakiriwe neza</p>
        <div className="bg-green-50 p-6 rounded-xl mb-6">
          <p className="text-sm text-gray-600 mb-2">Nomero y'ibyifuzo byawe:</p>
          <p className="text-3xl font-bold text-green-600">{applicationNumber}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-blue-800 mb-2">Ibikurikira:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ibyifuzo byawe bizasuzumwa na DOS</li>
            <li>• Umuyobozi mukuru azabisuzuma</li>
            <li>• Uzahamagariwa mu gihe cya wiki 2</li>
            <li>• Andika iyi nomero neza: <strong>{applicationNumber}</strong></li>
            <li>• Koresha iyi nomero kureba uko bigenda</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
          <h4 className="font-bold text-green-800 mb-2">Kureba Uko Ibyifuzo Bigenda</h4>
          <p className="text-sm text-green-700 mb-3">
            Koresha nomero yawe yo gukurikirana: <span className="font-mono font-bold">{applicationNumber}</span>
          </p>
          <button
            onClick={() => window.open(`/check-status?code=${applicationNumber}`, '_blank')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            Reba Uko Bigenda
          </button>
        </div>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Soza
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-2xl"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Saba Kwiga muri Garden TVET</h2>
        <p className="text-gray-600">Uzuza amakuru yose akurikira neza</p>
        
        {/* Enhanced Progress Steps */}
        <div className="flex items-center justify-center mt-6 space-x-2">
          {[
            { num: 1, title: 'Amakuru yawe', icon: User },
            { num: 2, title: 'Ababyeyi & Amasomo', icon: Users },
            { num: 3, title: 'Umwuga & Urwego', icon: GraduationCap },
            { num: 4, title: 'Inyandiko & Soza', icon: FileText }
          ].map((s, index) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="flex items-center">
                <div className={`flex flex-col items-center ${
                  step >= s.num ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${
                    step >= s.num 
                      ? 'bg-green-600 text-white border-green-600' 
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 font-medium">{s.title}</span>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > s.num ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <User className="w-6 h-6 text-blue-600" /> Amakuru yawe bwite
                </h3>
                
                {/* Profile Photo Upload */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-blue-500 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {profilePhotoPreview ? (
                        <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg">
                      <Upload className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleProfilePhotoUpload}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mb-6">Shyiraho ifoto yawe * (JPG, PNG - Max 2MB)</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Izina rya mbere *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Izina rya mbere"
                    />
                    {validationErrors.first_name && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Izina rya kabiri *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Izina rya kabiri"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Itariki y'amavuko *</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Igitsina *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Hitamo igitsina</option>
                      <option value="male">Gabo</option>
                      <option value="female">Gore</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefoni *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+250 7XX XXX XXX"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomero y'indangamuntu</label>
                    <input
                      type="text"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1XXXXXXXXXXXXXXX"
                    />
                  </div>

                </div>

                {/* Text-based Location Input - NEW! */}
                <div className="mt-6">
                  <RwandaLocationTextInput
                    onLocationChange={(location) => setFormData({...formData, ...location})}
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
                    <p className="text-red-500 text-sm mt-2">* Amakuru y'aho utuye ni ngombwa</p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aderesi yuzuye / Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Aderesi yuzuye (igihugu, agace k'umudugudu...)"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Parent & Education Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-green-600" /> Amakuru y'ababyeyi
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amazina y'umubyeyi *</label>
                    <input
                      type="text"
                      name="parent_name"
                      value={formData.parent_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Amazina yombi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefoni y'umubyeyi *</label>
                    <input
                      type="tel"
                      name="parent_phone"
                      value={formData.parent_phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+250 7XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email y'umubyeyi</label>
                    <input
                      type="email"
                      name="parent_email"
                      value={formData.parent_email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Akazi k'umubyeyi</label>
                    <input
                      type="text"
                      name="parent_occupation"
                      value={formData.parent_occupation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Akazi"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <GraduationCap className="w-6 h-6 text-purple-600" /> Amakuru y'amasomo
                </h3>

                {/* Report Card Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shyiraho ifoto y'impamyabumenyi (Report Card) *</label>
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-4 hover:border-purple-500 transition">
                    {reportCardPreview ? (
                      <div className="relative">
                        <img src={reportCardPreview} alt="Report Card" className="w-full h-64 object-contain rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setReportCard(null);
                            setReportCardPreview('');
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                        <Upload className="w-12 h-12 text-purple-500 mb-2" />
                        <span className="text-sm font-medium text-gray-700">Kanda hano ushyireho ifoto y'impamyabumenyi</span>
                        <span className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleReportCardUpload}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ishuri ryaheruka *</label>
                    <input
                      type="text"
                      name="previous_school"
                      value={formData.previous_school}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Izina ry'ishuri"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urwego rw'amashuri *</label>
                    <select
                      name="education_level"
                      value={formData.education_level}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Hitamo urwego</option>
                      <option value="senior_3_completed">Narangije Senior 3</option>
                      <option value="senior_6_completed">Narangije Senior 6</option>
                      <option value="changing_school">Ndahindura ishuri</option>
                      <option value="other">Ikindi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Umwaka warangije</label>
                    <input
                      type="number"
                      name="completion_year"
                      value={formData.completion_year}
                      onChange={handleChange}
                      min="2015"
                      max="2025"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Indimi uvuga</label>
                    <input
                      type="text"
                      name="languages_spoken"
                      value={formData.languages_spoken}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ikinyarwanda, Icyongereza, Igifaransa..."
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Trade & Level Selection */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <BookOpen className="w-6 h-6 text-yellow-600" /> Umwuga n'urwego ushaka kwiga
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hitamo umwuga *</label>
                    <select
                      name="trade_code"
                      value={formData.trade_code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="">Hitamo umwuga</option>
                      {trades.map((trade) => (
                        <option key={trade.code} value={trade.code}>
                          {trade.name} ({trade.code})
                        </option>
                      ))}
                    </select>
                    {selectedTrade && (
                      <div className="mt-2 p-3 bg-yellow-100 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          {trades.find(t => t.code === selectedTrade)?.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hitamo urwego *</label>
                    <select
                      name="level_number"
                      value={formData.level_number}
                      onChange={handleChange}
                      required
                      disabled={!selectedTrade}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Hitamo urwego</option>
                      {getAvailableLevels().map((level) => (
                        <option key={level.level_number} value={level.level_number}>
                          Level {level.level_number} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Itariki ushaka gutangira *</label>
                  <input
                    type="date"
                    name="preferred_start_date"
                    value={formData.preferred_start_date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Impamvu yo gusaba kwiga muri Garden TVET *</label>
                  <textarea
                    name="reason_for_applying"
                    value={formData.reason_for_applying}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Andika impamvu zituma ushaka kwiga muri Garden TVET..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intego zawe z'umwuga</label>
                  <textarea
                    name="career_goals"
                    value={formData.career_goals}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Andika intego zawe z'umwuga..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Documents & Final */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <FileText className="w-6 h-6 text-indigo-600" /> Inyandiko n'amakuru y'inyongera
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inyandiko (Impamyabumenyi, CV, ...)</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB each)</p>
                  </div>

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Inyandiko zashyizweho:</p>
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ibindi byihutirwa</label>
                      <textarea
                        name="special_needs"
                        value={formData.special_needs}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Andika ibindi byihutirwa..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Uburwayi bwihariye</label>
                      <textarea
                        name="medical_conditions"
                        value={formData.medical_conditions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Andika uburwayi bwihariye..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Uburyo bwo kwishyura amafaranga</label>
                    <select
                      name="fee_payment_method"
                      value={formData.fee_payment_method}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Hitamo uburyo</option>
                      <option value="self">Nzishyura ubwanjye</option>
                      <option value="parent">Ababyeyi bazanshyura</option>
                      <option value="sponsor">Nfite uwanshyura</option>
                      <option value="scholarship">Nsaba buruse</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">Icyemezo</h4>
                <label className="flex items-start space-x-3">
                  <input type="checkbox" required className="mt-1" />
                  <span className="text-sm text-green-700">
                    Ndemeye ko amakuru yose natanze ari ukuri kandi ndemeye amategeko ya Garden TVET School.
                    Ndemeye ko ibyifuzo byanjye bizasuzumwa kandi nzahamagariwa mu gihe cyagenwe.
                  </span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
            >
              ← Subira Inyuma
            </button>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep(step)) {
                  setStep(step + 1);
                } else {
                  // Scroll to first error
                  const firstError = Object.keys(validationErrors)[0];
                  if (firstError) {
                    const element = document.querySelector(`[name="${firstError}"]`);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              }}
              className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              Komeza →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isValidating ? 'Gusuzuma...' : 'Tegereza...'}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Ohereza Ibyifuzo
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default StudentApplicationForm;

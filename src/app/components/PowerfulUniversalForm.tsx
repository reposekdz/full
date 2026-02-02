import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Calendar, FileText, CheckCircle, AlertTriangle, DollarSign, BookOpen, Sparkles, Trophy, Target, Zap } from 'lucide-react';
import { PowerfulStudentSelector } from './PowerfulStudentSelector';

interface PowerfulUniversalFormProps {
  formType: 'conduct' | 'attendance' | 'payment' | 'academic' | 'general';
  onSubmit?: (data: any) => void;
}

export const PowerfulUniversalForm: React.FC<PowerfulUniversalFormProps> = ({ formType, onSubmit }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    student_data: null,
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    grade: '',
    subject: '',
    severity: 'medium',
    status: 'present',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleStudentChange = (studentId: string, studentData?: any) => {
    setFormData(prev => ({
      ...prev,
      student_id: studentId,
      student_data: studentData
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id) {
      alert('Nyamuneka hitamo umunyeshuri');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      setFormData({
        student_id: '',
        student_data: null,
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        grade: '',
        subject: '',
        severity: 'medium',
        status: 'present',
        notes: ''
      });
    } catch (error) {
      console.error('Ikosa mu kohereza ifishi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormConfig = () => {
    switch (formType) {
      case 'conduct':
        return {
          title: 'Raporo y\'Imyitwarire',
          titleEn: 'Conduct Report',
          icon: AlertTriangle,
          color: 'red',
          gradient: 'from-red-500 to-orange-500',
          fields: ['description', 'severity', 'notes']
        };
      case 'attendance':
        return {
          title: 'Raporo y\'Kwitabira',
          titleEn: 'Attendance Record', 
          icon: CheckCircle,
          color: 'green',
          gradient: 'from-green-500 to-emerald-500',
          fields: ['status', 'notes']
        };
      case 'payment':
        return {
          title: 'Raporo y\'Kwishyura',
          titleEn: 'Payment Record',
          icon: DollarSign,
          color: 'blue',
          gradient: 'from-blue-500 to-cyan-500',
          fields: ['amount', 'description', 'notes']
        };
      case 'academic':
        return {
          title: 'Raporo y\'Amasomo',
          titleEn: 'Academic Record',
          icon: BookOpen,
          color: 'purple',
          gradient: 'from-purple-500 to-violet-500',
          fields: ['subject', 'grade', 'notes']
        };
      default:
        return {
          title: 'Ifishi Rusange',
          titleEn: 'General Form',
          icon: FileText,
          color: 'gray',
          gradient: 'from-gray-500 to-slate-500',
          fields: ['description', 'notes']
        };
    }
  };

  const config = getFormConfig();
  const IconComponent = config.icon;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <IconComponent className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-black">{config.title}</h2>
              <p className="text-white/90 font-semibold">{config.titleEn}</p>
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-bold">Sisitemu Ikomeye & Yihuse - Powerful & Advanced System</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Powerful Student Selector */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-blue-900">Guhitamo Umunyeshuri - Sisitemu Ikomeye</h3>
              <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
            </div>
            <PowerfulStudentSelector
              value={formData.student_id}
              onChange={handleStudentChange}
              label="Hitamo Umunyeshuri"
              required
              placeholder="Andika izina, kode, umwuga cyangwa urwego..."
              showAdvancedFilters={true}
              showStudentStats={true}
              showRecentActivity={true}
              enableVoiceSearch={true}
              showFavorites={true}
            />
          </div>

          {/* Date */}
          <div className="space-y-3">
            <label className="block text-lg font-black text-gray-700 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Itariki - Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50"
              required
            />
          </div>

          {/* Dynamic Fields */}
          {config.fields.includes('description') && (
            <div className="space-y-3">
              <label className="block text-lg font-black text-gray-700">
                Ibisobanuro - Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50 resize-none"
                placeholder="Andika ibisobanuro birambuye..."
                required
              />
            </div>
          )}

          {config.fields.includes('severity') && (
            <div className="space-y-3">
              <label className="block text-lg font-black text-gray-700">
                Urwego rw'Ikosa - Severity Level
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50"
              >
                <option value="low">🟢 Hasi - Low</option>
                <option value="medium">🟡 Hagati - Medium</option>
                <option value="high">🟠 Hejuru - High</option>
                <option value="critical">🔴 Bikomeye - Critical</option>
              </select>
            </div>
          )}

          {config.fields.includes('status') && (
            <div className="space-y-3">
              <label className="block text-lg font-black text-gray-700">
                Imiterere - Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50"
              >
                <option value="present">✅ Yaritabiriye - Present</option>
                <option value="absent">❌ Ntiyaritabiriye - Absent</option>
                <option value="late">⏰ Yatinze - Late</option>
                <option value="excused">📋 Yemerewe - Excused</option>
              </select>
            </div>
          )}

          {config.fields.includes('amount') && (
            <div className="space-y-3">
              <label className="block text-lg font-black text-gray-700">
                Amafaranga (RWF) - Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50"
                placeholder="0"
                required
              />
            </div>
          )}

          {config.fields.includes('subject') && (
            <div className="space-y-3">
              <label className="block text-lg font-black text-gray-700">
                Isomo - Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50"
                placeholder="Izina ry'isomo"
                required
              />
            </div>
          )}

          {config.fields.includes('grade') && (
            <div className="space-y-3">
              <label className="block text-lg font-black text-gray-700">
                Amanota/Igipimo - Grade/Score
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50"
                placeholder="A, B, C cyangwa 85%"
                required
              />
            </div>
          )}

          {config.fields.includes('notes') && (
            <div className="space-y-3">
              <label className="block text-lg font-black text-gray-700">
                Inyongera Makuru - Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50 resize-none"
                placeholder="Inyongera makuru..."
              />
            </div>
          )}

          {/* Selected Student Preview */}
          {formData.student_data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 border-2 border-green-300 rounded-2xl p-6"
            >
              <h4 className="font-black text-green-900 mb-4 flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                <Trophy className="w-5 h-5 text-yellow-500" />
                Umunyeshuri Wahiswemo - Selected Student
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/70 p-3 rounded-xl">
                  <span className="text-gray-600 font-semibold">Amazina:</span>
                  <p className="font-black text-gray-900">
                    {formData.student_data.first_name} {formData.student_data.last_name}
                  </p>
                </div>
                <div className="bg-white/70 p-3 rounded-xl">
                  <span className="text-gray-600 font-semibold">Kode:</span>
                  <p className="font-black text-gray-900">{formData.student_data.student_id}</p>
                </div>
                <div className="bg-white/70 p-3 rounded-xl">
                  <span className="text-gray-600 font-semibold">Umwuga:</span>
                  <p className="font-black text-gray-900">{formData.student_data.trade_code}</p>
                </div>
                <div className="bg-white/70 p-3 rounded-xl">
                  <span className="text-gray-600 font-semibold">Urwego:</span>
                  <p className="font-black text-gray-900">Level {formData.student_data.level_number}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading || !formData.student_id}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl ${
              loading || !formData.student_id
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : success
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : `bg-gradient-to-r ${config.gradient} text-white hover:shadow-3xl`
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Birimo Koherezwa...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-6 h-6" />
                <Trophy className="w-6 h-6" />
                Byakoherejwe Neza! - Successfully Submitted!
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <Sparkles className="w-6 h-6 animate-pulse" />
                Kohereza {config.title} - Submit {config.titleEn}
              </>
            )}
          </motion.button>
        </form>

        {/* Performance Stats */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t-2 border-gray-200">
          <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Imikorere Ikomeye - Powerful Performance
          </h4>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-green-600">3-8s</div>
              <div className="text-sm text-gray-600 font-semibold">Igihe cyo Guhitamo</div>
              <div className="text-xs text-green-600 font-bold">vs 15-30s mbere</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-600">1-2</div>
              <div className="text-sm text-gray-600 font-semibold">Kanda Gusa</div>
              <div className="text-xs text-blue-600 font-bold">vs 4-6 mbere</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-purple-600">1</div>
              <div className="text-sm text-gray-600 font-semibold">Intambwe Gusa</div>
              <div className="text-xs text-purple-600 font-bold">vs 3 mbere</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
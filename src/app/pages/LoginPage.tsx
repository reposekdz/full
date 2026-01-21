import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { Lock, Mail, X, Shield, ChevronRight, Zap } from 'lucide-react';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

const UNIFIED_EMAIL = 'reponse@gmail.com';
const UNIFIED_PASSWORD = '2026';

const ROLES: { value: UserRole; label: string; icon: string; color: string; description: string }[] = [
  { value: 'director_study', label: 'Director of Study', icon: '📚', color: 'from-blue-500 to-blue-600', description: 'Manage academic programs' },
  { value: 'director_discipline', label: 'Director of Discipline', icon: '⚖️', color: 'from-purple-500 to-purple-600', description: 'Manage student conduct' },
  { value: 'headmaster', label: 'Head Master', icon: '👔', color: 'from-indigo-500 to-indigo-600', description: 'Overall school management' },
  { value: 'teacher', label: 'Teacher', icon: '🎓', color: 'from-green-500 to-green-600', description: 'Manage classes & grades' },
  { value: 'accountant', label: 'Accountant', icon: '💰', color: 'from-yellow-500 to-yellow-600', description: 'Financial management' },
  { value: 'stock_manager', label: 'Stock Manager', icon: '📦', color: 'from-orange-500 to-orange-600', description: 'Inventory management' },
  { value: 'admin', label: 'Administrator', icon: '🔐', color: 'from-red-500 to-red-600', description: 'System administration' },
];

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { login, loginWithRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffCode, setStaffCode] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success && result.dashboardPage) {
      onNavigate(result.dashboardPage);
    } else {
      setError('Invalid email or password');
    }
  };

  const handleStaffCodeSubmit = () => {
    if (staffCode === 'g@2026') {
      setShowStaffModal(false);
      setShowRoleSelection(true);
      setStaffCode('');
    } else {
      setError('Invalid staff code');
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setIsLoading(true);
    const result = await login(UNIFIED_EMAIL, UNIFIED_PASSWORD);
    setIsLoading(false);
    if (result.success && result.dashboardPage) {
      setShowRoleSelection(false);
      onNavigate(result.dashboardPage);
    } else {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-yellow-200">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="inline-block bg-gradient-to-r from-yellow-500 to-green-500 p-3 rounded-full mb-3 shadow-lg"
            >
              <Lock className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              {t('login')}
            </h1>
            <p className="text-gray-600 text-sm mt-1">Student & Parent Portal</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border-2 border-red-300 text-red-700 rounded-lg text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm text-gray-700">{t('email')}</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-gray-700">{t('password')}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : t('signIn')}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-yellow-200">
            <Button
              onClick={() => setShowStaffModal(true)}
              variant="outline"
              className="w-full h-10 border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50 font-bold"
            >
              <Shield className="w-4 h-4 mr-2" />
              MS - Staff Login
            </Button>
          </div>

          <div className="mt-3 text-center">
            <button
              onClick={() => onNavigate('register')}
              className="text-sm text-yellow-700 hover:text-green-600 hover:underline font-medium"
            >
              Don't have an account? {t('register')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Staff Code Modal */}
      <Dialog open={showStaffModal} onOpenChange={setShowStaffModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-gray-800">Enter Staff Code</h2>
            <button
              onClick={() => setShowStaffModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="staffCode">Staff Code</Label>
              <Input
                id="staffCode"
                type="password"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                placeholder="g@2026"
                className="mt-1 border-yellow-200 focus:border-yellow-500"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setShowStaffModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStaffCodeSubmit}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Selection Modal */}
      <Dialog open={showRoleSelection} onOpenChange={setShowRoleSelection}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-800">Select Your Role</h2>
            <button
              onClick={() => setShowRoleSelection(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES.map((role) => (
              <motion.button
                key={role.value}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRoleSelect(role.value)}
                disabled={isLoading}
                className={`p-4 rounded-xl border-2 transition-all text-left group ${
                  selectedRole === role.value
                    ? `bg-gradient-to-r ${role.color} border-transparent text-white`
                    : 'bg-white border-gray-200 hover:border-yellow-400 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{role.icon}</span>
                  <ChevronRight className={`w-5 h-5 transition-all ${selectedRole === role.value ? 'text-white' : 'text-gray-400 group-hover:text-yellow-500'}`} />
                </div>
                <h3 className={`font-bold text-sm mb-1 ${selectedRole === role.value ? 'text-white' : 'text-gray-800'}`}>
                  {role.label}
                </h3>
                <p className={`text-xs ${selectedRole === role.value ? 'text-white/80' : 'text-gray-600'}`}>
                  {role.description}
                </p>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-start space-x-3">
            <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">Unified Credentials</p>
              <p className="text-xs text-gray-600 mt-1">Email: <span className="font-mono font-bold">{UNIFIED_EMAIL}</span></p>
              <p className="text-xs text-gray-600">Password: <span className="font-mono font-bold">{UNIFIED_PASSWORD}</span></p>
            </div>
          </div>

          <div className="flex space-x-2 mt-6">
            <Button
              onClick={() => setShowRoleSelection(false)}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedRole && handleRoleSelect(selectedRole)}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white"
              disabled={!selectedRole || isLoading}
            >
              {isLoading ? 'Signing in...' : 'Continue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MS Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowStaffModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-yellow-500 to-green-500 text-white rounded-full shadow-2xl flex items-center justify-center font-black text-xl hover:shadow-3xl z-50"
      >
        MS
      </motion.button>
    </div>
  );
};

export default LoginPage;

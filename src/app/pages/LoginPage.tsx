import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { Lock, Mail, X, Shield } from 'lucide-react';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffCode, setStaffCode] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const dashboard = await login(email, password);
    onNavigate(dashboard);
  };

  const handleStaffCodeSubmit = () => {
    if (staffCode === 'g@2026') {
      setShowStaffModal(false);
      setShowRoleSelection(true);
      setStaffCode('');
    } else {
      alert('Invalid staff code');
    }
  };

  const handleRoleLogin = async () => {
    if (selectedRole) {
      const dashboard = await login(email, password, selectedRole as UserRole);
      setShowRoleSelection(false);
      onNavigate(dashboard);
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
              className="w-full h-10 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold shadow-lg"
            >
              {t('signIn')}
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
        <DialogContent className="sm:max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black">{t('enterStaffCode')}</h2>
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
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setShowStaffModal(false)}
                variant="outline"
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleStaffCodeSubmit}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white"
              >
                {t('submit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Selection Modal */}
      <Dialog open={showRoleSelection} onOpenChange={setShowRoleSelection}>
        <DialogContent className="sm:max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black">Select Your Role</h2>
            <button
              onClick={() => setShowRoleSelection(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="director_of_study">Director of Study</SelectItem>
                  <SelectItem value="director_of_discipline">Director of Discipline</SelectItem>
                  <SelectItem value="head_master">Head Master</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="stock_manager">Stock Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setShowRoleSelection(false)}
                variant="outline"
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleRoleLogin}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white"
                disabled={!selectedRole}
              >
                {t('signIn')}
              </Button>
            </div>
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

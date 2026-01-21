import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Edit2, Save, X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/app/contexts/AuthContext';

interface ProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ open, onOpenChange }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setMessage({ type: 'error', text: 'First name is required' });
      return false;
    }
    if (!formData.last_name.trim()) {
      setMessage({ type: 'error', text: 'Last name is required' });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return false;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const updateData: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    const success = await updateProfile(updateData);
    setIsLoading(false);

    if (success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        onOpenChange(false);
        setMessage(null);
      }, 2000);
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  const FieldEditor = ({ label, name, type = 'text', icon: Icon }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
        <Input
          type={type === 'password' && !showPassword ? 'password' : 'text'}
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          onFocus={() => setEditingField(name)}
          onBlur={() => setEditingField(null)}
          className={`pl-9 h-11 border-2 transition-all ${
            editingField === name
              ? 'border-yellow-500 ring-2 ring-yellow-200 bg-yellow-50'
              : 'border-gray-200 hover:border-yellow-300'
          }`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200">
        <DialogHeader className="bg-gradient-to-r from-yellow-500 to-green-500 -m-6 mb-6 p-6 rounded-t-lg">
          <DialogTitle className="text-white text-2xl font-black flex items-center space-x-2">
            <Edit2 className="w-6 h-6" />
            <span>Edit Profile</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          {/* Message Alert */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg flex items-center space-x-3 border-2 ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="font-medium">{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <User className="w-5 h-5 text-yellow-600" />
              <span>Personal Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldEditor label="First Name" name="first_name" icon={User} />
              <FieldEditor label="Last Name" name="first_name" icon={User} />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-yellow-600" />
              <span>Contact Information</span>
            </h3>
            <FieldEditor label="Email Address" name="email" type="email" icon={Mail} />
          </div>

          {/* Security Section */}
          <div className="space-y-4 bg-gradient-to-r from-yellow-50 to-green-50 p-4 rounded-lg border-2 border-yellow-200">
            <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-yellow-600" />
              <span>Security</span>
            </h3>
            <p className="text-sm text-gray-600">Leave blank to keep current password</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setEditingField('password')}
                    onBlur={() => setEditingField(null)}
                    placeholder="Enter new password"
                    className={`pl-9 h-11 border-2 transition-all ${
                      editingField === 'password'
                        ? 'border-yellow-500 ring-2 ring-yellow-200 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setEditingField('confirmPassword')}
                    onBlur={() => setEditingField(null)}
                    placeholder="Confirm new password"
                    className={`pl-9 h-11 border-2 transition-all ${
                      editingField === 'confirmPassword'
                        ? 'border-yellow-500 ring-2 ring-yellow-200 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </motion.button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;

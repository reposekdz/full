import React, { useState, useEffect } from 'react';
import { Lock, Mail, ShieldAlert, Loader2, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_BASE_URL } from '@/app/config/apiBase';
import { toast } from 'sonner';

interface ForceChangeCredentialsPageProps {
  onSuccess: () => void;
}

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let strength = 0;
  const feedback = [];
  
  if (password.length >= 8) {
    strength += 1;
    feedback.push('At least 8 characters');
  } else if (password.length > 0) {
    feedback.push('At least 8 characters');
  }
  
  if (/[a-z]/.test(password)) {
    strength += 1;
  } else if (password.length > 0) {
    feedback.push('Lowercase letter');
  }
  
  if (/[A-Z]/.test(password)) {
    strength += 1;
  } else if (password.length > 0) {
    feedback.push('Uppercase letter');
  }
  
  if (/[0-9]/.test(password)) {
    strength += 1;
  } else if (password.length > 0) {
    feedback.push('Number');
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength += 1;
  } else if (password.length > 0) {
    feedback.push('Special character');
  }
  
  return { strength, feedback: feedback.slice(0, 3) };
};

const getStrengthColor = (strength: number) => {
  switch (strength) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
    case 5:
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

const getStrengthLabel = (strength: number) => {
  switch (strength) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
    case 5:
      return 'Strong';
    default:
      return '';
  }
};

// Email validation
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Shown when staff logs in with static/default credentials.
 * Forces change of email and password; stored in database via API.
 * Enhanced with password strength indicator and better UX.
 */
export default function ForceChangeCredentialsPage({ onSuccess }: ForceChangeCredentialsPageProps) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    current_password: '',
    new_email: '',
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState<'verify' | 'change'>('verify');
  
  // Password strength
  const passwordStrength = checkPasswordStrength(form.new_password);
  const strengthPercent = (passwordStrength.strength / 5) * 100;
  
  // Email validity
  const isEmailValid = form.new_email.length > 0 && isValidEmail(form.new_email);
  const doPasswordsMatch = form.new_password === form.confirm_password && form.confirm_password.length > 0;
  const isFormValid = form.current_password.length > 0 && isEmailValid && passwordStrength.strength >= 3 && doPasswordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (form.new_password !== form.confirm_password) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (form.new_password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (!form.new_email?.trim()) {
      setError('New email is required.');
      return;
    }
    if (!isValidEmail(form.new_email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/force-change-credentials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          current_password: form.current_password,
          new_email: form.new_email.trim(),
          new_password: form.new_password
        })
      });
      const data = await res.json();
      
      if (data.success) {
        // Clear the password change flag
        localStorage.removeItem('needsPasswordChange');
        
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        toast.success('Email and password updated successfully! Please sign in with your new credentials.');
        logout();
        onSuccess();
      } else {
        setError(data.message || 'Update failed. Please check your current password and try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get role-specific styling
  const getRoleColor = () => {
    const role = user?.role?.toLowerCase() || '';
    switch (role) {
      case 'admin':
        return 'from-purple-600 to-purple-800';
      case 'headmaster':
        return 'from-indigo-600 to-indigo-800';
      case 'teacher':
        return 'from-blue-600 to-blue-800';
      case 'accountant':
        return 'from-green-600 to-green-800';
      case 'dos':
        return 'from-orange-600 to-orange-800';
      case 'dod':
        return 'from-red-600 to-red-800';
      case 'stock':
      case 'stock_manager':
        return 'from-teal-600 to-teal-800';
      default:
        return 'from-slate-600 to-slate-800';
    }
  };

  const getRoleIcon = () => {
    const role = user?.role?.toLowerCase() || '';
    switch (role) {
      case 'admin':
        return '👑';
      case 'headmaster':
        return '🎓';
      case 'teacher':
        return '📚';
      case 'accountant':
        return '💰';
      case 'dos':
        return '🏫';
      case 'dod':
        return '🛡️';
      case 'stock':
      case 'stock_manager':
        return '📦';
      default:
        return '👤';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-lg border-2 border-amber-500/50 shadow-2xl bg-slate-800/95 text-white overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getRoleColor()} p-6 text-center`}>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl">
              {getRoleIcon()}
            </div>
          </div>
          <ShieldAlert className="w-10 h-10 mx-auto text-amber-300 mb-2" />
          <CardTitle className="text-2xl font-bold text-white">Change Your Credentials</CardTitle>
          <CardDescription className="text-slate-200 mt-2">
            You logged in with default credentials. Please update your email and password to continue.
          </CardDescription>
        </div>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <Label className="text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Current Password *
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                  placeholder="Enter your current password"
                  required
                  className="pl-10 pr-10 bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Email */}
            <div>
              <Label className="text-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                New Email Address *
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  value={form.new_email}
                  onChange={(e) => setForm({ ...form, new_email: e.target.value })}
                  placeholder="your.new@email.com"
                  required
                  className="pl-10 bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-500"
                />
                {form.new_email.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isEmailValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {form.new_email.length > 0 && !isEmailValid && (
                <p className="text-xs text-red-400 mt-1">Please enter a valid email address</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <Label className="text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                New Password * <span className="text-xs text-slate-400">(min 6 characters)</span>
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10 pr-10 bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {form.new_password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                      style={{ width: `${strengthPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${
                      passwordStrength.strength >= 3 ? 'text-green-400' : 
                      passwordStrength.strength >= 2 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {getStrengthLabel(passwordStrength.strength)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {passwordStrength.strength}/5
                    </span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-slate-400 space-y-0.5">
                      {passwordStrength.feedback.map((item, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label className="text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm New Password *
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10 pr-10 bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirm_password.length > 0 && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  doPasswordsMatch ? 'text-green-400' : 'text-red-400'
                }`}>
                  {doPasswordsMatch ? (
                    <><CheckCircle className="w-3 h-3" /> Passwords match</>
                  ) : (
                    <><XCircle className="w-3 h-3" /> Passwords do not match</>
                  )}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-300 flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full font-semibold py-6 text-lg ${
                isFormValid 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' 
                  : 'bg-slate-600 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating Credentials...</>
              ) : (
                <>Update Email & Password</>
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-white mb-1">Important Information</p>
                <ul className="text-xs space-y-1">
                  <li>• Role: <span className="text-amber-400 capitalize">{user?.role || 'Unknown'}</span></li>
                  <li>• After updating, you will be automatically logged out</li>
                  <li>• Please sign in again with your new credentials</li>
                  <li>• Your new credentials will be securely stored in the database</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

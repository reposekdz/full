import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, Eye, EyeOff, Shield, AlertTriangle, CheckCircle2, 
  Loader2, KeyRound, User, RefreshCw, ArrowRight, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';

interface ForceCredentialChangeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  userInfo?: {
    username: string;
    email: string;
    role: string;
    must_change_password: boolean;
  };
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

const ForceCredentialChangeForm: React.FC<ForceCredentialChangeFormProps> = ({
  onSuccess,
  onCancel,
  userInfo
}) => {
  const [step, setStep] = useState<'warning' | 'form' | 'success'>('warning');
  const [formData, setFormData] = useState({
    current_password: '',
    new_email: userInfo?.email || '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'bg-gray-200'
  });

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Include lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Include uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 20;
    } else {
      feedback.push('Include numbers');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Include special characters');
    }

    let color = 'bg-red-500';
    if (score >= 80) color = 'bg-green-500';
    else if (score >= 60) color = 'bg-yellow-500';
    else if (score >= 40) color = 'bg-orange-500';

    return { score, feedback, color };
  };

  useEffect(() => {
    if (formData.new_password) {
      setPasswordStrength(checkPasswordStrength(formData.new_password));
    }
  }, [formData.new_password]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.current_password) {
      setError('Current password is required');
      return false;
    }

    if (!formData.new_email || !/\S+@\S+\.\S+/.test(formData.new_email)) {
      setError('Valid email address is required');
      return false;
    }

    if (!formData.new_password || formData.new_password.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }

    if (passwordStrength.score < 60) {
      setError('Password is too weak. Please choose a stronger password.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/force-change-credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_email: formData.new_email,
          new_password: formData.new_password
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Credentials updated successfully! Please sign in with your new credentials.');
        setStep('success');
        
        // Log activity
        await fetch('http://localhost:5000/api/auth/log-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'force_credential_change',
            details: 'User completed mandatory credential change'
          })
        }).catch(() => {}); // Silent fail for logging

        // Clear local storage and redirect after delay
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = '/login';
          }
        }, 3000);
      } else {
        setError(result.message || 'Failed to update credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (step === 'warning') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-orange-200 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Security Update Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-orange-300 bg-orange-50">
                <Shield className="h-4 w-4 text-orange-600" />
                <AlertDescription className="ml-2 text-orange-800">
                  For security reasons, you must update your email and password before continuing.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{userInfo?.username}</p>
                    <p className="text-sm text-gray-600">{userInfo?.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Mail className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Current Email</p>
                    <p className="font-medium text-gray-900">{userInfo?.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">What you need to do:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Update your email address
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Create a strong new password
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Sign in with new credentials
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => setStep('form')}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold"
              >
                Continue to Update
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-green-200 shadow-2xl">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Credentials Updated Successfully!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your email and password have been updated. You will be redirected to the login page.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">New Email:</span>
                  <span className="font-medium text-gray-900">{formData.new_email}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Password:</span>
                  <Badge className="bg-green-100 text-green-800">Updated</Badge>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Redirecting in 3 seconds...
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 border-blue-200 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Update Your Credentials
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Please update your email and password to continue
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-300 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="ml-2 text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <Label htmlFor="current_password" className="text-sm font-semibold text-gray-700">
                  Current Password *
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="current_password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.current_password}
                    onChange={(e) => handleInputChange('current_password', e.target.value)}
                    placeholder="Enter your current password"
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.current ? 
                      <EyeOff className="w-5 h-5 text-gray-400" /> : 
                      <Eye className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                </div>
              </div>

              {/* New Email */}
              <div>
                <Label htmlFor="new_email" className="text-sm font-semibold text-gray-700">
                  New Email Address *
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="new_email"
                    type="email"
                    value={formData.new_email}
                    onChange={(e) => handleInputChange('new_email', e.target.value)}
                    placeholder="Enter your new email address"
                    className="pl-10 h-12"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use a valid email address you have access to
                </p>
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="new_password" className="text-sm font-semibold text-gray-700">
                  New Password *
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="new_password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.new_password}
                    onChange={(e) => handleInputChange('new_password', e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.new ? 
                      <EyeOff className="w-5 h-5 text-gray-400" /> : 
                      <Eye className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.new_password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Password Strength</span>
                      <span className="text-xs font-medium">
                        {passwordStrength.score >= 80 ? 'Strong' : 
                         passwordStrength.score >= 60 ? 'Good' : 
                         passwordStrength.score >= 40 ? 'Fair' : 'Weak'}
                      </span>
                    </div>
                    <Progress value={passwordStrength.score} className="h-2" />
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Missing: {passwordStrength.feedback.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirm_password" className="text-sm font-semibold text-gray-700">
                  Confirm New Password *
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirm_password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                    placeholder="Confirm your new password"
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswords.confirm ? 
                      <EyeOff className="w-5 h-5 text-gray-400" /> : 
                      <Eye className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                </div>
                {formData.confirm_password && formData.new_password !== formData.confirm_password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Security Tips */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Security Tips
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Use a unique password you haven't used elsewhere</li>
                  <li>• Include uppercase, lowercase, numbers, and symbols</li>
                  <li>• Make it at least 8 characters long</li>
                  <li>• Avoid personal information like names or dates</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 h-12"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || passwordStrength.score < 60}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Update Credentials
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForceCredentialChangeForm;
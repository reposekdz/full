import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Lock, Key, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface StudentLoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (serialCode: string, password: string) => void;
}

const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onNavigate, onLogin }) => {
  const [serialCode, setSerialCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!serialCode || !password) {
      setError('Uzuza ibisabwa byose');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial_code: serialCode, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onLogin(serialCode, password);
        }, 1000);
      } else {
        setError(data.message || 'Nimero cyangwa ijambo ryibanga ntibikora');
      }
    } catch (err) {
      setError('Ikosa ryabaye. Gerageza ukundi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 mx-auto mb-6 bg-white rounded-3xl shadow-2xl flex items-center justify-center"
          >
            <GraduationCap className="w-14 h-14 text-blue-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Injira</h1>
          <p className="text-xl text-white/90 font-semibold">Umunyeshuri - Garden TVET</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Nimero y'Umunyeshuri
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Key className="w-5 h-5 text-blue-600" />
                  </div>
                  <Input
                    type="text"
                    value={serialCode}
                    onChange={(e) => setSerialCode(e.target.value)}
                    placeholder=""
                    className="h-14 pl-12 text-lg border-2 border-gray-200 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Ijambo ry'Ibanga
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="h-14 pl-12 pr-12 text-lg border-2 border-gray-200 focus:border-blue-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 bg-red-50 border-2 border-red-200 rounded-xl p-4"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-red-800">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 bg-green-50 border-2 border-green-200 rounded-xl p-4"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-green-800">Injiye neza! Tegereza...</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-black shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Tegereza...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Injira
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t-2 border-gray-100">
              <button
                onClick={() => onNavigate('home')}
                className="w-full text-center text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
              >
                Subira Ahabanza
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm font-semibold">
            Ufite ikibazo? Vugana n'umuyobozi
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLoginPage;

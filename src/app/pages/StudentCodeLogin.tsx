import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

interface StudentCodeLoginProps {
  onNavigate: (page: string) => void;
}

const StudentCodeLogin: React.FC<StudentCodeLoginProps> = ({ onNavigate }) => {
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/student-management/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_code: studentCode, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-full">
                <GraduationCap className="w-12 h-12" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Student Login</CardTitle>
            <p className="text-center text-white/90 text-sm">Injira ukoresheje code yawe</p>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="code">Student Code / Code y'Umunyeshuri</Label>
                <Input
                  id="code"
                  placeholder="SOD0012026"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Example: SOD0012026, BDC0012026, AUT0012026</p>
              </div>

              <div>
                <Label htmlFor="password">Password / Ijambo Ryibanga</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 mt-1"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? 'Injira...' : 'Injira / Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Nta code ufite? Baza umuyobozi w'amasomo
              </p>
              <Button
                variant="link"
                onClick={() => onNavigate('home')}
                className="text-blue-600"
              >
                Subira Ahabanza
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentCodeLogin;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { KeyRound, Lock, Phone, MapPin, LogIn, UserPlus } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const StudentAuth = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.target);
    const serial_code = formData.get('serial_code');
    const password = formData.get('password');

    try {
      const response = await fetch(`${API_BASE}/student-auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial_code, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        setTimeout(() => onNavigate('student-dashboard'), 1000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Login failed. Please try again.' });
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.target);
    const serial_code = formData.get('serial_code');
    const password = formData.get('password');
    const confirm_password = formData.get('confirm_password');
    const parent_phone = formData.get('parent_phone');
    const location = formData.get('location');

    if (password !== confirm_password) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/student-auth/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial_code, password, parent_phone, location })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => setIsLogin(true), 2000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Registration failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {isLogin ? 'Student Login' : 'Student Registration'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Login with your serial code' : 'Register with your serial code from DOS'}
          </p>
        </CardHeader>

        <CardContent>
          {message.text && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="serial_code" className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Serial Code
                </Label>
                <Input
                  id="serial_code"
                  name="serial_code"
                  placeholder="STD2026123456"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="serial_code" className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Serial Code
                </Label>
                <Input
                  id="serial_code"
                  name="serial_code"
                  placeholder="STD2026123456"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the code given by DOS</p>
              </div>

              <div>
                <Label htmlFor="parent_phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Parent Phone Number
                </Label>
                <Input
                  id="parent_phone"
                  name="parent_phone"
                  type="tel"
                  placeholder="+250 XXX XXX XXX"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Kigali, Gasabo"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirm_password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage({ type: '', text: '' });
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAuth;

import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_BASE_URL } from '@/app/config/apiBase';
import { toast } from 'sonner';

interface ForceChangeCredentialsPageProps {
  onSuccess: () => void;
}

/**
 * Shown when staff logs in with static/default credentials.
 * Forces change of email and password; stored in database via API.
 */
export default function ForceChangeCredentialsPage({ onSuccess }: ForceChangeCredentialsPageProps) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    current_password: '',
    new_email: '',
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        toast.success('Email and password updated. Please sign in again with your new credentials.');
        logout();
        onSuccess();
      } else {
        setError(data.message || 'Update failed. Check current password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-2 border-amber-500/50 shadow-2xl bg-slate-800/90 text-white">
        <CardHeader>
          <div className="flex items-center gap-3 text-amber-400">
            <ShieldAlert className="w-8 h-8" />
            <CardTitle className="text-xl">Change Email & Password</CardTitle>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            You signed in with default credentials. Set your own email and password to continue. They will be stored securely.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-200">Current password *</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                  placeholder="Enter current password"
                  required
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-200">New email *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  value={form.new_email}
                  onChange={(e) => setForm({ ...form, new_email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-200">New password * (min 6 characters)</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-200">Confirm new password *</Label>
              <Input
                type="password"
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 bg-red-900/30 border border-red-500/50 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold"
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : 'Update and sign in again'}
            </Button>
          </form>
          <p className="text-xs text-slate-400 mt-4 text-center">
            Role: {user?.role ?? '—'}. After updating, you will be logged out and must sign in with your new email and password.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import ForceCredentialChangeForm from './ForceCredentialChangeForm';
import { API_BASE_URL } from '@/app/config/apiBase';


interface CredentialGuardProps {
  children: React.ReactNode;
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  must_change_password: boolean;
  user_type: string;
}

const CredentialGuard: React.FC<CredentialGuardProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsCredentialChange, setNeedsCredentialChange] = useState(false);

  useEffect(() => {
    checkUserCredentialStatus();
  }, []);

  const checkUserCredentialStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setUserInfo(result.user);

          // Check if user needs to change credentials
          const mustChange = result.user.must_change_password === true ||
            result.user.must_change_password === 1;

          const defaultEmails = [
            'reponse@gmail.com',
            'reponsekdz06@gmail.com',
            'dod@reponsekdz06.com',
            'accountant@reponsekdz06@gmail.com',
            'dos@reponsekdz06.com',
            'advisor@reponsekdz06.com',
            'headmaster@reponsekdz06.com',
            'stockmanager@reponsekdz06.com'
          ];
          const hasDefaultEmail = defaultEmails.includes((result.user.email || '').trim().toLowerCase());

          setNeedsCredentialChange(mustChange || hasDefaultEmail);
        }
      } else if (response.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('Error checking credential status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialChangeSuccess = () => {
    // Clear tokens and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleCredentialChangeCancel = () => {
    // For forced changes, we can't allow cancel
    // But we can provide a logout option
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user needs to change credentials, show the form
  if (needsCredentialChange && userInfo) {
    return (
      <ForceCredentialChangeForm
        userInfo={userInfo}
        onSuccess={handleCredentialChangeSuccess}
        onCancel={handleCredentialChangeCancel}
      />
    );
  }

  // Otherwise, render the protected content
  return <>{children}</>;
};

export default CredentialGuard;
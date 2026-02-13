import React, { useEffect, useState } from 'react';
import { ForcePasswordChangeModal } from './ForcePasswordChangeModal';
import { API_BASE_URL } from '@/app/config/apiBase';

interface DashboardWrapperProps {
  children: React.ReactNode;
  user: any;
}

export const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ children, user }) => {
  const [needsChange, setNeedsChange] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCredentials();
  }, []);

  const checkCredentials = async () => {
    // Check if user has default credentials
    const staffRoles = ['accountant', 'headmaster', 'dod', 'dos', 'stock_manager', 'admin', 'advisor', 'teacher'];
    
    if (!user || !staffRoles.includes(user.role?.toLowerCase())) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-default-credentials`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.needsChange) {
        setNeedsChange(true);
      }
    } catch (error) {
      console.error('Check credentials error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setNeedsChange(false);
    window.location.reload(); // Refresh to update user data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {needsChange && <ForcePasswordChangeModal user={user} onSuccess={handleSuccess} />}
      {children}
    </>
  );
};

export default DashboardWrapper;

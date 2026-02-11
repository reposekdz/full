import React, { useEffect } from 'react';

interface StaffManagementPageProps {
  onNavigate: (page: string) => void;
}

const StaffManagementPage: React.FC<StaffManagementPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    // Redirect to home page
    onNavigate('home');
  }, [onNavigate]);

  return null;
};

export default StaffManagementPage;

import React from 'react';
import StaffManagementAdvanced from '@/app/components/dashboards/StaffManagementAdvanced';

interface StaffManagementPageProps {
  onNavigate: (page: string) => void;
}

const StaffManagementPage: React.FC<StaffManagementPageProps> = ({ onNavigate }) => {
  return <StaffManagementAdvanced onNavigate={onNavigate} />;
};

export default StaffManagementPage;

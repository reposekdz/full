import React from 'react';
import DODDashboardAdvanced from './DODDashboardAdvanced';

interface DODDashboardProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

const DODDashboard: React.FC<DODDashboardProps> = ({ onNavigate, onLogout }) => {
  return <DODDashboardAdvanced onNavigate={onNavigate} onLogout={onLogout} />;
};

export default DODDashboard;

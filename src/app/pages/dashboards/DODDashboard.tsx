import React from 'react';
import DODDashboardAdvanced from './DODDashboardAdvanced';

interface DODDashboardProps {
  onNavigate: (page: string) => void;
}

const DODDashboard: React.FC<DODDashboardProps> = ({ onNavigate }) => {
  return <DODDashboardAdvanced onNavigate={onNavigate} />;
};

export default DODDashboard;

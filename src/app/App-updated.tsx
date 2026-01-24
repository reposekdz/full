import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ModernLeadershipManagement from './components/leadership/ModernLeadershipManagement';
import DynamicDashboard from './components/dynamic/DynamicDashboard';
import DynamicConfigAdmin from './components/admin/DynamicConfigAdmin';
import LeadershipPage from './pages/LeadershipPage';
import LeaderDetailPage from './pages/LeaderDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DynamicDashboard />} />
        <Route path="/dashboard" element={<DynamicDashboard />} />
        <Route path="/admin/leadership" element={<ModernLeadershipManagement />} />
        <Route path="/admin/config" element={<DynamicConfigAdmin />} />
        <Route path="/leadership" element={<LeadershipPage onNavigate={(page) => window.location.href = `/${page}`} />} />
        <Route path="/leader/:id" element={<LeaderDetailPage leaderId={window.location.pathname.split('/')[2]} onNavigate={(page) => window.location.href = `/${page}`} />} />
      </Routes>
    </Router>
  );
}

export default App;

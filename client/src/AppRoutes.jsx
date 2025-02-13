import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Main from './pages/Main';
import AccountDashboard from './pages/AccountDashboard';
import About from './pages/About';
import IgentityLandingPage from './pages/IntroPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<IgentityLandingPage />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected routes */}
      <Route path="/main" element={<Main />} />
      <Route path="/account/:accountId" element={<AccountDashboard />} />
      <Route path="/about" element={<About />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
} 
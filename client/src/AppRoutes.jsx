import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Main from './pages/Main';
import AccountDashboard from './pages/AccountDashboard';
import About from './pages/About';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Main />} />
      <Route path="/account/:accountId" element={<AccountDashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
} 
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Main from './pages/Main';
import AccountDashboard from './pages/AccountDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Main />} />
      <Route path="/account/:accountId" element={<AccountDashboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
} 
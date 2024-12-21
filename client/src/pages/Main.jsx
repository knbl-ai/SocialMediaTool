import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../hooks/useAccounts';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import NewAccountButton from '../components/NewAccountButton';
import AccountCard from '../components/AccountCard';
import api from '../lib/api';

const Main = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const { accounts, loading, error, deleteAccount } = useAccounts();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      await api.logout();
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAccountDeleted = async (accountId) => {
    try {
      await deleteAccount(accountId);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  // Show loading state while authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no user, the useEffect will handle redirect
  if (!user) return null;

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <main className="flex-1 overflow-auto p-4 w-full">
        <div className="flex justify-between items-center mb-8">
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
          <h1 className="text-2xl font-bold">Social Media Tool</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={loading}
          >
            Logout
          </Button>
        </div>

        <div className="flex justify-center items-center mb-8">
          <NewAccountButton />
        </div>

        {error && (
          <Card className="mb-8 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                You haven't added any accounts yet. Click the "Add Account" button to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center w-full">
            {accounts.map(account => (
              <AccountCard 
                key={account._id} 
                account={account}
                onAccountDeleted={handleAccountDeleted}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Main;

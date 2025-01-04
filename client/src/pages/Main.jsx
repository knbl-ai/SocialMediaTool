import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../hooks/useAccounts';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import NewAccountButton from '../components/NewAccountButton';
import AccountCard from '../components/AccountCard';
import api from '../lib/api';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const Main = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout, checkAuthStatus } = useAuth();
  const { accounts, loading, error, deleteAccount, updateAccountPosition, fetchAccounts } = useAccounts();

  // Check auth status on mount and when user changes
  useEffect(() => {
    const initializeAuth = async () => {
      if (!user) {
        await checkAuthStatus();
      }
    };
    initializeAuth();
  }, [user, checkAuthStatus]);

  // Fetch accounts only when we have a valid user
  useEffect(() => {
    if (!authLoading && user) {
      fetchAccounts();
    }
  }, [user, authLoading, fetchAccounts]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
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

  const handleDrop = async (dragIndex, hoverIndex) => {
    try {
      const draggedAccount = accounts[dragIndex];
      const updatedAccounts = [...accounts];
      updatedAccounts.splice(dragIndex, 1);
      updatedAccounts.splice(hoverIndex, 0, draggedAccount);
      
      // Update positions in the database
      await updateAccountPosition(draggedAccount._id, hoverIndex);
    } catch (error) {
      console.error('Error updating account position:', error);
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

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full flex flex-col bg-background">
        <main className="flex-1 overflow-auto p-4 w-full">
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold">SMAPP</h1>
              <h3 className="text-m text-muted-foreground">Social Media App</h3>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={loading || authLoading}
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
            <div className="flex flex-col items-center w-full ">
              {accounts.map((account, index) => (
                <AccountCard 
                  key={account._id} 
                  account={account}
                  index={index}
                  onAccountDeleted={handleAccountDeleted}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </DndProvider>
  );
};

export default Main;

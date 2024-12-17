import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NewAccountButton from '../components/NewAccountButton';
import AccountCard from '../components/AccountCard';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;

const Main = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If authentication is still loading, wait
    if (authLoading) return;

    // If no user after auth loading is complete, redirect to login
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchAccounts = async () => {
      try {
        const response = await axios.get('/api/accounts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setAccounts(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError(error.response?.data?.message || 'Failed to fetch accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  const handleAccountCreated = (newAccount) => {
    setAccounts(prevAccounts => [...prevAccounts, newAccount]);
  };

  const handleAccountDeleted = (accountId) => {
    setAccounts(prevAccounts => prevAccounts.filter(account => account._id !== accountId));
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
          <NewAccountButton onAccountCreated={handleAccountCreated} />
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

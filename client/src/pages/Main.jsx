import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../hooks/useAccounts';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import NewAccountButton from '../components/NewAccountButton';
import AccountCard from '../components/AccountCard';
import { ThemeToggle } from '../components/theme/theme-toggle';
import { useTheme } from "@/components/theme/theme-provider";
import { Info } from 'lucide-react';
import api from '../lib/api';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import HyperText from '../components/ui/hyper-text';


const Main = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, loading: authLoading, logout, checkAuthStatus } = useAuth();
  const { accounts, loading, error, deleteAccount, updateAccountPosition, fetchAccounts } = useAccounts();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check auth status and redirect if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (!user && !authLoading) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [user, authLoading, navigate]);

  // Check authorization status
  useEffect(() => {
    const checkAuthorization = async () => {
      if (user?.email) {
        try {
          const response = await api.get('/auth/check-authorization');
          setIsAuthorized(response.isAuthorized);
        } catch (error) {
          console.error('Error checking authorization:', error);
          setIsAuthorized(false);
        }
      }
    };
    checkAuthorization();
  }, [user]);

  // Fetch accounts only when we have a valid user
  useEffect(() => {
    if (!authLoading && user) {
      fetchAccounts();
    }
  }, [user, authLoading, fetchAccounts]);

  // Add effect to load Vimeo script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
            <div className="flex items-center gap-2">
             
              <Button
                variant="default"
                size="icon"
                onClick={() => window.open('http://knbl360.com/wp-content/uploads/2025/02/One-pager.pdf', '_blank')}
                className="rounded-full bg-lime-500 hover:bg-lime-600 h-12 w-12"
              >
                <Info className="text-white transform scale-150 animate-pulse" />
              </Button>
              <span className="text-sm text-muted-foreground ms-2">
                {user.email}
              </span>
            </div>
            <div className="flex flex-col items-center me-20">
              <img 
                src={theme === 'dark' ? "/logo_01.png" : "/logo_02.png"} 
                alt="iGentity" 
                className="h-20 w-30 mb-1" 
              />
              <HyperText className="text-xs text-gray-500">Next generation of social presence</HyperText>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={handleLogout}
                disabled={loading || authLoading}
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="flex justify-center items-center mb-8">
            {isAuthorized ? (
              <NewAccountButton />
            ) : (
              <div className="w-full max-w-4xl">
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Please contact KNBL to apply for early access to application at{' '}
                      <a 
                        href="mailto:info@kanibal.co.il" 
                        className="text-lime-500 hover:text-lime-600"
                      >
                        info@kanibal.co.il
                      </a>
                    </p>
                  </CardContent>
                </Card>
                <div className="relative w-full rounded-lg overflow-hidden shadow-lg">
                  <div style={{ padding: '56.72% 0 0 0', position: 'relative' }}>
                    <iframe
                      src="https://player.vimeo.com/video/1056046911?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '0.5rem'
                      }}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                      title="iGentity tutorial"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Only show accounts section if user is authorized */}
          {isAuthorized ? (
            <>
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
            </>
          ) : null}
        </main>
      </div>
    </DndProvider>
  );
};

export default Main;

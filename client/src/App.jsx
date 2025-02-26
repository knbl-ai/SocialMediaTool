import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { PlatformProvider } from './context/PlatformContext';
import { PostsProvider } from './context/PostsContext';
import { TextDirectionProvider } from './context/TextDirectionContext';
import AppRoutes from './AppRoutes';
import './styles/animations.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useEffect } from 'react';
import { initAutoTextDirection } from './directives/autoDirection';

const queryClient = new QueryClient();

function App() {
  // Initialize auto text direction on component mount
  useEffect(() => {
    const observer = initAutoTextDirection();
    
    // Cleanup observer on unmount
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <PlatformProvider>
                <PostsProvider>
                  <TextDirectionProvider>
                    <AppRoutes />
                  </TextDirectionProvider>
                </PostsProvider>
              </PlatformProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

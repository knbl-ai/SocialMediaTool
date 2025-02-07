import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, InfoIcon } from "lucide-react";
import HyperText from '@/components/ui/hyper-text';
import Testimonials from '@/components/Testimonials';
import WordRotate from '@/components/ui/word-rotate';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, googleLogin, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isSignUp) {
        await register(formData.email, formData.password, formData.name);
      } else {
        await login(formData.email, formData.password);
      }
      setTimeout(() => {
        navigate('/');
      }, 0);
    } catch (error) {
      console.error('Authentication failed:', error);
      setError(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setError('');
    setIsLoading(true);
    try {
      await googleLogin(response.credential);
      setTimeout(() => {
        navigate('/');
      }, 0);
    } catch (error) {
      console.error('Google login failed:', error);
      setError(error.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google Sign-In Error:', error);
    setError('Google sign-in failed. Please try again or use email/password.');
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center flex-col relative">
    
      {/* <HyperText className="text-4xl">iGentity</HyperText> */}
      <img src="/iGentity_full.png" alt="iGentity" className="h-12 w-30 mb-1" />
      <HyperText className="text-xl text-gray-500">Next generation of social presence
      </HyperText>
      <div className='grid grid-cols-3 gap-1'>
      <WordRotate
      className="text-4xl font-bold text-black dark:text-white pt-[20vh] pe-[5vw]"
      words={["One Place","To Manage", "All Social Platforms"]}
    />
      <Card className="w-[30vw] max-w-sm mx-auto">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create Account' : 'Welcome'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Enter your details to create a new account' 
              : 'Enter your credentials to access your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={isSignUp}
                  disabled={isLoading}
                  placeholder="Your name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="••••••••"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width={240}
              />
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>{' '}
            <span
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline cursor-pointer font-medium"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </span>
          </div>
        </CardContent>
      </Card>
      <WordRotate
      className="text-4xl font-bold text-black dark:text-white pt-[20vh] ps-[10vw]"
      words={["Instagram","Facebook", "LinkedIn", "TikTok", "X"]}
    />
      </div>
      <HyperText className="text-2xl text-blue-500">KNBL</HyperText>
      <div className='mt-2'>
      <Testimonials/>
      </div>
    </div>
  );
};

export default Auth;

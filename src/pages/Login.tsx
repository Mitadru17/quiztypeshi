import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signIn, signInWithGoogle, handleRedirectResult, getErrorMessage } from '../services/auth';
import { auth } from '../services/firebase';
import AuthForm from '../components/AuthForm';
import { loginUser, isAdmin } from '../services/auth';

const Login: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect admin to admin panel, others to home
      if (isAdmin(user)) {
        navigate('/admin');
      } else {
      navigate('/');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    // Handle redirect result when component mounts
    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          navigate('/');
        }
      } catch (error: any) {
        setError(getErrorMessage(error.code) || 'Failed to complete Google sign-in');
      }
    };

    checkRedirectResult();
  }, [navigate]);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const user = await loginUser(email, password);
      // Redirect will happen automatically due to useEffect
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    
    try {
      const result = await signInWithGoogle();
      if (result) {
        navigate('/');
      }
      // If result is null, it means redirect was used
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your C Programming Quiz
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <AuthForm
            type="login"
            onSubmit={handleLogin}
            onGoogleSignIn={handleGoogleSignIn}
            loading={authLoading}
            error={error}
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
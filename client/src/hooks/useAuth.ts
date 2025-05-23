import { useState, useEffect } from 'react';
import { UserRole, AuthUser } from '@/types/auth';
import { apiClient } from '@/utils/api-client';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

const TOKEN_KEY = 'token';

interface AuthResponse {
  access_token: string;
}

export function useAuthHook() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        setIsSignedIn(false);
        setIsLoaded(true);
        return;
      }

      // Set the token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userData = await apiClient.get<AuthUser>('/api/auth/me', true);
      setUser(userData);
      setIsSignedIn(true);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsSignedIn(false);
      localStorage.removeItem(TOKEN_KEY);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Making login request...');
      const response = await apiClient.post<AuthResponse>('/api/auth/login', { email, password }, false);
      console.log('Login response:', response);

      if (response && response.access_token) {
        // First set the token in localStorage
        localStorage.setItem(TOKEN_KEY, response.access_token);
        
        // Then set the axios default header
        const authHeader = `Bearer ${response.access_token}`;
        axios.defaults.headers.common['Authorization'] = authHeader;
        
        // Add a small delay to ensure token is properly set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Add retry logic for fetching user data
        let retries = 3;
        let userData = null;
        
        while (retries > 0) {
          try {
            console.log('Fetching user data...');
            userData = await apiClient.get<AuthUser>('/api/auth/me', true);
            console.log('User data:', userData);
            break;
          } catch (error: any) {
            console.error('Error fetching user data:', error);
            if (error.response?.status === 401 && retries > 1) {
              console.log(`Unauthorized, retrying... (${retries - 1} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              retries--;
              continue;
            }
            throw error;
          }
        }
        
        if (!userData) {
          throw new Error('Failed to fetch user data after multiple attempts');
        }
        
        setUser(userData);
        setIsSignedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error signing in:', error);
      localStorage.removeItem(TOKEN_KEY);
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsSignedIn(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiClient.post('/api/auth/logout', {}, true);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsSignedIn(false);
      router.replace('/sign-in');
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  // Handle redirection based on auth state
  useEffect(() => {
    if (!isLoaded) return;

    const isAdminRoute = pathname?.startsWith('/admin');
    const isAuthRoute = pathname === '/sign-in' || pathname === '/register';

    if (isAdminRoute && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    } else if (isAuthRoute && isSignedIn) {
      router.replace(isAdmin ? '/admin' : '/');
    }
  }, [isLoaded, isSignedIn, isAdmin, pathname, router]);

  return {
    user,
    isLoaded,
    isSignedIn,
    signIn,
    signOut,
    isAdmin,
    role: user?.role as UserRole || 'USER',
  };
} 
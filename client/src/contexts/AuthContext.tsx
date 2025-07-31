import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'USER';
    isEmailVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in on mount
        checkAuth();

        // Listen for storage changes (e.g., logout in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                if (!e.newValue) {
                    // Token was removed
                    setUser(null);
                } else {
                    // Token was added/changed, re-check auth
                    checkAuth();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
                (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');

            const response = await fetch(`${apiUrl}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session-based auth
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // Token is invalid, remove it and clear user
                console.warn('Token validation failed:', response.status, response.statusText);
                localStorage.removeItem('token');
                setUser(null);

                // If we're on a protected route, redirect to sign-in
                const protectedRoutes = ['/profile', '/orders', '/address-book', '/admin'];
                const currentPath = window.location.pathname;
                if (protectedRoutes.some(route => currentPath.startsWith(route))) {
                    window.location.href = '/sign-in?redirect=' + encodeURIComponent(currentPath);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
                (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');

            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json();

            // Store token - check both possible response formats
            const token = data.access_token || data.token;
            const userData = data.user || (data.access_token ? data : null);

            if (token) {
                localStorage.setItem('token', token);
                console.log('Token stored successfully');
            } else {
                console.error('No token received from login response:', data);
                throw new Error('Authentication failed - no token received');
            }

            // Set user data (remove password if present)
            if (userData) {
                const { password, ...userWithoutPassword } = userData;
                setUser(userWithoutPassword);
            } else {
                // If no separate user object, use the data directly (excluding sensitive fields)
                const { password, access_token, token: tokenField, ...userWithoutPassword } = data;
                setUser(userWithoutPassword);
            }

            toast.success('Login successful');
            router.push('/profile');
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(error instanceof Error ? error.message : 'Login failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
                    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');

                await fetch(`${apiUrl}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with local cleanup even if API call fails
        } finally {
            // Always clean up local state
            localStorage.removeItem('token');
            setUser(null);
            toast.success('Logged out successfully');
            router.push('/');
        }
    };

    const refreshAuth = async () => {
        await checkAuth();
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
                (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');

            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json();
            toast.success(data.message || 'Registration successful. Please check your email to verify your account.');
            router.push('/sign-in?message=Please check your email to verify your account');
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error instanceof Error ? error.message : 'Registration failed');
            throw error;
        }
    };

    const verifyEmail = async (token: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
                (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');

            const response = await fetch(`${apiUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json();
            toast.success(data.message || 'Email verified successfully');
            router.push('/sign-in?verified=true');
        } catch (error) {
            console.error('Email verification failed:', error);
            toast.error(error instanceof Error ? error.message : 'Email verification failed');
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
                register,
                verifyEmail,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 
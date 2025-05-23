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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in on mount
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Skip auth check for public routes
            const publicRoutes = ['/product', '/products', '/', '/sign-in', '/register', '/verify-email'];
            const isPublicRoute = publicRoutes.some(route => window.location.pathname.startsWith(route));

            if (isPublicRoute) {
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/auth/me', {
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else if (response.status === 404) {
                // Handle 404 gracefully for public routes
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const userData = await response.json();
            setUser(userData);
            toast.success('Login successful');
            router.push('/');
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(error instanceof Error ? error.message : 'Login failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setUser(null);
            toast.success('Logged out successfully');
            router.push('/sign-in');
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed');
        }
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, firstName, lastName }),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json();
            toast.success(data.message || 'Registration successful. Please check your email to verify your account.');
            router.push('/register/success');
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error instanceof Error ? error.message : 'Registration failed');
            throw error;
        }
    };

    const verifyEmail = async (token: string) => {
        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json();
            toast.success(data.message || 'Email verified successfully');
            router.push('/sign-in');
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
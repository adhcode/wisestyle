'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthHook } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function SignInPage() {
    const { signIn, isSignedIn, isAdmin, isLoaded } = useAuthHook();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Handle redirect if already signed in
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect_url');

            if (redirectUrl && !pathname?.includes(redirectUrl)) {
                router.replace(decodeURIComponent(redirectUrl));
            } else if (!pathname?.startsWith('/admin') && isAdmin) {
                router.replace('/admin/dashboard');
            } else if (!pathname?.startsWith('/') && !isAdmin) {
                router.replace('/');
            }
        }
    }, [isLoaded, isSignedIn, isAdmin, router, pathname]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            console.log('Attempting to sign in with:', formData.email);
            const success = await signIn(formData.email, formData.password);
            if (!success) {
                setError('Invalid credentials');
                toast.error('Failed to sign in');
            }
        } catch (err) {
            console.error('Error signing in:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            toast.error(err instanceof Error ? err.message : 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFCF8]">
            <div className="w-full max-w-md p-8">
                <Card className="w-full p-0 md:p-8 space-y-8 bg-transparent border-0 shadow-none rounded-none md:bg-white md:border md:border-[#F3E9D7] md:shadow-xl md:rounded-2xl">
                    <div className="flex flex-col items-center gap-2">

                        <h2 className="text-3xl font-bold text-[#3B2305] tracking-tight font-macaw">Sign in to WiseStyle</h2>
                        <p className="mt-1 text-sm text-gray-500">Welcome back! Please enter your details.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[#3B2305] mb-1">
                                    Email
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        className="pl-10 bg-white border-[#F3E9D7] focus:border-[#3B2305] focus:ring-[#3B2305] rounded-lg"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-[#3B2305] mb-1">
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        required
                                        className="pl-10 pr-10 bg-white border-[#F3E9D7] focus:border-[#3B2305] focus:ring-[#3B2305] rounded-lg"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#3B2305] focus:outline-none"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((v) => !v)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100 animate-shake">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-[#3B2305] hover:bg-[#5a3a0a] text-white rounded-lg font-semibold text-base py-3 transition-colors duration-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>

                        <div className="text-center text-sm">
                            <p className="text-gray-500">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-[#3B2305] hover:text-[#C97203] font-medium transition-colors duration-200">
                                    Register
                                </Link>
                            </p>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
} 
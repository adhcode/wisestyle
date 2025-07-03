'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to register');
            }

            const data = await response.json();
            toast.success(data.message || 'Registration successful. Please check your email to verify your account.');
            router.push('/register/success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFCF8]">
            <div className="w-full max-w-md p-8">
                <Card className="w-full p-0 md:p-8 space-y-8 bg-transparent border-0 shadow-none rounded-none md:bg-white md:border md:border-[#F3E9D7] md:shadow-xl md:rounded-2xl">
                    <div className="flex flex-col items-start gap-2 mb-4">
                        <h2 className="text-3xl font-bold text-[#3B2305] tracking-tight font-macaw">Create your WiseStyle account</h2>
                        <p className="mt-1 text-sm text-gray-500">Register to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-[#3B2305] mb-1">
                                    First Name
                                </label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="mt-1 bg-white border-[#F3E9D7] focus:border-[#3B2305] focus:ring-[#3B2305] rounded-lg"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-[#3B2305] mb-1">
                                    Last Name
                                </label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="mt-1 bg-white border-[#F3E9D7] focus:border-[#3B2305] focus:ring-[#3B2305] rounded-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#3B2305] mb-1">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 bg-white border-[#F3E9D7] focus:border-[#3B2305] focus:ring-[#3B2305] rounded-lg"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#3B2305] mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 pr-10 bg-white border-[#F3E9D7] focus:border-[#3B2305] focus:ring-[#3B2305] rounded-lg"
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
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                        <div className="text-center text-sm">
                            Already have an account?{' '}
                            <Link href="/sign-in" className="text-[#3B2305] hover:text-[#C97203] font-medium transition-colors duration-200">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
} 
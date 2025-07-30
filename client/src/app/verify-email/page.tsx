'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');
                
                const response = await fetch(`${apiUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('Email verified successfully! You can now log in.');
                    toast.success('Email verified successfully!');
                    setTimeout(() => {
                        router.push('/sign-in?verified=true');
                    }, 3000);
                } else {
                    // Handle specific error cases
                    if (response.status === 400 && data.message?.includes('already verified')) {
                        setStatus('success');
                        setMessage('Your email is already verified! You can log in now.');
                        toast.success('Email already verified!');
                        setTimeout(() => {
                            router.push('/sign-in?verified=true');
                        }, 3000);
                    } else if (response.status === 400 && data.message?.includes('expired')) {
                        setStatus('error');
                        setMessage('Verification link has expired. Please request a new verification email.');
                    } else {
                        setStatus('error');
                        setMessage(data.message || 'Verification failed');
                    }
                }
            } catch (error: any) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage('Network error occurred. Please check your connection and try again.');
            }
        };

        verifyEmail();
    }, []); // Remove dependencies to prevent multiple calls

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-[#3B2305]">WiseStyle</h1>
                        <p className="text-gray-600 mt-2">Email Verification</p>
                    </div>

                    {status === 'loading' && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B2305] mx-auto mb-4"></div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Your Email</h2>
                            <p className="text-gray-600">Please wait while we verify your email address...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified Successfully!</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-green-800">
                                    <strong>Welcome to WiseStyle!</strong><br/>
                                    Your account is now active. You'll be redirected to the sign-in page in a few seconds.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/sign-in')}
                                className="w-full bg-[#3B2305] text-white py-3 px-4 rounded-lg hover:bg-[#4c2d08] transition-colors font-medium"
                            >
                                Continue to Sign In
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-red-800">
                                    <strong>Common Issues:</strong><br/>
                                    • The verification link may have expired<br/>
                                    • The link may have already been used<br/>
                                    • The link may be invalid or corrupted
                                </p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/register')}
                                    className="w-full bg-[#3B2305] text-white py-3 px-4 rounded-lg hover:bg-[#4c2d08] transition-colors font-medium"
                                >
                                    Try Registering Again
                                </button>
                                <button
                                    onClick={() => router.push('/sign-in')}
                                    className="w-full border border-[#3B2305] text-[#3B2305] py-3 px-4 rounded-lg hover:bg-[#F9F5F0] transition-colors font-medium"
                                >
                                    Go to Sign In
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500">
                            Need help? <a href="mailto:hello@wisestyleshop.com" className="text-[#3B2305] hover:underline">Contact Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
} 
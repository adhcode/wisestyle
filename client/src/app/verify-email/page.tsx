'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        AuthService.verifyEmail(token)
            .then(() => {
                setStatus('success');
                setMessage('Email verified successfully! You can now log in.');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            })
            .catch((error) => {
                setStatus('error');
                setMessage(error.message || 'Failed to verify email');
            });
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Email Verification
                    </h2>
                    <div className="mt-4">
                        {status === 'loading' && (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        )}
                        {(status === 'success' || status === 'error') && (
                            <div className={`text-center ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </div>
                        )}
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
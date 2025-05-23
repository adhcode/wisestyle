'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setError('No verification token found');
            setIsVerifying(false);
            return;
        }

        const verify = async () => {
            try {
                console.log('Verifying email with token:', token);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                console.log('Verification response:', data);

                if (!response.ok) {
                    throw new Error(data.message || 'Verification failed');
                }

                toast.success(data.message || 'Email verified successfully');
                router.push('/sign-in');
            } catch (err) {
                console.error('Verification error:', err);
                setError(err instanceof Error ? err.message : 'Verification failed');
            } finally {
                setIsVerifying(false);
            }
        };

        verify();
    }, [searchParams, router]);

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-600">Verification Failed</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <a href="/sign-in" className="text-blue-600 hover:underline">
                        Return to Sign In
                    </a>
                </div>
            </div>
        );
    }

    return null; // Will redirect to sign-in on success
} 
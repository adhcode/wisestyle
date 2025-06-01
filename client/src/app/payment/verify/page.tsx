'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';

function PaymentVerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const transactionId = searchParams.get('transaction_id');
                const reference = searchParams.get('reference');
                const status = searchParams.get('status');

                if (status === 'cancelled') {
                    toast.error('Payment was cancelled');
                    router.push('/checkout');
                    return;
                }

                if (transactionId) {
                    // Flutterwave verification
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify-flutterwave/${transactionId}`);
                    const data = await response.json();

                    if (data.status === 'success') {
                        handlePaymentSuccess();
                    } else {
                        throw new Error(data.message);
                    }
                } else if (reference) {
                    // Paystack verification
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify-paystack/${reference}`);
                    const data = await response.json();

                    if (data.status === 'success') {
                        handlePaymentSuccess();
                    } else {
                        throw new Error(data.message);
                    }
                } else {
                    throw new Error('No payment reference found');
                }
            } catch (error: any) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage(error?.message || 'Failed to verify payment');
                toast.error('Failed to verify payment. Please contact support.');
                router.push('/checkout');
            }
        };

        verifyPayment();
    }, [searchParams, router, clearCart]);

    const handlePaymentSuccess = () => {
        clearCart();
        setStatus('success');
        setMessage('Payment verified successfully!');
        toast.success('Payment successful!');
        router.push('/orders');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Payment Verification
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

export default function PaymentVerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        }>
            <PaymentVerifyContent />
        </Suspense>
    );
} 
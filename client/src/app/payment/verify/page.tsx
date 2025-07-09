'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Mail, User, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function PaymentVerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const { user } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [orderData, setOrderData] = useState<any>(null);
    const hasVerifiedRef = useRef(false);

    useEffect(() => {
        if (hasVerifiedRef.current) return;

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

                let response;
                if (transactionId) {
                    // Flutterwave verification
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify/flutterwave/${transactionId}`);
                } else if (reference) {
                    // Paystack verification
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify/paystack/${reference}`);
                } else {
                    throw new Error('No payment reference found');
                }

                const data = await response.json();
                if (data.status === 'success' || data.status === 'successful') {
                    handlePaymentSuccess(data);
                } else {
                    throw new Error(data.message);
                }
            } catch (error: any) {
                console.error('Payment verification error:', error);
                setStatus('error');
                toast.error('Failed to verify payment. Please contact support.');
            }
        };

        verifyPayment();
    }, [searchParams, router, clearCart]);

    const handlePaymentSuccess = (data: any) => {
        hasVerifiedRef.current = true;
        clearCart();
        setStatus('success');
        setOrderData(data);
        toast.success('Payment successful!');
    };

    const handleContinue = () => {
        if (user) {
            router.push('/orders');
        } else {
            router.push('/');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
                        <p className="text-gray-600">Please wait while we confirm your payment...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <Card className="p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
                        <p className="text-gray-600 mb-6">We couldn't verify your payment. Please contact support if you believe this is an error.</p>
                        <Button onClick={() => router.push('/checkout')} className="w-full">
                            Try Again
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Completed!</h1>
                        <p className="text-lg text-gray-600">Thank you for your purchase</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600">Order Number</span>
                            <span className="text-lg font-bold text-gray-900">#{orderData?.orderId || 'Processing'}</span>
                        </div>
                        <div className="flex items-center text-green-600">
                            <Mail className="h-5 w-5 mr-2" />
                            <span className="text-sm">A confirmation email will be sent to you shortly</span>
                        </div>
                    </div>

                    {user ? (
                        <div className="space-y-4">
                            <Button onClick={handleContinue} className="w-full" size="lg">
                                <ShoppingBag className="h-5 w-5 mr-2" />
                                View Your Orders
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/')}
                                className="w-full"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <User className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                                    <div>
                                        <h3 className="font-medium text-blue-900 mb-1">Create an Account</h3>
                                        <p className="text-sm text-blue-700 mb-3">
                                            Sign up to track your orders and enjoy faster checkout
                                        </p>
                                        <Button
                                            onClick={() => router.push('/register')}
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Sign Up <ArrowRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/')}
                                className="w-full"
                                size="lg"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default function PaymentVerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        }>
            <PaymentVerifyContent />
        </Suspense>
    );
} 
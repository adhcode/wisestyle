'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';

export default function PaymentVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'pending'>('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const reference = searchParams.get('reference');
                const trxref = searchParams.get('trxref');
                const tx_ref = searchParams.get('tx_ref');
                const transaction_id = searchParams.get('transaction_id');
                
                // Handle both Paystack (reference) and Flutterwave (tx_ref, trxref, transaction_id) redirects
                const paymentRef = reference || trxref || tx_ref || transaction_id;
                
                if (!paymentRef) {
                    setStatus('failed');
                    setMessage('Payment reference not found. Please complete a payment first.');
                    console.error('No payment reference found in URL:', { reference, trxref, tx_ref, transaction_id, searchParams: Object.fromEntries(searchParams.entries()) });
                    
                    // Redirect to checkout after 3 seconds
                    setTimeout(() => {
                        router.push('/checkout');
                    }, 3000);
                    return;
                }

                // Determine payment provider based on parameter
                const provider = reference ? 'paystack' : 'flutterwave';
                
                // For Flutterwave, use tx_ref if available, otherwise use transaction_id
                const flutterwaveRef = tx_ref || transaction_id;
                const finalPaymentRef = provider === 'flutterwave' ? flutterwaveRef : paymentRef;
                
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');
                
                const verifyUrl = `${apiUrl}/api/payments/verify/${provider}/${finalPaymentRef}`;
                
                console.log('Verifying payment with URL:', verifyUrl);
                console.log('Payment parameters:', { reference, trxref, tx_ref, transaction_id, provider, finalPaymentRef });
                
                const response = await fetch(verifyUrl);
                const data = await response.json();

                console.log('Verification response:', { status: response.status, data });

                if (response.ok) {
                    if (data.status === 'success' || data.status === 'successful') {
                        setStatus('success');
                        setMessage('Payment successful! Redirecting...');
                        clearCart();
                        toast.success('Payment completed successfully!');
                        
                        // Redirect to success page after a short delay
                        setTimeout(() => {
                            router.push('/checkout/success');
                        }, 2000);
                    } else if (data.status === 'pending') {
                        setStatus('pending');
                        setMessage('Payment is being processed. We will notify you once confirmed.');
                        // Keep checking for payment status more frequently
                        setTimeout(() => {
                            window.location.reload();
                        }, 5000); // Check again in 5 seconds
                    } else if (data.status === 'failed') {
                        setStatus('failed');
                        setMessage(data.message || 'Payment failed');
                        toast.error('Payment failed');
                    } else {
                        setStatus('failed');
                        setMessage(data.message || 'Payment verification failed');
                        toast.error('Payment verification failed');
                    }
                } else {
                    console.error('Payment verification failed:', data);
                    setStatus('failed');
                    setMessage(data.message || `Payment verification failed. Status: ${data.status || 'unknown'}`);
                    toast.error('Payment verification failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('failed');
                
                if (error instanceof Error) {
                    setMessage(`Verification error: ${error.message}`);
                } else {
                    setMessage('An error occurred while verifying payment');
                }
                
                toast.error('Payment verification failed');
            }
        };

        verifyPayment();
    }, [searchParams, clearCart, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3B2305] mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-[#3B2305] mb-2">Verifying Payment</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-yellow-600 mb-2">Payment Processing</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800">
                                <strong>Bank Transfer in Progress:</strong><br/>
                                Your payment is being processed. This usually takes a few minutes for bank transfers. 
                                You can safely close this page - we'll send you an email confirmation once the payment is confirmed.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-[#3B2305] text-white py-3 px-4 rounded-lg hover:bg-[#4c2d08] transition-colors"
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full border border-[#3B2305] text-[#3B2305] py-3 px-4 rounded-lg hover:bg-[#F9F5F0] transition-colors"
                            >
                                Check Status Again
                            </button>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Payment Issue</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-[#3B2305] text-white py-3 px-4 rounded-lg hover:bg-[#4c2d08] transition-colors"
                            >
                                Go to Checkout
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full border border-[#3B2305] text-[#3B2305] py-3 px-4 rounded-lg hover:bg-[#F9F5F0] transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
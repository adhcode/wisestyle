'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentService } from '@/services/payment.service';
import { toast } from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';

export default function PaymentVerificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const [isVerifying, setIsVerifying] = useState(true);

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
                    const response = await PaymentService.verifyFlutterwavePayment(transactionId);
                    if (response.status === 'success') {
                        handlePaymentSuccess();
                    } else {
                        throw new Error(response.message);
                    }
                } else if (reference) {
                    // Paystack verification
                    const response = await PaymentService.verifyPaystackPayment(reference);
                    if (response.status === 'success') {
                        handlePaymentSuccess();
                    } else {
                        throw new Error(response.message);
                    }
                } else {
                    throw new Error('No payment reference found');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Failed to verify payment. Please contact support.');
                router.push('/checkout');
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [searchParams, router, clearCart]);

    const handlePaymentSuccess = () => {
        clearCart();
        toast.success('Payment successful!');
        router.push('/orders');
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    return null;
} 
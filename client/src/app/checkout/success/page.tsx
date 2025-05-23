'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, TruckIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function SuccessPage() {
    const router = useRouter();
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear cart after successful payment
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-medium mb-2">Payment Successful!</h1>
                        <p className="text-gray-600">
                            Thank you for your purchase. Your order has been received and is being processed.
                        </p>
                    </div>

                    {/* Order Details */}
                    <div className="border-t border-gray-200 pt-8 mb-8">
                        <h2 className="text-lg font-medium mb-4">What's Next?</h2>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <TruckIcon className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium">Order Processing</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        We're preparing your order for shipment. You'll receive a notification when it's on its way.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium">Order Confirmation</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        A confirmation email has been sent to your email address with your order details.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <Link
                            href="/orders"
                            className="block w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm text-center"
                        >
                            View Order
                        </Link>
                        <Link
                            href="/"
                            className="block w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm text-center"
                        >
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Support Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            Need help? Contact our support team at{' '}
                            <a href="mailto:support@wisestyle.com" className="text-black hover:underline">
                                support@wisestyle.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 
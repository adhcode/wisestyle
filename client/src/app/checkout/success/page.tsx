'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ShoppingBagIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function CheckoutSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Clear any checkout-related data from localStorage if needed
        if (typeof window !== 'undefined') {
            localStorage.removeItem('checkout_data');
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-12 h-12 text-green-600" />
                </div>

                {/* Success Message */}
                <h1 className="text-2xl font-bold text-[#3B2305] mb-2">Order Confirmed!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your purchase. Your order has been successfully placed and you will receive a confirmation email shortly.
                </p>

                {/* Order Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-[#3B2305] mb-2">What's Next?</h3>
                    <ul className="text-sm text-gray-600 space-y-1 text-left">
                        <li>• You'll receive an order confirmation email</li>
                        <li>• We'll notify you when your order is being prepared</li>
                        <li>• Track your order status in your account</li>
                        <li>• For pickup orders: We'll message you when ready</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link
                        href="/account/orders"
                        className="w-full bg-[#3B2305] text-white py-3 px-4 rounded-lg hover:bg-[#4c2d08] transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingBagIcon className="w-5 h-5" />
                        View My Orders
                    </Link>
                    
                    <Link
                        href="/"
                        className="w-full border border-[#3B2305] text-[#3B2305] py-3 px-4 rounded-lg hover:bg-[#F9F5F0] transition-colors flex items-center justify-center gap-2"
                    >
                        <HomeIcon className="w-5 h-5" />
                        Continue Shopping
                    </Link>
                </div>

                {/* Support Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Need help? Contact us at{' '}
                        <a href="mailto:hello@wisestyleshop.com" className="text-[#3B2305] hover:underline">
                            hello@wisestyleshop.com
                        </a>
                        {' '}or{' '}
                        <a href="tel:+2348148331000" className="text-[#3B2305] hover:underline">
                            +234 814 833 1000
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
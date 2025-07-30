'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
    ArrowLeft, 
    Package, 
    RotateCcw, 
    Clock, 
    CheckCircle, 
    XCircle,
    Plus,
    Calendar,
    Truck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReturnRequest {
    id: string;
    orderId: string;
    orderNumber: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    reason: string;
    description: string;
    items: {
        id: string;
        productName: string;
        productImage: string;
        quantity: number;
        price: number;
    }[];
    createdAt: string;
    refundAmount: number;
}

export default function ReturnsPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'returns' | 'policy'>('returns');

    const { user, isLoading } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && !user) {
            router.push('/sign-in');
            return;
        }

        if (mounted && user) {
            fetchReturns();
        }
    }, [user, router, mounted, isLoading]);

    const fetchReturns = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/api/returns/my-returns`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReturns(Array.isArray(data) ? data : []);
            } else {
                setReturns([]);
            }
        } catch (error) {
            console.error('Error fetching returns:', error);
            setReturns([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'APPROVED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'REJECTED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'COMPLETED':
                return <CheckCircle className="w-5 h-5 text-blue-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/profile" className="flex items-center text-gray-600">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span>Back</span>
                        </Link>
                        <h1 className="text-lg font-semibold text-gray-900">Returns & Exchanges</h1>
                        <div className="w-16"></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-md mx-auto px-4">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('returns')}
                            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                                activeTab === 'returns'
                                    ? 'border-[#3B2305] text-[#3B2305]'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            My Returns
                        </button>
                        <button
                            onClick={() => setActiveTab('policy')}
                            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                                activeTab === 'policy'
                                    ? 'border-[#3B2305] text-[#3B2305]'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            Return Policy
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto">
                {activeTab === 'returns' ? (
                    <div className="bg-white">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305] mx-auto"></div>
                            </div>
                        ) : returns.length === 0 ? (
                            <div className="p-12 text-center">
                                <RotateCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No returns yet</h3>
                                <p className="text-gray-600 mb-6">
                                    You haven't requested any returns or exchanges yet.
                                </p>
                                <Link
                                    href="/orders"
                                    className="bg-[#3B2305] text-white px-6 py-3 rounded-lg hover:bg-[#4c2d08] transition-colors inline-block"
                                >
                                    View Orders
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {returns.map((returnRequest) => (
                                    <div key={returnRequest.id} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    Return #{returnRequest.id.slice(0, 8)}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Order #{returnRequest.orderNumber}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(returnRequest.createdAt)}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnRequest.status)}`}>
                                                {getStatusIcon(returnRequest.status)}
                                                <span className="ml-1">{returnRequest.status}</span>
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {returnRequest.items.map((item) => (
                                                <div key={item.id} className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={item.productImage || '/images/placeholder.png'}
                                                            alt={item.productName}
                                                            width={48}
                                                            height={48}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.productName}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            Qty: {item.quantity} • ₦{item.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-900 mb-1">Reason:</p>
                                            <p className="text-sm text-gray-600">{returnRequest.reason}</p>
                                            {returnRequest.description && (
                                                <>
                                                    <p className="text-sm font-medium text-gray-900 mt-2 mb-1">Description:</p>
                                                    <p className="text-sm text-gray-600">{returnRequest.description}</p>
                                                </>
                                            )}
                                        </div>

                                        {returnRequest.refundAmount > 0 && (
                                            <div className="mt-3 text-right">
                                                <p className="text-sm font-semibold text-green-600">
                                                    Refund Amount: ₦{returnRequest.refundAmount.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Return Policy Tab */
                    <div className="bg-white p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Return Policy</h3>
                                <div className="space-y-4 text-sm text-gray-600">
                                    <p>
                                        We want you to be completely satisfied with your purchase. If you're not happy with your order, 
                                        you can return it within <strong>30 days</strong> of delivery.
                                    </p>
                                    
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">What can be returned:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Items in original condition with tags attached</li>
                                            <li>Unworn and unwashed clothing</li>
                                            <li>Items in original packaging</li>
                                            <li>Accessories and shoes in original condition</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">What cannot be returned:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Underwear and intimate apparel</li>
                                            <li>Personalized or customized items</li>
                                            <li>Items damaged by normal wear</li>
                                            <li>Sale items (unless defective)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Return Process:</h4>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Contact our customer service team</li>
                                            <li>Receive return authorization and shipping label</li>
                                            <li>Package items securely with original tags</li>
                                            <li>Ship using provided return label</li>
                                            <li>Receive refund within 5-7 business days</li>
                                        </ol>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-900 mb-2">Need to return something?</h4>
                                        <p className="text-blue-800 mb-3">
                                            Contact our customer service team to start your return process.
                                        </p>
                                        <div className="space-y-2">
                                            <p className="text-blue-800">
                                                <strong>Email:</strong> returns@wisestyleshop.com
                                            </p>
                                            <p className="text-blue-800">
                                                <strong>Phone:</strong> +234 (0) 123 456 7890
                                            </p>
                                            <p className="text-blue-800">
                                                <strong>Hours:</strong> Mon-Fri 9AM-6PM WAT
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
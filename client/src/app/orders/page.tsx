'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
    ShoppingBag,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    ChevronRight,
    ArrowLeft,
    Calendar,
    MapPin,
    Phone,
    Mail,
    CreditCard
} from 'lucide-react';

interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    color: string;
    size: string;
    product: {
        id: string;
        name: string;
        image?: string;
        images?: string[];
    };
}

interface Order {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    total: number;
    shippingCost: number;
    shippingMethod: string;
    shippingAddress: any;
    billingAddress: any;
    email: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (!user) {
            router.push('/sign-in');
            return;
        }

        fetchOrders();
    }, [user, router]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'PROCESSING':
                return <Package className="w-5 h-5 text-blue-500" />;
            case 'SHIPPED':
                return <Truck className="w-5 h-5 text-purple-500" />;
            case 'DELIVERED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'CANCELLED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800';
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getProductImage = (item: OrderItem) => {
        if (item.product.images && item.product.images.length > 0) {
            return item.product.images[0];
        }
        return item.product.image || '/images/placeholder.png';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C97203] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (selectedOrder) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="flex items-center text-gray-600 hover:text-[#3B2305] mb-4"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Orders
                        </button>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#3B2305]">
                                    Order #{selectedOrder.id.slice(0, 8)}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Placed on {formatDate(selectedOrder.createdAt)}
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    <span className="ml-2">{selectedOrder.status}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-[#3B2305] mb-6">Order Items</h2>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <Image
                                                    src={getProductImage(item)}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {item.product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.color} • {item.size} • Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    ₦{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary & Details */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-[#3B2305] mb-4">Order Summary</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>₦{(selectedOrder.total - selectedOrder.shippingCost).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>₦{selectedOrder.shippingCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping Method</span>
                                        <span className="text-right">{selectedOrder.shippingMethod}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span>₦{selectedOrder.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-[#3B2305] mb-4">Contact Information</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{selectedOrder.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{selectedOrder.phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-[#3B2305] mb-4">Shipping Address</h2>
                                <div className="flex items-start space-x-3">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                    <div className="text-sm text-gray-600">
                                        <p>{selectedOrder.shippingAddress.name}</p>
                                        <p>{selectedOrder.shippingAddress.address}</p>
                                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                                        <p>{selectedOrder.shippingAddress.postal}</p>
                                        <p>{selectedOrder.shippingAddress.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#3B2305]">My Orders</h1>
                    <p className="text-gray-600 mt-2">Track and manage your orders</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center px-6 py-3 bg-[#C97203] text-white rounded-lg hover:bg-[#C97203]/90 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#3B2305]">
                                                Order #{order.id.slice(0, 8)}
                                            </h3>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <span className="text-sm text-gray-500 flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(order.createdAt)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="ml-2">{order.status}</span>
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex -space-x-2">
                                            {order.items.slice(0, 3).map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border-2 border-white"
                                                >
                                                    <Image
                                                        src={getProductImage(item)}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center">
                                                    <span className="text-xs text-gray-600">+{order.items.length - 3}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-[#3B2305]">
                                            ₦{order.total.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Total
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 
'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Users,
    DollarSign,
    TrendingUp,
    Package,
    Eye,
    MoreHorizontal,
    ArrowUpRight,
    Calendar,
    User
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/utils/api-client';
import { useAuthHook } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface DashboardStats {
    totalProducts: number;
    totalCustomers: number;
    totalRevenue: number;
    totalOrders: number;
}

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        image?: string;
        images?: Array<{ url: string }>;
    };
}

interface RecentOrder {
    id: string;
    total: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    user?: {
        firstName?: string;
        lastName?: string;
        email: string;
    };
    items: OrderItem[];
}

// Custom Naira Icon Component
const NairaIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M6 4v16" />
        <path d="M18 4v16" />
        <path d="M6 9h12" />
        <path d="M6 15h12" />
        <path d="M6 4l12 8" />
        <path d="M6 12l12 8" />
    </svg>
);

const statCards = [
    {
        name: 'Total Products',
        key: 'totalProducts' as keyof DashboardStats,
        icon: ShoppingBag,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
    },
    {
        name: 'Total Customers',
        key: 'totalCustomers' as keyof DashboardStats,
        icon: Users,
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
    },
    {
        name: 'Total Revenue',
        key: 'totalRevenue' as keyof DashboardStats,
        icon: NairaIcon,
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        prefix: '₦'
    },
    {
        name: 'Total Orders',
        key: 'totalOrders' as keyof DashboardStats,
        icon: Package,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600'
    },
];

const getStatusColor = (status: string) => {
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

export default function AdminDashboard() {
    const { isLoaded, isSignedIn, isAdmin } = useAuthHook();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        totalOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('Admin Dashboard: Auth state changed', { isLoaded, isSignedIn, isAdmin });

        if (!isLoaded) {
            console.log('Admin Dashboard: Auth not loaded yet');
            return;
        }

        if (!isSignedIn || !isAdmin) {
            console.log('Admin Dashboard: Not authorized, redirecting to sign-in');
            router.replace('/sign-in');
            return;
        }

        console.log('Admin Dashboard: Auth OK, fetching data');
        fetchDashboardData();
    }, [isLoaded, isSignedIn, isAdmin, router]);

    const fetchDashboardData = async () => {
        console.log('Admin Dashboard: Starting to fetch data');
        setError(null);

        try {
            console.log('Admin Dashboard: Making API calls...');
            const [statsResponse, ordersResponse] = await Promise.all([
                apiClient.get<DashboardStats>('/api/admin/stats'),
                apiClient.get<RecentOrder[]>('/api/admin/orders/recent')
            ]);

            console.log('Admin Dashboard: API responses received', { statsResponse, ordersResponse });
            setStats(statsResponse);
            setRecentOrders(ordersResponse);
        } catch (error) {
            console.error('Admin Dashboard: Error fetching data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getProductImage = (item: OrderItem): string => {
        if (item.product.image) {
            return item.product.image;
        }
        if (item.product.images && item.product.images.length > 0) {
            return item.product.images[0].url;
        }
        return '/images/tailored1.png'; // fallback image
    };

    // Early return for not loaded auth
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    // Early return for unauthorized users
    if (!isSignedIn || !isAdmin) {
        return null;
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-600">
                        Welcome back! Here's an overview of your store performance.
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setLoading(true);
                            fetchDashboardData();
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>

                {/* Stats cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white p-6 rounded-xl shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent orders skeleton */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="divide-y">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-4 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-1 text-sm sm:text-base text-gray-600">
                    Welcome back! Here's an overview of your store performance.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {statCards.map((card) => {
                    const IconComponent = card.icon;
                    const value = stats[card.key];
                    const displayValue = card.prefix ? `${card.prefix}${formatCurrency(value)}` : value.toLocaleString();

                    return (
                        <div
                            key={card.name}
                            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{card.name}</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                                        {displayValue}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                                    <IconComponent className={`h-6 w-6 ${card.textColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <Link
                            href="/admin/orders"
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            View all orders
                            <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Orders will appear here once customers start purchasing.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="p-4 sm:px-6 sm:py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                Order #{order.id.slice(-8).toUpperCase()}
                                            </p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center text-xs sm:text-sm text-gray-500 space-x-4">
                                                <span className="flex items-center">
                                                    <User className="h-3 w-3 mr-1" />
                                                    {order.user?.firstName && order.user?.lastName
                                                        ? `${order.user.firstName} ${order.user.lastName}`
                                                        : order.user?.email || 'Guest'}
                                                </span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                            </div>

                                            {/* Order Items Preview */}
                                            <div className="flex items-center space-x-2 overflow-x-auto">
                                                {order.items.slice(0, 3).map((item) => (
                                                    <div key={item.id} className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 min-w-0">
                                                        <img
                                                            src={getProductImage(item)}
                                                            alt={item.product.name}
                                                            className="w-8 h-8 object-cover rounded flex-shrink-0"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = '/images/tailored1.png';
                                                            }}
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-medium text-gray-900 truncate max-w-20">
                                                                {item.product.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                ×{item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="text-xs text-gray-500 whitespace-nowrap">
                                                        +{order.items.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                                        <span className="text-lg font-semibold text-gray-900">
                                            ₦{formatCurrency(order.total)}
                                        </span>
                                        <Link
                                            href={`/admin/orders`}
                                            className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View order</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Link
                    href="/admin/products/new"
                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
                >
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                <ShoppingBag className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                Add New Product
                            </p>
                            <p className="text-sm text-gray-500">Create a new product listing</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/admin/orders"
                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all"
                >
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                                Manage Orders
                            </p>
                            <p className="text-sm text-gray-500">View and update order status</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/admin/customers"
                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all sm:col-span-2 lg:col-span-1"
                >
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                View Customers
                            </p>
                            <p className="text-sm text-gray-500">Manage customer accounts</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
} 
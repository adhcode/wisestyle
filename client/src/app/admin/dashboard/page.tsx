'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuthHook } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Users, ShoppingBag, DollarSign, TrendingUp, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardData {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Array<{
        id: string;
        total: number;
        createdAt: string;
    }>;
    topProducts: Array<{
        id: string;
        name: string;
        category: string;
        price: number;
    }>;
}

const defaultDashboardData: DashboardData = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: []
};

export default function DashboardPage() {
    const { getDashboardData } = useAdmin();
    const { isLoaded, isSignedIn, isAdmin } = useAuthHook();
    const router = useRouter();
    const [data, setData] = useState<DashboardData>(defaultDashboardData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn || !isAdmin) {
            router.replace('/sign-in');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await getDashboardData() as DashboardData;
                const safeData: DashboardData = {
                    totalUsers: Number(response?.totalUsers) || 0,
                    totalProducts: Number(response?.totalProducts) || 0,
                    totalOrders: Number(response?.totalOrders) || 0,
                    totalRevenue: Number(response?.totalRevenue) || 0,
                    recentOrders: Array.isArray(response?.recentOrders) ? response.recentOrders : [],
                    topProducts: Array.isArray(response?.topProducts) ? response.topProducts : []
                };
                setData(safeData);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [getDashboardData, isLoaded, isSignedIn, isAdmin, router]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
        );
    }

    if (!isSignedIn || !isAdmin) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 bg-red-50 p-4 rounded-md">
                {error}
            </div>
        );
    }

    // Format currency with fallback
    const formatCurrency = (amount: number | undefined | null): string => {
        if (amount === undefined || amount === null) return '$0.00';
        return `$${Number(amount).toFixed(2)}`;
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-black">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Last updated: {new Date().toLocaleString()}</p>
                </div>
            </div>

            {/* Stats Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-xl sm:text-2xl font-bold text-black mt-1">{data.totalUsers}</p>
                            <div className="flex items-center mt-2 text-green-600 text-sm">
                                <ArrowUp className="h-4 w-4 mr-1" />
                                <span>12% from last month</span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Products</p>
                            <p className="text-xl sm:text-2xl font-bold text-black mt-1">{data.totalProducts}</p>
                            <div className="flex items-center mt-2 text-green-600 text-sm">
                                <ArrowUp className="h-4 w-4 mr-1" />
                                <span>8% from last month</span>
                            </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <ShoppingBag className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <p className="text-xl sm:text-2xl font-bold text-black mt-1">{data.totalOrders}</p>
                            <div className="flex items-center mt-2 text-red-600 text-sm">
                                <ArrowDown className="h-4 w-4 mr-1" />
                                <span>3% from last month</span>
                            </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-xl sm:text-2xl font-bold text-black mt-1">{formatCurrency(data.totalRevenue)}</p>
                            <div className="flex items-center mt-2 text-green-600 text-sm">
                                <ArrowUp className="h-4 w-4 mr-1" />
                                <span>15% from last month</span>
                            </div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-full">
                            <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Mobile Tabs */}
            <div className="sm:hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-2 text-sm font-medium ${activeTab === 'orders' ? 'text-black border-b-2 border-black' : 'text-gray-500'
                            }`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Recent Orders
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium ${activeTab === 'products' ? 'text-black border-b-2 border-black' : 'text-gray-500'
                            }`}
                        onClick={() => setActiveTab('products')}
                    >
                        Top Products
                    </button>
                </div>
            </div>

            {/* Recent Orders and Top Products - Mobile Optimized */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className={`p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 ${activeTab === 'products' ? 'sm:block hidden' : ''}`}>
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-lg font-semibold text-black">Recent Orders</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View All
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {data.recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                            >
                                <div>
                                    <p className="font-medium text-black">Order #{order.id}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-black">{formatCurrency(order.total)}</p>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className={`p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 ${activeTab === 'orders' ? 'sm:block hidden' : ''}`}>
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-lg font-semibold text-black">Top Products</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View All
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {data.topProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
                                onClick={() => router.push(`/admin/products/${product.id}`)}
                            >
                                <div>
                                    <p className="font-medium text-black">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-black">{formatCurrency(product.price)}</p>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        ))}
                </div>
            </Card>
            </div>
        </div>
    );
} 
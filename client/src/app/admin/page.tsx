'use client';

import { Card } from "@/components/ui/card";
import { ShoppingBag, Users, DollarSign, Package, ArrowUpRight, ArrowDownRight, Plus, Settings, BarChart, TrendingUp, TrendingDown, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns';
import { useAdmin } from "@/hooks/useAdmin";
import { useAuthHook } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface DashboardData {
    stats: {
        totalProducts: number;
        totalOrders: number;
        totalUsers: number;
        totalRevenue: number;
    };
    recentOrders: Array<{
        id: string;
        total: number;
        status: string;
        createdAt: string;
        user: {
            name: string;
            email: string;
        };
    }>;
    recentUsers: Array<{
        id: string;
        name: string;
        email: string;
        createdAt: string;
    }>;
    topProducts: Array<{
        id: string;
        name: string;
        totalSold: number;
        revenue: number;
    }>;
    orderStatus: {
        PENDING: number;
        PROCESSING: number;
        COMPLETED: number;
        CANCELLED: number;
    };
}

const stats = [
    { name: 'Total Products', icon: ShoppingBag, href: '/admin/products', color: 'bg-blue-500' },
    { name: 'Total Orders', icon: Package, href: '/admin/orders', color: 'bg-green-500' },
    { name: 'Total Users', icon: Users, href: '/admin/users', color: 'bg-purple-500' },
    { name: 'Total Revenue', icon: DollarSign, href: '/admin/orders', color: 'bg-orange-500' },
];

const quickActions = [
    { name: 'Add Product', icon: Plus, href: '/admin/products/new', color: 'bg-blue-500' },
    { name: 'View Orders', icon: Package, href: '/admin/orders', color: 'bg-green-500' },
    { name: 'Manage Users', icon: Users, href: '/admin/users', color: 'bg-purple-500' },
    { name: 'Settings', icon: Settings, href: '/admin/settings', color: 'bg-gray-500' },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export default function AdminDashboard() {
    const { getDashboardData } = useAdmin();
    const { isSignedIn, isAdmin, isLoaded } = useAuthHook();
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!isLoaded || !isSignedIn || !isAdmin) {
                return;
            }

            try {
                if (!data) {
                    const dashboardData = await getDashboardData();
                    setData(dashboardData as DashboardData);
                }
            } catch (err) {
                console.error('Error fetching dashboard:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isLoaded, isSignedIn, isAdmin, getDashboardData, data]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!isSignedIn || !isAdmin) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-600">No data available</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Welcome to your admin dashboard. Here's an overview of your store.
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action) => (
                    <Link key={action.name} href={action.href}>
                        <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-0">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-lg ${action.color} bg-opacity-10`}>
                                    <action.icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')}`} />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{action.name}</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Link key={stat.name} href={stat.href}>
                        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {index === 0 ? data.stats.totalProducts :
                                            index === 1 ? data.stats.totalOrders :
                                                index === 2 ? data.stats.totalUsers :
                                                    formatCurrency(data.stats.totalRevenue)
                                        }
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Order Status Distribution */}
                <Card className="p-6 border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
                        <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {Object.entries(data.orderStatus || {}).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <span className="text-sm font-medium text-gray-600">{status}</span>
                                <span className="text-sm font-semibold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Top Selling Products */}
                <Card className="p-6 border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Top Selling Products</h2>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {(data.topProducts || []).map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.totalSold} units sold</p>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(product.revenue)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className="p-6 border-0 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                    <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                    {(data.recentOrders || []).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Order #{order.id.slice(0, 8)} by {order.user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(order.total)}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Recent Users */}
            <Card className="p-6 border-0 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
                    <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                    {(data.recentUsers || []).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <div className="text-xs text-gray-500">
                                Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
} 
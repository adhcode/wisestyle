'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuthHook } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Eye, Filter, ChevronDown, Calendar, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Order {
    id: string;
    userId: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export default function OrdersPage() {
    const { getOrders } = useAdmin();
    const { isLoaded, isSignedIn, isAdmin } = useAuthHook();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn || !isAdmin) {
            router.replace('/sign-in');
            return;
        }

        const fetchOrders = async () => {
            try {
                const data = await getOrders() as Order[];
                setOrders(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [getOrders, isLoaded, isSignedIn, isAdmin, router]);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

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

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-black">Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                        <Calendar className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
                    >
                        {viewMode === 'list' ? 'Card View' : 'List View'}
                    </button>
                </div>
            </div>

            {showFilters && (
                <Card className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black">
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Processing</option>
                                <option>Shipped</option>
                                <option>Delivered</option>
                                <option>Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black">
                                <option>All Time</option>
                                <option>Today</option>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Value</label>
                            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black">
                                <option>All Values</option>
                                <option>Under $50</option>
                                <option>$50 - $100</option>
                                <option>$100 - $200</option>
                                <option>Over $200</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black">
                                <option>Newest First</option>
                                <option>Oldest First</option>
                                <option>Highest Value</option>
                                <option>Lowest Value</option>
                            </select>
                        </div>
                    </div>
                </Card>
            )}

            {viewMode === 'list' ? (
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.items.length} items
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${order.total.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.map((order) => (
                        <Card
                            key={order.id}
                            className="p-4 hover:shadow-lg transition-shadow duration-200"
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Order #{order.id}</h3>
                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Items</span>
                                    <span className="text-gray-900">{order.items.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total</span>
                                    <span className="text-gray-900 font-medium">${order.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm text-gray-500">View Details</span>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 
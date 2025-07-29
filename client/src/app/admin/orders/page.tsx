'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuthHook } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Loader2,
    Search,
    Eye,
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronUp,
    User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { OrdersService, Order, OrderItem } from '@/services/orders.service';

// Types are now imported from the service

export default function OrdersPage() {
    const { getOrders } = useAdmin();
    const { isLoaded, isSignedIn, isAdmin } = useAuthHook();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'pickup' | 'shipping'>('all');

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn || !isAdmin) {
            router.replace('/sign-in');
            return;
        }

        fetchOrders();
    }, [isLoaded, isSignedIn, isAdmin, router]);

    const fetchOrders = async () => {
        try {
            const data = await OrdersService.getAllOrders();
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        setUpdatingStatus(orderId);
        try {
            await OrdersService.updateOrderStatus(orderId, status);
            await fetchOrders();
            toast.success(`Order status updated to ${status.toLowerCase()}`);
        } catch (err) {
            toast.error('Failed to update order status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const toggleOrderExpansion = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const filteredOrders = orders.filter(order => {
        // Text search filter
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.status.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Type filter
        const isPickupOrder = OrdersService.isPickupOrder(order);
        const matchesType = filterType === 'all' || 
            (filterType === 'pickup' && isPickupOrder) ||
            (filterType === 'shipping' && !isPickupOrder);
        
        return matchesSearch && matchesType;
    });

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'PENDING': return <Clock className="h-3 w-3" />;
            case 'PROCESSING': return <Package className="h-3 w-3" />;
            case 'SHIPPED': return <Truck className="h-3 w-3" />;
            case 'DELIVERED': return <CheckCircle className="h-3 w-3" />;
            case 'CANCELLED': return <XCircle className="h-3 w-3" />;
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
        switch (currentStatus) {
            case 'PROCESSING': return 'SHIPPED';
            case 'SHIPPED': return 'DELIVERED';
            default: return null;
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>

                {/* Search skeleton */}
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>

                {/* Orders skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!isSignedIn || !isAdmin) return null;

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Orders</h3>
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchOrders} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders Management</h1>
                    <p className="text-gray-600 mt-1">Manage customer orders and track shipments ({filteredOrders.length} orders)</p>
                </div>
            </div>

            {/* Pickup Orders Alert */}
            {(() => {
                const readyPickupOrders = orders.filter(order => 
                    OrdersService.isPickupOrder(order) && order.status === 'PROCESSING'
                );
                return readyPickupOrders.length > 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-green-800 mb-1">
                                    {readyPickupOrders.length} Pickup Order{readyPickupOrders.length !== 1 ? 's' : ''} Ready for Collection
                                </h3>
                                <p className="text-xs text-green-700 mb-2">
                                    The following orders are ready for customer pickup:
                                </p>
                                <div className="space-y-1">
                                    {readyPickupOrders.slice(0, 3).map(order => (
                                        <div key={order.id} className="text-xs text-green-700">
                                            • Order #{order.id.slice(-8).toUpperCase()} - {OrdersService.getPickupLocation(order)}
                                        </div>
                                    ))}
                                    {readyPickupOrders.length > 3 && (
                                        <div className="text-xs text-green-600">
                                            ...and {readyPickupOrders.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null;
            })()}

            {/* Order Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{orders.length}</p>
                            <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                {OrdersService.getPickupOrders(orders).length}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">Pickup Orders</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                {OrdersService.getShippingOrders(orders).length}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">Shipping Orders</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search orders by ID, email, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 py-2.5 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
                
                {/* Filter buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            filterType === 'all'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setFilterType('pickup')}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                            filterType === 'pickup'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Pickup Orders</span>
                        <span className="sm:hidden">Pickup</span>
                    </button>
                    <button
                        onClick={() => setFilterType('shipping')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                            filterType === 'shipping'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <Truck className="h-4 w-4" />
                        Shipping Orders
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {filteredOrders.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery ? 'No orders found' : 'No orders yet'}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery
                            ? 'Try adjusting your search terms.'
                            : 'Orders will appear here when customers make purchases.'
                        }
                    </p>
                </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Order Summary */}
                        <div
                            className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleOrderExpansion(order.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            Order #{order.id.slice(-8).toUpperCase()}
                                        </h3>
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                        {/* Pickup indicator */}
                                        {OrdersService.isPickupOrder(order) && (
                                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                <MapPin className="h-3 w-3" />
                                                PICKUP
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-1 sm:gap-4">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span className="truncate">
                                                {order.user ?
                                                    `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email :
                                                    order.email
                                                }
                                            </span>
                                        </div>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-4">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">₦{Number(order.total).toLocaleString('en-NG')}</p>
                                    </div>
                                    <div className="text-gray-400">
                                        {expandedOrderId === order.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Order Details */}
                        {expandedOrderId === order.id && (
                            <div className="border-t border-gray-100 bg-gray-50">
                                <div className="p-4 sm:p-6 space-y-6">
                                    {/* Shipping Method & Customer Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Shipping Method */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                {OrdersService.isPickupOrder(order) ? (
                                                    <MapPin className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Truck className="h-4 w-4" />
                                                )}
                                                Delivery Method
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className={`p-2 rounded-lg border ${
                                                    OrdersService.isPickupOrder(order)
                                                        ? 'bg-green-50 border-green-200 text-green-800' 
                                                        : 'bg-blue-50 border-blue-200 text-blue-800'
                                                }`}>
                                                    <p className="font-medium">{order.shippingMethod}</p>
                                                    <p className="text-xs mt-1">
                                                        Cost: ₦{Number(order.shippingCost).toLocaleString('en-NG')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                <Mail className="h-4 w-4" /> Contact Information
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3 text-gray-400" />
                                                    <span>{order.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3 text-gray-400" />
                                                    <span>{order.phone}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            {/* Check if this is a pickup order */}
                                            {OrdersService.isPickupOrder(order) ? (
                                                <>
                                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                                                            <MapPin className="h-3 w-3 text-green-600" />
                                                        </div>
                                                        <span className="text-green-700">Pickup Location</span>
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                                            PICKUP ORDER
                                                        </span>
                                                    </h4>
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                        <div className="text-sm text-green-800 space-y-1">
                                                            <p className="font-medium">{OrdersService.getPickupLocation(order)}</p>
                                                            <p className="text-green-700">{OrdersService.getPickupAddress(order)}</p>
                                                            <div className="mt-2 pt-2 border-t border-green-200">
                                                                <p className="text-xs text-green-600 font-medium">
                                                                    ⚠️ Customer will collect from this location
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                        <Truck className="h-4 w-4" /> Shipping Address
                                                    </h4>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p>{order.shippingAddress.address}</p>
                                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                                        <p>{order.shippingAddress.postal}</p>
                                                        <p>{order.shippingAddress.country}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Package className="h-4 w-4" /> Order Items
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                    <img
                                                        src={item.product.image || item.product.images?.[0]?.url || '/images/tailored1.png'}
                                                        alt={item.product.name}
                                                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/images/tailored1.png';
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                                                            <span>Qty: {item.quantity}</span>
                                                            <span>₦{Number(item.price).toLocaleString('en-NG')} each</span>
                                                            {(item.color || item.size) && (
                                                                <span className="text-xs">
                                                                    {item.color && `${item.color}`}
                                                                    {item.color && item.size && ' • '}
                                                                    {item.size && `Size ${item.size}`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">
                                                            ₦{Number(item.price * item.quantity).toLocaleString('en-NG')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status Management */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Status Management</h4>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="font-medium">Current: {order.status}</span>
                                            </div>

                                            {/* Special handling for pickup orders */}
                                            {OrdersService.isPickupOrder(order) && order.status === 'PROCESSING' && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-green-800">Pickup Order Ready</p>
                                                            <p className="text-xs text-green-700 mt-1">
                                                                Prepare items for customer pickup. Mark as "DELIVERED" when customer collects.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {getNextStatus(order.status) && (
                                                <Button
                                                    onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                                                    disabled={updatingStatus === order.id}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                    size="sm"
                                                >
                                                    {updatingStatus === order.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        getStatusIcon(getNextStatus(order.status)!)
                                                    )}
                                                    <span className="ml-1">
                                                        {updatingStatus === order.id ?
                                                            'Updating...' :
                                                            OrdersService.isPickupOrder(order) && getNextStatus(order.status) === 'DELIVERED' ?
                                                                'Mark as Collected' :
                                                                `Mark as ${getNextStatus(order.status)}`
                                                        }
                                                    </span>
                                                </Button>
                                            )}

                                            {order.status === 'DELIVERED' && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800">
                                                        {OrdersService.isPickupOrder(order) ? 'Order collected' : 'Order completed'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 
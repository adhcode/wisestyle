'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Search,
    User,
    Mail,
    Shield,
    Calendar,
    MoreVertical,
    Edit,
    Trash2,
    UserPlus,
    Filter,
    Users,
    CheckCircle,
    XCircle
} from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'USER';
    createdAt: string;
    isEmailVerified: boolean;
    totalOrders?: number;
    totalSpent?: number;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'date'>('date');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }

            const data = await response.json();
            setCustomers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedCustomers = customers
        .filter(customer => {
            const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
            const matchesSearch =
                fullName.includes(searchQuery.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = roleFilter === 'ALL' || customer.role === roleFilter;

            return matchesSearch && matchesRole;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    const nameA = `${a.firstName || ''} ${a.lastName || ''}`;
                    const nameB = `${b.firstName || ''} ${b.lastName || ''}`;
                    return nameA.localeCompare(nameB);
                case 'email':
                    return a.email.localeCompare(b.email);
                case 'date':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    const handleDeleteCustomer = async (customerId: string) => {
        if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete customer');
            }

            setCustomers(customers.filter(c => c.id !== customerId));
            toast.success('Customer deleted successfully');
        } catch (err) {
            toast.error('Failed to delete customer');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>

                {/* Search skeleton */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Cards skeleton */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="mt-1 text-sm text-gray-600">Manage customer accounts and information</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="text-red-600">
                        <XCircle className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">Error loading customers</p>
                        <p className="text-sm mt-1 text-gray-500">{error}</p>
                        <Button
                            onClick={fetchCustomers}
                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage customer accounts and information ({filteredAndSortedCustomers.length} customers)
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Customer
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search customers by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Mobile filter toggle */}
                    <div className="sm:hidden">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters {showFilters ? '▲' : '▼'}
                        </button>
                    </div>

                    {/* Filters */}
                    <div className={`flex flex-col sm:flex-row gap-4 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="USER">Users</option>
                            <option value="ADMIN">Admins</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'date')}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="name">Sort by Name</option>
                            <option value="email">Sort by Email</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Empty state */}
            {filteredAndSortedCustomers.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">
                        {searchQuery || roleFilter !== 'ALL' ? 'No customers found' : 'No customers yet'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {searchQuery || roleFilter !== 'ALL'
                            ? 'Try adjusting your search terms or filters.'
                            : 'Customer accounts will appear here once users register.'
                        }
                    </p>
                </div>
            )}

            {/* Customers Grid */}
            {filteredAndSortedCustomers.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredAndSortedCustomers.map((customer) => (
                        <Card key={customer.id} className="p-6 hover:shadow-md transition-shadow border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1 min-w-0">
                                    <div className="flex-shrink-0 p-3 bg-blue-50 rounded-full">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <h3 className="text-base font-medium text-gray-900 truncate">
                                                {customer.firstName || 'No name'} {customer.lastName || ''}
                                            </h3>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${customer.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {customer.role}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{customer.email}</span>
                                                {customer.isEmailVerified && (
                                                    <CheckCircle className="w-4 h-4 ml-2 text-green-600 flex-shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="text-xs">
                                                    Joined {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            {customer.totalOrders !== undefined && (
                                                <div className="text-blue-600 font-medium text-xs">
                                                    {customer.totalOrders} orders • ₦{customer.totalSpent || 0} spent
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-200 text-gray-600 hover:bg-gray-50 p-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    {customer.role !== 'ADMIN' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteCustomer(customer.id)}
                                            className="border-red-200 text-red-600 hover:bg-red-50 p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 
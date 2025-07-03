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
    Filter
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
                <div>
                    <h1 className="text-2xl font-bold text-[#3B2305]">Customers</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage customer accounts and information</p>
                </div>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B2305]" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#3B2305]">Customers</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage customer accounts and information</p>
                </div>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-red-600 text-center">
                        <p className="text-lg font-medium">Error loading customers</p>
                        <p className="text-sm mt-1">{error}</p>
                        <Button
                            onClick={fetchCustomers}
                            className="mt-4 bg-[#3B2305] hover:bg-[#2A1804]"
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
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#3B2305]">Customers</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage customer accounts and information ({filteredAndSortedCustomers.length} customers)
                    </p>
                </div>
                <Button className="bg-[#3B2305] hover:bg-[#2A1804]">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Customer
                </Button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search customers by name or email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                >
                    <option value="ALL">All Roles</option>
                    <option value="USER">Users</option>
                    <option value="ADMIN">Admins</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'date')}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                </select>
            </div>

            {/* Customers Grid */}
            {filteredAndSortedCustomers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {filteredAndSortedCustomers.map((customer) => (
                        <Card key={customer.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className="p-3 bg-[#F9F5F0] rounded-full">
                                        <User className="w-6 h-6 text-[#3B2305]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-medium text-[#3B2305] truncate">
                                                {customer.firstName || 'No name'} {customer.lastName || ''}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {customer.role}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <p className="flex items-center">
                                                <Mail className="w-4 h-4 mr-2" />
                                                <span className="truncate">{customer.email}</span>
                                                {customer.isEmailVerified && (
                                                    <span className="ml-2 text-green-600">✓</span>
                                                )}
                                            </p>
                                            <p className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Joined {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                                            </p>
                                            {customer.totalOrders !== undefined && (
                                                <p className="text-[#3B2305] font-medium">
                                                    {customer.totalOrders} orders • ${customer.totalSpent || 0} spent
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-[#3B2305] text-[#3B2305] hover:bg-[#F9F5F0]"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    {customer.role !== 'ADMIN' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteCustomer(customer.id)}
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No customers found</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {searchQuery || roleFilter !== 'ALL'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first customer'
                        }
                    </p>
                </div>
            )}
        </div>
    );
} 
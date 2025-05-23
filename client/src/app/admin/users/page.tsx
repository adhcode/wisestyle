'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, User, Mail, Shield } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    createdAt: string;
    lastLoginAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/admin/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage user accounts and permissions
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="p-6">
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-blue-50 rounded-full">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 flex items-center">
                                    <Mail className="w-4 h-4 mr-1" />
                                    {user.email}
                                </p>
                                <div className="mt-4 space-y-1 text-sm text-gray-500">
                                    <p>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</p>
                                    {user.lastLoginAt && (
                                        <p>Last login {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                                Edit
                            </Button>
                            {user.role !== 'ADMIN' && (
                                <Button variant="destructive" size="sm">
                                    Delete
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No users found</p>
                </div>
            )}
        </div>
    );
} 
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, Heart, Settings, LogOut, Edit, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function ProfilePage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    // Safely handle auth context
    let user = null;
    let logout = null;

    try {
        const authContext = useAuth();
        user = authContext?.user;
        logout = authContext?.logout;
    } catch (error) {
        // Auth context not available during SSR/SSG
        console.log('Auth context not available during build');
    }

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !user) {
            router.push('/sign-in');
            return;
        }

        if (mounted && user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
            });
        }
    }, [user, router, mounted]);

    // Don't render until mounted to prevent hydration issues
    if (!mounted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    const handleSave = async () => {
        setLoading(true);
        try {
            // Here you would make an API call to update user profile
            // const response = await fetch('/api/user/profile', {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });

            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            if (logout) {
                await logout();
            }
            router.push('/');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-[#F9F5F0] py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-[#3B2305] rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#3B2305]">My Profile</h1>
                            <p className="text-[#3B2305] opacity-75">Welcome back, {user.firstName || user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <nav className="space-y-2">
                                <Link
                                    href="/profile"
                                    className="flex items-center space-x-3 px-4 py-3 text-[#3B2305] bg-[#F9F5F0] rounded-lg font-medium"
                                >
                                    <User className="w-5 h-5" />
                                    <span>Profile</span>
                                </Link>
                                <Link
                                    href="/orders"
                                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-[#3B2305] hover:bg-[#F9F5F0] rounded-lg transition-colors"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    <span>Orders</span>
                                </Link>
                                <Link
                                    href="/wishlist"
                                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-[#3B2305] hover:bg-[#F9F5F0] rounded-lg transition-colors"
                                >
                                    <Heart className="w-5 h-5" />
                                    <span>Wishlist</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-[#3B2305]">Personal Information</h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-2 px-4 py-2 border border-[#D1B99B] text-[#3B2305] rounded-lg hover:bg-[#F9F5F0] transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span>Edit</span>
                                    </button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex items-center space-x-2 px-4 py-2 bg-[#3B2305] text-white rounded-lg hover:bg-[#4c2d08] transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>{loading ? 'Saving...' : 'Save'}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    firstName: user.firstName || '',
                                                    lastName: user.lastName || '',
                                                    email: user.email || '',
                                                });
                                            }}
                                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#3B2305] mb-2">
                                        First Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                            placeholder="Enter your first name"
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-3">{user.firstName || 'Not provided'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#3B2305] mb-2">
                                        Last Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                            placeholder="Enter your last name"
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-3">{user.lastName || 'Not provided'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#3B2305] mb-2">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C97203] focus:border-transparent"
                                            placeholder="Enter your email"
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-3">{user.email}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-6">
                            <h3 className="text-lg font-semibold text-[#3B2305] mb-4">Account Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/change-password"
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Settings className="w-5 h-5 text-gray-600" />
                                        <span className="text-gray-900">Change Password</span>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </Link>
                                <Link
                                    href="/orders"
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <ShoppingBag className="w-5 h-5 text-gray-600" />
                                        <span className="text-gray-900">View Order History</span>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </Link>
                                <Link
                                    href="/wishlist"
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Heart className="w-5 h-5 text-gray-600" />
                                        <span className="text-gray-900">Manage Wishlist</span>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
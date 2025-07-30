'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    User, 
    ShoppingBag, 
    MapPin, 
    CreditCard, 
    RotateCcw, 
    HelpCircle,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const { user, logout, isLoading } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && !user) {
            router.push('/sign-in');
            return;
        }
    }, [user, router, mounted, isLoading]);

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

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    const getInitials = (firstName?: string, lastName?: string, email?: string) => {
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        if (firstName) {
            return firstName.slice(0, 2).toUpperCase();
        }
        if (email) {
            return email.slice(0, 2).toUpperCase();
        }
        return 'U';
    };

    const getDisplayName = (firstName?: string, lastName?: string, email?: string) => {
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        }
        if (firstName) {
            return firstName;
        }
        return email?.split('@')[0] || 'User';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-md mx-auto px-4 py-6">
                    <div className="text-center">
                        <h1 className="text-xl font-semibold text-gray-900 mb-8">MY ACCOUNT</h1>
                        
                        {/* User Avatar and Info */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <span className="text-white text-xl font-semibold">
                                    {getInitials(user?.firstName, user?.lastName, user?.email)}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">Hi,</p>
                            <h2 className="text-lg font-medium text-gray-900">
                                {getDisplayName(user?.firstName, user?.lastName, user?.email)}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="max-w-md mx-auto bg-white">
                <div className="divide-y divide-gray-200">
                    <Link
                        href="/orders"
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <ShoppingBag className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-900 font-medium">My orders</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link
                        href="/returns"
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <RotateCcw className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-900 font-medium">Returns & exchanges</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link
                        href="/help"
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <HelpCircle className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-900 font-medium">Need help?</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link
                        href="/gift-cards"
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-900 font-medium">Gift cards & vouchers</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link
                        href="/my-details"
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <User className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-900 font-medium">My details</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link
                        href="/address-book"
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <MapPin className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-900 font-medium">Address book</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-between w-full px-6 py-4 hover:bg-red-50 transition-colors text-left"
                    >
                        <div className="flex items-center space-x-4">
                            <LogOut className="w-5 h-5 text-red-600" />
                            <span className="text-red-600 font-medium">Sign out</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-400" />
                    </button>
                </div>
            </div>
        </div>
    );
} 
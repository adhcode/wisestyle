'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Package
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', href: '/admin/orders', icon: Package },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FEFBF4]">
            {/* Mobile menu */}
            <div className="lg:hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
                    <Link href="/admin" className="text-xl font-semibold text-[#3B2305]">
                        Admin Dashboard
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-[#3B2305]"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="fixed inset-y-0 left-0 w-64 bg-white" onClick={e => e.stopPropagation()}>
                            <div className="flex flex-col h-full">
                                <div className="flex-1 px-2 py-4 space-y-1">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
                                                    ? 'bg-[#3B2305] text-white'
                                                    : 'text-[#3B2305] hover:bg-[#F9F5F0]'
                                                    }`}
                                            >
                                                <item.icon className="w-5 h-5 mr-3" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                                <div className="p-4 border-t">
                                    <button
                                        onClick={() => {/* Handle logout */ }}
                                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-[#3B2305] rounded-md hover:bg-[#F9F5F0]"
                                    >
                                        <LogOut className="w-5 h-5 mr-3" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:flex">
                <div className="fixed inset-y-0 flex w-64 flex-col">
                    <div className="flex flex-col flex-1 min-h-0 bg-white border-r">
                        <div className="flex flex-col flex-1 pt-5 pb-4">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <Link href="/admin" className="text-xl font-semibold text-[#3B2305]">
                                    Admin Dashboard
                                </Link>
                            </div>
                            <nav className="flex-1 px-2 mt-5 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
                                                ? 'bg-[#3B2305] text-white'
                                                : 'text-[#3B2305] hover:bg-[#F9F5F0]'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5 mr-3" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                        <div className="p-4 border-t">
                            <button
                                onClick={() => {/* Handle logout */ }}
                                className="flex items-center w-full px-4 py-2 text-sm font-medium text-[#3B2305] rounded-md hover:bg-[#F9F5F0]"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-1 pl-64">
                    <main className="flex-1 p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
} 
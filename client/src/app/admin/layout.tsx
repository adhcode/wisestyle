'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    ClipboardList,
    Settings,
    Menu,
    X,
    LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthHook } from '@/hooks/useAuth';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoaded, isSignedIn, isAdmin, signOut } = useAuthHook();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Handle authentication state
    useEffect(() => {
        if (isLoaded && (!isSignedIn || !isAdmin)) {
            router.replace('/sign-in');
        }
    }, [isLoaded, isSignedIn, isAdmin, router]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (!isSignedIn || !isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-black transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
                    <Link href="/admin/dashboard" className="text-xl font-bold text-white">
                        WiseStyle Admin
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200 ${pathname === item.href
                                    ? 'bg-white text-black'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon
                                className={`mr-4 h-6 w-6 transition-colors duration-200 ${pathname === item.href
                                        ? 'text-black'
                                        : 'text-gray-400 group-hover:text-white'
                                    }`}
                            />
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={signOut}
                        className="w-full flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                    >
                        <LogOut className="mr-4 h-6 w-6 text-gray-400 group-hover:text-white" />
                        Sign Out
                    </button>
                </nav>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="px-4 text-gray-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black lg:hidden transition-colors duration-200"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
} 
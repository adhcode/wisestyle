'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Package,
    ChevronRight,
    FolderTree
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
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
    const router = useRouter();
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            router.push('/sign-in');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile header */}
            <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-30">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">
                            {navigation.find(item => item.href === pathname)?.name || 'Admin'}
                        </h1>
                    </div>
                    <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View Store
                    </Link>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-25" onClick={closeMobileMenu} />
                    <div className="fixed top-0 left-0 bottom-0 w-80 max-w-xs bg-white shadow-xl transform transition-transform">
                        <div className="flex flex-col h-full">
                            {/* Mobile menu header */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">WiseStyle Admin</h2>
                                <button
                                    onClick={closeMobileMenu}
                                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Mobile navigation */}
                            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={closeMobileMenu}
                                            className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <item.icon className="w-5 h-5 mr-3" />
                                                {item.name}
                                            </div>
                                            {isActive && <ChevronRight className="w-4 h-4" />}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Mobile menu footer */}
                            <div className="p-4 border-t bg-gray-50">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 mr-3" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
                    {/* Desktop sidebar header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">WiseStyle</h1>
                        <Link href="/" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            View Store
                        </Link>
                    </div>

                    {/* Desktop navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop sidebar footer */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
} 
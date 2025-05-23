import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag } from 'lucide-react';

export default function Header() {
    const { totalItems, toggleCart } = useCart();

    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-xl font-semibold">
                        WiseStyle
                    </Link>
                    <nav className="flex items-center space-x-8">
                        <Link href="/products" className="text-gray-600 hover:text-gray-900">
                            Products
                        </Link>
                        <Link href="/categories" className="text-gray-600 hover:text-gray-900">
                            Categories
                        </Link>
                        <button
                            onClick={toggleCart}
                            className="relative text-gray-600 hover:text-gray-900"
                        >
                            <ShoppingBag className="w-6 h-6" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
} 
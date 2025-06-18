import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Category } from '@/types';
import CategoryMenu from '../navigation/CategoryMenu';
import MobileMenu from '../navigation/MobileMenu';

export default function Header() {
    const { items } = useCart();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/categories');
                const data = await response.json();
                // Filter to only get top-level categories (those with no parentId)
                const topLevelCategories = data.filter((category: Category) => !category.parentId);
                setCategories(topLevelCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <header className="border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <div className="lg:hidden">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-600"
                            aria-label="Open menu"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold text-gray-900">WiseStyle</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    {!isLoading && <CategoryMenu categories={categories} />}

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-600"
                            aria-label="Search"
                        >
                            <Search className="h-6 w-6" />
                        </button>

                        <Link
                            href="/account"
                            className="text-gray-500 hover:text-gray-600"
                            aria-label="Account"
                        >
                            <User className="h-6 w-6" />
                        </Link>

                        <Link
                            href="/cart"
                            className="text-gray-500 hover:text-gray-600 relative"
                            aria-label="Shopping cart"
                        >
                            <ShoppingBag className="h-6 w-6" />
                            {items.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {!isLoading && (
                <MobileMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    categories={categories}
                />
            )}
        </header>
    );
} 
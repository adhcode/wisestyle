'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchIcon, Heart, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLikes } from '@/contexts/LikesContext';
import { CategoryService } from '@/services/category.service';

// Define Category type for the tree
interface CategoryTree {
    id: string;
    name: string;
    slug: string;
    children?: CategoryTree[];
}

const headerCategorySlugs = ['shirts', 'native-wear', 'trousers', 'accessories', 'footwears'];

export default function Header() {
    const router = useRouter();
    const { totalItems } = useCart();
    const { state: { likedProducts } } = useLikes();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<CategoryTree[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

    // Search functionality
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef<HTMLDivElement>(null);

    // Load categories with persistent caching
    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Check cache first - use localStorage for persistent caching
                const cachedCategories = localStorage.getItem('header_categories');
                const cacheTimestamp = localStorage.getItem('header_categories_timestamp');
                const now = Date.now();
                const oneHour = 60 * 60 * 1000; // 1 hour cache

                if (cachedCategories && cacheTimestamp && (now - parseInt(cacheTimestamp)) < oneHour) {
                    // Load from cache immediately
                    const parsedCategories = JSON.parse(cachedCategories);
                    setCategories(parsedCategories);
                    return;
                }

                // Fetch from API if cache is empty or expired
                const data = await CategoryService.getCategoryTree();
                setCategories(data as CategoryTree[]);

                // Cache for next time
                localStorage.setItem('header_categories', JSON.stringify(data));
                localStorage.setItem('header_categories_timestamp', now.toString());
            } catch (error) {
                console.error('Error loading categories:', error);
                // Try to use any cached data even if expired
                const cachedCategories = localStorage.getItem('header_categories');
                if (cachedCategories) {
                    setCategories(JSON.parse(cachedCategories));
                }
            }
        };

        loadCategories();
    }, []);

    // Handle search functionality
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    // Handle click outside search to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        if (isSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        setOpenMobileDropdown(null);
    };

    const handleDropdown = (slug: string | null) => {
        setDropdownOpen(prev => (prev === slug ? null : slug));
    };

    return (
        <header className="bg-[#FFFCF8] py-4 sticky top-0 z-50">
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                <nav className="flex items-center w-full h-14">
                    {/* Hamburger (mobile only) */}
                    <div className="md:hidden flex items-center justify-center" style={{ width: 40 }}>
                        <button className="text-[#3B2305]" onClick={toggleMobileMenu}>
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                    {/* Logo */}
                    <div className="flex-1 flex items-center">
                        <Link href="/">
                            <h1 className="text-[#3B2305] text-2xl mb-2 md:mb-0 ml-[10px] md:ml-0 font-bold font-outfit">wisestyle</h1>
                        </Link>
                    </div>
                    {/* Icons */}
                    <div className="flex items-center justify-center md:ml-auto" style={{ width: 160 }}>
                        {/* Search with dropdown */}
                        <div className="relative" ref={searchRef}>
                            <button
                                className="text-[#3B2305] hover:text-[#C97203] mx-1"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                            >
                                <Image src="/images/icons/search.png" alt="Search" width={20} height={20} />
                            </button>

                            {/* Search Dropdown */}
                            {isSearchOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <form onSubmit={handleSearch} className="p-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search products..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C97203] focus:border-[#C97203]"
                                                autoFocus
                                            />
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-[#C97203] text-white rounded-md hover:bg-[#B56503] transition-colors"
                                            >
                                                Search
                                            </button>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-500">
                                            Popular searches: Agbada, Kaftan, Shirts, Accessories
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Wishlist with counter */}
                        <Link href="/wishlist" className="text-[#3B2305] hover:text-[#C97203] relative mx-1">
                            <Image src="/images/icons/wishlist.png" alt="Heart" width={20} height={20} />
                            {likedProducts.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {likedProducts.length > 9 ? '9+' : likedProducts.length}
                                </span>
                            )}
                        </Link>

                        {/* Cart with counter */}
                        <Link href="/cart" className="text-[#3B2305] hover:text-[#C97203] relative mx-1">
                            <Image src="/images/icons/cart.png" alt="Cart" width={20} height={20} />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#C97203] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {totalItems > 9 ? '9+' : totalItems}
                                </span>
                            )}
                        </Link>

                        <Link href="/profile" className="text-[#3B2305] hover:text-[#C97203] mx-1">
                            <Image src="/images/icons/profile-round.png" alt="User" width={20} height={20} />
                        </Link>
                    </div>
                </nav>

                {/* Desktop Navigation Links - centered */}
                <ul className="hidden md:flex items-center text-[14px] justify-center gap-2 text-[#3B2305] font-normal absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <li className="hidden lg:flex">
                        <Link href="/" className="px-2 py-2 hover:underline underline-offset-4 transition-all duration-150">Home</Link>
                    </li>
                    {categories
                        .filter(cat => headerCategorySlugs.includes(cat.slug))
                        .map((cat) => (
                            <li
                                key={cat.slug}
                                className="relative flex items-center px-2 py-2 whitespace-nowrap"
                                onMouseEnter={() => setDropdownOpen(cat.slug)}
                                onMouseLeave={() => setDropdownOpen(null)}
                            >
                                <Link
                                    href={cat.slug ? `/category/${cat.slug}` : '#'}
                                    className="flex items-center gap-1 w-full overflow-hidden"
                                >
                                    <span className="truncate">{cat.name}</span>
                                    {cat.children && cat.children.length > 0 && <ChevronDown className="w-4 h-4 ml-1" />}
                                </Link>
                                {/* Dropdown */}
                                {cat.children && cat.children.length > 0 && dropdownOpen === cat.slug && (
                                    <ul className="absolute left-0 top-full mt-2 bg-white border border-gray-100 rounded-lg shadow-xl min-w-[200px] z-50 py-2 animate-fade-in">
                                        {cat.children.map((child) => (
                                            <li key={child.slug}>
                                                <Link href={`/category/${child.slug}`} className="block px-5 py-2 text-[#3B2305] hover:bg-[#F9F5F0] rounded transition-colors">
                                                    {child.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    <li className="hidden lg:flex">
                        <Link href="/new-arrivals" className="px-2 py-2 hover:underline underline-offset-4 transition-all duration-150">New Arrivals</Link>
                    </li>
                    <li className="hidden lg:flex">
                        <Link href="/sales" className="px-2 py-2 hover:underline underline-offset-4 transition-all duration-150">Sales</Link>
                    </li>
                </ul>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 bg-[#FFFCF8] fixed inset-0 z-50 shadow-md h-screen overflow-y-auto">
                        <div className="flex justify-end mb-2">
                            <button onClick={toggleMobileMenu} className="text-[#3B2305] p-2">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col space-y-4 px-4">
                            {/* Mobile Search */}
                            <div className="px-4 py-2">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C97203] focus:border-[#C97203]"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#C97203] text-white rounded-md hover:bg-[#B56503] transition-colors"
                                    >
                                        Search
                                    </button>
                                </form>
                            </div>

                            {/* Mobile Navigation Links */}
                            <Link href="/" className="text-[#3B2305] text-base font-medium hover:text-[#C97203] px-4 py-3 rounded" onClick={toggleMobileMenu}>Home</Link>

                            {/* Mobile Wishlist with counter */}
                            <Link href="/wishlist" className="text-[#3B2305] text-base font-medium hover:text-[#C97203] px-4 py-3 rounded flex items-center justify-between" onClick={toggleMobileMenu}>
                                <span>Wishlist</span>
                                {likedProducts.length > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {likedProducts.length > 9 ? '9+' : likedProducts.length}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile Cart with counter */}
                            <Link href="/cart" className="text-[#3B2305] text-base font-medium hover:text-[#C97203] px-4 py-3 rounded flex items-center justify-between" onClick={toggleMobileMenu}>
                                <span>Cart</span>
                                {totalItems > 0 && (
                                    <span className="bg-[#C97203] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {totalItems > 9 ? '9+' : totalItems}
                                    </span>
                                )}
                            </Link>

                            {categories
                                .filter(cat => headerCategorySlugs.includes(cat.slug))
                                .map((cat) => (
                                    <div key={cat.slug} className="flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                className="text-[#3B2305] text-base font-medium hover:text-[#C97203] px-4 py-3 rounded flex-1 text-left"
                                                onClick={() => setOpenMobileDropdown(openMobileDropdown === cat.slug ? null : cat.slug)}
                                            >
                                                {cat.name}
                                            </button>
                                            {cat.children && cat.children.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="ml-2 text-[#3B2305]"
                                                    onClick={() => setOpenMobileDropdown(openMobileDropdown === cat.slug ? null : cat.slug)}
                                                >
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${openMobileDropdown === cat.slug ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                        {cat.children && cat.children.length > 0 && openMobileDropdown === cat.slug
                                            ? (
                                                <div className="ml-6 mt-1 flex flex-col">
                                                    {cat.children.map((child) => (
                                                        <Link
                                                            key={child.slug}
                                                            href={`/category/${child.slug}`}
                                                            className="text-[#3B2305] text-sm font-normal hover:text-[#C97203] py-2 px-5 rounded"
                                                            onClick={toggleMobileMenu}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )
                                            : null}
                                    </div>
                                ))}
                            <Link href="/new-arrivals" className="text-[#3B2305] text-base font-medium hover:text-[#C97203] px-4 py-3 rounded" onClick={toggleMobileMenu}>New Arrivals</Link>
                            <Link href="/sales" className="text-[#3B2305] text-base font-medium hover:text-[#C97203] px-4 py-3 rounded" onClick={toggleMobileMenu}>Sales</Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
} 
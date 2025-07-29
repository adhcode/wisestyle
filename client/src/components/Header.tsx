import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { categoryService } from '@/services/category.service';
import { ShoppingBag, Menu, X, ChevronDown, User } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const { user } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await categoryService.getAllHierarchical();
            setCategories(data as any[]);
        };
        fetchCategories();
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleCategories = () => setIsCategoriesOpen(!isCategoriesOpen);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center h-16 md:h-20">
                    {/* Hamburger (mobile only) */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#3B2305] focus:outline-none mr-2"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    {/* Logo - always left-aligned */}
                    <Link href="/" className="flex-shrink-0">
                        <img src="/images/logo.png" alt="WiseStyle" className="h-8 md:h-10" />
                    </Link>
                    {/* Spacer for mobile */}
                    <div className="flex-1 md:hidden" />
                    {/* Right-side icons (mobile: after logo, desktop: right) */}
                    <div className="flex items-center gap-x-4 ml-auto">
                        <Link href="/cart" className="text-gray-600 hover:text-[#3B2305]">
                            <ShoppingBag className="h-6 w-6" />
                        </Link>
                        <Link href={user ? "/account" : "/login"} className="text-gray-600 hover:text-[#3B2305]">
                            <User className="h-6 w-6" />
                        </Link>
                    </div>
                    {/* Desktop Navigation - Right-aligned */}
                    <nav className="hidden md:flex items-center space-x-8 ml-8">
                        <Link href="/" className={`text-sm font-medium ${pathname === '/' ? 'text-[#3B2305]' : 'text-gray-600 hover:text-[#3B2305]'}`}>Home</Link>
                        <div className="relative">
                            <button
                                onClick={toggleCategories}
                                className="flex items-center text-sm font-medium text-gray-600 hover:text-[#3B2305]"
                            >
                                Categories
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </button>
                            {isCategoriesOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/category/${category.slug}`}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsCategoriesOpen(false)}
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link href="/about" className={`text-sm font-medium ${pathname === '/about' ? 'text-[#3B2305]' : 'text-gray-600 hover:text-[#3B2305]'}`}>About</Link>
                        <Link href="/contact" className={`text-sm font-medium ${pathname === '/contact' ? 'text-[#3B2305]' : 'text-gray-600 hover:text-[#3B2305]'}`}>Contact</Link>
                    </nav>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                href="/"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/' ? 'text-[#3B2305] bg-gray-50' : 'text-gray-600 hover:text-[#3B2305] hover:bg-gray-50'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <div className="relative">
                                <button
                                    onClick={toggleCategories}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-[#3B2305] hover:bg-gray-50"
                                >
                                    Categories
                                </button>
                                {isCategoriesOpen && (
                                    <div className="pl-4 mt-1 space-y-1">
                                        {categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                href={`/category/${category.slug}`}
                                                className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-[#3B2305] hover:bg-gray-50"
                                                onClick={() => {
                                                    setIsCategoriesOpen(false);
                                                    setIsMenuOpen(false);
                                                }}
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Link
                                href="/about"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/about' ? 'text-[#3B2305] bg-gray-50' : 'text-gray-600 hover:text-[#3B2305] hover:bg-gray-50'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </Link>
                            <Link
                                href="/contact"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/contact' ? 'text-[#3B2305] bg-gray-50' : 'text-gray-600 hover:text-[#3B2305] hover:bg-gray-50'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
} 
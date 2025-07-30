'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronRight, SlidersHorizontal, ArrowDownWideNarrow } from 'lucide-react';
import { useLikes } from '@/contexts/LikesContext';
import { useCart } from '@/contexts/CartContext';
import { useState, useCallback, useRef } from 'react';
import { Product, CartItem } from '@/types/product';
import { Category } from '@/types';

interface CategoryClientProps {
    category: Category;
    initialProducts: Product[];
}

export default function CategoryClient({ category, initialProducts }: CategoryClientProps) {
    const [products, setProducts] = useState(initialProducts);
    const [loading, setLoading] = useState(false);
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const { state: { likedProducts }, toggleLike } = useLikes();
    const { addItem } = useCart();

    // Refs for debouncing
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce function to prevent multiple rapid API calls
    const debounce = useCallback((fn: Function, delay: number) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fn();
            debounceTimerRef.current = null;
        }, delay);
    }, []);

    // Sort products based on selected criteria
    const sortedProducts = useCallback(() => {
        if (!products.length) return [];

        const productsCopy = [...products];

        switch (sortBy) {
            case 'price-low-high':
                return productsCopy.sort((a, b) => a.price - b.price);
            case 'price-high-low':
                return productsCopy.sort((a, b) => b.price - a.price);
            case 'newest':
                return productsCopy.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB.getTime() - dateA.getTime();
                });
            case 'alphabetical':
                return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return productsCopy;
        }
    }, [products, sortBy]);

    // Handle likes with rate limit protection
    const handleToggleLike = async (productId: string) => {
        try {
            await toggleLike(productId);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleAddToCart = (product: Product) => {
        const cartItem: CartItem = {
            ...product,
            quantity: 1,
            selectedSize: product.sizes[0]?.value || '',
            selectedColor: product.colors[0]?.value || '',
            selectedColorName: product.colors[0]?.name,
            selectedImage: product.image
        };
        addItem(cartItem);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Rate limit error message */}
            {rateLimitError && (
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px] mt-4">
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {rateLimitError}
                    </div>
                </div>
            )}

            {/* Breadcrumb */}
            <div className="w-full bg-white mt-16 border-[#F4EFE8] font-outfit">
                <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-4 md:px-8 lg:px-[120px]">
                    <div className="flex items-center text-xs sm:text-sm text-[#3B2305] py-2 overflow-x-auto">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <Link href="/category" className="hover:underline">Categories</Link>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <span>{category.name}</span>
                    </div>
                </div>
            </div>

            {/* Category Banner */}
            <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-4 md:px-8 lg:px-[120px]">
                <div className="mb-6 sm:mb-8 text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-[400] text-[#1E1E1E] mb-2 mt-4 sm:mt-6 md:mt-8">{category.name}</h2>
                    {category.description && (
                        <p className="text-sm sm:text-base md:text-lg text-[#3B2305] max-w-3xl opacity-80">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Subcategories Section */}
            {category.children && category.children.length > 0 && (
                <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-4 md:px-8 lg:px-[120px] mb-6 sm:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {category.children.map((child) => (
                            <Link
                                key={child.id}
                                href={`/category/${child.slug}`}
                                className="block p-3 sm:p-4 bg-[#F9F5F0] rounded-lg hover:bg-[#F4EFE8] transition-colors active:bg-[#F4EFE8]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[#3B2305] font-medium text-sm sm:text-base truncate pr-2">{child.name}</span>
                                    <ChevronRight className="w-4 h-4 text-[#3B2305] flex-shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Product Grid Section */}
            <div className="py-6 sm:py-10 md:py-16">
                <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-4 md:px-8 lg:px-[120px]">
                    {/* Filters and Sort Options */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
                        <p className="text-[#3B2305] text-xs sm:text-sm md:text-base">
                            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                        </p>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                className="flex items-center gap-2 text-[#3B2305] text-xs sm:text-sm md:text-base hover:text-[#5a3c13] px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="sm:inline">Filters</span>
                            </button>

                            <div className="relative">
                                <div className="flex items-center gap-2 text-[#3B2305] cursor-pointer px-3 py-2 rounded-lg border border-gray-200 bg-white">
                                    <ArrowDownWideNarrow className="w-4 h-4" />
                                    <select
                                        className="appearance-none bg-transparent border-none text-xs sm:text-sm md:text-base focus:outline-none cursor-pointer pr-2"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price-low-high">Price: Low to High</option>
                                        <option value="price-high-low">Price: High to Low</option>
                                        <option value="alphabetical">Alphabetical</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {products.length === 0 ? (
                        <div className="text-center py-16 text-gray-600 bg-[#F9F5F0] rounded-lg p-8">
                            <h3 className="text-xl font-medium mb-2">No products found</h3>
                            <p>There are currently no products available in this category.</p>
                            <Link href="/category" className="mt-4 inline-block px-6 py-2 bg-[#3B2305] text-white rounded-md hover:bg-[#4c2d08] transition-colors">
                                Browse All Categories
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-6 sm:gap-y-8">
                            {sortedProducts().map((product) => (
                                <div key={product.id} className="group overflow-hidden w-full duration-200">
                                    {/* Mobile Layout - Using CSS Grid for perfect alignment */}
                                    <div className="md:hidden grid grid-rows-[auto_auto_auto_auto] h-full">
                                        {/* Row 1: Product Image */}
                                        <Link href={`/product/${product.slug}`} className="block">
                                            <div className="relative w-full aspect-[1/1] bg-[#F9F5F0] rounded-lg overflow-hidden">
                                                <Image
                                                    src={product.image || '/images/placeholder-product.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover object-center"
                                                    sizes="50vw"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleToggleLike(product.id);
                                                    }}
                                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                                                >
                                                    <Heart
                                                        className={`w-4 h-4 ${likedProducts.includes(product.id)
                                                            ? 'fill-red-500 stroke-red-500'
                                                            : 'stroke-gray-600'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </Link>
                                        
                                        {/* Row 2: Product Name - Fixed height */}
                                        <Link href={`/product/${product.slug}`} className="block pt-3">
                                            <h3 className="text-[16px] font-[600] text-[#3B2305] h-12 overflow-hidden leading-6" 
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                {product.name}
                                            </h3>
                                        </Link>
                                        
                                        {/* Row 3: Price - Fixed height */}
                                        <div className="h-8 flex items-center">
                                            <span className="text-[16px] font-[500] text-[#3B2305]">₦{product.price.toLocaleString()}</span>
                                        </div>
                                        
                                        {/* Row 4: Add to Bag Button - Fixed height */}
                                        <div className="h-10 pb-3">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="w-full h-full border border-[#D1B99B] text-[#3B2305] rounded-[4px] text-[14px] font-medium hover:bg-[#F9F5F0] transition-colors"
                                            >
                                                Add to Bag
                                            </button>
                                        </div>
                                    </div>

                                    {/* Desktop Layout - Original structure */}
                                    <div className="hidden md:flex flex-col">
                                        <Link href={`/product/${product.slug}`} className="block">
                                            <div className="relative w-full aspect-[1/1] bg-[#F9F5F0]">
                                                <Image
                                                    src={product.image || '/images/placeholder-product.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover object-center"
                                                    sizes="(max-width: 1024px) 25vw, 20vw"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleToggleLike(product.id);
                                                    }}
                                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10 hover:scale-110 transition-transform"
                                                >
                                                    <Heart
                                                        className={`w-5 h-5 ${likedProducts.includes(product.id)
                                                            ? 'fill-red-500 stroke-red-500'
                                                            : 'stroke-gray-600'
                                                            }`}
                                                    />
                                                </button>
                                            </div>

                                            <div className="flex flex-row justify-between p-3 pl-0 items-center">
                                                <span className="text-[16px] font-[500] text-[#3B2305]">{product.name}</span>
                                                <span className="text-[16px] font-[500] text-[#3B2305]">₦{product.price.toLocaleString()}</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
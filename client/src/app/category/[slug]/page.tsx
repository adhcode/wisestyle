'use client';

import { CategoryService } from '@/services/category.service';
import { ProductService } from '@/services/product.service';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronRight, SlidersHorizontal, ArrowDownWideNarrow } from 'lucide-react';
import { useLikes } from '@/contexts/LikesContext';
import { useCart } from '@/contexts/CartContext';
import { RateLimitError, NotFoundError } from '@/utils/api-client';
import { useCallback, useRef, useState, useEffect } from 'react';

interface CategoryPageProps {
    params: { slug: string };
}

// Define interfaces for category data
interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    children?: Category[];
    parentId?: string;
}

export default function CategoryPage({ params }: CategoryPageProps) {
    const [category, setCategory] = useState<Category | null>(null);
    const [subcategories, setSubcategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string, notFound?: boolean } | null>(null);
    const { state: { likedProducts }, toggleLike } = useLikes();
    const { addItem } = useCart();
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    // Refs for debouncing
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                setRateLimitError(null);

                // Fetch the requested category
                try {
                    const data = await CategoryService.getCategoryBySlug(params.slug);
                    // Type assertion after validation
                    const categoryData = data as Category;
                    setCategory(categoryData);

                    // If this is a parent category, get its subcategories
                    if (categoryData.children && categoryData.children.length > 0) {
                        setSubcategories(categoryData.children);
                    }
                } catch (err) {
                    if (err instanceof NotFoundError) {
                        setError({ message: `Category "${params.slug}" not found`, notFound: true });
                        return;
                    } else if (err instanceof RateLimitError) {
                        setRateLimitError(`${err.message}. Please try again in ${Math.ceil(err.retryAfter)} seconds.`);
                        // Auto-dismiss the error after the retry period
                        setTimeout(() => setRateLimitError(null), err.retryAfter * 1000);
                        return;
                    } else {
                        console.error('Error fetching category:', err);
                        setError({ message: 'Failed to load category' });
                        return;
                    }
                }

                // Get all products in this category AND its subcategories
                try {
                    const productsResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/products/category/${params.slug}?includeChildren=true`
                    );

                    if (!productsResponse.ok) {
                        if (productsResponse.status === 429) {
                            const retryAfter = parseInt(productsResponse.headers.get('retry-after') || '60', 10);
                            throw new RateLimitError('Too many requests while loading products', retryAfter);
                        }
                        throw new Error('Failed to fetch products');
                    }

                    const productsData = await productsResponse.json();
                    setProducts(productsData);
                } catch (err) {
                    if (err instanceof RateLimitError) {
                        setRateLimitError(`${err.message}. Please try again in ${Math.ceil(err.retryAfter)} seconds.`);
                        // Auto-dismiss the error after the retry period
                        setTimeout(() => setRateLimitError(null), err.retryAfter * 1000);
                    } else {
                        console.error('Error fetching products:', err);
                        setError({ message: 'Failed to load products for this category' });
                    }
                }
            } catch (error) {
                console.error('Error in fetchData:', error);
                setError({ message: 'An unexpected error occurred' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.slug]);

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
    const handleToggleLike = useCallback(async (productId: number) => {
        try {
            setRateLimitError(null);
            // Debounce to prevent multiple rapid toggles
            debounce(async () => {
                try {
                    await toggleLike(productId);
                } catch (error) {
                    if (error instanceof RateLimitError) {
                        setRateLimitError(`${error.message}. Please try again in ${Math.ceil(error.retryAfter)} seconds.`);
                        // Auto-dismiss the error after the retry period
                        setTimeout(() => setRateLimitError(null), error.retryAfter * 1000);
                    }
                    console.error('Error toggling like:', error);
                }
            }, 300);
        } catch (error) {
            console.error('Error in handleToggleLike:', error);
        }
    }, [toggleLike, debounce]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    if (error && error.notFound) return notFound();

    if (!category) return notFound();

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
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                    <div className="flex items-center text-sm text-[#3B2305]">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <Link href="/category" className="hover:underline">Categories</Link>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <span>{category.name}</span>
                    </div>
                </div>
            </div>

            {/* Category Banner */}
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                <div className="mb-8 text-left">
                    <h2 className="text-[32px] font-[400] text-[#1E1E1E] mb-2 mt-8">{category.name}</h2>
                    {category.description &&
                        <p className="text-lg text-[#3B2305] max-w-3xl opacity-80">
                            {category.description}
                        </p>
                    }
                </div>
            </div>

            {/* Subcategories if they exist */}
            {subcategories.length > 0 && (
                <div className="border-b border-[#F4EFE8] py-6">
                    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                        <h2 className="text-xl font-medium text-[#3B2305] mb-4">Shop by Category</h2>
                        <div className="flex flex-wrap gap-3">
                            {subcategories.map((subcat) => (
                                <Link
                                    key={subcat.id}
                                    href={`/category/${subcat.slug}`}
                                    className="px-4 py-2 bg-[#F9F5F0] hover:bg-[#f0e9dc] text-[#3B2305] rounded-full transition-colors"
                                >
                                    {subcat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid Section */}
            <div className="py-10 md:py-16">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                    {/* Filters and Sort Options */}
                    <div className="flex justify-between items-center mb-8">
                        <p className="text-[#3B2305] text-sm md:text-base">
                            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                        </p>

                        <div className="flex items-center gap-4">
                            <button
                                className="flex items-center gap-2 text-[#3B2305] text-sm md:text-base hover:text-[#5a3c13]"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden md:inline">Filters</span>
                            </button>

                            <div className="relative">
                                <div className="flex items-center gap-2 text-[#3B2305] cursor-pointer">
                                    <ArrowDownWideNarrow className="w-4 h-4" />
                                    <select
                                        className="appearance-none bg-transparent border-none text-sm md:text-base focus:outline-none cursor-pointer pr-6"
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

                    {/* Collapsible Filters Panel */}
                    {showFilters && (
                        <div className="bg-[#F9F5F0] p-4 rounded-lg mb-6 transition-all duration-300">
                            <div className="flex flex-wrap gap-4">
                                {/* Price Range Filter */}
                                <div className="w-full md:w-auto">
                                    <h3 className="font-medium text-[#3B2305] mb-2">Price Range</h3>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-24 p-2 border border-[#E1D4C3] rounded"
                                        />
                                        <span className="text-[#3B2305]">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-24 p-2 border border-[#E1D4C3] rounded"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button className="px-4 py-2 bg-[#3B2305] text-white rounded hover:bg-[#5a3c13] transition-colors">
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {products.length === 0 ? (
                        <div className="text-center py-16 text-gray-600 bg-[#F9F5F0] rounded-lg p-8">
                            <h3 className="text-xl font-medium mb-2">No products found</h3>
                            <p>There are currently no products available in this category.</p>
                            <Link href="/category" className="mt-4 inline-block px-6 py-2 bg-[#3B2305] text-white rounded-md hover:bg-[#4c2d08] transition-colors">
                                Browse All Categories
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
                            {sortedProducts().map((product) => (
                                <div key={product.id} className="group overflow-hidden flex flex-col w-full duration-200">
                                    <Link href={`/product/${product.slug}`} className="block">
                                        {/* Mobile View */}
                                        <div className="md:hidden relative w-full aspect-[211/300]">
                                            <Image
                                                src={product.image || '/images/placeholder-product.png'}
                                                alt={product.name}
                                                fill
                                                className="object-cover object-center rounded-[4px]"
                                                sizes="50vw"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleToggleLike(Number(product.id));
                                                }}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                                            >
                                                <Heart
                                                    className={`w-4 h-4 ${likedProducts.includes(Number(product.id))
                                                        ? 'fill-red-500 stroke-red-500'
                                                        : 'stroke-gray-600'
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Desktop View */}
                                        <div className="hidden md:block relative w-full aspect-[1/1] bg-[#F9F5F0]">
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
                                                    handleToggleLike(Number(product.id));
                                                }}
                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10 hover:scale-110 transition-transform"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 ${likedProducts.includes(Number(product.id))
                                                        ? 'fill-red-500 stroke-red-500'
                                                        : 'stroke-gray-600'
                                                        }`}
                                                />
                                            </button>
                                            {/* Overlay on hover, desktop only */}
                                            <div className="absolute left-0 right-0 bottom-0 h-12 items-end justify-center bg-[#FEFCF8B2] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                                <div className="flex items-center justify-center mb-2 gap-2 text-[#3B2305] text-[16px] font-medium">
                                                    <span className="hover:underline cursor-pointer">
                                                        View Product
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col mt-3">
                                            <h3 className="text-base font-medium text-[#3B2305]">{product.name}</h3>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-lg font-semibold text-[#3B2305]">₦{product.price.toLocaleString()}</span>
                                                {product.salePrice && (
                                                    <span className="text-xs px-2 py-1 bg-[#FCF0E3] text-[#c23b3b] rounded font-medium">
                                                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    {/* Mobile Add to Cart Button */}
                                    <div className="pb-3 block md:hidden">
                                        <button
                                            onClick={() => addItem(product)}
                                            className="w-full py-2 border border-[#D1B99B] text-[#3B2305] rounded-[4px] text-center text-[14px] font-medium hover:bg-[#F9F5F0] border-[0.5px] transition-colors"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Related Categories Section */}


        </div>
    );
} 
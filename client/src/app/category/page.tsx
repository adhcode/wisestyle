'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import { CategoryService } from '@/services/category.service';
import { RateLimitError } from '@/utils/api-client';
import { useLikes } from '@/contexts/LikesContext';
import { useCart } from '@/contexts/CartContext';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    children?: Category[];
    parentId?: string;
    price?: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);
    const retryAttemptRef = useRef<number>(0);
    const maxRetries = 3;
    const { state: { likedProducts }, toggleLike } = useLikes();
    const { addItem } = useCart();

    const fetchCategoriesWithRetry = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            setRateLimitError(null);
            const data = await CategoryService.getCategoryTree();
            setCategories(data as Category[]);
            retryAttemptRef.current = 0;
        } catch (err) {
            if (err instanceof RateLimitError) {
                setRateLimitError(`${err.message}. ${retryAttemptRef.current < maxRetries ?
                    `Retrying in ${Math.ceil(err.retryAfter)} seconds...` :
                    `Max retries reached. Please try again later.`}`);

                if (retryAttemptRef.current < maxRetries) {
                    retryAttemptRef.current += 1;
                    const jitter = 0.1 * Math.random() * err.retryAfter;
                    const backoff = Math.min(1000 * Math.pow(2, retryAttemptRef.current - 1), err.retryAfter * 1000) + jitter;
                    setTimeout(() => {
                        fetchCategoriesWithRetry();
                    }, backoff);
                }
            } else {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategoriesWithRetry();
    }, [fetchCategoriesWithRetry]);

    const handleRetry = () => {
        retryAttemptRef.current = 0;
        fetchCategoriesWithRetry();
    };

    const addToCart = (category: Category) => {
        const cartItem = {
            id: category.id,
            name: category.name,
            slug: category.slug,
            price: category.price || 0,
            description: category.description || '',
            categoryId: category.id,
            image: category.image || '',
            images: category.image ? [category.image] : [],
            isLimited: false,
            sizes: [],
            colors: [],
            tags: [],
            inventory: [],
            displaySection: 'NONE' as 'NONE',
            createdAt: new Date(),
            updatedAt: new Date(),
            quantity: 1,
            selectedSize: 'Default',
            selectedColor: 'Default',
        };
        addItem(cartItem);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] bg-[#FEFBF4]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    return (
        <section className="bg-[#FEFBF4] py-16">
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <div className="flex items-center text-sm text-[#3B2305]">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <span>All Categories</span>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8 text-left">
                    <h2 className="text-[32px] font-[400] text-[#1E1E1E] mb-2">
                        Browse Categories
                    </h2>
                    <p className="text-[16px] text-[#3B2305] leading-relaxed max-w-2xl">
                        Explore our wide range of products organized by category
                    </p>
                </div>

                {/* Rate limit error message */}
                {rateLimitError && (
                    <div className="mb-8 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {rateLimitError}
                        </div>
                        {retryAttemptRef.current >= maxRetries && (
                            <button
                                onClick={handleRetry}
                                className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-md transition-colors"
                            >
                                Retry Now
                            </button>
                        )}
                    </div>
                )}

                {/* Categories Grid */}
                {error && !rateLimitError ? (
                    <div className="text-center py-16 text-[#3B2305] bg-white rounded-lg shadow-sm p-8">
                        <h3 className="text-xl font-medium mb-2">Something went wrong</h3>
                        <p className="mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="mt-2 px-4 py-2 bg-[#3B2305] text-white rounded-md hover:bg-[#4c2d08] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] w-full">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-white rounded-[4px] overflow-hidden flex flex-col w-full">
                                <Link href={`/category/${category.slug}`} className="block">
                                    <div className="relative w-full aspect-[211/300] md:aspect-[1/1]">
                                        {category.image && (
                                            <Image
                                                src={category.image}
                                                alt={category.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                            />
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleLike(category.id);
                                            }}
                                            className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                                        >
                                            <Heart
                                                className={`w-4 h-4 md:w-5 md:h-5 ${likedProducts.includes(category.id)
                                                    ? 'fill-red-500 stroke-red-500'
                                                    : 'stroke-gray-600'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between p-3 pl-0 items-start md:items-center">
                                        <span className="text-[16px] font-[600] md:font-[500] text-[#3B2305]">{category.name}</span>
                                        {category.children && category.children.length > 0 && (
                                            <span className="text-[14px] text-[#3B2305] opacity-80">{category.children.length} subcategories</span>
                                        )}
                                    </div>
                                </Link>
                                <div className="pb-3 block md:hidden">
                                    <button
                                        onClick={() => addToCart(category)}
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
        </section>
    );
}
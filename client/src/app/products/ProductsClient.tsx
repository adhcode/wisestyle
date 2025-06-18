'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Product } from '@/types/product';
import { Category } from '@/types';
import { ProductService } from '@/services/product.service';

const sortOptions = [
    { name: 'Newest', value: 'newest' },
    { name: 'Price: Low to High', value: 'price-asc' },
    { name: 'Price: High to Low', value: 'price-desc' },
];

// TODO: You can populate this with highlighted products if needed.
const featuredNewArrivals: Product[] = [];

export default function ProductsClient() {
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sortBy, setSortBy] = useState('newest');
    const [likedProducts, setLikedProducts] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://wisestyle.onrender.com'}/api/categories`);
                const data = await response.json();
                const topLevelCategories = data.filter((cat: Category) => !cat.parentId);
                setCategories(topLevelCategories);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    // Fetch products including new arrivals
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const [regularProducts, newArrivals] = await Promise.all([
                    ProductService.getProducts(1, 100),
                    ProductService.getNewArrivals(),
                ]);

                const allProducts = [
                    ...featuredNewArrivals,
                    ...newArrivals,
                    ...regularProducts.filter(
                        (p) =>
                            !newArrivals.find((na) => na.id === p.id) &&
                            !featuredNewArrivals.find((fa) => fa.id === p.id)
                    ),
                ];

                setProducts(allProducts);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err instanceof Error ? err.message : 'Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Set initial category from URL params
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [searchParams]);

    // Derived data
    const filteredProducts = products.filter((product) => {
        if (!selectedCategory) return true;
        return product.category?.slug === selectedCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'newest': {
                const aIsFeatured = featuredNewArrivals.some((f) => f.id === a.id);
                const bIsFeatured = featuredNewArrivals.some((f) => f.id === b.id);
                if (aIsFeatured && !bIsFeatured) return -1;
                if (!aIsFeatured && bIsFeatured) return 1;
                return (
                    new Date(b.createdAt || Date.now()).getTime() -
                    new Date(a.createdAt || Date.now()).getTime()
                );
            }
            default:
                return 0;
        }
    });

    const toggleLike = (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        setLikedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C97203]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const selectedCategoryData = selectedCategory
        ? categories.find((cat) => cat.slug === selectedCategory)
        : null;

    return (
        <div className="bg-[#FFFCF8]">
            {/* Hero Section */}
            <div className="relative bg-[#3B2305] text-white py-12 mb-8">
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src="/images/hero-pattern.png"
                        alt="Pattern"
                        fill
                        className="object-cover opacity-10"
                    />
                </div>
                <div className="relative max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4 font-outfit">
                            {selectedCategoryData ? selectedCategoryData.name : 'All Products'}
                        </h1>
                        <p className="text-gray-300 max-w-2xl mx-auto font-lato">
                            {selectedCategoryData?.description ||
                                'Discover our exclusive collection of premium menswear, crafted with the finest materials and attention to detail.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px] py-8">
                {/* Mobile Filters Button */}
                <button
                    className="md:hidden w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-[#C97203] text-white rounded-lg font-medium"
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters & Sort
                </button>

                {/* Filters and Sort */}
                <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block mb-8`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCategory ? 'bg-[#C97203] text-white' : 'bg-[#F9F5F0] text-[#3B2305] hover:bg-[#F0EBE1]'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.slug)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.slug
                                        ? 'bg-[#C97203] text-white'
                                        : 'bg-[#F9F5F0] text-[#3B2305] hover:bg-[#F0EBE1]'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative w-full md:w-auto">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-[#F9F5F0] text-sm font-medium hover:bg-[#F0EBE1] transition-colors text-[#3B2305]"
                            >
                                Sort by
                                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5E1D8] z-10">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSortBy(option.value);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#F9F5F0] transition-colors ${sortBy === option.value ? 'text-[#C97203] font-medium' : 'text-[#3B2305]'
                                                }`}
                                        >
                                            {option.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {sortedProducts.map((product) => (
                        <Link
                            href={`/product/${product.slug}`}
                            key={product.id}
                            className="group relative block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Product Image */}
                            <div className="relative w-full pb-[125%] bg-[#F9F5F0] overflow-hidden">
                                <Image
                                    src={product.image || '/placeholder-product.png'}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    priority
                                />
                            </div>

                            {/* New Arrival Tag */}
                            {featuredNewArrivals.some((f) => f.id === product.id) && (
                                <span className="absolute top-2 left-2 bg-[#C97203]/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-medium">
                                    New Arrival
                                </span>
                            )}

                            {/* Limited Tag */}
                            {product.isLimited && (
                                <span className="absolute top-2 left-2 bg-[#3B2305]/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-medium">
                                    Limited Edition
                                </span>
                            )}

                            {/* Like Button */}
                            <button
                                onClick={(e) => toggleLike(e as any, product.id)}
                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                            >
                                {likedProducts.includes(product.id) ? (
                                    <Heart className="w-4 h-4 fill-[#C97203] stroke-[#C97203]" />
                                ) : (
                                    <Heart className="w-4 h-4 stroke-[#3B2305]" />
                                )}
                            </button>

                            {/* Product Info */}
                            <div className="p-4">
                                <div className="mb-1">
                                    {product.category && (
                                        <span className="text-xs text-[#C97203] font-medium">
                                            {product.category.name}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-medium text-[#3B2305] mb-1 truncate">
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-[#3B2305]">
                                        ₦{product.price.toLocaleString()}
                                    </p>
                                    {product.originalPrice && (
                                        <p className="text-xs text-gray-500 line-through">
                                            ₦{product.originalPrice.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {sortedProducts.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-[#3B2305]">No products found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 
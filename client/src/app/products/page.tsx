'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductService } from '@/services/product.service';

// Filter and sort options
const categories = ['All', 'Shirts', 'Bottoms', 'Shoes', 'Accessories', 'Watches', 'Custom Tailored'];
const sortOptions = [
    { name: 'Newest', value: 'newest' },
    { name: 'Price: Low to High', value: 'price-asc' },
    { name: 'Price: High to Low', value: 'price-desc' },
];

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [likedProducts, setLikedProducts] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch first page with a large limit to get all products
                const data = await ProductService.getProducts(1, 100);
                console.log('Fetched products:', data);
                setProducts(data);
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
            const formattedCategory = categoryFromUrl.charAt(0).toUpperCase() + categoryFromUrl.slice(1);
            if (categories.includes(formattedCategory)) {
                setSelectedCategory(formattedCategory);
            }
        }
    }, [searchParams]);

    // Filter products by category
    const filteredProducts = products.filter(product => {
        console.log('Filtering product:', product.name, 'Category:', product.category?.name);
        return selectedCategory === 'All' || (product.category && product.category.name.toLowerCase() === selectedCategory.toLowerCase());
    });
    console.log('Filtered products:', filteredProducts);

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            default:
                return 0;
        }
    });

    const toggleLike = (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        setLikedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-medium mb-4">{selectedCategory} Products</h1>
                    <p className="text-gray-600">Discover our collection of premium menswear</p>
                </div>

                {/* Mobile Filters Button */}
                <button
                    className="md:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg"
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters & Sort
                </button>

                {/* Filters and Sort */}
                <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block mb-8`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative w-full md:w-auto">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Sort by
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSortBy(option.value);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sortBy === option.value ? 'font-medium' : ''
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
                            className="group relative block bg-white overflow-hidden"
                        >
                            {/* Product Image */}
                            <div className="relative w-full pb-[125%] bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                    src={product.image || '/placeholder-product.png'}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    priority
                                />
                            </div>

                            {/* Limited Tag */}
                            {product.isLimited && (
                                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] px-1.5 py-1 rounded-full font-medium">
                                    Limited Edition
                                </span>
                            )}

                            {/* Like Button */}
                            <button
                                onClick={(e) => toggleLike(e, product.id)}
                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full"
                            >
                                {likedProducts.includes(product.id) ? (
                                    <Heart className="w-4 h-4 fill-red-500 stroke-red-500" />
                                ) : (
                                    <Heart className="w-4 h-4 stroke-gray-600" />
                                )}
                            </button>

                            {/* Product Info */}
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-gray-900">
                                        ₦{(product.price).toLocaleString()}
                                    </p>
                                    {product.originalPrice && (
                                        <p className="text-xs text-gray-500 line-through">
                                            ₦{(product.originalPrice).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {sortedProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No products found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 
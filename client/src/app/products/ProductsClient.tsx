'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Product } from '@/types/product';
import { Category } from '@/types';
import { ProductService } from '@/services/product.service';
import { useLikes } from '@/contexts/LikesContext';
import { useCart } from '@/contexts/CartContext';
import CartButton from '@/app/components/CartButton';

const sortOptions = [
    { name: 'Newest', value: 'newest' },
    { name: 'Price: Low to High', value: 'price-asc' },
    { name: 'Price: High to Low', value: 'price-desc' },
];

// TODO: You can populate this with highlighted products if needed.
const featuredNewArrivals: Product[] = [];

export default function ProductsClient() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { state: { likedProducts }, toggleLike } = useLikes();
    const { addItem } = useCart();

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Check if categories are cached in sessionStorage
                const cachedCategories = sessionStorage.getItem('categories_list');
                const cacheTimestamp = sessionStorage.getItem('categories_timestamp');
                const now = Date.now();
                const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

                if (cachedCategories && cacheTimestamp && (now - parseInt(cacheTimestamp)) < oneHour) {
                    console.log('Loading categories from cache');
                    const parsedCategories = JSON.parse(cachedCategories);
                    const topLevelCategories = parsedCategories.filter((cat: Category) => !cat.parentId);
                    setCategories(topLevelCategories);
                    return;
                }

                console.log('Fetching categories from API');
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/categories`);
                const data = await response.json();
                const topLevelCategories = data.filter((cat: Category) => !cat.parentId);
                setCategories(topLevelCategories);

                // Cache the categories
                sessionStorage.setItem('categories_list', JSON.stringify(data));
                sessionStorage.setItem('categories_timestamp', now.toString());
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    // Fetch all products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                console.log('Starting to fetch products...');

                let data: Product[] = [];

                try {
                    // Try ProductService first with a higher limit
                    console.log('Trying ProductService...');
                    data = await ProductService.getProducts(1, 1000);
                    console.log('ProductService successful, fetched:', data.length, 'products');
                } catch (serviceError) {
                    console.error('ProductService failed, trying direct fetch:', serviceError);

                    // Fallback to direct fetch
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/products?limit=1000`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    data = await response.json();
                    console.log('Direct fetch successful, fetched:', data.length, 'products');
                }

                console.log('Setting products data:', data.length);
                setAllProducts(data);
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Helper function to get all category IDs for a category (including children)
    const getCategoryIds = (categorySlug: string, allCategories: Category[]): string[] => {
        const category = allCategories.find(cat => cat.slug === categorySlug);
        if (!category) return [];

        const ids = [category.id];

        // Add children IDs
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                ids.push(child.id);
            });
        }

        return ids;
    };

    // Helper function to check if a product belongs to a category (including parent categories)
    const productBelongsToCategory = (product: Product, categorySlug: string, allCategories: Category[]): boolean => {
        if (!product.category) return false;

        // Get all categories data from cache or state
        const cachedCategories = sessionStorage.getItem('categories_list');
        let allCategoriesData = allCategories;

        if (cachedCategories) {
            try {
                allCategoriesData = JSON.parse(cachedCategories);
            } catch (error) {
                console.error('Error parsing cached categories:', error);
            }
        }

        // Find the target category
        const targetCategory = allCategoriesData.find(cat => cat.slug === categorySlug);
        if (!targetCategory) return false;

        // Check if product's category matches directly
        if (product.category.slug === categorySlug) return true;

        // Check if product's category is a child of the target category
        if (product.category.parentId === targetCategory.id) return true;

        // Check if product belongs to any child category of the target
        const targetCategoryIds = getCategoryIds(categorySlug, allCategoriesData);
        return targetCategoryIds.includes(product.categoryId);
    };

    // Filter products based on search query and category
    useEffect(() => {
        console.log('Filtering products:', {
            searchQuery,
            selectedCategory,
            totalProducts: allProducts.length,
            firstProduct: allProducts[0] ? {
                name: allProducts[0].name,
                description: allProducts[0].description,
                category: allProducts[0].category
            } : null
        });

        let filtered = [...allProducts];

        // Apply search filter
        if (searchQuery) {
            console.log('Searching for:', searchQuery, 'in', allProducts.length, 'products');
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            console.log('Search results:', filtered.length, 'products found');
        }

        // Apply category filter with parent-child support
        if (selectedCategory) {
            filtered = filtered.filter(product =>
                productBelongsToCategory(product, selectedCategory, categories)
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                break;
        }

        console.log('Final filtered products:', filtered.length);
        setProducts(filtered);
    }, [searchQuery, selectedCategory, sortBy, allProducts, categories]);

    // Set initial category from URL params
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [searchParams]);

    const openQuickView = (product: Product, e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleToggleLike = async (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        try {
            await toggleLike(productId);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[#FEFBF4] min-h-screen">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px] py-16">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] w-full">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[1/1] bg-gray-200 rounded-[4px] mb-3"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#FEFBF4] min-h-screen flex justify-center items-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const selectedCategoryData = selectedCategory
        ? categories.find((cat) => cat.slug === selectedCategory)
        : null;

    return (
        <div className="bg-[#FEFBF4] min-h-screen">
            {/* Modern Hero Section */}
            <div className="bg-gradient-to-b from-[#FEFBF4] to-[#F9F5F0] py-16">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                    <div className="text-center">
                        <h1 className="text-[32px] md:text-[40px] font-[400] text-[#1E1E1E] mb-4">
                            {selectedCategoryData ? selectedCategoryData.name : 'All Products'}
                        </h1>
                        <p className="text-[#3B2305] max-w-2xl mx-auto mb-8 text-[16px] md:text-[18px] opacity-90">
                            {selectedCategoryData?.description ||
                                'Discover our complete collection of premium fashion items crafted with attention to detail'}
                        </p>

                        {/* Search Results Header */}
                        {searchQuery && (
                            <div className="bg-white rounded-lg p-4 mb-8 inline-block shadow-sm border border-gray-100">
                                <p className="text-[#3B2305] font-medium">
                                    Search results for "{searchQuery}" • {products.length} {products.length === 1 ? 'product' : 'products'} found
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px] pb-16">
                {/* Mobile Filters Button */}
                <button
                    className="md:hidden w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-[#3B2305] text-white rounded-lg font-medium hover:bg-[#2A1804] transition-colors"
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters & Sort
                </button>

                {/* Modern Filters and Sort */}
                <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block mb-8`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCategory
                                    ? 'bg-[#3B2305] text-white'
                                    : 'bg-[#F9F5F0] text-[#3B2305] hover:bg-[#F0EBE1] border border-[#D1B99B]'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.slug)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.slug
                                        ? 'bg-[#3B2305] text-white'
                                        : 'bg-[#F9F5F0] text-[#3B2305] hover:bg-[#F0EBE1] border border-[#D1B99B]'
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
                                className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-[#F9F5F0] text-sm font-medium hover:bg-[#F0EBE1] transition-colors text-[#3B2305] border border-[#D1B99B]"
                            >
                                Sort by: {sortOptions.find(opt => opt.value === sortBy)?.name}
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
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#F9F5F0] transition-colors first:rounded-t-lg last:rounded-b-lg ${sortBy === option.value ? 'text-[#3B2305] font-medium bg-[#F9F5F0]' : 'text-[#3B2305]'
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

                {/* Products Grid - Modern Trending Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] w-full">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            className="group overflow-hidden flex flex-col w-full duration-200"
                        >
                            <div className="relative w-full aspect-[1/1] bg-[#F9F5F0] rounded-[4px] overflow-hidden">
                                <Image
                                    src={product.image || '/images/placeholder.jpg'}
                                    alt={product.name}
                                    fill
                                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                />

                                {/* Tags */}
                                {product.displaySection === 'NEW_ARRIVAL' && (
                                    <span className="absolute top-2 left-2 bg-[#3B2305] text-white text-[10px] px-2 py-1 rounded-full font-medium z-10">
                                        New Arrival
                                    </span>
                                )}
                                {product.displaySection === 'SALES' && (
                                    <span className="absolute top-2 left-2 bg-[#C97203] text-white text-[10px] px-2 py-1 rounded-full font-medium z-10">
                                        Sale
                                    </span>
                                )}
                                {product.isLimited && (
                                    <span className="absolute top-2 left-2 bg-[#8B4513] text-white text-[10px] px-2 py-1 rounded-full font-medium z-10">
                                        Limited
                                    </span>
                                )}

                                {/* Like Button */}
                                <button
                                    onClick={(e) => handleToggleLike(e, product.id)}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm z-10 hover:bg-white transition-colors"
                                >
                                    <Heart
                                        className={`w-4 h-4 ${likedProducts.includes(product.id)
                                            ? 'fill-red-500 stroke-red-500'
                                            : 'stroke-gray-600'
                                            }`}
                                    />
                                </button>

                                {/* Desktop Hover Overlay */}
                                <div className="hidden md:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center z-20">
                                    <div className="flex items-center gap-4 text-white">
                                        <button
                                            onClick={(e) => openQuickView(product, e)}
                                            className="px-4 py-2 bg-white/90 backdrop-blur-sm text-[#3B2305] rounded-lg text-sm font-medium hover:bg-white transition-colors"
                                        >
                                            Quick View
                                        </button>
                                        <CartButton
                                            product={product}
                                            className="px-4 py-2 bg-[#3B2305] text-white rounded-lg text-sm font-medium hover:bg-[#2A1804] transition-colors"
                                            onSuccess={() => closeModal()}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="pt-3 space-y-1">
                                <h3 className="text-[14px] md:text-[16px] font-medium text-[#3B2305] leading-tight">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] md:text-[16px] font-semibold text-[#3B2305]">
                                        ₦{product.price.toLocaleString()}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="text-[12px] md:text-[14px] text-gray-500 line-through">
                                            ₦{product.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Mobile Cart Button */}
                                <div className="pt-2 md:hidden">
                                    <CartButton
                                        product={product}
                                        className="w-full py-2 border border-[#D1B99B] text-[#3B2305] rounded-[4px] text-center text-[14px] font-medium hover:bg-[#F9F5F0] transition-colors"
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {products.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
                            <div className="w-16 h-16 bg-[#F9F5F0] rounded-full flex items-center justify-center mx-auto mb-4">
                                <SlidersHorizontal className="w-8 h-8 text-[#3B2305]" />
                            </div>
                            <h3 className="text-[18px] font-medium text-[#3B2305] mb-2">No products found</h3>
                            <p className="text-[#3B2305] opacity-70 text-sm">
                                {searchQuery
                                    ? `No products match "${searchQuery}". Try adjusting your search.`
                                    : selectedCategory
                                        ? "No products found in this category."
                                        : "No products available at the moment."
                                }
                            </p>
                            {(searchQuery || selectedCategory) && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        window.history.pushState({}, '', '/products');
                                    }}
                                    className="mt-4 px-4 py-2 bg-[#3B2305] text-white rounded-lg text-sm font-medium hover:bg-[#2A1804] transition-colors"
                                >
                                    View All Products
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick View Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex flex-col md:flex-row">
                            {/* Product Image */}
                            <div className="w-full md:w-1/2 relative h-[300px] md:h-[450px]">
                                <Image
                                    src={selectedProduct.image || '/images/placeholder.jpg'}
                                    alt={selectedProduct.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            {/* Product Details */}
                            <div className="w-full md:w-1/2 p-6 md:p-8">
                                <h3 className="text-2xl font-medium text-[#3B2305] mb-2">{selectedProduct.name}</h3>
                                <div className="flex items-center gap-3 mb-6">
                                    <p className="text-xl font-medium text-[#3B2305]">₦{selectedProduct.price.toLocaleString()}</p>
                                    {selectedProduct.originalPrice && (
                                        <p className="text-lg text-gray-500 line-through">₦{selectedProduct.originalPrice.toLocaleString()}</p>
                                    )}
                                </div>

                                {selectedProduct.description && (
                                    <p className="text-[#3B2305] opacity-80 mb-6">{selectedProduct.description}</p>
                                )}

                                <div className="flex flex-col gap-3 mt-8">
                                    <Link
                                        href={`/product/${selectedProduct.slug}`}
                                        className="block w-full bg-[#3B2305] text-white py-3 rounded mb-3 text-center hover:bg-[#4c2d08] transition-colors"
                                    >
                                        View Full Details
                                    </Link>
                                    <CartButton
                                        product={selectedProduct}
                                        className="block w-full border border-[#D1B99B] text-[#3B2305] py-3 rounded text-center hover:bg-[#F9F5F0] transition-colors"
                                        onSuccess={closeModal}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronRight, Percent } from 'lucide-react';
import { useLikes } from '@/contexts/LikesContext';
import { Product } from '@/types/product';
import CartButton from '../components/CartButton';

export default function SalesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { state: { likedProducts }, toggleLike } = useLikes();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Fetching sale products...');

                // First, try to get products with discounts/sales from a dedicated endpoint
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/products/on-sale`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Found dedicated sale products:', data.length);
                        setProducts(data);
                        return;
                    }
                } catch (err) {
                    console.log('No dedicated sale endpoint, trying general products...');
                }

                // Fallback: Get all products and filter for those with discounts/sale prices
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app')}/api/products?limit=1000`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const allProducts = await response.json();
                console.log('Fetched all products:', allProducts.length);

                // Filter products that have sales/discounts
                const saleProducts = allProducts.filter((product: any) => {
                    // Check if product has salePrice, originalPrice, discount, or isOnSale properties
                    return product.salePrice ||
                        product.originalPrice ||
                        product.discount ||
                        product.isOnSale ||
                        (product.price && product.originalPrice && product.price < product.originalPrice);
                });

                console.log('Filtered sale products:', saleProducts.length);

                // If we don't find any real sale products, create some sample ones from existing products
                if (saleProducts.length === 0 && allProducts.length > 0) {
                    console.log('No natural sale products found, creating sample sales...');
                    const sampleSales = allProducts.slice(0, 8).map((product: any, index: number) => ({
                        ...product,
                        originalPrice: product.price,
                        salePrice: Math.round(product.price * (0.7 + (index % 3) * 0.1)), // 70-90% of original
                        discount: Math.round((1 - (0.7 + (index % 3) * 0.1)) * 100),
                        isOnSale: true
                    }));
                    setProducts(sampleSales);
                } else {
                    setProducts(saleProducts);
                }

            } catch (err) {
                console.error('Error fetching products on sale:', err);
                setError('Failed to load sale products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FEFBF4] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FEFBF4] flex items-center justify-center">
                <div className="text-center text-[#3B2305]">
                    <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                    <p className="mb-4">{error}</p>
                    <Link href="/" className="mt-4 inline-block px-4 py-2 border border-[#3B2305] rounded-md hover:bg-[#F9F5F0]">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FEFBF4] pb-16">
            {/* Breadcrumb */}
            <div className="w-full bg-white py-4 border-b border-[#F4EFE8]">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                    <div className="flex items-center text-sm text-[#3B2305]">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <span>Sales & Discounts</span>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="w-full bg-[#F4EFE8] py-10 md:py-14 mb-8 relative overflow-hidden">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-[120px] text-center relative z-10">
                    <span className="inline-block px-4 py-2 bg-[#D1B99B] text-white rounded-full text-sm font-medium mb-4">
                        Limited Time Offer
                    </span>
                    <h1 className="text-3xl md:text-4xl font-[500] text-[#3B2305] mb-4">Special Sales & Discounts</h1>
                    <p className="text-[16px] text-[#3B2305] max-w-2xl mx-auto">
                        Discover amazing deals on our premium quality clothing and accessories.
                        Don't miss these limited-time offers!
                    </p>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#D1B99B] opacity-10"></div>
                    <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-[#D1B99B] opacity-10"></div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                {products.length === 0 ? (
                    <div className="text-center py-16 text-[#3B2305] bg-white rounded-lg shadow-sm p-8">
                        <h3 className="text-xl font-medium mb-2">No Products On Sale</h3>
                        <p>We don't have any products on sale at the moment. Check back soon!</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-medium text-[#3B2305]">
                                {products.length} {products.length === 1 ? 'Product' : 'Products'} On Sale
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 w-full">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.slug}`}
                                    className="group overflow-hidden flex flex-col w-full duration-200 bg-white rounded-lg shadow-sm hover:shadow-md"
                                >
                                    <div className="relative w-full aspect-[1/1] bg-[#F9F5F0] rounded-lg overflow-hidden">
                                        <Image
                                            src={product.image || '/images/placeholder-product.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover object-center"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                        />
                                        <button
                                            onClick={(e) => { e.preventDefault(); toggleLike(product.id); }}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                                        >
                                            <Heart
                                                className={`w-5 h-5 ${likedProducts.includes(product.id)
                                                    ? 'fill-red-500 stroke-red-500'
                                                    : 'stroke-gray-600'
                                                    }`}
                                            />
                                        </button>

                                        {/* Sale Tag */}
                                        <div className="absolute top-3 left-3 px-2.5 py-1.5 bg-[#c23b3b] text-white text-xs rounded-full font-semibold flex items-center">
                                            <Percent className="w-3 h-3 mr-1" />
                                            {/* Calculate discount percentage properly */}
                                            {product.salePrice && product.originalPrice
                                                ? `-${Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}%`
                                                : product.salePrice && product.price > product.salePrice
                                                    ? `-${Math.round(((product.price - product.salePrice) / product.price) * 100)}%`
                                                    : product.discount
                                                        ? `-${product.discount}%`
                                                        : 'SALE'}
                                        </div>

                                        {/* Limited Tag */}
                                        {product.isLimited && (
                                            <span className="absolute top-3 right-12 bg-[#3B2305] text-white text-xs px-2 py-1 rounded-full">
                                                Limited
                                            </span>
                                        )}

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-[#3B2305]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute left-0 right-0 bottom-0 h-12 flex items-end justify-center bg-[#FEFCF8B2] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                                <div className="flex items-center justify-center mb-2 gap-2 text-[#3B2305] text-[16px] font-medium">
                                                    <span className="hover:underline cursor-pointer mr-6">
                                                        Quick View
                                                    </span>
                                                    <CartButton
                                                        product={{
                                                            id: product.id,
                                                            name: product.name,
                                                            slug: product.slug,
                                                            price: product.salePrice || product.price,
                                                            description: product.description || '',
                                                            categoryId: product.categoryId || '',
                                                            images: product.images || [product.image],
                                                            isLimited: product.isLimited || false,
                                                            sizes: product.sizes || [],
                                                            colors: product.colors || [],
                                                            tags: product.tags || [],
                                                            inventory: product.inventory || [],
                                                            displaySection: 'NONE',
                                                            createdAt: product.createdAt || new Date(),
                                                            updatedAt: product.updatedAt || new Date()
                                                        }}
                                                        className="hover:underline cursor-pointer border border-l-[#D1B99B] border-r-0 border-t-0 border-b-0 px-6 py-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex flex-col justify-between gap-1">
                                            <h3 className="text-[16px] font-[600] text-[#3B2305] line-clamp-1">{product.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[16px] font-[500] text-[#c23b3b]">
                                                    ₦{(product.salePrice || product.price).toLocaleString()}
                                                </span>
                                                {(product.salePrice || (product.originalPrice && product.originalPrice > product.price)) && (
                                                    <span className="text-[14px] text-gray-500 line-through">
                                                        ₦{(product.originalPrice || product.price).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 block md:hidden">
                                            <CartButton
                                                product={{
                                                    id: product.id,
                                                    name: product.name,
                                                    slug: product.slug,
                                                    price: product.salePrice || product.price,
                                                    description: product.description || '',
                                                    categoryId: product.categoryId || '',
                                                    images: product.images || [product.image],
                                                    isLimited: product.isLimited || false,
                                                    sizes: product.sizes || [],
                                                    colors: product.colors || [],
                                                    tags: product.tags || [],
                                                    inventory: product.inventory || [],
                                                    displaySection: 'NONE',
                                                    createdAt: product.createdAt || new Date(),
                                                    updatedAt: product.updatedAt || new Date()
                                                }}
                                                className="w-full py-2 border border-[#D1B99B] text-[#3B2305] rounded-[4px] text-center text-[14px] font-medium hover:bg-[#F9F5F0] border-[0.5px] transition-colors"
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

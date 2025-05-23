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
                // In a real app, you'd have a dedicated endpoint for sale products
                // This is a placeholder that would get products with discounts
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/on-sale`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products on sale');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products on sale:', err);
                // For demo purposes, create some fake sale products if endpoint doesn't exist
                const fakeSaleProducts = [
                    {
                        id: "101",
                        name: "Premium Kaftan - Limited Edition",
                        slug: "premium-kaftan-limited",
                        price: 30000,
                        salePrice: 24000,
                        discount: 20,
                        image: "/images/trending/kaftant.png",
                        isLimited: true,
                        description: "Premium quality kaftan with detailed embroidery.",
                        categoryId: "traditional-wear"
                    },
                    {
                        id: "102",
                        name: "Designer Agbada Set",
                        slug: "designer-agbada-set",
                        price: 45000,
                        salePrice: 36000,
                        discount: 20,
                        image: "/images/new-arrivals/agbada.png",
                        isLimited: false,
                        description: "Elegant Agbada set for special occasions.",
                        categoryId: "traditional-wear"
                    },
                    {
                        id: "103",
                        name: "Casual Chinos",
                        slug: "casual-chinos",
                        price: 18000,
                        salePrice: 12600,
                        discount: 30,
                        image: "/images/new-arrivals/chinos-trouser.png",
                        isLimited: false,
                        description: "Comfortable chinos for everyday wear.",
                        categoryId: "trousers"
                    },
                    {
                        id: "104",
                        name: "Premium Black T-Shirt",
                        slug: "premium-black-tshirt",
                        price: 12000,
                        salePrice: 8400,
                        discount: 30,
                        image: "/images/trending/blacktshirt.png",
                        isLimited: false,
                        description: "High-quality black t-shirt made from premium cotton.",
                        categoryId: "t-shirts"
                    },
                    {
                        id: "105",
                        name: "Leather Watch - Limited Edition",
                        slug: "leather-watch-limited",
                        price: 35000,
                        salePrice: 29750,
                        discount: 15,
                        image: "/images/trending/watches.png",
                        isLimited: true,
                        description: "Elegant leather watch with premium craftsmanship.",
                        categoryId: "accessories"
                    },
                    {
                        id: "106",
                        name: "Designer Sunglasses",
                        slug: "designer-sunglasses",
                        price: 22000,
                        salePrice: 17600,
                        discount: 20,
                        image: "/images/trending/sunglass.png",
                        isLimited: false,
                        description: "Stylish designer sunglasses perfect for any occasion.",
                        categoryId: "accessories"
                    },
                    {
                        id: "107",
                        name: "Casual White T-Shirt",
                        slug: "casual-white-tshirt",
                        price: 10000,
                        salePrice: 7000,
                        discount: 30,
                        image: "/images/trending/white-shirt.png",
                        isLimited: false,
                        description: "Comfortable white t-shirt for everyday wear.",
                        categoryId: "t-shirts"
                    },
                    {
                        id: "108",
                        name: "Premium Jeans",
                        slug: "premium-jeans",
                        price: 28000,
                        salePrice: 19600,
                        discount: 30,
                        image: "/images/trending/jean.png",
                        isLimited: false,
                        description: "Premium quality jeans with perfect fit.",
                        categoryId: "jeans-trousers"
                    }
                ];
                setProducts(fakeSaleProducts as unknown as Product[]);
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
                                    <div className="relative w-full aspect-[1/1]">
                                        <Image
                                            src={product.image || '/images/placeholder-product.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover object-center"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                        />
                                        <button
                                            onClick={(e) => { e.preventDefault(); toggleLike(Number(product.id)); }}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                                        >
                                            <Heart
                                                className={`w-5 h-5 ${likedProducts.includes(Number(product.id))
                                                    ? 'fill-red-500 stroke-red-500'
                                                    : 'stroke-gray-600'
                                                    }`}
                                            />
                                        </button>

                                        {/* Sale Tag */}
                                        <div className="absolute top-3 left-3 px-2.5 py-1.5 bg-[#c23b3b] text-white text-xs rounded-full font-semibold flex items-center">
                                            <Percent className="w-3 h-3 mr-1" />
                                            {/* Check if product has a salePrice or discount property */}
                                            {product.salePrice
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
                                                {product.salePrice && (
                                                    <span className="text-[14px] text-gray-500 line-through">
                                                        ₦{product.price.toLocaleString()}
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

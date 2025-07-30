'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { useLikes } from '@/contexts/LikesContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';

export default function NewArrivalsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { state: { likedProducts }, toggleLike } = useLikes();
    const { addItem } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await ProductService.getNewArrivals();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching new arrivals:', err);
                setError('Failed to load new arrivals');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const addToCart = (product: Product) => {
        const cartItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            description: product.description,
            categoryId: product.categoryId,
            image: product.image,
            images: product.images,
            isLimited: product.isLimited,
            sizes: product.sizes,
            colors: product.colors,
            tags: product.tags,
            inventory: product.inventory,
            displaySection: product.displaySection,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
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
                        <span>New Arrivals</span>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8 text-left">
                    <h2 className="text-[32px] font-[400] text-[#1E1E1E] mb-2">
                        New Arrivals
                    </h2>
                    <p className="text-[16px] text-[#3B2305] leading-relaxed max-w-2xl">
                        Discover our latest collection of fashion items
                    </p>
                </div>

                {/* Products Grid */}
                {error ? (
                    <div className="text-center py-16 text-[#3B2305] bg-white rounded-lg shadow-sm p-8">
                        <h3 className="text-xl font-medium mb-2">Something went wrong</h3>
                        <p className="mb-4">{error}</p>
                    </div>
                ) : (
                    products.length === 0 ? (
                        <div className="text-center py-16 text-gray-600 bg-[#F9F5F0] rounded-lg p-8">
                            <h3 className="text-xl font-medium mb-2">No products found</h3>
                            <p>There are currently no new arrivals available.</p>
                            <Link href="/category" className="mt-4 inline-block px-6 py-2 bg-[#3B2305] text-white rounded-md hover:bg-[#4c2d08] transition-colors">
                                Browse All Categories
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
                            {products.map((product) => (
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
                                                    toggleLike(product.id);
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

                                        {/* Desktop View */}
                                        <div className="hidden md:block relative w-full aspect-[1/1] bg-[#F9F5F0] rounded-lg overflow-hidden">
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
                                                    toggleLike(product.id);
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
                                                {product.discount && product.discount > 0 && (
                                                    <span className="text-xs px-2 py-1 bg-[#FCF0E3] text-[#c23b3b] rounded font-medium">
                                                        {Math.round(product.discount)}% OFF
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    {/* Mobile Add to Bag Button */}
                                    <div className="pb-3 block md:hidden">
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="w-full py-2 border border-[#D1B99B] text-[#3B2305] rounded-[4px] text-center text-[14px] font-medium hover:bg-[#F9F5F0] border-[0.5px] transition-colors"
                                        >
                                            Add to Bag
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </section>
    );
} 
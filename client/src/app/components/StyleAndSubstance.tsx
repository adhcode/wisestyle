'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLikes } from '@/contexts/LikesContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { ProductService } from '@/services/product.service';

export default function StyleAndSubstance() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { state: { likedProducts }, toggleLike } = useLikes();
    const { addItem } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const newArrivals = await ProductService.getNewArrivals();
                setProducts(newArrivals.slice(0, 4)); // Get first 4 new arrivals
                setLoading(false);
            } catch (error) {
                console.error('Error fetching new arrivals:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-[#FFFCF8]">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                    <div className="animate-pulse">
                        <div className="h-10 w-48 bg-gray-200 rounded mb-3"></div>
                        <div className="h-6 w-72 bg-gray-200 rounded mb-6"></div>
                        <div className="grid grid-cols-2 gap-[16px] max-w-[709px]">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-gray-200 h-[400px] rounded-[4px]"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-[#FFFCF8]">
            {/* Desktop View */}
            <div className="hidden md:block max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                <div className="flex flex-row gap-24">
                    {/* Text section */}
                    <div className="w-1/3 flex flex-col justify-center">
                        <h2 className="text-[40px] font-[700] text-[#3B2305] mb-3 font-macaw">Style & Substance</h2>
                        <p className="text-[20px] font-[400] text-[#3B2305] mb-6 w-[301px]">
                            Explore our latest arrival fashion clothing for men.
                        </p>
                        <Link
                            href="/new-arrivals"
                            className="bg-[#C97203] font-inter hover:bg-[#B56503] text-white rounded-[4px] py-[12px] px-[40px] text-base font-medium inline-block text-center transition-colors w-fit"
                        >
                            Explore all Products
                        </Link>
                    </div>

                    {/* Product section - fixed 2x2 grid */}
                    <div className="grid grid-cols-2 gap-[16px] max-w-[709px] w-full mx-auto">
                        {products.map((product) => (
                            <Link
                                href={`/product/${product.slug}`}
                                key={product.id}
                                className="bg-white rounded-[4px] overflow-hidden flex flex-col max-w-[346.5px] w-full hover:shadow-lg transition-shadow"
                            >
                                <div className="relative w-full h-[300px]">
                                    <Image
                                        src={product.image || '/images/placeholder.jpg'}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="346.5px"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleLike(Number(product.id));
                                        }}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                                    >
                                        <Heart
                                            className={`w-5 h-5 ${likedProducts.includes(Number(product.id))
                                                ? 'fill-red-500 stroke-red-500'
                                                : 'stroke-gray-600'
                                                }`}
                                        />
                                    </button>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between p-3 pl-0 items-start md:items-center">
                                    <span className="text-[16px] font-[600] md:font-[500] text-[#3B2305]">{product.name}</span>
                                    <span className="text-[16px] font-[500] text-[#3B2305]">₦{product.price.toLocaleString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-32">
                <div>
                    <h2 className="text-[40px] font-[700] text-[#3B2305] mb-3 font-macaw">Style & Substance</h2>
                    <p className="text-[20px] font-[400] text-[#3B2305] mb-6">
                        Explore our latest arrival fashion clothing for men.
                    </p>
                    <Link
                        href="/new-arrivals"
                        className="bg-[#C97203] font-inter hover:bg-[#B56503] text-white rounded-[4px] py-[12px] px-[40px] text-base font-medium inline-block text-center transition-colors mb-6"
                    >
                        Explore all Products
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-[16px] w-full mt-16">
                    {products.map((product) => (
                        <Link
                            href={`/product/${product.slug}`}
                            key={product.id}
                            className="bg-white rounded-[4px] overflow-hidden flex flex-col w-full hover:shadow-lg transition-shadow"
                        >
                            <div className="relative w-full aspect-[211/300]">
                                <Image
                                    src={product.image || '/images/placeholder.jpg'}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="50vw"
                                />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleLike(Number(product.id));
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
                            <div className="flex flex-col md:flex-row justify-between p-3 pl-0 items-start md:items-center">
                                <span className="text-[16px] font-[600] md:font-[500] text-[#3B2305]">{product.name}</span>
                                <span className="text-[16px] font-[500] text-[#3B2305]">₦{product.price.toLocaleString()}</span>
                            </div>
                            <div className="pb-3 block md:hidden">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addItem({
                                            ...product,
                                            quantity: 1,
                                            selectedSize: product.sizes[0]?.value || 'Default',
                                            selectedColor: product.colors[0]?.value || 'Default',
                                        });
                                    }}
                                    className="w-full py-2 border border-[#D1B99B] text-[#3B2305] rounded-[4px] text-center text-[14px] font-medium hover:bg-[#F9F5F0] border-[0.5px] transition-colors"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
} 
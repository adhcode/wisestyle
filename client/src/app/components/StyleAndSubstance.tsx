'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLikes } from '@/contexts/LikesContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { ProductService } from '@/services/product.service';
import CartButton from './CartButton';

export default function StyleAndSubstance() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { state: { likedProducts }, toggleLike } = useLikes();
    const { addItem } = useCart();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState(false);

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

    const openQuickView = (product: Product, e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleToggleLike = async (productId: string) => {
        try {
            await toggleLike(productId);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

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
                                className="group overflow-hidden flex flex-col max-w-[346.5px] w-full duration-200"
                            >
                                <div className="relative w-full h-[300px] bg-[#F9F5F0] rounded-lg overflow-hidden">
                                    <Image
                                        src={product.image || '/images/placeholder.jpg'}
                                        alt={product.name}
                                        fill
                                        className="object-cover object-center"
                                        sizes="346.5px"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleToggleLike(product.id);
                                        }}
                                        className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                                    >
                                        <Heart
                                            className={`w-4 h-4 md:w-5 md:h-5 ${likedProducts.includes(product.id)
                                                ? 'fill-red-500 stroke-red-500'
                                                : 'stroke-gray-600'
                                                }`}
                                        />
                                    </button>
                                    {/* Overlay on hover, desktop only */}
                                    <div className="hidden md:flex absolute left-0 right-0 bottom-0 h-12 items-end justify-center bg-[#FEFCF8B2] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                        <div className="flex items-center justify-center mb-2 gap-2 text-[#3B2305] text-[16px] font-medium">
                                            <span
                                                className="hover:underline cursor-pointer mr-6"
                                                onClick={(e) => openQuickView(product, e)}
                                            >
                                                Quick View
                                            </span>
                                            <CartButton
                                                product={product}
                                                className="hover:underline cursor-pointer border border-l-[#D1B99B] border-r-0 border-t-0 border-b-0 px-6 py-1"
                                                onSuccess={() => closeModal()}
                                            />
                                        </div>
                                    </div>
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

            {/* Mobile View - Now matching TrendingNow structure */}
            <div className="block md:hidden max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                <div>
                    <h2 className="text-[32px] font-[400] text-[#1E1E1E] mb-8">Style & Substance</h2>
                </div>

                <div className="grid grid-cols-2 gap-[16px] w-full">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            className="group overflow-hidden flex flex-col w-full duration-200"
                        >
                            <div className="relative w-full aspect-[1/1] bg-[#F9F5F0] rounded-lg overflow-hidden">
                                <Image
                                    src={product.image || '/images/placeholder.jpg'}
                                    alt={product.name}
                                    fill
                                    className="object-cover object-center"
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleToggleLike(product.id);
                                    }}
                                    className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                                >
                                    <Heart
                                        className={`w-4 h-4 md:w-5 md:h-5 ${likedProducts.includes(product.id)
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
                                <CartButton
                                    product={product}
                                    className="w-full py-2 border border-[#D1B99B] text-[#3B2305] rounded-[4px] text-center text-[14px] font-medium hover:bg-[#F9F5F0] border-[0.5px] transition-colors"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Quick View Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
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
                                <p className="text-xl font-medium text-[#3B2305] mb-6">₦{selectedProduct.price.toLocaleString()}</p>

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
        </section>
    );
} 
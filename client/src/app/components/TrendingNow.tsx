'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useLikes } from '@/contexts/LikesContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import CartButton from './CartButton';
import { RateLimitError } from '@/utils/api-client';
import { ProductService } from '@/services/product.service';

export default function TrendingNow() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { state: { likedProducts }, toggleLike } = useLikes();
    const { addItem } = useCart();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await ProductService.getHomepageSections();
                console.log('Homepage sections response:', response);
                const trendingSection = response.find(section => section.title === 'Best Sellers');
                console.log('Found trending section:', trendingSection);
                if (trendingSection) {
                    setProducts(trendingSection.products);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching trending products:', error);
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
            <section className="py-16 bg-[#FEFBF4]">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
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
            </section>
        );
    }

    return (
        <section className="py-16 bg-[#FEFBF4]">
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px]">
                <h2 className="text-[32px] font-[400] text-[#3B2305] mb-8 font-macaw">Trending Now</h2>

                {/* Rate limit error message */}
                {rateLimitError && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {rateLimitError}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] w-full">
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
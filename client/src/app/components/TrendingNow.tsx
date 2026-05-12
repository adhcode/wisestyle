'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';
import { ProductService } from '@/services/product.service';

export default function TrendingNow() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
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
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
} 
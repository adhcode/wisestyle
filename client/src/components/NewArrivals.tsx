'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';
import { Loader2, RefreshCw } from 'lucide-react';

export default function NewArrivals() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/new-arrivals`);
            if (!response.ok) throw new Error('Failed to fetch new arrivals');
            const data = await response.json();
            setProducts(data);
            setRetryCount(0); // Reset retry count on success
        } catch (err) {
            console.error('Error fetching new arrivals:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch new arrivals. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);

            // Implement retry logic
            if (retryCount < MAX_RETRIES) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => {
                    fetchProducts();
                }, 2000 * (retryCount + 1)); // Exponential backoff
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleRetry = () => {
        setRetryCount(0);
        fetchProducts();
    };

    if (loading && !products.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error && !products.length) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                {retryCount < MAX_RETRIES ? (
                    <p className="text-sm text-gray-500 mb-4">
                        Retrying... ({retryCount + 1}/{MAX_RETRIES})
                    </p>
                ) : (
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Try Again</span>
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
                <Link
                    href={`/product/${product.slug}`}
                    key={product.id}
                    className="group relative block bg-white overflow-hidden"
                >
                    {/* Product Image */}
                    <div className="relative w-full pb-[125%] bg-[#F9F5F0] rounded-lg overflow-hidden">
                        <Image
                            src={product.image || product.images?.[0] || '/placeholder-product.png'}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                            priority
                        />
                    </div>

                    {/* Limited Tag */}
                    {product.isLimited && (
                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] px-1.5 py-1 rounded-full font-medium">
                            Limited Edition
                        </span>
                    )}

                    {/* Product Info */}
                    <div className="mt-3">
                        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{product.price}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
} 
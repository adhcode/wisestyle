'use client';
import { useState, useEffect } from 'react';
import { useLikes } from '@/contexts/LikesContext';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';

export default function WishlistPage() {
    const { state: { likedProducts }, toggleLike } = useLikes();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedProducts = async () => {
            if (likedProducts.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Fetch all products and filter by liked ones
                const allProducts = await ProductService.getProducts(1, 100); // Get more products to find liked ones
                const likedProductsData = allProducts.filter((product: Product) =>
                    likedProducts.includes(product.id)
                );
                setProducts(likedProductsData);
            } catch (error) {
                console.error('Error fetching liked products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedProducts();
    }, [likedProducts]);

    const handleToggleLike = async (productId: string) => {
        try {
            await toggleLike(productId);
            // Remove from local state immediately for better UX
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-[#3B2305]">Your Wishlist</h1>
                    <p className="text-[#3B2305] opacity-75">{products.length} item{products.length !== 1 ? 's' : ''}</p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8">Save items you love to your wishlist and shop them later.</p>
                        <Link
                            href="/products"
                            className="inline-block px-6 py-3 bg-[#3B2305] text-white rounded-lg hover:bg-[#4c2d08] transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="group relative bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition">
                                <Link href={`/product/${product.slug}`} className="block">
                                    <div className="relative w-full aspect-[211/300] bg-[#F9F5F0]">
                                        <Image
                                            src={product.image || '/images/placeholder-product.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover object-center"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                    </div>
                                </Link>

                                {/* Remove from wishlist button */}
                                <button
                                    onClick={() => handleToggleLike(product.id)}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10 hover:scale-110 transition-transform"
                                >
                                    <Heart className="w-5 h-5 fill-red-500 stroke-red-500" />
                                </button>

                                <div className="p-3 flex flex-col items-start">
                                    <Link href={`/product/${product.slug}`} className="block w-full">
                                        <span className="text-[16px] font-[600] text-[#3B2305] line-clamp-2">{product.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[16px] font-[500] text-[#3B2305]">₦{product.price.toLocaleString()}</span>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <span className="text-[14px] text-gray-500 line-through">₦{product.originalPrice.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 
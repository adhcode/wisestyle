'use client';
import { useState, useEffect } from 'react';
import { useLikes } from '@/contexts/LikesContext';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FEFBF4] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B2305]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FEFBF4] py-12 px-4">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#3B2305] mb-2">Your Wishlist</h1>
                    <p className="text-[#3B2305] opacity-75">
                        {products.length === 0 
                            ? 'No items yet' 
                            : `${products.length} item${products.length !== 1 ? 's' : ''} saved`
                        }
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-[#F9F5F0] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-10 h-10 text-[#C97203]" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Your wishlist is empty</h2>
                            <p className="text-gray-600 mb-8">
                                Save items you love by clicking the heart icon. Shop them later or share your wishlist with friends.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-[#3B2305] text-white rounded-lg hover:bg-[#4c2d08] transition-colors font-medium"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Start Shopping
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 
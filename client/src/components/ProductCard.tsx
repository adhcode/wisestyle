'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLikes } from '@/contexts/LikesContext';
import { Product } from '@/types/product';

export type { Product };

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const { state: { likedProducts }, toggleLike } = useLikes();
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsAddingToCart(true);

        const cartItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            description: product.description,
            categoryId: product.categoryId,
            image: product.image || '/images/products/placeholder-product.png',
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
            selectedSize: product.sizes?.[0]?.value || 'Default',
            selectedColor: product.colors?.[0]?.value || 'Default',
        };

        addItem(cartItem, { showModal: true });

        // Reset button state after 2 seconds
        setTimeout(() => {
            setIsAddingToCart(false);
        }, 2000);
    };

    const handleToggleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            await toggleLike(product.id);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    return (
        <div
            className="group relative block bg-white overflow-hidden"
            onMouseEnter={() => setShowQuickAdd(true)}
            onMouseLeave={() => setShowQuickAdd(false)}
        >
            <Link href={`/product/${product.slug}`} className="block">
                <div className="relative w-full pb-[125%] bg-[#F9F5F0] rounded-lg overflow-hidden">
                    <Image
                        src={product.image || '/placeholder-product.png'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        priority
                    />
                    
                    {/* Quick Add Button - Shows on hover (Desktop only) */}
                    <div 
                        className={`hidden md:block absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${
                            showQuickAdd ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                        }`}
                    >
                        <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                isAddingToCart
                                    ? 'bg-[#006c2c] text-white cursor-not-allowed'
                                    : 'bg-[#008A3A] text-white hover:bg-[#006c2c]'
                            }`}
                        >
                            {isAddingToCart ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    ADDED TO BAG
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4" />
                                    ADD TO BAG
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                {product.isLimited && (
                    <span className="absolute top-4 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs px-1.5 py-1 rounded-full font-medium">
                        Limited Edition
                    </span>
                )}
            </Link>
            
            <div className="p-4 pl-0">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mb-1.5 line-clamp-1 text-left">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center justify-start gap-2">
                    <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
                        ₦{(product.price).toLocaleString()}
                    </p>
                    <button
                        onClick={handleToggleLike}
                        className="flex items-center justify-center w-8 h-8"
                    >
                        <Heart
                            className={`w-4 h-4 ${
                                likedProducts.includes(product.id)
                                    ? 'fill-red-500 stroke-red-500'
                                    : 'stroke-gray-600'
                            }`}
                        />
                    </button>
                </div>
                
                {/* Mobile Add to Bag Button */}
                <div className="mt-3 md:hidden">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className={`w-full py-2 border rounded-[4px] text-center text-[14px] font-medium transition-all ${
                            isAddingToCart
                                ? 'bg-[#006c2c] text-white border-[#006c2c] cursor-not-allowed'
                                : 'border-[#D1B99B] text-[#3B2305] hover:bg-[#F9F5F0]'
                        }`}
                    >
                        {isAddingToCart ? (
                            <span className="flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" />
                                ADDED TO BAG
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Add to Bag
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { Trash, Plus, Minus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [coolWithProducts, setCoolWithProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Fetch related products from all categories
        const fetchRelatedProducts = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/featured`);
                if (response.ok) {
                    const data = await response.json();
                    setRelatedProducts(data.filter((p: Product) => !items.some(item => item.id === p.id)));
                }
            } catch (error) {
                console.error('Error fetching related products:', error);
            }
        };

        // Fetch "cool with" products
        const fetchCoolWithProducts = async () => {
            if (items.length > 0) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/slug/${items[0].slug}/similar`);
                    if (response.ok) {
                        const data = await response.json();
                        setCoolWithProducts(data.filter((p: Product) => !items.some(item => item.id === p.id)));
                    }
                } catch (error) {
                    console.error('Error fetching cool with products:', error);
                }
            }
        };

        fetchRelatedProducts();
        fetchCoolWithProducts();
    }, [items]);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#FFFCF8] flex flex-col items-center px-4 mt-16">
                <h1 className="text-2xl font-semibold text-[#3B2305] mb-2">Your bag is empty</h1>
                <p className="mb-4 text-[#3B2305]">Add some items to your bag to see them here.</p>
                <Link href="/" className="inline-block bg-[#C97203] hover:bg-[#B56503] text-white px-8 py-3 text-base rounded-[4px] font-medium font-inter transition-colors">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFCF8] flex flex-col">
            {/* Sticky Subtotal/Checkout Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex items-center justify-between px-4 py-3 sm:px-8 md:static md:border-none md:py-6 md:mb-0 md:mt-4 md:rounded-lg md:shadow-sm max-w-2xl md:max-w-4xl mx-auto w-full">
                <div>
                    <span className="text-xs font-medium tracking-wide text-[#3B2305] uppercase">Bag Sub-total</span>
                    <div className="text-lg font-bold text-[#3B2305]">₦{totalPrice.toLocaleString()}</div>
                </div>
                <Link href="/checkout" className="bg-[#C97203] hover:bg-[#B56503] text-white px-8 py-3 text-base rounded-[4px] font-medium font-inter transition-colors shadow">Checkout</Link>
            </div>

            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-[120px] pt-6 pb-32 md:pb-8">
                {/* Cart Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[16px]">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-[4px] overflow-hidden flex flex-col w-full shadow hover:shadow-md transition">
                            <div className="relative w-full aspect-[211/300] h-[300px]">
                                <Image
                                    src={item.image || '/images/placeholder.png'}
                                    alt={item.name}
                                    fill
                                    className="object-cover object-center"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                />
                            </div>
                            <div className="flex flex-col justify-between p-3 items-start">
                                <span className="text-[16px] font-[600] text-[#3B2305]">{item.name}</span>
                                <span className="text-[16px] font-[500] text-[#3B2305]">₦{item.price.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 px-3 items-center">
                                <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded font-medium uppercase">{item.selectedColor}</span>
                                <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded font-medium uppercase">{item.selectedSize}</span>
                                <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded font-medium">Qty {item.quantity}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 mt-4 mb-3">
                                <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"><Minus className="w-4 h-4" /></button>
                                <span className="w-8 text-center font-medium text-xs">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"><Plus className="w-4 h-4" /></button>
                                <button onClick={() => removeItem(item.id)} className="ml-auto text-gray-300 hover:text-red-500 p-1"><Trash className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* A Little Something Extra */}
                {relatedProducts.length > 0 && (
                    <div className="pt-8">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold tracking-tight text-gray-900 uppercase">A Little Something Extra</h2>
                            <span className="text-xs text-gray-500">{relatedProducts.length} items</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                            {relatedProducts.map((product) => (
                                <Link key={product.id} href={`/product/${product.slug}`} className="min-w-[140px] max-w-[140px] flex-shrink-0 group">
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                        <Image src={product.image || '/images/placeholder.png'} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div className="mt-2">
                                        <h3 className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">₦{product.price.toLocaleString()}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 
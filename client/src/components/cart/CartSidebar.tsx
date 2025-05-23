'use client';

import { useCart } from '@/contexts/CartContext';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CartSidebar() {
    const { state: { items, isOpen }, toggleCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
    const [isCheckingInventory, setIsCheckingInventory] = useState(false);

    // Prevent scroll when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleQuantityChange = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setIsCheckingInventory(true);
        try {
            // Check inventory availability
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/check-inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: itemId,
                    size: items.find(item => item.id === itemId)?.selectedSize,
                    color: items.find(item => item.id === itemId)?.selectedColor,
                    quantity: newQuantity,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to check inventory');
            }

            updateQuantity(itemId, newQuantity);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message || 'Not enough stock available');
            } else {
                toast.error('Not enough stock available');
            }
        } finally {
            setIsCheckingInventory(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleCart}
            />

            {/* Cart Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-medium">Shopping Cart ({totalItems})</h2>
                    <button
                        onClick={toggleCart}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto h-[calc(100vh-180px)]">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4">
                            <p className="text-gray-500 mb-4">Your cart is empty</p>
                            <Link
                                href="/products"
                                className="text-sm text-black underline"
                                onClick={toggleCart}
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {items.map((item) => (
                                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium">{item.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Size: {item.selectedSize} • Color: {item.selectedColor}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border rounded-lg">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                                    className="px-2 py-1 hover:bg-gray-100"
                                                    disabled={isCheckingInventory}
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 py-1">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    className="px-2 py-1 hover:bg-gray-100"
                                                    disabled={isCheckingInventory}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-sm text-red-500 hover:text-red-600"
                                                disabled={isCheckingInventory}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            ₦{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t p-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-base font-medium">Subtotal</span>
                            <span className="text-base font-medium">₦{totalPrice.toLocaleString()}</span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={toggleCart}
                            className="block w-full bg-black text-white text-center py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                        >
                            Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
} 
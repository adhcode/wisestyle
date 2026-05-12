'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check } from 'lucide-react';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        name: string;
        price: number;
        image: string;
        selectedSize?: string;
        selectedColor?: string;
        quantity: number;
    } | null;
    position?: { top: number; right: number };
}

export default function CartModal({ isOpen, onClose, item, position }: CartModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Auto-close modal after 5 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !item) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
            
            {/* Modal */}
            <div
                ref={modalRef}
                className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-[90vw] max-w-[380px] animate-slide-down"
                style={{
                    top: position ? `${position.top}px` : '80px',
                    right: position ? `${position.right}px` : '20px',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">Added to Bag</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Item Details */}
                <div className="p-4">
                    <div className="flex gap-3">
                        <div className="relative w-20 h-24 bg-[#F9F5F0] rounded-md overflow-hidden flex-shrink-0">
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                {item.name}
                            </h4>
                            <p className="text-sm font-semibold text-[#C97203] mb-2">
                                ₦{item.price.toLocaleString()}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                {item.selectedSize && item.selectedSize !== 'Default' && (
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                        Size: {item.selectedSize}
                                    </span>
                                )}
                                {item.selectedColor && item.selectedColor !== 'Default' && (
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                        Color: {item.selectedColor}
                                    </span>
                                )}
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                    Qty: {item.quantity}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex gap-2">
                    <Link
                        href="/cart"
                        className="flex-1 px-4 py-2.5 border-2 border-[#3B2305] text-[#3B2305] rounded-lg font-semibold text-sm hover:bg-[#3B2305] hover:text-white transition-colors text-center"
                        onClick={onClose}
                    >
                        View Bag
                    </Link>
                    <Link
                        href="/checkout"
                        className="flex-1 px-4 py-2.5 bg-[#008A3A] text-white rounded-lg font-semibold text-sm hover:bg-[#006c2c] transition-colors text-center"
                        onClick={onClose}
                    >
                        Checkout
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </>
    );
}

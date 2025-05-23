'use client';

import { CartProvider } from '@/contexts/CartContext'
import { LikesProvider } from '@/contexts/LikesContext'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LikesProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </LikesProvider>
    );
} 
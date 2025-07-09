'use client';

import { CartProvider } from '@/contexts/CartContext'
import { LikesProvider } from '@/contexts/LikesContext'
import { AuthProvider } from '@/contexts/AuthContext'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LikesProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </LikesProvider>
        </AuthProvider>
    );
} 
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from '@/components/cart/CartSidebar';

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Check if current path is an admin route
    const isAdminRoute = pathname?.startsWith('/admin');

    // Prevent hydration mismatch by not rendering until client-side
    if (!isClient) {
        return <main>{children}</main>;
    }

    return (
        <>
            {!isAdminRoute && <Header />}
            <main>{children}</main>
            {!isAdminRoute && <Footer />}
            {!isAdminRoute && <CartSidebar />}
        </>
    );
} 
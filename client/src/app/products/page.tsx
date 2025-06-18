/* Server Component wrapper for the Products route.  This file no longer contains any client-side hooks. */

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Client component (CSR only)
const ProductsClient = dynamic(() => import('./ProductsClient'), { ssr: false });

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">Loading…</div>}>
            <ProductsClient />
        </Suspense>
    );
} 
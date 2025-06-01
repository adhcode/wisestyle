'use client';

import { useState, useEffect } from 'react';
import Hero from './components/Hero';


import ProductSection, { Product } from './components/ProductSection';
import { ProductService } from '@/services/product.service';
import Link from 'next/link';
import ShopByCategory from './components/ShopByCategory';
import StyleAndSubstance from './components/StyleAndSubstance';
import TrendingNow from './components/TrendingNow';

export default function Home() {
    const [homepageSections, setHomepageSections] = useState<Record<string, Product[]>>({});

    // Fetch homepage sections
    useEffect(() => {
        ProductService.getHomepageSections()
            .then((sections: Record<string, Product[]>) => {
                // Ensure all products have a defined image
                const mappedSections: Record<string, Product[]> = {};
                Object.keys(sections).forEach((key) => {
                    mappedSections[key] = sections[key].map((product) => ({
                        ...product,
                        image: product.image || '/placeholder-product.png',
                    }));
                });
                setHomepageSections(mappedSections);
            })
            .catch((err) => {
                console.error('Failed to fetch homepage sections:', err);
            });
    }, []);

    return (
        <main>
            {/* Hero Section - Full Width */}
            <Hero />
            <ShopByCategory />
            <StyleAndSubstance />
            <TrendingNow />
            {/* Main Content */}



        </main>
    );
} 
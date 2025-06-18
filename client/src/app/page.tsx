'use client';

import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import ProductSection, { Product } from './components/ProductSection';
import { ProductService } from '@/services/product.service';
import Link from 'next/link';
import ShopByCategory from './components/ShopByCategory';
import StyleAndSubstance from './components/StyleAndSubstance';
import TrendingNow from './components/TrendingNow';

interface HomepageSection {
    id: string;
    title: string;
    products: Product[];
}

export default function Home() {
    const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([]);

    // Fetch homepage sections
    useEffect(() => {
        ProductService.getHomepageSections()
            .then((sections: HomepageSection[]) => {
                // Ensure all products have a defined image
                const mappedSections = sections.map(section => ({
                    ...section,
                    products: section.products.map(product => ({
                        ...product,
                        image: product.image || '/placeholder-product.png',
                    }))
                }));
                setHomepageSections(mappedSections);
            })
            .catch((err) => {
                console.error('Failed to fetch homepage sections:', err);
            });
    }, []);

    useEffect(() => {
        // Test server connection
        const testServerConnection = async () => {
            try {
                console.log('Testing server connection...');
                console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
                const data = await response.json();
                console.log('Server response:', data);
            } catch (error) {
                console.error('Server connection error:', error);
            }
        };

        testServerConnection();
    }, []);

    return (
        <main className="min-h-screen bg-[#FEFBF4]">
            <Hero />
            <ShopByCategory />
            <StyleAndSubstance />
            <TrendingNow />

        </main>
    );
} 
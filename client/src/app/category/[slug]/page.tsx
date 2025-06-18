import { CategoryService } from '@/services/category.service';
import { ProductService } from '@/services/product.service';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronRight, SlidersHorizontal, ArrowDownWideNarrow } from 'lucide-react';
import CategoryClient from './CategoryClient';

interface CategoryPageProps {
    params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    try {
        // Fetch data server-side
        const categoryData = await CategoryService.getCategoryBySlug(params.slug);
        const productsData = await ProductService.getProductsByCategory(params.slug);

        // If category not found, show 404
        if (!categoryData) {
            return notFound();
        }

        // Pass data to client component
        return <CategoryClient category={categoryData} initialProducts={productsData} />;
    } catch (error) {
        console.error('Error in CategoryPage:', error);
        return notFound();
    }
} 
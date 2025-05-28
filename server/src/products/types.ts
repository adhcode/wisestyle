import { Product as PrismaProduct, DisplaySection } from '@prisma/client';

export interface Product extends Omit<PrismaProduct, 'displaySection'> {
    category: {
        id: string;
        name: string;
        slug: string;
        type: string;
        image: string;
        description: string;
        isActive: boolean;
        displayOrder: number;
        parentId: string | null;
    };
    images: {
        id: string;
        url: string;
        productId: string;
    }[];
    displaySection: DisplaySection;
    isNewArrival: boolean;
    isLimitedEdition: boolean;
    isBestSeller: boolean;
}

export interface HomepageSection {
    id: string;
    title: string;
    products: Product[];
} 
import { Product as PrismaProduct, DisplaySection, ProductStatus } from '@prisma/client';

export type Product = PrismaProduct & {
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
    isNewArrival: boolean;
    isLimitedEdition: boolean;
    isBestSeller: boolean;
};

export interface HomepageSection {
    id: string;
    title: string;
    products: Product[];
} 
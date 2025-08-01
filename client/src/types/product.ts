export interface Size {
    id: string;
    name: string;
    value: string;
    category: string;
}

export interface Color {
    id: string;
    name: string;
    value: string;
    class: string;
}

export interface InventoryItem {
    sizeId: string;
    colorId: string;
    quantity: number;
    size?: Size;
    color?: Color;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    type: string;
    isActive: boolean;
    imageUrl?: string;
    image?: string;
    displayOrder: number;
    parentId?: string;
    parent?: Category;
    children: Category[];
    products?: any[];
    _count: {
        products: number;
        children: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ProductImage {
    id: string;
    url: string;
}

export interface ProductFormData {
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    categoryId: string;
    image?: string;
    images: string[];
    isLimited: boolean;
    sizes: string[];
    colors: string[];
    tags: string[];
    inventory: InventoryItem[];
    displaySection: 'NONE' | 'NEW_ARRIVAL' | 'TRENDING' | 'SALES';
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    description: string;
    categoryId: string;
    category?: Category;
    image?: string;
    images: string[];
    isLimited?: boolean;
    sizes: Size[];
    colors: Color[];
    tags: string[];
    inventory: InventoryItem[];
    displaySection: 'NONE' | 'NEW_ARRIVAL' | 'TRENDING' | 'SALES';
    createdAt: Date;
    updatedAt: Date;
    salePrice?: number;
}

export interface CartItem extends Product {
    quantity: number;
    selectedSize: string;
    selectedColor: string;
    selectedColorName?: string;
    selectedImage?: string;
} 
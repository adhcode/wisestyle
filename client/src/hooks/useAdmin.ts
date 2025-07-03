import { useCallback } from 'react';
import { useAuthHook } from '@/hooks/useAuth';
import { apiClient } from '@/utils/api-client';
import { Product, Category } from '@/types/product';

export interface CreateCategoryData {
    name: string;
    description?: string;
    type?: string;
    isSeasonal?: boolean;
    isActive?: boolean;
}

export interface UpdateCategoryData {
    name?: string;
    description?: string;
    type?: string;
    isSeasonal?: boolean;
    isActive?: boolean;
}

export interface CreateProductData {
    name: string;
    price: number;
    description: string;
    categoryId: string;
    image?: string;
    images: string[];
    isLimited?: boolean;
    sizes: string[];
    colors: string[];
    tags: string[];
    inventory: Array<{
        sizeId: string;
        colorId: string;
        quantity: number;
    }>;
    displaySection?: 'NONE' | 'NEW_ARRIVAL' | 'TRENDING' | 'SALES';
}

export interface UpdateProductData {
    name?: string;
    price?: number;
    description?: string;
    category?: string;
    stock?: number;
    images?: string[];
    isLimited?: boolean;
    sizes?: string[];
    colors?: any[];
    tags?: string[];
    isActive?: boolean;
}

export function useAdmin() {
    const { isSignedIn, isAdmin, isLoaded } = useAuthHook();

    // Dashboard
    const getDashboardData = useCallback(async () => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn || !isAdmin) {
            throw new Error('Not authorized');
        }
        return apiClient.get('/api/admin/dashboard', true);
    }, [isSignedIn, isAdmin, isLoaded]);

    const getUsers = useCallback(async () => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn || !isAdmin) {
            throw new Error('Not authorized');
        }
        return apiClient.get('/api/admin/users', true);
    }, [isSignedIn, isAdmin, isLoaded]);

    const getOrders = useCallback(async () => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn || !isAdmin) {
            throw new Error('Not authorized');
        }
        return apiClient.get('/api/admin/orders', true);
    }, [isSignedIn, isAdmin, isLoaded]);

    // Products
    const getProducts = async (): Promise<Product[]> => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.get('/api/products', true);
    };

    const createProduct = async (data: CreateProductData) => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.post('/api/products', data, true);
    };

    const updateProduct = async (id: string, data: UpdateProductData) => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.put(`/api/products/${id}`, data, true);
    };

    const deleteProduct = async (id: string) => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.delete(`/api/products/${id}`, true);
    };

    // Categories
    const getCategories = async (): Promise<Category[]> => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.get('/api/categories', true);
    };

    const createCategory = async (data: CreateCategoryData) => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.post('/api/categories', data, true);
    };

    const updateCategory = async (id: string, data: UpdateCategoryData) => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.put(`/api/categories/${id}`, data, true);
    };

    const deleteCategory = async (id: string) => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.delete(`/api/categories/${id}`, true);
    };

    // Category-specific methods
    const getLifestyleCategories = async (): Promise<Category[]> => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.get('/api/categories', true, { type: 'lifestyle' });
    };

    const getSeasonalCategories = async (): Promise<Category[]> => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.get('/api/categories', true, { isSeasonal: true });
    };

    const getActiveCategories = async (): Promise<Category[]> => {
        if (!isLoaded) {
            throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
            throw new Error('Not authorized');
        }
        return apiClient.get('/api/categories', true, { isActive: true });
    };

    return {
        getDashboardData,
        getUsers,
        getOrders,
        getProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        getCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        getLifestyleCategories,
        getSeasonalCategories,
        getActiveCategories,
    };
} 
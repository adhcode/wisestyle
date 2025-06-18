import { apiClient } from '@/utils/api-client';
import { Product, ProductFormData } from '@/types/product';

interface HomepageSection {
    id: string;
    title: string;
    products: Product[];
}

export const ProductService = {
    async getProducts(page = 1, limit = 10): Promise<Product[]> {
        return apiClient.get('/api/products', false, { page, limit });
    },

    async getProductBySlug(slug: string): Promise<Product> {
        return apiClient.get(`/api/products/slug/${slug}`, false);
    },

    async getProductsByCategory(categorySlug: string): Promise<Product[]> {
        return apiClient.get(`/api/products/category/${categorySlug}?includeChildren=true`, false);
    },

    async getFeaturedProducts(): Promise<Product[]> {
        return apiClient.get('/api/products/featured', false);
    },

    async getNewArrivals(): Promise<Product[]> {
        return apiClient.get('/api/products/new-arrivals', false);
    },

    async getLimitedEditionProducts(): Promise<Product[]> {
        return apiClient.get('/api/products/limited-edition', false);
    },

    async getHomepageSections(): Promise<HomepageSection[]> {
        // Check cache first
        const cachedData = localStorage.getItem('homepage_sections');
        const cachedTimestamp = localStorage.getItem('homepage_sections_timestamp');
        const now = Date.now();
        
        // If we have cached data and it's less than 5 minutes old, use it
        if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 5 * 60 * 1000) {
            return JSON.parse(cachedData) as HomepageSection[];
        }

        // Otherwise fetch from API
        const data = await apiClient.get<HomepageSection[]>('/api/products/homepage-sections', false);
        
        // Cache the new data
        localStorage.setItem('homepage_sections', JSON.stringify(data));
        localStorage.setItem('homepage_sections_timestamp', now.toString());
        
        return data;
    },

    async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
        return apiClient.get(`/api/products/${productId}/related?limit=${limit}`, false);
    },

    async createProduct(productData: ProductFormData): Promise<Product> {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to create product');
        }

        return response.json();
    },

    async deleteProduct(productId: string): Promise<void> {
        return apiClient.delete(`/api/products/${productId}`, true);
    }
}; 
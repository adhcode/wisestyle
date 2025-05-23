import { apiClient } from '@/utils/api-client';
import { Product, ProductFormData } from '@/types/product';

export const ProductService = {
    async getProducts(page = 1, limit = 10): Promise<Product[]> {
        return apiClient.get('/api/products', false, { page, limit });
    },

    async getProductBySlug(slug: string): Promise<Product> {
        return apiClient.get(`/api/products/slug/${slug}`, false);
    },

    async getProductsByCategory(category: string): Promise<Product[]> {
        return apiClient.get(`/api/products/category/${category}`, false);
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

    async getHomepageSections(): Promise<Record<string, Product[]>> {
        // Check cache first
        const cachedData = localStorage.getItem('homepage_sections');
        const cachedTimestamp = localStorage.getItem('homepage_sections_timestamp');
        const now = Date.now();
        
        // If we have cached data and it's less than 5 minutes old, use it
        if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 5 * 60 * 1000) {
            return JSON.parse(cachedData) as Record<string, Product[]>;
        }

        // Otherwise fetch from API
        const data = await apiClient.get<Record<string, Product[]>>('/api/products/homepage-sections', false);
        
        // Cache the new data
        localStorage.setItem('homepage_sections', JSON.stringify(data));
        localStorage.setItem('homepage_sections_timestamp', now.toString());
        
        return data;
    },

    async createProduct(productData: ProductFormData): Promise<Product> {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...productData,
                colors: productData.colors.map((color: string) => ({ name: color })),
                sizes: productData.sizes.map((size: string) => ({ name: size })),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create product');
        }

        return response.json();
    }
}; 
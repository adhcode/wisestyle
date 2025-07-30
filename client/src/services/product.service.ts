import { apiClient } from '@/utils/api-client';
import { Product, ProductFormData } from '@/types/product';

interface HomepageSection {
    id: string;
    title: string;
    products: Product[];
}

interface PaginatedResponse<T> {
    products: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export const ProductService = {
    async getProducts(page = 1, limit = 10): Promise<Product[]> {
        const response = await apiClient.get<Product[] | { products: Product[] }>('/api/products', false, { page, limit });
        // Handle both old format (array) and new format (object with products array)
        return Array.isArray(response) ? response : response.products || [];
    },

    async getProductsPaginated(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> {
        const params: any = { page, limit };
        if (search) params.search = search;
        return apiClient.get<PaginatedResponse<Product>>('/api/products', false, params);
    },

    async getProductById(id: string): Promise<Product> {
        return apiClient.get<Product>(`/api/products/id/${id}`, false);
    },

    async getProductBySlug(slug: string): Promise<Product> {
        return apiClient.get<Product>(`/api/products/slug/${slug}`, false);
    },

    async getProductsByCategory(categorySlug: string): Promise<Product[]> {
        return apiClient.get<Product[]>(`/api/products/category/${categorySlug}?includeChildren=true`, false);
    },

    async getFeaturedProducts(): Promise<Product[]> {
        return apiClient.get<Product[]>('/api/products/featured', false);
    },

    async getNewArrivals(): Promise<Product[]> {
        return apiClient.get<Product[]>('/api/products/new-arrivals', false);
    },

    async getLimitedEditionProducts(): Promise<Product[]> {
        return apiClient.get<Product[]>('/api/products/limited-edition', false);
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
        return apiClient.get<Product[]>(`/api/products/${productId}/related?limit=${limit}`, false);
    },

    async createProduct(productData: ProductFormData): Promise<Product> {
        return apiClient.post<Product>('/api/products', productData, true);
    },

    async updateProduct(productId: string, productData: Partial<ProductFormData>): Promise<Product> {
        return apiClient.patch<Product>(`/api/products/${productId}`, productData, true);
    },

    async deleteProduct(productId: string): Promise<void> {
        return apiClient.delete<void>(`/api/products/${productId}`, true);
    }
}; 
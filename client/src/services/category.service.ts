import { apiClient } from '@/utils/api-client';
import { Category } from '@/types/product';

export const CategoryService = {
  async getCategoryTree(): Promise<Category[]> {
    // Check localStorage cache first
    try {
      const cachedData = localStorage.getItem('category_tree');
      const cacheTimestamp = localStorage.getItem('category_tree_timestamp');
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour cache

      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < oneHour) {
        return JSON.parse(cachedData) as Category[];
      }
    } catch (error) {
      console.error('Error reading category cache:', error);
    }

    // Fetch from API if cache is empty or expired
    try {
      const data = await apiClient.get<Category[]>('/api/categories/tree', false, undefined, 'Category tree');
      
      // Cache the result
      try {
        localStorage.setItem('category_tree', JSON.stringify(data));
        localStorage.setItem('category_tree_timestamp', Date.now().toString());
      } catch (error) {
        console.error('Error caching categories:', error);
      }
      
      return data;
    } catch (error) {
      // If API fails, try to return any cached data even if expired
      try {
        const cachedData = localStorage.getItem('category_tree');
        if (cachedData) {
          console.warn('Using expired category cache due to API error');
          return JSON.parse(cachedData) as Category[];
        }
      } catch (cacheError) {
        console.error('Error reading expired cache:', cacheError);
      }
      
      // Re-throw the original error if no cache is available
      throw error;
    }
  },
  async getCategoryBySlug(slug: string): Promise<Category> {
    return apiClient.get(`/api/categories/${slug}`, false, undefined, 'Category');
  },
}; 
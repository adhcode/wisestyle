import { apiClient } from '@/utils/api-client';
import { Category } from '@/types/product';

export const CategoryService = {
  async getCategoryTree(): Promise<Category[]> {
    return apiClient.get('/api/categories/tree', false, undefined, 'Category tree');
  },
  async getCategoryBySlug(slug: string): Promise<Category> {
    return apiClient.get(`/api/categories/${slug}`, false, undefined, 'Category');
  },
}; 
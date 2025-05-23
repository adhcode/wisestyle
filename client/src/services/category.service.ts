import { apiClient } from '@/utils/api-client';

export const CategoryService = {
  async getCategoryTree() {
    return apiClient.get('/api/categories/tree', false, undefined, 'Category tree');
  },
  async getCategoryBySlug(slug: string) {
    return apiClient.get(`/api/categories/slug/${slug}`, false, undefined, 'Category');
  },
}; 
import { apiClient } from '@/utils/api-client';
import { Category } from '@/types';

export interface CreateCategoryDto {
    name: string;
    slug: string;
    description?: string;
    type: string;
    isActive?: boolean;
    imageUrl?: string;
    image?: string;
    displayOrder?: number;
    parentId?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryStats {
    total: number;
    active: number;
    inactive: number;
    root: number;
    subcategories: number;
}

class CategoryService {
    async getAll(includeInactive = false): Promise<Category[]> {
        return apiClient.get(`/api/categories?includeInactive=${includeInactive}`, false);
    }

    async getAllHierarchical(includeInactive = false): Promise<Category[]> {
        return apiClient.get(`/api/categories/hierarchical?includeInactive=${includeInactive}`, false);
    }

    async getById(id: string): Promise<Category> {
        return apiClient.get(`/api/categories/${id}`, false);
    }

    async getBySlug(slug: string): Promise<Category> {
        return apiClient.get(`/api/categories/slug/${slug}`, false);
    }

    async create(data: CreateCategoryDto): Promise<Category> {
        return apiClient.post('/api/categories', data, true);
    }

    async update(id: string, data: UpdateCategoryDto): Promise<Category> {
        return apiClient.patch(`/api/categories/${id}`, data, true);
    }

    async delete(id: string): Promise<void> {
        return apiClient.delete(`/api/categories/${id}`, true);
    }

    async toggleStatus(id: string): Promise<Category> {
        return apiClient.patch(`/api/categories/${id}/toggle-status`, {}, true);
    }

    async reorder(categoryOrders: { id: string; displayOrder: number }[]): Promise<{ message: string }> {
        return apiClient.post('/api/categories/reorder', categoryOrders, true);
    }

    async getStats(): Promise<CategoryStats> {
        return apiClient.get('/api/categories/stats', true);
    }

    // Utility methods
    generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    buildBreadcrumb(category: Category): Category[] {
        const breadcrumb: Category[] = [];
        let current: Category | undefined = category;

        while (current) {
            breadcrumb.unshift(current);
            current = current.parent;
        }

        return breadcrumb;
    }

    flattenCategories(categories: Category[]): Category[] {
        const flattened: Category[] = [];

        const flatten = (cats: Category[], level = 0) => {
            cats.forEach(cat => {
                flattened.push({ ...cat, displayOrder: level });
                if (cat.children && cat.children.length > 0) {
                    flatten(cat.children, level + 1);
                }
            });
        };

        flatten(categories);
        return flattened;
    }
}

export const categoryService = new CategoryService();
export { CategoryService };
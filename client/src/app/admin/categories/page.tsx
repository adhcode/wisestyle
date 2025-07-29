'use client';

import { useState, useEffect } from 'react';
import { useAuthHook } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/utils/api-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  parentId?: string;
  isActive: boolean;
  displayOrder: number;
  imageUrl?: string;
  _count?: {
    products: number;
    children: number;
  };
  children?: Category[];
  parent?: Category;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  type: string;
  parentId: string;
  isActive: boolean;
  displayOrder: number;
  imageUrl: string;
}

export default function AdminCategoriesPage() {
    const { isLoaded, isSignedIn, isAdmin } = useAuthHook();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        slug: '',
        description: '',
        type: 'product',
        parentId: '',
        isActive: true,
        displayOrder: 0,
        imageUrl: ''
    });

    useEffect(() => {
        console.log('Categories Page Auth State:', { isLoaded, isSignedIn, isAdmin });
        
        if (!isLoaded) return;

        if (!isSignedIn || !isAdmin) {
            console.log('Access denied - redirecting to sign-in');
            router.replace('/sign-in');
            return;
        }

        console.log('Auth check passed, loading categories...');
        fetchCategories();
    }, [isLoaded, isSignedIn, isAdmin, router]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await apiClient.get('/api/categories?includeInactive=true', false); // false = no auth required for GET
            console.log('Categories fetched:', data);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to organize categories hierarchically
    const organizeCategories = (categories: Category[]): Category[] => {
        const categoryMap = new Map<string, Category>();
        const rootCategories: Category[] = [];

        // First pass: create map of all categories
        categories.forEach(category => {
            categoryMap.set(category.id, { ...category, children: [] });
        });

        // Second pass: organize hierarchy
        categories.forEach(category => {
            const cat = categoryMap.get(category.id)!;
            if (category.parentId && categoryMap.has(category.parentId)) {
                const parent = categoryMap.get(category.parentId)!;
                parent.children = parent.children || [];
                parent.children.push(cat);
            } else {
                rootCategories.push(cat);
            }
        });

        return rootCategories;
    };

    // Helper function to get only parent categories (no children) for dropdown
    const getParentCategoriesOnly = (categories: Category[]): Category[] => {
        return categories.filter(category => !category.parentId);
    };

    // Helper function to flatten categories for display with indentation
    const flattenCategoriesForDisplay = (categories: Category[], level = 0): Array<Category & { level: number }> => {
        const result: Array<Category & { level: number }> = [];
        
        categories.forEach(category => {
            result.push({ ...category, level });
            if (category.children && category.children.length > 0) {
                result.push(...flattenCategoriesForDisplay(category.children, level + 1));
            }
        });
        
        return result;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            type: 'product',
            parentId: '',
            isActive: true,
            displayOrder: 0,
            imageUrl: ''
        });
        setEditingCategory(null);
        setShowForm(false);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            type: category.type,
            parentId: category.parentId || '',
            isActive: category.isActive,
            displayOrder: category.displayOrder,
            imageUrl: category.imageUrl || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isLoaded || !isSignedIn || !isAdmin) {
            alert('You must be logged in as an admin to perform this action');
            return;
        }
        
        try {
            const categoryData = {
                ...formData,
                parentId: formData.parentId || undefined,
                imageUrl: formData.imageUrl.trim() || undefined
            };

            console.log('Submitting category data:', categoryData);

            if (editingCategory) {
                await apiClient.patch(`/api/categories/${editingCategory.id}`, categoryData, true, 'Category');
            } else {
                await apiClient.post('/api/categories', categoryData, true, {}, 'Category');
            }

            await fetchCategories();
            resetForm();
            toast.success(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(`Failed to save category: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        
        if (!isLoaded || !isSignedIn || !isAdmin) {
            alert('You must be logged in as an admin to perform this action');
            return;
        }

        try {
            await apiClient.delete(`/api/categories/${id}`, true, 'Category');
            await fetchCategories();
            toast.success('Category deleted successfully!');
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(`Error deleting category: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleToggleStatus = async (id: string) => {
        if (!isLoaded || !isSignedIn || !isAdmin) {
            alert('You must be logged in as an admin to perform this action');
            return;
        }

        try {
            await apiClient.patch(`/api/categories/${id}/toggle-status`, {}, true, 'Category');
            await fetchCategories();
            toast.success('Category status updated!');
        } catch (error) {
            console.error('Error updating category status:', error);
            toast.error(`Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="space-y-6">
                <Card className="p-6">
                    <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Card className="p-6 bg-red-50 border border-red-200">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
                    <p className="text-red-600">{error}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Categories Management</h1>
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Category
                        </Button>
                    </div>
                </div>

                {showForm && (
                    <div className="mb-6 p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <h2 className="text-base sm:text-lg font-medium mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Slug</label>
                                    <Input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    >
                                        <option value="product">Product</option>
                                        <option value="blog">Blog</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Parent Category</label>
                                    <select
                                        name="parentId"
                                        value={formData.parentId}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {getParentCategoriesOnly(categories)
                                            .filter(category => !editingCategory || category.id !== editingCategory.id)
                                            .map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Only top-level categories can be selected as parents
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Display Order</label>
                                    <Input
                                        type="number"
                                        name="displayOrder"
                                        value={formData.displayOrder}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                    <Input
                                        type="text"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        rows={3}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleCheckboxChange}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm font-medium">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
                                <Button
                                    type="button"
                                    onClick={resetForm}
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                                    {editingCategory ? 'Update Category' : 'Add Category'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {flattenCategoriesForDisplay(organizeCategories(categories)).map(category => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div style={{ marginLeft: `${category.level * 20}px` }}>
                                                <div className="flex items-center">
                                                    {category.level > 0 && (
                                                        <span className="text-gray-400 mr-2">
                                                            {'└─ '}
                                                        </span>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                                        <div className="text-xs text-gray-500">{category.slug}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mb-1">
                                                {category.type}
                                            </span>
                                            {category.level > 0 && (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                                                    Subcategory
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div>{category._count?.products || 0} products</div>
                                            {category.children && category.children.length > 0 && (
                                                <div className="text-xs text-blue-600">
                                                    {category.children.length} subcategories
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Edit category"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(category.id)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                                title={category.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete category"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        No categories found. Click "Add Category" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {flattenCategoriesForDisplay(organizeCategories(categories)).map(category => (
                        <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div style={{ marginLeft: `${category.level * 12}px` }}>
                                    <div className="flex items-center mb-1">
                                        {category.level > 0 && (
                                            <span className="text-gray-400 mr-2 text-sm">
                                                {'└─ '}
                                            </span>
                                        )}
                                        <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                                    </div>
                                    <p className="text-xs text-gray-500">{category.slug}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="text-blue-600 hover:text-blue-900 p-1"
                                        title="Edit category"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(category.id)}
                                        className="text-yellow-600 hover:text-yellow-900 p-1"
                                        title={category.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Delete category"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {category.type}
                                </span>
                                {category.level > 0 && (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                        Subcategory
                                    </span>
                                )}
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                                <div>{category._count?.products || 0} products</div>
                                {category.children && category.children.length > 0 && (
                                    <div className="text-blue-600">
                                        {category.children.length} subcategories
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No categories found. Click "Add Category" to create one.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
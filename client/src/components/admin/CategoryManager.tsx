'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuthHook } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    type: string;
    isActive: boolean;
    imageUrl?: string;
    displayOrder: number;
    parentId?: string;
    parent?: Category;
    children: Category[];
    _count: {
        products: number;
        children: number;
    };
}

interface CategoryFormData {
    name: string;
    slug: string;
    description: string;
    type: string;
    isActive: boolean;
    imageUrl: string;
    displayOrder: number;
    parentId: string;
}

const CategoryManager: React.FC = () => {
    const { user, isLoading } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const isSignedIn = !!user;
    const { createCategory, updateCategory, deleteCategory } = useAdmin();
    const [categories, setCategories] = useState<Category[]>([]);
    const [hierarchicalCategories, setHierarchicalCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'flat' | 'hierarchical'>('hierarchical');

    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        slug: '',
        description: '',
        type: 'product',
        isActive: true,
        imageUrl: '',
        displayOrder: 0,
        parentId: ''
    });

    useEffect(() => {
        if (isLoading) return;

        if (!isSignedIn || !isAdmin) {
            return;
        }

        fetchCategories();
    }, [isLoading, isSignedIn, isAdmin]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { categoryService } = await import('../../services/category.service');
            
            console.log('Fetching categories...');
            
            const [flatData, hierarchicalData] = await Promise.all([
                categoryService.getAll(true),
                categoryService.getAllHierarchical(true)
            ]);

            console.log('Categories fetched:', { 
                flatCount: flatData.length, 
                hierarchicalCount: hierarchicalData.length 
            });
            
            if (flatData.length > 0) {
                console.log('Sample category with counts:', {
                    name: flatData[0].name,
                    productCount: flatData[0]._count?.products || 'No _count',
                    childrenCount: flatData[0]._count?.children || 'No _count',
                    fullCategory: flatData[0]
                });
            }
            
            // Log all categories with their product counts
            flatData.forEach(cat => {
                console.log(`Category "${cat.name}": ${cat._count?.products || 0} products, ${cat._count?.children || 0} children`);
            });

            setCategories(flatData);
            setHierarchicalCategories(hierarchicalData);
        } catch (error) {
            console.error('Error fetching categories:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Error fetching categories: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLoading || !isSignedIn || !isAdmin) {
            alert('You must be logged in as an admin to perform this action');
            return;
        }
        
        try {
            const { categoryService } = await import('../../services/category.service');
            
            const categoryData = {
                ...formData,
                parentId: formData.parentId || undefined
            };

            console.log('Submitting category data:', categoryData);
            console.log('Auth status:', { user, isLoading, isSignedIn, isAdmin });

            if (editingCategory) {
                await categoryService.update(editingCategory.id, categoryData);
                alert('Category updated successfully!');
            } else {
                await categoryService.create(categoryData);
                alert('Category created successfully!');
            }

            await fetchCategories();
            resetForm();
        } catch (error) {
            console.error('Error saving category:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error saving category';
            alert(`Failed to save category: ${errorMessage}`);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            type: category.type,
            isActive: category.isActive,
            imageUrl: category.imageUrl || '',
            displayOrder: category.displayOrder,
            parentId: category.parentId || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        
        if (isLoading || !isSignedIn || !isAdmin) {
            alert('You must be logged in as an admin to perform this action');
            return;
        }

        try {
            const { categoryService } = await import('../../services/category.service');
            await categoryService.delete(id);
            await fetchCategories();
            alert('Category deleted successfully!');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(error instanceof Error ? error.message : 'Error deleting category');
        }
    };

    const handleToggleStatus = async (id: string) => {
        if (isLoading || !isSignedIn || !isAdmin) {
            alert('You must be logged in as an admin to perform this action');
            return;
        }

        try {
            const { categoryService } = await import('../../services/category.service');
            await categoryService.toggleStatus(id);
            await fetchCategories();
        } catch (error) {
            console.error('Error updating category status:', error);
            alert(error instanceof Error ? error.message : 'Error updating category status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            type: 'product',
            isActive: true,
            imageUrl: '',
            displayOrder: 0,
            parentId: ''
        });
        setEditingCategory(null);
        setShowForm(false);
    };

    const generateSlug = async (name: string) => {
        const { categoryService } = await import('../../services/category.service');
        return categoryService.generateSlug(name);
    };

    const toggleExpanded = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const renderCategoryRow = (category: Category, level = 0) => (
        <div key={category.id} className="border-b border-gray-200">
            <div className="flex items-center py-3 px-4 hover:bg-gray-50">
                <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center flex-1">
                    {category.children.length > 0 && (
                        <button
                            onClick={() => toggleExpanded(category.id)}
                            className="mr-2 p-1 hover:bg-gray-200 rounded"
                        >
                            {expandedCategories.has(category.id) ? (
                                <ChevronDown size={16} />
                            ) : (
                                <ChevronRight size={16} />
                            )}
                        </button>
                    )}
                    
                    <div className="flex-1">
                        <div className="flex items-center">
                            <span className="font-medium">{category.name}</span>
                            <span className="ml-2 text-sm text-gray-500">({category.slug})</span>
                            {!category.isActive && (
                                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-600">
                            {category._count.products} products • {category._count.children} subcategories
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleToggleStatus(category.id)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                    >
                        {category.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    
                    <button
                        onClick={() => handleEdit(category)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>
                    
                    <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 hover:bg-gray-200 rounded text-red-600"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            
            {expandedCategories.has(category.id) && category.children.map(child => 
                renderCategoryRow(child, level + 1)
            )}
        </div>
    );

    if (isLoading) {
        return <div className="p-6">Loading authentication...</div>;
    }

    if (!isSignedIn || !isAdmin) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
                    <p className="text-red-600">You must be logged in as an admin to access this page.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="p-6">Loading categories...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Category Management</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('hierarchical')}
                            className={`px-3 py-1 rounded ${viewMode === 'hierarchical' ? 'bg-white shadow' : ''}`}
                        >
                            Tree View
                        </button>
                        <button
                            onClick={() => setViewMode('flat')}
                            className={`px-3 py-1 rounded ${viewMode === 'flat' ? 'bg-white shadow' : ''}`}
                        >
                            List View
                        </button>
                    </div>


                    <button
                        onClick={async () => {
                            try {
                                console.log('=== DEBUGGING PRODUCTS & CATEGORIES ===');
                                
                                // Test products endpoint
                                const productsResponse = await fetch('/api/products');
                                const products = await productsResponse.json();
                                console.log('Products in database:', products);
                                
                                // Test categories endpoint
                                const { categoryService } = await import('../../services/category.service');
                                const categories = await categoryService.getAll(true);
                                console.log('Categories with counts:', categories);
                                
                                // Show summary
                                alert(`Found ${products.length || 0} products and ${categories.length} categories. Check console for details.`);
                            } catch (error) {
                                console.error('Debug failed:', error);
                                alert(`Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            }
                        }}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-yellow-700 mr-2"
                    >
                        <span>Debug DB</span>
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h2>
                        
                        <form onSubmit={(e) => {
                            console.log('Form submitted with data:', formData);
                            handleSubmit(e);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={async (e) => {
                                        const name = e.target.value;
                                        const slug = formData.slug || await generateSlug(name);
                                        setFormData({
                                            ...formData,
                                            name,
                                            slug
                                        });
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <input
                                    type="text"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Parent Category</label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">No Parent (Root Category)</option>
                                    {categories
                                        .filter(cat => cat.id !== editingCategory?.id)
                                        .map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="mr-2"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 p-4">
                    <h2 className="font-semibold">
                        {viewMode === 'hierarchical' ? 'Category Tree' : 'All Categories'}
                    </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                    {viewMode === 'hierarchical' 
                        ? hierarchicalCategories.map(category => renderCategoryRow(category))
                        : categories.map(category => renderCategoryRow(category))
                    }
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;
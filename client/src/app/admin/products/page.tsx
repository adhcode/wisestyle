'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Package, Filter } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchProducts = async (page = 1, limit = itemsPerPage, search?: string) => {
        try {
            setLoading(true);
            
            // Try the paginated method first
            try {
                const data = await ProductService.getProductsPaginated(page, limit, search);
                if (data && typeof data === 'object' && 'products' in data) {
                    setProducts(data.products || []);
                    setPagination(data.pagination || null);
                    setCurrentPage(page);
                    return;
                }
            } catch (paginatedError) {
                // Fallback to basic method if paginated fails
                console.warn('Paginated method failed, using basic method:', paginatedError);
            }
            
            // Fallback to basic method
            const basicData = await ProductService.getProducts(page, limit);
            setProducts(Array.isArray(basicData) ? basicData : []);
            setPagination(null);
            setCurrentPage(page);
            
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to fetch products');
            setProducts([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchProducts(1, itemsPerPage);
    }, []);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts(1, itemsPerPage, searchTerm || undefined);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, itemsPerPage]);

    // Using server-side search now, so no client-side filtering needed
    const filteredProducts = products;

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        setDeleting(productId);
        try {
            await ProductService.deleteProduct(productId);
            toast.success('Product deleted successfully');
            // Refresh current page
            await fetchProducts(currentPage, itemsPerPage, searchTerm || undefined);
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        } finally {
            setDeleting(null);
        }
    };

    const handlePageChange = (page: number) => {
        fetchProducts(page, itemsPerPage, searchTerm || undefined);
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>

                {/* Content skeleton */}
                <div className="space-y-4">
                    {/* Mobile card skeletons */}
                    <div className="md:hidden space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border animate-pulse">
                                <div className="flex items-center space-x-4">
                                    <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table skeleton */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 border-b animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your product inventory and listings
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                </Link>
            </div>

            {/* Search and filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Products count and pagination info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-600">
                        {pagination ? (
                            <>
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} products
                            </>
                        ) : (
                            `${filteredProducts?.length || 0} product${(filteredProducts?.length || 0) !== 1 ? 's' : ''} found`
                        )}
                    </p>

                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600">per page</span>
                </div>
            </div>

            {/* Empty state */}
            {(filteredProducts?.length === 0) && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        {searchTerm ? 'No products found' : 'No products yet'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        {searchTerm
                            ? 'Try adjusting your search terms or clearing filters.'
                            : 'Get started by adding your first product to the inventory.'
                        }
                    </p>
                    {!searchTerm && (
                        <Link
                            href="/admin/products/new"
                            className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Your First Product
                        </Link>
                    )}
                </div>
            )}

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
                {filteredProducts && filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <Image
                                    src={product.image || '/images/placeholder.jpg'}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="rounded-lg object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="mt-2 flex items-center space-x-4 text-xs">
                                            <span className="text-gray-600">
                                                {product.category?.name || 'Uncategorized'}
                                            </span>
                                            <span className="text-lg font-semibold text-gray-900">
                                                ₦{product.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.displaySection !== 'NONE'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {product.displaySection !== 'NONE' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-2">
                                        <Link
                                            href={`/admin/products/${product.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            disabled={deleting === product.id}
                                            className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${deleting === product.id ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <Trash2 className={`w-4 h-4 ${deleting === product.id ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : null}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProducts && filteredProducts.length > 0 ? filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={product.image || '/images/placeholder.jpg'}
                                                    alt={product.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-lg object-cover"
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                    {product.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {product.category?.name || 'Uncategorized'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        ₦{product.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.displaySection !== 'NONE'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.displaySection !== 'NONE' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                disabled={deleting === product.id}
                                                className={`text-gray-400 hover:text-red-600 transition-colors ${deleting === product.id ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                <Trash2 className={`w-5 h-5 ${deleting === product.id ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {pagination.totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={!pagination.hasPrev}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                First
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.hasPrev}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            
                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                                pageNum === currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.hasNext}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.totalPages)}
                                disabled={!pagination.hasNext}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
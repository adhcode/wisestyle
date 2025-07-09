'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Package, Filter, MoreVertical } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await ProductService.getProducts();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        setDeleting(productId);
        try {
            await ProductService.deleteProduct(productId);
            setProducts(products.filter(p => p.id !== productId));
            toast.success('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        } finally {
            setDeleting(null);
        }
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

            {/* Products count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && !loading && (
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
                {filteredProducts.map((product) => (
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
                ))}
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
                            {filteredProducts.map((product) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
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
            <div className="animate-pulse">
                <div className="h-8 w-1/4 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-[#3B2305]">Products</h1>
                <Link
                    href="/admin/products/new"
                    className="bg-[#3B2305] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#4c2d08] transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#F9F5F0] text-[#3B2305]">
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-left">Price</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-[#FEFBF4]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <Image
                                                    src={product.image || '/images/placeholder.jpg'}
                                                    alt={product.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-md object-cover"
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-[#3B2305]">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.description?.slice(0, 50)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[#3B2305]">
                                        {product.category?.name || 'Uncategorized'}
                                    </td>
                                    <td className="px-4 py-3 text-[#3B2305]">
                                        ₦{product.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${product.displaySection !== 'NONE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.displaySection !== 'NONE' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-3">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                disabled={deleting === product.id}
                                                className={`text-red-600 hover:text-red-800 ${deleting === product.id ? 'opacity-50 cursor-not-allowed' : ''}`}
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
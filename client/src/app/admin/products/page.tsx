'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuthHook } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Search, Trash, Edit, RefreshCw } from 'lucide-react';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';

export default function ProductsPage() {
    const router = useRouter();
    const { getProducts, deleteProduct } = useAdmin();
    const { isLoaded, isSignedIn } = useAuthHook();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            router.push('/sign-in');
            return;
        }

        fetchProducts();
    }, [isLoaded, isSignedIn, router]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProducts();
            console.log('Fetched products:', data);
            setProducts(data);
            setRetryCount(0); // Reset retry count on success
        } catch (err) {
            console.error('Error fetching products:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);

            // Implement retry logic
            if (retryCount < MAX_RETRIES) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => {
                    fetchProducts();
                }, 2000 * (retryCount + 1)); // Exponential backoff
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await deleteProduct(id);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (err) {
            toast.error('Failed to delete product');
            console.error('Error deleting product:', err);
        }
    };

    const handleRetry = () => {
        setRetryCount(0);
        fetchProducts();
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                            <p className="mt-1 text-sm text-gray-500">Manage your store products</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={handleRetry}
                                variant="outline"
                                className="flex items-center space-x-2"
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </Button>
                            <Button
                                onClick={() => router.push('/admin/products/new')}
                                className="flex items-center space-x-2 bg-black hover:bg-gray-800"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Product</span>
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                                {retryCount < MAX_RETRIES && (
                                    <span className="text-sm text-red-500">
                                        Retrying... ({retryCount + 1}/{MAX_RETRIES})
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden">
                                    <div className="relative aspect-square">
                                        <Image
                                            src={product.image || product.images?.[0] || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute top-2 right-2 flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                                className="bg-white/80 hover:bg-white"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(product.id)}
                                                className="bg-white/80 hover:bg-white"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">${product.price}</span>
                                            <span className="text-sm text-gray-500">
                                                {product.sizes?.length || 0} sizes • {product.colors?.length || 0} colors
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
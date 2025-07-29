'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { ProductService } from '@/services/product.service';
import { Product, Category } from '@/types/product';
import { categoryService } from '@/services/category.service';
import NumberInput from '@/components/ui/NumberInput';

interface EditFormData {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    categoryId: string;
    images: string[];
    sizes: string[];
    colors: string[];
    tags: string[];
    displaySection: 'NONE' | 'NEW_ARRIVAL' | 'TRENDING' | 'SALES';
    isLimited: boolean;
}

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<EditFormData>({
        name: '',
        description: '',
        price: 0,
        originalPrice: undefined,
        categoryId: '',
        images: [],
        sizes: ['S', 'M', 'L', 'XL'], // Default sizes
        colors: ['Black', 'White'], // Default colors  
        tags: [],
        displaySection: 'NONE',
        isLimited: false
    });
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newTag, setNewTag] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Get available sizes based on category
    const getAvailableSizes = (categoryId: string) => {
        // Find the category by ID
        const findCategory = (categories: Category[], id: string): Category | null => {
            for (const category of categories) {
                if (category.id === id) return category;
                if (category.children) {
                    const found = findCategory(category.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const category = findCategory(categories, categoryId);
        if (!category) return [];

        // Get category name and check for specific patterns
        const categoryName = category.name.toLowerCase();

        // Footwear sizes (40, 41, 42, 43, 44, 45)
        if (categoryName.includes('footwear') || categoryName.includes('shoe') || categoryName.includes('sneaker') || categoryName.includes('boot')) {
            return ['40', '41', '42', '43', '44', '45'];
        }

        // Trouser/Jeans waist sizes (30, 31, 32, 33, 34, 36, 38, 40)
        if (categoryName.includes('trouser') || categoryName.includes('jean') || categoryName.includes('pant') || categoryName.includes('bottom')) {
            return ['30', '31', '32', '33', '34', '36', '38', '40'];
        }

        // Shirt sizes (XS, S, M, L, XL, XXL)
        if (categoryName.includes('shirt') || categoryName.includes('top') || categoryName.includes('t-shirt') || categoryName.includes('polo')) {
            return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        }

        // Accessories and watches (ONE SIZE)
        if (categoryName.includes('accessory') || categoryName.includes('watch') || categoryName.includes('bag') || categoryName.includes('hat')) {
            return ['ONE SIZE'];
        }

        // Default clothing sizes
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories first
                const categoriesData = await categoryService.getAllHierarchical();
                setCategories(categoriesData);
                setLoadingCategories(false);

                // Get product by ID using ProductService
                let productData: Product;
                try {
                    productData = await ProductService.getProductById(productId);
                } catch (error) {
                    console.log('Product not found by ID, trying fallback...');
                    // Fallback: get all products and find by ID
                    const allProducts = await ProductService.getProducts(1, 1000);
                    const foundProduct = allProducts.find(p => p.id === productId);
                    if (!foundProduct) {
                        throw new Error('Product not found');
                    }
                    productData = foundProduct;
                }

                setProduct(productData);
                setFormData({
                    name: productData.name,
                    description: productData.description || '',
                    price: productData.price,
                    originalPrice: productData.originalPrice || undefined,
                    discount: productData.discount || undefined,
                    categoryId: productData.categoryId,
                    images: Array.isArray(productData.images)
                        ? productData.images.map((img: any) => typeof img === 'string' ? img : img?.url || '')
                        : productData.image
                            ? [productData.image]
                            : [],
                    sizes: productData.sizes?.map(s => s.value || s.name) || ['S', 'M', 'L', 'XL'],
                    colors: productData.colors?.map(c => c.value || c.name) || ['Black', 'White'],
                    tags: productData.tags || [],
                    displaySection: productData.displaySection || 'NONE',
                    isLimited: productData.isLimited || false
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data');
                router.push('/admin/products');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchData();
        }
    }, [productId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setSaving(true);
        try {
            // Prepare the data in the format expected by the backend
            const updateData = {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                originalPrice: formData.originalPrice || null,
                discount: formData.discount || null,
                categoryId: formData.categoryId,
                image: formData.images[0] || '',
                images: formData.images,
                sizes: formData.sizes,
                colors: formData.colors,
                tags: formData.tags,
                isLimited: formData.isLimited,
                displaySection: formData.displaySection
            };

            console.log('Sending update data:', updateData);

            await ProductService.updateProduct(product.id, updateData);

            toast.success('Product updated successfully');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: keyof EditFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addImage = () => {
        if (newImageUrl.trim()) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, newImageUrl.trim()]
            }));
            setNewImageUrl('');
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#3B2305]" />
                    <span className="text-[#3B2305]">Loading product...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-8">
                <h1 className="text-2xl font-semibold text-[#3B2305] mb-4">Product Not Found</h1>
                <Link
                    href="/admin/products"
                    className="text-blue-600 hover:text-blue-800"
                >
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/admin/products"
                        className="flex items-center text-[#3B2305] hover:text-[#4c2d08] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Products
                    </Link>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <h1 className="text-2xl font-semibold text-[#3B2305]">
                        Edit Product: {product.name}
                    </h1>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-[#3B2305] border-b border-gray-200 pb-2">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.categoryId}
                                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                                    placeholder="e.g., shirts, jeans, accessories"
                                />
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900">Pricing</h4>
                            
                            {/* Regular Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (₦) *
                                </label>
                                <NumberInput
                                    value={formData.price}
                                    onChange={(value) => handleInputChange('price', value)}
                                    placeholder="Enter price"
                                    min={0}
                                    step={100}
                                    className="w-full md:w-1/2"
                                />
                                <p className="text-xs text-gray-500 mt-1">This is the selling price of the product</p>
                            </div>

                            {/* Sale Fields - Only show when SALES display section is selected */}
                            {formData.displaySection === 'SALES' && (
                                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                                    <div className="mb-4">
                                        <h5 className="text-sm font-medium text-orange-900">Sale Pricing</h5>
                                        <p className="text-xs text-orange-700">This product is marked for sale. Set the original price to show the discount.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Original Price (₦)
                                            </label>
                                            <NumberInput
                                                value={formData.originalPrice || 0}
                                                onChange={(value) => handleInputChange('originalPrice', value)}
                                                placeholder="Enter original price (before discount)"
                                                min={0}
                                                step={100}
                                                className="w-full md:w-1/2"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">This should be higher than the sale price to show the discount</p>
                                        </div>

                                        {/* Sale Price Preview */}
                                        {formData.originalPrice && formData.originalPrice > formData.price && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-green-700">Discount:</span>
                                                    <span className="font-semibold text-green-900">
                                                        {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% off
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-green-600 mt-1">
                                                    <span>Customer saves:</span>
                                                    <span>₦{(formData.originalPrice - formData.price).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-xs text-blue-700">
                                                💡 <strong>How it works:</strong> Customers will see the original price crossed out with the sale price prominently displayed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                                placeholder="Enter product description..."
                            />
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-[#3B2305] border-b border-gray-200 pb-2">
                            Product Images
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((image, index) => (
                                <div key={index} className="relative">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                        <Image
                                            src={image}
                                            alt={`Product image ${index + 1}`}
                                            width={200}
                                            height={200}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/images/placeholder-product.png';
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="Enter image URL"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={addImage}
                                className="px-4 py-2 bg-[#3B2305] text-white rounded-md hover:bg-[#4c2d08] transition-colors flex items-center"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Add Image
                            </button>
                        </div>
                    </div>

                    {/* Product Attributes */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-[#3B2305] border-b border-gray-200 pb-2">
                            Product Attributes
                        </h3>

                        {/* Sizes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Available Sizes
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.sizes.map((size, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#F9F5F0] text-[#3B2305] border"
                                    >
                                        {size}
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                sizes: prev.sizes.filter((_, i) => i !== index)
                                            }))}
                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <select
                                    onChange={(e) => {
                                        if (e.target.value && !formData.sizes.includes(e.target.value)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                sizes: [...prev.sizes, e.target.value]
                                            }));
                                            e.target.value = '';
                                        }
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                                    disabled={loadingCategories}
                                >
                                    <option value="">Select a size</option>
                                    {formData.categoryId ? (
                                        getAvailableSizes(formData.categoryId).map(size => (
                                            <option key={size} value={size} disabled={formData.sizes.includes(size)}>
                                                {size}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Please select a category first</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Colors */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Available Colors
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.colors.map((color, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#F9F5F0] text-[#3B2305] border"
                                    >
                                        {color === 'As Seen' ? (
                                            <span className="text-sm font-medium">As Seen</span>
                                        ) : (
                                            <>
                                                <span
                                                    className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                                    style={{ backgroundColor: color.toLowerCase() }}
                                                ></span>
                                                <span>{color}</span>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                colors: prev.colors.filter((_, i) => i !== index)
                                            }))}
                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <select
                                    onChange={(e) => {
                                        if (e.target.value && !formData.colors.includes(e.target.value)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                colors: [...prev.colors, e.target.value]
                                            }));
                                            e.target.value = '';
                                        }
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                                >
                                    <option value="">Select a color</option>
                                    {['Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Brown', 'Pink', 'Orange', 'As Seen'].map(color => (
                                        <option key={color} value={color} disabled={formData.colors.includes(color)}>
                                            {color}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Product Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-[#3B2305] border-b border-gray-200 pb-2">
                            Product Settings
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Section
                                </label>
                                <select
                                    value={formData.displaySection}
                                    onChange={(e) => handleInputChange('displaySection', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                                >
                                    <option value="NONE">Not Displayed</option>
                                    <option value="NEW_ARRIVAL">New Arrivals</option>
                                    <option value="TRENDING">Trending</option>
                                    <option value="SALES">Sales</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isLimited}
                                        onChange={(e) => handleInputChange('isLimited', e.target.checked)}
                                        className="rounded border-gray-300 text-[#3B2305] focus:ring-[#3B2305]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Limited Edition</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-[#3B2305] border-b border-gray-200 pb-2">
                            Tags
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#F9F5F0] text-[#3B2305]"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Enter tag"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-[#3B2305] text-white rounded-md hover:bg-[#4c2d08] transition-colors"
                            >
                                Add Tag
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Link
                            href="/admin/products"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-[#3B2305] text-white rounded-md hover:bg-[#4c2d08] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update Product
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 
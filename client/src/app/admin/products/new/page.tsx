'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { ProductFormData, Product, InventoryItem } from '@/types/product';
import { useAuthHook } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Loader2, Upload, X, Trash } from 'lucide-react';
import { Category } from '@/types/product';
import { UploadService } from '@/services/upload.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { ProductService } from '@/services/product.service';

const displaySections = [
    { value: 'NEW_ARRIVALS', label: 'New Arrivals' },
    { value: 'WORK_WEEKEND', label: 'Work-Weekend' },
    { value: 'EFFORTLESS', label: 'Effortless' },
    { value: 'NONE', label: 'None' },
] as const;

type DisplaySection = typeof displaySections[number]['value'];

export default function NewProductPage() {
    const router = useRouter();
    const { createProduct, getCategories } = useAdmin();
    const { isLoaded, isSignedIn } = useAuthHook();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        price: 0,
        description: '',
        categoryId: '',
        images: [],
        sizes: [],
        colors: [],
        tags: [],
        inventory: [],
        isLimited: false,
        displaySection: 'NONE',
    });

    // Add state for size-specific inventory
    const [sizeInventory, setSizeInventory] = useState<Record<string, number>>({});

    // Update color handling
    const [newColor, setNewColor] = useState('');

    // Get available sizes based on category
    const getAvailableSizes = (categoryId: string) => {
        switch (categoryId) {
            case 'cm9yfz37s000137mqjt6tedny': // Shirts
                return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            case 'cm9yfz38u000237mqupwl2ua2': // Bottoms
                return ['28', '30', '32', '34', '36', '38'];
            case 'cm9yfz39s000337mqgzbk91wn': // Footwears
                return ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
            case 'cm9yfz39y000437mqwggxil0e': // Accessories
                return ['ONE SIZE'];
            case 'cm9yfz3a3000537mq465axsth': // Activewears
                return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            case 'cm9yfz3ab000637mq798k8i7u': // Watches
                return ['ONE SIZE'];
            default:
                return [];
        }
    };

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            router.push('/sign-in');
            return;
        }

        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                setError('Failed to fetch categories. Please try again.');
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, [isLoaded, isSignedIn, getCategories, router]);

    // Update size inventory when category changes
    useEffect(() => {
        if (formData.categoryId) {
            const availableSizes = getAvailableSizes(formData.categoryId);
            const newInventory: Record<string, number> = {};
            availableSizes.forEach(size => {
                newInventory[size] = sizeInventory[size] || 0;
            });
            setSizeInventory(newInventory);
            setFormData(prev => ({
                ...prev,
                sizes: prev.sizes.filter(size => availableSizes.includes(size))
            }));
        }
    }, [formData.categoryId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if (images.length + files.length > 4) {
            setError('You can only upload up to 4 images');
            return;
        }

        setLoading(true);
        try {
            const { urls } = await UploadService.uploadMultipleFiles(Array.from(files));
            setImages([...images, ...urls]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload images');
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const [showPreview, setShowPreview] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdProduct, setCreatedProduct] = useState<{ name: string } | null>(null);

    const handlePreview = (e: React.FormEvent) => {
        e.preventDefault();
        setShowPreview(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!formData.categoryId) {
                throw new Error('Please select a category');
            }

            // Convert size inventory to inventory items
            const inventoryItems: InventoryItem[] = formData.sizes.flatMap(size =>
                formData.colors.map(color => ({
                    sizeId: size,
                    colorId: color,
                    quantity: sizeInventory[size] || 0
                }))
            );

            const productData: ProductFormData = {
                ...formData,
                inventory: inventoryItems
            };

            console.log('Submitting product data:', productData);
            const result = await ProductService.createProduct(productData);
            setCreatedProduct({ name: result.name });
            setShowPreview(false);
            setShowSuccess(true);
            toast.success('Product created successfully!');

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push('/admin/products');
            }, 2000);
        } catch (err) {
            console.error('Submit error:', err);
            setError(err instanceof Error ? err.message : 'Failed to create product');
            toast.error('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddColor = () => {
        if (!newColor) return;
        setFormData(prev => ({
            ...prev,
            colors: [...(prev.colors || []), newColor]
        }));
        setNewColor('');
    };

    const handleRemoveColor = (index: number) => {
        setFormData(prev => ({
            ...prev,
            colors: (prev.colors || []).filter((_, i) => i !== index)
        }));
    };

    // Update size handling
    const handleSizeToggle = (size: string) => {
        setFormData(prev => {
            const currentSizes = prev.sizes || [];
            const newSizes = currentSizes.includes(size)
                ? currentSizes.filter(s => s !== size)
                : [...currentSizes, size];
            return { ...prev, sizes: newSizes };
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-8 px-2 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl">
                <Card className="p-8 shadow-xl rounded-2xl bg-white">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Add New Product</h1>
                    <form className="space-y-6" onSubmit={handlePreview}>
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full"
                                placeholder="Enter product name"
                            />
                        </div>
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                required
                                className="w-full"
                                min={0}
                                step={0.01}
                                placeholder="Enter price"
                            />
                        </div>
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={value => setFormData({ ...formData, categoryId: value })}
                                required
                                className="w-full"
                            >
                                <option value="" disabled>Select category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </Select>
                        </div>
                        {/* Display Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Section</label>
                            <Select
                                value={formData.displaySection}
                                onValueChange={(value) => setFormData({ ...formData, displaySection: value as DisplaySection })}
                                required
                                className="w-full"
                            >
                                {displaySections.map(section => (
                                    <option key={section.value} value={section.value}>{section.label}</option>
                                ))}
                            </Select>
                        </div>
                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                className="w-full"
                                rows={3}
                                placeholder="Enter product description"
                            />
                        </div>
                        {/* Sizes and Inventory */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sizes and Inventory</label>
                            {formData.categoryId ? (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {getAvailableSizes(formData.categoryId).map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => handleSizeToggle(size)}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${(formData.sizes || []).includes(size)
                                                    ? 'bg-black text-white shadow-md'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    {(formData.sizes || []).length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {(formData.sizes || []).map((size) => (
                                                <div key={size} className="flex items-center space-x-4">
                                                    <label className="text-sm font-medium text-gray-700 min-w-[60px]">
                                                        {size}
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={sizeInventory[size] || 0}
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value) || 0;
                                                            setSizeInventory(prev => ({
                                                                ...prev,
                                                                [size]: value
                                                            }));
                                                        }}
                                                        className="w-24"
                                                        placeholder="Qty"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Please select a category to see available sizes</p>
                            )}
                        </div>
                        {/* Colors */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Colors</label>
                            <div className="flex flex-wrap gap-3">
                                {formData.colors.map((color, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-6 h-6 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span>{color}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveColor(index)}
                                            className="text-red-500"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                            <Input
                                type="text"
                                value={formData.tags.join(', ')}
                                onChange={(e) => {
                                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                                    setFormData({ ...formData, tags });
                                }}
                                placeholder="e.g. summer, casual, trendy"
                                className="w-full"
                            />
                        </div>
                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (up to 4)</label>
                            <div className="grid grid-cols-2 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-40 object-cover rounded-lg shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 4 && (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center hover:border-gray-400 transition-colors bg-white">
                                        <label className="cursor-pointer w-full h-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <div className="text-center">
                                                <Upload className="h-10 w-10 mx-auto text-gray-400" />
                                                <span className="mt-2 block text-sm font-medium text-gray-500">
                                                    Upload Images
                                                </span>
                                                <span className="mt-1 block text-xs text-gray-400">
                                                    PNG, JPG up to 4MB
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto bg-black hover:bg-gray-900 text-white font-semibold rounded-lg px-6 py-3 shadow-md transition-colors duration-200"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Preview
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-3 shadow-md transition-colors duration-200"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Save Product
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Preview Product</DialogTitle>
                        <DialogDescription>
                            Review the product details before creating
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-2">Basic Information</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium">Name:</span> {formData.name}</p>
                                <p><span className="font-medium">Price:</span> ${formData.price}</p>
                                <p><span className="font-medium">Category:</span> {categories.find(c => c.id === formData.categoryId)?.name}</p>
                                <p><span className="font-medium">Description:</span> {formData.description}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Variants</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium">Sizes:</span> {(formData.sizes || []).join(', ')}</p>
                                <p><span className="font-medium">Colors:</span> {(formData.colors || []).join(', ')}</p>
                                <p><span className="font-medium">Tags:</span> {(formData.tags || []).join(', ')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Inventory</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {(formData.sizes || []).map(sizeId => (
                                <div key={sizeId} className="space-y-2">
                                    <h4 className="font-medium">{sizeId}</h4>
                                    {(formData.colors || []).map(colorId => {
                                        const inventoryItem = (formData.inventory || []).find(
                                            item => item.sizeId === sizeId && item.colorId === colorId
                                        );
                                        return (
                                            <div key={`${sizeId}-${colorId}`} className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full"
                                                    style={{ backgroundColor: colorId }}
                                                />
                                                <span>{inventoryItem?.quantity || 0} units</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreview(false)}
                            className="px-6"
                        >
                            Back to Edit
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 min-w-[120px] bg-black hover:bg-gray-800"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Product'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Success!</DialogTitle>
                        <DialogDescription>
                            Product "{createdProduct?.name}" has been created successfully.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            onClick={() => router.push('/admin/products')}
                            className="px-6"
                        >
                            View Products
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
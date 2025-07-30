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
import { Loader2, Upload, X, Trash, Star, Trash2 } from 'lucide-react';
import { UploadService } from '@/services/upload.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { ProductService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { Category } from '@/types';
import Image from 'next/image';
import NumberInput from '@/components/ui/NumberInput';

const displaySections = [
    { value: 'NONE', label: 'None' },
    { value: 'NEW_ARRIVAL', label: 'New Arrival' },
    { value: 'TRENDING', label: 'Trending' },
    { value: 'SALES', label: 'Sales' }
] as const;

type DisplaySection = typeof displaySections[number]['value'];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const AVAILABLE_COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Brown', value: '#964B00' },
    { name: 'Gray', value: '#808080' },
    { name: 'As Seen', value: 'as-seen' },
];

export default function NewProductPage() {
    const router = useRouter();
    const { createProduct, getCategories } = useAdmin();
    const { isLoaded, isSignedIn } = useAuthHook();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        price: 0,
        originalPrice: 0,
        description: '',
        categoryId: '',
        image: '',
        images: [],
        isLimited: false,
        sizes: [],
        colors: [],
        tags: [],
        inventory: [],
        displaySection: 'NONE'
    });

    // Add state for size-specific inventory
    const [sizeInventory, setSizeInventory] = useState<Record<string, number>>({});

    // Update color handling
    const [newColor, setNewColor] = useState('');

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
        if (!isLoaded) return;

        if (!isSignedIn) {
            router.push('/sign-in');
            return;
        }

        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAllHierarchical();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [isLoaded, isSignedIn, router]);

    // Update size inventory when category changes
    useEffect(() => {
        if (formData.categoryId) {
            const availableSizes = getAvailableSizes(formData.categoryId);
            const newInventory: Record<string, number> = {};
            availableSizes.forEach(size => {
                newInventory[size] = sizeInventory[size] || 0;
            });
            setSizeInventory(newInventory);

            // Clear selected sizes that are no longer available for this category
            setSelectedSizes(prev => prev.filter(size => availableSizes.includes(size)));
            setFormData(prev => ({
                ...prev,
                sizes: prev.sizes.filter(size => availableSizes.includes(size))
            }));
        }
    }, [formData.categoryId, categories]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        if (images.length + files.length > 4) {
            toast.error('You can only upload up to 4 images');
            return;
        }

        setUploadingImages(true);
        try {
            const { urls } = await UploadService.uploadMultipleFiles(files);
            const newImages = [...images, ...urls];
            setImages(newImages);
            setFormData(prev => ({
                ...prev,
                image: newImages[mainImageIndex], // Main image
                images: newImages // All images
            }));
            toast.success('Images uploaded successfully');
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);

        // If removing the main image, set the first available image as main
        if (index === mainImageIndex) {
            const newMainIndex = newImages.length > 0 ? 0 : -1;
            setMainImageIndex(newMainIndex);
            setFormData(prev => ({
                ...prev,
                image: newImages[newMainIndex] || '',
                images: newImages
            }));
        } else {
            // If removing a non-main image and it's before the main image, adjust main image index
            if (index < mainImageIndex) {
                setMainImageIndex(prev => prev - 1);
            }
            setFormData(prev => ({
                ...prev,
                images: newImages
            }));
        }
    };

    const setAsMainImage = (index: number) => {
        setMainImageIndex(index);
        setFormData(prev => ({
            ...prev,
            image: images[index],
            images: images
        }));
        toast.success('Main image updated');
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

            if (!formData.image) {
                throw new Error('Please upload at least one image');
            }

            // Convert size inventory to inventory items
            const inventoryItems: InventoryItem[] = formData.sizes.flatMap(size =>
                formData.colors.map(color => ({
                    sizeId: size,
                    colorId: color,
                    quantity: sizeInventory[size] || 0
                }))
            );

            // Ensure image URLs are properly formatted
            const productData: ProductFormData = {
                ...formData,
                inventory: inventoryItems,
                // Ensure image URLs are absolute
                image: formData.image.startsWith('http') ? formData.image : `${process.env.NEXT_PUBLIC_API_URL}${formData.image}`,
                images: formData.images.map(img =>
                    img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL}${img}`
                )
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
            const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
            setError(errorMessage);
            toast.error(errorMessage);
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
        setSelectedSizes(prev => {
            const newSizes = prev.includes(size)
                ? prev.filter(s => s !== size)
                : [...prev, size];

            // Update inventory when removing a size
            if (!newSizes.includes(size)) {
                setInventory(prev => {
                    const newInventory = { ...prev };
                    delete newInventory[size];
                    return newInventory;
                });
            }

            setFormData(prevForm => ({
                ...prevForm,
                sizes: newSizes,
                inventory: Object.entries(inventory)
                    .filter(([sizeId]) => newSizes.includes(sizeId))
                    .flatMap(([sizeId, colorQuantities]) =>
                        Object.entries(colorQuantities).map(([colorId, quantity]) => ({
                            sizeId,
                            colorId,
                            quantity
                        }))
                    )
            }));

            return newSizes;
        });
    };

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        setUploading(true);
        try {
            const { url } = await UploadService.uploadFile(file);
            setFormData(prev => ({ ...prev, image: url }));
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [inventory, setInventory] = useState<Record<string, Record<string, number>>>({});

    const handleColorToggle = (color: string) => {
        setSelectedColors(prev => {
            const newColors = prev.includes(color)
                ? prev.filter(c => c !== color)
                : [...prev, color];

            // Update inventory when removing a color
            if (!newColors.includes(color)) {
                setInventory(prev => {
                    const newInventory = { ...prev };
                    Object.keys(newInventory).forEach(size => {
                        delete newInventory[size][color];
                    });
                    return newInventory;
                });
            }

            setFormData(prevForm => ({
                ...prevForm,
                colors: newColors,
                inventory: Object.entries(inventory)
                    .flatMap(([sizeId, colorQuantities]) =>
                        Object.entries(colorQuantities)
                            .filter(([colorId]) => newColors.includes(colorId))
                            .map(([colorId, quantity]) => ({
                                sizeId,
                                colorId,
                                quantity
                            }))
                    )
            }));

            return newColors;
        });
    };

    const handleInventoryChange = (size: string, color: string, quantity: number) => {
        setInventory(prev => ({
            ...prev,
            [size]: {
                ...(prev[size] || {}),
                [color]: quantity
            }
        }));

        setFormData(prevForm => ({
            ...prevForm,
            inventory: [
                ...Object.entries(inventory)
                    .filter(([s, c]) => s !== size || Object.keys(c)[0] !== color)
                    .flatMap(([sizeId, colorQuantities]) =>
                        Object.entries(colorQuantities).map(([colorId, qty]) => ({
                            sizeId,
                            colorId,
                            quantity: qty
                        }))
                    ),
                { sizeId: size, colorId: color, quantity }
            ]
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-8 px-2 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl">
                <Card className="p-8 shadow-xl rounded-2xl bg-white">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Add New Product</h1>
                    <form className="space-y-6" onSubmit={handlePreview}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (₦)
                                </label>
                                <NumberInput
                                    value={formData.price}
                                    onChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
                                    placeholder="Enter price"
                                    min={0}
                                    step={100}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Section
                                </label>
                                <select
                                    value={formData.displaySection}
                                    onChange={e => setFormData(prev => ({ ...prev, displaySection: e.target.value as DisplaySection }))}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                                >
                                    {displaySections.map(section => (
                                        <option key={section.value} value={section.value}>
                                            {section.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Show Original Price field only when Sales is selected */}
                            {formData.displaySection === 'SALES' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Original Price (₦)
                                    </label>
                                    <NumberInput
                                        value={formData.originalPrice}
                                        onChange={(value) => setFormData(prev => ({ ...prev, originalPrice: value }))}
                                        placeholder="Enter original price (before discount)"
                                        min={0}
                                        step={100}
                                        className="w-full"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        This should be higher than the sale price to show the discount
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    required
                                    value={formData.categoryId}
                                    onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                                    disabled={loadingCategories}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <>
                                            {/* Parent category - disabled */}
                                            <option key={category.id} value={category.id} disabled style={{ fontWeight: 'bold', color: '#666' }}>
                                                {category.name} (Parent Category)
                                            </option>
                                            {/* Child categories - enabled and indented */}
                                            {category.children?.map(child => (
                                                <option key={child.id} value={child.id}>
                                                    ↳ {child.name}
                                                </option>
                                            ))}
                                        </>
                                    ))}
                                </select>
                                {loadingCategories && (
                                    <div className="mt-2 text-sm text-gray-500">
                                        Loading categories...
                                    </div>
                                )}
                                <p className="mt-2 text-sm text-gray-500">
                                    Please select a specific subcategory. Products added to subcategories will automatically appear in their parent categories.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Images (up to 4)
                            </label>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="cursor-pointer bg-white px-4 py-2 border rounded-md hover:bg-gray-50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <Upload className="w-5 h-5" />
                                            <span>Choose Images</span>
                                        </div>
                                    </label>
                                    {uploadingImages && (
                                        <Loader2 className="w-5 h-5 animate-spin text-[#3B2305]" />
                                    )}
                                </div>

                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {images.map((url, index) => (
                                            <div key={url} className="relative group">
                                                <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${index === mainImageIndex ? 'border-[#3B2305]' : 'border-gray-200'}`}>
                                                    <Image
                                                        src={url}
                                                        alt={`Product image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <div className="flex space-x-2">
                                                        {index !== mainImageIndex && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setAsMainImage(index)}
                                                                className="p-1 bg-white rounded-full hover:bg-gray-100"
                                                                title="Set as main image"
                                                            >
                                                                <Star className="w-4 h-4 text-[#3B2305]" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="p-1 bg-white rounded-full hover:bg-gray-100"
                                                            title="Remove image"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {index === mainImageIndex && (
                                                    <div className="absolute top-2 left-2 bg-[#3B2305] text-white text-xs px-2 py-1 rounded">
                                                        Main
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <p className="text-sm text-gray-500">
                                    Upload up to 4 images. The first image will be the main product image.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isLimited}
                                    onChange={e => setFormData(prev => ({ ...prev, isLimited: e.target.checked }))}
                                    className="rounded text-[#3B2305] focus:ring-[#3B2305]"
                                />
                                <span className="text-sm font-medium text-gray-700">Limited Edition</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.tags.join(', ')}
                                onChange={(e) => {
                                    const tags = e.target.value
                                        .split(',')
                                        .map(tag => tag.trim())
                                        .filter(Boolean);
                                    setFormData(prev => ({ ...prev, tags }));
                                }}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305]"
                                placeholder="e.g. summer, casual, trendy"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Enter tags separated by commas
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Sizes
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {formData.categoryId ? (
                                        getAvailableSizes(formData.categoryId).map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => handleSizeToggle(size)}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedSizes.includes(size)
                                                    ? 'bg-[#3B2305] text-white'
                                                    : 'bg-white text-[#3B2305] border border-[#3B2305] hover:bg-[#F9F5F0]'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">Please select a category first to see available sizes</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Colors
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_COLORS.map(color => (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => handleColorToggle(color.name)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${selectedColors.includes(color.name)
                                                ? 'bg-[#3B2305] text-white'
                                                : 'bg-white text-[#3B2305] border border-[#3B2305] hover:bg-[#F9F5F0]'
                                                }`}
                                        >
                                            {color.value === 'as-seen' ? (
                                                <span className="text-sm font-medium">As Seen</span>
                                            ) : (
                                                <>
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: color.value }}
                                                    />
                                                    <span>{color.name}</span>
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedSizes.length > 0 && selectedColors.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Inventory
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedSizes.map(size => (
                                            selectedColors.map(color => (
                                                <div key={`${size}-${color}`} className="flex items-center space-x-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-700">
                                                            {size} - {color}
                                                        </div>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={inventory[size]?.[color] || 0}
                                                            onChange={(e) => handleInventoryChange(size, color, parseInt(e.target.value) || 0)}
                                                            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B2305] text-sm"
                                                            placeholder="Quantity"
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploadingImages}
                                className={`bg-[#3B2305] text-white px-6 py-2 rounded-md hover:bg-[#4c2d08] transition-colors ${(loading || uploadingImages) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Creating...</span>
                                    </div>
                                ) : (
                                    'Create Product'
                                )}
                            </button>
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
                                <div>
                                    <span className="font-medium">Price:</span> ₦{formData.price.toLocaleString()}
                                    {formData.displaySection === 'SALES' && formData.originalPrice && formData.originalPrice > 0 && (
                                        <span className="ml-2 text-gray-500 line-through">
                                            ₦{formData.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <p><span className="font-medium">Display Section:</span> {displaySections.find(s => s.value === formData.displaySection)?.label}</p>
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
                                        const quantity = inventoryItem?.quantity || 0;

                                        // Only show inventory if quantity is greater than 0
                                        if (quantity > 0) {
                                            return (
                                                <div key={`${sizeId}-${colorId}`} className="flex items-center gap-2">
                                                    {colorId === 'As Seen' ? (
                                                        <span className="text-sm font-medium text-gray-700">As Seen</span>
                                                    ) : (
                                                        <div
                                                            className="w-6 h-6 rounded-full"
                                                            style={{ backgroundColor: colorId }}
                                                        />
                                                    )}
                                                    <span>{quantity} units</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Show message if no inventory is set */}
                        {!(formData.inventory || []).some(item => item.quantity > 0) && (
                            <p className="text-gray-500 italic">No inventory quantities set</p>
                        )}
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
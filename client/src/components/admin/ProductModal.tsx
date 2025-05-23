import { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { ProductFormData, InventoryItem } from '@/types/product';
import { toast } from 'react-hot-toast';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormData) => void;
    product?: ProductFormData;
}

const initialFormData: ProductFormData = {
    name: '',
    price: 0,
    categoryId: '',
    description: '',
    images: [],
    sizes: [],
    colors: [],
    tags: [],
    inventory: [],
    isLimited: false
};

const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductModal({
    isOpen,
    onClose,
    onSubmit,
    product,
}: ProductModalProps) {
    const [formData, setFormData] = useState<ProductFormData>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [newColor, setNewColor] = useState('');
    const [newTag, setNewTag] = useState('');
    const [newSize, setNewSize] = useState('');
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);

    useEffect(() => {
        if (product) {
            setFormData(product);
            setUploadedImages(product.images || []);
            setInventory(product.inventory || []);
        } else {
            setFormData(initialFormData);
            setUploadedImages([]);
            setInventory([]);
        }
    }, [product]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('images', file);
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to upload images');

            const data = await response.json();
            setUploadedImages([...uploadedImages, ...data.urls]);
            setFormData(prev => ({ ...prev, images: [...prev.images || [], ...data.urls] }));
            toast.success('Images uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload images');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...uploadedImages];
        newImages.splice(index, 1);
        setUploadedImages(newImages);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleAddColor = () => {
        if (!newColor) return;
        setFormData(prev => ({
            ...prev,
            colors: [...prev.colors, newColor],
        }));
        setNewColor('');
    };

    const handleRemoveColor = (index: number) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.filter((_, i) => i !== index),
        }));
    };

    const handleAddSize = () => {
        if (!newSize) return;
        setFormData(prev => ({
            ...prev,
            sizes: [...prev.sizes, newSize],
        }));
        setNewSize('');
    };

    const handleRemoveSize = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index),
        }));
    };

    const handleAddTag = () => {
        if (!newTag) return;
        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, newTag],
        }));
        setNewTag('');
    };

    const handleRemoveTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index),
        }));
    };

    const handleInventoryChange = (sizeId: string, colorId: string, quantity: number) => {
        const existingItem = inventory.find(
            item => item.sizeId === sizeId && item.colorId === colorId
        );

        if (existingItem) {
            setInventory(prev =>
                prev.map(item =>
                    item.sizeId === sizeId && item.colorId === colorId
                        ? { ...item, quantity: Number(quantity) || 0 }
                        : item
                )
            );
        } else {
            setInventory(prev => [...prev, { sizeId, colorId, quantity: Number(quantity) || 0 }]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Validate inventory
            const hasInventory = inventory.length > 0;
            if (!hasInventory) {
                toast.error('Please set inventory for at least one size/color combination');
                return;
            }

            // Check if all size/color combinations have inventory
            const allCombinationsHaveInventory = formData.sizes.every(sizeId =>
                formData.colors.every(colorId =>
                    inventory.some(
                        item => item.sizeId === sizeId && item.colorId === colorId
                    )
                )
            );

            if (!allCombinationsHaveInventory) {
                toast.error('Please set inventory for all size/color combinations');
                return;
            }

            // Prepare the data to match the backend DTO exactly
            const submitData = {
                name: formData.name,
                price: formData.price,
                originalPrice: formData.originalPrice,
                description: formData.description,
                categoryId: formData.categoryId,
                image: formData.image,
                images: formData.images,
                isLimited: formData.isLimited,
                sizes: formData.sizes,
                colors: formData.colors,
                tags: formData.tags,
                inventory: inventory
            };

            console.log('Submitting data:', submitData);
            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Failed to save product');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {product ? 'Edit Product' : 'Add Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                            </label>
                            <input
                                type="number"
                                value={formData.price || 0}
                                onChange={(e) =>
                                    setFormData({ ...formData, price: Number(e.target.value) || 0 })
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        categoryId: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="clothing">Clothing</option>
                                <option value="accessories">Accessories</option>
                                <option value="shoes">Shoes</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Images
                        </label>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {uploadedImages.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={image}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <Trash className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Colors
                        </label>
                        <div className="space-y-2">
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
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value)}
                                    className="w-10 h-10"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddColor}
                                    className="bg-blue-500 text-white p-2 rounded-lg"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sizes
                        </label>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {formData.sizes.map((size, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                                    >
                                        <span>{size}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSize(index)}
                                            className="text-red-500"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={newSize}
                                    onChange={(e) => setNewSize(e.target.value)}
                                    className="flex-1 border rounded-lg px-3 py-2"
                                >
                                    <option value="">Select a size</option>
                                    {defaultSizes.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddSize}
                                    className="bg-blue-500 text-white p-2 rounded-lg"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                                    >
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(index)}
                                            className="text-red-500"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    className="flex-1 border rounded-lg px-3 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="bg-blue-500 text-white p-2 rounded-lg"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Inventory
                        </label>
                        <div className="space-y-4">
                            {formData.sizes.map(sizeId => (
                                <div key={sizeId} className="space-y-2">
                                    <h3 className="font-medium">{sizeId}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {formData.colors.map(colorId => {
                                            const inventoryItem = inventory.find(
                                                item => item.sizeId === sizeId && item.colorId === colorId
                                            );
                                            return (
                                                <div key={`${sizeId}-${colorId}`} className="flex items-center gap-2">
                                                    <div
                                                        className="w-6 h-6 rounded-full"
                                                        style={{ backgroundColor: colorId }}
                                                    />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={inventoryItem?.quantity || 0}
                                                        onChange={(e) =>
                                                            handleInventoryChange(
                                                                sizeId,
                                                                colorId,
                                                                Number(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-20 border rounded-lg px-2 py-1"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 
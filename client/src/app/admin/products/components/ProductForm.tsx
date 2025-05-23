import { useState } from 'react';
import ProductImageUpload from './ProductImageUpload';

interface ProductFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
}

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';

export default function ProductForm({ initialData, onSubmit }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        images: initialData?.images || [],
        sizes: initialData?.sizes || ['XS', 'S', 'M', 'L', 'XL'] as Size[],
        // ... other fields
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={4}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                    min="0"
                    step="0.01"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <ProductImageUpload
                    images={formData.images}
                    onChange={(images) => setFormData({ ...formData, images })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                    {(['XS', 'S', 'M', 'L', 'XL'] as Size[]).map((size) => (
                        <label key={size} className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.sizes.includes(size)}
                                onChange={(e) => {
                                    const newSizes = e.target.checked
                                        ? [...formData.sizes, size]
                                        : formData.sizes.filter((s: Size) => s !== size);
                                    setFormData({ ...formData, sizes: newSizes });
                                }}
                                className="rounded border-gray-300 text-[#C97203] focus:ring-[#C97203]"
                            />
                            <span className="ml-2 text-sm text-gray-600">{size}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="bg-[#C97203] text-white px-4 py-2 rounded-md hover:bg-[#B36702] transition-colors"
                >
                    {initialData ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </form>
    );
} 
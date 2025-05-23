import { useState } from 'react';
import Image from 'next/image';
import { X, Plus } from 'lucide-react';

interface ProductImageWithColor {
    url: string;
    color?: string;
    colorName?: string;
}

interface ProductImageUploadProps {
    images: ProductImageWithColor[];
    onChange: (images: ProductImageWithColor[]) => void;
}

const COLOR_OPTIONS = [
    { value: '#000000', name: 'Black' },
    { value: '#FFFFFF', name: 'White' },
    { value: '#FF0000', name: 'Red' },
    { value: '#0000FF', name: 'Blue' },
    { value: '#008000', name: 'Green' },
    { value: '#FFFF00', name: 'Yellow' },
    { value: '#FFA500', name: 'Orange' },
    { value: '#800080', name: 'Purple' },
    { value: '#A52A2A', name: 'Brown' },
    { value: '#808080', name: 'Gray' },
];

export default function ProductImageUpload({ images, onChange }: ProductImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        try {
            const newImages: ProductImageWithColor[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Here you would typically upload the file to your server/storage
                // For now, we'll use a local URL
                const url = URL.createObjectURL(file);
                newImages.push({ url });
            }

            onChange([...images, ...newImages]);
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    const handleColorChange = (index: number, color: string, colorName: string) => {
        const newImages = [...images];
        newImages[index] = {
            ...newImages[index],
            color,
            colorName
        };
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div key={index} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                            <Image
                                src={image.url}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <div className="mt-2 space-y-2">
                            <select
                                value={image.color || ''}
                                onChange={(e) => {
                                    const option = COLOR_OPTIONS.find(opt => opt.value === e.target.value);
                                    handleColorChange(index, e.target.value, option?.name || '');
                                }}
                                className="w-full text-sm border border-gray-200 rounded-md p-1"
                            >
                                <option value="">Select Color</option>
                                {COLOR_OPTIONS.map((color) => (
                                    <option key={color.value} value={color.value}>
                                        {color.name}
                                    </option>
                                ))}
                            </select>
                            {image.color && (
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-200"
                                        style={{ backgroundColor: image.color }}
                                    />
                                    <span className="text-sm text-gray-600">{image.colorName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <label className="aspect-square relative rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors cursor-pointer flex items-center justify-center">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                    <div className="text-center">
                        <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Add Images</span>
                    </div>
                </label>
            </div>
            {uploading && (
                <p className="text-sm text-gray-500">Uploading images...</p>
            )}
        </div>
    );
} 
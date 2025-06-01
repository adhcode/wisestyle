import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { ShoppingBag } from 'lucide-react';

interface CartButtonProps {
    product: Product;
    className?: string;
    onSuccess?: () => void;
}

export default function CartButton({ product, className = '', onSuccess }: CartButtonProps) {
    const { addItem } = useCart();

    const handleAddToCart = () => {
        const cartItem = {
            id: product.id.toString(),
            name: product.name,
            slug: product.slug,
            price: product.price,
            description: product.description || '',
            categoryId: product.categoryId || '',
            image: product.image,
            images: product.images || [product.image],
            isLimited: product.isLimited || false,
            sizes: product.sizes || [],
            colors: product.colors || [],
            tags: product.tags || [],
            inventory: product.inventory || [],
            displaySection: product.displaySection || 'NONE',
            createdAt: product.createdAt || new Date(),
            updatedAt: product.updatedAt || new Date(),
            quantity: 1,
            selectedSize: product.sizes?.[0]?.value || 'Default',
            selectedColor: product.colors?.[0]?.value || 'Default',
        };

        addItem(cartItem);
        onSuccess?.();
    };

    return (
        <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-2 ${className}`}
        >
            <ShoppingBag className="w-5 h-5" />
            Add to Cart
        </button>
    );
} 
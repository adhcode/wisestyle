import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '@/types/product';

interface CartItem extends Product {
    quantity: number;
    selectedSize: string;
    selectedColor: string;
}

interface CartContextType {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addItem: (item: CartItem, options?: { skipToast?: boolean }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Calculate total items and price whenever items change
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Check cart expiry on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            const cartAddedAt = localStorage.getItem('cartAddedAt');
            if (cartAddedAt && Date.now() - Number(cartAddedAt) > 60 * 60 * 1000) {
                // More than 1 hour has passed, clear cart
                localStorage.removeItem('cart');
                localStorage.removeItem('cartAddedAt');
                setItems([]);
            } else if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(items));
            if (items.length > 0 && !localStorage.getItem('cartAddedAt')) {
                localStorage.setItem('cartAddedAt', Date.now().toString());
            }
            if (items.length === 0) {
                localStorage.removeItem('cartAddedAt');
            }
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }, [items]);

    const addItem = (item: CartItem, options?: { skipToast?: boolean }) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(
                i => i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor
            );

            if (existingItem) {
                return prevItems.map(i =>
                    i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }

            return [...prevItems, item];
        });

        if (!options?.skipToast) {
            toast.success("It's in the bag! We'll hold it for 1 hour.", {
                position: 'bottom-center',
                style: {
                    borderRadius: '10px',
                    background: '#222',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                    padding: '8px 20px',
                    textAlign: 'center',
                    minWidth: '120px',
                    maxWidth: '90vw',
                    marginBottom: '32px',
                },
                duration: 1800,
            });
        }
    };

    const removeItem = (id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        toast.success('Item removed from cart', {
            icon: '🗑️',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    const updateQuantity = (id: string, quantity: number) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        toast.success('Cart cleared', {
            icon: '🧹',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    const toggleCart = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
                totalPrice,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                isOpen,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
} 
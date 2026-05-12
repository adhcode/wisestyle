import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    addItem: (item: CartItem, options?: { showModal?: boolean }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    toggleCart: () => void;
    isLoaded: boolean;
    lastAddedItem: CartItem | null;
    showCartModal: boolean;
    setShowCartModal: (show: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
    const [showCartModal, setShowCartModal] = useState(false);

    // Calculate total items and price whenever items change
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Load cart from localStorage on mount
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        try {
            const savedCart = localStorage.getItem('wisestyle_cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                // Validate that it's an array of valid items
                if (Array.isArray(parsedCart)) {
                    setItems(parsedCart);
                }
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            // Clear corrupted cart data
            localStorage.removeItem('wisestyle_cart');
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save cart to localStorage whenever it changes (but only after initial load)
    useEffect(() => {
        // Only run on client side and after initial load
        if (typeof window === 'undefined' || !isLoaded) return;

        try {
            localStorage.setItem('wisestyle_cart', JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }, [items, isLoaded]);

    const addItem = (item: CartItem, options?: { showModal?: boolean }) => {
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

        // Store the last added item for the modal
        setLastAddedItem(item);

        // Show modal if requested (default is true)
        if (options?.showModal !== false) {
            setShowCartModal(true);
        }
    };

    const removeItem = (id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
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
                isLoaded,
                lastAddedItem,
                showCartModal,
                setShowCartModal,
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
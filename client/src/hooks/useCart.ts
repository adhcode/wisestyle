import { useState, useEffect } from 'react';
import { CartItem } from '@/types/product';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedItems = localStorage.getItem('cart');
    if (savedItems) {
      setCartItems(JSON.parse(savedItems));
    }
  }, []);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        cartItem => 
          cartItem.id === item.id && 
          cartItem.selectedSize === item.selectedSize && 
          cartItem.selectedColor === item.selectedColor
      );

      if (existingItemIndex > -1) {
        const newItems = [...prev];
        newItems[existingItemIndex].quantity += item.quantity;
        localStorage.setItem('cart', JSON.stringify(newItems));
        return newItems;
      }

      const newItems = [...prev, item];
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const removeFromCart = (itemId: string, selectedSize: string, selectedColor: string) => {
    setCartItems(prev => {
      const newItems = prev.filter(
        item => 
          !(item.id === itemId && 
            item.selectedSize === selectedSize && 
            item.selectedColor === selectedColor)
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const updateQuantity = (itemId: string, selectedSize: string, selectedColor: string, quantity: number) => {
    setCartItems(prev => {
      const newItems = prev.map(item => {
        if (
          item.id === itemId && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
        ) {
          return { ...item, quantity };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
} 
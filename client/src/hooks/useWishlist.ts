import { useState, useEffect } from 'react';

export function useWishlist() {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedItems = localStorage.getItem('wishlist');
    if (savedItems) {
      setLikedItems(new Set(JSON.parse(savedItems)));
    }
  }, []);

  const toggleLikeItem = (itemId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      localStorage.setItem('wishlist', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const isLiked = (itemId: string) => likedItems.has(itemId);

  return {
    likedItems,
    toggleLikeItem,
    isLiked
  };
} 
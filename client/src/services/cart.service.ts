import { CartItem } from '@/types/product';
import { apiClient } from '@/utils/api-client';

export const CartService = {
    async getCart(): Promise<{ items: CartItem[] }> {
        return apiClient.get('/api/cart');
    },

    async addToCart(item: CartItem): Promise<{ items: CartItem[] }> {
        return apiClient.post('/api/cart', item);
    },

    async updateQuantity(itemId: string | number, quantity: number): Promise<{ items: CartItem[] }> {
        return apiClient.patch(`/api/cart/${itemId}`, { quantity });
    },

    async removeFromCart(itemId: string | number): Promise<{ items: CartItem[] }> {
        return apiClient.delete(`/api/cart/${itemId}`);
    },

    async clearCart(): Promise<{ items: CartItem[] }> {
        return apiClient.delete('/api/cart');
    }
}; 
import { apiClient } from '@/utils/api-client';

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
    product: {
        id: string;
        name: string;
        image?: string;
        images?: Array<{ url: string }>;
    };
}

export interface Order {
    id: string;
    total: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    email: string;
    phone: string;
    shippingAddress: {
        name?: string;
        address: string;
        city: string;
        state: string;
        postal: string;
        country: string;
        phone?: string;
    };
    billingAddress: {
        name?: string;
        address: string;
        city: string;
        state: string;
        postal: string;
        country: string;
    };
    shippingMethod: string;
    shippingCost: number;
    items: OrderItem[];
    user?: {
        id: string;
        firstName?: string;
        lastName?: string;
        email: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface OrderStats {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
}

export const OrdersService = {
    async getAllOrders(): Promise<Order[]> {
        return apiClient.get('/api/orders', true);
    },

    async getOrderById(id: string): Promise<Order> {
        return apiClient.get(`/api/orders/${id}`, true);
    },

    async getOrdersByStatus(status: string): Promise<Order[]> {
        return apiClient.get(`/api/orders/status/${status}`, true);
    },

    async updateOrderStatus(id: string, status: string): Promise<Order> {
        return apiClient.put(`/api/orders/${id}/status`, { status }, true);
    },

    async getOrderStats(): Promise<OrderStats> {
        return apiClient.get('/api/orders/stats', true);
    },

    async getMyOrders(): Promise<Order[]> {
        return apiClient.get('/api/orders/my-orders', true);
    },

    // Helper functions for pickup orders
    getPickupOrders(orders: Order[]): Order[] {
        return orders.filter(order => 
            order.shippingMethod?.toLowerCase().includes('pickup')
        );
    },

    getShippingOrders(orders: Order[]): Order[] {
        return orders.filter(order => 
            !order.shippingMethod?.toLowerCase().includes('pickup')
        );
    },

    isPickupOrder(order: Order): boolean {
        return order.shippingMethod?.toLowerCase().includes('pickup') || false;
    },

    getPickupLocation(order: Order): string {
        if (!this.isPickupOrder(order)) return '';
        return order.shippingMethod.replace('Pickup - ', '');
    },

    getPickupAddress(order: Order): string {
        if (!this.isPickupOrder(order)) return '';
        return order.shippingAddress.address;
    }
};
import { apiClient } from '@/utils/api-client';

export interface PaymentResponse {
    status: string;
    message: string;
    data: {
        authorization_url?: string;
        reference?: string;
    };
}

export const PaymentService = {
    async initializePaystackPayment(orderId: string, amount: number, email: string): Promise<PaymentResponse> {
        return apiClient.post('/api/payment/initialize/paystack', {
            orderId,
            amount,
            email,
        });
    },

    async verifyPaystackPayment(reference: string): Promise<PaymentResponse> {
        return apiClient.get(`/api/payment/verify/paystack/${reference}`);
    },
}; 
import { apiClient } from '@/utils/api-client';

export interface PaymentResponse {
    status: string;
    message: string;
    data: {
        link?: string;
        authorization_url?: string;
        reference?: string;
        tx_ref?: string;
    };
}

export const PaymentService = {
    async initializeFlutterwavePayment(
        orderId: string, 
        amount: number, 
        email: string, 
        paymentMethod: 'card' | 'bank_transfer' | 'ng' = 'card'
    ): Promise<PaymentResponse> {
        return apiClient.post('/api/payment/initialize/flutterwave', {
            orderId,
            amount,
            email,
            paymentMethod,
        });
    },

    async initializePaystackPayment(orderId: string, amount: number, email: string): Promise<PaymentResponse> {
        return apiClient.post('/api/payment/initialize/paystack', {
            orderId,
            amount,
            email,
        });
    },

    async verifyFlutterwavePayment(transactionId: string): Promise<PaymentResponse> {
        return apiClient.get(`/api/payment/verify/flutterwave/${transactionId}`);
    },

    async verifyPaystackPayment(reference: string): Promise<PaymentResponse> {
        return apiClient.get(`/api/payment/verify/paystack/${reference}`);
    },
}; 
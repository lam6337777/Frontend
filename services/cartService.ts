import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { CartItemResponse, CartRequest } from '@/types/cart';

export const cartService = {
    getCart: async (): Promise<ApiResponse<CartItemResponse[]>> => {
        const response = await apiClient.get<ApiResponse<CartItemResponse[]>>('/cart');
        return response.data;
    },

    addToCart: async (data: CartRequest): Promise<ApiResponse<CartItemResponse>> => {
        const response = await apiClient.post<ApiResponse<CartItemResponse>>('/cart', data);
        return response.data;
    },

    updateCartItem: async (id: number, quantity: number): Promise<ApiResponse<CartItemResponse>> => {
        const response = await apiClient.put<ApiResponse<CartItemResponse>>(`/cart/${id}`, null, {
            params: { quantity },
        });
        return response.data;
    },

    removeCartItem: async (id: number): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/cart/${id}`);
        return response.data;
    },

    clearCart: async (): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<ApiResponse<void>>('/cart');
        return response.data;
    },
};

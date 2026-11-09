import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { ProductResponse } from '@/types/product';

export const wishlistService = {
    getWishlist: async (): Promise<ApiResponse<ProductResponse[]>> => {
        const response = await apiClient.get<ApiResponse<ProductResponse[]>>('/wishlist');
        return response.data;
    },

    getIds: async (): Promise<ApiResponse<string[]>> => {
        const response = await apiClient.get<ApiResponse<string[]>>('/wishlist/ids');
        return response.data;
    },

    add: async (productId: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.post<ApiResponse<void>>(`/wishlist/${encodeURIComponent(productId)}`);
        return response.data;
    },

    remove: async (productId: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/wishlist/${encodeURIComponent(productId)}`);
        return response.data;
    },
};

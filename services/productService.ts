import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { Page, ProductFiltersResponse, ProductResponse } from '@/types/product';

export const productService = {
    getProductFilters: async (): Promise<ApiResponse<ProductFiltersResponse>> => {
        const response = await apiClient.get<ApiResponse<ProductFiltersResponse>>('/products/filters');
        return response.data;
    },

    getProducts: async (params?: {
        categoryName?: string;
        brandName?: string;
        minPrice?: number;
        maxPrice?: number;
        productSize?: string;
        q?: string;
        sortBy?: string;
        page?: number;
        size?: number;
    }): Promise<ApiResponse<Page<ProductResponse>>> => {
        const response = await apiClient.get<ApiResponse<Page<ProductResponse>>>('/products', { params });
        return response.data;
    },

    getProductById: async (id: string): Promise<ApiResponse<ProductResponse>> => {
        const response = await apiClient.get<ApiResponse<ProductResponse>>(`/products/${id}`);
        return response.data;
    },

    searchProducts: async (params: {
        q: string;
        page?: number;
        size?: number;
    }): Promise<ApiResponse<Page<ProductResponse>>> => {
        const response = await apiClient.get<ApiResponse<Page<ProductResponse>>>('/products/search', { params });
        return response.data;
    },

    getFeaturedProducts: async (limit: number = 8): Promise<ApiResponse<ProductResponse[]>> => {
        const response = await apiClient.get<ApiResponse<ProductResponse[]>>('/products/featured', {
            params: { limit },
        });
        return response.data;
    },

    getNewArrivals: async (limit: number = 3): Promise<ApiResponse<Page<ProductResponse>>> => {
        return productService.getProducts({ sortBy: 'newest', size: limit });
    },

    getBestSellers: async (limit: number = 4): Promise<ApiResponse<Page<ProductResponse>>> => {
        return productService.getProducts({ sortBy: 'best_selling', size: limit });
    },
};

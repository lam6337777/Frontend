import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { Brand, Category, Page, ProductFiltersResponse, ProductQuery, ProductResponse } from '@/types/product';

export const productService = {
    getProductFilters: async (): Promise<ApiResponse<ProductFiltersResponse>> => {
        const response = await apiClient.get<ApiResponse<ProductFiltersResponse>>('/products/filters');
        return response.data;
    },

    getProducts: async (params?: ProductQuery): Promise<ApiResponse<Page<ProductResponse>>> => {
        const response = await apiClient.get<ApiResponse<Page<ProductResponse>>>('/products', { params });
        return response.data;
    },

    getProductById: async (id: string): Promise<ApiResponse<ProductResponse>> => {
        const response = await apiClient.get<ApiResponse<ProductResponse>>(`/products/${encodeURIComponent(id)}`);
        return response.data;
    },

    getRelated: async (id: string, limit = 8): Promise<ApiResponse<ProductResponse[]>> => {
        const response = await apiClient.get<ApiResponse<ProductResponse[]>>(`/products/${encodeURIComponent(id)}/related`, {
            params: { limit },
        });
        return response.data;
    },

    /** Lấy nhiều sản phẩm theo ID, giữ nguyên thứ tự (dùng cho "Đã xem gần đây") */
    getByIds: async (ids: string[]): Promise<ApiResponse<ProductResponse[]>> => {
        const response = await apiClient.get<ApiResponse<ProductResponse[]>>('/products/batch', {
            params: { ids: ids.join(',') },
        });
        return response.data;
    },

    getFeaturedProducts: async (limit = 8): Promise<ApiResponse<ProductResponse[]>> => {
        const response = await apiClient.get<ApiResponse<ProductResponse[]>>('/products/featured', {
            params: { limit },
        });
        return response.data;
    },

    getCategories: async (): Promise<ApiResponse<Category[]>> => {
        const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
        return response.data;
    },

    getBrands: async (): Promise<ApiResponse<Brand[]>> => {
        const response = await apiClient.get<ApiResponse<Brand[]>>('/brands');
        return response.data;
    },
};

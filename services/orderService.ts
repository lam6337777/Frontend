import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { Page } from '@/types/product';
import { OrderRequest, OrderResponse, OrderStatus, ReturnRequestRequest, ReturnRequestResponse } from '@/types/order';

export const orderService = {
    createOrder: async (data: OrderRequest): Promise<ApiResponse<OrderResponse>> => {
        const response = await apiClient.post<ApiResponse<OrderResponse>>('/orders', data);
        return response.data;
    },

    getUserOrders: async (params?: {
        status?: OrderStatus;
        page?: number;
        size?: number;
    }): Promise<ApiResponse<Page<OrderResponse>>> => {
        const response = await apiClient.get<ApiResponse<Page<OrderResponse>>>('/orders', { params });
        return response.data;
    },

    getOrderByCode: async (code: string): Promise<ApiResponse<OrderResponse>> => {
        const response = await apiClient.get<ApiResponse<OrderResponse>>(`/orders/${code}`);
        return response.data;
    },

    cancelOrder: async (code: string): Promise<ApiResponse<OrderResponse>> => {
        const response = await apiClient.put<ApiResponse<OrderResponse>>(`/orders/${code}/cancel`);
        return response.data;
    },

    createReturnRequest: async (data: ReturnRequestRequest): Promise<ApiResponse<ReturnRequestResponse>> => {
        const response = await apiClient.post<ApiResponse<ReturnRequestResponse>>('/return-requests', data);
        return response.data;
    },

    getUserReturnRequests: async (): Promise<ApiResponse<ReturnRequestResponse[]>> => {
        const response = await apiClient.get<ApiResponse<ReturnRequestResponse[]>>('/return-requests');
        return response.data;
    },
    

};

import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { Address, AddressRequest } from '@/types/address';

export const addressService = {
    getUserAddresses: async (): Promise<ApiResponse<Address[]>> => {
        const response = await apiClient.get<ApiResponse<Address[]>>('/addresses');
        return response.data;
    },

    addAddress: async (data: AddressRequest): Promise<ApiResponse<Address>> => {
        const response = await apiClient.post<ApiResponse<Address>>('/addresses', data);
        return response.data;
    },

    updateAddress: async (id: number, data: AddressRequest): Promise<ApiResponse<Address>> => {
        const response = await apiClient.put<ApiResponse<Address>>(`/addresses/${id}`, data);
        return response.data;
    },

    deleteAddress: async (id: number): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/addresses/${id}`);
        return response.data;
    },

    setDefaultAddress: async (id: number): Promise<ApiResponse<Address>> => {
        const response = await apiClient.put<ApiResponse<Address>>(`/addresses/${id}/default`);
        return response.data;
    },
};

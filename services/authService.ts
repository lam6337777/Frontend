import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { AuthResponseData, LoginRequest, RegisterRequest } from '@/types/auth';

export const authService = {
    register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponseData>> => {
        const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponseData>> => {
        const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', data);
        return response.data;
    },

    getMe: async (): Promise<ApiResponse<AuthResponseData>> => {
        const response = await apiClient.get<ApiResponse<AuthResponseData>>('/auth/me');
        return response.data;
    },

    forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (data: { email: string; otpCode: string; newPassword: string }): Promise<ApiResponse<void>> => {
        const response = await apiClient.post<ApiResponse<void>>('/auth/reset-password', data);
        return response.data;
    },

    /** Chỉ xóa dữ liệu phiên đăng nhập, giữ lại "đã xem gần đây" và giỏ hàng khách */
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            sessionStorage.removeItem('cart');
        }
    },
};

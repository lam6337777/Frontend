import axios, { InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types/common';
import { AuthResponseData, LoginRequest, RegisterRequest } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

const authApi = axios.create({
    baseURL: API_URL,
    // withCredentials: true, // Removed as we use JWT in Authorization header
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to add token to requests
authApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authService = {
    register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponseData>> => {
        const response = await authApi.post<ApiResponse<AuthResponseData>>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponseData>> => {
        const response = await authApi.post<ApiResponse<AuthResponseData>>('/auth/login', data);
        return response.data;
    },

    getMe: async (): Promise<ApiResponse<AuthResponseData>> => {
        const response = await authApi.get<ApiResponse<AuthResponseData>>('/auth/me');
        return response.data;
    },

    forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
        const response = await authApi.post<ApiResponse<void>>('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (data: any): Promise<ApiResponse<void>> => {
        const response = await authApi.post<ApiResponse<void>>('/auth/reset-password', data);
        return response.data;
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
        }
    }
};

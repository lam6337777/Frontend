import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { ChangePasswordRequest, UpdateProfileRequest, UserResponse } from '@/types/user';

export const userService = {
    getMyProfile: async (): Promise<ApiResponse<UserResponse>> => {
        const response = await apiClient.get<ApiResponse<UserResponse>>('/users/me');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserResponse>> => {
        const response = await apiClient.put<ApiResponse<UserResponse>>('/users/profile', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
        const response = await apiClient.put<ApiResponse<void>>('/users/change-password', data);
        return response.data;
    },
};

export interface UserResponse {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export interface UpdateProfileRequest {
    fullName: string;
    phone?: string;
    avatarUrl?: string;
}

export interface ChangePasswordRequest {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

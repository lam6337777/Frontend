export interface User {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    avatarUrl: string;
    role: 'CUSTOMER' | 'ADMIN';
    isActive: boolean;
    token?: string;
}

export interface AuthResponseData extends User { }

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    email: string;
    password: string;
    fullName: string;
    phone: string;
};

import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

/** Sự kiện phát ra khi token hết hạn/không hợp lệ, AuthBootstrap sẽ lắng nghe để đăng xuất. */
export const AUTH_EXPIRED_EVENT = 'pf:auth-expired';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const hadToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
        if (error?.response?.status === 401 && hadToken) {
            window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    }
);

export default apiClient;

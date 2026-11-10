import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

/** Sự kiện phát ra khi token hết hạn/không hợp lệ, AuthBootstrap sẽ lắng nghe để đăng xuất. */
export const AUTH_EXPIRED_EVENT = 'pf:auth-expired';

/**
 * Backend chạy gói free (Render) ngủ sau ~15 phút không dùng; lần gọi đầu có thể mất ~1 phút.
 * apiClient phát sự kiện để ServerWakeNotice hiện thông báo, và tự thử lại request GET
 * khi máy chủ trả 502/503/504 hoặc mất kết nối trong lúc khởi động.
 */
export const SERVER_SLOW_EVENT = 'pf:server-slow';
export const SERVER_READY_EVENT = 'pf:server-ready';
const SLOW_AFTER_MS = 4000;
const MAX_RETRIES = 4;

let pending = 0;
let slowTimer: ReturnType<typeof setTimeout> | null = null;
let slowShown = false;

function trackStart() {
    if (typeof window === 'undefined') return;
    pending += 1;
    if (!slowTimer && !slowShown) {
        slowTimer = setTimeout(() => {
            slowShown = true;
            window.dispatchEvent(new Event(SERVER_SLOW_EVENT));
        }, SLOW_AFTER_MS);
    }
}

function trackEnd() {
    if (typeof window === 'undefined') return;
    pending = Math.max(0, pending - 1);
    if (pending === 0) {
        if (slowTimer) clearTimeout(slowTimer);
        slowTimer = null;
        if (slowShown) {
            slowShown = false;
            window.dispatchEvent(new Event(SERVER_READY_EVENT));
        }
    }
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: number; _tracked?: boolean };

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: RetryConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        if (!config._tracked) {
            config._tracked = true;
            trackStart();
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const isWakingError = (error: AxiosError) =>
    !error.response || [502, 503, 504].includes(error.response.status);

apiClient.interceptors.response.use(
    (response) => {
        trackEnd();
        return response;
    },
    async (error: AxiosError) => {
        const config = error.config as RetryConfig | undefined;
        // Chỉ thử lại request đọc dữ liệu — không gửi lại POST/PUT (tránh đặt hàng 2 lần)
        if (config && (config.method || 'get').toLowerCase() === 'get' && isWakingError(error) && !axios.isCancel(error)) {
            config._retry = (config._retry || 0) + 1;
            if (config._retry <= MAX_RETRIES) {
                await new Promise((r) => setTimeout(r, 3000 * config._retry!));
                return apiClient(config);
            }
        }
        trackEnd();
        const hadToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
        if (error?.response?.status === 401 && hadToken) {
            window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    }
);

export default apiClient;

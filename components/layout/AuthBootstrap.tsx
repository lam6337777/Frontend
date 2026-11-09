'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/redux/hooks';
import { getMe, logout, setAuthChecked } from '@/store/redux/authSlice';
import { fetchServerCart, hydrateGuestCart, resetCart } from '@/store/redux/cartSlice';
import { clearWishlist, fetchWishlistIds } from '@/store/redux/wishlistSlice';
import { AUTH_EXPIRED_EVENT } from '@/lib/apiClient';

/**
 * Chạy 1 lần khi mở web:
 * - Có token → lấy thông tin user, giỏ hàng và yêu thích từ backend.
 * - Không có token → nạp giỏ hàng khách từ trình duyệt.
 * Đồng thời lắng nghe sự kiện token hết hạn để tự đăng xuất.
 */
export function AuthBootstrap() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch(setAuthChecked(true));
            dispatch(hydrateGuestCart());
            return;
        }
        dispatch(getMe()).then((res) => {
            if (getMe.fulfilled.match(res)) {
                dispatch(fetchServerCart());
                dispatch(fetchWishlistIds());
            } else {
                localStorage.removeItem('token');
                dispatch(hydrateGuestCart());
            }
        });
    }, [dispatch]);

    useEffect(() => {
        const onExpired = () => {
            dispatch(logout());
            dispatch(resetCart());
            dispatch(clearWishlist());
        };
        window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
    }, [dispatch]);

    return null;
}

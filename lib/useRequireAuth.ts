'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/redux/hooks';

/** Chuyển về trang đăng nhập nếu chưa đăng nhập. Trả về true khi đã xác nhận đăng nhập. */
export function useRequireAuth() {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isAuthChecked } = useAppSelector((s) => s.auth);

    useEffect(() => {
        if (isAuthChecked && !isAuthenticated) {
            router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthChecked, isAuthenticated, router, pathname]);

    return isAuthChecked && isAuthenticated;
}

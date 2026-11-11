'use client';

import { RefObject, useEffect } from 'react';

/**
 * Đóng popover/dropdown khi chạm ra ngoài hoặc bấm Esc.
 * Dùng `pointerdown` thay vì `mousedown`: Safari iOS KHÔNG phát mousedown khi chạm vào
 * vùng trống (chỉ phát trên phần tử bấm được), nên dropdown không đóng được trên iPhone.
 */
export function useDismiss(refs: RefObject<HTMLElement | null>[], onClose: () => void, enabled = true) {
    useEffect(() => {
        if (!enabled) return;
        const onPointer = (e: PointerEvent) => {
            const target = e.target as Node;
            if (refs.every((r) => !r.current?.contains(target))) onClose();
        };
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        // refs rỗng = chỉ đóng bằng Esc (lớp phủ đã tự xử lý chạm ra ngoài bằng backdrop)
        const usePointer = refs.length > 0;
        if (usePointer) document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            if (usePointer) document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, onClose]);
}

/** Khóa cuộn trang nền khi một lớp phủ (menu, bộ lọc, hộp thoại) đang mở. */
export function useLockScroll(locked: boolean) {
    useEffect(() => {
        if (!locked) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [locked]);
}

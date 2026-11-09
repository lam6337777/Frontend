import type { ProductResponse } from '@/types/product';

/**
 * Hàm cn (className) dùng để kết hợp các class CSS một cách linh hoạt.
 */
export function cn(...inputs: (string | undefined | null | false | { [key: string]: unknown })[]) {
    return inputs
        .flatMap((input) => {
            if (!input) return [];
            if (typeof input === 'string') return [input];
            return Object.entries(input)
                .filter(([, value]) => Boolean(value))
                .map(([key]) => key);
        })
        .join(' ');
}

/** Định dạng tiền tệ VND: 1.250.000₫ */
export function formatVND(amount: number | null | undefined) {
    return (amount || 0).toLocaleString('vi-VN') + '₫';
}

/** Rút gọn số lượng: 1200 → 1,2k */
export function formatCompact(n: number | null | undefined) {
    const value = n || 0;
    if (value >= 1000) return (value / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'k';
    return value.toString();
}

export function formatDate(iso: string | null | undefined, withTime = false) {
    if (!iso) return '';
    const d = new Date(iso);
    return withTime
        ? d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
        : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api').replace(/\/api\/?$/, '');

/** Ảnh upload lên backend có dạng "/uploads/..." → ghép với origin của backend. */
export function resolveAssetUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads')) return API_ORIGIN + url;
    return url;
}

export const PLACEHOLDER_IMAGE = '/images/shoe-placeholder.svg';

export function productImages(p: Pick<ProductResponse, 'images'>): string[] {
    const sorted = [...(p.images || [])].sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
    const urls = sorted.map((i) => resolveAssetUrl(i.imageUrl)).filter((u): u is string => !!u);
    return urls.length ? urls : [PLACEHOLDER_IMAGE];
}

export function effectivePrice(p: Pick<ProductResponse, 'salePrice' | 'originalPrice'>) {
    return p.salePrice && p.salePrice > 0 ? p.salePrice : p.originalPrice;
}

/** Phần trăm giảm giá (0 nếu không giảm) */
export function discountPercent(p: Pick<ProductResponse, 'salePrice' | 'originalPrice'>) {
    if (!p.salePrice || p.salePrice >= p.originalPrice) return 0;
    return Math.round((1 - p.salePrice / p.originalPrice) * 100);
}

export function totalStock(p: Pick<ProductResponse, 'variants'>) {
    return (p.variants || []).reduce((s, v) => s + (v.stockQuantity || 0), 0);
}

/** Lấy thông báo lỗi tiếng Việt từ lỗi axios / backend */
export function errorMessage(err: unknown, fallback = 'Đã xảy ra lỗi, vui lòng thử lại.') {
    const e = err as { response?: { data?: { message?: string; errors?: Record<string, string> } }; message?: string };
    const data = e?.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (first) return first;
    }
    return data?.message || fallback;
}

/** Lưu ID sản phẩm đã xem trong trình duyệt (tối đa 20, mới nhất đứng đầu). */
const KEY = 'pf:recently-viewed';
const MAX = 20;

export function getRecentlyViewed(): string[] {
    try {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

export function pushRecentlyViewed(productId: string) {
    try {
        const next = [productId, ...getRecentlyViewed().filter((id) => id !== productId)].slice(0, MAX);
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        // Trình duyệt chặn localStorage (chế độ riêng tư) — bỏ qua
    }
}

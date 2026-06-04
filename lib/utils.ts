/**
 * Hàm cn (className) dùng để kết hợp các class CSS một cách linh hoạt.
 */
export function cn(...inputs: (string | undefined | null | boolean | { [key: string]: any })[]) {
    return inputs
        .flatMap((input) => {
            if (!input) return [];
            if (typeof input === 'string') return [input];
            if (typeof input === 'object') {
                return Object.entries(input)
                    .filter(([_, value]) => Boolean(value))
                    .map(([key, _]) => key);
            }
            return [];
        })
        .join(' ');
}

/**
 * Định dạng tiền tệ VND
 */
export function formatVND(amount: number) {
    return (amount || 0).toLocaleString('vi-VN') + ' đ';
}


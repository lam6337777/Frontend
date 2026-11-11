import { OrderStatus } from '@/types/order';
import type { TKey } from '@/lib/i18n/core';

type Tone = 'brand' | 'amber' | 'sky' | 'coral' | 'slate' | 'violet';

/** label là khóa dịch: hiển thị bằng t(ORDER_STATUS[s].label) */
export const ORDER_STATUS: Record<OrderStatus, { label: TKey; tone: Tone }> = {
    PENDING: { label: 'status.PENDING', tone: 'amber' },
    CONFIRMED: { label: 'status.CONFIRMED', tone: 'sky' },
    SHIPPING: { label: 'status.SHIPPING', tone: 'violet' },
    DELIVERED: { label: 'status.DELIVERED', tone: 'brand' },
    CANCELLED: { label: 'status.CANCELLED', tone: 'slate' },
    RETURN_REQUESTED: { label: 'status.RETURN_REQUESTED', tone: 'coral' },
    RETURNED: { label: 'status.RETURNED', tone: 'slate' },
    PARTIALLY_RETURNED: { label: 'status.PARTIALLY_RETURNED', tone: 'slate' },
    EXCHANGE_REQUESTED: { label: 'status.EXCHANGE_REQUESTED', tone: 'coral' },
    EXCHANGED: { label: 'status.EXCHANGED', tone: 'brand' },
    WARRANTY_REQUESTED: { label: 'status.WARRANTY_REQUESTED', tone: 'coral' },
    WARRANTY_REPAIRING: { label: 'status.WARRANTY_REPAIRING', tone: 'violet' },
    WARRANTY_COMPLETED: { label: 'status.WARRANTY_COMPLETED', tone: 'brand' },
};

export const TONE_CLASS: Record<Tone, string> = {
    brand: 'bg-brand-50 text-brand-700 ring-brand-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30',
    coral: 'bg-coral-50 text-coral-600 ring-coral-200',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};

/** Các bước chính trên timeline theo dõi đơn */
export const MAIN_STEPS: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPING,
    OrderStatus.DELIVERED,
];

export const RETURN_TYPE_LABEL: Record<'RETURN' | 'EXCHANGE' | 'WARRANTY', TKey> = {
    RETURN: 'returns.typeReturn',
    EXCHANGE: 'returns.typeExchange',
    WARRANTY: 'returns.typeWarranty',
};
export const RETURN_STATUS: Record<'PENDING' | 'APPROVED' | 'REJECTED', { label: TKey; tone: Tone }> = {
    PENDING: { label: 'returns.pending', tone: 'amber' },
    APPROVED: { label: 'returns.approved', tone: 'brand' },
    REJECTED: { label: 'returns.rejected', tone: 'slate' },
};

/**
 * Ghi chú lịch sử đơn do backend sinh ra (tiếng Việt) → tiếng Anh.
 * Phần tự do (lý do khách nhập, phản hồi admin) giữ nguyên văn.
 */
const NOTE_EN: [string, string][] = [
    ['Đặt hàng thành công', 'Order placed'],
    ['Khách hàng hủy đơn', 'Cancelled by customer'],
    ['Shop đã hủy đơn hàng', 'Cancelled by the shop'],
    ['Shop đã xác nhận đơn hàng', 'Confirmed by the shop'],
    ['Đơn hàng đã được giao cho đơn vị vận chuyển', 'Handed over to the carrier'],
    ['Giao hàng thành công', 'Delivered successfully'],
    ['Đã hoàn trả hàng', 'Return completed'],
    ['Khách hàng gửi yêu cầu', 'Customer request'],
    ['Shop đã duyệt yêu cầu', 'Request approved by the shop'],
    ['Shop từ chối yêu cầu', 'Request rejected by the shop'],
];

export function translateNote(note: string | null | undefined, locale: 'vi' | 'en'): string {
    if (!note || locale === 'vi') return note || '';
    for (const [vi, en] of NOTE_EN) {
        if (note === vi) return en;
        if (note.startsWith(vi + ': ')) return en + note.slice(vi.length);
    }
    return note;
}

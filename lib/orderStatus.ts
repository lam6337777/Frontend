import { OrderStatus } from '@/types/order';

type Tone = 'brand' | 'amber' | 'sky' | 'coral' | 'slate' | 'violet';

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
    PENDING: { label: 'Chờ xác nhận', tone: 'amber' },
    CONFIRMED: { label: 'Đã xác nhận', tone: 'sky' },
    SHIPPING: { label: 'Đang giao', tone: 'violet' },
    DELIVERED: { label: 'Đã giao', tone: 'brand' },
    CANCELLED: { label: 'Đã hủy', tone: 'slate' },
    RETURN_REQUESTED: { label: 'Yêu cầu trả hàng', tone: 'coral' },
    RETURNED: { label: 'Đã trả hàng', tone: 'slate' },
    PARTIALLY_RETURNED: { label: 'Đã trả một phần', tone: 'slate' },
    EXCHANGE_REQUESTED: { label: 'Yêu cầu đổi hàng', tone: 'coral' },
    EXCHANGED: { label: 'Đã đổi hàng', tone: 'brand' },
    WARRANTY_REQUESTED: { label: 'Yêu cầu bảo hành', tone: 'coral' },
    WARRANTY_REPAIRING: { label: 'Đang bảo hành', tone: 'violet' },
    WARRANTY_COMPLETED: { label: 'Bảo hành xong', tone: 'brand' },
};

export const TONE_CLASS: Record<Tone, string> = {
    brand: 'bg-brand-50 text-brand-700 ring-brand-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
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

export const RETURN_TYPE_LABEL = { RETURN: 'Trả hàng', EXCHANGE: 'Đổi hàng', WARRANTY: 'Bảo hành' } as const;
export const RETURN_STATUS = {
    PENDING: { label: 'Đang chờ duyệt', tone: 'amber' as Tone },
    APPROVED: { label: 'Đã duyệt', tone: 'brand' as Tone },
    REJECTED: { label: 'Bị từ chối', tone: 'slate' as Tone },
};

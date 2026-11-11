import { Check, ClipboardCheck, Home, Package, Truck, XCircle } from 'lucide-react';
import { OrderResponse, OrderStatus, StatusHistory } from '@/types/order';
import { MAIN_STEPS, ORDER_STATUS, translateNote } from '@/lib/orderStatus';
import { cn, formatDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/client';

const ICON = {
    PENDING: ClipboardCheck,
    CONFIRMED: Package,
    SHIPPING: Truck,
    DELIVERED: Home,
} as Record<string, typeof Check>;

/** Lịch sử trạng thái; đơn cũ (trước khi có bảng lịch sử) chỉ có thời điểm đặt hàng */
function historyOf(order: OrderResponse): StatusHistory[] {
    if (order.statusHistory?.length) return order.statusHistory;
    return [{ status: OrderStatus.PENDING, note: 'Đặt hàng thành công', createdAt: order.createdAt }];
}

export function OrderTimeline({ order }: { order: OrderResponse }) {
    const { t, locale } = useI18n();
    const history = historyOf(order);
    const firstAt = (s: OrderStatus) => history.find((h) => h.status === s)?.createdAt;
    const cancelled = order.status === OrderStatus.CANCELLED;
    const currentIdx = MAIN_STEPS.indexOf(order.status);
    // Trạng thái sau giao hàng (đổi/trả/bảo hành) coi như đã qua đủ 4 bước
    const reached = currentIdx >= 0 ? currentIdx : cancelled ? Math.max(...history.map((h) => MAIN_STEPS.indexOf(h.status)), 0) : MAIN_STEPS.length - 1;

    return (
        <div className="space-y-6">
            <ol className="grid grid-cols-4 gap-1">
                {MAIN_STEPS.map((s, i) => {
                    const done = i <= reached && !(cancelled && i > reached);
                    const Icon = ICON[s];
                    return (
                        <li key={s} className="relative flex flex-col items-center text-center">
                            {i > 0 && (
                                <span
                                    className={cn('absolute right-1/2 top-5 h-1 w-full -translate-y-1/2 rounded-full', i <= reached ? 'bg-brand-500' : 'bg-line')}
                                    aria-hidden
                                />
                            )}
                            <span
                                className={cn(
                                    'relative z-10 grid h-10 w-10 place-items-center rounded-full ring-4 ring-surface transition',
                                    done ? 'bg-brand-500 text-white' : 'bg-mint-100 text-muted'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </span>
                            <p className={cn('mt-2 text-xs font-semibold sm:text-sm', done ? 'text-ink' : 'text-muted')}>{t(ORDER_STATUS[s].label)}</p>
                            {firstAt(s) && <p className="text-[11px] text-muted">{formatDate(firstAt(s), true)}</p>}
                        </li>
                    );
                })}
            </ol>

            {cancelled && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4 text-sm">
                    <XCircle className="h-5 w-5 text-slate-500" />
                    <span>
                        {firstAt(OrderStatus.CANCELLED) ? t('orders.timelineCancelledAt', { d: formatDate(firstAt(OrderStatus.CANCELLED), true) }) : t('orders.timelineCancelled')}
                    </span>
                </div>
            )}

            <div>
                <h3 className="mb-3 text-sm font-bold">{t('orders.history')}</h3>
                <ol className="relative space-y-4 border-l-2 border-line pl-5">
                    {[...history].reverse().map((h, i) => (
                        <li key={i} className="relative">
                            <span className={cn('absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-surface', i === 0 ? 'bg-brand-500' : 'bg-line')} />
                            <p className={cn('text-sm font-semibold', i === 0 ? 'text-brand-700' : '')}>{ORDER_STATUS[h.status] ? t(ORDER_STATUS[h.status].label) : h.status}</p>
                            {h.note && <p className="text-sm text-muted">{translateNote(h.note, locale)}</p>}
                            <p className="text-xs text-muted">{formatDate(h.createdAt, true)}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Package } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { OrderResponse, OrderStatus } from '@/types/order';
import { ORDER_STATUS } from '@/lib/orderStatus';
import { Badge, EmptyState, Pagination } from '@/components/ui/misc';
import { LinkButton } from '@/components/ui/Button';
import { cn, formatDate, formatVND, PLACEHOLDER_IMAGE, resolveAssetUrl } from '@/lib/utils';

const TABS: { value?: OrderStatus; label: string }[] = [
    { label: 'Tất cả' },
    { value: OrderStatus.PENDING, label: 'Chờ xác nhận' },
    { value: OrderStatus.CONFIRMED, label: 'Đã xác nhận' },
    { value: OrderStatus.SHIPPING, label: 'Đang giao' },
    { value: OrderStatus.DELIVERED, label: 'Đã giao' },
    { value: OrderStatus.CANCELLED, label: 'Đã hủy' },
];

function OrderCard({ order }: { order: OrderResponse }) {
    const st = ORDER_STATUS[order.status] || { label: order.status, tone: 'slate' as const };
    const first = order.items.slice(0, 3);
    const more = order.items.length - first.length;
    return (
        <Link href={`/account/orders/${order.orderCode}`} className="card block p-5 transition hover:shadow-lift">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <div className="text-sm">
                    <span className="font-bold">#{order.orderCode}</span>
                    <span className="ml-2 text-muted">{formatDate(order.createdAt, true)}</span>
                </div>
                <Badge tone={st.tone}>{st.label}</Badge>
            </div>
            <div className="flex items-center gap-3 py-4">
                <div className="flex -space-x-3">
                    {first.map((it) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            key={it.id}
                            src={resolveAssetUrl(it.imageUrl) || PLACEHOLDER_IMAGE}
                            alt=""
                            className="h-16 w-16 rounded-xl border-2 border-white bg-mint-100 object-cover"
                        />
                    ))}
                    {more > 0 && (
                        <span className="grid h-16 w-16 place-items-center rounded-xl border-2 border-white bg-mint-100 text-sm font-bold text-muted">+{more}</span>
                    )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{order.items[0]?.productName}</p>
                    <p className="text-muted">{order.items.reduce((n, i) => n + i.quantity, 0)} sản phẩm</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted" />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-line pt-3 text-sm">
                <span className="text-muted">Thành tiền:</span>
                <span className="text-lg font-extrabold text-coral-500">{formatVND(order.totalAmount)}</span>
            </div>
        </Link>
    );
}

function OrdersContent() {
    const sp = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const status = (sp.get('status') as OrderStatus) || undefined;
    const page = Number(sp.get('page') || 0);

    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        orderService
            .getUserOrders({ status, page, size: 8 })
            .then((r) => {
                setOrders(r.data.content);
                setTotalPages(r.data.totalPages);
            })
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [status, page]);

    const go = (s?: OrderStatus, p = 0) => {
        const q = new URLSearchParams();
        if (s) q.set('status', s);
        if (p) q.set('page', String(p));
        router.push(`${pathname}${q.toString() ? `?${q}` : ''}`);
    };

    return (
        <div>
            <h1 className="mb-4 text-xl font-bold">Đơn hàng của tôi</h1>
            <div className="card scrollbar-none mb-4 flex gap-1 overflow-x-auto p-1.5">
                {TABS.map((t) => (
                    <button
                        key={t.label}
                        onClick={() => go(t.value)}
                        className={cn(
                            'shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition',
                            status === t.value ? 'bg-brand-500 text-white' : 'text-muted hover:bg-mint-50 hover:text-ink'
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="space-y-4">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="skeleton h-44 rounded-3xl" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon={<Package className="h-9 w-9" />}
                        title="Chưa có đơn hàng nào"
                        description={status ? 'Không có đơn ở trạng thái này.' : 'Hãy chọn cho mình một đôi giày ưng ý nhé.'}
                        action={<LinkButton href="/products">Mua sắm ngay</LinkButton>}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o) => (
                        <OrderCard key={o.id} order={o} />
                    ))}
                    <Pagination page={page} totalPages={totalPages} onChange={(p) => go(status, p)} />
                </div>
            )}
        </div>
    );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={<div className="skeleton h-96 rounded-3xl" />}>
            <OrdersContent />
        </Suspense>
    );
}

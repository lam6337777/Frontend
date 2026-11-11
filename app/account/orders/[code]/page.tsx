'use client';

import { Suspense, use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, MapPin, PackageX, Star, Ticket, Wallet } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { OrderItemResponse, OrderResponse, OrderStatus } from '@/types/order';
import { ORDER_STATUS } from '@/lib/orderStatus';
import type { TKey } from '@/lib/i18n/core';
import { OrderTimeline } from '@/components/account/OrderTimeline';
import { ReviewModal } from '@/components/account/ReviewModal';
import { canRequestReturn, ReturnRequestModal } from '@/components/account/ReturnRequestModal';
import { Badge, EmptyState } from '@/components/ui/misc';
import { Button, LinkButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { errorMessage, formatDate, formatVND, PLACEHOLDER_IMAGE, resolveAssetUrl } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

const ITEM_STATUS_LABEL: Record<string, TKey> = {
    RETURN_REQUESTED: 'itemStatus.RETURN_REQUESTED',
    RETURNED: 'itemStatus.RETURNED',
    EXCHANGE_REQUESTED: 'itemStatus.EXCHANGE_REQUESTED',
    EXCHANGED: 'itemStatus.EXCHANGED',
    WARRANTY_REQUESTED: 'itemStatus.WARRANTY_REQUESTED',
    WARRANTY_REPAIRING: 'itemStatus.WARRANTY_REPAIRING',
    WARRANTY_COMPLETED: 'itemStatus.WARRANTY_COMPLETED',
};

function OrderDetail({ code }: { code: string }) {
    const sp = useSearchParams();
    const toast = useToast();
    const t = useT();
    const justPlaced = sp.get('placed') === '1';

    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);
    const [reviewItem, setReviewItem] = useState<OrderItemResponse | null>(null);
    const [returnOpen, setReturnOpen] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const load = useCallback(() => {
        return orderService
            .getOrderByCode(code)
            .then((r) => setOrder(r.data))
            .catch(() => setMissing(true))
            .finally(() => setLoading(false));
    }, [code]);

    useEffect(() => {
        load();
    }, [load]);

    const cancel = async () => {
        setCancelling(true);
        try {
            const r = await orderService.cancelOrder(code);
            setOrder(r.data);
            toast(t('orders.cancelled'));
            setConfirmCancel(false);
        } catch (e) {
            toast(errorMessage(e, t('orders.cancelFailed')), 'error');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <div className="skeleton h-[600px] rounded-3xl" />;
    if (missing || !order) {
        return (
            <div className="card">
                <EmptyState
                    icon={<PackageX className="h-9 w-9" />}
                    title={t('orders.notFound')}
                    action={<LinkButton href="/account/orders">{t('orders.backToList')}</LinkButton>}
                />
            </div>
        );
    }

    const st = ORDER_STATUS[order.status];
    const canReview = order.status === OrderStatus.DELIVERED;

    return (
        <div className="space-y-5">
            <Link href="/account/orders" className="inline-flex items-center gap-1 py-1 text-sm font-semibold text-muted hover:text-brand-600">
                <ArrowLeft className="h-4 w-4" /> {t('orders.myOrders')}
            </Link>

            {justPlaced && (
                <div className="flex animate-fade-up items-start gap-4 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-400 p-6 text-white">
                    <CheckCircle2 className="h-10 w-10 shrink-0" />
                    <div>
                        <h1 className="text-xl font-extrabold">{t('orders.placedTitle')}</h1>
                        <p className="mt-1 text-sm text-white/90">
                            {t('orders.placedBody', { code: order.orderCode })}
                        </p>
                    </div>
                </div>
            )}

            <div className="card p-5 md:p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold">{t('orders.orderNo', { code: order.orderCode })}</h2>
                        <p className="text-sm text-muted">{t('orders.placedAt', { d: formatDate(order.createdAt, true) })}</p>
                    </div>
                    <Badge tone={st?.tone ?? 'slate'} className="text-sm">
                        {st ? t(st.label) : order.status}
                    </Badge>
                </div>
                <OrderTimeline order={order} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <div className="card p-5">
                    <h3 className="mb-3 flex items-center gap-2 font-bold">
                        <MapPin className="h-4 w-4 text-brand-500" /> {t('orders.address')}
                    </h3>
                    <p className="text-sm font-semibold">
                        {order.shippingName} · {order.shippingPhone}
                    </p>
                    <p className="mt-1 text-sm text-muted">{order.shippingAddress}</p>
                    {order.note && <p className="mt-3 rounded-xl bg-mint-50 p-3 text-sm">{t('orders.note', { v: order.note })}</p>}
                </div>
                <div className="card p-5">
                    <h3 className="mb-3 flex items-center gap-2 font-bold">
                        <Wallet className="h-4 w-4 text-brand-500" /> {t('orders.payment')}
                    </h3>
                    <p className="text-sm">{order.paymentMethod === 'COD' ? t('orders.cod') : order.paymentMethod}</p>
                    <p className="mt-1 text-sm text-muted">
                        {t('orders.payStatus')}{' '}
                        {({ PAID: t('orders.paid'), REFUNDED: t('orders.refunded'), PARTIALLY_REFUNDED: t('orders.partiallyRefunded') } as Record<string, string>)[order.paymentStatus] || t('orders.unpaid')}
                    </p>
                </div>
            </div>

            <div className="card p-5 md:p-6">
                <h3 className="mb-2 font-bold">{t('orders.products')}</h3>
                <ul className="divide-y divide-line">
                    {order.items.map((it) => (
                        <li key={it.id} className="flex gap-4 py-4">
                            <Link href={`/products/${it.productId}`} className="shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={resolveAssetUrl(it.imageUrl) || PLACEHOLDER_IMAGE} alt="" className="h-20 w-20 rounded-xl bg-mint-100 object-cover" />
                            </Link>
                            <div className="min-w-0 flex-1">
                                <Link href={`/products/${it.productId}`} className="line-clamp-2 font-semibold hover:text-brand-700">
                                    {it.productName}
                                </Link>
                                <p className="text-sm text-muted">
                                    Size {it.size} · {formatVND(it.unitPrice)} × {it.quantity}
                                </p>
                                {it.status && it.status !== 'ACTIVE' && (
                                    <Badge tone="coral" className="mt-1">
                                        {ITEM_STATUS_LABEL[it.status] ? t(ITEM_STATUS_LABEL[it.status]) : it.status}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-col items-end justify-between gap-2">
                                <p className="font-bold">{formatVND(it.totalPrice)}</p>
                                {canReview &&
                                    (it.isReviewed ? (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-brand-600">
                                            <Star className="h-3.5 w-3.5 fill-current" /> {t('orders.reviewed')}
                                        </span>
                                    ) : (
                                        <Button size="sm" variant="soft" onClick={() => setReviewItem(it)}>
                                            <Star className="h-4 w-4" /> {t('orders.review')}
                                        </Button>
                                    ))}
                            </div>
                        </li>
                    ))}
                </ul>

                <dl className="ml-auto mt-2 max-w-sm space-y-2 border-t border-line pt-4 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-muted">{t('orders.subtotal')}</dt>
                        <dd>{formatVND(order.subtotal)}</dd>
                    </div>
                    {order.discountAmount > 0 && (
                        <div className="flex justify-between text-brand-700">
                            <dt className="flex items-center gap-1">
                                <Ticket className="h-4 w-4" /> {t('orders.discount')} {order.voucherCode && `(${order.voucherCode})`}
                            </dt>
                            <dd>-{formatVND(order.discountAmount)}</dd>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <dt className="text-muted">{t('orders.shipping')}</dt>
                        <dd>{order.shippingFee > 0 ? formatVND(order.shippingFee) : t('orders.free')}</dd>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-line pt-3">
                        <dt className="font-bold">{t('orders.grandTotal')}</dt>
                        <dd className="text-xl font-extrabold text-coral-500">{formatVND(order.totalAmount)}</dd>
                    </div>
                </dl>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
                {order.status === OrderStatus.PENDING && (
                    <Button variant="outline" className="text-coral-600" onClick={() => setConfirmCancel(true)}>
                        {t('orders.cancel')}
                    </Button>
                )}
                {canRequestReturn(order) && (
                    <Button variant="outline" onClick={() => setReturnOpen(true)}>
                        {t('orders.requestReturn')}
                    </Button>
                )}
                <LinkButton href="/products" variant="primary">
                    {t('orders.buyMore')}
                </LinkButton>
            </div>

            <ReviewModal item={reviewItem} orderId={order.id} onClose={() => setReviewItem(null)} onDone={load} />
            <ReturnRequestModal order={order} open={returnOpen} onClose={() => setReturnOpen(false)} onDone={load} />
            <Modal
                open={confirmCancel}
                onClose={() => setConfirmCancel(false)}
                title={t('orders.cancelTitle')}
                size="sm"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setConfirmCancel(false)}>
                            {t('orders.no')}
                        </Button>
                        <Button variant="coral" onClick={cancel} loading={cancelling}>
                            {t('orders.confirmCancel')}
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-muted">{t('orders.cancelBody', { code: order.orderCode })}</p>
            </Modal>
        </div>
    );
}

export default function OrderDetailPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    return (
        <Suspense fallback={<div className="skeleton h-[600px] rounded-3xl" />}>
            <OrderDetail code={decodeURIComponent(code)} />
        </Suspense>
    );
}

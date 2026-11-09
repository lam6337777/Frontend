'use client';

import { useEffect, useState } from 'react';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';
import { OrderItemStatus, OrderResponse, ReturnRequestType } from '@/types/order';
import { ProductVariant } from '@/types/product';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { cn, errorMessage, PLACEHOLDER_IMAGE, resolveAssetUrl } from '@/lib/utils';

const DAY = 86_400_000;
const WINDOW: Record<ReturnRequestType, number> = { RETURN: 7, EXCHANGE: 7, WARRANTY: 30 };
const TYPES: { value: ReturnRequestType; label: string; desc: string }[] = [
    { value: ReturnRequestType.RETURN, label: 'Trả hàng', desc: 'Hoàn tiền, trong 7 ngày' },
    { value: ReturnRequestType.EXCHANGE, label: 'Đổi size', desc: 'Đổi sang size khác, trong 7 ngày' },
    { value: ReturnRequestType.WARRANTY, label: 'Bảo hành', desc: 'Lỗi keo, chỉ — trong 30 ngày' },
];

/** Số ngày kể từ khi giao hàng (giống cách backend tính) */
export function daysSinceDelivered(order: OrderResponse) {
    const from = order.deliveredAt || order.createdAt;
    return Math.floor((Date.now() - new Date(from).getTime()) / DAY);
}

export function canRequestReturn(order: OrderResponse) {
    return (
        order.status === 'DELIVERED' &&
        daysSinceDelivered(order) <= WINDOW.WARRANTY &&
        order.items.some((i) => !i.status || i.status === OrderItemStatus.ACTIVE)
    );
}

export function ReturnRequestModal({ order, open, onClose, onDone }: { order: OrderResponse; open: boolean; onClose: () => void; onDone: () => void }) {
    const toast = useToast();
    const days = daysSinceDelivered(order);
    const [type, setType] = useState<ReturnRequestType>(ReturnRequestType.RETURN);
    const [itemIds, setItemIds] = useState<number[]>([]);
    const [reason, setReason] = useState('');
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [exchangeVariantId, setExchangeVariantId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const activeItems = order.items.filter((i) => !i.status || i.status === OrderItemStatus.ACTIVE);

    useEffect(() => {
        if (!open) return;
        const firstAllowed = TYPES.find((t) => days <= WINDOW[t.value])?.value || ReturnRequestType.WARRANTY;
        setType(firstAllowed);
        setItemIds([]);
        setReason('');
        setExchangeVariantId(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Đổi size: chỉ chọn 1 sản phẩm, tải size còn hàng của sản phẩm đó
    const exchangeItem = type === ReturnRequestType.EXCHANGE && itemIds.length === 1 ? activeItems.find((i) => i.id === itemIds[0]) : null;
    useEffect(() => {
        setVariants([]);
        setExchangeVariantId(null);
        if (!exchangeItem) return;
        productService
            .getProductById(exchangeItem.productId)
            .then((r) => setVariants(r.data.variants.filter((v) => v.stockQuantity > 0 && v.size !== exchangeItem.size)))
            .catch(() => setVariants([]));
    }, [exchangeItem?.id, exchangeItem?.productId, exchangeItem?.size, exchangeItem]);

    const toggleItem = (id: number) => {
        if (type === ReturnRequestType.EXCHANGE) setItemIds([id]);
        else setItemIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    };

    const submit = async () => {
        if (!itemIds.length) return toast('Chọn ít nhất 1 sản phẩm', 'info');
        if (reason.trim().length < 10) return toast('Vui lòng mô tả lý do (ít nhất 10 ký tự)', 'info');
        if (type === ReturnRequestType.EXCHANGE && !exchangeVariantId) return toast('Chọn size muốn đổi', 'info');
        setSaving(true);
        try {
            await orderService.createReturnRequest({
                orderCode: order.orderCode,
                type,
                reason: reason.trim(),
                orderItemIds: itemIds,
                exchangeVariantId: exchangeVariantId || undefined,
            });
            toast('Đã gửi yêu cầu. Shop sẽ phản hồi sớm nhất!');
            onDone();
            onClose();
        } catch (e) {
            toast(errorMessage(e, 'Không gửi được yêu cầu'), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title="Yêu cầu đổi / trả / bảo hành"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={submit} loading={saving}>
                        Gửi yêu cầu
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                <div className="grid gap-2 sm:grid-cols-3">
                    {TYPES.map((t) => {
                        const disabled = days > WINDOW[t.value];
                        return (
                            <button
                                key={t.value}
                                disabled={disabled}
                                onClick={() => {
                                    setType(t.value);
                                    setItemIds([]);
                                }}
                                className={cn(
                                    'rounded-2xl border-2 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40',
                                    type === t.value ? 'border-brand-500 bg-brand-50' : 'border-line hover:border-brand-200'
                                )}
                            >
                                <p className="font-semibold">{t.label}</p>
                                <p className="text-xs text-muted">{disabled ? 'Đã quá thời hạn' : t.desc}</p>
                            </button>
                        );
                    })}
                </div>

                <div>
                    <p className="mb-2 text-sm font-semibold">{type === ReturnRequestType.EXCHANGE ? 'Chọn 1 sản phẩm muốn đổi' : 'Chọn sản phẩm'}</p>
                    <div className="space-y-2">
                        {activeItems.map((it) => (
                            <label
                                key={it.id}
                                className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3', itemIds.includes(it.id) ? 'border-brand-400 bg-brand-50/50' : 'border-line')}
                            >
                                <input
                                    type={type === ReturnRequestType.EXCHANGE ? 'radio' : 'checkbox'}
                                    name="return-item"
                                    className="h-4 w-4 accent-brand-500"
                                    checked={itemIds.includes(it.id)}
                                    onChange={() => toggleItem(it.id)}
                                />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={resolveAssetUrl(it.imageUrl) || PLACEHOLDER_IMAGE} alt="" className="h-12 w-12 rounded-lg object-cover" />
                                <div className="min-w-0 flex-1 text-sm">
                                    <p className="line-clamp-1 font-medium">{it.productName}</p>
                                    <p className="text-muted">
                                        Size {it.size} · SL {it.quantity}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {exchangeItem && (
                    <div>
                        <p className="mb-2 text-sm font-semibold">Đổi sang size</p>
                        {variants.length === 0 ? (
                            <p className="text-sm text-muted">Sản phẩm hiện không còn size khác để đổi.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setExchangeVariantId(v.id)}
                                        className={cn(
                                            'h-10 min-w-12 rounded-xl border px-3 text-sm font-semibold',
                                            exchangeVariantId === v.id ? 'border-brand-500 bg-brand-500 text-white' : 'border-line hover:border-brand-400'
                                        )}
                                    >
                                        {v.size}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold">Lý do</span>
                    <textarea
                        className="input min-h-24"
                        maxLength={1000}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="VD: Giày bị chật ở mũi, muốn đổi lên 1 size…"
                    />
                </label>
            </div>
        </Modal>
    );
}

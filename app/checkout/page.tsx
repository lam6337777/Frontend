'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Banknote, CreditCard, Lock, MapPin, Pencil, Plus, ShoppingBag, Truck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { fetchServerCart, resetCart, selectCartSubtotal } from '@/store/redux/cartSlice';
import { addressService } from '@/services/addressService';
import { orderService } from '@/services/orderService';
import { promotionService } from '@/services/promotionService';
import { Address, formatAddress } from '@/types/address';
import { ShippingQuote, VoucherCheck } from '@/types/promotion';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { useToast } from '@/components/ui/Toast';
import { Button, LinkButton } from '@/components/ui/Button';
import { Breadcrumb, EmptyState } from '@/components/ui/misc';
import { VoucherPicker } from '@/components/cart/VoucherPicker';
import { AddressFormModal } from '@/components/account/AddressForm';
import { cn, errorMessage, formatVND, PLACEHOLDER_IMAGE } from '@/lib/utils';

function Step({ n, title, children, action }: { n: number; title: string; children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <section className="card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-3 text-lg font-bold">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-sm text-white">{n}</span>
                    {title}
                </h2>
                {action}
            </div>
            {children}
        </section>
    );
}

export default function CheckoutPage() {
    const ready = useRequireAuth();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { items, hydrated } = useAppSelector((s) => s.cart);
    const subtotal = useAppSelector(selectCartSubtotal);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addrLoading, setAddrLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [modal, setModal] = useState<{ open: boolean; editing: Address | null }>({ open: false, editing: null });
    const [quote, setQuote] = useState<ShippingQuote | null>(null);
    const [voucher, setVoucher] = useState<VoucherCheck | null>(null);
    const [note, setNote] = useState('');
    const [placing, setPlacing] = useState(false);
    const [placed, setPlaced] = useState(false);

    useEffect(() => {
        if (!ready) return;
        // Tải lại giỏ từ server để chắc chắn giá/tồn kho mới nhất
        dispatch(fetchServerCart());
        addressService
            .getUserAddresses()
            .then((r) => {
                setAddresses(r.data);
                setSelectedId((r.data.find((a) => a.isDefault) || r.data[0])?.id ?? null);
            })
            .catch(() => setAddresses([]))
            .finally(() => setAddrLoading(false));
    }, [ready, dispatch]);

    const address = useMemo(() => addresses.find((a) => a.id === selectedId) || null, [addresses, selectedId]);

    useEffect(() => {
        if (!subtotal) return;
        promotionService
            .quoteShipping(address?.province, subtotal)
            .then((r) => setQuote(r.data))
            .catch(() => setQuote(null));
    }, [address?.province, subtotal]);

    const discount = voucher?.discountAmount || 0;
    const shipping = address && quote ? quote.fee : 0;
    const total = Math.max(0, subtotal - discount + shipping);

    const onSaved = (a: Address) => {
        setAddresses((list) => {
            const others = list.filter((x) => x.id !== a.id).map((x) => (a.isDefault ? { ...x, isDefault: false } : x));
            return [a, ...others];
        });
        setSelectedId(a.id);
    };

    const placeOrder = async () => {
        if (!address) {
            toast('Vui lòng thêm địa chỉ giao hàng', 'info');
            setModal({ open: true, editing: null });
            return;
        }
        setPlacing(true);
        try {
            const res = await orderService.createOrder({
                shippingName: address.fullName,
                shippingPhone: address.phoneNumber,
                shippingAddress: formatAddress(address),
                province: address.province,
                voucherCode: voucher?.code,
                paymentMethod: 'COD',
                note: note.trim() || undefined,
            });
            try {
                sessionStorage.removeItem('pf:voucher');
            } catch {}
            setPlaced(true);
            dispatch(resetCart());
            router.replace(`/account/orders/${res.data.orderCode}?placed=1`);
        } catch (e) {
            toast(errorMessage(e, 'Đặt hàng thất bại, vui lòng thử lại'), 'error');
            dispatch(fetchServerCart());
        } finally {
            setPlacing(false);
        }
    };

    if (!ready || !hydrated) {
        return (
            <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_400px]">
                <div className="space-y-4">
                    <div className="skeleton h-40 rounded-3xl" />
                    <div className="skeleton h-28 rounded-3xl" />
                    <div className="skeleton h-28 rounded-3xl" />
                </div>
                <div className="skeleton h-96 rounded-3xl" />
            </div>
        );
    }

    if (placed) {
        return <div className="container-page py-20 text-center text-muted">Đang mở đơn hàng của bạn…</div>;
    }

    if (items.length === 0 && !placing) {
        return (
            <div className="container-page py-8">
                <div className="card">
                    <EmptyState
                        icon={<ShoppingBag className="h-9 w-9" />}
                        title="Không có sản phẩm để thanh toán"
                        action={<LinkButton href="/products">Tiếp tục mua sắm</LinkButton>}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="container-page py-6">
            <Breadcrumb items={[{ label: 'Giỏ hàng', href: '/cart' }, { label: 'Thanh toán' }]} />
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Thanh toán</h1>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] [&>*]:min-w-0">
                <div className="space-y-4">
                    <Step
                        n={1}
                        title="Địa chỉ nhận hàng"
                        action={
                            addresses.length > 0 && (
                                <Button size="sm" variant="soft" onClick={() => setModal({ open: true, editing: null })}>
                                    <Plus className="h-4 w-4" /> Thêm
                                </Button>
                            )
                        }
                    >
                        {addrLoading ? (
                            <div className="skeleton h-20" />
                        ) : addresses.length === 0 ? (
                            <button
                                onClick={() => setModal({ open: true, editing: null })}
                                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 py-8 text-brand-700 hover:bg-brand-50"
                            >
                                <MapPin className="h-6 w-6" />
                                <span className="font-semibold">Thêm địa chỉ giao hàng</span>
                            </button>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {addresses.map((a) => (
                                    <label
                                        key={a.id}
                                        className={cn(
                                            'relative flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition',
                                            selectedId === a.id ? 'border-brand-500 bg-brand-50/50' : 'border-line hover:border-brand-200'
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            className="mt-1 h-4 w-4 accent-brand-500"
                                            checked={selectedId === a.id}
                                            onChange={() => setSelectedId(a.id)}
                                        />
                                        <div className="min-w-0 flex-1 text-sm">
                                            <p className="font-semibold">
                                                {a.fullName} <span className="font-normal text-muted">· {a.phoneNumber}</span>
                                            </p>
                                            <p className="mt-1 text-muted">{formatAddress(a)}</p>
                                            {a.isDefault && <span className="mt-2 inline-block rounded-md bg-brand-100 px-1.5 py-0.5 text-[11px] font-semibold text-brand-700">Mặc định</span>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setModal({ open: true, editing: a });
                                            }}
                                            className="absolute right-3 top-3 rounded-full p-1.5 text-muted hover:bg-white hover:text-brand-600"
                                            aria-label="Sửa địa chỉ"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    </label>
                                ))}
                            </div>
                        )}
                    </Step>

                    <Step n={2} title="Vận chuyển">
                        <div className="flex items-center gap-4 rounded-2xl border-2 border-brand-500 bg-brand-50/50 p-4">
                            <Truck className="h-6 w-6 text-brand-600" />
                            <div className="flex-1 text-sm">
                                <p className="font-semibold">Giao hàng tiêu chuẩn</p>
                                <p className="text-muted">
                                    {address ? `Dự kiến ${quote?.estimatedDays || '3-5 ngày'} đến ${address.province}` : 'Chọn địa chỉ để xem phí và thời gian giao'}
                                </p>
                            </div>
                            <p className="font-bold">{!address || !quote ? '—' : quote.freeShipping ? <span className="text-brand-600">Miễn phí</span> : formatVND(quote.fee)}</p>
                        </div>
                    </Step>

                    <Step n={3} title="Phương thức thanh toán">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-brand-500 bg-brand-50/50 p-4">
                                <input type="radio" name="pay" defaultChecked className="h-4 w-4 accent-brand-500" />
                                <Banknote className="h-6 w-6 text-brand-600" />
                                <div className="text-sm">
                                    <p className="font-semibold">Thanh toán khi nhận hàng</p>
                                    <p className="text-muted">COD — trả tiền mặt cho shipper</p>
                                </div>
                            </label>
                            <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-line p-4 opacity-60" aria-disabled>
                                <CreditCard className="h-6 w-6 text-muted" />
                                <div className="text-sm">
                                    <p className="font-semibold">VNPay / Thẻ ngân hàng</p>
                                    <p className="text-muted">Sắp ra mắt</p>
                                </div>
                            </div>
                        </div>
                        <label className="mt-4 block">
                            <span className="mb-1.5 block text-sm font-medium">Ghi chú cho shop (không bắt buộc)</span>
                            <textarea
                                className="input min-h-20 resize-y"
                                maxLength={500}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="VD: Giao giờ hành chính, gọi trước khi giao…"
                            />
                        </label>
                    </Step>
                </div>

                <aside className="lg:sticky lg:top-36 lg:self-start">
                    <div className="card space-y-5 p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Đơn hàng ({items.reduce((n, i) => n + i.quantity, 0)})</h2>
                            <Link href="/cart" className="text-sm font-semibold text-brand-600 hover:underline">
                                Sửa
                            </Link>
                        </div>
                        <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
                            {items.map((it) => (
                                <li key={it.variantId} className="flex gap-3">
                                    <div className="relative h-16 w-16 shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={it.image || PLACEHOLDER_IMAGE} alt="" className="h-full w-full rounded-xl object-cover" />
                                        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                                            {it.quantity}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 text-sm">
                                        <p className="line-clamp-2 font-medium">{it.name}</p>
                                        <p className="text-xs text-muted">Size {it.size}</p>
                                    </div>
                                    <p className="text-sm font-semibold">{formatVND(it.price * it.quantity)}</p>
                                </li>
                            ))}
                        </ul>

                        <div className="border-t border-line pt-4">
                            <VoucherPicker subtotal={subtotal} applied={voucher} onChange={setVoucher} />
                        </div>

                        <dl className="space-y-2.5 border-t border-line pt-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted">Tạm tính</dt>
                                <dd className="font-semibold">{formatVND(subtotal)}</dd>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-brand-700">
                                    <dt>Giảm giá ({voucher?.code})</dt>
                                    <dd className="font-semibold">-{formatVND(discount)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt className="text-muted">Phí vận chuyển</dt>
                                <dd className="font-semibold">{!address ? '—' : quote?.freeShipping ? 'Miễn phí' : formatVND(shipping)}</dd>
                            </div>
                            <div className="flex items-baseline justify-between border-t border-line pt-3">
                                <dt className="font-bold">Tổng thanh toán</dt>
                                <dd className="text-2xl font-extrabold text-coral-500">{formatVND(total)}</dd>
                            </div>
                        </dl>

                        <Button size="lg" variant="coral" className="w-full" onClick={placeOrder} loading={placing}>
                            Đặt hàng
                        </Button>
                        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                            <Lock className="h-3.5 w-3.5" /> Giá, phí ship và giảm giá được hệ thống kiểm tra lại khi đặt hàng
                        </p>
                    </div>
                </aside>
            </div>

            <AddressFormModal
                open={modal.open}
                editing={modal.editing}
                onClose={() => setModal({ open: false, editing: null })}
                onSaved={onSaved}
            />
        </div>
    );
}

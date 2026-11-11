'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, ShoppingBag, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { removeFromCart, selectCartSubtotal, updateCartQuantity } from '@/store/redux/cartSlice';
import { promotionService } from '@/services/promotionService';
import { VoucherCheck } from '@/types/promotion';
import { useToast } from '@/components/ui/Toast';
import { Button, LinkButton } from '@/components/ui/Button';
import { Breadcrumb, EmptyState, QuantityInput } from '@/components/ui/misc';
import { VoucherPicker } from '@/components/cart/VoucherPicker';
import { FreeShipProgress } from '@/components/cart/FreeShipProgress';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { errorMessage, formatVND, PLACEHOLDER_IMAGE } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

export default function CartPage() {
    const t = useT();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { items, hydrated, syncing } = useAppSelector((s) => s.cart);
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
    const subtotal = useAppSelector(selectCartSubtotal);
    const [voucher, setVoucher] = useState<VoucherCheck | null>(null);
    const [threshold, setThreshold] = useState(0);
    const [busy, setBusy] = useState<number | null>(null);

    useEffect(() => {
        promotionService
            .quoteShipping(undefined, 0)
            .then((r) => setThreshold(r.data.freeShippingThreshold))
            .catch(() => {});
    }, []);

    const run = async (variantId: number, fn: () => Promise<unknown>) => {
        setBusy(variantId);
        try {
            await fn();
        } catch (e) {
            toast(errorMessage(e, t('cart.updateFailed')), 'error');
        } finally {
            setBusy(null);
        }
    };

    const discount = voucher?.discountAmount || 0;
    const count = items.reduce((n, i) => n + i.quantity, 0);

    const checkout = () => {
        if (!isAuthenticated) {
            toast(t('cart.loginToCheckout'), 'info');
            router.push('/auth/login?redirect=/checkout');
            return;
        }
        router.push('/checkout');
    };

    if (!hydrated) {
        return (
            <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_380px]">
                <div className="skeleton h-80 rounded-3xl" />
                <div className="skeleton h-80 rounded-3xl" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container-page py-8">
                <div className="card">
                    <EmptyState
                        icon={<ShoppingBag className="h-9 w-9" />}
                        title={t('cart.empty')}
                        description={t('cart.emptyBody')}
                        action={<LinkButton href="/products">{t('cart.shopNow')}</LinkButton>}
                    />
                </div>
                <RecentlyViewed className="mt-12" />
            </div>
        );
    }

    return (
        <div className="container-page py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-6">
            <Breadcrumb items={[{ label: t('common.home'), href: '/' }, { label: t('cart.title') }]} />
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
                {t('cart.title')} <span className="text-base font-medium text-muted">{t('cart.itemCount', { n: count })}</span>
            </h1>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] [&>*]:min-w-0">
                <div className="space-y-4">
                    <FreeShipProgress subtotal={subtotal} threshold={threshold} />
                    <ul className="card divide-y divide-line">
                        {items.map((it) => (
                            <li key={it.variantId} className={`flex gap-4 p-4 transition ${busy === it.variantId || syncing ? 'opacity-60' : ''}`}>
                                <Link href={`/products/${it.productId}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-mint-100 sm:h-28 sm:w-28">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={it.image || PLACEHOLDER_IMAGE} alt={it.name} className="h-full w-full object-cover" />
                                </Link>
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <div className="flex items-start justify-between gap-3">
                                        <Link href={`/products/${it.productId}`} className="line-clamp-2 font-semibold hover:text-brand-700">
                                            {it.name}
                                        </Link>
                                        <button
                                            onClick={() => run(it.variantId, () => dispatch(removeFromCart(it.variantId)).unwrap())}
                                            className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-coral-50 hover:text-coral-600"
                                            aria-label={t('cart.remove', { name: it.name })}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="mt-0.5 text-sm text-muted">Size {it.size}</p>
                                    {it.stock > 0 && it.stock <= 5 && <p className="text-xs font-medium text-coral-600">{t('cart.onlyLeft', { n: it.stock })}</p>}
                                    <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
                                        <QuantityInput
                                            size="sm"
                                            value={it.quantity}
                                            max={it.stock || 99}
                                            disabled={busy === it.variantId}
                                            onChange={(q) => run(it.variantId, () => dispatch(updateCartQuantity({ variantId: it.variantId, quantity: q })).unwrap())}
                                        />
                                        <div className="text-right">
                                            <p className="font-bold">{formatVND(it.price * it.quantity)}</p>
                                            {it.quantity > 1 && <p className="text-xs text-muted">{t('cart.perPair', { v: formatVND(it.price) })}</p>}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <aside className="lg:sticky lg:top-36 lg:self-start">
                    <div className="card space-y-5 p-5">
                        <h2 className="text-lg font-bold">{t('cart.summary')}</h2>
                        <VoucherPicker subtotal={subtotal} applied={voucher} onChange={setVoucher} />
                        <dl className="space-y-2.5 border-t border-line pt-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted">{t('cart.subtotal')}</dt>
                                <dd className="font-semibold">{formatVND(subtotal)}</dd>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-brand-700">
                                    <dt>{t('cart.discount', { code: voucher?.code ?? '' })}</dt>
                                    <dd className="font-semibold">-{formatVND(discount)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt className="text-muted">{t('cart.shipping')}</dt>
                                <dd className="text-muted">{t('cart.shippingLater')}</dd>
                            </div>
                            <div className="flex items-baseline justify-between border-t border-line pt-3">
                                <dt className="font-bold">{t('cart.afterDiscount')}</dt>
                                <dd className="text-2xl font-extrabold text-coral-500">{formatVND(subtotal - discount)}</dd>
                            </div>
                        </dl>
                        <Button size="lg" className="w-full" onClick={checkout}>
                            {t('cart.checkout')} <ArrowRight className="h-4 w-4" />
                        </Button>
                        <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
                            <Lock className="h-3.5 w-3.5" /> {t('cart.secure')}
                        </p>
                    </div>
                    <Link href="/products" className="mt-4 block text-center text-sm font-semibold text-brand-600 hover:underline">
                        {t('cart.continue')}
                    </Link>
                </aside>
            </div>

            {/* Thanh thanh toán cố định trên điện thoại: không phải cuộn xuống cuối trang mới thấy tổng tiền */}
            <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-surface/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">{t('cart.afterDiscount')}</p>
                    <p className="truncate text-lg font-extrabold text-coral-500">{formatVND(subtotal - discount)}</p>
                </div>
                <Button className="h-12 px-6" onClick={checkout}>
                    {t('checkout.title')} <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

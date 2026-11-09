'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, PackageX, ShieldCheck, ShoppingBag, Ticket, Truck, RotateCcw, Zap } from 'lucide-react';
import { productService } from '@/services/productService';
import { promotionService } from '@/services/promotionService';
import { ProductResponse, ProductVariant } from '@/types/product';
import { Voucher, ShippingQuote } from '@/types/promotion';
import { useAppDispatch } from '@/store/redux/hooks';
import { addToCart } from '@/store/redux/cartSlice';
import { useToast } from '@/components/ui/Toast';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { WishlistButton } from '@/components/product/WishlistButton';
import { SizeGuide } from '@/components/product/SizeGuide';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { Button, LinkButton } from '@/components/ui/Button';
import { Breadcrumb, EmptyState, QuantityInput, SectionHeading } from '@/components/ui/misc';
import { voucherHeadline } from '@/components/home/VoucherStrip';
import { PROVINCES } from '@/lib/provinces';
import { pushRecentlyViewed } from '@/lib/recentlyViewed';
import { cn, effectivePrice, errorMessage, formatCompact, formatVND, productImages, totalStock } from '@/lib/utils';

type Tab = 'desc' | 'reviews' | 'policy';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const toast = useToast();

    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [related, setRelated] = useState<ProductResponse[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [selected, setSelected] = useState<ProductVariant | null>(null);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState<'cart' | 'buy' | null>(null);
    const [tab, setTab] = useState<Tab>('desc');
    const [province, setProvince] = useState('Hồ Chí Minh');
    const [quote, setQuote] = useState<ShippingQuote | null>(null);
    const [sizeError, setSizeError] = useState(false);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setNotFound(false);
        setSelected(null);
        setQty(1);
        productService
            .getProductById(id)
            .then((r) => {
                if (!alive) return;
                setProduct(r.data);
                pushRecentlyViewed(r.data.id);
                document.title = `${r.data.name} | PF. Shoes`;
            })
            .catch(() => alive && setNotFound(true))
            .finally(() => alive && setLoading(false));
        productService.getRelated(id, 12).then((r) => alive && setRelated(r.data || [])).catch(() => {});
        promotionService.getAvailableVouchers().then((r) => alive && setVouchers(r.data || [])).catch(() => {});
        return () => {
            alive = false;
        };
    }, [id]);

    const price = product ? effectivePrice(product) : 0;

    useEffect(() => {
        if (!product) return;
        promotionService
            .quoteShipping(province, price * qty)
            .then((r) => setQuote(r.data))
            .catch(() => setQuote(null));
    }, [province, product, price, qty]);

    const variants = useMemo(
        () => [...(product?.variants || [])].sort((a, b) => parseFloat(a.size) - parseFloat(b.size) || a.size.localeCompare(b.size)),
        [product]
    );
    const images = useMemo(() => (product ? productImages(product) : []), [product]);
    const stock = product ? totalStock(product) : 0;

    // Voucher dùng được với giá hiện tại (đủ điều kiện đơn tối thiểu), ưu tiên giảm nhiều nhất
    const bestVouchers = useMemo(() => {
        const sub = price * qty;
        const value = (v: Voucher) => {
            if (v.discountType === 'FIXED') return v.discountValue;
            const d = (sub * v.discountValue) / 100;
            return v.maxDiscount ? Math.min(d, v.maxDiscount) : d;
        };
        return [...vouchers].sort((a, b) => value(b) - value(a)).slice(0, 3);
    }, [vouchers, price, qty]);

    if (loading) {
        return (
            <div className="container-page grid gap-8 py-6 md:grid-cols-2">
                <div className="skeleton aspect-square rounded-3xl" />
                <div className="space-y-4">
                    <div className="skeleton h-5 w-24" />
                    <div className="skeleton h-9 w-3/4" />
                    <div className="skeleton h-6 w-40" />
                    <div className="skeleton h-12 w-48" />
                    <div className="skeleton h-28 w-full" />
                    <div className="skeleton h-12 w-full" />
                </div>
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div className="container-page py-10">
                <EmptyState
                    icon={<PackageX className="h-9 w-9" />}
                    title="Không tìm thấy sản phẩm"
                    description="Sản phẩm có thể đã ngừng bán hoặc đường dẫn không đúng."
                    action={<LinkButton href="/products">Xem sản phẩm khác</LinkButton>}
                />
            </div>
        );
    }

    const handleAdd = async (mode: 'cart' | 'buy') => {
        if (!selected) {
            setSizeError(true);
            toast('Vui lòng chọn size', 'info');
            document.getElementById('size-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setAdding(mode);
        try {
            await dispatch(
                addToCart({
                    variantId: selected.id,
                    productId: product.id,
                    name: product.name,
                    image: images[0],
                    size: selected.size,
                    color: selected.color,
                    price,
                    quantity: qty,
                    stock: selected.stockQuantity,
                })
            ).unwrap();
            if (mode === 'buy') router.push('/cart');
            else toast(`Đã thêm ${qty} × ${product.name} (size ${selected.size}) vào giỏ`);
        } catch (e) {
            toast(errorMessage(e, 'Không thêm được vào giỏ hàng'), 'error');
        } finally {
            setAdding(null);
        }
    };

    const tabBtn = (t: Tab) =>
        cn('relative px-1 pb-3 text-sm font-semibold transition', tab === t ? 'text-brand-700' : 'text-muted hover:text-ink');

    return (
        <div className="pb-24 md:pb-6">
            <div className="container-page py-4">
                <Breadcrumb
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        ...(product.categoryName ? [{ label: product.categoryName, href: `/products?categoryName=${encodeURIComponent(product.categoryName)}` }] : []),
                        { label: product.name },
                    ]}
                />
            </div>

            <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 [&>*]:min-w-0">
                <ProductGallery images={images} name={product.name} model3dUrl={product.model3dUrl} />

                {/* Thông tin mua hàng */}
                <div className="lg:sticky lg:top-36 lg:self-start">
                    <div className="flex items-center gap-2">
                        {product.brandName && (
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{product.brandName}</span>
                        )}
                        {product.model3dUrl && (
                            <span className="flex items-center gap-1 rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white">
                                <Box className="h-3 w-3" /> Có mô hình 3D
                            </span>
                        )}
                    </div>
                    <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">{product.name}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                        <button onClick={() => { setTab('reviews'); document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center gap-1.5 hover:text-ink">
                            <Rating value={product.avgRating} />
                            <span className="font-semibold text-ink">{(product.avgRating || 0).toFixed(1)}</span>({product.reviewCount} đánh giá)
                        </button>
                        <span>Đã bán {formatCompact(product.totalSold)}</span>
                        <span>Mã: {product.id}</span>
                    </div>

                    <div className="mt-5 rounded-2xl bg-gradient-to-r from-mint-100 to-white p-4">
                        <Price originalPrice={product.originalPrice} salePrice={product.salePrice} size="lg" />
                    </div>

                    {bestVouchers.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 text-sm text-muted">
                                <Ticket className="h-4 w-4 text-brand-500" /> Mã giảm:
                            </span>
                            {bestVouchers.map((v) => (
                                <span key={v.id} className="rounded-md border border-dashed border-brand-400 bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700" title={v.description || ''}>
                                    {v.code} · {voucherHeadline(v)}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Chọn size */}
                    <div id="size-picker" className="mt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold">
                                Chọn size {selected && <span className="text-brand-700">· EU {selected.size}</span>}
                            </p>
                            <SizeGuide />
                        </div>
                        <div className={cn('grid grid-cols-5 gap-2 rounded-2xl sm:grid-cols-6', sizeError && 'ring-2 ring-coral-400 ring-offset-4')}>
                            {variants.map((v) => {
                                const out = v.stockQuantity <= 0;
                                return (
                                    <button
                                        key={v.id}
                                        disabled={out}
                                        onClick={() => {
                                            setSelected(v);
                                            setSizeError(false);
                                            setQty((q) => Math.min(q, v.stockQuantity));
                                        }}
                                        aria-pressed={selected?.id === v.id}
                                        className={cn(
                                            'relative h-12 rounded-xl border text-sm font-semibold transition',
                                            selected?.id === v.id
                                                ? 'border-brand-500 bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                                                : 'border-line bg-white hover:border-brand-400',
                                            out && 'cursor-not-allowed bg-mint-50 text-muted line-through opacity-60'
                                        )}
                                    >
                                        {v.size}
                                        {!out && v.stockQuantity <= 5 && selected?.id !== v.id && (
                                            <span className="absolute -right-1 -top-1.5 h-2.5 w-2.5 rounded-full bg-coral-500 ring-2 ring-white" title="Sắp hết" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {selected && selected.stockQuantity <= 5 && (
                            <p className="mt-2 text-sm font-medium text-coral-600">Chỉ còn {selected.stockQuantity} đôi size {selected.size}</p>
                        )}
                        {stock === 0 && <p className="mt-2 text-sm font-medium text-coral-600">Sản phẩm tạm hết hàng</p>}
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <p className="text-sm font-semibold">Số lượng</p>
                        <QuantityInput value={qty} onChange={setQty} max={selected?.stockQuantity || 10} disabled={stock === 0} />
                    </div>

                    <div className="mt-6 hidden gap-3 md:flex">
                        <Button size="lg" variant="soft" className="flex-1" onClick={() => handleAdd('cart')} loading={adding === 'cart'} disabled={stock === 0}>
                            <ShoppingBag className="h-5 w-5" /> Thêm vào giỏ
                        </Button>
                        <Button size="lg" variant="coral" className="flex-1" onClick={() => handleAdd('buy')} loading={adding === 'buy'} disabled={stock === 0}>
                            <Zap className="h-5 w-5" /> Mua ngay
                        </Button>
                        <WishlistButton productId={product.id} withLabel className="h-13" />
                    </div>

                    {/* Vận chuyển */}
                    <div className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-4 text-sm">
                        <div className="flex items-start gap-3">
                            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span>Giao đến</span>
                                    <select
                                        value={province}
                                        onChange={(e) => setProvince(e.target.value)}
                                        className="rounded-lg border border-line bg-white px-2 py-1 text-sm font-semibold outline-none focus:border-brand-400"
                                        aria-label="Tỉnh/Thành nhận hàng"
                                    >
                                        {PROVINCES.map((p) => (
                                            <option key={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                {quote && (
                                    <p className="mt-1 text-muted">
                                        Phí ship:{' '}
                                        <b className={quote.freeShipping ? 'text-brand-600' : 'text-ink'}>
                                            {quote.freeShipping ? 'Miễn phí' : formatVND(quote.fee)}
                                        </b>{' '}
                                        · Dự kiến {quote.estimatedDays}
                                        {!quote.freeShipping && quote.freeShippingThreshold > 0 && (
                                            <> · Freeship cho đơn từ {formatVND(quote.freeShippingThreshold)}</>
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <RotateCcw className="h-5 w-5 shrink-0 text-brand-500" /> Đổi size / trả hàng trong 7 ngày
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 shrink-0 text-brand-500" /> Chính hãng, bảo hành lỗi nhà sản xuất
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs chi tiết */}
            <section id="details" className="container-page mt-14 scroll-mt-36">
                <div className="card p-5 md:p-8">
                    <div className="flex gap-6 border-b border-line" role="tablist">
                        {(
                            [
                                ['desc', 'Mô tả sản phẩm'],
                                ['reviews', `Đánh giá (${product.reviewCount})`],
                                ['policy', 'Vận chuyển & đổi trả'],
                            ] as [Tab, string][]
                        ).map(([t, label]) => (
                            <button key={t} role="tab" aria-selected={tab === t} className={tabBtn(t)} onClick={() => setTab(t)}>
                                {label}
                                {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500" />}
                            </button>
                        ))}
                    </div>
                    <div className="pt-6">
                        {tab === 'desc' && (
                            <div className="max-w-3xl">
                                {product.description ? (
                                    <p className="whitespace-pre-line text-[15px] leading-7 text-ink/90">{product.description}</p>
                                ) : (
                                    <p className="text-muted">Sản phẩm chưa có mô tả.</p>
                                )}
                                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl bg-mint-50 p-5 text-sm sm:grid-cols-3">
                                    <div>
                                        <dt className="text-muted">Thương hiệu</dt>
                                        <dd className="font-semibold">{product.brandName || '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted">Danh mục</dt>
                                        <dd className="font-semibold">{product.categoryName || '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted">Size có sẵn</dt>
                                        <dd className="font-semibold">{variants.filter((v) => v.stockQuantity > 0).map((v) => v.size).join(', ') || 'Hết hàng'}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}
                        {tab === 'reviews' && <ProductReviews productId={product.id} avgRating={product.avgRating} reviewCount={product.reviewCount} />}
                        {tab === 'policy' && (
                            <div className="grid max-w-3xl gap-4 text-sm leading-6 text-ink/90">
                                <p>
                                    <b>Giao hàng:</b> Đơn được xác nhận và đóng gói trong 24 giờ. Phí ship tính theo tỉnh/thành và hiển thị trước khi đặt hàng; miễn phí
                                    cho đơn từ 1.000.000₫.
                                </p>
                                <p>
                                    <b>Đổi trả:</b> Yêu cầu đổi size hoặc trả hàng trong 7 ngày kể từ khi nhận hàng, sản phẩm còn nguyên tem mác và chưa qua sử dụng.
                                </p>
                                <p>
                                    <b>Bảo hành:</b> Gửi yêu cầu bảo hành lỗi keo, chỉ trong 30 ngày kể từ khi nhận hàng, ngay trong mục Đơn hàng của tôi.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {related.length > 0 && (
                <section className="container-page mt-14">
                    <SectionHeading
                        title="Sản phẩm tương tự"
                        href={product.categoryName ? `/products?categoryName=${encodeURIComponent(product.categoryName)}` : '/products'}
                    />
                    <ProductCarousel products={related} />
                </section>
            )}

            <RecentlyViewed excludeId={product.id} className="container-page mt-14" />

            {/* Thanh mua hàng cố định trên điện thoại */}
            <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
                <WishlistButton productId={product.id} className="h-12 w-12 shrink-0 rounded-xl border border-line" />
                <Button variant="soft" className="h-12 flex-1" onClick={() => handleAdd('cart')} loading={adding === 'cart'} disabled={stock === 0}>
                    Thêm vào giỏ
                </Button>
                <Button variant="coral" className="h-12 flex-1" onClick={() => handleAdd('buy')} loading={adding === 'buy'} disabled={stock === 0}>
                    Mua ngay
                </Button>
            </div>
        </div>
    );
}

'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, SearchX } from 'lucide-react';
import { productService } from '@/services/productService';
import { ProductFiltersResponse, ProductResponse, ProductSort } from '@/types/product';
import { ProductGrid } from '@/components/product/ProductCard';
import { Breadcrumb, EmptyState, Pagination } from '@/components/ui/misc';
import { Button } from '@/components/ui/Button';
import { cn, formatVND } from '@/lib/utils';

const PAGE_SIZE = 16;
const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const PRICE_RANGES = [
    { label: 'Dưới 1 triệu', min: undefined, max: 1_000_000 },
    { label: '1 – 2 triệu', min: 1_000_000, max: 2_000_000 },
    { label: '2 – 3 triệu', min: 2_000_000, max: 3_000_000 },
    { label: '3 – 5 triệu', min: 3_000_000, max: 5_000_000 },
    { label: 'Trên 5 triệu', min: 5_000_000, max: undefined },
];
const SORTS: { value: ProductSort; label: string }[] = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'best_selling', label: 'Bán chạy' },
    { value: 'price_asc', label: 'Giá thấp → cao' },
    { value: 'price_desc', label: 'Giá cao → thấp' },
    { value: 'rating', label: 'Đánh giá cao' },
];

function ProductsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();

    const query = useMemo(
        () => ({
            q: sp.get('q') || undefined,
            categoryName: sp.get('categoryName') || undefined,
            brandName: sp.get('brandName') || undefined,
            productSize: sp.get('productSize') || undefined,
            minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
            maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
            onSale: sp.get('onSale') === 'true',
            sortBy: (sp.get('sortBy') as ProductSort) || 'newest',
            page: Number(sp.get('page') || 0),
        }),
        [sp]
    );

    const [filters, setFilters] = useState<ProductFiltersResponse | null>(null);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [drawer, setDrawer] = useState(false);

    useEffect(() => {
        productService.getProductFilters().then((r) => setFilters(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(false);
        productService
            .getProducts({ ...query, onSale: query.onSale || undefined, size: PAGE_SIZE })
            .then((r) => {
                if (!alive) return;
                setProducts(r.data.content);
                setTotal(r.data.totalElements);
                setTotalPages(r.data.totalPages);
            })
            .catch(() => alive && setError(true))
            .finally(() => alive && setLoading(false));
        return () => {
            alive = false;
        };
    }, [query]);

    /** Cập nhật URL: giá trị undefined/'' sẽ bị xóa khỏi URL. Đổi bộ lọc thì quay về trang 1. */
    const update = useCallback(
        (patch: Record<string, string | number | boolean | undefined>, keepPage = false) => {
            const next = new URLSearchParams(sp.toString());
            Object.entries(patch).forEach(([k, v]) => {
                if (v === undefined || v === '' || v === false) next.delete(k);
                else next.set(k, String(v));
            });
            if (!keepPage) next.delete('page');
            router.push(`${pathname}?${next.toString()}`, { scroll: keepPage });
        },
        [sp, router, pathname]
    );

    const changePage = (p: number) => {
        update({ page: p || undefined }, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const priceKey = (min?: number, max?: number) => `${min ?? ''}-${max ?? ''}`;
    const activePrice = priceKey(query.minPrice, query.maxPrice);

    const chips: { label: string; clear: Record<string, undefined> }[] = [];
    if (query.q) chips.push({ label: `“${query.q}”`, clear: { q: undefined } });
    if (query.categoryName) chips.push({ label: query.categoryName, clear: { categoryName: undefined } });
    if (query.brandName) chips.push({ label: query.brandName, clear: { brandName: undefined } });
    if (query.productSize) chips.push({ label: `Size ${query.productSize}`, clear: { productSize: undefined } });
    if (query.minPrice || query.maxPrice) {
        const r = PRICE_RANGES.find((x) => priceKey(x.min, x.max) === activePrice);
        chips.push({
            label: r?.label || `${formatVND(query.minPrice)} – ${formatVND(query.maxPrice)}`,
            clear: { minPrice: undefined, maxPrice: undefined },
        });
    }
    if (query.onSale) chips.push({ label: 'Đang giảm giá', clear: { onSale: undefined } as Record<string, undefined> });

    const title = query.q ? `Kết quả cho “${query.q}”` : query.onSale ? 'Khuyến mãi' : query.categoryName || 'Tất cả sản phẩm';

    const option = (active: boolean) =>
        cn(
            'w-full rounded-xl px-3 py-2 text-left text-sm transition',
            active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink hover:bg-mint-50'
        );

    const FilterPanel = (
        <div className="space-y-6">
            <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-coral-50 px-4 py-3">
                <span className="text-sm font-semibold text-coral-600">Chỉ hàng đang giảm giá</span>
                <input
                    type="checkbox"
                    checked={query.onSale}
                    onChange={(e) => update({ onSale: e.target.checked || undefined })}
                    className="h-5 w-5 accent-coral-500"
                />
            </label>

            <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Danh mục</h3>
                <button className={option(!query.categoryName)} onClick={() => update({ categoryName: undefined })}>
                    Tất cả
                </button>
                {filters?.categories.map((c) => (
                    <button key={c} className={option(query.categoryName === c)} onClick={() => update({ categoryName: c })}>
                        {c}
                    </button>
                ))}
            </div>

            <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Thương hiệu</h3>
                <div className="flex flex-wrap gap-2">
                    {filters?.brands.map((b) => (
                        <button
                            key={b}
                            onClick={() => update({ brandName: query.brandName === b ? undefined : b })}
                            className={cn(
                                'rounded-full border px-3.5 py-1.5 text-sm transition',
                                query.brandName === b ? 'border-brand-500 bg-brand-500 text-white' : 'border-line bg-white hover:border-brand-400'
                            )}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Khoảng giá</h3>
                {PRICE_RANGES.map((r) => {
                    const active = priceKey(r.min, r.max) === activePrice;
                    return (
                        <button
                            key={r.label}
                            className={option(active)}
                            onClick={() => update(active ? { minPrice: undefined, maxPrice: undefined } : { minPrice: r.min, maxPrice: r.max })}
                        >
                            {r.label}
                        </button>
                    );
                })}
            </div>

            <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Size còn hàng</h3>
                <div className="grid grid-cols-5 gap-2">
                    {SIZES.map((s) => (
                        <button
                            key={s}
                            onClick={() => update({ productSize: query.productSize === s ? undefined : s })}
                            className={cn(
                                'h-10 rounded-xl border text-sm font-semibold transition',
                                query.productSize === s ? 'border-brand-500 bg-brand-500 text-white' : 'border-line bg-white hover:border-brand-400'
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-page py-6">
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: title }]} />

            <div className="mt-4 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] [&>*]:min-w-0">
                <aside className="hidden lg:block">
                    <div className="card sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto p-5">{FilterPanel}</div>
                </aside>

                <div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
                            <p className="text-sm text-muted">{loading ? 'Đang tải…' : `${total.toLocaleString('vi-VN')} sản phẩm`}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}>
                                <SlidersHorizontal className="h-4 w-4" /> Bộ lọc{chips.length ? ` (${chips.length})` : ''}
                            </Button>
                            <label className="sr-only" htmlFor="sort">
                                Sắp xếp
                            </label>
                            <select
                                id="sort"
                                value={query.sortBy}
                                onChange={(e) => update({ sortBy: e.target.value === 'newest' ? undefined : e.target.value })}
                                className="h-9 rounded-lg border border-line bg-white px-3 text-sm font-medium outline-none focus:border-brand-400"
                            >
                                {SORTS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {chips.length > 0 && (
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            {chips.map((c) => (
                                <button
                                    key={c.label}
                                    onClick={() => update(c.clear)}
                                    className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 hover:bg-brand-100"
                                >
                                    {c.label} <X className="h-3.5 w-3.5" />
                                </button>
                            ))}
                            <button onClick={() => router.push(pathname)} className="text-sm font-medium text-muted underline hover:text-coral-600">
                                Xóa tất cả
                            </button>
                        </div>
                    )}

                    {error ? (
                        <EmptyState
                            icon={<SearchX className="h-9 w-9" />}
                            title="Không tải được sản phẩm"
                            description="Máy chủ đang bận hoặc mất kết nối. Vui lòng thử lại."
                            action={<Button onClick={() => update({}, true)}>Thử lại</Button>}
                        />
                    ) : !loading && products.length === 0 ? (
                        <EmptyState
                            icon={<SearchX className="h-9 w-9" />}
                            title="Không có sản phẩm phù hợp"
                            description="Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác."
                            action={
                                <Button variant="soft" onClick={() => router.push(pathname)}>
                                    Xóa bộ lọc
                                </Button>
                            }
                        />
                    ) : (
                        <ProductGrid products={products} loading={loading} skeletonCount={PAGE_SIZE} className="lg:grid-cols-3 xl:grid-cols-4" />
                    )}

                    <div className="mt-10">
                        <Pagination page={query.page} totalPages={totalPages} onChange={changePage} />
                    </div>
                </div>
            </div>

            {/* Bộ lọc trên điện thoại */}
            {drawer && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawer(false)} />
                    <div className="absolute inset-y-0 right-0 flex w-[340px] max-w-[90%] flex-col bg-white shadow-lift">
                        <div className="flex h-16 items-center justify-between border-b border-line px-5">
                            <h2 className="text-lg font-bold">Bộ lọc</h2>
                            <button onClick={() => setDrawer(false)} className="rounded-full p-2 hover:bg-mint-100" aria-label="Đóng">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">{FilterPanel}</div>
                        <div className="border-t border-line p-4">
                            <Button className="w-full" onClick={() => setDrawer(false)}>
                                Xem {total.toLocaleString('vi-VN')} sản phẩm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="container-page py-6"><ProductGrid products={[]} loading /></div>}>
            <ProductsContent />
        </Suspense>
    );
}

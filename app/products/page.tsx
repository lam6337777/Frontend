'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, SearchX } from 'lucide-react';
import { productService } from '@/services/productService';
import { ProductFiltersResponse, ProductResponse, ProductSort } from '@/types/product';
import { ProductGrid } from '@/components/product/ProductCard';
import { Breadcrumb, EmptyState, Pagination } from '@/components/ui/misc';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/client';
import type { TKey } from '@/lib/i18n/core';
import { useDismiss, useLockScroll } from '@/lib/useDismiss';
import { cn, formatNumber, formatVND } from '@/lib/utils';

const PAGE_SIZE = 16;
const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const PRICE_RANGES: { key: TKey; min?: number; max?: number }[] = [
    { key: 'list.priceUnder1', min: undefined, max: 1_000_000 },
    { key: 'list.price1to2', min: 1_000_000, max: 2_000_000 },
    { key: 'list.price2to3', min: 2_000_000, max: 3_000_000 },
    { key: 'list.price3to5', min: 3_000_000, max: 5_000_000 },
    { key: 'list.priceOver5', min: 5_000_000, max: undefined },
];
const SORTS: { value: ProductSort; key: TKey }[] = [
    { value: 'newest', key: 'list.sortNewest' },
    { value: 'best_selling', key: 'list.sortBest' },
    { value: 'price_asc', key: 'list.sortPriceAsc' },
    { value: 'price_desc', key: 'list.sortPriceDesc' },
    { value: 'rating', key: 'list.sortRating' },
];

type Patch = Record<string, string | number | boolean | undefined>;

function ProductsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();
    const { t, cat } = useI18n();
    const resultsRef = useRef<HTMLDivElement>(null);

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

    const closeDrawer = useCallback(() => setDrawer(false), []);
    useLockScroll(drawer);
    useDismiss([], closeDrawer, drawer); // Esc

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
        (patch: Patch, keepPage = false) => {
            const next = new URLSearchParams(sp.toString());
            Object.entries(patch).forEach(([k, v]) => {
                if (v === undefined || v === '' || v === false) next.delete(k);
                else next.set(k, String(v));
            });
            if (!keepPage) next.delete('page');
            router.push(`${pathname}?${next.toString()}`, { scroll: false });
        },
        [sp, router, pathname]
    );

    /** Chọn một bộ lọc: áp dụng ngay, đóng ngăn bộ lọc (điện thoại) và đưa danh sách lên đầu màn hình */
    const apply = useCallback(
        (patch: Patch) => {
            update(patch);
            setDrawer(false);
            requestAnimationFrame(() => {
                const top = resultsRef.current ? resultsRef.current.getBoundingClientRect().top + window.scrollY - 170 : 0;
                if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            });
        },
        [update]
    );

    const changePage = (p: number) => {
        update({ page: p || undefined }, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const priceKey = (min?: number, max?: number) => `${min ?? ''}-${max ?? ''}`;
    const activePrice = priceKey(query.minPrice, query.maxPrice);

    const chips: { label: string; clear: Patch }[] = [];
    if (query.q) chips.push({ label: `“${query.q}”`, clear: { q: undefined } });
    if (query.categoryName) chips.push({ label: cat(query.categoryName), clear: { categoryName: undefined } });
    if (query.brandName) chips.push({ label: query.brandName, clear: { brandName: undefined } });
    if (query.productSize) chips.push({ label: `Size ${query.productSize}`, clear: { productSize: undefined } });
    if (query.minPrice || query.maxPrice) {
        const r = PRICE_RANGES.find((x) => priceKey(x.min, x.max) === activePrice);
        chips.push({
            label: r ? t(r.key) : `${formatVND(query.minPrice)} – ${formatVND(query.maxPrice)}`,
            clear: { minPrice: undefined, maxPrice: undefined },
        });
    }
    if (query.onSale) chips.push({ label: t('list.onSaleChip'), clear: { onSale: undefined } });

    const title = query.q
        ? t('list.resultsFor', { q: query.q })
        : query.onSale
          ? t('list.sale')
          : query.categoryName
            ? cat(query.categoryName)
            : t('list.all');

    const countLabel = (key: 'list.count' | 'list.showResults') => t(key, { n: total === 1 ? 1 : formatNumber(total) });

    const option = (active: boolean) =>
        cn(
            'w-full rounded-xl px-3 py-2.5 text-left text-sm transition',
            active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink hover:bg-mint-50 active:bg-mint-100'
        );
    const pill = (active: boolean) =>
        cn(
            'rounded-full border px-3.5 py-2 text-sm transition',
            active ? 'border-brand-500 bg-brand-500 text-white' : 'border-line bg-surface hover:border-brand-400'
        );

    const FilterPanel = (
        <div className="space-y-6">
            <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-coral-50 px-4 py-3">
                <span className="text-sm font-semibold text-coral-600">{t('list.onlySale')}</span>
                <input
                    type="checkbox"
                    checked={query.onSale}
                    onChange={(e) => apply({ onSale: e.target.checked || undefined })}
                    className="h-5 w-5 accent-coral-500"
                />
            </label>

            <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('list.category')}</h3>
                <button className={option(!query.categoryName)} onClick={() => apply({ categoryName: undefined })}>
                    {t('list.allCategories')}
                </button>
                {filters?.categories.map((c) => (
                    <button key={c} className={option(query.categoryName === c)} onClick={() => apply({ categoryName: c })}>
                        {cat(c)}
                    </button>
                ))}
            </div>

            <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('list.brand')}</h3>
                <div className="flex flex-wrap gap-2">
                    {filters?.brands.map((b) => (
                        <button key={b} onClick={() => apply({ brandName: query.brandName === b ? undefined : b })} className={pill(query.brandName === b)}>
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('list.price')}</h3>
                {PRICE_RANGES.map((r) => {
                    const active = priceKey(r.min, r.max) === activePrice;
                    return (
                        <button
                            key={r.key}
                            className={option(active)}
                            onClick={() => apply(active ? { minPrice: undefined, maxPrice: undefined } : { minPrice: r.min, maxPrice: r.max })}
                        >
                            {t(r.key)}
                        </button>
                    );
                })}
            </div>

            <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('list.sizes')}</h3>
                <div className="grid grid-cols-5 gap-2">
                    {SIZES.map((s) => (
                        <button
                            key={s}
                            onClick={() => apply({ productSize: query.productSize === s ? undefined : s })}
                            className={cn(
                                'h-11 rounded-xl border text-sm font-semibold transition',
                                query.productSize === s ? 'border-brand-500 bg-brand-500 text-white' : 'border-line bg-surface hover:border-brand-400'
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const SortSelect = ({ className }: { className: string }) => (
        <select
            aria-label={t('list.sort')}
            value={query.sortBy}
            onChange={(e) => update({ sortBy: e.target.value === 'newest' ? undefined : e.target.value })}
            className={cn('rounded-xl border border-line bg-surface px-3 font-medium text-ink outline-none focus:border-brand-400', className)}
        >
            {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                    {t(s.key)}
                </option>
            ))}
        </select>
    );

    return (
        <div className="container-page py-6">
            <Breadcrumb items={[{ label: t('common.home'), href: '/' }, { label: title }]} />

            <div className="mt-4 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] [&>*]:min-w-0">
                <aside className="hidden lg:block">
                    <div className="card sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto p-5">{FilterPanel}</div>
                </aside>

                <div ref={resultsRef}>
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
                            <p className="text-sm text-muted">{loading ? t('common.loading') : countLabel('list.count')}</p>
                        </div>
                        <SortSelect className="hidden h-10 text-sm lg:block" />
                    </div>

                    {/* Thanh công cụ điện thoại: dính dưới header khi cuộn */}
                    <div className="sticky top-[100px] z-20 -mx-4 mb-4 border-b border-line bg-mint-50/95 px-4 pb-3 pt-2 backdrop-blur lg:hidden">
                        <div className="flex gap-2">
                            <Button variant="outline" className="h-10 flex-1" onClick={() => setDrawer(true)}>
                                <SlidersHorizontal className="h-4 w-4" /> {t('list.filters')}
                                {chips.length ? (
                                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] text-white">{chips.length}</span>
                                ) : null}
                            </Button>
                            <SortSelect className="h-10 flex-1" />
                        </div>
                        {/* Chip danh mục vuốt ngang: đổi loại giày bằng 1 chạm */}
                        {filters?.categories?.length ? (
                            <div className="scrollbar-none -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
                                {[undefined, ...filters.categories].map((c) => {
                                    const active = c ? query.categoryName === c : !query.categoryName;
                                    return (
                                        <button
                                            key={c ?? 'all'}
                                            onClick={() => apply({ categoryName: c })}
                                            aria-pressed={active}
                                            className={cn('shrink-0 whitespace-nowrap', pill(active), 'py-1.5')}
                                        >
                                            {c ? cat(c) : t('list.allCategories')}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>

                    {chips.length > 0 && (
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            {chips.map((c) => (
                                <button
                                    key={c.label}
                                    onClick={() => update(c.clear)}
                                    className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
                                >
                                    {c.label} <X className="h-3.5 w-3.5" />
                                </button>
                            ))}
                            <button onClick={() => router.push(pathname, { scroll: false })} className="px-1 py-1.5 text-sm font-medium text-muted underline hover:text-coral-600">
                                {t('list.clearAll')}
                            </button>
                        </div>
                    )}

                    {error ? (
                        <EmptyState
                            icon={<SearchX className="h-9 w-9" />}
                            title={t('list.loadError')}
                            description={t('list.loadErrorBody')}
                            action={<Button onClick={() => update({}, true)}>{t('common.retry')}</Button>}
                        />
                    ) : !loading && products.length === 0 ? (
                        <EmptyState
                            icon={<SearchX className="h-9 w-9" />}
                            title={t('list.empty')}
                            description={t('list.emptyBody')}
                            action={
                                <Button variant="soft" onClick={() => router.push(pathname, { scroll: false })}>
                                    {t('list.clearFilters')}
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

            {/* Bộ lọc trên điện thoại: chạm nền mờ, nút X, Esc hoặc chọn một mục đều đóng ngăn */}
            {drawer && (
                <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label={t('list.filters')}>
                    <div className="absolute inset-0 bg-night/50" onClick={closeDrawer} />
                    <div className="absolute inset-y-0 right-0 flex h-[100dvh] w-[340px] max-w-[90%] animate-[fade-up_0.2s_ease-out] flex-col bg-surface shadow-lift">
                        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
                            <h2 className="text-lg font-bold">{t('list.filters')}</h2>
                            <button onClick={closeDrawer} className="grid h-10 w-10 place-items-center rounded-full hover:bg-mint-100" aria-label={t('common.close')}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto overscroll-contain p-5">{FilterPanel}</div>
                        <div className="flex gap-2 border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            {chips.length > 0 && (
                                <Button variant="outline" onClick={() => router.push(pathname, { scroll: false })}>
                                    {t('list.clearAll')}
                                </Button>
                            )}
                            <Button className="flex-1" onClick={closeDrawer}>
                                {countLabel('list.showResults')}
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

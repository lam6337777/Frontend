'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Box } from 'lucide-react';
import { ProductResponse } from '@/types/product';
import { cn, discountPercent, formatCompact, productImages, totalStock, PLACEHOLDER_IMAGE } from '@/lib/utils';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { WishlistButton } from './WishlistButton';
import { useT } from '@/lib/i18n/client';

const NEW_DAYS = 21;

export function ProductCard({ product, className }: { product: ProductResponse; className?: string }) {
    const ref = useRef<HTMLAnchorElement>(null);
    const t = useT();
    const images = productImages(product);
    const pct = discountPercent(product);
    const soldOut = totalStock(product) === 0;
    const isNew = Date.now() - new Date(product.createdAt).getTime() < NEW_DAYS * 86400000;

    // Hiệu ứng nghiêng 3D nhẹ theo vị trí chuột (chỉ trên thiết bị có chuột)
    const onMove = (e: React.MouseEvent) => {
        const el = ref.current;
        if (!el || window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
    };
    const onLeave = () => {
        ref.current?.style.setProperty('--rx', '0deg');
        ref.current?.style.setProperty('--ry', '0deg');
    };

    return (
        <Link
            ref={ref}
            href={`/products/${product.id}`}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-transparent',
                'transition-[transform,box-shadow] duration-300 ease-out [transform:perspective(900px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))]',
                'hover:shadow-lift hover:ring-brand-100',
                className
            )}
        >
            {/* Ảnh giày chụp trên nền trắng → khung ảnh giữ nền trắng cả ở chế độ tối */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-mint-100 to-white dark:bg-none dark:bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={images[0]}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE)}
                    className={cn(
                        'h-full w-full object-cover transition-all duration-500 group-hover:scale-105',
                        images[1] && 'group-hover:opacity-0',
                        soldOut && 'opacity-60 grayscale'
                    )}
                />
                {images[1] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={images[1]}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                )}

                <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
                    {pct > 0 && <span className="rounded-lg bg-coral-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">-{pct}%</span>}
                    {isNew && <span className="rounded-lg bg-brand-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">{t('product.new')}</span>}
                    {product.model3dUrl && (
                        <span className="flex items-center gap-1 rounded-lg bg-night/85 px-2 py-0.5 text-xs font-bold text-white backdrop-blur">
                            <Box className="h-3 w-3" /> 3D
                        </span>
                    )}
                </div>
                <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5" />
                {soldOut && (
                    <span className="absolute inset-x-0 bottom-0 bg-night/70 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-white">
                        {t('product.soldOut')}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                {product.brandName && <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{product.brandName}</p>}
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-ink group-hover:text-brand-700">{product.name}</h3>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted">
                    {product.reviewCount > 0 ? (
                        <>
                            <Rating value={product.avgRating} size={12} />
                            <span>({product.reviewCount})</span>
                        </>
                    ) : (
                        <span>{t('product.noReviews')}</span>
                    )}
                    {product.totalSold > 0 && <span className="ml-auto whitespace-nowrap">{t('product.sold', { n: formatCompact(product.totalSold) })}</span>}
                </div>
                <Price originalPrice={product.originalPrice} salePrice={product.salePrice} size="sm" className="mt-auto pt-1" />
            </div>
        </Link>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
            <div className="skeleton aspect-square rounded-none" />
            <div className="space-y-2 p-3.5">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-5 w-24" />
            </div>
        </div>
    );
}

export function ProductGrid({
    products,
    loading,
    skeletonCount = 8,
    className,
}: {
    products: ProductResponse[];
    loading?: boolean;
    skeletonCount?: number;
    className?: string;
}) {
    return (
        <div className={cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4', className)}>
            {loading
                ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
    );
}

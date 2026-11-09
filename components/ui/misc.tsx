import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronRight as Sep, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONE_CLASS } from '@/lib/orderStatus';

export function Badge({
    tone = 'brand',
    children,
    className,
}: {
    tone?: keyof typeof TONE_CLASS;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', TONE_CLASS[tone], className)}>
            {children}
        </span>
    );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
    return (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted">
            {items.map((it, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <Sep className="h-3.5 w-3.5" aria-hidden />}
                    {it.href ? (
                        <Link href={it.href} className="hover:text-brand-600">
                            {it.label}
                        </Link>
                    ) : (
                        <span className="line-clamp-1 font-medium text-ink">{it.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

export function QuantityInput({
    value,
    onChange,
    min = 1,
    max = 99,
    size = 'md',
    disabled,
}: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    size?: 'sm' | 'md';
    disabled?: boolean;
}) {
    const h = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11';
    return (
        <div className="inline-flex items-center rounded-xl border border-line bg-white">
            <button
                type="button"
                className={cn(h, 'grid place-items-center rounded-l-xl text-ink hover:bg-mint-100 disabled:opacity-30')}
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={disabled || value <= min}
                aria-label="Giảm số lượng"
            >
                <Minus className="h-4 w-4" />
            </button>
            <span className={cn('min-w-10 text-center font-semibold tabular-nums', size === 'sm' ? 'text-sm' : '')}>{value}</span>
            <button
                type="button"
                className={cn(h, 'grid place-items-center rounded-r-xl text-ink hover:bg-mint-100 disabled:opacity-30')}
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={disabled || value >= max}
                aria-label="Tăng số lượng"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}

export function EmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-500">{icon}</div>
            <h3 className="text-lg font-bold">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

/** Phân trang dạng 1 … 4 5 6 … 20 */
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
    if (totalPages <= 1) return null;
    const pages: (number | '…')[] = [];
    const add = (p: number | '…') => pages[pages.length - 1] !== p && pages.push(p);
    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) add(i);
        else add('…');
    }
    const btn = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-semibold transition-colors';
    return (
        <nav className="flex items-center justify-center gap-1.5" aria-label="Phân trang">
            <button className={cn(btn, 'hover:bg-white disabled:opacity-30')} onClick={() => onChange(page - 1)} disabled={page === 0} aria-label="Trang trước">
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map((p, i) =>
                p === '…' ? (
                    <span key={`e${i}`} className="px-1 text-muted">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        aria-current={p === page ? 'page' : undefined}
                        className={cn(btn, p === page ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30' : 'bg-white text-ink hover:text-brand-600')}
                    >
                        {p + 1}
                    </button>
                )
            )}
            <button
                className={cn(btn, 'hover:bg-white disabled:opacity-30')}
                onClick={() => onChange(page + 1)}
                disabled={page >= totalPages - 1}
                aria-label="Trang sau"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </nav>
    );
}

export function SectionHeading({
    title,
    subtitle,
    href,
    linkLabel = 'Xem tất cả',
    icon,
}: {
    title: string;
    subtitle?: string;
    href?: string;
    linkLabel?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="mb-5 flex items-end justify-between gap-4">
            <div>
                <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight md:text-2xl">
                    {icon}
                    {title}
                </h2>
                {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>
            {href && (
                <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
                    {linkLabel}
                    <ChevronRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquareText, Star } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { ReviewResponse, ReviewSummary } from '@/types/review';
import { Rating } from '@/components/ui/Rating';
import { EmptyState, Pagination } from '@/components/ui/misc';
import { cn, formatDate, resolveAssetUrl } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

const PAGE_SIZE = 6;

/** Bộ lọc giống các sàn TMĐT: tất cả / theo số sao / chỉ đánh giá có bình luận */
type Filter = { rating?: number; withComment?: boolean };

export function ProductReviews({ productId, avgRating, reviewCount }: { productId: string; avgRating: number; reviewCount: number }) {
    const t = useT();
    const listRef = useRef<HTMLDivElement>(null);
    const [summary, setSummary] = useState<ReviewSummary | null>(null);
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [filter, setFilter] = useState<Filter>({});
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reviewService
            .getProductReviewSummary(productId)
            .then((r) => setSummary(r.data))
            .catch(() => setSummary(null));
    }, [productId]);

    useEffect(() => {
        setLoading(true);
        reviewService
            .getProductReviews(productId, page, PAGE_SIZE, filter)
            .then((r) => {
                setReviews(r.data.content);
                setTotalPages(r.data.totalPages);
            })
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, [productId, page, filter]);

    const total = summary?.total ?? reviewCount;
    const average = summary?.average ?? avgRating ?? 0;

    const choose = (f: Filter) => {
        setFilter(f);
        setPage(0);
    };
    const changePage = (p: number) => {
        setPage(p);
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!loading && total === 0 && reviews.length === 0) {
        return <EmptyState icon={<MessageSquareText className="h-9 w-9" />} title={t('reviews.empty')} description={t('reviews.emptyBody')} />;
    }

    const isActive = (f: Filter) => f.rating === filter.rating && !!f.withComment === !!filter.withComment;
    const chips: { f: Filter; label: string }[] = [
        { f: {}, label: `${t('reviews.all')} (${total})` },
        ...[5, 4, 3, 2, 1].map((n) => ({ f: { rating: n }, label: `${t('reviews.stars', { n })} (${summary?.counts[String(n)] ?? 0})` })),
        ...(summary ? [{ f: { withComment: true }, label: t('reviews.withComment', { n: summary.withComment }) }] : []),
    ];

    return (
        <div ref={listRef} className="scroll-mt-40 space-y-6">
            {/* Tổng quan: điểm trung bình + phân bố số sao (bấm vào thanh để lọc) */}
            <div className="grid gap-6 rounded-2xl bg-mint-50 p-5 sm:grid-cols-[180px_1fr] sm:p-6">
                <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-5xl font-extrabold text-ink">
                        {average.toFixed(1)}
                        <span className="ml-1 text-base font-semibold text-muted">{t('reviews.outOf')}</span>
                    </p>
                    <Rating value={average} size={20} className="mt-2" />
                    <p className="mt-1.5 text-sm text-muted">{t('reviews.count', { n: total })}</p>
                </div>
                <ul className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map((n) => {
                        const c = summary?.counts[String(n)] ?? 0;
                        const pct = total ? Math.round((c / total) * 100) : 0;
                        return (
                            <li key={n}>
                                <button
                                    onClick={() => choose(filter.rating === n ? {} : { rating: n })}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg px-2 py-1 text-sm transition hover:bg-surface',
                                        filter.rating === n && 'bg-surface ring-1 ring-brand-200',
                                    )}
                                    aria-label={t('reviews.barLabel', { n, c })}
                                    aria-pressed={filter.rating === n}
                                >
                                    <span className="flex w-8 shrink-0 items-center gap-0.5 font-semibold">
                                        {n} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    </span>
                                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                                        <span className="block h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                                    </span>
                                    <span className="w-8 shrink-0 text-right tabular-nums text-muted">{c}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Chip lọc — vuốt ngang trên điện thoại */}
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                {chips.map(({ f, label }) => (
                    <button
                        key={label}
                        onClick={() => choose(f)}
                        aria-pressed={isActive(f)}
                        className={cn(
                            'h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition',
                            isActive(f) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-surface hover:border-brand-300',
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Danh sách đánh giá chi tiết */}
            {!loading && reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line py-10 text-center">
                    <p className="font-semibold">{t('reviews.noMatch')}</p>
                    <p className="mt-1 text-sm text-muted">{t('reviews.noMatchBody')}</p>
                    <button onClick={() => choose({})} className="mt-3 text-sm font-semibold text-brand-600 hover:underline">
                        {t('reviews.clearFilter')}
                    </button>
                </div>
            ) : (
                <ul className="divide-y divide-line">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                              <li key={i} className="flex gap-3 py-5">
                                  <div className="skeleton h-10 w-10 rounded-full" />
                                  <div className="flex-1 space-y-2">
                                      <div className="skeleton h-4 w-32" />
                                      <div className="skeleton h-3 w-48" />
                                      <div className="skeleton h-4 w-full" />
                                  </div>
                              </li>
                          ))
                        : reviews.map((r) => <ReviewItem key={r.id} r={r} />)}
                </ul>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        </div>
    );
}

function ReviewItem({ r }: { r: ReviewResponse }) {
    const t = useT();
    const [expanded, setExpanded] = useState(false);
    const comment = r.comment?.trim();
    const long = !!comment && (comment.length > 280 || comment.split('\n').length > 4);
    const variant = [r.variantSize && t('reviews.size', { v: r.variantSize }), r.variantColor].filter(Boolean).join(' · ');

    return (
        <li className="flex gap-3 py-5">
            {r.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveAssetUrl(r.avatarUrl) || ''} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
            ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
                    {r.fullName?.charAt(0).toUpperCase() || '?'}
                </span>
            )}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold">{r.fullName}</p>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">{t('reviews.verified')}</span>
                </div>
                <Rating value={r.rating} size={14} className="mt-1" />
                <p className="mt-1 text-xs text-muted">
                    {formatDate(r.createdAt, true)}
                    {variant && <> · {t('reviews.variant', { v: variant })}</>}
                </p>
                {comment ? (
                    <>
                        <p className={cn('mt-2 whitespace-pre-line break-words text-[15px] leading-6 text-ink', long && !expanded && 'line-clamp-4')}>{comment}</p>
                        {long && (
                            <button onClick={() => setExpanded((v) => !v)} className="mt-1 text-sm font-semibold text-brand-600 hover:underline">
                                {expanded ? t('reviews.readLess') : t('reviews.readMore')}
                            </button>
                        )}
                    </>
                ) : (
                    <p className="mt-2 text-sm italic text-muted">{t('reviews.noComment')}</p>
                )}
            </div>
        </li>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { ReviewResponse } from '@/types/review';
import { Rating } from '@/components/ui/Rating';
import { EmptyState, Pagination } from '@/components/ui/misc';
import { formatDate, resolveAssetUrl } from '@/lib/utils';

export function ProductReviews({ productId, avgRating, reviewCount }: { productId: string; avgRating: number; reviewCount: number }) {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        reviewService
            .getProductReviews(productId, page, 5)
            .then((r) => {
                setReviews(r.data.content);
                setTotalPages(r.data.totalPages);
            })
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, [productId, page]);

    if (!loading && reviewCount === 0 && reviews.length === 0) {
        return (
            <EmptyState
                icon={<MessageSquareText className="h-9 w-9" />}
                title="Chưa có đánh giá"
                description="Khách đã mua và nhận hàng có thể đánh giá trong mục Đơn hàng của tôi."
            />
        );
    }

    return (
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
            <div className="flex flex-col items-center rounded-2xl bg-mint-50 p-6 text-center md:self-start">
                <p className="text-5xl font-extrabold text-ink">{(avgRating || 0).toFixed(1)}</p>
                <Rating value={avgRating} size={20} className="mt-2" />
                <p className="mt-2 text-sm text-muted">{reviewCount} đánh giá</p>
            </div>
            <div>
                <ul className="divide-y divide-line">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                              <li key={i} className="space-y-2 py-4">
                                  <div className="skeleton h-4 w-40" />
                                  <div className="skeleton h-4 w-full" />
                              </li>
                          ))
                        : reviews.map((r) => (
                              <li key={r.id} className="flex gap-3 py-5">
                                  {r.avatarUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={resolveAssetUrl(r.avatarUrl) || ''} alt="" className="h-10 w-10 rounded-full object-cover" />
                                  ) : (
                                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
                                          {r.fullName?.charAt(0).toUpperCase()}
                                      </span>
                                  )}
                                  <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                          <p className="text-sm font-semibold">{r.fullName}</p>
                                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">Đã mua hàng</span>
                                      </div>
                                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                                          <Rating value={r.rating} size={12} /> {formatDate(r.createdAt)}
                                      </div>
                                      {r.comment && <p className="mt-2 whitespace-pre-line text-sm leading-6">{r.comment}</p>}
                                  </div>
                              </li>
                          ))}
                </ul>
                <div className="mt-4">
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
            </div>
        </div>
    );
}

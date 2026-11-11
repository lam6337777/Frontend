'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductResponse } from '@/types/product';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { useT } from '@/lib/i18n/client';

/** Dải sản phẩm cuộn ngang, có nút trượt trên desktop và vuốt trên điện thoại */
export function ProductCarousel({ products, loading }: { products: ProductResponse[]; loading?: boolean }) {
    const t = useT();
    const ref = useRef<HTMLDivElement>(null);
    const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

    const item = 'w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23.5%]';
    return (
        <div className="group/carousel relative">
            <div ref={ref} className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 py-2 sm:gap-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className={item}>
                              <ProductCardSkeleton />
                          </div>
                      ))
                    : products.map((p) => (
                          <div key={p.id} className={item}>
                              <ProductCard product={p} />
                          </div>
                      ))}
            </div>
            {!loading && products.length > 4 && (
                <>
                    <button
                        onClick={() => scroll(-1)}
                        className="absolute -left-4 top-1/3 hidden h-11 w-11 place-items-center rounded-full bg-surface shadow-lift transition-opacity hover:text-brand-600 md:grid md:opacity-0 md:group-hover/carousel:opacity-100"
                        aria-label={t('common.scrollLeft')}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => scroll(1)}
                        className="absolute -right-4 top-1/3 hidden h-11 w-11 place-items-center rounded-full bg-surface shadow-lift transition-opacity hover:text-brand-600 md:grid md:opacity-0 md:group-hover/carousel:opacity-100"
                        aria-label={t('common.scrollRight')}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </>
            )}
        </div>
    );
}

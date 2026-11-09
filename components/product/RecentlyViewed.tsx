'use client';

import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { productService } from '@/services/productService';
import { ProductResponse } from '@/types/product';
import { getRecentlyViewed } from '@/lib/recentlyViewed';
import { SectionHeading } from '@/components/ui/misc';
import { ProductCarousel } from './ProductCarousel';

/** Sản phẩm đã xem gần đây (lưu trong trình duyệt). Ẩn nếu chưa xem sản phẩm nào. */
export function RecentlyViewed({ excludeId, className }: { excludeId?: string; className?: string }) {
    const [products, setProducts] = useState<ProductResponse[]>([]);

    useEffect(() => {
        const ids = getRecentlyViewed().filter((id) => id !== excludeId).slice(0, 12);
        if (!ids.length) return;
        productService
            .getByIds(ids)
            .then((r) => setProducts(r.data || []))
            .catch(() => setProducts([]));
    }, [excludeId]);

    if (!products.length) return null;
    return (
        <section className={className}>
            <SectionHeading title="Đã xem gần đây" icon={<History className="h-6 w-6 text-brand-500" />} />
            <ProductCarousel products={products} />
        </section>
    );
}

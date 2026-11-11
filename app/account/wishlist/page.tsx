'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { wishlistService } from '@/services/wishlistService';
import { ProductResponse } from '@/types/product';
import { useAppSelector } from '@/store/redux/hooks';
import { ProductGrid } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/misc';
import { LinkButton } from '@/components/ui/Button';
import { useT } from '@/lib/i18n/client';

export default function WishlistPage() {
    const t = useT();
    const ids = useAppSelector((s) => s.wishlist.ids);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        wishlistService
            .getWishlist()
            .then((r) => setProducts(r.data))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    // Bỏ tim ngay trên trang thì ẩn sản phẩm đó luôn
    const visible = products.filter((p) => ids.includes(p.id));

    return (
        <div>
            <h1 className="mb-4 text-xl font-bold">
                {t('wishlist.title')} {!loading && <span className="text-base font-medium text-muted">({visible.length})</span>}
            </h1>
            {!loading && visible.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon={<Heart className="h-9 w-9" />}
                        title={t('wishlist.empty')}
                        description={t('wishlist.emptyBody')}
                        action={<LinkButton href="/products">{t('wishlist.explore')}</LinkButton>}
                    />
                </div>
            ) : (
                <ProductGrid products={visible} loading={loading} skeletonCount={6} className="lg:grid-cols-3" />
            )}
        </div>
    );
}

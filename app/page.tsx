'use client';

import { useEffect, useState } from 'react';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';
import { productService } from '@/services/productService';
import { promotionService } from '@/services/promotionService';
import { Category, ProductResponse } from '@/types/product';
import { Voucher } from '@/types/promotion';
import { Hero } from '@/components/home/Hero';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { VoucherStrip } from '@/components/home/VoucherStrip';
import { Showcase3D } from '@/components/home/Showcase3D';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { ProductGrid } from '@/components/product/ProductCard';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { SectionHeading } from '@/components/ui/misc';
import { LinkButton } from '@/components/ui/Button';

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [sale, setSale] = useState<ProductResponse[]>([]);
    const [saleCount, setSaleCount] = useState(0);
    const [best, setBest] = useState<ProductResponse[]>([]);
    const [fresh, setFresh] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mỗi khối tải độc lập: một API lỗi không làm trống cả trang
        Promise.allSettled([
            productService.getCategories().then((r) => setCategories(r.data || [])),
            promotionService.getAvailableVouchers().then((r) => setVouchers(r.data || [])),
            productService.getProducts({ onSale: true, sortBy: 'best_selling', size: 12 }).then((r) => {
                setSale(r.data.content);
                setSaleCount(r.data.totalElements);
            }),
            productService.getProducts({ sortBy: 'best_selling', size: 12 }).then((r) => setBest(r.data.content)),
            productService.getProducts({ sortBy: 'newest', size: 8 }).then((r) => setFresh(r.data.content)),
        ]).finally(() => setLoading(false));
    }, []);

    return (
        <div className="pb-4">
            <Hero saleCount={saleCount} />
            <CategoryTiles categories={categories} />
            <VoucherStrip vouchers={vouchers} />

            {(loading || sale.length > 0) && (
                <section className="container-page mt-12">
                    <div className="rounded-3xl bg-gradient-to-br from-coral-50 via-white to-orange-50 p-4 ring-1 ring-coral-100 sm:p-6">
                        <SectionHeading
                            title="Giảm sâu hôm nay"
                            subtitle="Giá tốt nhất cho các mẫu được yêu thích"
                            href="/products?onSale=true"
                            icon={<Flame className="h-6 w-6 text-coral-500" />}
                        />
                        <ProductCarousel products={sale} loading={loading} />
                    </div>
                </section>
            )}

            <section className="container-page mt-12">
                <SectionHeading
                    title="Bán chạy nhất"
                    subtitle="Được khách hàng PF chọn nhiều nhất"
                    href="/products?sortBy=best_selling"
                    icon={<TrendingUp className="h-6 w-6 text-brand-500" />}
                />
                <ProductCarousel products={best} loading={loading} />
            </section>

            <Showcase3D />

            <section className="container-page mt-16">
                <SectionHeading title="Hàng mới về" href="/products?sortBy=newest" icon={<Sparkles className="h-6 w-6 text-brand-500" />} />
                <ProductGrid products={fresh} loading={loading} />
                <div className="mt-8 text-center">
                    <LinkButton href="/products" variant="outline" size="lg">
                        Khám phá tất cả sản phẩm
                    </LinkButton>
                </div>
            </section>

            <RecentlyViewed className="container-page mt-16" />
        </div>
    );
}

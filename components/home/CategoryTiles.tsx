'use client';

import Link from 'next/link';
import { Activity, Dumbbell, Footprints, Shirt, Trophy, Zap, Waves, Sparkles, type LucideIcon } from 'lucide-react';
import { Category } from '@/types/product';
import { useI18n } from '@/lib/i18n/client';

// Gán icon và màu theo tên danh mục (danh mục mới sẽ dùng icon mặc định)
const STYLE: { match: RegExp; icon: LucideIcon; tone: string }[] = [
    { match: /chạy/i, icon: Activity, tone: 'from-brand-100 to-brand-50 text-brand-700' },
    { match: /tập|gym/i, icon: Dumbbell, tone: 'from-sky-100 to-sky-50 text-sky-700 dark:from-sky-500/25 dark:to-sky-500/10 dark:text-sky-300' },
    { match: /bóng rổ/i, icon: Trophy, tone: 'from-orange-100 to-orange-50 text-orange-700 dark:from-orange-500/25 dark:to-orange-500/10 dark:text-orange-300' },
    { match: /bóng đá/i, icon: Zap, tone: 'from-lime-100 to-lime-50 text-lime-700 dark:from-lime-500/25 dark:to-lime-500/10 dark:text-lime-300' },
    { match: /trượt/i, icon: Waves, tone: 'from-violet-100 to-violet-50 text-violet-700 dark:from-violet-500/25 dark:to-violet-500/10 dark:text-violet-300' },
    { match: /thời trang/i, icon: Shirt, tone: 'from-pink-100 to-pink-50 text-pink-700 dark:from-pink-500/25 dark:to-pink-500/10 dark:text-pink-300' },
    { match: /sneaker/i, icon: Sparkles, tone: 'from-amber-100 to-amber-50 text-amber-700 dark:from-amber-500/25 dark:to-amber-500/10 dark:text-amber-300' },
];

const styleFor = (name: string) => STYLE.find((s) => s.match.test(name)) || { icon: Footprints, tone: 'from-teal-100 to-teal-50 text-teal-700 dark:from-teal-500/25 dark:to-teal-500/10 dark:text-teal-300' };

export function CategoryTiles({ categories }: { categories: Category[] }) {
    const { t, cat } = useI18n();
    if (!categories.length) return null;
    return (
        <section className="container-page mt-10">
            <h2 className="mb-4 text-xl font-extrabold tracking-tight md:text-2xl">{t('home.shopByCategory')}</h2>
            <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:grid md:grid-cols-4 lg:grid-cols-8">
                {categories.map((c) => {
                    const s = styleFor(c.name);
                    return (
                        <Link
                            key={c.id}
                            href={`/products?categoryName=${encodeURIComponent(c.name)}`}
                            className="group flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl bg-surface p-3 text-center shadow-card transition hover:-translate-y-1 hover:shadow-lift md:w-auto"
                        >
                            <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${s.tone} transition group-hover:scale-110`}>
                                <s.icon className="h-6 w-6" />
                            </span>
                            <span className="line-clamp-2 text-xs font-semibold leading-4">{cat(c.name)}</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Box, Sparkles, Star, Truck } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { useT } from '@/lib/i18n/client';

export function Hero({ saleCount }: { saleCount: number }) {
    const t = useT();
    return (
        <section className="container-page grid gap-4 pt-4 md:pt-6 lg:grid-cols-[2fr_1fr]">
            {/* Banner chính */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-400 to-emerald-300 p-7 text-white sm:p-10 lg:min-h-[420px]">
                <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />

                <div className="relative z-10 max-w-md">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5" /> {t('home.heroBadge')}
                    </span>
                    <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                        {t('home.heroLine1')}
                        <br />
                        {t('home.heroLine2')}
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-white/90 sm:text-base">
                        {t('home.heroBody')}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link href="/products" className={buttonClass('dark', 'lg')}>
                            {t('home.shopNow')} <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/products?onSale=true" className={buttonClass('outline', 'lg', 'border-white/60 bg-white/10 text-white backdrop-blur hover:bg-white hover:text-brand-700')}>
                            {t('home.huntSale')}
                        </Link>
                    </div>
                    <div className="mt-8 flex items-center gap-5 text-xs font-medium text-white/90">
                        <span className="flex items-center gap-1.5">
                            <Truck className="h-4 w-4" /> {t('home.freeshipFrom')}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-amber-300 text-amber-300" /> {t('home.authentic')}
                        </span>
                    </div>
                </div>

                <div className="pointer-events-none absolute -right-10 bottom-0 hidden w-[58%] max-w-[520px] sm:block lg:-right-6">
                    <div className="absolute inset-x-10 bottom-10 h-10 rounded-[50%] bg-brand-900/30 blur-xl" />
                    <Image
                        src="/images/hero-shoe.png"
                        alt=""
                        width={1024}
                        height={1024}
                        priority
                        className="relative animate-float mix-blend-multiply"
                    />
                </div>
            </div>

            {/* 2 ô khuyến mãi */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Link
                    href="/products?onSale=true"
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-coral-500 to-orange-400 p-6 text-white transition hover:shadow-lift"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{t('home.saleLabel')}</p>
                    <p className="mt-2 text-3xl font-extrabold">{saleCount > 0 ? t('home.saleCount', { n: saleCount }) : t('home.saleHunt')}</p>
                    <p className="mt-1 text-sm text-white/90">{t('home.saleBody')}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                        {t('home.viewNow')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                    <span className="absolute -bottom-6 -right-4 text-[120px] font-black leading-none text-white/15">%</span>
                </Link>
                <Link href="#trai-nghiem-3d" className="group relative overflow-hidden rounded-3xl bg-night p-6 text-white transition hover:shadow-lift">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">{t('home.techLabel')}</p>
                    <p className="mt-2 text-3xl font-extrabold">{t('home.techTitle')}</p>
                    <p className="mt-1 text-sm text-white/75">{t('home.techBody')}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                        {t('home.tryIt')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                    <Box className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10 transition group-hover:rotate-12" strokeWidth={1} />
                </Link>
            </div>
        </section>
    );
}

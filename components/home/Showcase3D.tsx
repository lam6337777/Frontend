'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Hand, Palette, Smartphone } from 'lucide-react';
import { useT } from '@/lib/i18n/client';

const Product3DViewer = dynamic(() => import('@/components/product/Product3DViewer').then((m) => m.Product3DViewer), {
    ssr: false,
    loading: () => <div className="skeleton h-full w-full rounded-none" />,
});

const DEMO_MODEL = '/models/demo-shoe.glb';

/** Khu trải nghiệm 3D trên trang chủ. Chỉ tải mô hình (~8MB) khi khu này cuộn vào màn hình. */
export function Showcase3D() {
    const t = useT();
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    io.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const features = [
        { icon: Hand, title: t('home.rotateTitle'), desc: t('home.rotateDesc') },
        { icon: Palette, title: t('home.colorTitle'), desc: t('home.colorDesc') },
        { icon: Smartphone, title: t('home.arTitle'), desc: t('home.arDesc') },
    ];

    return (
        <section id="trai-nghiem-3d" ref={ref} className="container-page mt-16 scroll-mt-32">
            <div className="grid overflow-hidden rounded-3xl bg-night text-white lg:grid-cols-[1fr_1.3fr]">
                <div className="flex flex-col justify-center p-8 sm:p-12">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300">
                        <Box className="h-3.5 w-3.5" /> {t('home.show3dBadge')}
                    </span>
                    <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                        {t('home.show3dLine1')}
                        <br />
                        <span className="text-brand-300">{t('home.show3dLine2')}</span>
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-white/70">
                        {t('home.show3dBody')}
                    </p>
                    <ul className="mt-8 space-y-5">
                        {features.map((f) => (
                            <li key={f.title} className="flex gap-4">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-brand-300">
                                    <f.icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-bold">{f.title}</p>
                                    <p className="text-sm text-white/65">{f.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative aspect-square bg-surface lg:aspect-auto lg:min-h-[520px]">
                    {visible ? <Product3DViewer src={DEMO_MODEL} alt={t('home.demoModelAlt')} /> : <div className="skeleton h-full w-full rounded-none" />}
                    <p className="pointer-events-none absolute bottom-14 left-3 text-[10px] text-muted">{t('home.demoModelCredit')}</p>
                </div>
            </div>
        </section>
    );
}

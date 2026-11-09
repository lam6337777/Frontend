'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Hand, Palette, Smartphone } from 'lucide-react';

const Product3DViewer = dynamic(() => import('@/components/product/Product3DViewer').then((m) => m.Product3DViewer), {
    ssr: false,
    loading: () => <div className="skeleton h-full w-full rounded-none" />,
});

const DEMO_MODEL = '/models/demo-shoe.glb';

/** Khu trải nghiệm 3D trên trang chủ. Chỉ tải mô hình (~8MB) khi khu này cuộn vào màn hình. */
export function Showcase3D() {
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
        { icon: Hand, title: 'Xoay 360°', desc: 'Kéo để xem mọi góc, cuộn hoặc chụm 2 ngón để phóng to.' },
        { icon: Palette, title: 'Đổi phối màu', desc: 'Thử từng phối màu ngay trên mô hình trước khi chọn.' },
        { icon: Smartphone, title: 'Xem AR', desc: 'Đặt đôi giày lên sàn nhà bạn qua camera điện thoại.' },
    ];

    return (
        <section id="trai-nghiem-3d" ref={ref} className="container-page mt-16 scroll-mt-32">
            <div className="grid overflow-hidden rounded-3xl bg-ink text-white lg:grid-cols-[1fr_1.3fr]">
                <div className="flex flex-col justify-center p-8 sm:p-12">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300">
                        <Box className="h-3.5 w-3.5" /> Trải nghiệm 3D
                    </span>
                    <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                        Cầm đôi giày
                        <br />
                        <span className="text-brand-300">ngay trên màn hình.</span>
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-white/70">
                        Sản phẩm có biểu tượng <b className="text-white">3D</b> cho phép bạn xem mô hình chân thực thay vì chỉ vài tấm ảnh.
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
                <div className="relative aspect-square bg-white lg:aspect-auto lg:min-h-[520px]">
                    {visible ? <Product3DViewer src={DEMO_MODEL} alt="Mô hình giày 3D minh họa" /> : <div className="skeleton h-full w-full rounded-none" />}
                    <p className="pointer-events-none absolute bottom-14 left-3 text-[10px] text-muted">Mô hình minh họa © Shopify, CC BY 4.0</p>
                </div>
            </div>
        </section>
    );
}

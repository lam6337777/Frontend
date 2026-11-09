'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, ChevronLeft, ChevronRight, Expand, ImageIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { cn, PLACEHOLDER_IMAGE } from '@/lib/utils';

const Product3DViewer = dynamic(() => import('./Product3DViewer').then((m) => m.Product3DViewer), {
    ssr: false,
    loading: () => <div className="skeleton h-full w-full rounded-none" />,
});

interface Props {
    images: string[];
    name: string;
    model3dUrl?: string | null;
}

/**
 * Gallery trang chi tiết:
 * - Chế độ Ảnh: ảnh lớn có phóng to theo vị trí chuột, thumbnail, vuốt trên điện thoại, xem toàn màn hình.
 * - Chế độ 3D: chỉ hiện khi sản phẩm có file mô hình .glb.
 */
export function ProductGallery({ images, name, model3dUrl }: Props) {
    const [mode, setMode] = useState<'image' | '3d'>(model3dUrl ? '3d' : 'image');
    const [index, setIndex] = useState(0);
    const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
    const [lightbox, setLightbox] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIndex(0);
        setMode(model3dUrl ? '3d' : 'image');
    }, [images, model3dUrl]);

    // Đồng bộ ảnh đang xem khi vuốt trên điện thoại
    const onScroll = () => {
        const el = trackRef.current;
        if (!el) return;
        const i = Math.round(el.scrollLeft / el.clientWidth);
        if (i !== index) setIndex(i);
    };

    const go = (i: number) => {
        const next = (i + images.length) % images.length;
        setIndex(next);
        trackRef.current?.scrollTo({ left: next * trackRef.current.clientWidth, behavior: 'smooth' });
    };

    const onZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    };

    const tab = (active: boolean) =>
        cn(
            'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition',
            active ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'
        );

    return (
        <div className="flex min-w-0 flex-col-reverse gap-3 md:flex-row">
            {/* Thumbnails */}
            {mode === 'image' && images.length > 1 && (
                <div className="scrollbar-none flex gap-2 overflow-x-auto md:max-h-[560px] md:w-20 md:flex-col md:overflow-y-auto">
                    {images.map((src, i) => (
                        <button
                            key={src + i}
                            onClick={() => go(i)}
                            className={cn(
                                'h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white ring-2 transition md:h-20 md:w-20',
                                i === index ? 'ring-brand-500' : 'ring-transparent opacity-70 hover:opacity-100'
                            )}
                            aria-label={`Xem ảnh ${i + 1}`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </button>
                    ))}
                </div>
            )}

            <div className="relative min-w-0 flex-1">
                <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-card">
                    {mode === '3d' && model3dUrl ? (
                        <Product3DViewer src={model3dUrl} poster={images[0]} alt={`Mô hình 3D ${name}`} />
                    ) : (
                        <>
                            <div ref={trackRef} onScroll={onScroll} className="scrollbar-none flex h-full snap-x snap-mandatory overflow-x-auto md:overflow-hidden">
                                {images.map((src, i) => (
                                    <div
                                        key={src + i}
                                        className="relative h-full w-full shrink-0 snap-center md:cursor-zoom-in"
                                        onMouseMove={i === index ? onZoomMove : undefined}
                                        onMouseLeave={() => setZoom(null)}
                                        onClick={() => setLightbox(true)}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={src}
                                            alt={`${name} - ảnh ${i + 1}`}
                                            loading={i === 0 ? 'eager' : 'lazy'}
                                            onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE)}
                                            className="h-full w-full object-cover transition-transform duration-200 ease-out"
                                            style={
                                                zoom && i === index
                                                    ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                                                    : undefined
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => go(index - 1)}
                                        className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card hover:text-brand-600 md:grid"
                                        aria-label="Ảnh trước"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => go(index + 1)}
                                        className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card hover:text-brand-600 md:grid"
                                        aria-label="Ảnh sau"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                    <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white md:hidden">
                                        {index + 1}/{images.length}
                                    </span>
                                </>
                            )}
                            <button
                                onClick={() => setLightbox(true)}
                                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-card hover:text-brand-600"
                                aria-label="Xem ảnh toàn màn hình"
                            >
                                <Expand className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* Chuyển Ảnh / 3D */}
                {model3dUrl && (
                    <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-white/90 p-1 shadow-card backdrop-blur">
                        <button className={tab(mode === 'image')} onClick={() => setMode('image')}>
                            <ImageIcon className="h-4 w-4" /> Ảnh
                        </button>
                        <button className={tab(mode === '3d')} onClick={() => setMode('3d')}>
                            <Box className="h-4 w-4" /> Xem 3D
                        </button>
                    </div>
                )}
            </div>

            <Modal open={lightbox} onClose={() => setLightbox(false)} size="xl" title={name}>
                <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={images[index]} alt={name} className="mx-auto max-h-[70vh] rounded-2xl object-contain" />
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => setIndex((index - 1 + images.length) % images.length)}
                                className="absolute left-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lift"
                                aria-label="Ảnh trước"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setIndex((index + 1) % images.length)}
                                className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lift"
                                aria-label="Ảnh sau"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>
                <p className="mt-3 text-center text-sm text-muted">
                    {index + 1} / {images.length}
                </p>
            </Modal>
        </div>
    );
}

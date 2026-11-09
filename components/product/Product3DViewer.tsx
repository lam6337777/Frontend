'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Pause, Play, RotateCcw, Smartphone, Hand } from 'lucide-react';
import type { ModelViewerElement } from '@/types/model-viewer';
import { cn } from '@/lib/utils';

const VARIANT_LABEL: Record<string, string> = {
    beach: 'Biển xanh',
    midnight: 'Nửa đêm',
    street: 'Đường phố',
};

interface Props {
    src: string;
    poster?: string;
    alt: string;
}

/**
 * Xem sản phẩm 3D bằng <model-viewer>: kéo để xoay 360°, cuộn/chụm để phóng to,
 * tự xoay, đổi phối màu (nếu file .glb có KHR_materials_variants), toàn màn hình và AR trên điện thoại.
 */
export function Product3DViewer({ src, poster, alt }: Props) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const mvRef = useRef<ModelViewerElement | null>(null);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const [rotating, setRotating] = useState(true);
    const [variants, setVariants] = useState<string[]>([]);
    const [variant, setVariant] = useState<string | null>(null);
    const [canAR, setCanAR] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [hint, setHint] = useState(true);

    // model-viewer dùng API trình duyệt nên chỉ nạp ở phía client
    useEffect(() => {
        let alive = true;
        import('@google/model-viewer')
            .then(() => alive && setReady(true))
            .catch(() => alive && setFailed(true));
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        const mv = mvRef.current;
        if (!ready || !mv) return;
        const onProgress = (e: Event) => setProgress((e as CustomEvent<{ totalProgress: number }>).detail.totalProgress);
        const onLoad = () => {
            setLoaded(true);
            setVariants(mv.availableVariants || []);
            setVariant(mv.variantName);
            setCanAR(mv.canActivateAR);
        };
        const onError = () => setFailed(true);
        const onInteract = () => setHint(false);
        mv.addEventListener('progress', onProgress);
        mv.addEventListener('load', onLoad);
        mv.addEventListener('error', onError);
        mv.addEventListener('camera-change', onInteract, { once: true });
        return () => {
            mv.removeEventListener('progress', onProgress);
            mv.removeEventListener('load', onLoad);
            mv.removeEventListener('error', onError);
        };
    }, [ready, src]);

    useEffect(() => {
        const onFs = () => setFullscreen(document.fullscreenElement === wrapRef.current);
        document.addEventListener('fullscreenchange', onFs);
        return () => document.removeEventListener('fullscreenchange', onFs);
    }, []);

    const toggleRotate = () => {
        const mv = mvRef.current;
        if (!mv) return;
        mv.autoRotate = !rotating;
        setRotating(!rotating);
    };

    const resetView = () => {
        const mv = mvRef.current;
        if (!mv) return;
        mv.cameraOrbit = '30deg 75deg auto';
        mv.fieldOfView = 'auto';
        mv.resetTurntableRotation(0);
        mv.jumpCameraToGoal();
    };

    const pickVariant = (name: string) => {
        if (mvRef.current) mvRef.current.variantName = name;
        setVariant(name);
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else wrapRef.current?.requestFullscreen?.();
    };

    const ctrl = 'grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition hover:bg-white hover:text-brand-600';

    if (failed) {
        return (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-muted">
                Không tải được mô hình 3D. Vui lòng xem ảnh sản phẩm.
            </div>
        );
    }

    return (
        <div ref={wrapRef} className={cn('relative h-full w-full overflow-hidden', fullscreen ? 'bg-white' : 'bg-gradient-to-b from-brand-50 via-white to-mint-100')}>
            {ready && (
                <model-viewer
                    ref={(el: HTMLElement | null) => {
                        mvRef.current = el as ModelViewerElement | null;
                    }}
                    src={src}
                    poster={poster}
                    alt={alt}
                    camera-controls
                    auto-rotate
                    auto-rotate-delay={0}
                    rotation-per-second="20deg"
                    interaction-prompt="none"
                    shadow-intensity="1"
                    shadow-softness="0.8"
                    exposure="1.05"
                    environment-image="neutral"
                    camera-orbit="30deg 75deg auto"
                    min-camera-orbit="auto 10deg auto"
                    max-camera-orbit="auto 100deg auto"
                    touch-action="pan-y"
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    style={{ width: '100%', height: '100%', ['--poster-color' as string]: 'transparent' }}
                >
                    <span slot="ar-button" hidden />
                    <div slot="progress-bar" />
                </model-viewer>
            )}

            {/* Thanh tiến trình tải */}
            {!loaded && (
                <div className="pointer-events-none absolute inset-x-8 bottom-8">
                    <p className="mb-2 text-center text-xs font-medium text-muted">Đang tải mô hình 3D… {Math.round(progress * 100)}%</p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
                        <div className="h-full rounded-full bg-brand-500 transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
                    </div>
                </div>
            )}

            {loaded && hint && (
                <div className="pointer-events-none absolute left-1/2 top-4 flex -translate-x-1/2 animate-fade-up items-center gap-2 rounded-full bg-ink/75 px-4 py-2 text-xs font-medium text-white backdrop-blur">
                    <Hand className="h-4 w-4" /> Kéo để xoay 360° · Cuộn để phóng to
                </div>
            )}

            {/* Điều khiển */}
            <div className="absolute right-3 top-3 flex flex-col gap-2">
                <button className={ctrl} onClick={toggleRotate} aria-label={rotating ? 'Dừng tự xoay' : 'Tự xoay'} title={rotating ? 'Dừng tự xoay' : 'Tự xoay'}>
                    {rotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button className={ctrl} onClick={resetView} aria-label="Đặt lại góc nhìn" title="Đặt lại góc nhìn">
                    <RotateCcw className="h-4 w-4" />
                </button>
                <button className={ctrl} onClick={toggleFullscreen} aria-label="Toàn màn hình" title="Toàn màn hình">
                    {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
            </div>

            {/* Phối màu trên mô hình */}
            {variants.length > 1 && (
                <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-center gap-2">
                    {variants.map((v) => (
                        <button
                            key={v}
                            onClick={() => pickVariant(v)}
                            className={cn(
                                'rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-card backdrop-blur transition',
                                variant === v ? 'bg-brand-500 text-white' : 'bg-white/90 text-ink hover:text-brand-600'
                            )}
                        >
                            {VARIANT_LABEL[v] || v}
                        </button>
                    ))}
                </div>
            )}

            {canAR && (
                <button
                    onClick={() => mvRef.current?.activateAR()}
                    className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white shadow-lift"
                >
                    <Smartphone className="h-4 w-4" /> Xem AR
                </button>
            )}
        </div>
    );
}

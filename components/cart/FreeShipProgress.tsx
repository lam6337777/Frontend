'use client';

import { Truck } from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

export function FreeShipProgress({ subtotal, threshold }: { subtotal: number; threshold: number }) {
    const t = useT();
    if (!threshold) return null;
    const pct = Math.min(100, (subtotal / threshold) * 100);
    const left = threshold - subtotal;
    return (
        <div className="rounded-2xl bg-brand-50 p-4">
            <p className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-brand-600" />
                {left > 0 ? (
                    <span>{t('cart.freeShipLeft', { v: formatVND(left) })}</span>
                ) : (
                    <span className="font-semibold text-brand-700">{t('cart.freeShipDone')}</span>
                )}
            </p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

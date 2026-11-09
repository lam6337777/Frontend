import { Truck } from 'lucide-react';
import { formatVND } from '@/lib/utils';

export function FreeShipProgress({ subtotal, threshold }: { subtotal: number; threshold: number }) {
    if (!threshold) return null;
    const pct = Math.min(100, (subtotal / threshold) * 100);
    const left = threshold - subtotal;
    return (
        <div className="rounded-2xl bg-brand-50 p-4">
            <p className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-brand-600" />
                {left > 0 ? (
                    <span>
                        Mua thêm <b className="text-brand-700">{formatVND(left)}</b> để được <b>miễn phí vận chuyển</b>
                    </span>
                ) : (
                    <span className="font-semibold text-brand-700">Đơn hàng của bạn được miễn phí vận chuyển</span>
                )}
            </p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

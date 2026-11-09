import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Hiển thị số sao (hỗ trợ nửa sao bằng cách cắt chiều rộng lớp sao màu) */
export function Rating({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
    const pct = Math.max(0, Math.min(5, value || 0)) / 5 * 100;
    return (
        <span className={cn('relative inline-flex', className)} aria-label={`${(value || 0).toFixed(1)} trên 5 sao`}>
            <span className="flex text-line">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} width={size} height={size} fill="currentColor" strokeWidth={0} />
                ))}
            </span>
            <span className="absolute inset-0 flex overflow-hidden text-amber-400" style={{ width: `${pct}%` }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} width={size} height={size} className="shrink-0" fill="currentColor" strokeWidth={0} />
                ))}
            </span>
        </span>
    );
}

/** Chọn số sao (dùng trong form đánh giá) */
export function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex gap-1" role="radiogroup" aria-label="Chọn số sao">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    aria-label={`${n} sao`}
                    onClick={() => onChange(n)}
                    className="transition-transform hover:scale-110"
                >
                    <Star className={cn('h-8 w-8', n <= value ? 'text-amber-400' : 'text-line')} fill="currentColor" strokeWidth={0} />
                </button>
            ))}
        </div>
    );
}

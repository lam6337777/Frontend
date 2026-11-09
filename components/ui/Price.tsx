import { cn, discountPercent, effectivePrice, formatVND } from '@/lib/utils';

interface PriceProps {
    originalPrice: number;
    salePrice: number | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const MAIN = { sm: 'text-base', md: 'text-lg', lg: 'text-3xl' };

export function Price({ originalPrice, salePrice, size = 'md', className }: PriceProps) {
    const pct = discountPercent({ originalPrice, salePrice });
    const price = effectivePrice({ originalPrice, salePrice });
    return (
        <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
            <span className={cn('font-bold tracking-tight', MAIN[size], pct ? 'text-coral-500' : 'text-ink')}>{formatVND(price)}</span>
            {pct > 0 && (
                <>
                    <span className={cn('text-muted line-through', size === 'lg' ? 'text-base' : 'text-xs')}>
                        {formatVND(originalPrice)}
                    </span>
                    {size === 'lg' && (
                        <span className="rounded-md bg-coral-50 px-1.5 py-0.5 text-sm font-bold text-coral-600">-{pct}%</span>
                    )}
                </>
            )}
        </div>
    );
}

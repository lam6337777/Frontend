'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { toggleWishlist } from '@/store/redux/wishlistSlice';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

export function WishlistButton({ productId, className, withLabel }: { productId: string; className?: string; withLabel?: boolean }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const toast = useToast();
    const t = useT();
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
    const liked = useAppSelector((s) => s.wishlist.ids.includes(productId));

    const onClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast(t('product.loginToSave'), 'info');
            router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        const res = await dispatch(toggleWishlist(productId));
        if (toggleWishlist.rejected.match(res)) toast(t('product.wishlistError'), 'error');
        else toast(liked ? t('product.removedFromWishlist') : t('product.addedToWishlist'));
    };

    return (
        <button
            onClick={onClick}
            aria-pressed={liked}
            aria-label={liked ? t('product.removeWishlist') : t('product.addWishlist')}
            className={cn(
                'inline-flex items-center justify-center gap-2 transition-all',
                withLabel
                    ? 'h-11 rounded-xl border border-line bg-surface px-4 text-sm font-semibold hover:border-coral-400'
                    : 'h-10 w-10 rounded-full bg-surface/90 shadow-sm backdrop-blur hover:scale-110 dark:bg-white/90 dark:text-night',
                className
            )}
        >
            <Heart className={cn('h-[18px] w-[18px] transition-colors', liked ? 'fill-coral-500 text-coral-500' : withLabel ? 'text-ink' : 'text-ink dark:text-night')} />
            {withLabel && (liked ? t('product.liked') : t('product.like'))}
        </button>
    );
}

'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { toggleWishlist } from '@/store/redux/wishlistSlice';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export function WishlistButton({ productId, className, withLabel }: { productId: string; className?: string; withLabel?: boolean }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const toast = useToast();
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
    const liked = useAppSelector((s) => s.wishlist.ids.includes(productId));

    const onClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast('Đăng nhập để lưu sản phẩm yêu thích', 'info');
            router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        const res = await dispatch(toggleWishlist(productId));
        if (toggleWishlist.rejected.match(res)) toast('Không cập nhật được danh sách yêu thích', 'error');
        else toast(liked ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích');
    };

    return (
        <button
            onClick={onClick}
            aria-pressed={liked}
            aria-label={liked ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            className={cn(
                'inline-flex items-center justify-center gap-2 transition-all',
                withLabel
                    ? 'h-11 rounded-xl border border-line bg-white px-4 text-sm font-semibold hover:border-coral-400'
                    : 'h-9 w-9 rounded-full bg-white/90 shadow-sm backdrop-blur hover:scale-110',
                className
            )}
        >
            <Heart className={cn('h-[18px] w-[18px] transition-colors', liked ? 'fill-coral-500 text-coral-500' : 'text-ink')} />
            {withLabel && (liked ? 'Đã yêu thích' : 'Yêu thích')}
        </button>
    );
}

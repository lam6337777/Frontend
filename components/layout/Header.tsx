'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    ChevronDown,
    Heart,
    LogOut,
    Menu,
    Package,
    Search,
    ShoppingBag,
    Sparkles,
    Truck,
    User,
    X,
    MapPin,
    RotateCcw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { logout } from '@/store/redux/authSlice';
import { resetCart, selectCartCount } from '@/store/redux/cartSlice';
import { clearWishlist } from '@/store/redux/wishlistSlice';
import { productService } from '@/services/productService';
import { Category } from '@/types/product';
import { SearchBox } from './SearchBox';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <Link href="/" className={cn('flex items-center gap-2 font-extrabold tracking-tight', className)} aria-label="PF. Shoes - Trang chủ">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm shadow-brand-500/40">
                PF
            </span>
            <span className="text-xl">
                Shoes<span className="text-coral-500">.</span>
            </span>
        </Link>
    );
}

function CountBadge({ n }: { n: number }) {
    if (!n) return null;
    return (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {n > 99 ? '99+' : n}
        </span>
    );
}

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((s) => s.auth);
    const cartCount = useAppSelector(selectCartCount);
    const wishCount = useAppSelector((s) => s.wishlist.ids.length);

    const [categories, setCategories] = useState<Category[]>([]);
    const [scrolled, setScrolled] = useState(false);
    const [drawer, setDrawer] = useState(false);
    const [mobileSearch, setMobileSearch] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        productService
            .getCategories()
            .then((r) => setCategories(r.data || []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setDrawer(false);
        setAccountOpen(false);
        setMobileSearch(false);
    }, [pathname]);

    // Khóa cuộn nền khi menu điện thoại đang mở
    useEffect(() => {
        if (!drawer) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [drawer]);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const doLogout = () => {
        dispatch(logout());
        dispatch(resetCart());
        dispatch(clearWishlist());
        router.push('/');
    };

    const iconBtn = 'relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-brand-50 hover:text-brand-600';

    return (
        <header className={cn('sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow', scrolled && 'shadow-card')}>
            {/* Dải thông báo */}
            <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 text-white">
                <div className="container-page flex h-9 items-center justify-center gap-6 text-xs font-medium sm:justify-between">
                    <p className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" /> Miễn phí vận chuyển cho đơn từ 1.000.000₫
                    </p>
                    <div className="hidden items-center gap-5 sm:flex">
                        <span className="flex items-center gap-1.5">
                            <RotateCcw className="h-3.5 w-3.5" /> Đổi trả trong 7 ngày
                        </span>
                        <Link href="/account/orders" className="hover:underline">
                            Theo dõi đơn hàng
                        </Link>
                        <Link href="/policy" className="hover:underline">
                            Hỗ trợ
                        </Link>
                    </div>
                </div>
            </div>

            {/* Hàng chính */}
            <div className="container-page flex h-16 items-center gap-3 md:gap-6">
                <button className={cn(iconBtn, 'lg:hidden')} onClick={() => setDrawer(true)} aria-label="Mở menu">
                    <Menu className="h-5 w-5" />
                </button>
                <Logo />
                <div className="hidden max-w-xl flex-1 md:block">
                    <SearchBox />
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <button className={cn(iconBtn, 'md:hidden')} onClick={() => setMobileSearch((v) => !v)} aria-label="Tìm kiếm">
                        <Search className="h-5 w-5" />
                    </button>

                    <div ref={accountRef} className="relative">
                        {isAuthenticated ? (
                            <button
                                onClick={() => setAccountOpen((v) => !v)}
                                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-brand-50"
                                aria-expanded={accountOpen}
                                aria-haspopup="menu"
                            >
                                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                </span>
                                <span className="hidden max-w-28 truncate text-sm font-semibold lg:block">{user?.fullName}</span>
                                <ChevronDown className="hidden h-4 w-4 text-muted lg:block" />
                            </button>
                        ) : (
                            <Link href="/auth/login" className={cn(iconBtn, 'lg:flex lg:w-auto lg:gap-2 lg:rounded-full lg:px-3')}>
                                <User className="h-5 w-5" />
                                <span className="hidden text-sm font-semibold lg:block">Đăng nhập</span>
                            </Link>
                        )}
                        {accountOpen && (
                            <div role="menu" className="absolute right-0 top-full mt-2 w-60 animate-fade-up overflow-hidden rounded-2xl bg-white py-2 shadow-lift ring-1 ring-line">
                                <div className="border-b border-line px-4 pb-2">
                                    <p className="truncate text-sm font-bold">{user?.fullName}</p>
                                    <p className="truncate text-xs text-muted">{user?.email}</p>
                                </div>
                                {[
                                    { href: '/account', icon: User, label: 'Tài khoản của tôi' },
                                    { href: '/account/orders', icon: Package, label: 'Đơn hàng' },
                                    { href: '/account/wishlist', icon: Heart, label: 'Yêu thích' },
                                    { href: '/account/addresses', icon: MapPin, label: 'Sổ địa chỉ' },
                                ].map((it) => (
                                    <Link key={it.href} href={it.href} role="menuitem" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-mint-50 hover:text-brand-700">
                                        <it.icon className="h-4 w-4" /> {it.label}
                                    </Link>
                                ))}
                                <button onClick={doLogout} role="menuitem" className="flex w-full items-center gap-3 border-t border-line px-4 py-2 pt-2.5 text-sm text-coral-600 hover:bg-coral-50">
                                    <LogOut className="h-4 w-4" /> Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>

                    <Link href="/account/wishlist" className={cn(iconBtn, 'hidden sm:grid')} aria-label={`Yêu thích (${wishCount})`}>
                        <Heart className="h-5 w-5" />
                        <CountBadge n={wishCount} />
                    </Link>
                    <Link href="/cart" className={iconBtn} aria-label={`Giỏ hàng (${cartCount})`}>
                        <ShoppingBag className="h-5 w-5" />
                        <CountBadge n={cartCount} />
                    </Link>
                </div>
            </div>

            {mobileSearch && (
                <div className="container-page pb-3 md:hidden">
                    <SearchBox autoFocus onDone={() => setMobileSearch(false)} />
                </div>
            )}

            {/* Menu danh mục */}
            <nav className="hidden border-t border-line lg:block" aria-label="Danh mục">
                <div className="container-page scrollbar-none flex h-11 items-center gap-1 overflow-x-auto text-sm font-medium">
                    <Link href="/products" className="rounded-full px-3 py-1.5 hover:bg-brand-50 hover:text-brand-700">
                        Tất cả sản phẩm
                    </Link>
                    <Link href="/products?onSale=true" className="flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold text-coral-500 hover:bg-coral-50">
                        <Sparkles className="h-4 w-4" /> Khuyến mãi
                    </Link>
                    {categories.map((c) => (
                        <Link
                            key={c.id}
                            href={`/products?categoryName=${encodeURIComponent(c.name)}`}
                            className="whitespace-nowrap rounded-full px-3 py-1.5 hover:bg-brand-50 hover:text-brand-700"
                        >
                            {c.name}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Drawer menu trên điện thoại — render ra <body> bằng portal: header có backdrop-blur nên
                phần tử fixed bên trong sẽ bị giới hạn trong khung header (Safari/Chrome) */}
            {drawer && createPortal(
                <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
                    <div className="absolute inset-0 animate-[fade-up_0.2s_ease-out] bg-ink/40" onClick={() => setDrawer(false)} />
                    <aside className="absolute inset-y-0 left-0 flex h-[100dvh] w-80 max-w-[85%] flex-col bg-white pb-[env(safe-area-inset-bottom)] shadow-lift">
                        <div className="flex h-16 items-center justify-between border-b border-line px-4">
                            <Logo />
                            <button className={iconBtn} onClick={() => setDrawer(false)} aria-label="Đóng menu">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">
                            <Link href="/products?onSale=true" className="mb-2 flex items-center gap-2 rounded-xl bg-coral-50 px-4 py-3 font-semibold text-coral-600">
                                <Sparkles className="h-4 w-4" /> Khuyến mãi hot
                            </Link>
                            <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted">Danh mục</p>
                            <Link href="/products" className="block rounded-xl px-4 py-2.5 hover:bg-mint-50">
                                Tất cả sản phẩm
                            </Link>
                            {categories.map((c) => (
                                <Link key={c.id} href={`/products?categoryName=${encodeURIComponent(c.name)}`} className="block rounded-xl px-4 py-2.5 hover:bg-mint-50">
                                    {c.name}
                                </Link>
                            ))}
                            <p className="px-4 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted">Tài khoản</p>
                            {isAuthenticated ? (
                                <>
                                    <Link href="/account/orders" className="block rounded-xl px-4 py-2.5 hover:bg-mint-50">
                                        Đơn hàng của tôi
                                    </Link>
                                    <Link href="/account/wishlist" className="block rounded-xl px-4 py-2.5 hover:bg-mint-50">
                                        Yêu thích ({wishCount})
                                    </Link>
                                    <button onClick={doLogout} className="block w-full rounded-xl px-4 py-2.5 text-left text-coral-600 hover:bg-coral-50">
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <Link href="/auth/login" className="block rounded-xl px-4 py-2.5 hover:bg-mint-50">
                                    Đăng nhập / Đăng ký
                                </Link>
                            )}
                        </div>
                    </aside>
                </div>,
                document.body
            )}
        </header>
    );
}

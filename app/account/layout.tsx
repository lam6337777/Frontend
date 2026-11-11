'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, MapPin, Package, RotateCcw, User } from 'lucide-react';
import { useAppSelector } from '@/store/redux/hooks';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

const NAV = [
    { href: '/account', label: 'account.navProfile', icon: User, exact: true },
    { href: '/account/orders', label: 'account.navOrders', icon: Package },
    { href: '/account/returns', label: 'account.navReturns', icon: RotateCcw },
    { href: '/account/wishlist', label: 'account.navWishlist', icon: Heart },
    { href: '/account/addresses', label: 'account.navAddresses', icon: MapPin },
] as const;

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const t = useT();
    const ready = useRequireAuth();
    const pathname = usePathname();
    const user = useAppSelector((s) => s.auth.user);

    const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

    return (
        <div className="container-page py-6">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="min-w-0">
                    <div className="card overflow-hidden lg:sticky lg:top-36">
                        <div className="flex items-center gap-3 bg-gradient-to-br from-brand-500 to-brand-600 p-5 text-white">
                            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-lg font-bold">
                                {user?.fullName?.charAt(0).toUpperCase() || '·'}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate font-bold">{user?.fullName || t('account.account')}</p>
                                <p className="truncate text-xs text-white/80">{user?.email}</p>
                            </div>
                        </div>
                        <nav className="scrollbar-none flex gap-1 overflow-x-auto p-2 lg:flex-col" aria-label={t('account.account')}>
                            {NAV.map((n) => (
                                <Link
                                    key={n.href}
                                    href={n.href}
                                    className={cn(
                                        'flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition',
                                        isActive(n.href, 'exact' in n && n.exact) ? 'bg-brand-50 text-brand-700' : 'text-ink hover:bg-mint-50'
                                    )}
                                >
                                    <n.icon className="h-4 w-4" /> {t(n.label)}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>
                <div className="min-w-0">{ready ? children : <div className="skeleton h-96 rounded-3xl" />}</div>
            </div>
        </div>
    );
}

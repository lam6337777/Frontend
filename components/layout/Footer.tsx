import Link from 'next/link';
import { MapPin, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { Logo } from './Header';
import { getT } from '@/lib/i18n/server';

export async function Footer() {
    const { t } = await getT();

    const perks = [
        { icon: Truck, title: t('footer.perks.shipTitle'), desc: t('footer.perks.shipDesc') },
        { icon: RotateCcw, title: t('footer.perks.returnTitle'), desc: t('footer.perks.returnDesc') },
        { icon: ShieldCheck, title: t('footer.perks.authenticTitle'), desc: t('footer.perks.authenticDesc') },
        { icon: Headphones, title: t('footer.perks.supportTitle'), desc: t('footer.perks.supportDesc') },
    ];

    const columns = [
        {
            title: t('footer.shop'),
            links: [
                { href: '/products', label: t('footer.allProducts') },
                { href: '/products?onSale=true', label: t('footer.sale') },
                { href: '/products?sortBy=best_selling', label: t('footer.bestSellers') },
                { href: '/products?sortBy=newest', label: t('footer.newArrivals') },
            ],
        },
        {
            title: t('footer.customerCare'),
            links: [
                { href: '/account/orders', label: t('footer.trackOrder') },
                { href: '/policy#shipping', label: t('footer.shippingPolicy') },
                { href: '/policy#returns', label: t('footer.returnsPolicy') },
                { href: '/policy#warranty', label: t('footer.warranty') },
            ],
        },
        {
            title: t('footer.about'),
            links: [
                { href: '/about', label: t('footer.story') },
                { href: '/policy#privacy', label: t('footer.privacy') },
            ],
        },
    ];

    return (
        <footer className="mt-20 bg-surface pb-[env(safe-area-inset-bottom)]">
            <div className="border-y border-line bg-mint-50">
                <div className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
                    {perks.map((p) => (
                        <div key={p.title} className="flex items-start gap-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface text-brand-600 shadow-card">
                                <p.icon className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-sm font-bold">{p.title}</p>
                                <p className="text-xs text-muted">{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <div>
                    <Logo />
                    <p className="mt-4 max-w-xs text-sm leading-6 text-muted">{t('footer.tagline')}</p>
                    {/* Thêm số điện thoại / email thật của cửa hàng tại đây */}
                    <p className="mt-5 flex items-center gap-2 text-sm text-muted">
                        <MapPin className="h-4 w-4 text-brand-500" /> {t('footer.location')}
                    </p>
                </div>
                {columns.map((col) => (
                    <div key={col.title}>
                        <h3 className="text-sm font-bold">{col.title}</h3>
                        <ul className="mt-3 space-y-1">
                            {col.links.map((l) => (
                                <li key={l.href}>
                                    {/* py-1.5: vùng chạm đủ lớn trên điện thoại */}
                                    <Link href={l.href} className="inline-block py-1.5 text-sm text-muted transition hover:text-brand-600">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="border-t border-line">
                <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted md:flex-row md:items-center md:justify-between">
                    <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
                    <p>
                        {t('footer.modelCredit')}{' '}
                        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline hover:text-brand-600">
                            CC BY 4.0
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

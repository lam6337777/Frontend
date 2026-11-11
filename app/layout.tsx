import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/store/redux/Provider';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthBootstrap } from '@/components/layout/AuthBootstrap';
import { ServerWakeNotice } from '@/components/layout/ServerWakeNotice';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ChatWidget from '@/components/shared/ChatWidget/ChatWidget';
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n/client';
import { getLocale } from '@/lib/i18n/server';

const beVietnam = Be_Vietnam_Pro({
    variable: '--font-be-vietnam',
    subsets: ['latin', 'vietnamese'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
    const en = (await getLocale()) === 'en';
    return {
        title: {
            default: en ? 'PF. Shoes — Authentic sneakers' : 'PF. Shoes — Giày thể thao chính hãng',
            template: '%s | PF. Shoes',
        },
        description: en
            ? 'Shop authentic sneakers, view products in 3D, nationwide delivery, 7-day returns.'
            : 'Mua giày thể thao chính hãng, xem sản phẩm 3D, giao hàng toàn quốc, đổi trả trong 7 ngày.',
    };
}

export const viewport: Viewport = {
    themeColor: '#0ea893',
    width: 'device-width',
    initialScale: 1,
    // Cho phép dùng env(safe-area-inset-*) với tai thỏ / thanh home của iPhone
    viewportFit: 'cover',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const locale = await getLocale();
    return (
        // suppressHydrationWarning: script dưới đây đặt class .dark trước khi React hydrate
        <html lang={locale} className={beVietnam.variable} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
            </head>
            <body>
                <ThemeProvider>
                <I18nProvider initialLocale={locale}>
                <StoreProvider>
                    <ToastProvider>
                        <AuthBootstrap />
                        <ServerWakeNotice />
                        <Header />
                        <main className="min-h-[60vh]">{children}</main>
                        <Footer />
                        <ChatWidget />
                    </ToastProvider>
                </StoreProvider>
                </I18nProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

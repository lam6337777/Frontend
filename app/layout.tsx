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

const beVietnam = Be_Vietnam_Pro({
    variable: '--font-be-vietnam',
    subsets: ['latin', 'vietnamese'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'PF. Shoes — Giày thể thao chính hãng',
        template: '%s | PF. Shoes',
    },
    description: 'Mua giày thể thao chính hãng, xem sản phẩm 3D, giao hàng toàn quốc, đổi trả trong 7 ngày.',
};

export const viewport: Viewport = {
    themeColor: '#0ea893',
    width: 'device-width',
    initialScale: 1,
    // Cho phép dùng env(safe-area-inset-*) với tai thỏ / thanh home của iPhone
    viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="vi" className={beVietnam.variable}>
            <body>
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
            </body>
        </html>
    );
}

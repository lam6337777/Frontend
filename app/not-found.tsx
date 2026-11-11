import { Footprints } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { getT } from '@/lib/i18n/server';

export default async function NotFound() {
    const { locale } = await getT();
    const en = locale === 'en';
    return (
        <div className="container-page flex flex-col items-center py-24 text-center">
            <span className="grid h-24 w-24 place-items-center rounded-full bg-brand-50 text-brand-500">
                <Footprints className="h-11 w-11" />
            </span>
            <p className="mt-6 text-6xl font-extrabold text-brand-500">404</p>
            <h1 className="mt-2 text-2xl font-bold">{en ? 'Lost your way!' : 'Lạc bước rồi!'}</h1>
            <p className="mt-2 max-w-sm text-muted">
                {en ? "The page you're looking for doesn't exist or has been moved." : 'Trang bạn tìm không tồn tại hoặc đã được chuyển đi.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <LinkButton href="/">{en ? 'Back to home' : 'Về trang chủ'}</LinkButton>
                <LinkButton href="/products" variant="outline">
                    {en ? 'Browse products' : 'Xem sản phẩm'}
                </LinkButton>
            </div>
        </div>
    );
}

import Link from 'next/link';
import { MapPin, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { Logo } from './Header';

const PERKS = [
    { icon: Truck, title: 'Giao hàng toàn quốc', desc: 'Miễn phí cho đơn từ 1.000.000₫' },
    { icon: RotateCcw, title: 'Đổi trả 7 ngày', desc: 'Đổi size, trả hàng dễ dàng' },
    { icon: ShieldCheck, title: 'Hàng chính hãng', desc: 'Bảo hành lỗi nhà sản xuất' },
    { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Chat với trợ lý AI bất cứ lúc nào' },
];

const COLUMNS = [
    {
        title: 'Mua sắm',
        links: [
            { href: '/products', label: 'Tất cả sản phẩm' },
            { href: '/products?onSale=true', label: 'Khuyến mãi' },
            { href: '/products?sortBy=best_selling', label: 'Bán chạy' },
            { href: '/products?sortBy=newest', label: 'Hàng mới về' },
        ],
    },
    {
        title: 'Hỗ trợ khách hàng',
        links: [
            { href: '/account/orders', label: 'Theo dõi đơn hàng' },
            { href: '/policy#shipping', label: 'Chính sách giao hàng' },
            { href: '/policy#returns', label: 'Đổi trả & hoàn tiền' },
            { href: '/policy#warranty', label: 'Bảo hành' },
        ],
    },
    {
        title: 'Về PF. Shoes',
        links: [
            { href: '/about', label: 'Câu chuyện thương hiệu' },
            { href: '/policy#privacy', label: 'Chính sách bảo mật' },
        ],
    },
];

export function Footer() {
    return (
        <footer className="mt-20 bg-white">
            <div className="border-y border-line bg-mint-50">
                <div className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
                    {PERKS.map((p) => (
                        <div key={p.title} className="flex items-start gap-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-600 shadow-card">
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
                    <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
                        Giày thể thao chính hãng cho mọi bước chân — chạy bộ, tập luyện, dạo phố. Xem sản phẩm 3D trước khi mua.
                    </p>
                    {/* Thêm số điện thoại / email thật của cửa hàng tại đây */}
                    <p className="mt-5 flex items-center gap-2 text-sm text-muted">
                        <MapPin className="h-4 w-4 text-brand-500" /> TP. Hồ Chí Minh, Việt Nam
                    </p>
                </div>
                {COLUMNS.map((col) => (
                    <div key={col.title}>
                        <h3 className="text-sm font-bold">{col.title}</h3>
                        <ul className="mt-4 space-y-2.5">
                            {col.links.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm text-muted transition hover:text-brand-600">
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
                    <p>© {new Date().getFullYear()} PF. Shoes. Đồ án tốt nghiệp.</p>
                    <p>
                        Mô hình 3D minh họa: “Materials Variants Shoe” © Shopify,{' '}
                        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline hover:text-brand-600">
                            CC BY 4.0
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

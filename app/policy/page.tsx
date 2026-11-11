import type { Metadata } from 'next';
import { Lock, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { getLocale } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
    return { title: (await getLocale()) === 'en' ? 'Store policies' : 'Chính sách cửa hàng' };
}

// Nội dung khớp với quy tắc hệ thống đang áp dụng (phí ship theo tỉnh, đổi trả 7 ngày, yêu cầu bảo hành trong 30 ngày)
const SECTIONS_VI = [
    {
        id: 'shipping',
        icon: Truck,
        title: 'Chính sách giao hàng',
        items: [
            ['Thời gian xử lý', 'Đơn hàng được xác nhận và đóng gói trong vòng 24 giờ.'],
            ['Thời gian vận chuyển', 'Thời gian dự kiến hiển thị theo từng tỉnh/thành khi bạn chọn địa chỉ (thường 1–5 ngày làm việc).'],
            ['Phí vận chuyển', 'Tính theo tỉnh/thành và hiển thị trước khi đặt hàng. Miễn phí vận chuyển cho đơn từ 1.000.000₫.'],
            ['Theo dõi đơn', 'Xem trạng thái và lịch sử cập nhật của đơn trong mục Tài khoản → Đơn hàng.'],
        ],
    },
    {
        id: 'returns',
        icon: RotateCcw,
        title: 'Đổi trả & hoàn tiền',
        items: [
            ['Thời hạn', 'Gửi yêu cầu đổi size hoặc trả hàng trong vòng 7 ngày kể từ khi nhận hàng thành công.'],
            ['Điều kiện', 'Sản phẩm còn nguyên tem mác, hộp giày không móp méo và chưa qua sử dụng.'],
            ['Cách gửi yêu cầu', 'Vào chi tiết đơn hàng đã giao → “Yêu cầu đổi / trả / bảo hành”, chọn sản phẩm và mô tả lý do.'],
            ['Sản phẩm lỗi', 'Miễn phí toàn bộ chi phí vận chuyển đổi trả nếu sản phẩm lỗi từ nhà sản xuất.'],
        ],
    },
    {
        id: 'warranty',
        icon: ShieldCheck,
        title: 'Bảo hành',
        items: [
            ['Phạm vi', 'Bảo hành lỗi keo, chỉ do nhà sản xuất.'],
            ['Thời hạn gửi yêu cầu', 'Trong vòng 30 ngày kể từ khi nhận hàng, gửi trực tiếp trong mục Đơn hàng.'],
        ],
    },
    {
        id: 'privacy',
        icon: Lock,
        title: 'Bảo mật thông tin',
        items: [
            ['Thu thập', 'Chúng tôi chỉ thu thập thông tin cần thiết cho việc giao hàng và chăm sóc khách hàng.'],
            ['Chia sẻ', 'Không chia sẻ thông tin cá nhân cho bên thứ ba vì mục đích thương mại.'],
        ],
    },
];

const SECTIONS_EN: { title: string; items: string[][] }[] = [
    {
        title: 'Shipping policy',
        items: [
            ['Processing time', 'Orders are confirmed and packed within 24 hours.'],
            ['Delivery time', 'Estimated delivery is shown per province when you choose an address (usually 1–5 business days).'],
            ['Shipping fee', 'Calculated by province and shown before you order. Free shipping on orders from 1,000,000₫.'],
            ['Order tracking', 'See status and update history under Account → Orders.'],
        ],
    },
    {
        title: 'Returns & refunds',
        items: [
            ['Time limit', 'Request a size exchange or return within 7 days of successful delivery.'],
            ['Conditions', 'Tags intact, shoebox undamaged and the product unused.'],
            ['How to request', 'Open a delivered order → “Request exchange / return / warranty”, pick the items and describe the reason.'],
            ['Defective items', 'All return shipping costs are covered if the product has a manufacturing defect.'],
        ],
    },
    {
        title: 'Warranty',
        items: [
            ['Coverage', 'Glue and stitching defects caused by the manufacturer.'],
            ['Request window', 'Within 30 days of delivery, submitted directly from the Orders page.'],
        ],
    },
    {
        title: 'Privacy',
        items: [
            ['Collection', 'We only collect information needed for delivery and customer care.'],
            ['Sharing', 'We never share personal information with third parties for commercial purposes.'],
        ],
    },
];

export default async function PolicyPage() {
    const en = (await getLocale()) === 'en';
    const SECTIONS = en ? SECTIONS_VI.map((s, i) => ({ ...s, ...SECTIONS_EN[i] })) : SECTIONS_VI;
    return (
        <div className="container-page py-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-extrabold tracking-tight">{en ? 'Store policies' : 'Chính sách cửa hàng'}</h1>
                <nav className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                    {SECTIONS.map((s) => (
                        <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full bg-surface px-4 py-2 text-sm font-semibold shadow-card hover:text-brand-600">
                            {s.title}
                        </a>
                    ))}
                </nav>
                <div className="mt-8 space-y-6">
                    {SECTIONS.map((s) => (
                        <section key={s.id} id={s.id} className="card scroll-mt-36 p-6 md:p-8">
                            <h2 className="flex items-center gap-3 text-xl font-bold">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                                    <s.icon className="h-5 w-5" />
                                </span>
                                {s.title}
                            </h2>
                            <dl className="mt-5 space-y-4">
                                {s.items.map(([k, v]) => (
                                    <div key={k} className="grid gap-1 sm:grid-cols-[180px_1fr]">
                                        <dt className="font-semibold">{k}</dt>
                                        <dd className="text-ink/80">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}
                </div>
                <div className="mt-8 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-400 p-6 text-white">
                    <h2 className="text-lg font-bold">{en ? 'Still have questions?' : 'Bạn còn thắc mắc?'}</h2>
                    <p className="mt-1 text-sm text-white/90">{en ? 'Open the chat in the corner of the screen to ask our AI assistant or message a support agent directly.' : 'Mở khung chat ở góc màn hình để hỏi trợ lý AI hoặc nhắn trực tiếp cho nhân viên hỗ trợ.'}</p>
                </div>
            </div>
        </div>
    );
}

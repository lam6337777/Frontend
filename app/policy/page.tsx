import type { Metadata } from 'next';
import { Lock, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

export const metadata: Metadata = { title: 'Chính sách cửa hàng' };

// Nội dung khớp với quy tắc hệ thống đang áp dụng (phí ship theo tỉnh, đổi trả 7 ngày, yêu cầu bảo hành trong 30 ngày)
const SECTIONS = [
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

export default function PolicyPage() {
    return (
        <div className="container-page py-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-extrabold tracking-tight">Chính sách cửa hàng</h1>
                <nav className="mt-5 flex flex-wrap gap-2">
                    {SECTIONS.map((s) => (
                        <a key={s.id} href={`#${s.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-card hover:text-brand-600">
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
                    <h2 className="text-lg font-bold">Bạn còn thắc mắc?</h2>
                    <p className="mt-1 text-sm text-white/90">Mở khung chat ở góc màn hình để hỏi trợ lý AI hoặc nhắn trực tiếp cho nhân viên hỗ trợ.</p>
                </div>
            </div>
        </div>
    );
}

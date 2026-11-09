import type { Metadata } from 'next';
import Image from 'next/image';
import { Gem, Leaf, Sparkles, Target, Eye } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Về chúng tôi' };

const VALUES = [
    { icon: Gem, title: 'Chất lượng', desc: 'Vật liệu cao cấp, từ da thật đến vải mesh thoáng khí, đảm bảo độ bền theo thời gian.' },
    { icon: Sparkles, title: 'Tinh gọn', desc: 'Loại bỏ chi tiết rườm rà, tập trung vào phom dáng và sự tiện dụng hằng ngày.' },
    { icon: Leaf, title: 'Bền vững', desc: 'Ưu tiên quy trình thân thiện môi trường và thiết kế bền lâu, giảm rác thải thời trang.' },
];

export default function AboutPage() {
    return (
        <div className="pb-6">
            <section className="container-page pt-6">
                <div className="relative grid items-center overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-400 to-emerald-300 p-8 text-white md:grid-cols-2 md:p-14">
                    <div className="relative z-10">
                        <p className="text-sm font-semibold uppercase tracking-wider text-white/80">Về PF. Shoes</p>
                        <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Định nghĩa lại sự nhẹ nhàng trong từng bước chân.</h1>
                        <p className="mt-4 max-w-md text-white/90">Chúng tôi tin rằng sự đơn giản là đỉnh cao của sự tinh tế.</p>
                    </div>
                    <Image src="/images/hero-shoe.png" alt="" width={1024} height={1024} className="mx-auto mt-6 w-3/4 animate-float mix-blend-multiply md:mt-0" />
                </div>
            </section>

            <section className="container-page mt-14 grid gap-10 md:grid-cols-2">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">Câu chuyện của chúng tôi</h2>
                    <div className="mt-4 space-y-4 leading-7 text-ink/85">
                        <p>
                            Khởi đầu từ năm 2024 tại Sài Gòn, PF. Shoes được thành lập bởi một nhóm những người yêu thích phong cách tối giản. Chúng tôi nhận thấy thị
                            trường đang thiếu những dòng giày tập trung hoàn toàn vào chất lượng và phom dáng mà không bị xao nhãng bởi các chi tiết thừa thãi.
                        </p>
                        <p>
                            Tại PF. Shoes, mỗi đôi giày không chỉ là một món đồ thời trang mà là một tác phẩm của sự tinh gọn — dễ dàng kết hợp với bất kỳ trang
                            phục nào. Và giờ đây, bạn có thể xoay 360° từng đôi giày ngay trên màn hình trước khi quyết định.
                        </p>
                    </div>
                </div>
                <div className="grid gap-4">
                    <div className="card flex gap-4 p-6">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                            <Target className="h-6 w-6" />
                        </span>
                        <div>
                            <h3 className="font-bold">Sứ mệnh</h3>
                            <p className="mt-1 text-sm text-muted">Mang lại sự tự tin và thoải mái tuyệt đối cho khách hàng thông qua những thiết kế vượt thời gian.</p>
                        </div>
                    </div>
                    <div className="card flex gap-4 p-6">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-coral-50 text-coral-500">
                            <Eye className="h-6 w-6" />
                        </span>
                        <div>
                            <h3 className="font-bold">Tầm nhìn</h3>
                            <p className="mt-1 text-sm text-muted">Trở thành biểu tượng của lối sống “Ít hơn là nhiều hơn” (Less is More) tại Việt Nam.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container-page mt-14">
                <h2 className="text-center text-2xl font-extrabold tracking-tight">Giá trị cốt lõi</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {VALUES.map((v) => (
                        <div key={v.title} className="card p-6 text-center">
                            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600">
                                <v.icon className="h-7 w-7" />
                            </span>
                            <h3 className="mt-4 font-bold">{v.title}</h3>
                            <p className="mt-2 text-sm text-muted">{v.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-10 text-center">
                    <LinkButton href="/products" size="lg">
                        Khám phá sản phẩm
                    </LinkButton>
                </div>
            </section>
        </div>
    );
}

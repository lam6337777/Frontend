'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, CreditCard, Truck } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/redux/hooks';
import { clearCart } from '@/store/redux/cartSlice';
import { orderService } from '@/services/orderService';
import { cartService } from '@/services/cartService';
import { OrderRequest } from '@/types/order';
import { formatVND } from '@/lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((state) => state.cart);
    const { user, isAuthenticated, isAuthChecked } = useAppSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        shippingName: user?.fullName || '',
        shippingPhone: '',
        shippingAddress: '',
        paymentMethod: 'COD' as 'COD',
        note: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingFee = 0;
    const total = subtotal + shippingFee;

    useEffect(() => {
        if (isAuthChecked && !isAuthenticated) {
            router.push('/auth/login?redirect=/checkout');
            return;
        }

        if (!isAuthenticated) return;

        if (items.length === 0) {
            router.push('/cart');
        }
    }, [isAuthenticated, isAuthChecked, items.length, router]);

    // Tải thông tin form từ sessionStorage khi mount
    useEffect(() => {
        const savedData = sessionStorage.getItem('checkoutFormData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Lỗi khi tải dữ liệu thanh toán:', e);
            }
        }
    }, []);

    // Lưu thông tin form vào sessionStorage mỗi khi thay đổi
    useEffect(() => {
        sessionStorage.setItem('checkoutFormData', JSON.stringify(formData));
    }, [formData]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Đồng bộ giỏ hàng lên server trước
            await cartService.clearCart(); // Xóa sạch giỏ cũ trên server
            for (const item of items) {
                await cartService.addToCart({
                    variantId: item.variantId,
                    quantity: item.quantity
                });
            }

            // 2. Tạo đơn hàng
            const orderRequest: OrderRequest = {
                shippingName: formData.shippingName,
                shippingPhone: formData.shippingPhone,
                shippingAddress: formData.shippingAddress,
                paymentMethod: formData.paymentMethod,
                note: formData.note
            };

            const res = await orderService.createOrder(orderRequest);

            if (res.success) {
                dispatch(clearCart());
                sessionStorage.removeItem('checkoutFormData'); // Xóa thông tin form sau khi đặt hàng thành công
                alert('Đặt hàng thành công!');
                router.push('/profile'); // Hoặc trang thank-you
            } else {

                alert(res.message || 'Có lỗi xảy ra khi đặt hàng');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.response?.data?.message || 'Đã xảy ra lỗi hệ thống');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#FDFDFD] min-h-screen p-[5%]">
            <div className="max-w-[1200px] mx-auto">
                <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black hover:font-black transition-all mb-12">
                    <ArrowLeft size={14} /> Quay lại giỏ hàng
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* LEFT: FORM */}
                    <div className="lg:col-span-7">
                        <h1 className="text-3xl font-bold tracking-tight mb-8">Thanh toán</h1>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            {/* Shipping info */}
                            <section>
                                <h2 className="text-sm font-medium text-zinc-500 mb-6 flex items-center gap-2">
                                    <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs">01</span>
                                    Thông tin giao hàng
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-zinc-500 mb-2">Tên người nhận</label>
                                        <input
                                            required
                                            name="shippingName"
                                            value={formData.shippingName}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-zinc-200 p-4 rounded-full text-sm font-bold outline-none focus:border-black transition-colors"
                                            placeholder="Họ và tên"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-500 mb-2">Số điện thoại</label>
                                        <input
                                            required
                                            name="shippingPhone"
                                            value={formData.shippingPhone}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-zinc-200 p-4 rounded-full text-sm font-bold outline-none focus:border-black transition-colors"
                                            placeholder="09xx xxx xxx"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-zinc-500 mb-2">Địa chỉ đầy đủ</label>
                                        <input
                                            required
                                            name="shippingAddress"
                                            value={formData.shippingAddress}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-zinc-200 p-4 rounded-full text-sm font-bold outline-none focus:border-black transition-colors"
                                            placeholder="Số nhà, Tên đường, Quận/Huyện, Thành phố"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-zinc-500 mb-2">Ghi chú đơn hàng (Tùy chọn)</label>
                                        <textarea
                                            name="note"
                                            value={formData.note}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-zinc-200 p-4 rounded-full text-sm font-bold outline-none focus:border-black transition-colors min-h-[100px]"
                                            placeholder="Hướng dẫn đặc biệt cho việc giao hàng..."
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Payment method */}
                            <section>
                                <h2 className="text-sm font-medium text-zinc-500 mb-6 flex items-center gap-2">
                                    <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs">02</span>
                                    Phương thức thanh toán
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className={`flex items-center gap-4 p-6 border transition-all cursor-pointer rounded-xl ${formData.paymentMethod === 'COD' ? 'border-black bg-zinc-50' : 'border-zinc-100 bg-white hover:border-zinc-300'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={formData.paymentMethod === 'COD'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <Truck size={24} className={formData.paymentMethod === 'COD' ? 'text-black' : 'text-zinc-300'} />
                                        <div className="flex-1">
                                            <span className="block text-sm font-semibold">Thanh toán khi nhận hàng (COD)</span>
                                            <span className="text-sm text-zinc-500">Thanh toán bằng tiền mặt khi nhận hàng</span>
                                        </div>
                                    </label>
                                </div>
                            </section>

                            <button
                                type="submit"
                                disabled={isSubmitting || items.length === 0}
                                className="w-full bg-zinc-900 text-white py-4 rounded-full shadow-lg text-sm font-bold tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: SUMMARY */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-10 border border-zinc-100 sticky top-12">
                            <h2 className="text-xl font-bold tracking-tight mb-8">Tóm tắt đơn hàng</h2>

                            <div className="max-h-[400px] overflow-y-auto mb-8 pr-4 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.size}`} className="flex gap-4 mb-6 last:mb-0 pb-6 border-b border-zinc-50 last:border-0">
                                        <div className="w-20 aspect-square bg-zinc-50 rounded-sm overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.image?.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL}/files/${item.image}`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold truncate">{item.name}</h4>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                Kích cỡ EU {item.size} • Số lượng {item.quantity}
                                            </p>
                                            <span className="block text-sm font-semibold mt-2">{formatVND(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-8 border-t border-zinc-100">
                                <div className="flex justify-between text-sm font-medium text-zinc-500">
                                    <span className="text-black">{formatVND(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-zinc-500">
                                    <span className="text-black">{formatVND(shippingFee)}</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-4 border-t border-zinc-100 mt-4">
                                    <span className="text-base font-semibold">Tổng cộng</span>
                                    <span className="text-3xl font-black">{formatVND(total)}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-zinc-100 space-y-4">
                                <div className="flex items-center gap-3 text-zinc-400">
                                    <ShieldCheck size={16} />
                                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Mã hóa SSL bảo mật</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

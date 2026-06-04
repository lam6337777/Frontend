'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/redux/hooks';
import { updateQuantity, removeItem } from '@/store/redux/cartSlice';
import { cartService } from '@/services/cartService';
import { formatVND } from '@/lib/utils';

export default function CartPage() {
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((state) => state.cart);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Theo dõi item đang loading (tránh click nhiều lần)
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    const setLoading = (id: string, val: boolean) => {
        setLoadingIds(prev => { 
            const next = new Set(prev);
            val ? next.add(id) : next.delete(id);
            return next;
        });
    };

    const handleUpdateQuantity = async (id: string, size: string, newQty: number) => {
        if (newQty < 1) return;
        if (loadingIds.has(id)) return;

        setLoading(id, true);
        try {
            if (isAuthenticated) {
                // Gọi API cập nhật số lượng
                await cartService.updateCartItem(parseInt(id), newQty);
            }
            dispatch(updateQuantity({ id, size, quantity: newQty }));
        } catch (error) {
            console.error('Lỗi cập nhật số lượng:', error);
        } finally {
            setLoading(id, false);
        }
    };

    const handleRemove = async (id: string, size: string) => {
        if (loadingIds.has(`remove-${id}`)) return;

        setLoading(`remove-${id}`, true);
        try {
            if (isAuthenticated) {
                // Gọi API xóa sản phẩm khỏi giỏ hàng
                await cartService.removeCartItem(parseInt(id));
            }
            dispatch(removeItem({ id, size }));
        } catch (error) {
            console.error('Lỗi xóa sản phẩm:', error);
        } finally {
            setLoading(`remove-${id}`, false);
        }
    };

    return (
        <div className="bg-[#F9F9F9] min-h-screen p-[5%]">
            <nav className="text-sm font-medium text-zinc-500 mb-8">
                <Link href="/" className="hover:text-black hover:font-black transition-all">Trang chủ</Link> <span className="mx-2">/</span> Giỏ hàng
            </nav>

            <div className="max-w-[1400px] mx-auto">
                <div className="flex justify-between items-baseline mb-12">
                    <h1 className="text-3xl font-bold tracking-tight">Giỏ của bạn</h1>
                    <span className="text-zinc-500 font-medium text-sm">{items.length} sản phẩm</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* CART ITEMS */}
                    <div className="lg:col-span-8 space-y-6">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <div key={`${item.id}-${item.variantId}`} className="bg-white p-6 flex gap-6 relative group transition-all hover:shadow-xl hover:shadow-zinc-200/50">
                                    <div className="w-32 aspect-square bg-zinc-100 flex items-center justify-center overflow-hidden rounded-2xl flex-shrink-0">
                                        {item.image ? (
                                            <img
                                                src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL}/files/${item.image}`}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-sm font-medium text-zinc-400">Không có ảnh</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                                                <p className="text-sm text-zinc-500 mb-4">{item.brand}</p>

                                                <div className="flex gap-8 mb-4">
                                                    <div>
                                                        <span className="block text-xs text-zinc-500 mb-1">Màu sắc</span>
                                                        <span className="text-[10px] font-bold uppercase">{item.brand || '—'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-zinc-500 mb-1">Kích cỡ</span>
                                                        <span className="text-[10px] font-bold uppercase">EU {item.size}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xl font-bold">{formatVND(item.price)}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            {/* Bộ điều chỉnh số lượng */}
                                            <div className="flex items-center border border-zinc-100 p-1">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity - 1)}
                                                    disabled={loadingIds.has(item.id) || item.quantity <= 1}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 transition-colors disabled:opacity-40"
                                                >
                                                    {loadingIds.has(item.id) ? <Loader2 size={12} className="animate-spin" /> : <Minus size={14} />}
                                                </button>
                                                <span className="w-10 text-center text-xs font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity + 1)}
                                                    disabled={loadingIds.has(item.id)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 transition-colors disabled:opacity-40"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            {/* Nút xóa */}
                                            <button
                                                onClick={() => handleRemove(item.id, item.size)}
                                                disabled={loadingIds.has(`remove-${item.id}`)}
                                                className="text-sm font-medium text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1 disabled:opacity-40"
                                            >
                                                {loadingIds.has(`remove-${item.id}`)
                                                    ? <Loader2 size={12} className="animate-spin" />
                                                    : <Trash2 size={12} />
                                                }
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-20 text-center">
                                <p className="text-zinc-500 text-base mb-8">Giỏ hàng của bạn đang trống</p>
                                <Link href="/products" className="inline-block bg-zinc-900 text-white px-8 py-4 text-sm font-medium rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                    Bắt đầu mua sắm
                                </Link>
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className="bg-white p-8 border border-zinc-100 border-dashed flex items-center gap-6">
                                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400">
                                    <ArrowRight size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-base font-semibold">Miễn phí vận chuyển nhanh</h4>
                                    <p className="text-sm text-zinc-500">Bạn đã được mở khóa giao hàng miễn phí toàn quốc cho đơn hàng này.</p>
                                </div>
                                <div className="bg-zinc-50 px-4 py-2 border border-zinc-100">
                                    <span className="text-xs font-semibold text-zinc-600">Qualified</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-10 sticky top-12 shadow-sm border border-zinc-50">
                            <h2 className="text-xl font-bold tracking-tight mb-10 pb-6 border-b border-zinc-50">Order Summary</h2>

                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between text-base font-semibold text-zinc-400">
                                    <span className="text-black">{formatVND(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-base font-semibold text-zinc-400">
                                    <span>Phí vận chuyển ước tính</span>
                                    <span className="text-green-600">MIỄN PHÍ</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-baseline mb-10 pt-6 border-t border-zinc-50">
                                <span className="text-3xl font-black">{formatVND(total)}</span>
                            </div>

                            <div className="space-y-3 mb-10">
                                <Link href="/checkout" className="w-full bg-zinc-900 text-white py-4 text-sm font-medium rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center">
                                    Tiến hành thanh toán
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-20 pt-12 border-t border-zinc-100 flex justify-between items-center text-sm font-medium text-zinc-500">
                <span>© 2026 LUXE FOOTWEAR. ALL RIGHTS RESERVED.</span>
                <div className="flex gap-8">
                    <Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-black transition-colors">Terms of Service</Link>
                    <Link href="#" className="hover:text-black transition-colors">Contact Us</Link>
                </div>
            </footer>
        </div>
    );
}

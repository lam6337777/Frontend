'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, Headset, LogIn, MessageCircle, Minus, Send } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/redux/hooks';
import { cn } from '@/lib/utils';
import { AIChat } from './AIChat';
import { useStaffChat } from './useStaffChat';

type Tab = 'AI' | 'STAFF';

const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export default function ChatWidget() {
    const { isAuthenticated } = useAppSelector((s) => s.auth);
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>('AI');
    const staff = useStaffChat(isAuthenticated, open && tab === 'STAFF');
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    // Trang chi tiết sản phẩm có thanh "Thêm vào giỏ / Mua ngay" cố định ở đáy (điện thoại) → đẩy nút chat lên trên
    const pathname = usePathname();
    const aboveBuyBar = /^\/products\/[^/]+$/.test(pathname || '');

    // Có tin nhân viên chưa đọc → mở thẳng tab Nhân viên
    const openWidget = () => {
        if (staff.unread > 0) setTab('STAFF');
        setOpen(true);
    };

    useEffect(() => {
        if (tab === 'STAFF') scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [staff.messages, tab, open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const sendStaff = async (e: FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || staff.sending) return;
        setInput('');
        const ok = await staff.send(text);
        if (!ok) setInput(text);
    };

    return (
        <>
            {!open && (
                <button
                    onClick={openWidget}
                    aria-label="Mở hỗ trợ trực tuyến"
                    className={cn(
                        'fixed right-4 z-[60] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lift transition hover:scale-105 active:scale-95 sm:right-5 md:bottom-5',
                        aboveBuyBar ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'
                    )}
                >
                    <MessageCircle className="h-6 w-6" />
                    {staff.unread > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[11px] font-bold ring-2 ring-white">
                            {staff.unread}
                        </span>
                    )}
                </button>
            )}

            {open && (
                <section
                    role="dialog"
                    aria-label="Hỗ trợ trực tuyến"
                    className="fixed inset-x-0 top-0 z-[60] flex h-[100dvh] animate-fade-up flex-col overflow-hidden bg-mint-50 pt-[env(safe-area-inset-top)] sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(640px,calc(100dvh-2.5rem))] sm:w-[390px] sm:rounded-3xl sm:border sm:border-line sm:pt-0 sm:shadow-lift"
                >
                    <header className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 px-4 pb-3 pt-4 text-white">
                        <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15" />
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-base font-extrabold">PF. Shoes hỗ trợ</p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/85">
                                    <span className="h-2 w-2 rounded-full bg-mint-100 shadow-[0_0_0_3px_rgba(255,255,255,0.25)]" />
                                    {tab === 'AI' ? 'Trợ lý AI trả lời ngay' : 'Nhân viên phản hồi trong giờ làm việc'}
                                </p>
                            </div>
                            <button onClick={() => setOpen(false)} aria-label="Thu nhỏ" className="rounded-full p-1.5 hover:bg-white/15">
                                <Minus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="relative mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-white/15 p-1 text-sm font-semibold" role="tablist">
                            {(
                                [
                                    ['AI', 'Trợ lý AI', Bot],
                                    ['STAFF', 'Nhân viên', Headset],
                                ] as const
                            ).map(([key, label, Icon]) => (
                                <button
                                    key={key}
                                    role="tab"
                                    aria-selected={tab === key}
                                    onClick={() => setTab(key)}
                                    className={cn(
                                        'relative flex items-center justify-center gap-1.5 rounded-xl py-1.5 transition',
                                        tab === key ? 'bg-white text-brand-700 shadow-sm' : 'text-white/90 hover:bg-white/10'
                                    )}
                                >
                                    <Icon className="h-4 w-4" /> {label}
                                    {key === 'STAFF' && staff.unread > 0 && (
                                        <span className="grid h-4 min-w-4 place-items-center rounded-full bg-coral-500 px-1 text-[10px] text-white">{staff.unread}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </header>

                    {tab === 'AI' ? (
                        <AIChat isAuthenticated={isAuthenticated} onHandoff={() => setTab('STAFF')} />
                    ) : !isAuthenticated ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-coral-50 text-coral-500">
                                <Headset className="h-7 w-7" />
                            </span>
                            <p className="mt-3 font-bold">Đăng nhập để chat với nhân viên</p>
                            <p className="mt-1 text-sm text-muted">Shop cần biết bạn là ai để tra cứu đơn hàng và hỗ trợ chính xác.</p>
                            <Link
                                href="/auth/login"
                                onClick={() => setOpen(false)}
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
                            >
                                <LogIn className="h-4 w-4" /> Đăng nhập
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
                                {staff.messages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-coral-50 text-coral-500">
                                            <Headset className="h-7 w-7" />
                                        </span>
                                        <p className="mt-3 font-bold">Chat với nhân viên PF. Shoes</p>
                                        <p className="mt-1 text-sm text-muted">Để lại lời nhắn, shop sẽ phản hồi sớm nhất có thể.</p>
                                    </div>
                                ) : (
                                    staff.messages.map((m) => {
                                        const mine = m.sender?.role !== 'ADMIN';
                                        return (
                                            <div key={m.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
                                                {!mine && <span className="mb-0.5 ml-1 text-[11px] font-semibold text-brand-700">Nhân viên PF. Shoes</span>}
                                                <div
                                                    className={cn(
                                                        'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                                                        mine
                                                            ? 'rounded-br-md bg-gradient-to-br from-brand-500 to-brand-600 text-white'
                                                            : 'rounded-tl-md border border-line bg-white text-ink'
                                                    )}
                                                >
                                                    {m.content}
                                                </div>
                                                <span className="mt-1 text-[10px] text-muted">{timeLabel(m.createdAt)}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <form onSubmit={sendStaff} className="flex items-center gap-2 border-t border-line bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    maxLength={1000}
                                    placeholder="Nhắn cho nhân viên…"
                                    aria-label="Tin nhắn cho nhân viên"
                                    className="input h-10 flex-1 rounded-full px-4 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || staff.sending}
                                    aria-label="Gửi"
                                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </>
                    )}
                </section>
            )}
        </>
    );
}

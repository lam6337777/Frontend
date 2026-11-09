'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, Headset, History, Plus, Send, Sparkles, Trash2, X } from 'lucide-react';
import { aiChatService, AIProduct, AISession } from '@/services/aiChatService';
import { cn, formatVND, PLACEHOLDER_IMAGE, resolveAssetUrl } from '@/lib/utils';
import { RichText } from './RichText';

interface UIMessage {
    key: string;
    role: 'user' | 'bot';
    content: string;
    products?: AIProduct[] | null;
    handoff?: boolean;
    streaming?: boolean;
    createdAt: string;
}

const SUGGESTIONS = [
    'Giày chạy bộ dưới 2 triệu',
    'Phí ship về Hà Nội?',
    'Đang có mã giảm giá nào?',
    'Chân 26cm đi size mấy?',
    'Đơn hàng của tôi',
];

const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

function relative(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60_000) return 'Vừa xong';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút trước`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} giờ trước`;
    return new Date(iso).toLocaleDateString('vi-VN');
}

function ProductStrip({ items }: { items: AIProduct[] }) {
    return (
        <div className="-mx-1 mt-2 flex snap-x gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
            {items.map((p) => (
                <Link
                    key={p.id}
                    href={p.url}
                    className="w-36 shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveAssetUrl(p.image) || PLACEHOLDER_IMAGE} alt="" className="h-24 w-full bg-mint-100 object-cover" loading="lazy" />
                    <div className="p-2">
                        <p className="line-clamp-2 text-xs font-semibold leading-snug text-ink">{p.name}</p>
                        <p className="mt-1 text-sm font-bold text-coral-500">{formatVND(p.price)}</p>
                        {p.originalPrice ? <p className="text-[11px] text-muted line-through">{formatVND(p.originalPrice)}</p> : null}
                        {p.sizeStock === 0 ? (
                            <p className="mt-1 text-[11px] font-semibold text-coral-600">Hết size bạn chọn</p>
                        ) : p.sizesInStock.length ? (
                            <p className="mt-1 text-[11px] text-muted">
                                Size {p.sizesInStock[0]}–{p.sizesInStock[p.sizesInStock.length - 1]}
                            </p>
                        ) : (
                            <p className="mt-1 text-[11px] font-semibold text-coral-600">Tạm hết hàng</p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}

export function AIChat({ isAuthenticated, onHandoff }: { isAuthenticated: boolean; onHandoff: () => void }) {
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [sessions, setSessions] = useState<AISession[]>([]);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const loadSessions = useCallback(() => {
        if (!isAuthenticated) return;
        aiChatService.listSessions().then(setSessions).catch(() => {});
    }, [isAuthenticated]);

    useEffect(() => {
        loadSessions();
        if (!isAuthenticated) {
            setSessions([]);
            setSessionId(null);
        }
    }, [isAuthenticated, loadSessions]);

    useEffect(() => () => abortRef.current?.abort(), []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const openSession = async (id: number) => {
        abortRef.current?.abort();
        setShowHistory(false);
        setSessionId(id);
        try {
            const list = await aiChatService.messages(id);
            setMessages(
                list.map((m) => ({ key: `s${m.id}`, role: m.role, content: m.content, products: m.products, handoff: m.handoff, createdAt: m.created_at }))
            );
        } catch {
            setMessages([]);
        }
    };

    const newChat = () => {
        abortRef.current?.abort();
        setSessionId(null);
        setMessages([]);
        setShowHistory(false);
    };

    const removeSession = async (id: number) => {
        try {
            await aiChatService.remove(id);
            setSessions((prev) => prev.filter((s) => s.id !== id));
            if (id === sessionId) newChat();
        } catch {
            /* giữ nguyên */
        }
    };

    const ask = async (text: string) => {
        const question = text.trim();
        if (!question || sending) return;
        setInput('');
        setSending(true);
        const now = new Date().toISOString();
        const botKey = `b${Date.now()}`;
        setMessages((prev) => [
            ...prev,
            { key: `u${Date.now()}`, role: 'user', content: question, createdAt: now },
            { key: botKey, role: 'bot', content: '', streaming: true, createdAt: now },
        ]);
        const patch = (fn: (m: UIMessage) => UIMessage) => setMessages((prev) => prev.map((m) => (m.key === botKey ? fn(m) : m)));

        const controller = new AbortController();
        abortRef.current = controller;
        try {
            await aiChatService.stream(
                question,
                sessionId,
                (ev) => {
                    if (ev.type === 'session') {
                        setSessionId(ev.id);
                        setSessions((prev) => [{ id: ev.id, title: ev.title, created_at: now, updated_at: now }, ...prev]);
                    } else if (ev.type === 'delta') {
                        patch((m) => ({ ...m, content: m.content + ev.text }));
                    } else if (ev.type === 'products') {
                        patch((m) => ({ ...m, products: ev.items }));
                    } else if (ev.type === 'handoff') {
                        patch((m) => ({ ...m, handoff: true }));
                    }
                },
                controller.signal
            );
            patch((m) => ({ ...m, streaming: false }));
        } catch (e) {
            if ((e as Error).name === 'AbortError') return;
            const msg =
                (e as Error).message === 'rate'
                    ? 'Dạ, anh/chị gửi hơi nhanh, vui lòng đợi vài giây rồi thử lại giúp em ạ.'
                    : 'Dạ, em xin lỗi, hiện em chưa kết nối được trợ lý AI ạ. Anh/chị vui lòng thử lại sau hoặc chat với nhân viên giúp em nhé.';
            patch((m) => ({ ...m, content: m.content || msg, streaming: false, handoff: true }));
        } finally {
            setSending(false);
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        ask(input);
    };

    return (
        <div className="relative flex min-h-0 flex-1 flex-col">
            {/* Thanh công cụ phiên chat */}
            {isAuthenticated && (
                <div className="flex items-center justify-between border-b border-line bg-white/70 px-3 py-1.5 text-xs">
                    <button onClick={() => setShowHistory(true)} className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-muted hover:bg-mint-100 hover:text-ink">
                        <History className="h-3.5 w-3.5" /> Lịch sử ({sessions.length})
                    </button>
                    <button onClick={newChat} className="flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-brand-700 hover:bg-brand-50">
                        <Plus className="h-3.5 w-3.5" /> Cuộc trò chuyện mới
                    </button>
                </div>
            )}

            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lift">
                            <Sparkles className="h-7 w-7" />
                        </span>
                        <p className="mt-3 font-bold text-ink">Trợ lý PF. Shoes</p>
                        <p className="mt-1 text-sm text-muted">Dạ, em có thể giúp anh/chị tìm giày, chọn size, báo phí ship, mã giảm giá hay tra cứu đơn hàng ạ.</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => ask(s)}
                                    className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((m) =>
                        m.role === 'user' ? (
                            <div key={m.key} className="flex flex-col items-end">
                                <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-brand-500 to-brand-600 px-3.5 py-2 text-sm text-white shadow-sm">
                                    {m.content}
                                </div>
                                <span className="mt-1 text-[10px] text-muted">{timeLabel(m.createdAt)}</span>
                            </div>
                        ) : (
                            <div key={m.key} className="flex gap-2" data-role="bot" data-state={m.streaming ? 'streaming' : 'done'}>
                                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                                    <Bot className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 max-w-[88%]">
                                    <div className="rounded-2xl rounded-tl-md border border-line bg-white px-3.5 py-2 text-sm leading-relaxed text-ink shadow-sm">
                                        {m.content ? <RichText text={m.content} /> : null}
                                        {m.streaming && !m.content && (
                                            <span className="flex gap-1 py-1" aria-label="Đang trả lời">
                                                {[0, 1, 2].map((i) => (
                                                    <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${i * 0.15}s` }} />
                                                ))}
                                            </span>
                                        )}
                                        {m.products?.length ? <ProductStrip items={m.products} /> : null}
                                        {m.handoff && (
                                            <button onClick={onHandoff} className="mt-2 flex items-center gap-1.5 rounded-lg bg-coral-50 px-2.5 py-1.5 text-xs font-bold text-coral-600 hover:bg-coral-100">
                                                <Headset className="h-3.5 w-3.5" /> Chat với nhân viên
                                            </button>
                                        )}
                                    </div>
                                    <span className="mt-1 block text-[10px] text-muted">{timeLabel(m.createdAt)} · Trợ lý AI</span>
                                </div>
                            </div>
                        )
                    )
                )}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={500}
                    placeholder="Hỏi trợ lý AI…"
                    aria-label="Câu hỏi cho trợ lý AI"
                    className="input h-10 flex-1 rounded-full px-4 text-sm"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    aria-label="Gửi"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>

            {/* Lịch sử phiên — trượt từ trái */}
            {showHistory && (
                <div className="absolute inset-0 z-10 flex">
                    <div className="flex w-[82%] flex-col border-r border-line bg-white shadow-lift">
                        <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
                            <p className="text-sm font-bold">Cuộc trò chuyện với AI</p>
                            <button onClick={() => setShowHistory(false)} aria-label="Đóng lịch sử" className="rounded-lg p-1 text-muted hover:bg-mint-100">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto p-2">
                            {sessions.length === 0 ? (
                                <p className="p-4 text-center text-sm text-muted">Chưa có cuộc trò chuyện nào</p>
                            ) : (
                                sessions.map((s) => (
                                    <div
                                        key={s.id}
                                        className={cn(
                                            'group flex items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-mint-100',
                                            s.id === sessionId && 'bg-brand-50'
                                        )}
                                    >
                                        <button onClick={() => openSession(s.id)} className="min-w-0 flex-1 text-left">
                                            <p className="truncate text-sm font-semibold text-ink">{s.title}</p>
                                            <p className="text-[11px] text-muted">{relative(s.updated_at)}</p>
                                        </button>
                                        <button
                                            onClick={() => removeSession(s.id)}
                                            aria-label="Xóa cuộc trò chuyện"
                                            className="rounded-lg p-1.5 text-muted opacity-0 transition hover:bg-coral-50 hover:text-coral-600 group-hover:opacity-100 focus:opacity-100"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <button className="flex-1 bg-ink/20" aria-label="Đóng lịch sử" onClick={() => setShowHistory(false)} />
                </div>
            )}
        </div>
    );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService } from '@/services/chatService';
import { ChatMessage } from '@/types/chat';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api').replace(/\/$/, '');

/**
 * Chat với nhân viên: tải lịch sử, nhận tin mới realtime qua SSE của backend,
 * đánh dấu đã đọc khi khách đang xem tab Nhân viên.
 */
export function useStaffChat(enabled: boolean, viewing: boolean) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sending, setSending] = useState(false);
    const viewingRef = useRef(viewing);
    viewingRef.current = viewing;

    const markRead = useCallback(() => {
        chatService.markRead().catch(() => {});
        setMessages((prev) => prev.map((m) => (m.sender?.role === 'ADMIN' && !m.isRead ? { ...m, isRead: true } : m)));
    }, []);

    const load = useCallback(async () => {
        try {
            const res = await chatService.getMessages();
            if (res.success) setMessages(res.data);
        } catch {
            /* backend tạm không phản hồi */
        }
    }, []);

    useEffect(() => {
        if (enabled) load();
        else setMessages([]);
    }, [enabled, load]);

    useEffect(() => {
        if (enabled && viewing && messages.some((m) => m.sender?.role === 'ADMIN' && !m.isRead)) markRead();
    }, [enabled, viewing, messages, markRead]);

    // SSE: tin nhân viên trả lời đến ngay cả khi widget đang đóng (để hiện badge)
    useEffect(() => {
        if (!enabled) return;
        let es: EventSource | null = null;
        let retry: ReturnType<typeof setTimeout>;
        const connect = () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            es = new EventSource(`${API_URL}/chat/sse?token=${encodeURIComponent(token)}`);
            es.addEventListener('CHAT', (event) => {
                try {
                    const msg = JSON.parse((event as MessageEvent).data) as ChatMessage;
                    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
                } catch {
                    /* bỏ qua */
                }
            });
            es.onerror = () => {
                es?.close();
                retry = setTimeout(connect, 5000);
            };
        };
        connect();
        return () => {
            es?.close();
            clearTimeout(retry);
        };
    }, [enabled]);

    const send = useCallback(
        async (content: string) => {
            setSending(true);
            try {
                const res = await chatService.sendMessage(content);
                if (res.success && res.data) {
                    setMessages((prev) => (prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data]));
                }
                return true;
            } catch {
                return false;
            } finally {
                setSending(false);
            }
        },
        []
    );

    const unread = messages.filter((m) => m.sender?.role === 'ADMIN' && !m.isRead).length;
    return { messages, unread, sending, send };
}

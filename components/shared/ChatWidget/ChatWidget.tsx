'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, X, Minus, Bot, User, Headset, Plus, Trash2, ChevronLeft, Clock } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/redux/hooks';
import { setCart } from '@/store/redux/cartSlice';
import { cartService } from '@/services/cartService';
import { chatService } from '@/services/chatService';
import { chatbotService } from '@/services/chatbotService';
import { ChatMessage } from '@/types/chat';
import styles from './ChatWidget.module.css';

const CHATBOT_URL = 'http://localhost:8000';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatMessage = (text: string) => {
    if (!text) return '';
    let formatted = text
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0;box-shadow:0 2px 4px rgba(0,0,0,0.1);" />')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:#3b82f6;font-weight:600;text-decoration:none;">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
    const lines = formatted.split('<br />');
    let inList = false;
    const newLines: string[] = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) { newLines.push('<ul>'); inList = true; }
            newLines.push(`<li>${trimmed.substring(2)}</li>`);
        } else {
            if (inList) { newLines.push('</ul>'); inList = false; }
            newLines.push(line);
        }
    }
    if (inList) newLines.push('</ul>');
    return newLines.join('');
};

const formatSessionTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return d.toLocaleDateString('vi-VN');
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface AIChatSession {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

interface AIMessage {
    id: number;
    content: string;
    role: 'user' | 'bot';
    isStreaming?: boolean;
    handoff?: boolean;
    createdAt: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatWidget() {
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatMode, setChatMode] = useState<'ADMIN' | 'AI'>('ADMIN');
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isOpenRef = useRef(false);

    // AI chat state
    const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
    const [sessions, setSessions] = useState<AIChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);

    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    // Fetch admin chat history
    useEffect(() => {
        if (isAuthenticated && isOpen) fetchAndMarkRead();
    }, [isAuthenticated, isOpen]);

    // Load AI sessions when switching to AI mode
    useEffect(() => {
        if (chatMode === 'AI' && isAuthenticated && user?.id) {
            fetchSessions();
        }
    }, [chatMode, isAuthenticated]);

    // SSE for admin chat
    useEffect(() => {
        if (!isAuthenticated) return;
        let eventSource: EventSource | null = null;
        let reconnectTimeout: NodeJS.Timeout;
        const connectSSE = () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api').replace(/\/$/, '');
            eventSource = new EventSource(`${baseUrl}/chat/sse?token=${token}`);
            eventSource.addEventListener('CHAT', (event) => {
                try {
                    const message = JSON.parse(event.data) as ChatMessage;
                    setMessages((prev) => {
                        if (prev.some((m) => m.id === message.id)) return prev;
                        return [...prev, message];
                    });
                    if (isOpenRef.current && message.sender?.role === 'ADMIN') {
                        chatService.markRead().catch(() => { });
                        setMessages(prev => prev.map(m =>
                            m.sender?.role === 'ADMIN' && !m.isRead ? { ...m, isRead: true } : m
                        ));
                    }
                } catch (error) { console.error('Error parsing SSE:', error); }
            });
            eventSource.onerror = () => {
                eventSource?.close();
                reconnectTimeout = setTimeout(connectSSE, 5000);
            };
        };
        connectSSE();
        return () => { eventSource?.close(); clearTimeout(reconnectTimeout); };
    }, [isAuthenticated]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, aiMessages, chatMode]);

    // ── API helpers ───────────────────────────────────────────────────────────

    const fetchAndMarkRead = async () => {
        try {
            const res = await chatService.getMessages();
            if (res.success) setMessages(res.data);
            await chatService.markRead();
            setMessages(prev => prev.map(m =>
                m.sender?.role === 'ADMIN' && !m.isRead ? { ...m, isRead: true } : m
            ));
        } catch (e) { console.error(e); }
    };

    const fetchSessions = async () => {
        if (!user?.id) return;
        setLoadingSessions(true);
        try {
            const res = await fetch(`${CHATBOT_URL}/api/chat/sessions?userid=${user.id}`);
            const data = await res.json();
            setSessions(data.sessions || []);
        } catch (e) { console.error(e); }
        finally { setLoadingSessions(false); }
    };

    const createNewSession = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${CHATBOT_URL}/api/chat/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid: user.id.toString(), title: 'Cuộc trò chuyện mới' })
            });
            const data = await res.json();
            setCurrentSessionId(data.session_id);
            setAiMessages([]);
            setShowSidebar(false);
            // Thêm session mới vào đầu danh sách
            const newSession: AIChatSession = {
                id: data.session_id,
                title: 'Cuộc trò chuyện mới',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            setSessions(prev => [newSession, ...prev]);
        } catch (e) { console.error(e); }
    };

    const loadSession = async (sessionId: number) => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${CHATBOT_URL}/api/chat/session/${sessionId}/messages?userid=${user.id}`);
            const data = await res.json();
            const loadedMessages: AIMessage[] = (data.messages || []).map((m: any) => ({
                id: m.id,
                content: m.content,
                role: m.role,
                createdAt: m.created_at
            }));
            setAiMessages(loadedMessages);
            setCurrentSessionId(sessionId);
            setShowSidebar(false);
        } catch (e) { console.error(e); }
    };

    const deleteSession = async (e: React.MouseEvent, sessionId: number) => {
        e.stopPropagation();
        if (!user?.id) return;
        try {
            await fetch(`${CHATBOT_URL}/api/chat/session/${sessionId}?userid=${user.id}`, { method: 'DELETE' });
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setAiMessages([]);
            }
        } catch (e) { console.error(e); }
    };

    // ── Send message ──────────────────────────────────────────────────────────

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isSending) return;
        const content = inputValue.trim();
        setInputValue('');
        setIsSending(true);

        if (chatMode === 'AI') {
            // Nếu chưa có session, tạo mới
            let sessionId = currentSessionId;
            if (!sessionId) {
                try {
                    const res = await fetch(`${CHATBOT_URL}/api/chat/session`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userid: user?.id?.toString() || '', title: content.substring(0, 60) })
                    });
                    const data = await res.json();
                    sessionId = data.session_id;
                    setCurrentSessionId(sessionId);
                    const newSession: AIChatSession = {
                        id: data.session_id,
                        title: content.substring(0, 60),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    setSessions(prev => [newSession, ...prev]);
                } catch (e) { console.error(e); setIsSending(false); return; }
            }

            // Thêm tin nhắn user
            const userMsgId = Date.now();
            setAiMessages(prev => [...prev, { id: userMsgId, content, role: 'user', createdAt: new Date().toISOString() }]);

            // Placeholder cho bot
            const botMsgId = Date.now() + 1;
            setAiMessages(prev => [...prev, { id: botMsgId, content: '', role: 'bot', isStreaming: true, createdAt: new Date().toISOString() }]);

            // Cập nhật title session từ câu đầu tiên
            if (aiMessages.length === 0) {
                setSessions(prev => prev.map(s =>
                    s.id === sessionId ? { ...s, title: content.substring(0, 60) } : s
                ));
                try {
                    await fetch(`${CHATBOT_URL}/api/chat/session/${sessionId}/title?userid=${user?.id}&title=${encodeURIComponent(content.substring(0, 60))}`, { method: 'PATCH' });
                } catch (_) { }
            }

            try {
                const token = localStorage.getItem('token') || '';
                // Lấy câu trước làm history
                let historyStr = '';
                if (aiMessages.length > 0) {
                    const last = aiMessages[aiMessages.length - 1];
                    historyStr = `${last.role === 'bot' ? 'Bot' : 'User'}: ${last.content}`;
                }

                const params = new URLSearchParams({
                    message: content,
                    history: historyStr,
                    userid: user?.id ? user.id.toString() : '',
                    jwt: token,
                    session_id: sessionId!.toString()
                }).toString();

                const response = await fetch(`${CHATBOT_URL}/api/chat/stream?${params}`);
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                if (!reader) throw new Error('No reader');

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    for (const line of chunk.split('\n')) {
                        if (!line.startsWith('data: ')) continue;
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.text !== undefined) {
                                try {
                                    const parsed = JSON.parse(data.text);
                                    if (parsed.action === 'UPDATE_CART_UI') {
                                        cartService.getCart().then(res => {
                                            if (res.data) {
                                                const items = res.data.map((item: any) => ({
                                                    id: item.id.toString(), variantId: item.variantId,
                                                    name: item.productName, price: item.unitPrice,
                                                    brand: item.color ?? '', size: item.size,
                                                    quantity: item.quantity, image: item.primaryImageUrl
                                                }));
                                                dispatch(setCart(items));
                                            }
                                        }).catch(console.error);
                                        setAiMessages(prev => prev.map(m =>
                                            m.id === botMsgId ? { ...m, content: parsed.message || 'Cập nhật thành công!', isStreaming: false } : m
                                        ));
                                        continue;
                                    }
                                } catch (_) { }
                                setAiMessages(prev => prev.map(m =>
                                    m.id === botMsgId ? { ...m, content: data.text, handoff: data.handoff, isStreaming: !data.finish } : m
                                ));
                            }
                        } catch (e) { console.error('Parse error', e); }
                    }
                }
            } catch (error) {
                console.error('AI stream error:', error);
                setAiMessages(prev => prev.map(m =>
                    m.id === botMsgId ? { ...m, content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại!', isStreaming: false } : m
                ));
            } finally {
                setIsSending(false);
            }
        } else {
            // Admin chat
            try {
                const res = await chatService.sendMessage(content);
                if (res.success) fetchAndMarkRead();
            } catch (e) { console.error(e); }
            finally { setIsSending(false); }
        }
    };

    const handleHandoff = async () => {
        setChatMode('ADMIN');
        setIsOpen(true);
        try { await chatbotService.handoff('Người dùng yêu cầu gặp tư vấn viên từ AI chat.'); }
        catch (e) { console.error(e); }
    };

    if (!isAuthenticated) return null;

    const unreadCount = messages.filter(m => !m.isRead && m.sender?.role === 'ADMIN').length;

    return (
        <div className={styles.widget}>
            {/* TOGGLE BUTTON */}
            {!isOpen && (
                <button className={styles.toggleBtn} onClick={() => setIsOpen(true)}>
                    <MessageSquare size={24} />
                    {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                </button>
            )}

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className={styles.window}>
                    {/* HEADER */}
                    <div className={styles.header}>
                        <div style={{ flex: 1 }}>
                            <div className={styles.headerTitle}>Hỗ trợ trực tuyến</div>
                            <div className={styles.headerSub}>
                                <span className={styles.statusIndicator}></span>
                                {chatMode === 'AI' ? 'Chat với AI thông minh' : 'Sẵn sàng hỗ trợ bạn'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {chatMode === 'AI' && (
                                <button
                                    className={styles.iconBtn}
                                    onClick={() => setShowSidebar(v => !v)}
                                    title="Lịch sử cuộc trò chuyện"
                                >
                                    <Clock size={16} />
                                </button>
                            )}
                            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                                <Minus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* MODE TABS */}
                    <div className={styles.modeTabs}>
                        <button className={`${styles.tab} ${chatMode === 'ADMIN' ? styles.activeTab : ''}`} onClick={() => setChatMode('ADMIN')}>
                            <User size={14} className="mr-1" /> Nhân viên
                        </button>
                        <button className={`${styles.tab} ${chatMode === 'AI' ? styles.activeTab : ''}`} onClick={() => setChatMode('AI')}>
                            <Bot size={14} className="mr-1" /> AI Chatbot
                        </button>
                    </div>

                    {/* BODY */}
                    <div className={styles.body}>
                        {/* SIDEBAR (chỉ hiện khi AI mode) */}
                        {chatMode === 'AI' && showSidebar && (
                            <div className={styles.sidebar}>
                                <div className={styles.sidebarHeader}>
                                    <span className={styles.sidebarTitle}>Lịch sử</span>
                                    <button className={styles.newChatBtn} onClick={createNewSession} title="Cuộc trò chuyện mới">
                                        <Plus size={14} /> Mới
                                    </button>
                                </div>
                                <div className={styles.sessionList}>
                                    {loadingSessions ? (
                                        <div className={styles.sessionLoading}>Đang tải...</div>
                                    ) : sessions.length === 0 ? (
                                        <div className={styles.sessionEmpty}>Chưa có cuộc trò chuyện nào</div>
                                    ) : (
                                        sessions.map(session => (
                                            <div
                                                key={session.id}
                                                className={`${styles.sessionItem} ${currentSessionId === session.id ? styles.sessionActive : ''}`}
                                                onClick={() => loadSession(session.id)}
                                            >
                                                <div className={styles.sessionItemContent}>
                                                    <p className={styles.sessionItemTitle}>{session.title}</p>
                                                    <p className={styles.sessionItemTime}>{formatSessionTime(session.updated_at)}</p>
                                                </div>
                                                <button
                                                    className={styles.deleteSessionBtn}
                                                    onClick={(e) => deleteSession(e, session.id)}
                                                    title="Xóa cuộc trò chuyện"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MESSAGES AREA */}
                        <div className={styles.messages} ref={scrollRef}>
                            {(chatMode === 'AI' ? aiMessages : messages).length === 0 ? (
                                <div className={styles.emptyChat}>
                                    {chatMode === 'AI' ? (
                                        <>
                                            <Bot size={32} strokeWidth={1.5} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                                            <p>Xin chào! Tôi là AI của PF Shop.</p>
                                            <p>Hỏi tôi về sản phẩm, đơn hàng hay bất cứ điều gì nhé!</p>
                                        </>
                                    ) : (
                                        <p>Chào mừng! Hãy để lại tin nhắn, chúng tôi sẽ phản hồi sớm nhất.</p>
                                    )}
                                </div>
                            ) : chatMode === 'AI' ? (
                                aiMessages.map((msg) => (
                                    <div key={msg.id} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.ownMessage : ''}`}>
                                        <div className={`${styles.bubble} ${msg.role === 'user' ? styles.ownBubble : styles.otherBubble}`}>
                                            {msg.role === 'bot' ? (
                                                <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                                            ) : msg.content}
                                            {msg.isStreaming && <span className={styles.typingDots}><span /><span /><span /></span>}
                                            {msg.handoff && (
                                                <div className="mt-2 border-t border-zinc-200 pt-2">
                                                    <button onClick={handleHandoff} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                                                        <Headset size={12} /> Kết nối với nhân viên tư vấn
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <span className={styles.time}>
                                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            {msg.role === 'bot' && <span className="ml-2 text-[8px] border border-zinc-300 px-1 rounded">AI</span>}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                messages.map((msg: any) => (
                                    <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender?.role !== 'ADMIN' ? styles.ownMessage : ''}`}>
                                        <div className={`${styles.bubble} ${msg.sender?.role !== 'ADMIN' ? styles.ownBubble : styles.otherBubble}`}>
                                            {msg.sender?.role === 'ADMIN'
                                                ? <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                                                : msg.content}
                                        </div>
                                        <span className={styles.time}>
                                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* INPUT */}
                    <div className={styles.inputArea}>
                        {chatMode === 'AI' && currentSessionId && (
                            <div className={styles.sessionBadge}>
                                <Bot size={10} />
                                {sessions.find(s => s.id === currentSessionId)?.title || 'Cuộc trò chuyện mới'}
                            </div>
                        )}
                        <form className={styles.inputForm} onSubmit={handleSend}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder={chatMode === 'AI' ? 'Hỏi AI bất cứ điều gì...' : 'Nhập tin nhắn...'}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button
                                type="submit"
                                className={`${styles.sendBtn} ${!inputValue.trim() || isSending ? styles.sendBtnDisabled : ''}`}
                                disabled={!inputValue.trim() || isSending}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
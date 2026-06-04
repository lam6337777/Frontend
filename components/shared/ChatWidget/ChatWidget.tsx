'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minus, Bot, User, Headset } from 'lucide-react';
import { useAppSelector } from '@/store/redux/hooks';
import { chatService } from '@/services/chatService';
import { chatbotService } from '@/services/chatbotService';
import { ChatMessage } from '@/types/chat';
import styles from './ChatWidget.module.css';

// Hàm helper để format tin nhắn (Hỗ trợ Bold và List cơ bản)
const formatMessage = (text: string) => {
    if (!text) return '';

    let formatted = text
        // Xử lý in đậm: **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Xử lý in đậm: *text*
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        // Xử lý xuống dòng
        .replace(/\n/g, '<br />');

    // Xử lý danh sách gạch đầu dòng: - item hoặc * item
    const lines = formatted.split('<br />');
    let inList = false;
    const newLines = [];

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) {
                newLines.push('<ul>');
                inList = true;
            }
            newLines.push(`<li>${trimmed.substring(2)}</li>`);
        } else {
            if (inList) {
                newLines.push('</ul>');
                inList = false;
            }
            newLines.push(line);
        }
    }
    if (inList) newLines.push('</ul>');

    return newLines.join('');
};

export default function ChatWidget() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
    const [chatMode, setChatMode] = useState<'ADMIN' | 'AI'>('ADMIN');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isOpenRef = useRef(false); // Ref để SSE closure đọc đúng trạng thái isOpen

    // Giữ isOpenRef đồng bộ với state isOpen
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    // Chỉ fetch lịch sử 1 lần khi mở chat, sau đó SSE sẽ đảm nhận tin nhắn mới
    useEffect(() => {
        if (isAuthenticated && isOpen) {
            fetchAndMarkRead();
        }
    }, [isAuthenticated, isOpen]);

    // Kết nối thời gian thực qua Server-Sent Events (SSE)
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
                    // Nếu chat đang mở và tin nā̀n từ Admin thì tự động đánh dấu đã đọc
                    if (isOpenRef.current && message.sender?.role === 'ADMIN') {
                        chatService.markRead().catch(() => {});
                        setMessages(prev => prev.map(m =>
                            m.sender?.role === 'ADMIN' && !m.isRead ? { ...m, isRead: true } : m
                        ));
                    }
                } catch (error) {
                    console.error('Error parsing SSE chat message:', error);
                }
            });

            eventSource.addEventListener('INIT', (event) => {
                console.log('SSE connection initialized:', event.data);
            });

            eventSource.onerror = (error) => {
                console.error('SSE connection error, attempting to reconnect...', error);
                if (eventSource) {
                    eventSource.close();
                }
                reconnectTimeout = setTimeout(connectSSE, 5000);
            };
        };

        connectSSE();

        return () => {
            if (eventSource) {
                eventSource.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [isAuthenticated]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, aiMessages, chatMode]);

    // Fetch lịch sử tin nhắn (chỉ dùng khi mở chat lần đầu hoặc sau khi gửi)
    const fetchMessages = async () => {
        try {
            const res = await chatService.getMessages();
            if (res.success) {
                setMessages(res.data);
            }
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    // Fetch lịch sử + đánh dấu đã đọc (gọi khi mở chat)
    const fetchAndMarkRead = async () => {
        try {
            const res = await chatService.getMessages();
            if (res.success) {
                setMessages(res.data);
            }
            // Đánh dấu đã đọc trên backend
            await chatService.markRead();
            // Cập nhật local state ngay để badge biến mất
            setMessages(prev => prev.map(m =>
                m.sender?.role === 'ADMIN' && !m.isRead ? { ...m, isRead: true } : m
            ));
        } catch (error) {
            console.error('Error fetching/marking messages:', error);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isSending) return;

        const content = inputValue.trim();
        setInputValue('');
        setIsSending(true);

        if (chatMode === 'AI') {
            const userMsg: ChatMessage = {
                id: Date.now(),
                content,
                sender: { id: user?.id || 0, role: 'CUSTOMER', fullName: user?.fullName || 'Me', email: user?.email || '', isActive: true, createdAt: new Date().toISOString() },
                receiver: { id: 0, role: 'ADMIN', fullName: 'AI', email: '', isActive: true, createdAt: new Date().toISOString() },
                isRead: true,
                createdAt: new Date().toISOString()
            };
            setAiMessages(prev => [...prev, userMsg]);

            // Placeholder cho tin nhắn bot
            const botMsgId = Date.now() + 1;
            const botMsg: ChatMessage = {
                id: botMsgId,
                content: '',
                sender: { id: 0, role: 'ADMIN', fullName: 'AI Chatbot', email: '', isActive: true, createdAt: new Date().toISOString() },
                receiver: { id: user?.id || 0, role: 'CUSTOMER', fullName: user?.fullName || 'Me', email: user?.email || '', isActive: true, createdAt: new Date().toISOString() },
                isRead: true,
                createdAt: new Date().toISOString()
            };
            setAiMessages(prev => [...prev, botMsg]);

            try {
                const response = await fetch(`http://localhost:8000/api/chat/stream?message=${encodeURIComponent(content)}`);
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) throw new Error('No reader');

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.text !== undefined) {
                                    setAiMessages(prev => prev.map(m =>
                                        m.id === botMsgId ? { ...m, content: data.text, handoff: data.handoff } : m
                                    ));
                                }
                            } catch (e) {
                                console.error('Error parsing stream chunk', e);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error with AI chatbot streaming:', error);
                setAiMessages(prev => prev.map(m =>
                    m.id === botMsgId ? { ...m, content: 'Xin lỗi, tôi đang gặp chút sự cố kết nối. Bạn vui lòng thử lại nhé!' } : m
                ));
            } finally {
                setIsSending(false);
            }
        } else {
            try {
                const res = await chatService.sendMessage(content);
                if (res.success) {
                    // Dùng fetchAndMarkRead để đồng bộ cả tin nhắn và trạng thái đã đọc
                    fetchAndMarkRead();
                }
            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                setIsSending(false);
            }
        }
    };

    const handleHandoff = async () => {
        setChatMode('ADMIN');
        setIsOpen(true);
        try {
            await chatbotService.handoff('Người dùng yêu cầu gặp tư vấn viên từ AI chat.');
            // Tự động gửi tin nhắn chào mừng từ phía admin hoặc thông báo chờ
        } catch (error) {
            console.error('Handoff failed:', error);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className={styles.widget}>
            {/* TOGGLE BUTTON */}
            {!isOpen && (
                <button className={styles.toggleBtn} onClick={() => setIsOpen(true)}>
                    <MessageSquare size={24} />
                    {messages.filter(m => !m.isRead && m.sender?.role === 'ADMIN').length > 0 && (
                        <span className={styles.badge}>
                            {messages.filter(m => !m.isRead && m.sender?.role === 'ADMIN').length}
                        </span>
                    )}
                </button>
            )}

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className={styles.window}>
                    <div className={styles.header}>
                        <div style={{ flex: 1 }}>
                            <div className={styles.headerTitle}>Hỗ trợ trực tuyến</div>
                            <div className={styles.headerSub}>
                                <span className={styles.statusIndicator}></span>
                                {chatMode === 'AI' ? 'Chat với AI thông minh' : 'Sẵn sàng hỗ trợ bạn'}
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <Minus size={20} />
                        </button>
                    </div>

                    <div className={styles.modeTabs}>
                        <button
                            className={`${styles.tab} ${chatMode === 'ADMIN' ? styles.activeTab : ''}`}
                            onClick={() => setChatMode('ADMIN')}
                        >
                            <User size={14} className="mr-1" />
                            Nhân viên
                        </button>
                        <button
                            className={`${styles.tab} ${chatMode === 'AI' ? styles.activeTab : ''}`}
                            onClick={() => setChatMode('AI')}
                        >
                            <Bot size={14} className="mr-1" />
                            AI Chatbot
                        </button>
                    </div>

                    <div className={styles.messages} ref={scrollRef}>
                        {(chatMode === 'AI' ? aiMessages : messages).length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {chatMode === 'AI'
                                        ? 'Chào tôi đi! Tôi là AI sẵn sàng giải đáp thắc mắc về sản phẩm và đơn hàng.'
                                        : 'Chào mừng! Hãy để lại tin nhắn, chúng tôi sẽ phản hồi sớm nhất.'}
                                </p>
                            </div>
                        ) : (
                            (chatMode === 'AI' ? aiMessages : messages).map((msg: any) => (
                                <div
                                    key={msg.id}
                                    className={`${styles.messageWrapper} ${msg.sender?.role !== 'ADMIN' ? styles.ownMessage : ''}`}
                                >
                                    <div className={`${styles.bubble} ${msg.sender?.role !== 'ADMIN' ? styles.ownBubble : styles.otherBubble}`}>
                                        {msg.sender === 'ADMIN' || msg.sender?.role === 'ADMIN' ? (
                                            <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                                        ) : (
                                            msg.content
                                        )}
                                        {msg.handoff && (
                                            <div className="mt-2 border-t border-zinc-200 pt-2">
                                                <button
                                                    onClick={handleHandoff}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                                                >
                                                    <Headset size={12} />
                                                    Kết nối với nhân viên tư vấn
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <span className={styles.time}>
                                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        {msg.sender?.fullName === 'AI Chatbot' && <span className="ml-2 text-[8px] border border-zinc-300 px-1 rounded">AI</span>}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.inputArea}>
                        <form className={styles.inputForm} onSubmit={handleSend}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Nhập tin nhắn..."
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

/**
 * Client cho chatbot AI (FastAPI, mặc định cổng 8000).
 * Xác thực bằng JWT của storefront qua header Authorization — chatbot tự hỏi backend người dùng là ai.
 */
export const CHATBOT_URL = (process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface AIProduct {
    id: string;
    name: string;
    price: number;
    originalPrice: number | null;
    image: string | null;
    category: string | null;
    rating: number;
    sizesInStock: string[];
    sizeStock?: number;
    url: string;
}

export interface AISession {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface AIStoredMessage {
    id: number;
    role: 'user' | 'bot';
    content: string;
    created_at: string;
    products: AIProduct[] | null;
    handoff: boolean;
}

export type AIStreamEvent =
    | { type: 'session'; id: number; title: string }
    | { type: 'meta'; intent: string }
    | { type: 'delta'; text: string }
    | { type: 'products'; items: AIProduct[] }
    | { type: 'handoff' }
    | { type: 'done'; message_id: number | null };

function headers(json = false): HeadersInit {
    const h: Record<string, string> = {};
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) h.Authorization = `Bearer ${token}`;
    if (json) h['Content-Type'] = 'application/json';
    return h;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${CHATBOT_URL}${path}`, { ...init, headers: { ...headers(!!init.body), ...(init.headers || {}) } });
    if (!res.ok) throw new Error(`Chatbot ${res.status}`);
    return res.json();
}

export const aiChatService = {
    listSessions: () => request<{ sessions: AISession[] }>('/api/chat/sessions').then((r) => r.sessions),
    messages: (id: number) => request<{ messages: AIStoredMessage[] }>(`/api/chat/session/${id}/messages`).then((r) => r.messages),
    rename: (id: number, title: string) => request(`/api/chat/session/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }),
    remove: (id: number) => request(`/api/chat/session/${id}`, { method: 'DELETE' }),

    /** Gửi câu hỏi và nhận từng sự kiện SSE qua callback. */
    async stream(message: string, sessionId: number | null, onEvent: (e: AIStreamEvent) => void, signal?: AbortSignal) {
        const res = await fetch(`${CHATBOT_URL}/api/chat/stream`, {
            method: 'POST',
            headers: headers(true),
            body: JSON.stringify({ message, session_id: sessionId }),
            signal,
        });
        if (res.status === 429) throw new Error('rate');
        if (!res.ok || !res.body) throw new Error(`Chatbot ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            // Sự kiện SSE kết thúc bằng dòng trống; giữ phần dở dang cho lần đọc sau
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';
            for (const part of parts) {
                const line = part.trim();
                if (!line.startsWith('data: ')) continue;
                try {
                    onEvent(JSON.parse(line.slice(6)));
                } catch {
                    /* bỏ qua dòng hỏng */
                }
            }
        }
    },
};

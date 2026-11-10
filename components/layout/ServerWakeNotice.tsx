'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SERVER_READY_EVENT, SERVER_SLOW_EVENT } from '@/lib/apiClient';

/** Thông báo khi máy chủ (gói free) đang khởi động lại sau thời gian không dùng. */
export function ServerWakeNotice() {
    const [slow, setSlow] = useState(false);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const onSlow = () => setSlow(true);
        const onReady = () => setSlow(false);
        window.addEventListener(SERVER_SLOW_EVENT, onSlow);
        window.addEventListener(SERVER_READY_EVENT, onReady);
        return () => {
            window.removeEventListener(SERVER_SLOW_EVENT, onSlow);
            window.removeEventListener(SERVER_READY_EVENT, onReady);
        };
    }, []);

    useEffect(() => {
        if (!slow) {
            setSeconds(0);
            return;
        }
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, [slow]);

    if (!slow) return null;
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-x-3 top-3 z-[80] mx-auto flex max-w-md animate-fade-up items-start gap-3 rounded-2xl bg-ink/90 px-4 py-3 text-sm text-white shadow-lift backdrop-blur sm:top-auto sm:bottom-5"
        >
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-brand-300" />
            <div>
                <p className="font-semibold">Máy chủ đang khởi động…</p>
                <p className="mt-0.5 text-white/80">
                    Shop dùng máy chủ miễn phí nên sau một thời gian không ai truy cập sẽ tạm nghỉ. Lần mở đầu tiên cần
                    khoảng 1 phút, anh/chị vui lòng chờ chút nhé{seconds >= 5 ? ` (${seconds}s)` : ''}.
                </p>
            </div>
        </div>
    );
}

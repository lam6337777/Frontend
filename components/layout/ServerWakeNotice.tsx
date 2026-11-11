'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SERVER_READY_EVENT, SERVER_SLOW_EVENT } from '@/lib/apiClient';
import { useT } from '@/lib/i18n/client';

/** Thông báo khi máy chủ (gói free) đang khởi động lại sau thời gian không dùng. */
export function ServerWakeNotice() {
    const t = useT();
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
            className="fixed inset-x-3 top-3 z-[80] mx-auto flex max-w-md animate-fade-up items-start gap-3 rounded-2xl bg-night/90 px-4 py-3 text-sm text-white shadow-lift backdrop-blur sm:top-auto sm:bottom-5"
        >
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-brand-300" />
            <div>
                <p className="font-semibold">{t('server.wakingTitle')}</p>
                <p className="mt-0.5 text-white/80">
                    {t('server.wakingBody')}
                    {seconds >= 5 ? ` (${seconds}s)` : ''}.
                </p>
            </div>
        </div>
    );
}

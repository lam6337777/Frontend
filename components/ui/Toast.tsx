'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {});

export const useToast = () => useContext(ToastContext);

const ICON = { success: CheckCircle2, error: AlertCircle, info: Info };
const TONE = {
    success: 'text-brand-600',
    error: 'text-coral-500',
    info: 'text-sky-600',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const tr = useT();
    const [items, setItems] = useState<ToastItem[]>([]);

    const show = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now() + Math.random();
        setItems((prev) => [...prev.slice(-2), { id, type, message }]);
        setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
    }, []);

    return (
        <ToastContext.Provider value={show}>
            {children}
            <div
                className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
                role="status"
                aria-live="polite"
            >
                {items.map((t) => {
                    const Icon = ICON[t.type];
                    return (
                        <div
                            key={t.id}
                            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl bg-surface px-4 py-3 text-sm shadow-lift ring-1 ring-line"
                        >
                            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', TONE[t.type])} aria-hidden />
                            <p className="flex-1 font-medium text-ink">{t.message}</p>
                            <button
                                onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                                className="text-muted hover:text-ink"
                                aria-label={tr('common.close')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

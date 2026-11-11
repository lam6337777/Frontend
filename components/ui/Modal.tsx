'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const WIDTH = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-5xl' };

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
    const t = useT();
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-night/40 backdrop-blur-[2px]" onClick={onClose} />
            <div
                className={cn(
                    'relative flex max-h-[92dvh] w-full animate-fade-up flex-col rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-lift sm:rounded-3xl sm:pb-0',
                    WIDTH[size]
                )}
            >
                {title && (
                    <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
                        <h2 className="text-lg font-bold">{title}</h2>
                        <button onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-mint-100 hover:text-ink" aria-label={t('common.close')}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}
                <div className="overflow-y-auto px-6 py-5">{children}</div>
                {footer && <div className="flex justify-end gap-3 border-t border-line px-6 py-4">{footer}</div>}
            </div>
        </div>
    );
}

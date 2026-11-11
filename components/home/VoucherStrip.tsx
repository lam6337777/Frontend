'use client';

import { useState } from 'react';
import { Check, Copy, Ticket } from 'lucide-react';
import { Voucher } from '@/types/promotion';
import { formatDate, formatVND } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/client';
import type { TFn } from '@/lib/i18n/core';

export function voucherHeadline(v: Voucher, t: TFn) {
    return v.discountType === 'PERCENT' ? t('home.voucherPercent', { v: v.discountValue }) : t('home.voucherFixed', { v: formatVND(v.discountValue) });
}

export function voucherCondition(v: Voucher, t: TFn) {
    const parts = [];
    if (v.minOrderValue > 0) parts.push(t('home.voucherMin', { v: formatVND(v.minOrderValue) }));
    if (v.discountType === 'PERCENT' && v.maxDiscount) parts.push(t('home.voucherMax', { v: formatVND(v.maxDiscount) }));
    return parts.join(', ') || t('home.voucherAny');
}

/** Thẻ voucher dạng vé, có nút sao chép mã */
export function VoucherTicket({ v, action }: { v: Voucher; action?: React.ReactNode }) {
    const { t, locale } = useI18n();
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(v.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // trình duyệt không cho phép clipboard
        }
    };
    const left = v.usageLimit ? Math.max(0, v.usageLimit - v.usedCount) : null;

    return (
        <div className="relative flex min-w-[280px] overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-brand-100">
            <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 bg-gradient-to-b from-brand-500 to-brand-600 p-3 text-white">
                <Ticket className="h-6 w-6" />
                <span className="text-center text-[11px] font-bold leading-tight">{voucherHeadline(v, t)}</span>
            </div>
            {/* răng cưa vé */}
            <span className="absolute left-[88px] top-[-8px] h-4 w-4 rounded-full bg-mint-50" />
            <span className="absolute bottom-[-8px] left-[88px] h-4 w-4 rounded-full bg-mint-50" />
            <div className="flex flex-1 flex-col justify-between gap-2 p-3 pl-5">
                <div>
                    <p className="text-sm font-bold">{(locale === 'vi' && v.description) || voucherHeadline(v, t)}</p>
                    <p className="mt-0.5 text-xs text-muted">{voucherCondition(v, t)}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] text-muted">
                        {v.endAt && <p>{locale === 'vi' ? 'HSD' : 'Expires'}: {formatDate(v.endAt)}</p>}
                        {left !== null && <p>{t('home.voucherLeft', { n: left })}</p>}
                    </div>
                    {action ?? (
                        <button
                            onClick={copy}
                            className="flex min-h-9 items-center gap-1 rounded-lg border border-dashed border-brand-400 px-2.5 py-1.5 font-mono text-xs font-bold text-brand-700 hover:bg-brand-50"
                            aria-label={copied ? t('home.copied', { code: v.code }) : t('home.copyCode', { code: v.code })}
                        >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {v.code}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export function VoucherStrip({ vouchers }: { vouchers: Voucher[] }) {
    const { t } = useI18n();
    if (!vouchers.length) return null;
    return (
        <section className="container-page mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold tracking-tight md:text-2xl">
                <Ticket className="h-6 w-6 text-brand-500" /> {t('home.vouchersTitle')}
            </h2>
            <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                {vouchers.map((v) => (
                    <VoucherTicket key={v.id} v={v} />
                ))}
            </div>
        </section>
    );
}

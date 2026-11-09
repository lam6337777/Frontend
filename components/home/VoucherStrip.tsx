'use client';

import { useState } from 'react';
import { Check, Copy, Ticket } from 'lucide-react';
import { Voucher } from '@/types/promotion';
import { formatDate, formatVND } from '@/lib/utils';

export function voucherHeadline(v: Voucher) {
    return v.discountType === 'PERCENT' ? `Giảm ${v.discountValue}%` : `Giảm ${formatVND(v.discountValue)}`;
}

export function voucherCondition(v: Voucher) {
    const parts = [];
    if (v.minOrderValue > 0) parts.push(`Đơn từ ${formatVND(v.minOrderValue)}`);
    if (v.discountType === 'PERCENT' && v.maxDiscount) parts.push(`tối đa ${formatVND(v.maxDiscount)}`);
    return parts.join(', ') || 'Mọi đơn hàng';
}

/** Thẻ voucher dạng vé, có nút sao chép mã */
export function VoucherTicket({ v, action }: { v: Voucher; action?: React.ReactNode }) {
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
        <div className="relative flex min-w-[280px] overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-100">
            <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 bg-gradient-to-b from-brand-500 to-brand-600 p-3 text-white">
                <Ticket className="h-6 w-6" />
                <span className="text-center text-[11px] font-bold leading-tight">{voucherHeadline(v)}</span>
            </div>
            {/* răng cưa vé */}
            <span className="absolute left-[88px] top-[-8px] h-4 w-4 rounded-full bg-mint-50" />
            <span className="absolute bottom-[-8px] left-[88px] h-4 w-4 rounded-full bg-mint-50" />
            <div className="flex flex-1 flex-col justify-between gap-2 p-3 pl-5">
                <div>
                    <p className="text-sm font-bold">{v.description || voucherHeadline(v)}</p>
                    <p className="mt-0.5 text-xs text-muted">{voucherCondition(v)}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] text-muted">
                        {v.endAt && <p>HSD: {formatDate(v.endAt)}</p>}
                        {left !== null && <p>Còn {left} lượt</p>}
                    </div>
                    {action ?? (
                        <button
                            onClick={copy}
                            className="flex items-center gap-1 rounded-lg border border-dashed border-brand-400 px-2.5 py-1.5 font-mono text-xs font-bold text-brand-700 hover:bg-brand-50"
                            aria-label={`Sao chép mã ${v.code}`}
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
    if (!vouchers.length) return null;
    return (
        <section className="container-page mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold tracking-tight md:text-2xl">
                <Ticket className="h-6 w-6 text-brand-500" /> Mã giảm giá cho bạn
            </h2>
            <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                {vouchers.map((v) => (
                    <VoucherTicket key={v.id} v={v} />
                ))}
            </div>
        </section>
    );
}

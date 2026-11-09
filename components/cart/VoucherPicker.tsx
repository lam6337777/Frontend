'use client';

import { useEffect, useState } from 'react';
import { Check, Ticket, X } from 'lucide-react';
import { promotionService } from '@/services/promotionService';
import { Voucher, VoucherCheck } from '@/types/promotion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { VoucherTicket, voucherCondition } from '@/components/home/VoucherStrip';
import { errorMessage, formatVND } from '@/lib/utils';

const KEY = 'pf:voucher';

export const savedVoucherCode = () => {
    try {
        return sessionStorage.getItem(KEY) || '';
    } catch {
        return '';
    }
};
const saveVoucherCode = (code: string) => {
    try {
        if (code) sessionStorage.setItem(KEY, code);
        else sessionStorage.removeItem(KEY);
    } catch {
        // bỏ qua
    }
};

/**
 * Nhập/chọn mã giảm giá. Số tiền giảm luôn do backend tính (API /vouchers/check),
 * mã đã áp dụng được nhớ trong phiên để chuyển từ giỏ hàng sang trang thanh toán.
 */
export function VoucherPicker({
    subtotal,
    applied,
    onChange,
}: {
    subtotal: number;
    applied: VoucherCheck | null;
    onChange: (v: VoucherCheck | null) => void;
}) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [list, setList] = useState<Voucher[]>([]);

    const apply = async (c: string, silent = false) => {
        const value = c.trim();
        if (!value) return;
        setLoading(true);
        setError('');
        try {
            const res = await promotionService.checkVoucher(value, subtotal);
            onChange(res.data);
            saveVoucherCode(res.data.code);
            setCode('');
            setOpen(false);
        } catch (e) {
            onChange(null);
            saveVoucherCode('');
            if (!silent) setError(errorMessage(e, 'Mã giảm giá không hợp lệ'));
        } finally {
            setLoading(false);
        }
    };

    // Áp lại mã đã lưu, và tính lại khi tổng tiền thay đổi
    useEffect(() => {
        const saved = applied?.code || savedVoucherCode();
        if (saved && subtotal > 0) apply(saved, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subtotal]);

    const openList = async () => {
        setOpen(true);
        if (!list.length) {
            try {
                setList((await promotionService.getAvailableVouchers()).data || []);
            } catch {
                setList([]);
            }
        }
    };

    const remove = () => {
        onChange(null);
        saveVoucherCode('');
    };

    return (
        <div>
            {applied ? (
                <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-3 ring-1 ring-brand-200">
                    <Ticket className="h-5 w-5 shrink-0 text-brand-600" />
                    <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm font-bold text-brand-800">{applied.code}</p>
                        <p className="text-xs text-brand-700">Giảm {formatVND(applied.discountAmount)}</p>
                    </div>
                    <button onClick={remove} className="rounded-full p-1 text-brand-700 hover:bg-brand-100" aria-label="Bỏ mã giảm giá">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <>
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply(code);
                        }}
                    >
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã giảm giá"
                            className="input font-mono uppercase"
                            aria-label="Mã giảm giá"
                            aria-invalid={!!error}
                        />
                        <Button type="submit" variant="dark" loading={loading} disabled={!code.trim()}>
                            Áp dụng
                        </Button>
                    </form>
                    {error && <p className="mt-1.5 text-xs font-medium text-coral-600">{error}</p>}
                </>
            )}
            <button onClick={openList} className="mt-2 flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                <Ticket className="h-4 w-4" /> Chọn mã có sẵn
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="Mã giảm giá khả dụng">
                {list.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted">Hiện chưa có mã giảm giá nào.</p>
                ) : (
                    <div className="space-y-3">
                        {list.map((v) => {
                            const eligible = subtotal >= v.minOrderValue;
                            return (
                                <div key={v.id} className={eligible ? '' : 'opacity-50'}>
                                    <VoucherTicket
                                        v={v}
                                        action={
                                            applied?.code === v.code ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-brand-600">
                                                    <Check className="h-4 w-4" /> Đang dùng
                                                </span>
                                            ) : (
                                                <Button size="sm" disabled={!eligible} loading={loading} onClick={() => apply(v.code)}>
                                                    Dùng
                                                </Button>
                                            )
                                        }
                                    />
                                    {!eligible && (
                                        <p className="mt-1 text-xs text-coral-600">
                                            Mua thêm {formatVND(v.minOrderValue - subtotal)} để dùng ({voucherCondition(v)})
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                {error && <p className="mt-3 text-sm font-medium text-coral-600">{error}</p>}
            </Modal>
        </div>
    );
}

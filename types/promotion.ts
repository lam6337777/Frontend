export interface Voucher {
    id: number;
    code: string;
    description: string | null;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    maxDiscount: number | null;
    minOrderValue: number;
    startAt: string | null;
    endAt: string | null;
    usageLimit: number | null;
    usedCount: number;
}

export interface VoucherCheck {
    code: string;
    description: string | null;
    discountAmount: number;
}

export interface ShippingQuote {
    province: string | null;
    fee: number;
    estimatedDays: string;
    freeShippingThreshold: number;
    freeShipping: boolean;
}

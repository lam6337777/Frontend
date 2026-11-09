import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { ShippingQuote, Voucher, VoucherCheck } from '@/types/promotion';

export const promotionService = {
    getAvailableVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
        const response = await apiClient.get<ApiResponse<Voucher[]>>('/vouchers/available');
        return response.data;
    },

    checkVoucher: async (code: string, subtotal: number): Promise<ApiResponse<VoucherCheck>> => {
        const response = await apiClient.get<ApiResponse<VoucherCheck>>('/vouchers/check', {
            params: { code, subtotal },
        });
        return response.data;
    },

    quoteShipping: async (province: string | undefined, subtotal: number): Promise<ApiResponse<ShippingQuote>> => {
        const response = await apiClient.get<ApiResponse<ShippingQuote>>('/shipping/quote', {
            params: { province, subtotal },
        });
        return response.data;
    },
};

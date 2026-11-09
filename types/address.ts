/** Địa chỉ theo cấu trúc hành chính 2 cấp (Tỉnh/Thành → Phường/Xã), áp dụng từ 01/07/2025 */
export interface Address {
    id: number;
    fullName: string;
    phoneNumber: string;
    province: string;
    ward: string;
    addressDetail: string;
    isDefault: boolean;
}

export interface AddressRequest {
    fullName: string;
    phoneNumber: string;
    province: string;
    ward: string;
    addressDetail: string;
    isDefault?: boolean;
}

export function formatAddress(a: Pick<Address, 'addressDetail' | 'ward' | 'province'>) {
    return [a.addressDetail, a.ward, a.province].filter(Boolean).join(', ');
}

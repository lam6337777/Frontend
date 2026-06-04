export interface Address {
    id: number;
    fullName: string;
    phoneNumber: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    isDefault: boolean;
}

export interface AddressRequest {
    fullName: string;
    phoneNumber: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    isDefault?: boolean;
}

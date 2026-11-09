export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURN_REQUESTED = 'RETURN_REQUESTED',
    RETURNED = 'RETURNED',
    PARTIALLY_RETURNED = 'PARTIALLY_RETURNED',
    EXCHANGE_REQUESTED = 'EXCHANGE_REQUESTED',
    EXCHANGED = 'EXCHANGED',
    WARRANTY_REQUESTED = 'WARRANTY_REQUESTED',
    WARRANTY_REPAIRING = 'WARRANTY_REPAIRING',
    WARRANTY_COMPLETED = 'WARRANTY_COMPLETED',
}

export type PaymentMethod = 'COD' | 'VNPAY';

export interface OrderRequest {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    province: string;
    voucherCode?: string;
    paymentMethod: PaymentMethod;
    note?: string;
}

export enum OrderItemStatus {
    ACTIVE = 'ACTIVE',
    RETURN_REQUESTED = 'RETURN_REQUESTED',
    RETURNED = 'RETURNED',
    EXCHANGE_REQUESTED = 'EXCHANGE_REQUESTED',
    EXCHANGED = 'EXCHANGED',
    WARRANTY_REQUESTED = 'WARRANTY_REQUESTED',
    WARRANTY_REPAIRING = 'WARRANTY_REPAIRING',
    WARRANTY_COMPLETED = 'WARRANTY_COMPLETED',
}

export interface OrderItemResponse {
    id: number;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl?: string | null;
    productId: string;
    status?: OrderItemStatus;
    isReviewed?: boolean;
}

export interface StatusHistory {
    status: OrderStatus;
    note: string | null;
    createdAt: string;
}

export interface OrderResponse {
    id: number;
    orderCode: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: string;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    voucherCode: string | null;
    totalAmount: number;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    note?: string;
    createdAt: string;
    deliveredAt: string | null;
    items: OrderItemResponse[];
    statusHistory: StatusHistory[];
}

export enum ReturnRequestType {
    RETURN = 'RETURN',
    EXCHANGE = 'EXCHANGE',
    WARRANTY = 'WARRANTY',
}

export interface ReturnRequestRequest {
    orderCode: string;
    type: ReturnRequestType;
    reason: string;
    orderItemIds: number[];
    exchangeVariantId?: number;
}

export interface ReturnRequestResponse {
    id: number;
    orderCode: string;
    type: ReturnRequestType;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminNote?: string | null;
    createdAt: string;
    returnItems?: { id: number; productName: string; size: string; color: string; quantity: number }[];
}

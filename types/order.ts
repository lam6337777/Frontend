export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURN_REQUESTED = 'RETURN_REQUESTED',
    RETURNED = 'RETURNED'
}

export interface OrderRequest {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    paymentMethod: 'COD';
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
    WARRANTY_COMPLETED = 'WARRANTY_COMPLETED'
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

export interface OrderResponse {
    id: number;
    orderCode: string;
    status: OrderStatus;
    paymentMethod: 'COD';
    paymentStatus: string;
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    note?: string;
    createdAt: string;
    items: OrderItemResponse[];

}

export enum ReturnRequestType {
    RETURN = 'RETURN',
    EXCHANGE = 'EXCHANGE',
    WARRANTY = 'WARRANTY'
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
    status: string;
    adminNote?: string;
    createdAt: string;
}

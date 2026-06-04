export interface CartRequest {
    variantId: number;
    quantity: number;
}

export interface CartItemResponse {
    id: number;
    variantId: number;
    productName: string;
    productSlug: string;
    primaryImageUrl?: string | null;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;      // giá đơn vị
    totalPrice: number;     // giá * số lượng
    stockQuantity: number;  // tồn kho
}

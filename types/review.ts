export interface ReviewResponse {
    id: number;
    fullName: string;
    avatarUrl: string | null;
    productId: string;
    productName: string;
    orderCode: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface CreateReviewRequest {
    productId: string;
    orderId: number;
    rating: number;
    comment: string;
}

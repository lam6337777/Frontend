export interface ReviewResponse {
    id: number;
    fullName: string;
    avatarUrl: string | null;
    productId: string;
    productName: string;
    orderCode: string;
    rating: number;
    comment: string;
    variantSize?: string | null;
    variantColor?: string | null;
    createdAt: string;
}

export interface ReviewSummary {
    average: number;
    total: number;
    withComment: number;
    /** số đánh giá theo mức sao: { "5": 12, "4": 3, ... } */
    counts: Record<string, number>;
}

export interface CreateReviewRequest {
    productId: string;
    orderId: number;
    rating: number;
    comment: string;
}

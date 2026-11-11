import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { ReviewResponse, CreateReviewRequest, ReviewSummary } from '@/types/review';
import { Page } from '@/types/product';

export const reviewService = {
    getProductReviews: async (productId: string, page = 0, size = 10, filter: { rating?: number; withComment?: boolean } = {}) => {
        const response = await apiClient.get<ApiResponse<Page<ReviewResponse>>>(`/reviews/product/${productId}`, {
            params: { page, size, ...(filter.rating ? { rating: filter.rating } : {}), ...(filter.withComment ? { withComment: true } : {}) }
        });
        return response.data;
    },

    getProductReviewSummary: async (productId: string) => {
        const response = await apiClient.get<ApiResponse<ReviewSummary>>(`/reviews/product/${productId}/summary`);
        return response.data;
    },

    createReview: async (data: CreateReviewRequest) => {
        const response = await apiClient.post<ApiResponse<ReviewResponse>>('/reviews', null, {
            params: {
                productId: data.productId,
                orderId: data.orderId,
                rating: data.rating,
                comment: data.comment
            }
        });
        return response.data;
    }
};

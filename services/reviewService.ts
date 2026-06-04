import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { ReviewResponse, CreateReviewRequest } from '@/types/review';
import { Page } from '@/types/product';

export const reviewService = {
    getProductReviews: async (productId: string, page = 0, size = 10) => {
        const response = await apiClient.get<ApiResponse<Page<ReviewResponse>>>(`/reviews/product/${productId}`, {
            params: { page, size }
        });
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

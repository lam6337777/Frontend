import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/common';
import { ChatMessage } from '@/types/chat';

export const chatService = {
    getMessages: async (): Promise<ApiResponse<ChatMessage[]>> => {
        // Đối với Customer, backend tự động lấy tin nhắn của họ khi truyền otherId bất kỳ (hoặc 0)
        const response = await apiClient.get<ApiResponse<ChatMessage[]>>('/chat/messages/0');
        return response.data;
    },

    sendMessage: async (content: string): Promise<ApiResponse<ChatMessage>> => {
        // receiverId=0 để backend tự động tìm Admin đầu tiên
        const response = await apiClient.post<ApiResponse<ChatMessage>>(`/chat/send?receiverId=0`, content, {
            headers: { 'Content-Type': 'text/plain' }
        });
        return response.data;
    },

    markRead: async (): Promise<ApiResponse<string>> => {
        const response = await apiClient.post<ApiResponse<string>>('/chat/read');
        return response.data;
    }
};

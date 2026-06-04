import { UserResponse } from "./user";

export interface ChatMessage {
    id: number;
    sender: UserResponse;
    receiver: UserResponse;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export interface SendMessageRequest {
    receiverId: number;
    content: string;
}

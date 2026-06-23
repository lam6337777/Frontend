import { UserResponse } from "./user";

export interface ChatMessage {
    id: number;
    sender: UserResponse;
    receiver: UserResponse;
    content: string;
    isRead: boolean;
    createdAt: string;
    rawData?: any[];
    handoff?: boolean;
}

export interface SendMessageRequest {
    receiverId: number;
    content: string;
}

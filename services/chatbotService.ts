import axios from 'axios';

const CHATBOT_API_URL = 'http://localhost:8000/api';

export const chatbotService = {
    sendMessage: async (message: string, history: string = "") => {
        try {
            const response = await axios.post(`${CHATBOT_API_URL}/chat`, {
                message,
                history
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            throw error;
        }
    },
    
    handoff: async (message: string) => {
        try {
            const response = await axios.post(`${CHATBOT_API_URL}/handoff`, {
                message
            });
            return response.data;
        } catch (error) {
            console.error('Error in human handoff:', error);
            throw error;
        }
    }
};

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Headset } from 'lucide-react';
import Link from 'next/link';

interface ProductSummary {
  id: string | number;
  name: string;
  image_url?: string;
  primaryImageUrl?: string;
  price?: number;
  sale_price?: number;
  original_price?: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  handoff?: boolean;
  products?: ProductSummary[];
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Chào bạn! Mình là trợ lý ảo của PF Shoe. Mình có thể giúp gì cho bạn?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });

      const data = await response.json();
      
      let extractedProducts: ProductSummary[] = [];
      try {
        let rawData = data.raw_data;
        if (typeof rawData === 'string' && rawData.trim() !== '') {
          rawData = JSON.parse(rawData);
        }
        
        if (rawData && Array.isArray(rawData)) {
          extractedProducts = rawData.filter((item: any) => item.id && item.name && (item.image_url || item.primaryImageUrl));
        } else if (rawData && typeof rawData === 'object' && rawData.id) {
          extractedProducts = [rawData];
        }
      } catch (e) {
        console.error("Lỗi parse raw_data:", e);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        sender: 'bot',
        handoff: data.handoff,
        products: extractedProducts.length > 0 ? extractedProducts : undefined
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Rất tiếc, đã có lỗi xảy ra. Bạn vui lòng thử lại sau nhé!',
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHandoff = async () => {
    setIsLoading(true);
    try {
      await fetch('http://localhost:8000/api/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Yêu cầu kết nối tư vấn viên" })
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Dạ, yêu cầu của bạn đã được gửi. Tư vấn viên sẽ phản hồi bạn trong giây lát!',
        sender: 'bot'
      }]);
    } catch (error) {
      console.error("Handoff failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold">PF Assistant</h3>
                <p className="text-xs text-blue-100 italic">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                      msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      {msg.text}
                      
                      {msg.products && msg.products.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto py-2 mt-2 hide-scrollbar max-w-[280px]">
                          {msg.products.map(product => {
                            const imgUrl = product.image_url || product.primaryImageUrl || '/placeholder.png';
                            const price = product.sale_price || product.price || product.original_price;
                            return (
                              <Link 
                                key={product.id} 
                                href={`/products/${product.id}`} 
                                className="block border rounded-lg p-2 min-w-[130px] max-w-[130px] bg-white shadow-sm hover:shadow-md transition shrink-0 text-gray-800"
                              >
                                <img src={imgUrl} alt={product.name} className="w-full h-20 object-cover rounded-md mb-2" />
                                <p className="text-xs font-semibold truncate" title={product.name}>{product.name}</p>
                                {price && <p className="text-xs text-red-500 font-bold mt-1">{Number(price).toLocaleString('vi-VN')}đ</p>}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    {msg.handoff && (
                      <button 
                        onClick={handleHandoff}
                        className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <Headset size={14} />
                        Kết nối với tư vấn viên
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%] items-end">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl border border-gray-100 flex gap-1 items-center rounded-tl-none shadow-sm">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600'
        }`}
      >
        {isOpen ? <X className="text-white" /> : <MessageCircle className="text-white" size={28} />}
      </button>
    </div>
  );
};

export default ChatWidget;

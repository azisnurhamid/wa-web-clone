import { useCallback } from 'react';
import { ChatSession, Message } from '../types';
import { generateAIResponse } from '../services/simulationUtils';
import { getRandomInt } from '../utils/helpers';

interface UseChatLogicProps {
  chats: ChatSession[];
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  activeChatId: string | null;
  setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>;
  isInteractionLocked: boolean;
}

export const useChatLogic = ({
  chats,
  setChats,
  activeChatId,
  setActiveChatId,
  isInteractionLocked
}: UseChatLogicProps) => {

  const handleSendMessage = useCallback((text: string) => {
    if (!activeChatId) return;

    const currentChat = chats.find(c => c.id === activeChatId);
    if (!currentChat) return;

    const newMessage: Message = {
      id: `new_${Date.now()}`,
      text: text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
      isMine: true,
      status: 'sent',
    };

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, newMessage],
      lastMessage: text,
      lastMessageTime: newMessage.timestamp,
      archived: false
    };

    setChats(prev => prev.map(c => c.id === activeChatId ? updatedChat : c));
    
    const isSecretChat = currentChat.id === 'chat_secret_1' || currentChat.user.name === '???';
    
    const currentHour = new Date().getHours();
    
    let minDelay = 1000;
    let maxDelay = 4000;
    
    if (currentHour >= 23 || currentHour < 6) {
      minDelay = 4000;
      maxDelay = 8000;
    } else if (currentHour >= 6 && currentHour < 9) {
      minDelay = 2000;
      maxDelay = 5000;
    } else if (currentHour >= 12 && currentHour < 14) {
      minDelay = 2000;
      maxDelay = 5000;
    }
    
    const responseDelay = getRandomInt(minDelay, maxDelay);
    
    setTimeout(() => {
      const aiResponseText = generateAIResponse(text, isSecretChat);
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
        isMine: false,
        status: 'delivered',
      };
      
      setChats(prev => {
        const chat = prev.find(c => c.id === activeChatId);
        if (!chat) return prev;
        
        const updatedChatWithAI = {
          ...chat,
          messages: [...chat.messages, aiMessage],
          lastMessage: aiResponseText,
          lastMessageTime: aiMessage.timestamp,
        };
        
        return prev.map(c => c.id === activeChatId ? updatedChatWithAI : c);
      });
    }, responseDelay);
  }, [activeChatId, chats, setChats]);

  const handleSelectChat = useCallback((id: string) => {
    if (isInteractionLocked) return;
    setActiveChatId(id);
    setChats(prev => prev.map(chat => {
      if (chat.id === id) {
        return { ...chat, unreadCount: 0 };
      }
      return chat;
    }));
  }, [isInteractionLocked, setActiveChatId, setChats]);

  const handleUpdateChat = useCallback((id: string, updates: Partial<ChatSession>) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === id) {
        return { ...chat, ...updates };
      }
      return chat;
    }));
  }, [setChats]);

  return {
    handleSendMessage,
    handleSelectChat,
    handleUpdateChat
  };
};

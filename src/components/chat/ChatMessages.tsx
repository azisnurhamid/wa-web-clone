import React from 'react';
import { ChatSession } from '../../types';
import MessageBubble from '../common/MessageBubble';
import { URLS } from '../../config/config';

interface ChatMessagesProps {
  chat: ChatSession;
  isPrivacyMode: boolean;
  isInteractionLocked: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  chat,
  isPrivacyMode,
  isInteractionLocked,
  messagesEndRef
}) => {
  return (
    <div 
      className="flex-1 overflow-y-auto px-[3%] md:px-[6%] py-4 custom-scrollbar relative"
      style={{
        backgroundImage: `url("${URLS.background.chat}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '400px'
      }}
    >
      <div className="absolute inset-0 bg-[#efeae2] opacity-40 pointer-events-none"></div>

      <div className="relative z-0">
        {chat.messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            isPrivacyMode={isPrivacyMode}
            isInteractionLocked={isInteractionLocked} 
          />
        ))}
        {chat.isTyping && (
          <div className="flex items-center gap-2 ml-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <img src={chat.user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
            </div>
            <div className="bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { ChatSession } from '../../types';
import { TEXTS } from '../../config/config';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  chat: ChatSession;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  isPrivacyMode: boolean;
  isInteractionLocked: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, onSendMessage, onBack, isPrivacyMode, isInteractionLocked }) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSearchSidebar, setShowSearchSidebar] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
            setShowAttachMenu(false);
        }
        if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
            setShowChatMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (showAttachMenu) {
                setShowAttachMenu(false);
                return;
            }
            if (showChatMenu) {
                setShowChatMenu(false);
                return;
            }
            if (showSearchSidebar) {
                setShowSearchSidebar(false);
                return;
            }

            if (!isInteractionLocked) {
                onBack();
            }
        }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
        document.removeEventListener('keydown', handleEscKey);
    };
  }, [showAttachMenu, showChatMenu, showSearchSidebar, isInteractionLocked, onBack]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full relative">
      <div className="flex flex-col flex-1 h-full bg-[#efeae2] relative min-w-0">
        <ChatHeader
          chat={chat}
          isPrivacyMode={isPrivacyMode}
          isInteractionLocked={isInteractionLocked}
          onBack={onBack}
          showSearchSidebar={showSearchSidebar}
          setShowSearchSidebar={setShowSearchSidebar}
          showChatMenu={showChatMenu}
          setShowChatMenu={setShowChatMenu}
          chatMenuRef={chatMenuRef}
        />

        <ChatMessages
          chat={chat}
          isPrivacyMode={isPrivacyMode}
          isInteractionLocked={isInteractionLocked}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          isInteractionLocked={isInteractionLocked}
          showAttachMenu={showAttachMenu}
          setShowAttachMenu={setShowAttachMenu}
          attachMenuRef={attachMenuRef}
          handleKeyPress={handleKeyPress}
          handleSend={handleSend}
        />
      </div>
      
      {showSearchSidebar && (
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-white border-l border-gray-200 z-20 flex flex-col animate-in slide-in-from-right duration-300 shadow-xl">
          <div className="h-14 bg-[#f0f2f5] flex items-center px-4 shrink-0 border-b border-gray-100">
            <button onClick={() => setShowSearchSidebar(false)} className="mr-4 text-[#54656f]">
              <X size={24} />
            </button>
            <div className="text-[#111b21] text-base font-medium">{TEXTS.chatWindow.searchMessages}</div>
          </div>

          <div className="px-4 py-3 bg-white shadow-sm z-10">
            <div className="bg-[#f0f2f5] flex items-center rounded-lg px-4 py-1.5">
              <Search size={16} className="text-[#54656f] mr-3" />
              <input 
                type="text" 
                placeholder={TEXTS.chatWindow.searchInChat}
                autoFocus
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#54656f] text-gray-700"
              />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-[#667781] p-10 text-center">
            <div className="text-sm">{TEXTS.chatWindow.searchWith} {chat.user.name}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;

import React from 'react';
import { Search, MoreVertical, ArrowLeft } from 'lucide-react';
import { ChatSession } from '../../types';
import { useConfig } from '../../config/config';

interface ChatHeaderProps {
  chat: ChatSession;
  isPrivacyMode: boolean;
  isInteractionLocked: boolean;
  onBack: () => void;
  showSearchSidebar: boolean;
  setShowSearchSidebar: (show: boolean) => void;
  showChatMenu: boolean;
  setShowChatMenu: (show: boolean) => void;
  chatMenuRef: React.RefObject<HTMLDivElement>;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  isPrivacyMode,
  isInteractionLocked,
  onBack,
  showSearchSidebar,
  setShowSearchSidebar,
  showChatMenu,
  setShowChatMenu,
  chatMenuRef
}) => {
  const { TEXTS } = useConfig();
  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
    : '';

  return (
    <div className="h-16 bg-[#f0f2f5] px-2 md:px-4 py-2 flex items-center justify-between border-b border-gray-300 z-10 shrink-0 group">
      <div className="flex items-center gap-2 md:gap-4 cursor-pointer overflow-hidden">
        <button onClick={onBack} className="md:hidden text-[#54656f] p-1">
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-3">
          <img 
            src={chat.user.avatar} 
            alt={chat.user.name} 
            className={`w-9 h-9 md:w-10 md:h-10 rounded-full object-cover transition-all duration-300 ${isPrivacyMode ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}
          />
          <div className={`flex flex-col justify-center min-w-0 transition-all duration-300 ${blurClass}`}>
            <span className="text-[#111b21] text-base font-normal leading-tight truncate max-w-[150px] md:max-w-xs">
              {chat.user.name}
            </span>
            <span className="text-[11px] md:text-[13px] text-[#667781] leading-tight truncate">
              {chat.user.isOnline ? TEXTS.chatWindow.online : TEXTS.chatWindow.lastSeen}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 text-[#54656f]">
        <button 
          title={TEXTS.chatWindow.search} 
          onClick={() => setShowSearchSidebar(true)}
          className={`p-2 rounded-full transition ${showSearchSidebar ? 'bg-gray-200' : ''}`}
          disabled={isInteractionLocked}
        >
          <Search size={20} />
        </button>
        <div className="relative" ref={chatMenuRef}>
          <button 
            title={TEXTS.chatWindow.menu}
            onClick={() => setShowChatMenu(!showChatMenu)}
            className={`p-2 rounded-full transition ${showChatMenu ? 'bg-gray-200' : ''}`}
            disabled={isInteractionLocked}
          >
            <MoreVertical size={20} />
          </button>
          {showChatMenu && !isInteractionLocked && (
            <div className="absolute right-0 top-10 bg-white shadow-xl rounded-md py-2 z-50 w-56 border border-gray-100 origin-top-right">
              <ul className="text-[#3b4a54] text-[14.5px]">
                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.chatMenu.contactInfo}</li>
                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.chatMenu.selectMessage}</li>
                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.chatMenu.closeChat}</li>
                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.chatMenu.muteNotifications}</li>
                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.chatMenu.temporaryMessage}</li>
                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.chatMenu.clearMessages}</li>
                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer text-red-500 hover:text-red-600">{TEXTS.chatMenu.deleteChat}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

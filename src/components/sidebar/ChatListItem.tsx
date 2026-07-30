import React from 'react';
import { ChevronDown, Pin, PinOff } from 'lucide-react';
import { ChatSession } from '../../types';
import { TEXTS } from '../../config/config';

interface ChatListItemProps {
  chat: ChatSession;
  activeChatId: string | null;
  isArchivedView: boolean;
  isInteractionLocked: boolean;
  isPrivacyMode: boolean;
  searchQuery: string;
  menuOpenId: string | null;
  onSelectChat: (id: string) => void;
  onMenuClick: (e: React.MouseEvent, chatId: string) => void;
  onAction: (e: React.MouseEvent, chatId: string, action: 'archive' | 'unarchive' | 'pin' | 'unpin') => void;
  onStatusClick: (e: React.MouseEvent) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  activeChatId,
  isArchivedView,
  isInteractionLocked,
  isPrivacyMode,
  searchQuery,
  menuOpenId,
  onSelectChat,
  onMenuClick,
  onAction,
  onStatusClick,
  menuRef
}) => {
  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
    : '';

  return (
    <div
      onClick={() => {
        if (isInteractionLocked && isArchivedView) return;
        onSelectChat(chat.id);
      }}
      className={`
        flex items-center gap-4 px-3 py-3 transition-colors relative group
        ${activeChatId === chat.id && !isArchivedView ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}
        border-b border-gray-100
        ${isInteractionLocked && isArchivedView ? 'cursor-not-allowed opacity-70' : (isInteractionLocked ? 'cursor-not-allowed' : 'cursor-pointer')}
      `}
    >
      <div 
        className={`relative shrink-0 transition-all duration-300 ${isPrivacyMode ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}
        onClick={(e) => {
          if (isInteractionLocked) return;
          if (chat.user.statusUpdates?.length) {
            e.stopPropagation();
            onStatusClick(e);
          }
        }}
      >
        {chat.user.statusUpdates && chat.user.statusUpdates.length > 0 && (
          <StatusRing count={chat.user.statusUpdates.length} hasUnviewed={chat.user.statusUpdates.some(s => !s.isViewed)} />
        )}
        <div className="w-[48px] h-[48px] rounded-full overflow-hidden p-[2px]">
          <img
            src={chat.user.avatar}
            alt={chat.user.name}
            className="w-full h-full rounded-full object-cover border border-gray-100"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className={`text-[17px] text-[#111b21] font-normal truncate transition-all duration-300 ${blurClass}`}>
            {searchQuery ? (
              <span dangerouslySetInnerHTML={{
                __html: chat.user.name.replace(new RegExp(`(${searchQuery})`, 'gi'), '<span class="text-[#00a884] font-bold">$1</span>')
              }} />
            ) : chat.user.name}
          </h3>
          <span className={`text-xs ${chat.unreadCount > 0 ? 'text-[#00a884] font-medium' : 'text-[#667781]'} transition-all duration-300 ${blurClass}`}>
            {chat.lastMessageTime}
          </span>
        </div>
        
        <div className="flex justify-between items-center group-hover:pr-6 relative">
          <p className={`text-[14px] text-[#667781] truncate pr-2 flex-1 transition-all duration-300 ${blurClass}`}>
            {chat.isTyping ? <span className="text-[#00a884] italic">{TEXTS.sidebar.typing}</span> : chat.lastMessage}
          </p>
          <div className="flex items-center gap-2">
            {chat.pinned && (
              <span className={`text-[#667781] transition-all duration-300 ${blurClass}`} title="Chat di-pin">
                <Pin size={14} className="fill-current" />
              </span>
            )}
            {chat.unreadCount > 0 && (
              <span className={`bg-[#00a884] text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full shrink-0 transition-all duration-300 ${blurClass}`}>
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {!isInteractionLocked && (
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${menuOpenId === chat.id ? 'block' : 'hidden group-hover:block'} z-10`}>
          <button 
            onClick={(e) => onMenuClick(e, chat.id)}
            className="text-[#667781] p-1 hover:bg-gray-200 rounded-full bg-[#f5f6f6] shadow-sm"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      )}

      {menuOpenId === chat.id && (
        <div ref={menuRef} className="absolute right-8 top-8 bg-white shadow-xl rounded-md py-2 z-50 w-48 border border-gray-100">
          <ul className="text-[#3b4a54] text-[14.5px]">
            {chat.pinned ? (
              <li onClick={(e) => onAction(e, chat.id, 'unpin')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer flex items-center gap-2">
                <PinOff size={16} /> {TEXTS.sidebar.unpinChat}
              </li>
            ) : (
              <li onClick={(e) => onAction(e, chat.id, 'pin')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer flex items-center gap-2">
                <Pin size={16} /> {TEXTS.sidebar.pinChat}
              </li>
            )}
            {chat.archived ? (
              <li onClick={(e) => onAction(e, chat.id, 'unarchive')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.unarchiveChat}</li>
            ) : (
              <li onClick={(e) => onAction(e, chat.id, 'archive')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.archiveChat}</li>
            )}
            <li className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.markUnread}</li>
            <li className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.deleteChat}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const StatusRing = ({ count, hasUnviewed }: { count: number, hasUnviewed: boolean }) => {
  const size = 56;
  const strokeWidth = 2.5;
  const radius = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  if (count === 1) {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56px] h-[56px] z-10 pointer-events-none">
        <circle 
          cx={center} cy={center} r={radius} 
          fill="none" 
          stroke={hasUnviewed ? "#00a884" : "#aebac1"} 
          strokeWidth={strokeWidth} 
        />
      </svg>
    );
  }

  const gap = 3;
  const segmentLength = (circumference - (gap * count)) / count;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56px] h-[56px] z-10 pointer-events-none -rotate-90">
      <circle 
        cx={center} cy={center} r={radius} 
        fill="none" 
        stroke={hasUnviewed ? "#00a884" : "#aebac1"} 
        strokeWidth={strokeWidth} 
        strokeDasharray={`${segmentLength} ${gap}`}
      />
    </svg>
  );
}

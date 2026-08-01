import React from 'react';
import { Search, Archive } from 'lucide-react';
import { ChatSession } from '../../types';
import { useConfig } from '../../config/config';
import { ChatListItem } from './ChatListItem';

interface ChatListProps {
  sortedChats: ChatSession[];
  activeChatId: string | null;
  view: string;
  isArchivedView: boolean;
  searchQuery: string;
  isUnreadFilter: boolean;
  archivedCount: number;
  isInteractionLocked: boolean;
  isPrivacyMode: boolean;
  menuOpenId: string | null;
  setView: (view: 'MAIN' | 'ARCHIVED') => void;
  onSelectChat: (id: string) => void;
  onMenuClick: (e: React.MouseEvent, chatId: string) => void;
  onAction: (e: React.MouseEvent, chatId: string, action: 'archive' | 'unarchive' | 'pin' | 'unpin') => void;
  onStatusClick: (e: React.MouseEvent) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

export const ChatList: React.FC<ChatListProps> = ({
  sortedChats,
  activeChatId,
  view,
  isArchivedView,
  searchQuery,
  isUnreadFilter,
  archivedCount,
  isInteractionLocked,
  isPrivacyMode,
  menuOpenId,
  setView,
  onSelectChat,
  onMenuClick,
  onAction,
  onStatusClick,
  menuRef
}) => {
  const { TEXTS } = useConfig();
  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
    : '';

  return (
    <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
      {view === 'MAIN' && archivedCount > 0 && !searchQuery && !isUnreadFilter && (
        <div 
          onClick={() => setView('ARCHIVED')}
          className={`flex items-center px-4 py-3 hover:bg-[#f5f6f6] text-[#2ba995] transition-colors border-b border-gray-100 cursor-pointer`}
        >
          <div className="w-12 flex justify-center">
            <Archive size={20} />
          </div>
          <div className="flex-1 text-[17px] font-normal ml-2">{TEXTS.sidebar.archived}</div>
          <div className={`text-xs text-[#00a884] font-medium transition-all duration-300 ${blurClass}`}>
            <span>{archivedCount}</span>
          </div>
        </div>
      )}

      {sortedChats.length === 0 && (
        <div className="p-8 text-center text-gray-500 text-sm mt-10">
          <div className="mb-4 flex justify-center text-gray-300">
            <Search size={48} />
          </div>
          <p>{view === 'ARCHIVED' ? TEXTS.sidebar.noArchivedChats : TEXTS.sidebar.noChatsFound}</p>
        </div>
      )}

      {sortedChats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          activeChatId={activeChatId}
          isArchivedView={isArchivedView}
          isInteractionLocked={isInteractionLocked}
          isPrivacyMode={isPrivacyMode}
          searchQuery={searchQuery}
          menuOpenId={menuOpenId}
          onSelectChat={onSelectChat}
          onMenuClick={onMenuClick}
          onAction={onAction}
          onStatusClick={(e) => {
             e.stopPropagation();
             onStatusClick(e);
          }}
          menuRef={menuRef}
        />
      ))}
      
      <div className="py-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
        <span className="border-b border-gray-200 w-full mx-4"></span>
        <span className="shrink-0">{TEXTS.sidebar.encrypted}</span>
        <span className="border-b border-gray-200 w-full mx-4"></span>
      </div>
    </div>
  );
};

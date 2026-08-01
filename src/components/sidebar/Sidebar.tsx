import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User } from '../../types';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import ProfileDrawer from '../drawers/ProfileDrawer';
import StatusDrawer from '../drawers/StatusDrawer';
import SettingsDrawer from '../drawers/SettingsDrawer';
import NewChatDrawer from '../drawers/NewChatDrawer';
import { useConfig } from '../../config/config';
import { SidebarHeader } from './SidebarHeader';
import { ChatList } from './ChatList';

interface SidebarProps {
  chats: ChatSession[];
  allContacts?: User[]; 
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onUpdateChat: (id: string, updates: Partial<ChatSession>) => void;
  isPrivacyMode: boolean; 
  onTogglePrivacyMode: () => void;
  isInteractionLocked: boolean;
  onToggleInteractionLock: () => void;
  className?: string;
}

type SidebarView = 'MAIN' | 'PROFILE' | 'STATUS' | 'ARCHIVED' | 'SETTINGS' | 'NEW_CHAT';

const Sidebar: React.FC<SidebarProps> = ({ 
    chats, 
    allContacts = [], 
    activeChatId, 
    onSelectChat, 
    onUpdateChat, 
    isPrivacyMode, 
    onTogglePrivacyMode,
    isInteractionLocked,
    onToggleInteractionLock,
    className = '' 
}) => {
  const { TEXTS, URLS } = useConfig();
  const [view, setView] = useState<SidebarView>('MAIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUnreadFilter, setIsUnreadFilter] = useState(false);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isArchivedView = view === 'ARCHIVED';
  
  let displayChats = chats.filter(c => {
    if (isArchivedView) return c.archived;
    return !c.archived;
  });

  if (searchQuery) {
      displayChats = displayChats.filter(c => 
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }

  if (isUnreadFilter) {
      displayChats = displayChats.filter(c => c.unreadCount > 0);
  }

  const archivedCount = chats.filter(c => c.archived).length;

  const pinnedChats = displayChats.filter(c => c.pinned);
  const unpinnedChats = displayChats.filter(c => !c.pinned);
  
  unpinnedChats.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
  
  const sortedChats = [...pinnedChats, ...unpinnedChats];

  const handleMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === chatId ? null : chatId);
  };

  const handleAction = (e: React.MouseEvent, chatId: string, action: 'archive' | 'unarchive' | 'pin' | 'unpin') => {
    e.stopPropagation();
    setMenuOpenId(null);
    
    const pinnedChatsCount = chats.filter(c => c.pinned && c.id !== chatId).length;
    
    switch(action) {
        case 'archive': onUpdateChat(chatId, { archived: true }); break;
        case 'unarchive': onUpdateChat(chatId, { archived: false }); break;
        case 'pin': 
            if (pinnedChatsCount < 3) {
                onUpdateChat(chatId, { pinned: true });
            } else {
                alert(TEXTS.sidebar.maxPinError || 'Maksimal 3 chat yang dapat di-pin. Silakan lepas pin chat lain terlebih dahulu.');
            }
            break;
        case 'unpin': onUpdateChat(chatId, { pinned: false }); break;
    }
  };

  const contactsForDrawer = allContacts.length > 0 ? 
        allContacts.map(u => ({ id: u.id, user: u, lastMessage: '', lastMessageTime: '', unreadCount: 0, messages: [] } as ChatSession)) 
        : chats;
  
  return (
    <div className={`flex flex-col w-full md:w-[35%] md:min-w-[320px] md:max-w-[450px] h-full border-r border-gray-300 bg-white relative ${className}`}>
      
      <ProfileDrawer 
        isOpen={view === 'PROFILE'} 
        onClose={() => setView('MAIN')} 
        isPrivacyMode={isPrivacyMode} 
        isInteractionLocked={isInteractionLocked}
      />
      <StatusDrawer 
        isOpen={view === 'STATUS'} 
        onClose={() => setView('MAIN')} 
        allContacts={allContacts} 
        isPrivacyMode={isPrivacyMode}
        isInteractionLocked={isInteractionLocked}
      />
      <SettingsDrawer 
         isOpen={view === 'SETTINGS'} 
         onClose={() => setView('MAIN')}
         onProfileClick={() => setView('PROFILE')}
         userAvatar={URLS.avatars.default}
         userName={TEXTS.profile.namePlaceholder}
         isPrivacyMode={isPrivacyMode}
         isInteractionLocked={isInteractionLocked}
      />
      <NewChatDrawer 
         isOpen={view === 'NEW_CHAT'} 
         onClose={() => setView('MAIN')} 
         contacts={contactsForDrawer} 
         isPrivacyMode={isPrivacyMode}
         isInteractionLocked={isInteractionLocked}
      />

      <div className="flex flex-col h-full relative">
          
          {view === 'ARCHIVED' ? (
              <>
                <div className="h-16 bg-[#008069] flex items-end px-4 pb-4 shrink-0 transition-all duration-200 z-30">
                  <div className="flex items-center gap-4 text-white w-full">
                      <button onClick={() => setView('MAIN')} className="hover:bg-white/10 p-2 rounded-full transition mr-2">
                          <ArrowLeft size={24} />
                      </button>
                      <h2 className="text-[19px] font-medium">{TEXTS.sidebar.archived}</h2>
                  </div>
                </div>
                <div className="bg-white px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-[#f0f2f5] rounded-lg px-4 py-1.5 border border-transparent transition-all">
                      <Search size={18} className="text-[#54656f] mr-4" />
                      <span className="text-sm text-[#54656f]">{TEXTS.sidebar.searchPlaceholder}</span>
                  </div>
                </div>
              </>
          ) : (
            <>
              <SidebarHeader
                isPrivacyMode={isPrivacyMode}
                onTogglePrivacyMode={onTogglePrivacyMode}
                isInteractionLocked={isInteractionLocked}
                onToggleInteractionLock={onToggleInteractionLock}
                setView={setView}
              />

              <div className="bg-white px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                <div className="flex-1 flex items-center bg-[#f0f2f5] rounded-lg px-4 py-1.5 focus-within:bg-white focus-within:shadow-sm border border-transparent focus-within:border-white transition-all">
                   <div className={`transition-transform duration-300 ${searchQuery ? 'rotate-90 scale-0 w-0' : 'rotate-0 scale-100'}`}>
                        <Search size={18} className="text-[#54656f] mr-4" />
                   </div>
                   {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="mr-4 text-[#00a884] animate-in fade-in zoom-in">
                            <ArrowLeft size={18} />
                        </button>
                   )}
                   <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => !isInteractionLocked && setSearchQuery(e.target.value)}
                      placeholder={isInteractionLocked ? TEXTS.sidebar.searchDisabled : (isUnreadFilter ? TEXTS.sidebar.searchUnread : TEXTS.sidebar.searchPlaceholder)}
                      disabled={isInteractionLocked}
                      className={`bg-transparent border-none outline-none text-sm w-full placeholder:text-[#54656f] text-gray-700 h-full ${isInteractionLocked ? 'cursor-not-allowed' : ''}`}
                   />
                </div>
                <button 
                    onClick={() => !isInteractionLocked && setIsUnreadFilter(!isUnreadFilter)}
                    disabled={isInteractionLocked}
                    className={`p-2 rounded-full transition ${isUnreadFilter ? 'bg-[#00a884] text-white shadow-sm' : 'text-[#54656f] hover:bg-gray-100'} ${isInteractionLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                    title={TEXTS.sidebar.filterUnread}
                >
                    <Filter size={20} fill={isUnreadFilter ? "currentColor" : "none"} />
                </button>
              </div>
            </>
          )}

          <ChatList
            sortedChats={sortedChats}
            activeChatId={activeChatId}
            view={view}
            isArchivedView={isArchivedView}
            searchQuery={searchQuery}
            isUnreadFilter={isUnreadFilter}
            archivedCount={archivedCount}
            isInteractionLocked={isInteractionLocked}
            isPrivacyMode={isPrivacyMode}
            menuOpenId={menuOpenId}
            setView={setView as (view: 'MAIN' | 'ARCHIVED') => void}
            onSelectChat={onSelectChat}
            onMenuClick={handleMenuClick}
            onAction={handleAction}
            onStatusClick={() => setView('STATUS')}
            menuRef={menuRef}
          />
      </div>
    </div>
  );
};

export default Sidebar;

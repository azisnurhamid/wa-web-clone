
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User } from '../types';
import { MessageSquarePlus, MoreVertical, Search, Donut, Filter, Archive, ChevronDown, ArrowLeft, Lock, Eye, EyeOff, MessageSquareLock, Pin, PinOff } from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';
import StatusDrawer from './StatusDrawer';
import SettingsDrawer from './SettingsDrawer';
import NewChatDrawer from './NewChatDrawer';
import { COLORS, TEXTS, URLS } from '../config/config';

interface SidebarProps {
  chats: ChatSession[];
  allContacts?: User[]; 
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onUpdateChat: (id: string, updates: Partial<ChatSession>) => void;
  onLock: () => void; 
  isPrivacyMode: boolean; 
  onTogglePrivacyMode: () => void;
  isInteractionLocked: boolean;
  onToggleInteractionLock: () => void;
  onClearCache?: () => void;
  className?: string;
}

type SidebarView = 'MAIN' | 'PROFILE' | 'STATUS' | 'ARCHIVED' | 'SETTINGS' | 'NEW_CHAT';

const Sidebar: React.FC<SidebarProps> = ({ 
    chats, 
    allContacts = [], 
    activeChatId, 
    onSelectChat, 
    onUpdateChat, 
    onLock, 
    isPrivacyMode, 
    onTogglePrivacyMode,
    isInteractionLocked,
    onToggleInteractionLock,
    onClearCache,
    className = '' 
}) => {
  const [view, setView] = useState<SidebarView>('MAIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUnreadFilter, setIsUnreadFilter] = useState(false);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const mainMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
        setIsMainMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    
    const currentChat = chats.find(c => c.id === chatId);
    const pinnedChats = chats.filter(c => c.pinned && c.id !== chatId);
    
    switch(action) {
        case 'archive': onUpdateChat(chatId, { archived: true }); break;
        case 'unarchive': onUpdateChat(chatId, { archived: false }); break;
        case 'pin': 
            if (pinnedChats.length < 3) {
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
  
  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
    : '';

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
              <div className="h-16 bg-[#f0f2f5] flex items-center justify-between px-4 py-3 shrink-0 border-b border-gray-200 relative z-20">
                <div className="cursor-pointer" onClick={() => setView('SETTINGS')}>
                  <img
                    src={URLS.avatars.default}
                    alt="My Profile"
                    className={`w-10 h-10 rounded-full object-cover transition-all duration-300 ${isPrivacyMode ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}
                  />
                </div>
                
                <div className={`flex gap-4 md:gap-6 text-[${COLORS.textMuted}]`}>
                  <button 
                    title={isPrivacyMode ? TEXTS.privacy.disableBlur : TEXTS.privacy.enableBlur}
                    className={`hover:bg-gray-200/50 p-1 rounded-full transition ${isPrivacyMode ? `text-[${COLORS.primary}]` : ''}`}
                    onClick={onTogglePrivacyMode}
                  >
                     {isPrivacyMode ? <EyeOff size={22} strokeWidth={2} /> : <Eye size={22} strokeWidth={2} />}
                  </button>

                  <button 
                    title={isInteractionLocked ? TEXTS.privacy.unlockChat : TEXTS.privacy.lockChat}
                    className={`hover:bg-gray-200/50 p-1 rounded-full transition ${isInteractionLocked ? `text-[${COLORS.primary}]` : ''}`}
                    onClick={onToggleInteractionLock}
                  >
                    <MessageSquareLock size={22} strokeWidth={2} />
                  </button>

                  <button 
                    title={TEXTS.status.title} 
                    className="hover:bg-gray-200/50 p-1 rounded-full transition relative"
                    onClick={() => setView('STATUS')}
                  >
                     <Donut size={22} strokeWidth={2} />
                     <span className="absolute top-1 right-0.5 w-2 h-2 bg-[#00a884] rounded-full border border-white"></span>
                  </button>
                  <button 
                    title={TEXTS.sidebar.newChat} 
                    className="hover:bg-gray-200/50 p-1 rounded-full transition"
                    onClick={() => setView('NEW_CHAT')}
                  >
                    <MessageSquarePlus size={22} strokeWidth={2} />
                  </button>
                  
                  <div className="relative" ref={mainMenuRef}>
                      <button 
                        title="Menu" 
                        className={`p-1 rounded-full transition ${isMainMenuOpen ? 'bg-gray-200/50' : 'hover:bg-gray-200/50'}`}
                        onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
                      >
                        <MoreVertical size={22} strokeWidth={2} />
                      </button>
                      
                      {isMainMenuOpen && (
                        <div className="absolute right-0 top-10 bg-white shadow-xl rounded-md py-2 z-50 w-52 border border-gray-100 origin-top-right">
                             <ul className="text-[#3b4a54] text-[14.5px]">
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.newGroup}</li>
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.starredMessages}</li>
                                <li 
                                    className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer"
                                    onClick={() => { setIsMainMenuOpen(false); setView('SETTINGS'); }}
                                >
                                    {TEXTS.sidebar.settings}
                                </li>
                             </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>

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

          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
            
            {view === 'MAIN' && archivedCount > 0 && !searchQuery && !isUnreadFilter && (
                <div 
                    onClick={() => {
                        setView('ARCHIVED');
                    }}
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
              <div
                key={chat.id}
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
                            setView('STATUS');
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
                    <div 
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${menuOpenId === chat.id ? 'block' : 'hidden group-hover:block'} z-10`}
                    >
                            <button 
                            onClick={(e) => handleMenuClick(e, chat.id)}
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
                                <li onClick={(e) => handleAction(e, chat.id, 'unpin')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer flex items-center gap-2">
                                    <PinOff size={16} /> {TEXTS.sidebar.unpinChat}
                                </li>
                            ) : (
                                <li onClick={(e) => handleAction(e, chat.id, 'pin')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer flex items-center gap-2">
                                    <Pin size={16} /> {TEXTS.sidebar.pinChat}
                                </li>
                            )}
                            {chat.archived ? (
                                <li onClick={(e) => handleAction(e, chat.id, 'unarchive')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.unarchiveChat}</li>
                            ) : (
                                <li onClick={(e) => handleAction(e, chat.id, 'archive')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.archiveChat}</li>
                            )}
                            <li className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.markUnread}</li>
                            <li className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.deleteChat}</li>
                            </ul>
                    </div>
                )}
              </div>
            ))}
            
            <div className="py-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <span className="border-b border-gray-200 w-full mx-4"></span>
                <span className="shrink-0">{TEXTS.sidebar.encrypted}</span>
                <span className="border-b border-gray-200 w-full mx-4"></span>
            </div>
          </div>
      </div>
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

export default Sidebar;

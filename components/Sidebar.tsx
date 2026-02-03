
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User } from '../types';
import { MessageSquarePlus, MoreVertical, Search, Donut, Filter, Archive, Pin, ChevronDown, ArrowLeft, Lock, Eye, EyeOff, MessageSquareLock } from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';
import StatusDrawer from './StatusDrawer';
import SettingsDrawer from './SettingsDrawer';
import NewChatDrawer from './NewChatDrawer';

interface SidebarProps {
  chats: ChatSession[];
  allContacts?: User[]; 
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onUpdateChat: (id: string, updates: Partial<ChatSession>) => void;
  onLock: () => void; 
  isPrivacyMode: boolean; 
  onTogglePrivacyMode: () => void;
  isInteractionLocked: boolean; // New prop
  onToggleInteractionLock: () => void; // New prop
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
    className = '' 
}) => {
  const [view, setView] = useState<SidebarView>('MAIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUnreadFilter, setIsUnreadFilter] = useState(false);
  const [showPinLimitToast, setShowPinLimitToast] = useState(false); // State for Pin Limit Warning
  
  // Dropdown states
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const mainMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
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

  // Filter and Sort logic
  const isArchivedView = view === 'ARCHIVED';
  
  // Base Filter (Archived vs Main)
  let displayChats = chats.filter(c => {
    if (isArchivedView) return c.archived;
    return !c.archived;
  });

  // Search Filter
  if (searchQuery) {
      displayChats = displayChats.filter(c => 
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }

  // Unread Filter
  if (isUnreadFilter) {
      displayChats = displayChats.filter(c => c.unreadCount > 0);
  }

  // Count archived for the button in MAIN view
  const archivedCount = chats.filter(c => c.archived).length;

  const sortedChats = [...displayChats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0; 
  });

  const handleMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent opening chat
    setMenuOpenId(menuOpenId === chatId ? null : chatId);
  };

  const handleAction = (e: React.MouseEvent, chatId: string, action: 'pin' | 'unpin' | 'archive' | 'unarchive') => {
    e.stopPropagation();
    setMenuOpenId(null);
    
    switch(action) {
        case 'pin': 
            // LIMIT PIN LOGIC: Check count before pinning
            const pinnedCount = chats.filter(c => c.pinned && !c.archived).length;
            if (pinnedCount >= 3) {
                setShowPinLimitToast(true);
                // Hide toast after 3 seconds
                setTimeout(() => setShowPinLimitToast(false), 3000);
            } else {
                onUpdateChat(chatId, { pinned: true }); 
            }
            break;
        case 'unpin': onUpdateChat(chatId, { pinned: false }); break;
        case 'archive': onUpdateChat(chatId, { archived: true, pinned: false }); break;
        case 'unarchive': onUpdateChat(chatId, { archived: false }); break;
    }
  };

  const contactsForDrawer = allContacts.length > 0 ? 
        allContacts.map(u => ({ id: u.id, user: u, lastMessage: '', lastMessageTime: '', unreadCount: 0, messages: [] } as ChatSession)) 
        : chats;
  
  // Helper for blur logic
  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
    : '';
  
  const blurClassGroup = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'group-hover:blur-0' : ''}` 
    : '';

  return (
    <div className={`flex flex-col w-full md:w-[35%] md:min-w-[320px] md:max-w-[450px] h-full border-r border-gray-300 bg-white relative ${className}`}>
      
      {/* Drawers */}
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
         userAvatar="https://picsum.photos/id/64/200/200"
         userName="Nama Saya"
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

      {/* Main Content */}
      <div className="flex flex-col h-full relative">
          
          {/* HEADER LOGIC: Main vs Archived */}
          {view === 'ARCHIVED' ? (
              <div className="h-[108px] bg-[#008069] flex items-end px-4 pb-4 shrink-0 transition-all duration-200">
                <div className="flex items-center gap-4 text-white w-full">
                    <button onClick={() => setView('MAIN')} className="hover:bg-white/10 p-2 rounded-full transition mr-2">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-[19px] font-medium">Diarsipkan</h2>
                </div>
              </div>
          ) : (
            <>
              {/* Sidebar Header */}
              <div className="h-16 bg-[#f0f2f5] flex items-center justify-between px-4 py-3 shrink-0 border-b border-gray-200 relative z-20">
                {/* User Avatar - GRANULAR BLUR */}
                <div className="cursor-pointer" onClick={() => setView('PROFILE')}>
                  <img
                    src="https://picsum.photos/id/64/200/200"
                    alt="My Profile"
                    className={`w-10 h-10 rounded-full object-cover transition-all duration-300 ${isPrivacyMode ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}
                  />
                </div>
                
                {/* Actions */}
                <div className="flex gap-4 md:gap-6 text-[#54656f]">
                  {/* Privacy Toggle Button */}
                  <button 
                    title={isPrivacyMode ? "Matikan Blur Privasi" : "Aktifkan Blur Privasi"}
                    className={`hover:bg-gray-200/50 p-1 rounded-full transition ${isPrivacyMode ? 'text-[#00a884]' : ''}`}
                    onClick={onTogglePrivacyMode}
                  >
                     {isPrivacyMode ? <EyeOff size={22} strokeWidth={2} /> : <Eye size={22} strokeWidth={2} />}
                  </button>

                  {/* New Interaction Lock Button (Next to Blur) */}
                  <button 
                    title={isInteractionLocked ? "Buka Kunci Chat" : "Kunci Chat (Tidak bisa diklik)"}
                    className={`hover:bg-gray-200/50 p-1 rounded-full transition ${isInteractionLocked ? 'text-[#00a884]' : ''}`}
                    onClick={onToggleInteractionLock}
                  >
                    <MessageSquareLock size={22} strokeWidth={2} />
                  </button>

                  {/* STATUS BUTTON - Visible on Mobile now */}
                  <button 
                    title="Status" 
                    className="hover:bg-gray-200/50 p-1 rounded-full transition relative"
                    onClick={() => setView('STATUS')}
                  >
                     <Donut size={22} strokeWidth={2} />
                     <span className="absolute top-1 right-0.5 w-2 h-2 bg-[#00a884] rounded-full border border-white"></span>
                  </button>
                  <button 
                    title="Chat Baru" 
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
                      
                      {/* Main Menu Dropdown */}
                      {isMainMenuOpen && (
                        <div className="absolute right-0 top-10 bg-white shadow-xl rounded-md py-2 z-50 w-52 border border-gray-100 origin-top-right">
                             <ul className="text-[#3b4a54] text-[14.5px]">
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">Grup baru</li>
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">Pesan berbintang</li>
                                <li 
                                    className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer"
                                    onClick={() => { setIsMainMenuOpen(false); setView('SETTINGS'); }}
                                >
                                    Setelan
                                </li>
                                <li 
                                    className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer flex items-center justify-between text-red-500 hover:text-red-600"
                                    onClick={() => { setIsMainMenuOpen(false); onLock(); }}
                                >
                                    <span>Kunci Layar</span>
                                    <Lock size={16} />
                                </li>
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">Keluar</li>
                             </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Search Bar */}
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isUnreadFilter ? "Cari chat belum dibaca" : "Cari atau mulai chat baru"}
                      className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#54656f] text-gray-700 h-full"
                   />
                </div>
                <button 
                    onClick={() => setIsUnreadFilter(!isUnreadFilter)}
                    className={`p-2 rounded-full transition ${isUnreadFilter ? 'bg-[#00a884] text-white shadow-sm' : 'text-[#54656f] hover:bg-gray-100'}`}
                    title="Filter chat belum dibaca"
                >
                    <Filter size={20} fill={isUnreadFilter ? "currentColor" : "none"} />
                </button>
              </div>
            </>
          )}

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
            
            {/* Archived Row Link */}
            {view === 'MAIN' && archivedCount > 0 && !searchQuery && !isUnreadFilter && (
                <div 
                    onClick={() => {
                        if (isInteractionLocked) return;
                        setView('ARCHIVED');
                    }}
                    className={`flex items-center px-4 py-3 hover:bg-[#f5f6f6] text-[#2ba995] transition-colors border-b border-gray-100 ${isInteractionLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                    <div className="w-12 flex justify-center">
                        <Archive size={20} />
                    </div>
                    <div className="flex-1 text-[17px] font-normal ml-2">Diarsipkan</div>
                    {/* Granular Blur for Archived Count */}
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
                    <p>{view === 'ARCHIVED' ? 'Tidak ada chat yang diarsipkan' : 'Chat tidak ditemukan'}</p>
                </div>
            )}

            {sortedChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`
                  flex items-center gap-4 px-3 py-3 transition-colors relative group
                  ${activeChatId === chat.id && !isArchivedView ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}
                  border-b border-gray-100
                  ${isInteractionLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Avatar with Status Ring - GRANULAR BLUR */}
                <div 
                    className={`relative shrink-0 transition-all duration-300 ${isPrivacyMode ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}
                    onClick={(e) => {
                        if (isInteractionLocked) return; // Prevent status click on lock
                        if (chat.user.statusUpdates?.length) {
                            e.stopPropagation();
                            setView('STATUS');
                        }
                    }}
                >
                    {/* SVG Status Ring */}
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

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline mb-0.5">
                     {/* Name - GRANULAR BLUR */}
                     <h3 className={`text-[17px] text-[#111b21] font-normal truncate transition-all duration-300 ${blurClass}`}>
                        {searchQuery ? (
                             <span dangerouslySetInnerHTML={{
                                 __html: chat.user.name.replace(new RegExp(`(${searchQuery})`, 'gi'), '<span class="text-[#00a884] font-bold">$1</span>')
                             }} />
                        ) : chat.user.name}
                     </h3>
                     {/* Time - GRANULAR BLUR */}
                     <span className={`text-xs ${chat.unreadCount > 0 ? 'text-[#00a884] font-medium' : 'text-[#667781]'} transition-all duration-300 ${blurClass}`}>
                        {chat.lastMessageTime}
                     </span>
                  </div>
                  
                  <div className="flex justify-between items-center group-hover:pr-6 relative">
                    {/* Last Message - GRANULAR BLUR */}
                    <p className={`text-[14px] text-[#667781] truncate pr-2 flex-1 transition-all duration-300 ${blurClass}`}>
                       {chat.lastMessage}
                    </p>
                    <div className="flex items-center gap-2">
                         {chat.pinned && (
                            <Pin size={16} className="text-[#667781] rotate-45" fill="currentColor" />
                         )}

                        {chat.unreadCount > 0 && (
                           <span className={`bg-[#00a884] text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full shrink-0 transition-all duration-300 ${blurClass}`}>
                              {chat.unreadCount}
                           </span>
                        )}
                    </div>
                  </div>
                </div>
                
                {/* Hover Dropdown Trigger (Outside Blur) */}
                {/* Hide toggle when interaction is locked */}
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

                {/* Context Menu (Outside Blur) */}
                {menuOpenId === chat.id && (
                    <div ref={menuRef} className="absolute right-8 top-8 bg-white shadow-xl rounded-md py-2 z-50 w-48 border border-gray-100">
                            <ul className="text-[#3b4a54] text-[14.5px]">
                            {chat.pinned ? (
                                <li onClick={(e) => handleAction(e, chat.id, 'unpin')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">Lepas sematan</li>
                            ) : (
                                <li onClick={(e) => handleAction(e, chat.id, 'pin')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">Sematkan chat</li>
                            )}
                            
                            {chat.archived ? (
                                <li onClick={(e) => handleAction(e, chat.id, 'unarchive')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">Buka arsip</li>
                            ) : (
                                <li onClick={(e) => handleAction(e, chat.id, 'archive')} className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">Arsipkan chat</li>
                            )}
                            <li className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">Tandai belum dibaca</li>
                            <li className="px-6 py-2 hover:bg-[#f0f2f5] cursor-pointer">Hapus chat</li>
                            </ul>
                    </div>
                )}
              </div>
            ))}
            
            <div className="py-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <span className="border-b border-gray-200 w-full mx-4"></span>
                <span className="shrink-0">Pesan Anda dilindungi enkripsi end-to-end</span>
                <span className="border-b border-gray-200 w-full mx-4"></span>
            </div>
          </div>
          
          {/* TOAST WARNING FOR PIN LIMIT */}
          {showPinLimitToast && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-[#111b21] text-white px-4 py-3 rounded-md shadow-lg text-sm font-normal whitespace-nowrap opacity-90">
                      Anda hanya dapat menyematkan hingga 3 chat
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

// SVG Logic for Status Ring
const StatusRing = ({ count, hasUnviewed }: { count: number, hasUnviewed: boolean }) => {
    const size = 56; // Slightly larger than avatar (48px)
    const strokeWidth = 2.5;
    const radius = 24;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    
    // If only 1 status, draw a full circle
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

    // If multiple, use dasharray
    const gap = 3; // Gap size in pixels
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

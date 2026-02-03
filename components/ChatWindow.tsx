
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession } from '../types';
import { Search, MoreVertical, Smile, Paperclip, Mic, Send, X, FileText, Image as ImageIcon, Camera, User, BarChart2, Sticker, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  chat: ChatSession;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  isPrivacyMode: boolean; // Received from parent
  isInteractionLocked: boolean; // Received from parent
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, onSendMessage, onBack, isPrivacyMode, isInteractionLocked }) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSearchSidebar, setShowSearchSidebar] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Click outside listener
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

  // Handle ESC Key to close menus or go back
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            // Priority 1: Close Attach Menu if open
            if (showAttachMenu) {
                setShowAttachMenu(false);
                return;
            }
            // Priority 2: Close Chat Menu if open
            if (showChatMenu) {
                setShowChatMenu(false);
                return;
            }
            // Priority 3: Close Search Sidebar if open
            if (showSearchSidebar) {
                setShowSearchSidebar(false);
                return;
            }

            // Priority 4: Close Chat (trigger onBack)
            // Only if interaction is NOT locked
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

  // Helper for blur logic
  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'hover:blur-0' : ''}` 
    : '';

  return (
    <div className="flex h-full w-full relative">
        <div className="flex flex-col flex-1 h-full bg-[#efeae2] relative min-w-0">
        
        {/* Chat Header */}
        <div className="h-16 bg-[#f0f2f5] px-2 md:px-4 py-2 flex items-center justify-between border-b border-gray-300 z-10 shrink-0 group">
            <div className="flex items-center gap-2 md:gap-4 cursor-pointer overflow-hidden">
                {/* Back Button (Mobile Only) */}
                <button onClick={onBack} className="md:hidden text-[#54656f] p-1">
                    <ArrowLeft size={24} />
                </button>

                {/* Info Container */}
                <div className="flex items-center gap-3">
                    {/* Granular Blur: Avatar */}
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
                            {chat.user.isOnline ? 'online' : 'terakhir dilihat hari ini 12:00'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6 text-[#54656f]">
                <button 
                    title="Cari" 
                    onClick={() => setShowSearchSidebar(true)}
                    className={`p-2 rounded-full transition ${showSearchSidebar ? 'bg-gray-200' : ''}`}
                    disabled={isInteractionLocked}
                >
                        <Search size={20} />
                </button>
                <div className="relative" ref={chatMenuRef}>
                    <button 
                        title="Menu"
                        onClick={() => setShowChatMenu(!showChatMenu)}
                        className={`p-2 rounded-full transition ${showChatMenu ? 'bg-gray-200' : ''}`}
                        disabled={isInteractionLocked}
                    >
                            <MoreVertical size={20} />
                    </button>
                    {showChatMenu && !isInteractionLocked && (
                        <div className="absolute right-0 top-10 bg-white shadow-xl rounded-md py-2 z-50 w-56 border border-gray-100 origin-top-right">
                            <ul className="text-[#3b4a54] text-[14.5px]">
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">Info kontak</li>
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">Pilih pesan</li>
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">Tutup chat</li>
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">Bisukan notifikasi</li>
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">Pesan sementara</li>
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">Bersihkan pesan</li>
                                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer text-red-500 hover:text-red-600">Hapus chat</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Messages Area */}
        <div 
            className="flex-1 overflow-y-auto px-[3%] md:px-[6%] py-4 custom-scrollbar relative"
            style={{
                backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70fcded21.png")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '400px'
            }}
        >
            {/* Overlay to dim the background pattern slightly to match WA */}
            <div className="absolute inset-0 bg-[#efeae2] opacity-40 pointer-events-none"></div>

            {/* Message Container content - Pass granular privacy prop */}
            <div className="relative z-0">
                {chat.messages.map((msg) => (
                    <MessageBubble 
                        key={msg.id} 
                        message={msg} 
                        isPrivacyMode={isPrivacyMode}
                        isInteractionLocked={isInteractionLocked} 
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Input Area (Footer) */}
        <div className="min-h-[62px] bg-[#f0f2f5] px-2 md:px-4 py-2 flex items-center gap-2 md:gap-4 z-10 border-t border-gray-200 relative">
            <div className="flex gap-2 md:gap-4 text-[#54656f] items-center">
                <button title="Emoji" className="hidden md:block" disabled={isInteractionLocked}>
                    <Smile size={26} strokeWidth={1.5} className="hover:text-gray-600" />
                </button>
                <button title="Emoji" className="block md:hidden" disabled={isInteractionLocked}>
                    <Smile size={24} strokeWidth={1.5} className="hover:text-gray-600" />
                </button>

                <div className="relative" ref={attachMenuRef}>
                    <button 
                        title="Lampirkan" 
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        className={`transition-transform duration-200 ${showAttachMenu ? 'rotate-45 text-[#008069]' : 'rotate-0'}`}
                        disabled={isInteractionLocked}
                    >
                        <Paperclip size={24} strokeWidth={1.5} />
                    </button>
                    
                    {/* Attach Popup Menu */}
                    <div className={`absolute bottom-12 left-0 md:left-[-10px] flex flex-col gap-4 transition-all duration-200 ${showAttachMenu ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-75 invisible'}`}>
                         {/* Items */}
                         <AttachItem color="bg-[#5157ae]" icon={<FileText size={20} fill="white" />} label="Dokumen" />
                         <AttachItem color="bg-[#007bfc]" icon={<ImageIcon size={20} fill="white" />} label="Foto & video" />
                         <AttachItem color="bg-[#d3396d]" icon={<Camera size={20} />} label="Kamera" />
                         <AttachItem color="bg-[#0063cb]" icon={<User size={20} fill="white" />} label="Kontak" />
                         <AttachItem color="bg-[#ffbc38]" icon={<BarChart2 size={20} />} label="Polling" />
                         <AttachItem color="bg-[#0063cb]" icon={<Sticker size={20} fill="white" />} label="Stiker baru" />
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ketik pesan"
                className="w-full py-[9px] px-4 bg-white rounded-lg text-sm text-[#111b21] placeholder:text-[#667781] focus:outline-none"
                disabled={isInteractionLocked}
                />
            </div>

            <div className="text-[#54656f]">
                {inputText.trim() ? (
                    <button onClick={handleSend} className="text-[#00a884]" disabled={isInteractionLocked}>
                        <Send size={24} />
                    </button>
                ) : (
                    <button title="Rekam Suara" disabled={isInteractionLocked}>
                        <Mic size={24} strokeWidth={1.5} />
                    </button>
                )}
            </div>
        </div>
        </div>
        
        {/* Right Search Sidebar */}
        {showSearchSidebar && (
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-white border-l border-gray-200 z-20 flex flex-col animate-in slide-in-from-right duration-300 shadow-xl">
                {/* Search Header */}
                <div className="h-14 bg-[#f0f2f5] flex items-center px-4 shrink-0 border-b border-gray-100">
                    <button onClick={() => setShowSearchSidebar(false)} className="mr-4 text-[#54656f]">
                        <X size={24} />
                    </button>
                    <div className="text-[#111b21] text-base font-medium">Cari pesan</div>
                </div>

                {/* Search Input */}
                <div className="px-4 py-3 bg-white shadow-sm z-10">
                    <div className="bg-[#f0f2f5] flex items-center rounded-lg px-4 py-1.5">
                        <Search size={16} className="text-[#54656f] mr-3" />
                        <input 
                            type="text" 
                            placeholder="Cari..."
                            autoFocus
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#54656f] text-gray-700"
                        />
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center text-[#667781] p-10 text-center">
                    <div className="text-sm">Cari pesan dengan {chat.user.name}</div>
                </div>
            </div>
        )}
    </div>
  );
};

const AttachItem = ({ color, icon, label }: { color: string, icon: React.ReactNode, label: string }) => (
    <div className="group relative flex items-center cursor-pointer">
         <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${color}`}>
            {icon}
         </div>
         {/* Tooltip Label */}
         <div className="absolute left-16 bg-white/80 px-2 py-1 rounded text-xs text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm z-50">
             {label}
         </div>
    </div>
);

export default ChatWindow;

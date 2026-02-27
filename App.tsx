
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { CHAT_SESSIONS, ALL_CONTACTS } from './data/store';
import { ChatSession, Message, User } from './types';
import { createIncomingMessage, createNewStatusUpdate, generateProfileChange } from './data/simulationUtils';
import { getRandomInt, getRandomItem } from './data/utils/helpers';
import { Lock, X, ShieldAlert } from 'lucide-react';
import { COLORS, TIMING, TEXTS, APP_CONFIG } from './config';

function App() {
  const [chats, setChats] = useState<ChatSession[]>(CHAT_SESSIONS);
  const [contacts, setContacts] = useState<User[]>(ALL_CONTACTS);
  
  const [isLocked, setIsLocked] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [isInteractionLocked, setIsInteractionLocked] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const chatsRef = useRef(chats);
  const contactsRef = useRef(contacts);

  useEffect(() => {
    chatsRef.current = chats;
    contactsRef.current = contacts;
  }, [chats, contacts]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (!showPaywall && !isLocked) {
        timeoutId = setTimeout(() => {
            setShowPaywall(true);
        }, TIMING.paywallDelay);
    }

    return () => clearTimeout(timeoutId);
  }, [showPaywall, isLocked]);

  useEffect(() => {
    const runSimulation = () => {
        const currentChats = chatsRef.current;
        const currentContacts = contactsRef.current;
        
        const eventType = getRandomInt(1, 9);

        if (eventType <= 6) {
            const targetChatIndex = getRandomInt(0, Math.min(15, currentChats.length - 1));
            const targetChat = currentChats[targetChatIndex];

            if (targetChat) {
                const newMessage = createIncomingMessage(targetChat);
                
                const updatedChat = {
                    ...targetChat,
                    messages: [...targetChat.messages, newMessage],
                    lastMessage: newMessage.text,
                    lastMessageTime: newMessage.timestamp,
                    unreadCount: targetChat.id === activeChatId ? 0 : targetChat.unreadCount + 1,
                };

                setChats(currentChats.map(c => c.id === targetChat.id ? updatedChat : c));
            }

        } else if (eventType <= 8) {
            const targetContact = getRandomItem(currentContacts as readonly User[]);
            if (targetContact) {
                const newStatus = createNewStatusUpdate(targetContact.id);
                const updatedContact = {
                    ...targetContact,
                    statusUpdates: targetContact.statusUpdates ? [...targetContact.statusUpdates, newStatus] : [newStatus]
                };

                setContacts(prev => prev.map(u => u.id === targetContact.id ? updatedContact : u));
                setChats(prev => prev.map(c => c.user.id === targetContact.id ? { ...c, user: updatedContact } : c));
            }
        } else {
             const targetContact = getRandomItem(currentContacts as readonly User[]);
             if (targetContact) {
                 const updates = generateProfileChange(targetContact);
                 const updatedContact = { ...targetContact, ...updates };
                 
                 setContacts(prev => prev.map(u => u.id === targetContact.id ? updatedContact : u));
                 setChats(prev => prev.map(c => c.user.id === targetContact.id ? { ...c, user: updatedContact } : c));
             }
        }
    };

    const scheduleNext = () => {
        const delay = getRandomInt(TIMING.simulationMinInterval, TIMING.simulationMaxInterval); 
        const timeoutId = setTimeout(() => {
            runSimulation();
            scheduleNext();
        }, delay);
        return timeoutId;
    };

    const initialTimeout = setTimeout(() => {
        runSimulation();
        scheduleNext();
    }, TIMING.simulationInitialDelay);

    return () => clearTimeout(initialTimeout);
  }, [activeChatId]); 

  const handleSendMessage = (text: string) => {
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
  };

  const handleSelectChat = (id: string) => {
      if (isInteractionLocked) return;

      setActiveChatId(id);
      setChats(prev => prev.map(chat => {
          if (chat.id === id) {
              return { ...chat, unreadCount: 0 };
          }
          return chat;
      }));
  };

  const handleUpdateChat = (id: string, updates: Partial<ChatSession>) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === id) {
        return { ...chat, ...updates };
      }
      return chat;
    }));
  };

  const handleAppLock = () => {
    setIsLocked(true);
    setActiveChatId(null);
  };

  const handleTogglePrivacyMode = () => {
      if (isPrivacyMode) {
          setShowPaywall(true);
      } else {
          setIsPrivacyMode(true);
      }
  };

  const handleToggleInteractionLock = () => {
    if (isInteractionLocked) {
        setShowPaywall(true);
    } else {
        setIsInteractionLocked(true);
        setActiveChatId(null);
    }
  };

  if (isLocked) {
     return (
        <div className={`h-screen w-full bg-white md:bg-[${COLORS.background}] flex items-center justify-center flex-col gap-4`}>
            <div className="bg-white p-4 rounded-full mb-2">
                <div className={`w-16 h-16 bg-[${COLORS.primary}] rounded-full flex items-center justify-center text-white`}>
                    <Lock size={32} />
                </div>
            </div>
            <h1 className="text-2xl text-[#41525d] font-light">{TEXTS.lock.title}</h1>
            <p className={`text-[${COLORS.textSecondary}] mb-4`}>{TEXTS.lock.subtitle}</p>
            <button 
                onClick={() => setIsLocked(false)}
                className={`bg-[${COLORS.primary}] text-white px-8 py-2.5 rounded-full hover:bg-[${COLORS.primaryHover}] transition font-medium shadow-sm`}
            >
                {TEXTS.lock.button}
            </button>
        </div>
     );
  }

  return (
    <div className={`h-screen w-full bg-white md:bg-[${COLORS.background}] flex items-center justify-center overflow-hidden relative`}>
      
      <div className={`absolute top-0 w-full h-32 bg-[${COLORS.primary}] z-0 hidden md:block`}></div>

      <div className={`w-full h-full md:h-[95%] md:w-[1600px] md:max-w-[98%] bg-[${COLORS.sidebarBackground}] md:shadow-lg flex overflow-hidden z-10 relative`}>
        
        <Sidebar 
          chats={chats} 
          allContacts={contacts} 
          activeChatId={activeChatId} 
          onSelectChat={handleSelectChat}
          onUpdateChat={handleUpdateChat}
          onLock={handleAppLock}
          isPrivacyMode={isPrivacyMode}
          onTogglePrivacyMode={handleTogglePrivacyMode}
          isInteractionLocked={isInteractionLocked}
          onToggleInteractionLock={handleToggleInteractionLock}
          className={`${activeChatId ? 'hidden md:flex' : 'flex'}`}
        />
        
        <div className={`flex-1 flex-col bg-[#f0f2f5] min-w-0 ${activeChatId ? 'flex' : 'hidden md:flex'}`}>
            {activeChat ? (
              <ChatWindow 
                chat={activeChat} 
                onSendMessage={handleSendMessage} 
                onBack={() => setActiveChatId(null)} 
                isPrivacyMode={isPrivacyMode}
                isInteractionLocked={isInteractionLocked}
              />
            ) : (
              <div className={`flex-1 bg-[${COLORS.sidebarBackground}] flex items-center justify-center border-b-[6px] border-[#25d366]`}>
                 <div className={`text-center text-[#41525d] max-w-[560px] px-8`}>
                    <h1 className="text-3xl font-light mb-4">{TEXTS.welcome.title}</h1>
                    <p>{TEXTS.welcome.description}</p>
                    <p className={`mt-2 text-sm text-[${COLORS.textSecondary}]`}>{TEXTS.welcome.footer}</p>
                 </div>
              </div>
            )}
        </div>
      </div>

      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-[#00a884] to-[#008f6f] px-6 pt-8 pb-6 text-center overflow-hidden flex-shrink-0">
                    {/* Decorative circles */}
                    <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-white/10 rounded-full"></div>
                    
                    {/* Lock icon with pulse animation */}
                    <div className="relative inline-flex mb-3">
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                        <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Lock size={36} className="text-[#00a884]" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Buka Kunci Fitur Premium</h2>
                    <p className="text-white/90 text-sm relative z-10 max-w-[320px] mx-auto">
                        Dapatkan akses penuh ke semua fitur privasi dan keamanan tanpa batasan
                    </p>
                </div>
                
                {/* Close button */}
                <button 
                    onClick={() => setShowPaywall(false)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-20"
                >
                    <X size={18} />
                </button>
                
                {/* Features list */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {[
                            { icon: "🔒", text: "Chat Pribadi" },
                            { icon: "👁️", text: "Mode Privasi" },
                            { icon: "✨", text: "Tanpa Iklan" },
                            { icon: "⭐", text: "Prioritas Tinggi" }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-gray-600">
                                <span className="text-base">{feature.icon}</span>
                                <span>{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {/* Package cards */}
                    <div className="space-y-3 mb-5">
                        {APP_CONFIG.app.packages?.map((pkg: any, idx: number) => (
                            <div
                                key={pkg.id}
                                onClick={() => {
                                    window.location.href = APP_CONFIG.app.paywallUrl + '?package=' + pkg.id;
                                }}
                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
                                    pkg.recommended 
                                        ? 'border-[#00a884] bg-gradient-to-r from-[#00a884]/5 to-[#00a884]/10 shadow-md' 
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                {pkg.recommended && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-[#00a884] to-[#00c896] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                            🔥 Rekomendasi
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <div className="text-left">
                                        <div className={`font-bold text-[${COLORS.textPrimary}] text-base`}>{pkg.name}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                            {pkg.recommended ? '⭐' : '📦'} {pkg.period}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-[#00a884] text-xl">{pkg.price}</div>
                                        {pkg.originalPrice && (
                                            <>
                                                <div className="text-xs text-gray-400 line-through">{pkg.originalPrice}</div>
                                                <div className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5">
                                                    Hemat {pkg.discount}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 mb-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <ShieldAlert size={14} />
                            <span>Pembayaran Aman</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-1">
                            <span>🔒</span>
                            <span>Enkripsi Terjamin</span>
                        </div>
                    </div>
                    
                    {/* Later button */}
                    <button 
                        onClick={() => setShowPaywall(false)}
                        className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-sm"
                    >
                        {TEXTS.paywall.later}
                    </button>
                </div>
                
                {/* Bottom decorative line */}
                <div className="h-1 bg-gradient-to-r from-[#00a884] via-[#25d366] to-[#00a884]"></div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;

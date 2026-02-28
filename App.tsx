
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './src/components/Sidebar';
import ChatWindow from './src/components/ChatWindow';
import PricingPage from './src/components/PricingPage';
import { CHAT_SESSIONS, ALL_CONTACTS } from './src/data/store';
import { ChatSession, Message, User } from './src/types';
import { createIncomingMessage, createNewStatusUpdate, generateProfileChange, generateAIResponse } from './src/data/simulationUtils';
import { getRandomInt, getRandomItem, generateTimestamp } from './src/data/utils/helpers';
import { Lock, X, ShieldAlert } from 'lucide-react';
import { COLORS, TIMING, TEXTS, APP_CONFIG } from './src/config/config';
import { useContentProtection } from './src/hooks/useContentProtection';

function App() {
  useContentProtection();
  
  const [chats, setChats] = useState<ChatSession[]>(() => {
    const cached = localStorage.getItem('wa_cloned_chats');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return CHAT_SESSIONS;
      }
    }
    return CHAT_SESSIONS;
  });
  
  const [contacts, setContacts] = useState<User[]>(() => {
    const cached = localStorage.getItem('wa_cloned_contacts');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return ALL_CONTACTS;
      }
    }
    return ALL_CONTACTS;
  });
  
  const [isLocked, setIsLocked] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [isInteractionLocked, setIsInteractionLocked] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPricingPage, setShowPricingPage] = useState(false);
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const chatsRef = useRef(chats);
  const contactsRef = useRef(contacts);

  useEffect(() => {
    chatsRef.current = chats;
    contactsRef.current = contacts;
  }, [chats, contacts]);

  useEffect(() => {
    localStorage.setItem('wa_cloned_chats', JSON.stringify(chats));
    localStorage.setItem('wa_cloned_contacts', JSON.stringify(contacts));
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
            const pinnedChats = currentChats.filter(c => c.pinned);
            
            const secretChat = currentChats.find(c => c.id === 'chat_secret_1');
            const isSecretEvent = secretChat && getRandomInt(1, 100) <= 25;
            
            let targetChat;
            
            if (isSecretEvent && secretChat) {
                targetChat = secretChat;
            } else if (pinnedChats.length > 0 && getRandomInt(1, 100) <= 60) {
                const pinnedIndex = getRandomInt(0, pinnedChats.length - 1);
                targetChat = pinnedChats[pinnedIndex];
            } else {
                const targetChatIndex = getRandomInt(0, Math.min(15, currentChats.length - 1));
                targetChat = currentChats[targetChatIndex];
            }

            if (targetChat) {
                let newMessage;
                
                if (targetChat.id === 'chat_secret_1') {
                    const secretTexts = [
                        'Miss you 😘',
                        'Ketemu nanti malam? 🥵',
                        'Gabisa lupa kamu昨天的 meeting 😂',
                        'Shh... jangan sampai ketahuan 😏',
                        'Kapan有空一起吃饭?',
                        'I miss your touch 💕',
                        'Chat kita bahaya kalau ketahuan 😅',
                        'Cantik kamu hari ini 😍',
                        'Besok mau cafe?',
                        'Jangan lupa hapus chat ini ya 🔐'
                    ];
                    newMessage = {
                        id: `msg_secret_${Date.now()}`,
                        text: getRandomItem(secretTexts),
                        timestamp: generateTimestamp(0),
                        isMine: false,
                        status: getRandomInt(1, 100) <= 50 ? 'delivered' : 'read'
                    };
                } else {
                    newMessage = createIncomingMessage(targetChat);
                }
                
                const statusRoll = getRandomInt(1, 100);
                let messageStatus: 'sent' | 'delivered' | 'read' = 'sent';
                if (statusRoll <= 30) {
                    messageStatus = 'sent';
                } else if (statusRoll <= 60) {
                    messageStatus = 'delivered';
                } else {
                    messageStatus = 'read';
                }
                newMessage.status = messageStatus;
                
                const unreadRoll = getRandomInt(1, 100);
                let newUnreadCount = targetChat.unreadCount;
                
                if (unreadRoll <= 40) {
                    newUnreadCount = 0;
                } else if (unreadRoll <= 75) {
                    newUnreadCount = targetChat.id === activeChatId ? 0 : targetChat.unreadCount + 1;
                } else {
                    newMessage.status = 'sent';
                    newUnreadCount = targetChat.id === activeChatId ? 0 : targetChat.unreadCount + 1;
                }
                
                const updatedChat = {
                    ...targetChat,
                    messages: [...targetChat.messages, newMessage],
                    lastMessage: newMessage.text,
                    lastMessageTime: newMessage.timestamp,
                    unreadCount: newUnreadCount,
                };

                setChats(currentChats.map(c => c.id === targetChat.id ? updatedChat : c));
            }

        } else if (eventType <= 8) {
            const targetChat = getRandomItem(currentChats as readonly ChatSession[]);
            if (targetChat && targetChat.messages.length > 0) {
                const deliveredMessages = targetChat.messages.filter(
                    m => !m.isMine && (m.status === 'delivered' || m.status === 'sent')
                );
                
                if (deliveredMessages.length > 0 && getRandomInt(1, 100) <= 40) {
                    const msgToUpdate = getRandomItem(deliveredMessages);
                    const updatedMessages = targetChat.messages.map(m => 
                        m.id === msgToUpdate.id ? { ...m, status: 'read' as const } : m
                    );
                    
                    setChats(currentChats.map(c => 
                        c.id === targetChat.id ? { ...c, messages: updatedMessages } : c
                    ));
                    return;
                }
            }
            
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
    
    const isSpecialChat = currentChat.user.name.includes('❤️') || currentChat.user.name.includes('🌹') || currentChat.user.name.includes('💕');
    const isSecretChat = currentChat.id === 'chat_secret_1' || currentChat.user.name === '???';
    
    const currentHour = new Date().getHours();
    
    let minDelay = 1000;
    let maxDelay = 4000;
    
    if (currentHour >= 23 || currentHour < 6) {
      minDelay = 4000;
      maxDelay = 8000;
    } else if (currentHour >= 6 && currentHour < 9) {
      minDelay = 2000;
      maxDelay = 5000;
    } else if (currentHour >= 12 && currentHour < 14) {
      minDelay = 2000;
      maxDelay = 5000;
    }
    
    const responseDelay = getRandomInt(minDelay, maxDelay);
    
    setTimeout(() => {
      const aiResponseText = generateAIResponse(text, isSpecialChat, isSecretChat);
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
        isMine: false,
        status: 'delivered',
      };
      
      setChats(prev => {
        const chat = prev.find(c => c.id === activeChatId);
        if (!chat) return prev;
        
        const updatedChatWithAI = {
          ...chat,
          messages: [...chat.messages, aiMessage],
          lastMessage: aiResponseText,
          lastMessageTime: aiMessage.timestamp,
        };
        
        return prev.map(c => c.id === activeChatId ? updatedChatWithAI : c);
      });
    }, responseDelay);
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
  
  const clearCache = () => {
    localStorage.removeItem('wa_cloned_chats');
    localStorage.removeItem('wa_cloned_contacts');
    window.location.reload();
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
          onClearCache={clearCache}
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
                <div className="relative bg-gradient-to-br from-[#00a884] to-[#008f6f] px-6 pt-8 pb-6 text-center overflow-hidden flex-shrink-0">
                    <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-white/10 rounded-full"></div>
                    
                    <div className="relative inline-flex mb-3">
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                        <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Lock size={36} className="text-[#00a884]" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2 relative z-10">{TEXTS.paywall.title}</h2>
                    <p className="text-white/90 text-sm relative z-10 max-w-[320px] mx-auto">
                        {TEXTS.paywall.description}
                    </p>
                    {TEXTS.paywall.aiNote && (
                        <p className="text-white/70 text-xs mt-2 relative z-10 max-w-[320px] mx-auto italic">
                            {TEXTS.paywall.aiNote}
                        </p>
                    )}
                </div>
                
                <button 
                    onClick={() => setShowPaywall(false)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-20"
                >
                    <X size={18} />
                </button>
                
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {[
                            { icon: "🔒", text: TEXTS.paywall.features.privateChat },
                            { icon: "👁️", text: TEXTS.paywall.features.privacyMode },
                            { icon: "✨", text: TEXTS.paywall.features.noAds },
                            { icon: "⭐", text: TEXTS.paywall.features.priority }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-gray-600">
                                <span className="text-base">{feature.icon}</span>
                                <span>{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <div className="flex items-center justify-center gap-4 mb-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <ShieldAlert size={14} />
                            <span>{TEXTS.paywall.trust.securePayment}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-1">
                            <span>🔒</span>
                            <span>{TEXTS.paywall.trust.encryption}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => {
                            setShowPaywall(false);
                            setShowPricingPage(true);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-[#00a884] to-[#00c896] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00a884]/30 transition-all"
                    >
                        {TEXTS.paywall.viewPackages}
                    </button>
                </div>
                
                <div className="h-1 bg-gradient-to-r from-[#00a884] via-[#25d366] to-[#00a884]"></div>
            </div>
        </div>
      )}

      {showPricingPage && (
        <PricingPage 
          onClose={() => setShowPricingPage(false)} 
          onSelectPackage={(pkgId) => {
            window.location.href = APP_CONFIG.app.paywallUrl + '/topup?package=' + pkgId;
          }}
        />
      )}
    </div>
  );
}

export default App;

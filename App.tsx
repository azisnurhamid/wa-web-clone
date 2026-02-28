
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './src/components/Sidebar';
import ChatWindow from './src/components/ChatWindow';
import PricingPage from './src/components/PricingPage';
import { CHAT_SESSIONS, ALL_CONTACTS } from './src/data/store';
import { ChatSession, Message, User } from './src/types';
import { createIncomingMessage, createNewStatusUpdate, generateProfileChange, generateAIResponse } from './src/data/simulationUtils';
import { getRandomInt, getRandomItem, generateTimestamp } from './src/data/utils/helpers';
import { Lock, X, ShieldAlert, Crown } from 'lucide-react';
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
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    // Get current hour in Indonesia (UTC+7)
    const getIndonesiaHour = (): number => {
        const now = new Date();
        const utcHour = now.getUTCHours();
        return (utcHour + 7) % 24;
    };
    
    // Calculate message frequency based on Indonesian busy hours
    // Busy hours: 6-9 AM (morning), 12-1 PM (lunch), 5-8 PM (evening), 11 PM-6 AM (sleeping)
    const getBusyHourMultiplier = (): number => {
        const hour = getIndonesiaHour();
        
        // Sleeping time (11 PM - 6 AM) - very slow
        if (hour >= 23 || hour < 6) {
            return 3.0; // Very slow - messages rare
        }
        // Morning rush (6-9 AM) - moderate
        if (hour >= 6 && hour < 9) {
            return 1.5;
        }
        // Lunch break (12-1 PM) - busy
        if (hour >= 12 && hour < 13) {
            return 1.5;
        }
        // Evening rush (17-20 / 5-8 PM) - busy
        if (hour >= 17 && hour < 20) {
            return 1.5;
        }
        // Working hours (9-12, 13-17) - normal
        // Night (20-23) - normal
        return 1.0; // Normal speed
    };

    const runSimulation = () => {
        if (!isMounted) return;
        
        const currentChats = chatsRef.current;
        const currentContacts = contactsRef.current;
        
        // PRIORITY: If there's an active chat, send message to that chat immediately
        if (activeChatId) {
            const activeChat = currentChats.find(c => c.id === activeChatId);
            if (activeChat) {
                // Show typing indicator first
                setChats(currentChats.map(c => 
                    c.id === activeChat.id ? { ...c, isTyping: true } : c
                ));
                
                // Quick response for active chat (1-2 seconds)
                const typingDuration = getRandomInt(1000, 2000);
                
                setTimeout(() => {
                    if (!isMounted) return;
                    
                    let newMessage;
                    
                    if (activeChat.id === 'chat_secret_1') {
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
                        newMessage = createIncomingMessage(activeChat);
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
                    
                    const updatedChat = {
                        ...activeChat,
                        messages: [...activeChat.messages, newMessage],
                        lastMessage: newMessage.text,
                        lastMessageTime: newMessage.timestamp,
                        unreadCount: 0,
                        isTyping: false
                    };

                    setChats(currentChats.map(c => c.id === activeChat.id ? updatedChat : c));
                    
                    // AI automatically replies to incoming messages
                    // Apply busy hour multiplier to make AI slower during busy times
                    const busyMultiplier = getBusyHourMultiplier();
                    const aiReplyDelay = Math.floor(getRandomInt(1500, 3500) * busyMultiplier);
                    setTimeout(() => {
                        if (!isMounted) return;
                        const isSecretChat = activeChat.id === 'chat_secret_1' || activeChat.user.name === '???';
                        const isSpecialChat = activeChat.user.name.includes('❤️') || activeChat.user.name.includes('🌹') || activeChat.user.name.includes('💕');
                        const aiResponse = generateAIResponse(newMessage.text, isSpecialChat, isSecretChat);
                        const aiMessage: Message = {
                            id: `ai_auto_${Date.now()}`,
                            text: aiResponse,
                            timestamp: generateTimestamp(0),
                            isMine: true,
                            status: 'delivered'
                        };
                        setChats(prev => {
                            const chat = prev.find(c => c.id === activeChat.id);
                            if (!chat) return prev;
                            const updatedChatWithAI = {
                                ...chat,
                                messages: [...chat.messages, aiMessage],
                                lastMessage: aiResponse,
                                lastMessageTime: aiMessage.timestamp
                            };
                            return prev.map(c => c.id === activeChat.id ? updatedChatWithAI : c);
                        });
                    }, aiReplyDelay);
                    
                    // Schedule next message for active chat sooner
                    scheduleNext(true);
                }, typingDuration);
                
                return;
            }
        }
        
        // Original random events when no active chat
        const eventType = getRandomInt(1, 7);

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
                // Show typing indicator first
                setChats(currentChats.map(c => 
                    c.id === targetChat.id ? { ...c, isTyping: true } : c
                ));
                
                // Wait for typing duration, then send message
                const typingDuration = getRandomInt(1000, 2500);
                
                setTimeout(() => {
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
                        isTyping: false
                    };

                    setChats(currentChats.map(c => c.id === targetChat.id ? updatedChat : c));
                    
                    // AI auto-reply if this is the active chat
                    if (targetChat.id === activeChatId) {
                        const busyMultiplier = getBusyHourMultiplier();
                        const aiReplyDelay = Math.floor(getRandomInt(1500, 3500) * busyMultiplier);
                        setTimeout(() => {
                            if (!isMounted) return;
                            const isSecretChat = targetChat.id === 'chat_secret_1' || targetChat.user.name === '???';
                            const isSpecialChat = targetChat.user.name.includes('❤️') || targetChat.user.name.includes('🌹') || targetChat.user.name.includes('💕');
                            const aiResponse = generateAIResponse(newMessage.text, isSpecialChat, isSecretChat);
                            const aiMessage: Message = {
                                id: `ai_auto_${Date.now()}`,
                                text: aiResponse,
                                timestamp: generateTimestamp(0),
                                isMine: true,
                                status: 'delivered'
                            };
                            setChats(prev => {
                                const chat = prev.find(c => c.id === targetChat.id);
                                if (!chat) return prev;
                                const updatedChatWithAI = {
                                    ...chat,
                                    messages: [...chat.messages, aiMessage],
                                    lastMessage: aiResponse,
                                    lastMessageTime: aiMessage.timestamp
                                };
                                return prev.map(c => c.id === targetChat.id ? updatedChatWithAI : c);
                            });
                        }, aiReplyDelay);
                    }
                }, typingDuration);
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

    const scheduleNext = (isQuick: boolean = false) => {
        // Apply Indonesian busy hour timing
        const busyMultiplier = getBusyHourMultiplier();
        
        // If there's an active chat, respond faster (2-5 seconds)
        // Otherwise use default timing (5-12 seconds) with busy multiplier
        let baseDelay: number;
        if (isQuick) {
            baseDelay = getRandomInt(2000, 5000);
        } else {
            baseDelay = getRandomInt(TIMING.simulationMinInterval, TIMING.simulationMaxInterval);
        }
        
        // Apply busy hour multiplier (slower during busy times)
        const delay = Math.floor(baseDelay * busyMultiplier);
        
        timeoutId = setTimeout(() => {
            if (isMounted) {
                runSimulation();
                scheduleNext();
            }
        }, delay);
    };

    const initialTimeout = setTimeout(() => {
        if (isMounted) {
            runSimulation();
            scheduleNext();
        }
    }, TIMING.simulationInitialDelay);

    return () => {
        isMounted = false;
        clearTimeout(initialTimeout);
        clearTimeout(timeoutId);
    };
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-hidden relative animate-in zoom-in-95 duration-500 flex flex-col">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00a884] via-[#008f6f] to-[#00695c] overflow-hidden">
                    {/* Floating particles */}
                    <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                    <div className="absolute top-20 right-8 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-75"></div>
                    <div className="absolute bottom-16 left-8 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-150"></div>
                    <div className="absolute bottom-4 right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-300"></div>
                    {/* Diagonal lines pattern */}
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'}}></div>
                </div>
                
                {/* Close button */}
                <button 
                    onClick={() => setShowPaywall(false)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all z-20 backdrop-blur-sm"
                >
                    <X size={20} />
                </button>
                
                <div className="relative z-10 px-8 pt-10 pb-6 text-center">
                    {/* Glowing lock icon */}
                    <div className="relative inline-flex mb-4">
                        <div className="absolute inset-0 bg-white/40 rounded-full animate-ping"></div>
                        <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-800 rounded-full"></div>
                            <Lock size={40} className="text-[#00a884] mt-2" />
                        </div>
                    </div>
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium mb-4">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Akses Terbatas
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
                        Unlock Fitur Premium
                    </h2>
                    <p className="text-white/95 text-base leading-relaxed max-w-[340px] mx-auto mb-4">
                        Nikmati pengalaman WhatsApp tanpa batas dengan fitur privasi tambahan dan pesan otomatis AI.
                    </p>
                    
                    {/* Countdown timer */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 mb-4 inline-flex items-center gap-3">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">23</div>
                            <div className="text-xs text-white/70">Jam</div>
                        </div>
                        <span className="text-white/50 text-xl">:</span>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">45</div>
                            <div className="text-xs text-white/70">Menit</div>
                        </div>
                        <span className="text-white/50 text-xl">:</span>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">30</div>
                            <div className="text-xs text-white/70">Detik</div>
                        </div>
                    </div>
                </div>
                
                {/* Features grid */}
                <div className="bg-white px-6 py-4 flex-shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: "🔒", text: "Chat Pribadi Tersembunyi", color: "bg-purple-100" },
                            { icon: "👁️", text: "Mode Privasi Canggih", color: "bg-blue-100" },
                            { icon: "🤖", text: "AI Auto Reply", color: "bg-green-100" },
                            { icon: "⭐", text: "Prioritas Tinggi", color: "bg-yellow-100" }
                        ].map((feature, idx) => (
                            <div key={idx} className={`${feature.color} p-3 rounded-xl flex items-center gap-3 transition-transform hover:scale-105`}>
                                <span className="text-2xl">{feature.icon}</span>
                                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* CTA Section */}
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white flex-1 overflow-y-auto">
                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex -space-x-2">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a884] to-[#008f6f] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                    {String.fromCharCode(64+i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">+520 orang sudah upgrade</span>
                    </div>
                    
                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-6 mb-5 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <ShieldAlert size={14} className="text-green-500" />
                            <span>Pembayaran Aman</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-green-500">🔒</span>
                            <span>Enkripsi Terjamin</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-green-500">↩️</span>
                            <span>Garansi 30 Hari</span>
                        </div>
                    </div>
                    
                    {/* Main CTA Button */}
                    <button 
                        onClick={() => {
                            setShowPaywall(false);
                            setShowPricingPage(true);
                        }}
                        className="w-full py-4 bg-gradient-to-r from-[#00a884] via-[#00c896] to-[#00e6b0] text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-[#00a884]/40 transition-all transform hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        <span className="relative flex items-center justify-center gap-2">
                            <Crown className="w-5 h-5" />
                            Lihat Paket Premium
                        </span>
                    </button>
                    
                    {/* Secondary link */}
                    <button 
                        onClick={() => setShowPaywall(false)}
                        className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
                    >
                        Mungkin nanti saja
                    </button>
                </div>
                
                {/* Bottom decorative line */}
                <div className="h-2 bg-gradient-to-r from-[#00a884] via-[#25d366] to-[#00e6b0]"></div>
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

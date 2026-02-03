
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { CHAT_SESSIONS, ALL_CONTACTS } from './data/store';
import { ChatSession, Message, User } from './types';
import { createIncomingMessage, createNewStatusUpdate, generateProfileChange } from './data/simulationUtils';
import { getRandomInt, getRandomItem } from './data/utils/helpers';
import { Lock, CreditCard, X, ShieldAlert } from 'lucide-react';

function App() {
  // State for Chats and Contacts needs to be reactive now
  const [chats, setChats] = useState<ChatSession[]>(CHAT_SESSIONS);
  const [contacts, setContacts] = useState<User[]>(ALL_CONTACTS);
  
  // App States
  const [isLocked, setIsLocked] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(true); // Shared Privacy State - Default TRUE
  const [isInteractionLocked, setIsInteractionLocked] = useState(true); // Chat Interaction Lock - Default TRUE
  const [showPaywall, setShowPaywall] = useState(false); // New Paywall State
  
  // Start with null (List view) by default for better responsive UX
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const chatsRef = useRef(chats);
  const contactsRef = useRef(contacts);

  // Keep refs synced for the interval closure
  useEffect(() => {
    chatsRef.current = chats;
    contactsRef.current = contacts;
  }, [chats, contacts]);

  // --- PAYWALL LOGIC (20 Seconds After Closing) ---
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    // Only schedule the next popup if it is currently closed (showPaywall is false)
    // and the app is not in full screen lock mode.
    if (!showPaywall && !isLocked) {
        timeoutId = setTimeout(() => {
            setShowPaywall(true);
        }, 20000); // 20 seconds delay
    }

    return () => clearTimeout(timeoutId);
  }, [showPaywall, isLocked]);

  // Helper to maintain pinned order stability
  // 1. If Pinned: Update in place (don't move to top) to keep order fixed.
  // 2. If Unpinned: Move to top of Unpinned section (below Pinned).
  const reorderChats = (currentList: ChatSession[], updatedChat: ChatSession) => {
    if (updatedChat.pinned) {
        return currentList.map(c => c.id === updatedChat.id ? updatedChat : c);
    } else {
        const pinnedChats = currentList.filter(c => c.pinned);
        const unpinnedChats = currentList.filter(c => !c.pinned && c.id !== updatedChat.id);
        return [...pinnedChats, updatedChat, ...unpinnedChats];
    }
  };

  // --- AI SIMULATION LOOP ---
  useEffect(() => {
    const runSimulation = () => {
        const currentChats = chatsRef.current;
        const currentContacts = contactsRef.current;
        
        // Random Event Type: 
        // 1-6: New Message (High prob)
        // 7-8: New Status (Medium prob)
        // 9: Profile Change (Low prob)
        const eventType = getRandomInt(1, 9);

        if (eventType <= 6) {
            // --- NEW MESSAGE SIMULATION ---
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
                    archived: false // Unarchive on new message
                };

                // Apply reorder logic respecting Pinned status
                setChats(reorderChats(currentChats, updatedChat));
            }

        } else if (eventType <= 8) {
            // --- NEW STATUS SIMULATION ---
            const targetContact = getRandomItem(currentContacts);
            if (targetContact) {
                const newStatus = createNewStatusUpdate(targetContact.id);
                const updatedContact = {
                    ...targetContact,
                    statusUpdates: targetContact.statusUpdates ? [...targetContact.statusUpdates, newStatus] : [newStatus]
                };

                // Update Contacts List
                setContacts(prev => prev.map(u => u.id === targetContact.id ? updatedContact : u));
                
                // Update Chat Session User (without reordering)
                setChats(prev => prev.map(c => c.user.id === targetContact.id ? { ...c, user: updatedContact } : c));
            }
        } else {
             // --- PROFILE CHANGE SIMULATION ---
             const targetContact = getRandomItem(currentContacts);
             if (targetContact) {
                 const updates = generateProfileChange(targetContact);
                 const updatedContact = { ...targetContact, ...updates };
                 
                 setContacts(prev => prev.map(u => u.id === targetContact.id ? updatedContact : u));
                 setChats(prev => prev.map(c => c.user.id === targetContact.id ? { ...c, user: updatedContact } : c));
             }
        }
    };

    const scheduleNext = () => {
        // Random interval between 30s (30000ms) and 2m (120000ms)
        const delay = getRandomInt(30000, 120000); 
        const timeoutId = setTimeout(() => {
            runSimulation();
            scheduleNext(); // Recursive schedule
        }, delay);
        return timeoutId;
    };

    const initialTimeout = setTimeout(() => {
        runSimulation();
        scheduleNext();
    }, 5000);

    return () => clearTimeout(initialTimeout);
  }, [activeChatId]); 

  const handleSendMessage = (text: string) => {
    if (!activeChatId) return;

    // Find current state of the active chat
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

    // Apply reorder logic respecting Pinned status
    setChats(prev => reorderChats(prev, updatedChat));
  };

  const handleSelectChat = (id: string) => {
      // Guard: If Interaction Lock is active, prevent opening chat
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

  // --- LOCKING HANDLERS ---
  
  // Handle Full Screen Lock (via Menu)
  const handleAppLock = () => {
    setIsLocked(true);
    setActiveChatId(null); // Close active chat immediately
  };

  // Handle Privacy Toggle (via Header Icon)
  const handleTogglePrivacyMode = () => {
      if (isPrivacyMode) {
          // If currently ON, trying to turn OFF (Unlock Blur) -> Paywall
          setShowPaywall(true);
      } else {
          // If currently OFF, turning ON -> Allow
          setIsPrivacyMode(true);
      }
  };

  // Handle Interaction Lock (via Header Icon)
  const handleToggleInteractionLock = () => {
    if (isInteractionLocked) {
        // If currently LOCKED, trying to UNLOCK (Unlock Chat) -> Paywall
        setShowPaywall(true);
    } else {
        // If currently UNLOCKED, locking -> Allow
        setIsInteractionLocked(true);
        setActiveChatId(null); // Close active chat immediately when locking
    }
  };

  if (isLocked) {
     return (
        <div className="h-screen w-full bg-[#d1d7db] flex items-center justify-center flex-col gap-4">
            <div className="bg-white p-4 rounded-full mb-2">
                <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center text-white">
                    <Lock size={32} />
                </div>
            </div>
            <h1 className="text-2xl text-[#41525d] font-light">WhatsApp Terkunci</h1>
            <p className="text-[#667781] mb-4">Klik tombol di bawah untuk membuka</p>
            <button 
                onClick={() => setIsLocked(false)}
                className="bg-[#00a884] text-white px-8 py-2.5 rounded-full hover:bg-[#008f6f] transition font-medium shadow-sm"
            >
                Buka Kunci
            </button>
        </div>
     );
  }

  return (
    // Main Background
    <div className="h-screen w-full bg-white md:bg-[#d1d7db] flex items-center justify-center overflow-hidden relative">
      
      {/* Green Header Strip (Desktop Only) */}
      <div className="absolute top-0 w-full h-32 bg-[#00a884] z-0 hidden md:block"></div>

      {/* App Container */}
      <div className="w-full h-full md:h-[95%] md:w-[1600px] md:max-w-[98%] bg-[#f0f2f5] md:shadow-lg flex overflow-hidden z-10 relative">
        
        {/* Sidebar */}
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
        
        {/* Chat Window */}
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
              <div className="flex-1 bg-[#f0f2f5] flex items-center justify-center border-b-[6px] border-[#25d366]">
                 <div className="text-center text-[#41525d] max-w-[560px] px-8">
                    <h1 className="text-3xl font-light mb-4">WhatsApp Web</h1>
                    <p>Kirim dan terima pesan tanpa perlu menghubungkan telepon Anda secara online.</p>
                    <p className="mt-2 text-sm text-[#667781]">Gunakan WhatsApp di hingga 4 perangkat tertaut dan 1 telepon sekaligus.</p>
                 </div>
              </div>
            )}
        </div>
      </div>

      {/* PAYWALL POPUP (Overlay) */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-md p-6 relative animate-in zoom-in-95 duration-300">
                <button 
                    onClick={() => setShowPaywall(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>
                
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                        <ShieldAlert size={32} strokeWidth={2} />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-[#111b21] mb-2">Akses Terbatas</h2>
                    <p className="text-[#54656f] mb-6">
                        Fitur <span className="font-semibold">Mode Privasi</span> dan <span className="font-semibold">Kunci Chat</span> sedang aktif. Lakukan pembayaran untuk menghilangkan batasan dan blur pada chat.
                    </p>
                    
                    <button 
                        onClick={() => {
                            // Redirect to payment website
                            window.location.href = "https://recover.web.id";
                        }}
                        className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                        <CreditCard size={20} />
                        Bayar Rp 50.000
                    </button>
                    
                    <button 
                        onClick={() => setShowPaywall(false)}
                        className="mt-3 text-[#00a884] text-sm font-medium hover:underline"
                    >
                        Nanti Saja
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;

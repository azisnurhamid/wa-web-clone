
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { CHAT_SESSIONS, ALL_CONTACTS } from './data/store';
import { ChatSession, Message, User } from './types';
import { createIncomingMessage, createNewStatusUpdate, generateProfileChange } from './data/simulationUtils';
import { getRandomInt, getRandomItem } from './data/utils/helpers';
import { Lock, CreditCard, X, ShieldAlert } from 'lucide-react';

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
        }, 20000);
    }

    return () => clearTimeout(timeoutId);
  }, [showPaywall, isLocked]);

  const reorderChats = (currentList: ChatSession[], updatedChat: ChatSession) => {
    return currentList.map(c => c.id === updatedChat.id ? updatedChat : c);
  };

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
        const delay = getRandomInt(30000, 120000); 
        const timeoutId = setTimeout(() => {
            runSimulation();
            scheduleNext();
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
    <div className="h-screen w-full bg-white md:bg-[#d1d7db] flex items-center justify-center overflow-hidden relative">
      
      <div className="absolute top-0 w-full h-32 bg-[#00a884] z-0 hidden md:block"></div>

      <div className="w-full h-full md:h-[95%] md:w-[1600px] md:max-w-[98%] bg-[#f0f2f5] md:shadow-lg flex overflow-hidden z-10 relative">
        
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

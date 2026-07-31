
import React, { useState, useEffect } from 'react';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import WelcomePage from './components/welcome/WelcomePage';
import Dashboard from './components/dashboard/Dashboard';
import { CHAT_SESSIONS, ALL_CONTACTS } from './data/store';
import { ChatSession, Message, User } from './types';
import { generateAIResponse } from './data/simulationUtils';
import { getRandomInt } from './data/utils/helpers';
import { Lock, MessageCircle, Phone } from 'lucide-react';
import { TEXTS, APP_CONFIG } from './config/config';
import { useContentProtection } from './hooks/useContentProtection';
import { useSimulation } from './hooks/useSimulation';

function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    return window.location.pathname === '/dashboard' ? 'dashboard' : 'main';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(window.location.pathname === '/dashboard' ? 'dashboard' : 'main');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useContentProtection();
  
  const [chats, setChats] = useState<ChatSession[]>(() => {
    const cached = localStorage.getItem('wa_cloned_chats_v2');
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
    const cached = localStorage.getItem('wa_cloned_contacts_v2');
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
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('wa_logged_in') === 'true';
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChat = chats.find((c) => c.id === activeChatId);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTooltip(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('wa_cloned_chats_v2', JSON.stringify(chats));
    localStorage.setItem('wa_cloned_contacts_v2', JSON.stringify(contacts));
  }, [chats, contacts]);

  useSimulation({ chats, contacts, activeChatId, setChats, setContacts });



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
      const aiResponseText = generateAIResponse(text, isSecretChat);
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
    setIsPrivacyMode(!isPrivacyMode);
  };

  const handleToggleInteractionLock = () => {
    setIsInteractionLocked(!isInteractionLocked);
    if (!isInteractionLocked) {
      setActiveChatId(null);
    }
  };
  
  const clearCache = () => {
    localStorage.removeItem('wa_cloned_chats_v2');
    localStorage.removeItem('wa_cloned_contacts_v2');
    localStorage.removeItem('wa_logged_in');
    window.location.reload();
  };



  const whatsappButton = (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50 group">
      <div className={`bg-white px-3 py-1.5 rounded-lg shadow-md text-sm text-gray-700 whitespace-nowrap transition-opacity ${showTooltip ? 'opacity-100' : 'opacity-0'}`}>
        {TEXTS.whatsappButton.tooltip}
      </div>
      <a
        href={`https://wa.me/${localStorage.getItem('wa_support_phone') || APP_CONFIG.supportPhone}?text=${encodeURIComponent(TEXTS.whatsappButton.defaultMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <MessageCircle size={32} className="text-white" />
        </div>
        <div className="absolute w-full h-full flex items-center justify-center">
          <Phone size={14} className="text-white" />
        </div>
      </a>
    </div>
  );

  if (currentRoute === 'dashboard') {
    return <Dashboard />;
  }

  if (!isLoggedIn) {
    return (
      <>
        <WelcomePage onComplete={() => {
          localStorage.setItem('wa_logged_in', 'true');
          setIsLoggedIn(true);
        }} />
        {whatsappButton}
      </>
    );
  }

  if (isLocked) {
    return (
      <>
        <div className="h-screen w-full bg-white md:bg-[#d1d7db] flex items-center justify-center flex-col gap-4">
          <div className="bg-white p-4 rounded-full mb-2">
            <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center text-white">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-2xl text-[#41525d] font-light">{TEXTS.lock.title}</h1>
          <p className="text-[#667781] mb-4">{TEXTS.lock.subtitle}</p>
          <button 
            onClick={() => setIsLocked(false)}
            className="bg-[#00a884] text-white px-8 py-2.5 rounded-full hover:bg-[#008f6f] transition font-medium shadow-sm"
          >
            {TEXTS.lock.button}
          </button>
        </div>
        {whatsappButton}
      </>
    );
  }

  return (
    <>
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
            <div className="flex-1 bg-[#f0f2f5] flex items-center justify-center border-b-[6px] border-[#25d366]">
              <div className="text-center text-[#41525d] max-w-[560px] px-8">
                <h1 className="text-3xl font-light mb-4">{TEXTS.welcome.title}</h1>
                <p>{TEXTS.welcome.description}</p>
                <p className="mt-2 text-sm text-[#667781]">{TEXTS.welcome.footer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      
      {whatsappButton}
    </>
  );
}

export default App;

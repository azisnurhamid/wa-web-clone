
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import WelcomePage from './pages/Welcome/WelcomePage';
import Dashboard from './pages/Dashboard/Dashboard';
import { CHAT_SESSIONS, ALL_CONTACTS } from './data/mockData';
import { ChatSession, User } from './types';
import { Lock, MessageCircle, Phone } from 'lucide-react';
import { TEXTS, APP_CONFIG, PRIVACY_CONFIG } from './config/config';
import { useContentProtection } from './hooks/useContentProtection';
import { useSimulation } from './hooks/useSimulation';
import { useChatLogic } from './hooks/useChatLogic';
import PaymentModal from './components/common/PaymentModal';
import { STORAGE_KEYS } from './utils/constants';
function App() {
  const navigate = useNavigate();
  useContentProtection();
  
  const [chats, setChats] = useState<ChatSession[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.CHATS);
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
    const cached = localStorage.getItem(STORAGE_KEYS.CONTACTS);
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
  const [isPrivacyMode, setIsPrivacyMode] = useState(PRIVACY_CONFIG.defaultBlur);
  const [isInteractionLocked, setIsInteractionLocked] = useState(PRIVACY_CONFIG.defaultInteractionLock);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LOGGED_IN) === 'true';
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
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }, [chats, contacts]);

  useSimulation({ chats, contacts, activeChatId, setChats, setContacts });



  const { handleSendMessage, handleSelectChat, handleUpdateChat } = useChatLogic({
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    isInteractionLocked
  });

  const handleAppLock = () => {
    setIsLocked(true);
    setActiveChatId(null);
  };

  const handleTogglePrivacyMode = () => {
    if (isPrivacyMode) {
      setShowPaymentModal(true);
    } else {
      setIsPrivacyMode(true);
    }
  };

  const handleToggleInteractionLock = () => {
    if (isInteractionLocked) {
      setShowPaymentModal(true);
    } else {
      setIsInteractionLocked(true);
      setActiveChatId(null);
    }
  };
  
  const clearCache = () => {
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.LOGGED_IN);
    window.location.reload();
  };



  const whatsappButton = (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50 group">
      <div className={`bg-white px-3 py-1.5 rounded-lg shadow-md text-sm text-gray-700 whitespace-nowrap transition-opacity ${showTooltip ? 'opacity-100' : 'opacity-0'}`}>
        {TEXTS.whatsappButton.tooltip}
      </div>
      <a
        href={`https://wa.me/${localStorage.getItem(STORAGE_KEYS.SUPPORT_PHONE) || APP_CONFIG.supportPhone}?text=${encodeURIComponent(TEXTS.whatsappButton.defaultMessage)}`}
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

  const renderMainApp = () => {
    if (!isLoggedIn) {
      return (
        <>
          <WelcomePage onComplete={() => {
            localStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
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
        <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
      </>
    );
  };

  return (
    <Routes>
      <Route path="/" element={renderMainApp()} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

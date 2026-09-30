import React, { useEffect } from 'react';
import { Lock } from 'lucide-react';
import Sidebar from '@/features/chat/components/Sidebar';
import ChatWindow from '@/features/chat/components/ChatWindow';
import WelcomePage from '@/features/auth/components/WelcomePage';
import { TEXTS } from '@/config/config';
import { STORAGE_KEYS } from '@/utils/constants';
import { useAppContext } from '@/context/AppContext';
import { getAppSettings } from '@/services/api';
import WhatsAppHelpButton from '@/components/WhatsAppHelpButton';

const MainLayout: React.FC = () => {
  const {
    chats,
    contacts,
    isLocked,
    setIsLocked,
    isPrivacyMode,
    isInteractionLocked,
    isLoggedIn,
    setIsLoggedIn,
    activeChatId,
    setActiveChatId,
    activeChat,
    handleSendMessage,
    handleSelectChat,
    handleUpdateChat,
    handleTogglePrivacyMode,
    handleToggleInteractionLock,
    showPaymentModal,
    setShowPaymentModal,
  } = useAppContext();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoggedIn && !showPaymentModal) {
      timeoutId = setTimeout(() => {
        setShowPaymentModal(true);
      }, 15000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoggedIn, showPaymentModal, setShowPaymentModal]);

  useEffect(() => {
    getAppSettings()
      .then((data: any) => {
        if (data.supportPhone) {
          localStorage.setItem(STORAGE_KEYS.SUPPORT_PHONE, data.supportPhone);
        }
        if (data.price) {
          localStorage.setItem(STORAGE_KEYS.PRICE, data.price);
        }
      })
      .catch((err) => console.error('Failed to load dynamic app settings in Layout', err));
  }, []);

  if (!isLoggedIn) {
    return (
      <WelcomePage
        onComplete={() => {
          localStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
          setIsLoggedIn(true);
        }}
      />
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
        <WhatsAppHelpButton />
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
            isPrivacyMode={isPrivacyMode}
            onTogglePrivacyMode={handleTogglePrivacyMode}
            isInteractionLocked={isInteractionLocked}
            onToggleInteractionLock={handleToggleInteractionLock}
            className={`${activeChatId ? 'hidden md:flex' : 'flex'}`}
          />

          <div
            className={`flex-1 flex-col bg-[#f0f2f5] min-w-0 ${activeChatId ? 'flex' : 'hidden md:flex'}`}
          >
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

      <WhatsAppHelpButton />
    </>
  );
};

export default MainLayout;

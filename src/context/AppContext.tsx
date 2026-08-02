import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatSession, User } from '@/types';
import { CHAT_SESSIONS, ALL_CONTACTS } from '@/data/mockData';
import { STORAGE_KEYS } from '@/utils/constants';
import { PRIVACY_CONFIG } from '@/config/config';
import { useSimulation } from '@/hooks/useSimulation';
import { useChatLogic } from '@/hooks/useChatLogic';

interface AppContextType {
  chats: ChatSession[];
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  contacts: User[];
  setContacts: React.Dispatch<React.SetStateAction<User[]>>;
  isLocked: boolean;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
  isPrivacyMode: boolean;
  setIsPrivacyMode: React.Dispatch<React.SetStateAction<boolean>>;
  isInteractionLocked: boolean;
  setIsInteractionLocked: React.Dispatch<React.SetStateAction<boolean>>;
  showPaymentModal: boolean;
  setShowPaymentModal: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  activeChatId: string | null;
  setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>;
  activeChat: ChatSession | undefined;

  handleSendMessage: (text: string) => void;
  handleSelectChat: (id: string) => void;
  handleUpdateChat: (id: string, updates: Partial<ChatSession>) => void;

  handleAppLock: () => void;
  handleTogglePrivacyMode: () => void;
  handleToggleInteractionLock: () => void;
  clearCache: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [isInteractionLocked, setIsInteractionLocked] = useState(
    PRIVACY_CONFIG.defaultInteractionLock,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LOGGED_IN) === 'true';
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChat = chats.find((c) => c.id === activeChatId);

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
    isInteractionLocked,
  });

  const handleAppLock = () => {
    setIsLocked(true);
    setActiveChatId(null);
  };

  const handleTogglePrivacyMode = () => {
    setIsPrivacyMode(!isPrivacyMode);
  };

  const handleToggleInteractionLock = () => {
    const nextState = !isInteractionLocked;
    setIsInteractionLocked(nextState);
    if (nextState) {
      setActiveChatId(null);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.LOGGED_IN);
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        chats,
        setChats,
        contacts,
        setContacts,
        isLocked,
        setIsLocked,
        isPrivacyMode,
        setIsPrivacyMode,
        isInteractionLocked,
        setIsInteractionLocked,
        showPaymentModal,
        setShowPaymentModal,
        isLoggedIn,
        setIsLoggedIn,
        activeChatId,
        setActiveChatId,
        activeChat,
        handleSendMessage,
        handleSelectChat,
        handleUpdateChat,
        handleAppLock,
        handleTogglePrivacyMode,
        handleToggleInteractionLock,
        clearCache,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

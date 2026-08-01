import React, { useRef, useState, useEffect } from 'react';
import { MessageSquarePlus, MoreVertical, Donut, Eye, EyeOff, MessageSquareLock } from 'lucide-react';
import DefaultAvatar from '../common/DefaultAvatar';
import { COLORS, TEXTS } from '../../config/config';

interface SidebarHeaderProps {
  isPrivacyMode: boolean;
  onTogglePrivacyMode: () => void;
  isInteractionLocked: boolean;
  onToggleInteractionLock: () => void;
  setView: (view: 'MAIN' | 'PROFILE' | 'STATUS' | 'ARCHIVED' | 'SETTINGS' | 'NEW_CHAT') => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isPrivacyMode,
  onTogglePrivacyMode,
  isInteractionLocked,
  onToggleInteractionLock,
  setView
}) => {
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const mainMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
        setIsMainMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-16 bg-[#f0f2f5] flex items-center justify-between px-4 py-3 shrink-0 border-b border-gray-200 relative z-20">
      <div className="cursor-pointer" onClick={() => setView('SETTINGS')}>
        <div className={`transition-all duration-300 ${isPrivacyMode ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}>
          <DefaultAvatar size={40} />
        </div>
      </div>
      
      <div className={`flex gap-4 md:gap-6 text-[${COLORS.textMuted}]`}>
        <button 
          title={isPrivacyMode ? TEXTS.privacy.disableBlur : TEXTS.privacy.enableBlur}
          className={`hover:bg-gray-200/50 p-1 rounded-full transition ${isPrivacyMode ? `text-[${COLORS.primary}]` : ''}`}
          onClick={onTogglePrivacyMode}
        >
          {isPrivacyMode ? <EyeOff size={22} strokeWidth={2} /> : <Eye size={22} strokeWidth={2} />}
        </button>

        <button 
          title={isInteractionLocked ? TEXTS.privacy.unlockChat : TEXTS.privacy.lockChat}
          className={`hover:bg-gray-200/50 p-1 rounded-full transition ${isInteractionLocked ? `text-[${COLORS.primary}]` : ''}`}
          onClick={onToggleInteractionLock}
        >
          <MessageSquareLock size={22} strokeWidth={2} />
        </button>

        <button 
          title={TEXTS.status.title} 
          className="hover:bg-gray-200/50 p-1 rounded-full transition relative"
          onClick={() => setView('STATUS')}
        >
          <Donut size={22} strokeWidth={2} />
          <span className="absolute top-1 right-0.5 w-2 h-2 bg-[#00a884] rounded-full border border-white"></span>
        </button>
        <button 
          title={TEXTS.sidebar.newChat} 
          className="hover:bg-gray-200/50 p-1 rounded-full transition"
          onClick={() => setView('NEW_CHAT')}
        >
          <MessageSquarePlus size={22} strokeWidth={2} />
        </button>
        
        <div className="relative" ref={mainMenuRef}>
          <button 
            title="Menu" 
            className={`p-1 rounded-full transition ${isMainMenuOpen ? 'bg-gray-200/50' : 'hover:bg-gray-200/50'}`}
            onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
          >
            <MoreVertical size={22} strokeWidth={2} />
          </button>
          
          {isMainMenuOpen && (
            <div className="absolute right-0 top-10 bg-white shadow-xl rounded-md py-2 z-50 w-52 border border-gray-100 origin-top-right">
              <ul className="text-[#3b4a54] text-[14.5px]">
                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.newGroup}</li>
                <li className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer">{TEXTS.sidebar.starredMessages}</li>
                <li 
                  className="px-6 py-2.5 hover:bg-[#f0f2f5] cursor-pointer"
                  onClick={() => { setIsMainMenuOpen(false); setView('SETTINGS'); }}
                >
                  {TEXTS.sidebar.settings}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

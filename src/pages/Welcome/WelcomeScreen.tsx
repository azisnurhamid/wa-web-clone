import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, ChevronDown, Globe } from 'lucide-react';
import { TEXTS } from '../../config/config';

const T = TEXTS.welcomePage;

interface WelcomeScreenProps {
  onNext: () => void;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext, showMenu, setShowMenu }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowMenu, setShowLangMenu]);

  return (
    <div className="h-screen w-full bg-white flex flex-col relative">
      <div className="flex justify-end px-2 pt-3 pb-1 relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <MoreVertical size={20} className="text-[#54656f]" />
        </button>

        {showMenu && (
          <div className="absolute top-12 right-3 bg-white rounded-md shadow-lg py-2 z-50 min-w-[180px] border border-gray-50 animate-in fade-in duration-150">
            <button className="w-full text-left px-6 py-3 text-[15px] text-[#3b4a54] hover:bg-[#f5f6f6] transition">
              {T.common.help}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-[260px] h-[260px] mb-8 flex items-center justify-center">
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <ellipse cx="150" cy="155" rx="100" ry="95" fill="#E8F5E9" opacity="0.6" />
            <rect x="100" y="100" width="130" height="90" rx="12" fill="#E8F5E9" stroke="#25D366" strokeWidth="2" />
            <line x1="120" y1="125" x2="210" y2="125" stroke="#A5D6A7" strokeWidth="6" strokeLinecap="round" />
            <line x1="120" y1="140" x2="195" y2="140" stroke="#C8E6C9" strokeWidth="6" strokeLinecap="round" />
            <line x1="120" y1="155" x2="180" y2="155" stroke="#C8E6C9" strokeWidth="6" strokeLinecap="round" />
            <line x1="120" y1="170" x2="160" y2="170" stroke="#E8F5E9" strokeWidth="6" strokeLinecap="round" />
            <rect x="70" y="120" width="120" height="80" rx="12" fill="white" stroke="#25D366" strokeWidth="2" />
            <line x1="90" y1="145" x2="170" y2="145" stroke="#E8F5E9" strokeWidth="6" strokeLinecap="round" />
            <line x1="90" y1="160" x2="155" y2="160" stroke="#E8F5E9" strokeWidth="6" strokeLinecap="round" />
            <line x1="90" y1="175" x2="135" y2="175" stroke="#E8F5E9" strokeWidth="6" strokeLinecap="round" />
            <g transform="translate(55, 60)">
              <path d="M25 5 C15 0, 5 8, 10 18 C15 28, 22 25, 25 22 C28 19, 32 22, 30 28 C28 34, 18 38, 8 28 C-2 18, 0 5, 10 0 C15 -3, 22 0, 25 5Z"
                fill="#25D366" stroke="#128C7E" strokeWidth="1.5" />
            </g>
            <g transform="translate(195, 55)">
              <circle cx="25" cy="25" r="22" fill="#25D366" opacity="0.9" />
              <circle cx="25" cy="25" r="22" fill="none" stroke="#128C7E" strokeWidth="1.5" />
              <ellipse cx="25" cy="25" rx="10" ry="22" fill="none" stroke="white" strokeWidth="1.2" />
              <line x1="3" y1="25" x2="47" y2="25" stroke="white" strokeWidth="1.2" />
              <line x1="7" y1="14" x2="43" y2="14" stroke="white" strokeWidth="1" />
              <line x1="7" y1="36" x2="43" y2="36" stroke="white" strokeWidth="1" />
            </g>
            <g transform="translate(75, 195)">
              <path d="M12 4C12 4 8 0 5 0C2 0 0 2 0 5C0 8 3 11 12 18C21 11 24 8 24 5C24 2 22 0 19 0C16 0 12 4 12 4Z"
                fill="#25D366" />
            </g>
            <g transform="translate(180, 200)">
              <rect x="4" y="12" width="20" height="16" rx="3" fill="#25D366" />
              <path d="M8 12V8C8 4.5 10.5 2 14 2C17.5 2 20 4.5 20 8V12" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="14" cy="20" r="2.5" fill="white" />
            </g>
          </svg>
        </div>

        <h1 className="text-[26px] text-[#1e2e36] font-light text-center mb-4 tracking-tight">
          {T.welcome.title}
        </h1>

        <p className="text-[14.5px] text-[#667781] text-center leading-[22px] max-w-[320px]">
          {T.welcome.privacyText}{' '}
          <span className="text-[#008069] cursor-pointer hover:underline">{T.welcome.privacyPolicy}</span>
          {' '}{T.welcome.privacyMiddle}{' '}
          <span className="text-[#008069] cursor-pointer hover:underline">{T.welcome.termsOfService}</span>
          {' '}{T.welcome.privacyEnd}
        </p>
      </div>

      <div className="pb-8 px-6 flex flex-col items-center gap-5">
        <div className="relative" ref={langMenuRef}>
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition text-[14px] text-[#54656f]"
          >
            <Globe size={16} className="text-[#54656f]" />
            <span>{T.welcome.language}</span>
            <ChevronDown size={14} className="text-[#54656f]" />
          </button>
          
          {showLangMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-md shadow-lg py-2 z-50 min-w-[180px] border border-gray-50 animate-in fade-in duration-150">
              <button 
                className="w-full text-left px-6 py-2.5 text-[15px] text-[#3b4a54] hover:bg-[#f5f6f6] transition"
                onClick={() => {
                  localStorage.setItem('wa_lang', 'id');
                  window.location.reload();
                }}
              >
                Bahasa Indonesia
              </button>
              <button 
                className="w-full text-left px-6 py-2.5 text-[15px] text-[#3b4a54] hover:bg-[#f5f6f6] transition"
                onClick={() => {
                  localStorage.setItem('wa_lang', 'en');
                  window.location.reload();
                }}
              >
                English
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onNext}
          className="w-full max-w-[360px] bg-[#00a884] text-white py-3 rounded-full text-[16px] font-medium hover:bg-[#008f72] active:bg-[#017561] transition-all shadow-sm"
        >
          {T.welcome.agreeButton}
        </button>
      </div>
    </div>
  );
};

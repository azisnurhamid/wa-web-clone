import React from 'react';
import { ArrowLeft, Bell, Lock, Sun, Image, HelpCircle, List, LogOut } from 'lucide-react';
import { TEXTS } from '@/config/config';
import DefaultAvatar from '@/components/ui/DefaultAvatar';
import { useAppContext } from '@/context/AppContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick?: () => void;
  userAvatar: string;
  userName: string;
  isPrivacyMode: boolean;
  isInteractionLocked: boolean;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  onProfileClick,
  userName,
  isPrivacyMode,
  isInteractionLocked,
}) => {
  const { clearCache } = useAppContext();

  const settingsItems = [
    { icon: Bell, label: TEXTS.settings.notifications, sub: TEXTS.settings.notificationsSub, isDanger: false, onClick: undefined },
    { icon: Lock, label: TEXTS.settings.privacy, sub: TEXTS.settings.privacySub, isDanger: false, onClick: undefined },
    { icon: Sun, label: TEXTS.settings.theme, sub: TEXTS.settings.themeSub, isDanger: false, onClick: undefined },
    { icon: Image, label: TEXTS.settings.wallpaper, sub: TEXTS.settings.wallpaperSub, isDanger: false, onClick: undefined },
    { icon: List, label: TEXTS.settings.requestAccount, sub: '', isDanger: false, onClick: undefined },
    { icon: HelpCircle, label: TEXTS.settings.help, sub: TEXTS.settings.helpSub, isDanger: false, onClick: undefined },
    { icon: LogOut, label: TEXTS.sidebar.logout, sub: '', isDanger: true, onClick: clearCache },
  ];

  const blurClass = isPrivacyMode
    ? `blur-[5px] ${!isInteractionLocked ? 'group-hover:blur-0' : ''}`
    : '';

  const imgBlurClass = isPrivacyMode
    ? `blur-[5px] grayscale-[50%] ${!isInteractionLocked ? 'group-hover:blur-0 group-hover:grayscale-0' : ''}`
    : '';

  return (
    <div
      className={`absolute inset-0 bg-[#f0f2f5] z-30 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ top: '64px' }}
    >
      <div className="h-[72px] bg-[#008069] flex items-end px-6 pb-4 shrink-0">
        <div className="flex items-center gap-4 text-white">
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-[19px] font-medium">{TEXTS.settings.title}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div
          className="flex items-center gap-4 px-4 py-4 bg-white shadow-sm mb-3 cursor-pointer hover:bg-[#f5f6f6] transition group"
          onClick={onProfileClick}
        >
          <div className={`transition-all duration-300 ${imgBlurClass}`}>
            <DefaultAvatar size={80} />
          </div>
          <div className="flex-1">
            <h3
              className={`text-[17px] text-[#111b21] mb-1 transition-all duration-300 ${blurClass}`}
            >
              {userName}
            </h3>
            <p className={`text-[14px] text-[#667781] transition-all duration-300 ${blurClass}`}>
              {TEXTS.profile.aboutPlaceholder}
            </p>
          </div>
        </div>

        <div className="bg-white shadow-sm">
          {settingsItems.map((item, index) => (
            <div
              key={index}
              onClick={item.onClick}
              className="flex items-center gap-4 px-6 py-5 cursor-pointer hover:bg-[#f5f6f6] border-b border-gray-100 last:border-none transition"
            >
              <div className={item.isDanger ? 'text-[#ea4335]' : 'text-[#8696a0]'}>
                <item.icon size={22} />
              </div>
              <div>
                <div className={`text-[17px] ${item.isDanger ? 'text-[#ea4335] font-medium' : 'text-[#111b21]'}`}>
                  {item.label}
                </div>
                {item.sub && <div className="text-[14px] text-[#667781]">{item.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsDrawer;

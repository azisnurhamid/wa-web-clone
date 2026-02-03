
import React from 'react';
import { ArrowLeft, Bell, Lock, Sun, Image, HelpCircle, List, User } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userAvatar: string;
  userName: string;
  isPrivacyMode: boolean; // New prop
  isInteractionLocked: boolean; // New prop
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, userAvatar, userName, isPrivacyMode, isInteractionLocked }) => {
  const settingsItems = [
    { icon: Bell, label: 'Notifikasi', sub: 'Nada pesan, grup & panggilan' },
    { icon: Lock, label: 'Privasi', sub: 'Blokir kontak, pesan sementara' },
    { icon: Sun, label: 'Tema', sub: 'Default sistem' },
    { icon: Image, label: 'Wallpaper Chat', sub: 'Doodle' },
    { icon: List, label: 'Minta Info Akun', sub: '' },
    { icon: HelpCircle, label: 'Bantuan', sub: 'Pusat bantuan, hubungi kami, kebijakan privasi' },
  ];
  
  // Helper for blur logic
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
    >
      {/* Header */}
      <div className="h-[108px] bg-[#008069] flex items-end px-6 pb-4 shrink-0">
        <div className="flex items-center gap-4 text-white">
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-[19px] font-medium">Setelan</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* User Mini Profile */}
        <div className="flex items-center gap-4 px-4 py-4 bg-white shadow-sm mb-3 cursor-pointer hover:bg-[#f5f6f6] transition group">
            <img 
              src={userAvatar} 
              alt="Profile" 
              className={`w-20 h-20 rounded-full object-cover transition-all duration-300 ${imgBlurClass}`} 
            />
            <div className="flex-1">
                <h3 className={`text-[17px] text-[#111b21] mb-1 transition-all duration-300 ${blurClass}`}>{userName}</h3>
                <p className={`text-[14px] text-[#667781] transition-all duration-300 ${blurClass}`}>Ada</p>
            </div>
        </div>

        {/* List Items */}
        <div className="bg-white shadow-sm">
            {settingsItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 px-6 py-5 cursor-pointer hover:bg-[#f5f6f6] border-b border-gray-100 last:border-none transition">
                    <div className="text-[#8696a0]">
                        <item.icon size={22} />
                    </div>
                    <div>
                        <div className="text-[17px] text-[#111b21]">{item.label}</div>
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

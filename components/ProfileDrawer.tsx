
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Edit2, Camera, Check, Smile } from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isPrivacyMode: boolean; // New prop
  isInteractionLocked: boolean; // New prop
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, isPrivacyMode, isInteractionLocked }) => {
  const [name, setName] = useState("Nama Saya");
  const [about, setAbout] = useState("Ada");
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);
  
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempAbout, setTempAbout] = useState(about);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingAbout && aboutInputRef.current) {
      aboutInputRef.current.focus();
    }
  }, [isEditingAbout]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setName(tempName);
    }
    setIsEditingName(false);
  };

  const handleSaveAbout = () => {
    if (tempAbout.trim()) {
      setAbout(tempAbout);
    }
    setIsEditingAbout(false);
  };

  const handleKeyDownName = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSaveName();
  };

  const handleKeyDownAbout = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSaveAbout();
  };
  
  // Helper for blur logic
  const blurClass = isPrivacyMode 
    ? `blur-[5px] ${!isInteractionLocked ? 'group-hover:blur-0' : ''}` 
    : '';

  return (
    <div 
      className={`absolute inset-0 bg-[#f0f2f5] z-20 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="h-[108px] bg-[#008069] flex items-end px-6 pb-4">
        <div className="flex items-center gap-4 text-white">
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-[19px] font-medium">Profil</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Profile Picture */}
        <div className="py-7 flex justify-center">
            <div className={`relative group cursor-pointer w-[200px] h-[200px] transition-all duration-300 ${isPrivacyMode ? `blur-[8px] grayscale-[50%] ${!isInteractionLocked ? 'hover:blur-0 hover:grayscale-0' : ''}` : ''}`}>
                <img 
                    src="https://picsum.photos/id/64/400/400" 
                    alt="My Profile" 
                    className="w-full h-full rounded-full object-cover"
                />
                <div className={`absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity ${isPrivacyMode ? 'hidden group-hover:flex' : ''}`}>
                    <Camera size={24} className="mb-2" />
                    <span className="text-xs uppercase text-center w-24">Ganti Foto Profil</span>
                </div>
            </div>
        </div>

        {/* Name Section */}
        <div className="bg-white px-8 py-4 shadow-sm mb-3">
            <div className="text-[#008069] text-[14px] mb-4">Nama Anda</div>
            
            {isEditingName ? (
                <div className="mb-2">
                    <div className="flex items-center justify-between border-b-2 border-[#00a884] py-1">
                        <input 
                            ref={nameInputRef}
                            type="text" 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={handleKeyDownName}
                            className="flex-1 outline-none text-[17px] text-[#3b4a54] bg-transparent"
                            maxLength={25}
                        />
                        <div className="flex items-center gap-3 text-[#8696a0]">
                            <span className="text-xs">{25 - tempName.length}</span>
                            <Smile size={20} className="cursor-pointer hover:text-[#54656f]" />
                            <button onClick={handleSaveName} className="text-[#00a884] hover:bg-gray-100 p-1 rounded">
                                <Check size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => {
                    setTempName(name);
                    setIsEditingName(true);
                }}>
                    {/* Granular Blur: Name Display */}
                    <span className={`text-[#3b4a54] text-[17px] transition-all duration-300 ${blurClass}`}>{name}</span>
                    <Edit2 size={20} className="text-[#8696a0] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}
        </div>
        
        <div className="px-8 py-2 text-[#667781] text-[14px] mb-4">
            Ini bukan username atau PIN Anda. Nama ini akan terlihat oleh kontak WhatsApp Anda.
        </div>

        {/* About Section */}
        <div className="bg-white px-8 py-4 shadow-sm mb-3">
            <div className="text-[#008069] text-[14px] mb-4">Info</div>
            
            {isEditingAbout ? (
                 <div className="mb-2">
                    <div className="flex items-center justify-between border-b-2 border-[#00a884] py-1">
                        <input 
                            ref={aboutInputRef}
                            type="text" 
                            value={tempAbout}
                            onChange={(e) => setTempAbout(e.target.value)}
                            onKeyDown={handleKeyDownAbout}
                            className="flex-1 outline-none text-[17px] text-[#3b4a54] bg-transparent"
                        />
                        <div className="flex items-center gap-3 text-[#8696a0]">
                            <Smile size={20} className="cursor-pointer hover:text-[#54656f]" />
                            <button onClick={handleSaveAbout} className="text-[#00a884] hover:bg-gray-100 p-1 rounded">
                                <Check size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => {
                    setTempAbout(about);
                    setIsEditingAbout(true);
                }}>
                     {/* Granular Blur: About Display */}
                    <span className={`text-[#3b4a54] text-[17px] transition-all duration-300 ${blurClass}`}>{about}</span>
                    <Edit2 size={20} className="text-[#8696a0] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default ProfileDrawer;
